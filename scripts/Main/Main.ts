/// <reference path="../../lib/babylon.d.ts"/>

class Main {

    public static Canvas: HTMLCanvasElement;
    public static Engine: BABYLON.Engine;
    public static Scene: BABYLON.Scene;
	public static Light: BABYLON.Light;
	public static Camera: BABYLON.ArcRotateCamera;
	public static Skybox: BABYLON.Mesh;
	public static ChunckManager: ChunckManager;

    public static _cellShadingMaterial: ToonMaterial;
	public static get cellShadingMaterial(): ToonMaterial {
		if (!Main._cellShadingMaterial) {
			Main._cellShadingMaterial = new ToonMaterial("CellMaterial", BABYLON.Color3.White(), Main.Scene);
		}
		return Main._cellShadingMaterial;
	}

    public static _groundMaterial: BABYLON.StandardMaterial;
	public static get groundMaterial(): BABYLON.StandardMaterial {
		if (!Main._groundMaterial) {
            Main._groundMaterial = new BABYLON.StandardMaterial("StandardMaterial", Main.Scene);
            Main._groundMaterial.diffuseTexture = new BABYLON.Texture("img/ground.jpg", Main.Scene);
			Main._groundMaterial.specularColor.copyFromFloats(0, 0, 0);
		}
		return Main._groundMaterial;
	}

    constructor(canvasElement: string) {
        Main.Canvas = document.getElementById(canvasElement) as HTMLCanvasElement;
        Main.Engine = new BABYLON.Engine(Main.Canvas, true, { preserveDrawingBuffer: true, stencil: true });
	}
	
	public async initialize(): Promise<void> {
		await this.initializeScene();
	}

