var CHUNCK_SIZE = 8;
class Vertex {
    constructor(i, j, k) {
        this.i = i;
        this.j = j;
        this.k = k;
        this.links = [];
        this.position = new BABYLON.Vector3(i, j, k);
        this.smoothedPosition = this.position.clone();
        while (this.i < 0) {
            this.i += CHUNCK_SIZE;
        }
        while (this.j < 0) {
            this.j += CHUNCK_SIZE;
        }
        while (this.k < 0) {
            this.k += CHUNCK_SIZE;
        }
        while (this.i >= CHUNCK_SIZE) {
            this.i -= CHUNCK_SIZE;
        }
        while (this.j >= CHUNCK_SIZE) {
            this.j -= CHUNCK_SIZE;
        }
        while (this.k >= CHUNCK_SIZE) {
            this.k -= CHUNCK_SIZE;
        }
    }
    connect(v) {
        if (v) {
            if (this.links.indexOf(v) === -1) {
                this.links.push(v);
            }
            if (v.links.indexOf(this) === -1) {
                v.links.push(this);
            }
        }
    }
    smooth(factor) {
        this.smoothedPosition.copyFrom(this.position);
        for (let i = 0; i < this.links.length; i++) {
            this.smoothedPosition.addInPlace(this.links[i].position.scale(factor));
        }
        this.smoothedPosition.scaleInPlace(1 / (this.links.length * factor + 1));
    }
    applySmooth() {
        this.position.copyFrom(this.smoothedPosition);
    }
}
class Face {
}
class Cube {
    constructor(chunck, i, j, k) {
        this.chunck = chunck;
        this.i = i;
        this.j = j;
        this.k = k;
    }
    addVertex(v) {
        if (v.i === this.i) {
            if (v.j === this.j) {
                if (v.k === this.k) {
                    this.v000 = v;
                }
                else {
                    this.v001 = v;
                }
            }
            else {
                if (v.k === this.k) {
                    this.v010 = v;
                }
                else {
                    this.v011 = v;
                }
            }
        }
        else {
            if (v.j === this.j) {
                if (v.k === this.k) {
                    this.v100 = v;
                }
                else {
                    this.v101 = v;
                }
            }
            else {
                if (v.k === this.k) {
                    this.v110 = v;
                }
                else {
                    if (this.v111) {
                        debugger;
                    }
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
    constructor(manager, i, j, k) {
        this.manager = manager;
        this.i = i;
        this.j = j;
        this.k = k;
        this.faces = [];
        this.vertices = [];
        this.cubes = [];
    }
    getCube(i, j, k) {
        return this.manager.getCube(this.i * CHUNCK_SIZE + i, this.j * CHUNCK_SIZE + j, this.k * CHUNCK_SIZE + k);
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
                    this.cubes[i][j][k] = new Cube(this, i, j, k);
                }
            }
        }
    }
    generateRandom() {
        this.cubes = [];
        for (let i = 0; i < CHUNCK_SIZE; i++) {
            this.cubes[i] = [];
            for (let j = 0; j < CHUNCK_SIZE; j++) {
                this.cubes[i][j] = [];
            }
        }
        for (let i = 0; i < CHUNCK_SIZE; i++) {
            for (let j = 0; j < CHUNCK_SIZE; j++) {
                for (let k = 0; k < CHUNCK_SIZE; k++) {
                    if (Math.random() > 0.4) {
                        this.cubes[i][j][k] = new Cube(this, i, j, k);
                    }
                }
            }
        }
    }
    randomizeNiceDouble() {
        this.cubes = [];
        for (let i = 0; i < CHUNCK_SIZE; i++) {
            this.cubes[i] = [];
            for (let j = 0; j < CHUNCK_SIZE; j++) {
                this.cubes[i][j] = [];
            }
        }
        for (let i = 1; i < CHUNCK_SIZE / 2 - 1; i++) {
            for (let j = 1; j < CHUNCK_SIZE / 2 - 1; j++) {
                for (let k = 1; k < CHUNCK_SIZE / 2 - 1; k++) {
                    if (Math.random() > 0.3) {
                        this.cubes[2 * i][2 * j][2 * k] = new Cube(this, 2 * i, 2 * j, 2 * k);
                        this.cubes[2 * i + 1][2 * j][2 * k] = new Cube(this, 2 * i + 1, 2 * j, 2 * k);
                        this.cubes[2 * i][2 * j + 1][2 * k] = new Cube(this, 2 * i, 2 * j + 1, 2 * k);
                        this.cubes[2 * i][2 * j][2 * k + 1] = new Cube(this, 2 * i, 2 * j, 2 * k + 1);
                        this.cubes[2 * i + 1][2 * j + 1][2 * k] = new Cube(this, 2 * i + 1, 2 * j + 1, 2 * k);
                        this.cubes[2 * i][2 * j + 1][2 * k + 1] = new Cube(this, 2 * i, 2 * j + 1, 2 * k + 1);
                        this.cubes[2 * i + 1][2 * j][2 * k + 1] = new Cube(this, 2 * i + 1, 2 * j, 2 * k + 1);
                        this.cubes[2 * i + 1][2 * j + 1][2 * k + 1] = new Cube(this, 2 * i + 1, 2 * j + 1, 2 * k + 1);
                    }
                }
            }
        }
    }
    generateTerrain() {
        this.cubes = [];
        for (let i = 0; i < CHUNCK_SIZE; i++) {
            this.cubes[i] = [];
            for (let j = 0; j < CHUNCK_SIZE; j++) {
                this.cubes[i][j] = [];
            }
        }
        for (let i = 1; i < CHUNCK_SIZE - 1; i++) {
            for (let k = 1; k < CHUNCK_SIZE - 1; k++) {
                let h = Math.floor(Math.random() * 4) + 2;
                for (let j = 1; j < h; j++) {
                    this.cubes[i][j][k] = new Cube(this, i, j, k);
                }
            }
        }
    }
    generateVertices() {
        for (let i = -2; i < CHUNCK_SIZE + 3; i++) {
            for (let j = -2; j < CHUNCK_SIZE + 3; j++) {
                for (let k = -2; k < CHUNCK_SIZE + 3; k++) {
                    let cube = this.getCube(i, j, k);
                    if (cube) {
                        delete cube.v000;
                        delete cube.v001;
                        delete cube.v010;
                        delete cube.v011;
                        delete cube.v100;
                        delete cube.v101;
                        delete cube.v110;
                        delete cube.v111;
                    }
                }
            }
        }
        for (let i = -1; i < CHUNCK_SIZE + 2; i++) {
            for (let j = -1; j < CHUNCK_SIZE + 2; j++) {
                for (let k = -1; k < CHUNCK_SIZE + 2; k++) {
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
                        v.index = this.vertices.length;
                        this.vertices.push(v);
                        adjacentCubes[0].addVertex(v);
                    }
                    else if (adjacentCubes.length > 1 && adjacentCubes.length < 6) {
                        while (adjacentCubes.length > 0) {
                            let v = new Vertex(i, j, k);
                            v.index = this.vertices.length;
                            this.vertices.push(v);
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
                    else if (adjacentCubes.length < 8) {
                        let v = new Vertex(i, j, k);
                        v.index = this.vertices.length;
                        this.vertices.push(v);
                        for (let c = 0; c < adjacentCubes.length; c++) {
                            adjacentCubes[c].addVertex(v);
                        }
                    }
                }
            }
        }
        for (let i = -1; i < CHUNCK_SIZE + 1; i++) {
            for (let j = -1; j < CHUNCK_SIZE + 1; j++) {
                for (let k = -1; k < CHUNCK_SIZE + 1; k++) {
                    let cube = this.getCube(i, j, k);
                    if (cube) {
                        if (!this.getCube(i - 1, j, k)) {
                            this.faces.push([cube.v000, cube.v001, cube.v011, cube.v010]);
                        }
                        if (!this.getCube(i + 1, j, k)) {
                            this.faces.push([cube.v100, cube.v110, cube.v111, cube.v101]);
                        }
                        if (!this.getCube(i, j - 1, k)) {
                            this.faces.push([cube.v000, cube.v100, cube.v101, cube.v001]);
                        }
                        if (!this.getCube(i, j + 1, k)) {
                            this.faces.push([cube.v010, cube.v011, cube.v111, cube.v110]);
                        }
                        if (!this.getCube(i, j, k - 1)) {
                            this.faces.push([cube.v000, cube.v010, cube.v110, cube.v100]);
                        }
                        if (!this.getCube(i, j, k + 1)) {
                            this.faces.push([cube.v001, cube.v101, cube.v111, cube.v011]);
                        }
                    }
                }
            }
        }
        let subVertices = new Map();
        for (let i = 0; i < this.faces.length; i++) {
            let f = this.faces[i];
            if (!f[0]) {
                debugger;
            }
            let center = new Vertex(f[0].position.x * 0.25 + f[1].position.x * 0.25 + f[2].position.x * 0.25 + f[3].position.x * 0.25, f[0].position.y * 0.25 + f[1].position.y * 0.25 + f[2].position.y * 0.25 + f[3].position.y * 0.25, f[0].position.z * 0.25 + f[1].position.z * 0.25 + f[2].position.z * 0.25 + f[3].position.z * 0.25);
            center.index = this.vertices.length;
            this.vertices.push(center);
            let subs = [];
            for (let n = 0; n < 4; n++) {
                let n1 = (n + 1) % 4;
                let subKey = Math.min(f[n].index, f[n1].index) + "" + Math.max(f[n].index, f[n1].index);
                let sub = subVertices.get(subKey);
                if (!sub) {
                    sub = new Vertex(f[n].position.x * 0.5 + f[n1].position.x * 0.5, f[n].position.y * 0.5 + f[n1].position.y * 0.5, f[n].position.z * 0.5 + f[n1].position.z * 0.5);
                    sub.index = this.vertices.length;
                    subVertices.set(subKey, sub);
                    this.vertices.push(sub);
                    sub.connect(f[n]);
                    sub.connect(f[n1]);
                }
                sub.connect(center);
                subs.push(sub);
            }
            for (let i = 3; i >= 0; i--) {
                f.splice(i + 1, 0, subs[i]);
            }
            f.splice(0, 0, center);
        }
        for (let i = 0; i < this.vertices.length; i++) {
            this.vertices[i].smooth(1);
        }
        for (let i = 0; i < this.vertices.length; i++) {
            this.vertices[i].applySmooth();
        }
        for (let i = 0; i < this.vertices.length; i++) {
            this.vertices[i].smooth(1);
        }
        for (let i = 0; i < this.vertices.length; i++) {
            this.vertices[i].applySmooth();
        }
        for (let i = 0; i < this.vertices.length; i++) {
            this.vertices[i].smooth(1);
        }
        for (let i = 0; i < this.vertices.length; i++) {
            this.vertices[i].applySmooth();
        }
    }
    generateFaces() {
        let data = new BABYLON.VertexData();
        let positions = [];
        for (let i = 0; i < this.vertices.length; i++) {
            let v = this.vertices[i];
            positions.push(v.smoothedPosition.x, v.smoothedPosition.y, v.smoothedPosition.z);
        }
        let indices = [];
        for (let i = 0; i < this.faces.length; i++) {
            let f = this.faces[i];
            let p0 = f[0];
            let p1 = f[8];
            let p2 = f[1];
            let p3 = f[2];
            indices.push(p0.index, p2.index, p1.index, p0.index, p3.index, p2.index);
            p0 = f[0];
            p1 = f[2];
            p2 = f[3];
            p3 = f[4];
            indices.push(p0.index, p2.index, p1.index, p0.index, p3.index, p2.index);
            p0 = f[0];
            p1 = f[4];
            p2 = f[5];
            p3 = f[6];
            indices.push(p0.index, p2.index, p1.index, p0.index, p3.index, p2.index);
            p0 = f[0];
            p1 = f[6];
            p2 = f[7];
            p3 = f[8];
            indices.push(p0.index, p2.index, p1.index, p0.index, p3.index, p2.index);
        }
        data.positions = positions;
        data.indices = indices;
        data.normals = [];
        BABYLON.VertexData.ComputeNormals(data.positions, data.indices, data.normals);
        let mesh = new BABYLON.Mesh("test");
        mesh.position.x = -CHUNCK_SIZE / 2 - 0.5 + CHUNCK_SIZE * this.i;
        mesh.position.y = -CHUNCK_SIZE / 2 - 0.5 + CHUNCK_SIZE * this.j;
        mesh.position.z = -CHUNCK_SIZE / 2 - 0.5 + CHUNCK_SIZE * this.k;
        data.applyToMesh(mesh);
        //mesh.material = Main.cellShadingMaterial;
    }
}
class ChunckManager {
    constructor() {
        this.chuncks = new Map();
    }
    generateRandom(d = 1) {
        this.generateAroundZero(d);
        for (let i = -d; i <= d; i++) {
            let mapMapChuncks = this.chuncks.get(i);
            for (let j = -d; j <= d; j++) {
                let mapChuncks = mapMapChuncks.get(j);
                for (let k = -d; k <= d; k++) {
                    mapChuncks.get(k).generateRandom();
                }
            }
        }
    }
    getChunck(i, j, k) {
        let mapMapChuncks = this.chuncks.get(i);
        if (mapMapChuncks) {
            let mapChuncks = mapMapChuncks.get(j);
            if (mapChuncks) {
                return mapChuncks.get(k);
            }
        }
    }
    getCube(I, J, K) {
        let iChunck = Math.floor(I / CHUNCK_SIZE);
        let jChunck = Math.floor(J / CHUNCK_SIZE);
        let kChunck = Math.floor(K / CHUNCK_SIZE);
        let chunck = this.getChunck(iChunck, jChunck, kChunck);
        if (chunck) {
            let iCube = I - iChunck * CHUNCK_SIZE;
            let jCube = J - jChunck * CHUNCK_SIZE;
            let kCube = K - kChunck * CHUNCK_SIZE;
            if (chunck.cubes[iCube]) {
                if (chunck.cubes[iCube][jCube]) {
                    return chunck.cubes[iCube][jCube][kCube];
                }
            }
        }
    }
    generateAroundZero(d) {
        for (let i = -d; i <= d; i++) {
            let mapMapChuncks = new Map();
            this.chuncks.set(i, mapMapChuncks);
            for (let j = -d; j <= d; j++) {
                let mapChuncks = new Map();
                mapMapChuncks.set(j, mapChuncks);
                for (let k = -d; k <= d; k++) {
                    let chunck = new Chunck(this, i, j, k);
                    mapChuncks.set(k, chunck);
                }
            }
        }
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
        let t0 = performance.now();
        let chunckManager = new ChunckManager();
        chunckManager.generateRandom(1);
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                for (let k = -1; k <= 1; k++) {
                    let chunck = chunckManager.getChunck(i, j, k);
                    chunck.generateVertices();
                    chunck.generateFaces();
                }
            }
        }
        //let chunck = chunckManager.getChunck(0, 0, 0);
        //chunck.generateVertices();
        //chunck.generateFaces();
        let t1 = performance.now();
        console.log(t1 - t0);
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
