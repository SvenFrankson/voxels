var CHUNCK_SIZE = 8;

class Vertex {

    public links: Vertex[] = [];
    public smoothedPosition: BABYLON.Vector3;

    constructor(
        public x: number,
        public y: number,
        public z: number
    ) {
        this.smoothedPosition = new BABYLON.Vector3(x, y, z);
    }

    public connect(v: Vertex) {
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

    public v000: Vertex;
    public v001: Vertex;
    public v010: Vertex;
    public v011: Vertex;
    public v100: Vertex;
    public v101: Vertex;
    public v110: Vertex;
    public v111: Vertex;

    constructor(
        public i: number,
        public j: number,
        public k: number
    ) {

    }

    public addVertex(v: Vertex): void {
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

    public makeLinksMX() {
        if (this.v000) {
            this.v000.connect(this.v001);
            this.v000.connect(this.v010);
        }
        if (this.v011) {
            this.v011.connect(this.v010);
            this.v011.connect(this.v001);
        }
    }

    public makeLinksPX() {
        if (this.v100) {
            this.v100.connect(this.v101);
            this.v100.connect(this.v110);
        }
        if (this.v111) {
            this.v111.connect(this.v110);
            this.v111.connect(this.v101);
        }
    }

    public makeLinksMY() {
        if (this.v000) {
            this.v000.connect(this.v001);
            this.v000.connect(this.v100);
        }
        if (this.v101) {
            this.v101.connect(this.v001);
            this.v101.connect(this.v100);
        }
    }

    public makeLinksPY() {
        if (this.v010) {
            this.v010.connect(this.v011);
            this.v010.connect(this.v110);
        }
        if (this.v111) {
            this.v111.connect(this.v011);
            this.v111.connect(this.v110);
        }
    }

    public makeLinksMZ() {
        if (this.v000) {
            this.v000.connect(this.v100);
            this.v000.connect(this.v010);
        }
        if (this.v110) {
            this.v110.connect(this.v010);
            this.v110.connect(this.v100);
        }
    }

    public makeLinksPZ() {
        if (this.v001) {
            this.v001.connect(this.v101);
            this.v001.connect(this.v011);
        }
        if (this.v111) {
            this.v111.connect(this.v011);
            this.v111.connect(this.v101);
        }
    }

    public makeLinks(): void {
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

    public shareFace(c: Cube): boolean {
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


    public cubes: Cube[][][] = [];
    public getCube(i, j, k): Cube {
        if (this.cubes[i]) {
            if (this.cubes[i][j]) {
                return this.cubes[i][j][k];
            }
        }
        return undefined;
    }

    constructor() {
        
    }

    public fatCube(): void {
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

    public randomizeNice(): void {
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

    public generateVertices(): void {
        for (let i = 0; i < CHUNCK_SIZE + 1; i++) {
            for (let j = 0; j < CHUNCK_SIZE + 1; j++) {
                for (let k = 0; k < CHUNCK_SIZE + 1; k++) {
                    let adjacentCubes: Cube[] = [];
                    for (let ii = - 1; ii < 1; ii++) {
                        for (let jj = - 1; jj < 1; jj++) {
                            for (let kk = - 1; kk < 1; kk++) {
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

    public generateFaces(): void {
        let data = new BABYLON.VertexData();
        let positions: number[] = [];
        let indices: number[] = [];

        for (let i = 0; i < CHUNCK_SIZE; i++) {
            for (let j = 0; j < CHUNCK_SIZE; j++) {
                for (let k = 0; k < CHUNCK_SIZE; k++) {
                    let cube = this.getCube(i, j, k);
                    if (cube) {
                        let debug = BABYLON.MeshBuilder.CreateBox("debug", { size: 0.1});
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
        mesh.position.x = - CHUNCK_SIZE / 2 - 0.5;
        mesh.position.y = - CHUNCK_SIZE / 2 - 0.5;
        mesh.position.z = - CHUNCK_SIZE / 2 - 0.5;
        data.applyToMesh(mesh);
    }
}
