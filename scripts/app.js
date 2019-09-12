var CHUNCK_SIZE = 8;
class Vertex {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.links = [];
        this.smoothedPosition = new BABYLON.Vector3(x, y, z);
    }
    connect(v) {
        if (v) {
            if (this.links.indexOf(v) === -1) {
                this.links.push(v);
            }
            if (v.links.indexOf(this) === -1) {
                v.links.push(this);
            }
            this.smoothedPosition.x = this.smoothedPosition.x * 0.9 + v.x * 0.1;
            this.smoothedPosition.y = this.smoothedPosition.y * 0.9 + v.y * 0.1;
            this.smoothedPosition.z = this.smoothedPosition.z * 0.9 + v.z * 0.1;
        }
    }
}
class Cube {
    constructor(i, j, k) {
        this.i = i;
        this.j = j;
        this.k = k;
    }
    addVertex(v) {
        if (v.x === this.i) {
            if (v.y === this.j) {
                if (v.z === this.k) {
                    this.v000 = v;
                }
                else {
                    this.v001 = v;
                }
            }
            else {
                if (v.z === this.k) {
                    this.v010 = v;
                }
                else {
                    this.v011 = v;
                }
            }
        }
        else {
            if (v.y === this.j) {
                if (v.z === this.k) {
                    this.v100 = v;
                }
                else {
                    this.v101 = v;
                }
            }
            else {
                if (v.z === this.k) {
                    this.v110 = v;
                }
                else {
                    this.v111 = v;
                }
            }
        }
    }
    makeLinksMX() {
        if (this.v000) {
            this.v000.connect(this.v001);
            this.v000.connect(this.v010);
        }
        if (this.v011) {
            this.v011.connect(this.v010);
            this.v011.connect(this.v001);
        }
    }
    makeLinksPX() {
        if (this.v100) {
            this.v100.connect(this.v101);
            this.v100.connect(this.v110);
        }
        if (this.v111) {
            this.v111.connect(this.v110);
            this.v111.connect(this.v101);
        }
    }
    makeLinksMY() {
        if (this.v000) {
            this.v000.connect(this.v001);
            this.v000.connect(this.v100);
        }
        if (this.v101) {
            this.v101.connect(this.v001);
            this.v101.connect(this.v100);
        }
    }
    makeLinksPY() {
        if (this.v010) {
            this.v010.connect(this.v011);
            this.v010.connect(this.v110);
        }
        if (this.v111) {
            this.v111.connect(this.v011);
            this.v111.connect(this.v110);
        }
    }
    makeLinksMZ() {
        if (this.v000) {
            this.v000.connect(this.v100);
            this.v000.connect(this.v010);
        }
        if (this.v110) {
            this.v110.connect(this.v010);
            this.v110.connect(this.v100);
        }
    }
    makeLinksPZ() {
        if (this.v001) {
            this.v001.connect(this.v101);
            this.v001.connect(this.v011);
        }
        if (this.v111) {
            this.v111.connect(this.v011);
            this.v111.connect(this.v101);
        }
    }
    makeLinks() {
        if (this.v000) {
            this.v000.connect(this.v001);
            this.v000.connect(this.v010);
            this.v000.connect(this.v100);
        }
        if (this.v001) {
            this.v001.connect(this.v011);
            this.v001.connect(this.v101);
        }
        if (this.v010) {
            this.v010.connect(this.v011);
            this.v010.connect(this.v110);
        }
        if (this.v011) {
            this.v011.connect(this.v111);
        }
        if (this.v100) {
            this.v100.connect(this.v101);
            this.v100.connect(this.v110);
        }
        if (this.v101) {
            this.v101.connect(this.v111);
        }
        if (this.v110) {
            this.v110.connect(this.v111);
        }
    }
    shareFace(c) {
        let diff = 0;
        if (this.i !== c.i) {
            diff++;
        }
        if (this.j !== c.j) {
            diff++;
        }
        if (this.k !== c.k) {
            diff++;
        }
        return diff < 2;
    }
}
class Chunck {
    constructor() {
        this.cubes = [];
    }
    getCube(i, j, k) {
        if (this.cubes[i]) {
            if (this.cubes[i][j]) {
                return this.cubes[i][j][k];
            }
        }
        return undefined;
    }
    fatCube() {
        this.cubes = [];
        for (let i = 0; i < CHUNCK_SIZE; i++) {
            this.cubes[i] = [];
            for (let j = 0; j < CHUNCK_SIZE; j++) {
                this.cubes[i][j] = [];
            }
        }
        for (let i = 3; i < CHUNCK_SIZE - 3; i++) {
            for (let j = 3; j < CHUNCK_SIZE - 3; j++) {
                for (let k = 3; k < CHUNCK_SIZE - 3; k++) {
                    this.cubes[i][j][k] = new Cube(i, j, k);
                }
            }
        }
    }
    randomizeNice() {
        this.cubes = [];
        for (let i = 0; i < CHUNCK_SIZE; i++) {
            this.cubes[i] = [];
            for (let j = 0; j < CHUNCK_SIZE; j++) {
                this.cubes[i][j] = [];
            }
        }
        for (let i = 1; i < CHUNCK_SIZE - 1; i++) {
            for (let j = 1; j < CHUNCK_SIZE - 1; j++) {
                for (let k = 1; k < CHUNCK_SIZE - 1; k++) {
                    if (Math.random() > 0.3) {
                        this.cubes[i][j][k] = new Cube(i, j, k);
                    }
                }
            }
        }
    }
    generateVertices() {
        for (let i = 0; i < CHUNCK_SIZE + 1; i++) {
            for (let j = 0; j < CHUNCK_SIZE + 1; j++) {
                for (let k = 0; k < CHUNCK_SIZE + 1; k++) {
                    let adjacentCubes = [];
                    for (let ii = -1; ii < 1; ii++) {
                        for (let jj = -1; jj < 1; jj++) {
                            for (let kk = -1; kk < 1; kk++) {
                                let cube = this.getCube(i + ii, j + jj, k + kk);
                                if (cube) {
                                    adjacentCubes.push(cube);
                                }
                            }
                        }
                    }
                    if (adjacentCubes.length === 1) {
                        let v = new Vertex(i, j, k);
                        adjacentCubes[0].addVertex(v);
                    }
                    else if (adjacentCubes.length > 1 && adjacentCubes.length < 8) {
                        while (adjacentCubes.length > 0) {
                            let v = new Vertex(i, j, k);
                            let vCubes = [adjacentCubes.pop()];
                            vCubes[0].addVertex(v);
                            let done = false;
                            let lastCubeLength = adjacentCubes.length;
                            while (!done) {
                                for (let c = 0; c < adjacentCubes.length; c++) {
                                    let cube = adjacentCubes[c];
                                    let shareFace = false;
                                    for (let v = 0; v < vCubes.length; v++) {
                                        if (vCubes[v].shareFace(cube)) {
                                            shareFace = true;
                                            break;
                                        }
                                    }
                                    if (shareFace) {
                                        cube.addVertex(v);
                                        adjacentCubes.splice(c, 1);
                                        c--;
                                        vCubes.push(cube);
                                    }
                                }
                                done = lastCubeLength === adjacentCubes.length;
                                lastCubeLength = adjacentCubes.length;
                            }
                        }
                    }
                }
            }
        }
        for (let i = 0; i < CHUNCK_SIZE; i++) {
            for (let j = 0; j < CHUNCK_SIZE; j++) {
                for (let k = 0; k < CHUNCK_SIZE; k++) {
                    let cube = this.getCube(i, j, k);
                    if (cube) {
                        if (!this.getCube(i - 1, j, k)) {
                            cube.makeLinksMX();
                        }
                        if (!this.getCube(i + 1, j, k)) {
                            cube.makeLinksPX();
                        }
                        if (!this.getCube(i, j - 1, k)) {
                            cube.makeLinksMY();
                        }
                        if (!this.getCube(i, j + 1, k)) {
                            cube.makeLinksPY();
                        }
                        if (!this.getCube(i, j, k - 1)) {
                            cube.makeLinksMZ();
                        }
                        if (!this.getCube(i, j, k + 1)) {
                            cube.makeLinksPZ();
                        }
                    }
                }
            }
        }
    }
    generateFaces() {
        let data = new BABYLON.VertexData();
        let positions = [];
        let indices = [];
        for (let i = 0; i < CHUNCK_SIZE; i++) {
            for (let j = 0; j < CHUNCK_SIZE; j++) {
                for (let k = 0; k < CHUNCK_SIZE; k++) {
                    let cube = this.getCube(i, j, k);
                    if (cube) {
                        let debug = BABYLON.MeshBuilder.CreateBox("debug", { size: 0.1 });
                        debug.position.copyFromFloats(i - CHUNCK_SIZE / 2, j - CHUNCK_SIZE / 2, k - CHUNCK_SIZE / 2);
                        let mXCube = this.getCube(i - 1, j, k);
                        if (!mXCube) {
                            let p0 = cube.v001;
                            let p1 = cube.v011;
                            let p2 = cube.v010;
                            let p3 = cube.v000;
                            let l = positions.length / 3;
                            positions.push(p0.smoothedPosition.x, p0.smoothedPosition.y, p0.smoothedPosition.z);
                            positions.push(p1.smoothedPosition.x, p1.smoothedPosition.y, p1.smoothedPosition.z);
                            positions.push(p2.smoothedPosition.x, p2.smoothedPosition.y, p2.smoothedPosition.z);
                            positions.push(p3.smoothedPosition.x, p3.smoothedPosition.y, p3.smoothedPosition.z);
                            indices.push(l, l + 2, l + 1, l, l + 3, l + 2);
                        }
                        let pXCube = this.getCube(i + 1, j, k);
                        if (!pXCube) {
                            let p0 = cube.v100;
                            let p1 = cube.v110;
                            let p2 = cube.v111;
                            let p3 = cube.v101;
                            let l = positions.length / 3;
                            positions.push(p0.smoothedPosition.x, p0.smoothedPosition.y, p0.smoothedPosition.z);
                            positions.push(p1.smoothedPosition.x, p1.smoothedPosition.y, p1.smoothedPosition.z);
                            positions.push(p2.smoothedPosition.x, p2.smoothedPosition.y, p2.smoothedPosition.z);
                            positions.push(p3.smoothedPosition.x, p3.smoothedPosition.y, p3.smoothedPosition.z);
                            indices.push(l, l + 2, l + 1, l, l + 3, l + 2);
                        }
                        let mYCube = this.getCube(i, j - 1, k);
                        if (!mYCube) {
                            let p0 = cube.v001;
                            let p1 = cube.v000;
                            let p2 = cube.v100;
                            let p3 = cube.v101;
                            let l = positions.length / 3;
                            positions.push(p0.smoothedPosition.x, p0.smoothedPosition.y, p0.smoothedPosition.z);
                            positions.push(p1.smoothedPosition.x, p1.smoothedPosition.y, p1.smoothedPosition.z);
                            positions.push(p2.smoothedPosition.x, p2.smoothedPosition.y, p2.smoothedPosition.z);
                            positions.push(p3.smoothedPosition.x, p3.smoothedPosition.y, p3.smoothedPosition.z);
                            indices.push(l, l + 2, l + 1, l, l + 3, l + 2);
                        }
                        let pYCube = this.getCube(i, j + 1, k);
                        if (!pYCube) {
                            let p0 = cube.v111;
                            let p1 = cube.v110;
                            let p2 = cube.v010;
                            let p3 = cube.v011;
                            let l = positions.length / 3;
                            positions.push(p0.smoothedPosition.x, p0.smoothedPosition.y, p0.smoothedPosition.z);
                            positions.push(p1.smoothedPosition.x, p1.smoothedPosition.y, p1.smoothedPosition.z);
                            positions.push(p2.smoothedPosition.x, p2.smoothedPosition.y, p2.smoothedPosition.z);
                            positions.push(p3.smoothedPosition.x, p3.smoothedPosition.y, p3.smoothedPosition.z);
                            indices.push(l, l + 2, l + 1, l, l + 3, l + 2);
                        }
                        let mZCube = this.getCube(i, j, k - 1);
                        if (!mZCube) {
                            let p0 = cube.v000;
                            let p1 = cube.v010;
                            let p2 = cube.v110;
                            let p3 = cube.v100;
                            let l = positions.length / 3;
                            positions.push(p0.smoothedPosition.x, p0.smoothedPosition.y, p0.smoothedPosition.z);
                            positions.push(p1.smoothedPosition.x, p1.smoothedPosition.y, p1.smoothedPosition.z);
                            positions.push(p2.smoothedPosition.x, p2.smoothedPosition.y, p2.smoothedPosition.z);
                            positions.push(p3.smoothedPosition.x, p3.smoothedPosition.y, p3.smoothedPosition.z);
                            indices.push(l, l + 2, l + 1, l, l + 3, l + 2);
                        }
                        let pZCube = this.getCube(i, j, k + 1);
                        if (!pZCube) {
                            let p0 = cube.v101;
                            let p1 = cube.v111;
                            let p2 = cube.v011;
                            let p3 = cube.v001;
                            let l = positions.length / 3;
                            positions.push(p0.smoothedPosition.x, p0.smoothedPosition.y, p0.smoothedPosition.z);
                            positions.push(p1.smoothedPosition.x, p1.smoothedPosition.y, p1.smoothedPosition.z);
                            positions.push(p2.smoothedPosition.x, p2.smoothedPosition.y, p2.smoothedPosition.z);
                            positions.push(p3.smoothedPosition.x, p3.smoothedPosition.y, p3.smoothedPosition.z);
                            indices.push(l, l + 2, l + 1, l, l + 3, l + 2);
                        }
                    }
                }
            }
        }
        data.positions = positions;
        data.indices = indices;
        let mesh = new BABYLON.Mesh("test");
        mesh.position.x = -CHUNCK_SIZE / 2 - 0.5;
        mesh.position.y = -CHUNCK_SIZE / 2 - 0.5;
        mesh.position.z = -CHUNCK_SIZE / 2 - 0.5;
        data.applyToMesh(mesh);
    }
}
/// <reference path="../../lib/babylon.d.ts"/>
class Main {
    static get cellShadingMaterial() {
        if (!Main._cellShadingMaterial) {
            Main._cellShadingMaterial = new BABYLON.CellMaterial("CellMaterial", Main.Scene);
            Main._cellShadingMaterial.computeHighLevel = true;
        }
        return Main._cellShadingMaterial;
    }
    static get groundMaterial() {
        if (!Main._groundMaterial) {
            Main._groundMaterial = new BABYLON.StandardMaterial("StandardMaterial", Main.Scene);
            Main._groundMaterial.diffuseTexture = new BABYLON.Texture("img/ground.jpg", Main.Scene);
            Main._groundMaterial.specularColor.copyFromFloats(0, 0, 0);
        }
        return Main._groundMaterial;
    }
    static get kongoFlagSMaterial() {
        if (!Main._kongoFlagSMaterial) {
            Main._kongoFlagSMaterial = new BABYLON.StandardMaterial("StandardMaterial", Main.Scene);
            Main._kongoFlagSMaterial.diffuseTexture = new BABYLON.Texture("datas/textures/flags/kongo-small.png", Main.Scene);
            Main._kongoFlagSMaterial.emissiveColor.copyFromFloats(0.5, 0.5, 0.5);
            Main._kongoFlagSMaterial.specularColor.copyFromFloats(0, 0, 0);
        }
        return Main._kongoFlagSMaterial;
    }
    static get kongoFlagMMaterial() {
        if (!Main._kongoFlagMMaterial) {
            Main._kongoFlagMMaterial = new BABYLON.StandardMaterial("StandardMaterial", Main.Scene);
            Main._kongoFlagMMaterial.diffuseTexture = new BABYLON.Texture("datas/textures/flags/kongo-medium.png", Main.Scene);
            Main._kongoFlagMMaterial.emissiveColor.copyFromFloats(0.5, 0.5, 0.5);
            Main._kongoFlagMMaterial.specularColor.copyFromFloats(0, 0, 0);
        }
        return Main._kongoFlagMMaterial;
    }
    static get kongoFlagLMaterial() {
        if (!Main._kongoFlagLMaterial) {
            Main._kongoFlagLMaterial = new BABYLON.StandardMaterial("StandardMaterial", Main.Scene);
            Main._kongoFlagLMaterial.diffuseTexture = new BABYLON.Texture("datas/textures/flags/kongo-large.png", Main.Scene);
            Main._kongoFlagLMaterial.emissiveColor.copyFromFloats(0.25, 0.25, 0.25);
            Main._kongoFlagLMaterial.specularColor.copyFromFloats(0, 0, 0);
        }
        return Main._kongoFlagLMaterial;
    }
    constructor(canvasElement) {
        Main.Canvas = document.getElementById(canvasElement);
        Main.Engine = new BABYLON.Engine(Main.Canvas, true, { preserveDrawingBuffer: true, stencil: true });
    }
    async initializeScene() {
        Main.Scene = new BABYLON.Scene(Main.Engine);
        Main.Light = new BABYLON.HemisphericLight("AmbientLight", new BABYLON.Vector3(1, 3, 2), Main.Scene);
        Main.Camera = new BABYLON.ArcRotateCamera("camera1", 0, 0, 1, new BABYLON.Vector3(0, 0, 0), Main.Scene);
        Main.Camera.setPosition(new BABYLON.Vector3(0, 5, -10));
        Main.Camera.attachControl(Main.Canvas, true);
        Main.Camera.lowerRadiusLimit = 6;
        Main.Camera.upperRadiusLimit = 40;
        Main.Camera.radius = (Main.Camera.upperRadiusLimit + Main.Camera.lowerRadiusLimit) * 0.5;
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
        let skyboxMaterial = new BABYLON.StandardMaterial("skyBox", Main.Scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("./datas/skyboxes/sky", Main.Scene, ["-px.png", "-py.png", "-pz.png", "-nx.png", "-ny.png", "-nz.png"]);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        Main.Skybox.material = skyboxMaterial;
        let chunck = new Chunck();
        chunck.randomizeNice();
        chunck.generateVertices();
        chunck.generateFaces();
        console.log("Main scene Initialized.");
    }
    animate() {
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
});
