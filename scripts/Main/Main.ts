/// <reference path="../../lib/babylon.d.ts"/>

class Main {

    public static Canvas: HTMLCanvasElement;
    public static Engine: BABYLON.Engine;
    public static Scene: BABYLON.Scene;
	public static Light: BABYLON.Light;
	public static Camera: BABYLON.ArcRotateCamera;
	public static Skybox: BABYLON.Mesh;

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

    public async initializeScene(): Promise<void> {
		Main.Scene = new BABYLON.Scene(Main.Engine);

        Main.Light = new BABYLON.HemisphericLight("AmbientLight", new BABYLON.Vector3(1, 3, 2), Main.Scene);

        Main.Camera = new BABYLON.ArcRotateCamera("camera1", 0, 0, 1, new BABYLON.Vector3(0, 10, 0), Main.Scene);
        Main.Camera.setPosition(new BABYLON.Vector3(- 20, 50, 60));
		Main.Camera.attachControl(Main.Canvas, true);
		Main.Camera.lowerRadiusLimit = 6;
		Main.Camera.upperRadiusLimit = 200;
		Main.Camera.wheelPrecision *= 8;

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
		Main.Skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 2000.0 }, Main.Scene);
		Main.Skybox.layerMask = 1;
		Main.Skybox.rotation.y = Math.PI / 2;
		Main.Skybox.infiniteDistance = true;
		let skyboxMaterial: BABYLON.StandardMaterial = new BABYLON.StandardMaterial("skyBox", Main.Scene);
		skyboxMaterial.backFaceCulling = false;
		skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(
			"./datas/skyboxes/sky",
			Main.Scene,
			["-px.png", "-py.png", "-pz.png", "-nx.png", "-ny.png", "-nz.png"]);
		skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
		skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
		skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
		Main.Skybox.material = skyboxMaterial;

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

		let chunckManager = new ChunckManager();
		let savedTerrainString = window.localStorage.getItem("terrain");
		if (savedTerrainString) {
			let t0 = performance.now();
			let savedTerrain = JSON.parse(savedTerrainString) as TerrainData;
			chunckManager.deserialize(savedTerrain);
			let l = 6;
			for (let i = -l; i <= l; i++) {
				for (let j = -1; j <= 2 * l - 1; j++) {
					for (let k = -l; k <= l; k++) {
						let chunck = chunckManager.getChunck(i, j, k);
						if (chunck) {
							chunck.generateVertices();
							chunck.generateFaces();
						}
					}
				}
			}
			let t1 = performance.now();
			console.log(t1 - t0);
		}
		else {
			BABYLON.SceneLoader.ImportMesh(
				"",
				"./datas/meshes/",
				"craneo.v2.packed.babylon",
				Main.Scene,
				(meshes, particleSystems, skeletons) => {
					let skullMesh = meshes.find(m => { return m.name === "Crane"; }) as BABYLON.Mesh;
					let sandMesh = meshes.find(m => { return m.name === "Sand"; }) as BABYLON.Mesh;
					let rockMesh = meshes.find(m => { return m.name === "Rock"; }) as BABYLON.Mesh;
					let dirtMesh = meshes.find(m => { return m.name === "Dirt"; }) as BABYLON.Mesh;
					let t0 = performance.now();
					let l = 6;
					chunckManager.generateFromMesh(skullMesh, rockMesh, sandMesh, dirtMesh, l);
					for (let i = -l; i <= l; i++) {
						for (let j = -1; j <= 2 * l - 1; j++) {
							for (let k = -l; k <= l; k++) {
								let chunck = chunckManager.getChunck(i, j, k);
								chunck.generateVertices();
								chunck.generateFaces();
							}
						}
					}
					skullMesh.dispose();
					sandMesh.dispose();
					rockMesh.dispose();
					dirtMesh.dispose();
					let t1 = performance.now();
					console.log(t1 - t0);
				}
			);
		}

		new ChunckEditor(chunckManager);
		
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
	let main = new Main("render-canvas");
	await main.initializeScene();
	main.animate();
})