    public async initializeScene(): Promise<void> {
		Main.Scene = new BABYLON.Scene(Main.Engine);

        Main.Light = new BABYLON.HemisphericLight("AmbientLight", new BABYLON.Vector3(1, 3, 2), Main.Scene);

        Main.Camera = new BABYLON.ArcRotateCamera("camera1", 0, 0, 1, new BABYLON.Vector3(0, 10, 0), Main.Scene);
        Main.Camera.setPosition(new BABYLON.Vector3(- 20, 50, 60));
		Main.Camera.attachControl(Main.Canvas, true);
		Main.Camera.lowerRadiusLimit = 6;
		Main.Camera.upperRadiusLimit = 200;
		Main.Camera.wheelPrecision *= 4;

        BABYLON.Effect.ShadersStore["EdgeFragmentShader"] = `
			#ifdef GL_ES
			precision highp float;
			#endif
			varying vec2 vUV;
			uniform sampler2D textureSampler;
			uniform sampler2D depthSampler;
			uniform float 		width;
			uniform float 		height;
			void make_kernel(inout vec4 n[9], sampler2D tex, vec2 coord)
			{
				float w = 1.0 / width;
				float h = 1.0 / height;
				n[0] = texture2D(tex, coord + vec2( -w, -h));
				n[1] = texture2D(tex, coord + vec2(0.0, -h));
				n[2] = texture2D(tex, coord + vec2(  w, -h));
				n[3] = texture2D(tex, coord + vec2( -w, 0.0));
				n[4] = texture2D(tex, coord);
				n[5] = texture2D(tex, coord + vec2(  w, 0.0));
				n[6] = texture2D(tex, coord + vec2( -w, h));
				n[7] = texture2D(tex, coord + vec2(0.0, h));
				n[8] = texture2D(tex, coord + vec2(  w, h));
			}
			void main(void) 
			{
				vec4 d = texture2D(depthSampler, vUV);
				float depth = d.r * (2000.0 - 0.5) + 0.5;
				vec4 n[9];
				make_kernel( n, textureSampler, vUV );
				vec4 sobel_edge_h = n[2] + (2.0*n[5]) + n[8] - (n[0] + (2.0*n[3]) + n[6]);
				vec4 sobel_edge_v = n[0] + (2.0*n[1]) + n[2] - (n[6] + (2.0*n[7]) + n[8]);
				vec4 sobel = sqrt((sobel_edge_h * sobel_edge_h) + (sobel_edge_v * sobel_edge_v));
				float threshold = 0.4 + max((depth - 10.) / 30., 0.);
				if (max(sobel.r, max(sobel.g, sobel.b)) < threshold) {
					gl_FragColor = n[4];
				} else {
					gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
				}
			}
        `;
		BABYLON.Engine.ShadersRepository = "./shaders/";
        
		let depthMap = Main.Scene.enableDepthRenderer(Main.Camera).getDepthMap();
		
		let postProcess = new BABYLON.PostProcess("Edge", "Edge", ["width", "height"], ["depthSampler"], 1, Main.Camera);
		postProcess.onApply = (effect) => {
			effect.setTexture("depthSampler", depthMap);
			effect.setFloat("width", Main.Engine.getRenderWidth());
			effect.setFloat("height", Main.Engine.getRenderHeight());
		};
		
		
		let noPostProcessCamera = new BABYLON.FreeCamera("no-post-process-camera", BABYLON.Vector3.Zero(), Main.Scene);
		noPostProcessCamera.parent = Main.Camera;
		noPostProcessCamera.layerMask = 0x10000000;
		
		Main.Scene.activeCameras.push(Main.Camera, noPostProcessCamera);

		// Skybox seed : 1vt3h8rxhb28
		Main.Skybox = BABYLON.MeshBuilder.CreateSphere("skyBox", { diameter: 4000.0 }, Main.Scene);
		Main.Skybox.layerMask = 1;
		Main.Skybox.infiniteDistance = true;
		let skyboxMaterial: BABYLON.StandardMaterial = new BABYLON.StandardMaterial("skyBox", Main.Scene);
		skyboxMaterial.backFaceCulling = false;
		skyboxMaterial.emissiveTexture = new BABYLON.Texture(
			"./datas/textures/sky.png",
			Main.Scene
		);
		skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
		skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
		Main.Skybox.material = skyboxMaterial;

		let borderMaterial = new BABYLON.StandardMaterial("border-material", Main.Scene);
		borderMaterial.diffuseColor.copyFromFloats(0.2, 0.2, 0.2);
		borderMaterial.specularColor.copyFromFloats(0.1, 0.1, 0.1);
		let borderXP = BABYLON.MeshBuilder.CreateBox(
			"border-xp",
			{
				width: 2,
				depth: 12 * CHUNCK_SIZE + 2,
				height: 6
			}
		);
		borderXP.position.copyFromFloats(6 * CHUNCK_SIZE + 1, 2, - 1);
		borderXP.material = borderMaterial;
		let borderXM = BABYLON.MeshBuilder.CreateBox(
			"border-xm",
			{
				width: 2,
				depth: 12 * CHUNCK_SIZE + 2,
				height: 6
			}
		);
		borderXM.position.copyFromFloats(- 6 * CHUNCK_SIZE - 1, 2, 1);
		borderXM.material = borderMaterial;
		let borderZP = BABYLON.MeshBuilder.CreateBox(
			"border-zp",
			{
				width: 12 * CHUNCK_SIZE + 2,
				depth: 2,
				height: 6
			}
		);
		borderZP.position.copyFromFloats(1, 2, 6 * CHUNCK_SIZE + 1);
		borderZP.material = borderMaterial;
		let borderZM = BABYLON.MeshBuilder.CreateBox(
			"border-zm",
			{
				width: 12 * CHUNCK_SIZE + 2,
				depth: 2,
				height: 6
			}
		);
		borderZM.position.copyFromFloats(- 1, 2, - 6 * CHUNCK_SIZE - 1);
		borderZM.material = borderMaterial;

		let water = BABYLON.MeshBuilder.CreateGround(
			"water",
			{
				width: 12 * CHUNCK_SIZE,
				height: 12 * CHUNCK_SIZE
			},
			Main.Scene
		);
		water.position.y = 4.5;
		let waterMaterial = new BABYLON.StandardMaterial("water-material", Main.Scene);
		waterMaterial.alpha = 0.3;
		waterMaterial.diffuseColor = BABYLON.Color3.FromHexString("#2097c9");
		waterMaterial.specularColor.copyFromFloats(0.1, 0.1, 0.1);
		water.material = waterMaterial;

		Main.ChunckManager = new ChunckManager();

		new ChunckEditor(Main.ChunckManager);
		
		console.log("Main scene Initialized.");
    }

    public animate(): void {
        Main.Engine.runRenderLoop(() => {
            Main.Scene.render();
        });

        window.addEventListener("resize", () => {
            Main.Engine.resize();
        });
    }
}

window.addEventListener("load", async () => {
	let main: Main;
	let url = window.location.href;
	let allParams = url.split("?")[1];
	if (allParams) {
		let params = allParams.split("&");
		for (let i = 0; i < params.length; i++) {
			let splitParam = params[i].split("=");
			if (splitParam[0] === "main") {
				if (splitParam[1] === "skull_island") {
					main = new SkullIsland("render-canvas");
				}
				else if (splitParam[1] === "collisions_test") {
					main = new CollisionsTest("render-canvas");
				}
			}
		}
	}
	await main.initialize();
	main.animate();
})