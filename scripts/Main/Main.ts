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
	public static InputManager: InputManager;

    public static _cellShadingMaterial: ToonMaterial;
	public static get cellShadingMaterial(): ToonMaterial {
		if (!Main._cellShadingMaterial) {
			Main._cellShadingMaterial = new ToonMaterial("CellMaterial", false, Main.Scene);
		}
		return Main._cellShadingMaterial;
	}
	
    public static _cellShadingTransparentMaterial: ToonMaterial;
	public static get cellShadingTransparentMaterial(): ToonMaterial {
		if (!Main._cellShadingTransparentMaterial) {
			Main._cellShadingTransparentMaterial = new ToonMaterial("CellMaterial", true, Main.Scene);
		}
		return Main._cellShadingTransparentMaterial;
	}

    public static _terrainCellShadingMaterial: TerrainToonMaterial;
	public static get terrainCellShadingMaterial(): TerrainToonMaterial {
		if (!Main._terrainCellShadingMaterial) {
			Main._terrainCellShadingMaterial = new TerrainToonMaterial("CellMaterial", BABYLON.Color3.White(), Main.Scene);
		}
		return Main._terrainCellShadingMaterial;
	}

    public static _toonRampTexture: BABYLON.Texture;
	public static get toonRampTexture(): BABYLON.Texture {
		if (!Main._toonRampTexture) {
			Main._toonRampTexture = new BABYLON.Texture("./datas/textures/toon-ramp.png", Main.Scene);
		}
		return Main._toonRampTexture;
	}

	private static _debugRedMaterial: BABYLON.StandardMaterial;
	public static get DebugRedMaterial(): BABYLON.StandardMaterial {
		if (!Main._debugRedMaterial) {
			Main._debugRedMaterial = new BABYLON.StandardMaterial("DebugRedMaterial", Main.Scene);
			Main._debugRedMaterial.diffuseColor.copyFromFloats(1, 0.2, 0.2);
			Main._debugRedMaterial.specularColor.copyFromFloats(0.1, 0.1, 0.1);
		}
		return Main._debugRedMaterial;
	}

	private static _debugGreenMaterial: BABYLON.StandardMaterial;
	public static get DebugGreenMaterial(): BABYLON.StandardMaterial {
		if (!Main._debugGreenMaterial) {
			Main._debugGreenMaterial = new BABYLON.StandardMaterial("DebugGreenMaterial", Main.Scene);
			Main._debugGreenMaterial.diffuseColor.copyFromFloats(0.2, 1, 0.2);
			Main._debugGreenMaterial.specularColor.copyFromFloats(0.1, 0.1, 0.1);
		}
		return Main._debugGreenMaterial;
	}

	private static _debugBlueMaterial: BABYLON.StandardMaterial;
	public static get DebugBlueMaterial(): BABYLON.StandardMaterial {
		if (!Main._debugBlueMaterial) {
			Main._debugBlueMaterial = new BABYLON.StandardMaterial("DebugBlueMaterial", Main.Scene);
			Main._debugBlueMaterial.diffuseColor.copyFromFloats(0.2, 0.2, 1);
			Main._debugBlueMaterial.specularColor.copyFromFloats(0.1, 0.1, 0.1);
		}
		return Main._debugBlueMaterial;
	}

	private static _OnUpdateDebugCallbacks: (() => void)[] = [];
	public static AddOnUpdateDebugCallback(callback: () => void): void {
		if (this._OnUpdateDebugCallbacks.indexOf(callback) === -1) {
			this._OnUpdateDebugCallbacks.push(callback);
		}
	}
	public static RemoveOnUpdateDebugCallback(callback: () => void): void {
		let index = this._OnUpdateDebugCallbacks.indexOf(callback);
		if (index != -1) {
			this._OnUpdateDebugCallbacks.splice(index, 1);
		}
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
				float threshold = 0.2;
				
				gl_FragColor = vec4(n[4]) * 0.5;
				gl_FragColor.a = 1.0;
				if (sobel_depth < thresholdDepth || depth > 1000.) {
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
		Main.Skybox = BABYLON.MeshBuilder.CreateSphere("skyBox", { diameter: 3000.0 }, Main.Scene);
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

		Main.ChunckManager = new ChunckManager();
		new VertexDataLoader(Main.Scene);

		Main.MenuManager = new MenuManager();
		Main.MenuManager.initialize();

		Main.InputManager = new InputManager();
		Main.InputManager.initialize();
		
		let pauseMenu = new PauseMenu();
		pauseMenu.initialize();
		
		console.log("Main scene Initialized.");
    }

    public animate(): void {
		let fpsValues = [];
        Main.Engine.runRenderLoop(() => {
			for (let i = 0; i < Main._OnUpdateDebugCallbacks.length; i++) {
				if (Main._OnUpdateDebugCallbacks[i]) {
					Main._OnUpdateDebugCallbacks[i]();
				}
			}
			Main.Scene.render();
			let dt = Main.Engine.getDeltaTime();
			let fps = 1000 / dt;
			if (isFinite(fps)) {
				fpsValues.push(fps);
				while (fpsValues.length > 60) {
					fpsValues.splice(0, 1);
				}
				let fpsCurrent = fpsValues[0];
				let fpsSpike = fpsValues[0];
				for (let i = 1; i < fpsValues.length; i++) {
					fpsCurrent += fpsValues[i];
					fpsSpike = Math.min(fpsSpike, fpsValues[i]);
				}
				fpsCurrent /= fpsValues.length;
				document.getElementById("fps-current").textContent = fpsCurrent.toFixed(0);
				document.getElementById("fps-spike").textContent = fpsSpike.toFixed(0);
			}
        });

        window.addEventListener("resize", () => {
            Main.Engine.resize();
        });
    }
}

function makeAvailableSceneButton(name: string, sceneRef: string): HTMLAnchorElement {
	let skullIsland = document.createElement("a");
	skullIsland.classList.add("available-scene-button");
	skullIsland.href = window.location.href + "?main=" + sceneRef;
	skullIsland.textContent = "#" + name;
	return skullIsland;
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
				else if (splitParam[1] === "miniature") {
					main = new Miniature("render-canvas");
				}
				else if (splitParam[1] === "tile_test") {
					main = new TileTest("render-canvas");
				}
			}
		}
	}
	else {
		let availableScenesContainer = document.createElement("div");
		availableScenesContainer.classList.add("available-scenes-container");
		document.body.appendChild(availableScenesContainer);

		let skullIsland = makeAvailableSceneButton("Skull Island", "skull_island");
		availableScenesContainer.appendChild(skullIsland);
		
		let collisionTest = makeAvailableSceneButton("Collision Test", "collisions_test");
		availableScenesContainer.appendChild(collisionTest);
		
		let playerTest = makeAvailableSceneButton("Player Test", "player_test");
		availableScenesContainer.appendChild(playerTest);
		
		let miniature = makeAvailableSceneButton("Miniature", "miniature");
		availableScenesContainer.appendChild(miniature);
		
		let tileTest = makeAvailableSceneButton("Tile Test", "tile_test");
		availableScenesContainer.appendChild(tileTest);
	}
	if (main) {
		await main.initialize();
		main.animate();
	}
})