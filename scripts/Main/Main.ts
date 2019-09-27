/// <reference path="../../lib/babylon.d.ts"/>

class Main {

    public static Canvas: HTMLCanvasElement;
    public static Engine: BABYLON.Engine;
    public static Scene: BABYLON.Scene;
	public static Light: BABYLON.Light;
	public static Camera: BABYLON.Camera;
	public static Skybox: BABYLON.Mesh;
	public static ChunckManager: ChunckManager;
	public static ChunckEditor: ChunckEditor;
	public static MenuManager: MenuManager;

    public static _cellShadingMaterial: ToonMaterial;
	public static get cellShadingMaterial(): ToonMaterial {
		if (!Main._cellShadingMaterial) {
			Main._cellShadingMaterial = new ToonMaterial("CellMaterial", BABYLON.Color3.White(), Main.Scene);
		}
		return Main._cellShadingMaterial;
	}

    public static _terrainCellShadingMaterial: TerrainToonMaterial;
	public static get terrainCellShadingMaterial(): TerrainToonMaterial {
		if (!Main._terrainCellShadingMaterial) {
			Main._terrainCellShadingMaterial = new TerrainToonMaterial("CellMaterial", BABYLON.Color3.White(), Main.Scene);
		}
		return Main._terrainCellShadingMaterial;
	}

    constructor(canvasElement: string) {
        Main.Canvas = document.getElementById(canvasElement) as HTMLCanvasElement;
        Main.Engine = new BABYLON.Engine(Main.Canvas, true, { preserveDrawingBuffer: true, stencil: true });
	}

	public initializeCamera(): void {
        let camera = new BABYLON.ArcRotateCamera("camera1", 0, 0, 1, new BABYLON.Vector3(0, 10, 0), Main.Scene);
        camera.setPosition(new BABYLON.Vector3(- 20, 50, 60));
		camera.attachControl(Main.Canvas, true);
		camera.lowerRadiusLimit = 6;
		camera.upperRadiusLimit = 200;
		camera.wheelPrecision *= 4;
		Main.Camera = camera;
	}
	
	public async initialize(): Promise<void> {
		await this.initializeScene();
	}

    public async initializeScene(): Promise<void> {
		Main.Scene = new BABYLON.Scene(Main.Engine);

		this.initializeCamera();
		Main.Camera.minZ = 0.2;
		Main.Camera.maxZ = 2000;

        Main.Light = new BABYLON.HemisphericLight("AmbientLight", new BABYLON.Vector3(1, 3, 2), Main.Scene);

        BABYLON.Effect.ShadersStore["EdgeFragmentShader"] = `
			#ifdef GL_ES
			precision highp float;
			#endif
			varying vec2 vUV;
			uniform sampler2D textureSampler;
			uniform sampler2D depthSampler;
			uniform float 		width;
			uniform float 		height;
			void make_kernel_color(inout vec4 n[9], sampler2D tex, vec2 coord)
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
			void make_kernel_depth(inout float n[9], sampler2D tex, vec2 coord)
			{
				float w = 1.0 / width;
				float h = 1.0 / height;
				n[0] = texture2D(tex, coord + vec2( -w, -h)).r;
				n[1] = texture2D(tex, coord + vec2(0.0, -h)).r;
				n[2] = texture2D(tex, coord + vec2(  w, -h)).r;
				n[3] = texture2D(tex, coord + vec2( -w, 0.0)).r;
				n[4] = texture2D(tex, coord).r;
				n[5] = texture2D(tex, coord + vec2(  w, 0.0)).r;
				n[6] = texture2D(tex, coord + vec2( -w, h)).r;
				n[7] = texture2D(tex, coord + vec2(0.0, h)).r;
				n[8] = texture2D(tex, coord + vec2(  w, h)).r;
			}
			void main(void) 
			{
				vec4 d = texture2D(depthSampler, vUV);
				float depth = d.r * (2000.0 - 0.2) + 0.2;
				
				float nD[9];
				make_kernel_depth( nD, depthSampler, vUV );
				float sobel_depth_edge_h = nD[2] + (2.0*nD[5]) + nD[8] - (nD[0] + (2.0*nD[3]) + nD[6]);
				float sobel_depth_edge_v = nD[0] + (2.0*nD[1]) + nD[2] - (nD[6] + (2.0*nD[7]) + nD[8]);
				float sobel_depth = sqrt((sobel_depth_edge_h * sobel_depth_edge_h) + (sobel_depth_edge_v * sobel_depth_edge_v));
				float thresholdDepth = 0.002;

				vec4 n[9];
				make_kernel_color( n, textureSampler, vUV );
				vec4 sobel_edge_h = n[2] + (2.0*n[5]) + n[8] - (n[0] + (2.0*n[3]) + n[6]);
				vec4 sobel_edge_v = n[0] + (2.0*n[1]) + n[2] - (n[6] + (2.0*n[7]) + n[8]);
				vec4 sobel = sqrt((sobel_edge_h * sobel_edge_h) + (sobel_edge_v * sobel_edge_v));
				float threshold = 0.4 + max((depth - 20.) / 30., 0.);
				
				gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
				if (sobel_depth < thresholdDepth) {
					if (max(sobel.r, max(sobel.g, sobel.b)) < threshold) {
						gl_FragColor = n[4];
					}
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
		/*
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
		*/

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
		new VertexDataLoader(Main.Scene);

		Main.MenuManager = new MenuManager();
		Main.MenuManager.initialize();
		
		let pauseMenu = new PauseMenu();
		pauseMenu.initialize();
		
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
				else if (splitParam[1] === "player_test") {
					main = new PlayerTest("render-canvas");
				}
			}
		}
	}
	await main.initialize();
	main.animate();
})