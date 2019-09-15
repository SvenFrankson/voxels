var CHUNCK_SIZE = 8;
class Face {
    constructor(vertices, cubeType, draw = true) {
        this.vertices = vertices;
        this.cubeType = cubeType;
        this.draw = draw;
    }
}
class Chunck extends BABYLON.Mesh {
    constructor(manager, i, j, k) {
        super("chunck_" + i + "_" + j + "_" + k);
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
    setCube(i, j, k, cubeType) {
        if (!this.cubes[i]) {
            this.cubes[i] = [];
        }
        if (!this.cubes[i][j]) {
            this.cubes[i][j] = [];
        }
        this.cubes[i][j][k] = new Cube(this, i, j, k, cubeType);
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
    generateFull() {
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
                    this.cubes[i][j][k] = new Cube(this, i, j, k);
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
        for (let i = 0; i < CHUNCK_SIZE; i++) {
            for (let k = 0; k < CHUNCK_SIZE; k++) {
                let h = Math.floor(Math.random() * 4) + 2;
                for (let j = 0; j < h; j++) {
                    this.cubes[i][j][k] = new Cube(this, i, j, k);
                }
            }
        }
    }
    generateVertices() {
        this.vertices = [];
        this.faces = [];
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
                    if (adjacentCubes.length > 0) {
                        if (adjacentCubes.length === 1) {
                            let v = new Vertex(i, j, k);
                            v.index = this.vertices.length;
                            this.vertices.push(v);
                            adjacentCubes[0].addVertex(v);
                            v.addCubeType(adjacentCubes[0].cubeType);
                        }
                        else if (adjacentCubes.length > 1 && adjacentCubes.length < 6) {
                            while (adjacentCubes.length > 0) {
                                let v = new Vertex(i, j, k);
                                v.index = this.vertices.length;
                                this.vertices.push(v);
                                let vCubes = [adjacentCubes.pop()];
                                vCubes[0].addVertex(v);
                                v.addCubeType(vCubes[0].cubeType);
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
                                            v.addCubeType(cube.cubeType);
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
                            v.addCubeType(adjacentCubes[0].cubeType);
                            this.vertices.push(v);
                            for (let c = 0; c < adjacentCubes.length; c++) {
                                adjacentCubes[c].addVertex(v);
                                v.addCubeType(adjacentCubes[c].cubeType);
                            }
                        }
                    }
                }
            }
        }
        for (let i = -1; i < CHUNCK_SIZE + 1; i++) {
            for (let j = -1; j < CHUNCK_SIZE + 1; j++) {
                for (let k = -1; k < CHUNCK_SIZE + 1; k++) {
                    let cube = this.getCube(i, j, k);
                    let draw = i >= 0 && j >= 0 && k >= 0 && i < CHUNCK_SIZE && j < CHUNCK_SIZE && k < CHUNCK_SIZE;
                    if (cube) {
                        if (!this.getCube(i - 1, j, k)) {
                            this.faces.push(new Face([cube.v000, cube.v001, cube.v011, cube.v010], cube.cubeType, draw));
                        }
                        if (!this.getCube(i + 1, j, k)) {
                            this.faces.push(new Face([cube.v100, cube.v110, cube.v111, cube.v101], cube.cubeType, draw));
                        }
                        if (!this.getCube(i, j - 1, k)) {
                            this.faces.push(new Face([cube.v000, cube.v100, cube.v101, cube.v001], cube.cubeType, draw));
                        }
                        if (!this.getCube(i, j + 1, k)) {
                            this.faces.push(new Face([cube.v010, cube.v011, cube.v111, cube.v110], cube.cubeType, draw));
                        }
                        if (!this.getCube(i, j, k - 1)) {
                            this.faces.push(new Face([cube.v000, cube.v010, cube.v110, cube.v100], cube.cubeType, draw));
                        }
                        if (!this.getCube(i, j, k + 1)) {
                            this.faces.push(new Face([cube.v001, cube.v101, cube.v111, cube.v011], cube.cubeType, draw));
                        }
                    }
                }
            }
        }
        let subVertices = new Map();
        for (let i = 0; i < this.faces.length; i++) {
            let f = this.faces[i];
            let center = new Vertex(f.vertices[0].position.x * 0.25 + f.vertices[1].position.x * 0.25 + f.vertices[2].position.x * 0.25 + f.vertices[3].position.x * 0.25, f.vertices[0].position.y * 0.25 + f.vertices[1].position.y * 0.25 + f.vertices[2].position.y * 0.25 + f.vertices[3].position.y * 0.25, f.vertices[0].position.z * 0.25 + f.vertices[1].position.z * 0.25 + f.vertices[2].position.z * 0.25 + f.vertices[3].position.z * 0.25);
            center.index = this.vertices.length;
            center.addCubeType(f.cubeType);
            this.vertices.push(center);
            let subs = [];
            for (let n = 0; n < 4; n++) {
                let n1 = (n + 1) % 4;
                let subKey = Math.min(f.vertices[n].index, f.vertices[n1].index) + "" + Math.max(f.vertices[n].index, f.vertices[n1].index);
                let sub = subVertices.get(subKey);
                if (!sub) {
                    sub = new Vertex(f.vertices[n].position.x * 0.5 + f.vertices[n1].position.x * 0.5, f.vertices[n].position.y * 0.5 + f.vertices[n1].position.y * 0.5, f.vertices[n].position.z * 0.5 + f.vertices[n1].position.z * 0.5);
                    sub.index = this.vertices.length;
                    sub.cubeTypes.copyFrom(f.vertices[n].cubeTypes);
                    sub.cubeTypes.lerpInPlace(f.vertices[n1].cubeTypes, 0.5);
                    subVertices.set(subKey, sub);
                    this.vertices.push(sub);
                    sub.connect(f.vertices[n]);
                    sub.connect(f.vertices[n1]);
                }
                sub.connect(center);
                subs.push(sub);
            }
            for (let i = 3; i >= 0; i--) {
                f.vertices.splice(i + 1, 0, subs[i]);
            }
            f.vertices.splice(0, 0, center);
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
        let colors = [];
        for (let i = 0; i < this.vertices.length; i++) {
            let v = this.vertices[i];
            positions.push(v.smoothedPosition.x, v.smoothedPosition.y, v.smoothedPosition.z);
            colors.push(...v.cubeTypes.getColorAsArray(), 1);
        }
        let indices = [];
        for (let i = 0; i < this.faces.length; i++) {
            let f = this.faces[i];
            if (f.draw) {
                let p0 = f.vertices[0];
                let p1 = f.vertices[8];
                let p2 = f.vertices[1];
                let p3 = f.vertices[2];
                let d0 = BABYLON.Vector3.DistanceSquared(p0.position, p2.position);
                let d1 = BABYLON.Vector3.DistanceSquared(p1.position, p3.position);
                if (d0 < d1) {
                    indices.push(p0.index, p2.index, p1.index, p0.index, p3.index, p2.index);
                }
                else {
                    indices.push(p0.index, p3.index, p1.index, p3.index, p2.index, p1.index);
                }
                p0 = f.vertices[0];
                p1 = f.vertices[2];
                p2 = f.vertices[3];
                p3 = f.vertices[4];
                d0 = BABYLON.Vector3.DistanceSquared(p0.position, p2.position);
                d1 = BABYLON.Vector3.DistanceSquared(p1.position, p3.position);
                if (d0 < d1) {
                    indices.push(p0.index, p2.index, p1.index, p0.index, p3.index, p2.index);
                }
                else {
                    indices.push(p0.index, p3.index, p1.index, p3.index, p2.index, p1.index);
                }
                p0 = f.vertices[0];
                p1 = f.vertices[4];
                p2 = f.vertices[5];
                p3 = f.vertices[6];
                d0 = BABYLON.Vector3.DistanceSquared(p0.position, p2.position);
                d1 = BABYLON.Vector3.DistanceSquared(p1.position, p3.position);
                if (d0 < d1) {
                    indices.push(p0.index, p2.index, p1.index, p0.index, p3.index, p2.index);
                }
                else {
                    indices.push(p0.index, p3.index, p1.index, p3.index, p2.index, p1.index);
                }
                p0 = f.vertices[0];
                p1 = f.vertices[6];
                p2 = f.vertices[7];
                p3 = f.vertices[8];
                d0 = BABYLON.Vector3.DistanceSquared(p0.position, p2.position);
                d1 = BABYLON.Vector3.DistanceSquared(p1.position, p3.position);
                if (d0 < d1) {
                    indices.push(p0.index, p2.index, p1.index, p0.index, p3.index, p2.index);
                }
                else {
                    indices.push(p0.index, p3.index, p1.index, p3.index, p2.index, p1.index);
                }
            }
        }
        data.positions = positions;
        data.colors = colors;
        data.indices = indices;
        data.normals = [];
        BABYLON.VertexData.ComputeNormals(data.positions, data.indices, data.normals);
        this.position.x = CHUNCK_SIZE * this.i;
        this.position.y = CHUNCK_SIZE * this.j;
        this.position.z = CHUNCK_SIZE * this.k;
        data.applyToMesh(this);
        this.material = Main.cellShadingMaterial;
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
    generateFromMesh(skullMesh, rockMesh, sandMesh, dirtMesh, d = 2) {
        this.generateAboveZero(d);
        for (let i = -3 * CHUNCK_SIZE; i < 3 * CHUNCK_SIZE; i++) {
            for (let j = -CHUNCK_SIZE; j < 2 * 3 * CHUNCK_SIZE; j++) {
                for (let k = -3 * CHUNCK_SIZE; k < 3 * CHUNCK_SIZE; k++) {
                    let p = new BABYLON.Vector3(i + 0.5, j + 0.5, k + 0.5);
                    let dir = p.subtract(new BABYLON.Vector3(0, 20, 0)).normalize();
                    let r = new BABYLON.Ray(p, dir);
                    if (r.intersectsMesh(skullMesh).hit) {
                        this.setCube(i, j, k, CubeType.Rock);
                    }
                }
            }
        }
        for (let i = -d * CHUNCK_SIZE; i < d * CHUNCK_SIZE; i++) {
            for (let k = -d * CHUNCK_SIZE; k < d * CHUNCK_SIZE; k++) {
                for (let j = 2 * d * CHUNCK_SIZE; j >= -CHUNCK_SIZE; j--) {
                    let cube = this.getCube(i, j, k);
                    if (cube) {
                        let r = Math.random();
                        if (r > 0.05) {
                            this.setCube(i, j + 1, k, CubeType.Dirt);
                        }
                        if (r > 0.9) {
                            this.setCube(i, j + 2, k, CubeType.Dirt);
                        }
                        break;
                    }
                }
            }
        }
        for (let i = -d * CHUNCK_SIZE; i < d * CHUNCK_SIZE; i++) {
            for (let k = -d * CHUNCK_SIZE; k < d * CHUNCK_SIZE; k++) {
                let p = new BABYLON.Vector3(i + 0.5, 100, k + 0.5);
                let dir = new BABYLON.Vector3(0, -1, 0);
                let r = new BABYLON.Ray(p, dir);
                let pickInfo = r.intersectsMesh(dirtMesh);
                if (pickInfo.hit) {
                    let h = pickInfo.pickedPoint.y;
                    for (let j = -1; j <= h; j++) {
                        this.setCube(i, j, k, CubeType.Dirt);
                    }
                }
            }
        }
        for (let i = -d * CHUNCK_SIZE; i < d * CHUNCK_SIZE; i++) {
            for (let k = -d * CHUNCK_SIZE; k < d * CHUNCK_SIZE; k++) {
                let p = new BABYLON.Vector3(i + 0.5, 100, k + 0.5);
                let dir = new BABYLON.Vector3(0, -1, 0);
                let r = new BABYLON.Ray(p, dir);
                let pickInfo = r.intersectsMesh(rockMesh);
                if (pickInfo.hit) {
                    let h = pickInfo.pickedPoint.y;
                    for (let j = -1; j <= h; j++) {
                        this.setCube(i, j, k, CubeType.Rock);
                    }
                }
            }
        }
        for (let i = -d * CHUNCK_SIZE; i < d * CHUNCK_SIZE; i++) {
            for (let k = -d * CHUNCK_SIZE; k < d * CHUNCK_SIZE; k++) {
                let p = new BABYLON.Vector3(i + 0.5, 100, k + 0.5);
                let dir = new BABYLON.Vector3(0, -1, 0);
                let r = new BABYLON.Ray(p, dir);
                let pickInfo = r.intersectsMesh(sandMesh);
                if (pickInfo.hit) {
                    let h = pickInfo.pickedPoint.y;
                    for (let j = -1; j <= h; j++) {
                        this.setCube(i, j, k, CubeType.Sand);
                    }
                }
            }
        }
    }
    generateTerrain(d = 2) {
        this.generateAroundZero(d);
        for (let i = -d * CHUNCK_SIZE; i < d * CHUNCK_SIZE; i++) {
            for (let k = -d * CHUNCK_SIZE; k < d * CHUNCK_SIZE; k++) {
                let r = Math.floor(i * i + k * k);
                let pSand = r / (d * CHUNCK_SIZE * 10);
                pSand = 1 - pSand;
                let hSand = Math.max(-1, Math.floor(Math.random() * pSand * 3));
                for (let j = 0; j <= hSand; j++) {
                    this.setCube(i, j, k, CubeType.Sand);
                }
                let pDirt = r / (d * CHUNCK_SIZE * 7);
                pDirt = 1 - pDirt;
                let hDirt = Math.max(-1, Math.floor(Math.random() * pDirt * 4));
                for (let j = 1; j <= hDirt; j++) {
                    this.setCube(i, j + hSand, k, CubeType.Dirt);
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
    setChunckCube(chunck, i, j, k, cubeType, redraw = false) {
        this.setCube(chunck.i * CHUNCK_SIZE + i, chunck.j * CHUNCK_SIZE + j, chunck.k * CHUNCK_SIZE + k, cubeType, redraw);
    }
    setCube(I, J, K, cubeType, redraw = false) {
        let iChunck = Math.floor(I / CHUNCK_SIZE);
        let jChunck = Math.floor(J / CHUNCK_SIZE);
        let kChunck = Math.floor(K / CHUNCK_SIZE);
        let chunck = this.getChunck(iChunck, jChunck, kChunck);
        if (chunck) {
            let iCube = I - iChunck * CHUNCK_SIZE;
            let jCube = J - jChunck * CHUNCK_SIZE;
            let kCube = K - kChunck * CHUNCK_SIZE;
            chunck.setCube(iCube, jCube, kCube, cubeType);
            if (redraw) {
                let i0 = iCube === 0 ? -1 : 0;
                let i1 = iCube === (CHUNCK_SIZE - 1) ? 1 : 0;
                let j0 = jCube === 0 ? -1 : 0;
                let j1 = jCube === (CHUNCK_SIZE - 1) ? 1 : 0;
                let k0 = kCube === 0 ? -1 : 0;
                let k1 = kCube === (CHUNCK_SIZE - 1) ? 1 : 0;
                for (let i = i0; i <= i1; i++) {
                    for (let j = j0; j <= j1; j++) {
                        for (let k = k0; k <= k1; k++) {
                            let redrawnChunck = this.getChunck(i + iChunck, j + jChunck, k + kChunck);
                            if (redrawnChunck) {
                                redrawnChunck.generateVertices();
                                redrawnChunck.generateFaces();
                            }
                        }
                    }
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
    generateAboveZero(d) {
        for (let i = -d; i <= d; i++) {
            let mapMapChuncks = new Map();
            this.chuncks.set(i, mapMapChuncks);
            for (let j = -1; j <= 2 * d - 1; j++) {
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
var CubeType;
(function (CubeType) {
    CubeType[CubeType["Dirt"] = 0] = "Dirt";
    CubeType[CubeType["Rock"] = 1] = "Rock";
    CubeType[CubeType["Sand"] = 2] = "Sand";
})(CubeType || (CubeType = {}));
class Cube {
    constructor(chunck, i, j, k, cubeType) {
        this.chunck = chunck;
        this.i = i;
        this.j = j;
        this.k = k;
        this.cubeType = cubeType;
        if (this.cubeType === undefined) {
            this.cubeType = Math.floor(Math.random() * 3);
        }
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
class VertexCubeType {
    constructor() {
        this.sourceCount = 0;
        this.values = [0, 0, 0];
    }
    getColor() {
        return new BABYLON.Color3(this.values[0], this.values[1], this.values[2]);
    }
    getColorAsArray() {
        return this.values;
    }
    copyFrom(other) {
        for (let i = 0; i < this.values.length; i++) {
            this.values[i] = other.values[i];
        }
        return this;
    }
    clone() {
        let c = new VertexCubeType();
        c.values = [...this.values];
        return c;
    }
    addCubeType(cubeType) {
        this.sourceCount++;
        this.values[cubeType] = this.values[cubeType] * (1 - 1 / this.sourceCount) + 1 / this.sourceCount;
    }
    addInPlace(other) {
        for (let i = 0; i < this.values.length; i++) {
            this.values[i] += other.values[i];
        }
    }
    scaleInPlace(n) {
        for (let i = 0; i < this.values.length; i++) {
            this.values[i] *= n;
        }
    }
    lerpInPlace(other, distance) {
        for (let i = 0; i < this.values.length; i++) {
            this.values[i] = this.values[i] * (1 - distance) + other.values[i] * distance;
        }
    }
}
class Vertex {
    constructor(i, j, k) {
        this.i = i;
        this.j = j;
        this.k = k;
        this.links = [];
        this.faces = [];
        this.cubeTypes = new VertexCubeType();
        this.smoothedCubeTypes = new VertexCubeType();
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
    addCubeType(ct) {
        this.cubeTypes.addCubeType(ct);
    }
    smooth(factor) {
        this.smoothedCubeTypes.copyFrom(this.cubeTypes);
        this.smoothedPosition.copyFrom(this.position);
        for (let i = 0; i < this.links.length; i++) {
            this.smoothedPosition.addInPlace(this.links[i].position.scale(factor));
            this.smoothedCubeTypes.addInPlace(this.links[i].cubeTypes);
        }
        this.smoothedPosition.scaleInPlace(1 / (this.links.length * factor + 1));
        this.smoothedCubeTypes.scaleInPlace(1 / (this.links.length * factor + 1));
    }
    applySmooth() {
        this.position.copyFrom(this.smoothedPosition);
        this.cubeTypes.copyFrom(this.smoothedCubeTypes);
    }
}
/// <reference path="../../lib/babylon.d.ts"/>
class Main {
    static get cellShadingMaterial() {
        if (!Main._cellShadingMaterial) {
            Main._cellShadingMaterial = new ToonMaterial("CellMaterial", BABYLON.Color3.White(), Main.Scene);
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
        Main.Camera.upperRadiusLimit = 100;
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
        let skyboxMaterial = new BABYLON.StandardMaterial("skyBox", Main.Scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("./datas/skyboxes/sky", Main.Scene, ["-px.png", "-py.png", "-pz.png", "-nx.png", "-ny.png", "-nz.png"]);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        Main.Skybox.material = skyboxMaterial;
        BABYLON.MeshBuilder.CreateGround("ground", {
            width: 6 * CHUNCK_SIZE,
            height: 6 * CHUNCK_SIZE
        }, Main.Scene);
        BABYLON.SceneLoader.ImportMesh("", "./datas/meshes/", "craneo.v2.packed.babylon", Main.Scene, (meshes, particleSystems, skeletons) => {
            let skullMesh = meshes.find(m => { return m.name === "Crane"; });
            let sandMesh = meshes.find(m => { return m.name === "Sand"; });
            let rockMesh = meshes.find(m => { return m.name === "Rock"; });
            let dirtMesh = meshes.find(m => { return m.name === "Dirt"; });
            let t0 = performance.now();
            let chunckManager = new ChunckManager();
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
            let t1 = performance.now();
            console.log(t1 - t0);
            skullMesh.dispose();
            sandMesh.dispose();
            rockMesh.dispose();
            dirtMesh.dispose();
        });
        /*
        let t0 = performance.now();
        let chunckManager = new ChunckManager();
        let l = 3;
        chunckManager.generateTerrain(l);
        for (let i = -l; i <= l; i++) {
            for (let j = -l; j <= l; j++) {
                for (let k = -l; k <= l; k++) {
                    let chunck = chunckManager.getChunck(i, j, k);
                    chunck.generateVertices();
                    chunck.generateFaces();
                }
            }
        }
        let t1 = performance.now();
        console.log(t1 - t0);

        Main.Scene.onPointerObservable.add(
            (eventData: BABYLON.PointerInfo, eventState: BABYLON.EventState) => {
                if (eventData.type === BABYLON.PointerEventTypes.POINTERUP) {
                    let pickedMesh = eventData.pickInfo.pickedMesh;
                    if (pickedMesh instanceof Chunck) {
                        let chunck = pickedMesh as Chunck;
                        let localPickedPoint = eventData.pickInfo.pickedPoint.subtract(chunck.position);
                        let n = eventData.pickInfo.getNormal();
                        localPickedPoint.subtractInPlace(n.scale(0.5));
                        let coordinates = new BABYLON.Vector3(
                            Math.floor(localPickedPoint.x),
                            Math.floor(localPickedPoint.y),
                            Math.floor(localPickedPoint.z)
                        );
                        let absN = new BABYLON.Vector3(
                            Math.abs(n.x),
                            Math.abs(n.y),
                            Math.abs(n.z)
                        );
                        if (absN.x > absN.y && absN.x > absN.z) {
                            if (n.x > 0) {
                                coordinates.x++;
                            }
                            else {
                                coordinates.x--;
                            }
                        }
                        if (absN.y > absN.x && absN.y > absN.z) {
                            if (n.y > 0) {
                                coordinates.y++;
                            }
                            else {
                                coordinates.y--;
                            }
                        }
                        if (absN.z > absN.x && absN.z > absN.y) {
                            if (n.z > 0) {
                                coordinates.z++;
                            }
                            else {
                                coordinates.z--;
                            }
                        }

                        chunckManager.setChunckCube(chunck, coordinates.x, coordinates.y, coordinates.z, CubeType.Rock, true);
                    }
                }
            }
        )
        */
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
class SeaMaterial extends BABYLON.ShaderMaterial {
    constructor(name, scene) {
        super(name, scene, {
            vertex: "sea",
            fragment: "sea",
        }, {
            attributes: ["position", "normal", "uv"],
            uniforms: ["world", "worldView", "worldViewProjection", "view", "projection"],
            needAlphaBlending: true
        });
        this.t = 0;
        this.dir0 = BABYLON.Vector2.Zero();
        this.dir1 = BABYLON.Vector2.Zero();
        this.dir2 = BABYLON.Vector2.Zero();
        this.dir3 = BABYLON.Vector2.Zero();
        this.dir4 = BABYLON.Vector2.Zero();
        this.dir5 = BABYLON.Vector2.Zero();
        this.dir6 = BABYLON.Vector2.Zero();
        this._updateTime = () => {
            this.setFloat("time", this.t++ / 60);
        };
        this.dir0 = new BABYLON.Vector2(Math.random(), Math.random()).normalize();
        this.dir1 = new BABYLON.Vector2(Math.random(), Math.random()).normalize();
        this.dir2 = new BABYLON.Vector2(Math.random(), Math.random()).normalize();
        this.dir3 = new BABYLON.Vector2(Math.random(), Math.random()).normalize();
        this.dir4 = new BABYLON.Vector2(Math.random(), Math.random()).normalize();
        this.dir5 = new BABYLON.Vector2(Math.random(), Math.random()).normalize();
        this.dir6 = new BABYLON.Vector2(Math.random(), Math.random()).normalize();
        this.setVector2("dir0", this.dir0);
        this.setVector2("dir1", this.dir1);
        this.setVector2("dir2", this.dir2);
        this.setVector2("dir3", this.dir3);
        this.setVector2("dir4", this.dir4);
        this.setVector2("dir5", this.dir5);
        this.setVector2("dir6", this.dir6);
        this.setFloat("a0", 1 / 7);
        this.setFloat("a1", 1 / 7);
        this.setFloat("a2", 1 / 7);
        this.setFloat("a3", 1 / 7);
        this.setFloat("a4", 1 / 7);
        this.setFloat("a5", 1 / 7);
        this.setFloat("a6", 1 / 7);
        scene.registerBeforeRender(this._updateTime);
    }
}
class ToonMaterial extends BABYLON.ShaderMaterial {
    constructor(name, color, scene) {
        super(name, scene, {
            vertex: "toon",
            fragment: "toon",
        }, {
            attributes: ["position", "normal", "uv", "color"],
            uniforms: ["world", "worldView", "worldViewProjection", "view", "projection"]
        });
        this.setVector3("lightInvDirW", (new BABYLON.Vector3(1, 3, 2)).normalize());
        this.setColor3("colGrass", BABYLON.Color3.FromHexString("#47a632"));
        this.setColor3("colDirt", BABYLON.Color3.FromHexString("#a86f32"));
        this.setColor3("colRock", BABYLON.Color3.FromHexString("#8c8c89"));
        this.setColor3("colSand", BABYLON.Color3.FromHexString("#dbc67b"));
    }
}
class RayIntersection {
    constructor(point, normal) {
        this.point = point;
        this.normal = normal;
    }
}
class Intersections3D {
    static RayChunck(ray, chunck) {
        let pickingInfo = chunck.getScene().pickWithRay(ray, (m) => {
            return m === chunck;
        });
        return new RayIntersection(pickingInfo.pickedPoint, pickingInfo.getNormal());
    }
}
