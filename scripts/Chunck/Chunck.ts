var CHUNCK_SIZE = 16;

class Vertex {

    public index: number;
    public links: Vertex[] = [];
    public position: BABYLON.Vector3;
    public smoothedPosition: BABYLON.Vector3;

    constructor(
        public i: number,
        public j: number,
        public k: number
    ) {
        this.position = new BABYLON.Vector3(i, j, k);
        this.smoothedPosition = this.position.clone();
    }

    public connect(v: Vertex) {
        if (v) {
            if (this.links.indexOf(v) === -1) {
                this.links.push(v);
            }
            if (v.links.indexOf(this) === -1) {
                v.links.push(this);
            }
        }
    }

    public smooth(factor: number): void {
        this.smoothedPosition.copyFrom(this.position);
        for (let i = 0; i < this.links.length; i++) {
            this.smoothedPosition.addInPlace(this.links[i].position.scale(factor));
        }
        this.smoothedPosition.scaleInPlace(1 / (this.links.length * factor + 1));
    }

    public applySmooth() {
        this.position.copyFrom(this.smoothedPosition);
    }
}

class Face {

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


    public vertices: Vertex[] = [];
    public cubes: Cube[][][] = [];

    public getCube(i: number, j: number, k: number): Cube {
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

        for (let i = 1; i < CHUNCK_SIZE / 2 - 1; i++) {
            for (let j = 1; j < CHUNCK_SIZE / 2 - 1; j++) {
                for (let k = 1; k < CHUNCK_SIZE / 2 - 1; k++) {
                    if (Math.random() > 0.3) {
                        this.cubes[2 * i][2 * j][2 * k] = new Cube(2 * i, 2 * j, 2 * k);
                        this.cubes[2 * i + 1][2 * j][2 * k] = new Cube(2 * i + 1, 2 * j, 2 * k);
                        this.cubes[2 * i][2 * j + 1][2 * k] = new Cube(2 * i, 2 * j + 1, 2 * k);
                        this.cubes[2 * i][2 * j][2 * k + 1] = new Cube(2 * i, 2 * j, 2 * k + 1);
                        this.cubes[2 * i + 1][2 * j + 1][2 * k] = new Cube(2 * i + 1, 2 * j + 1, 2 * k);
                        this.cubes[2 * i][2 * j + 1][2 * k + 1] = new Cube(2 * i, 2 * j + 1, 2 * k + 1);
                        this.cubes[2 * i + 1][2 * j][2 * k + 1] = new Cube(2 * i + 1, 2 * j, 2 * k + 1);
                        this.cubes[2 * i + 1][2 * j + 1][2 * k + 1] = new Cube(2 * i + 1, 2 * j + 1, 2 * k + 1);
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
                    else {
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

    public generateFaces(): void {
        let data = new BABYLON.VertexData();
        let positions: number[] = [];
        for (let i = 0; i < this.vertices.length; i++) {
            let v = this.vertices[i];
            positions.push(v.smoothedPosition.x, v.smoothedPosition.y, v.smoothedPosition.z);
        }
        let indices: number[] = [];

        for (let i = 0; i < CHUNCK_SIZE; i++) {
            for (let j = 0; j < CHUNCK_SIZE; j++) {
                for (let k = 0; k < CHUNCK_SIZE; k++) {
                    let cube = this.getCube(i, j, k);
                    if (cube) {
                        let mXCube = this.getCube(i - 1, j, k);
                        if (!mXCube) {
                            let p0 = cube.v001;
                            let p1 = cube.v011;
                            let p2 = cube.v010;
                            let p3 = cube.v000;

                            indices.push(p0.index, p2.index, p1.index, p0.index, p3.index, p2.index);
                        }
                        let pXCube = this.getCube(i + 1, j, k);
                        if (!pXCube) {
                            let p0 = cube.v100;
                            let p1 = cube.v110;
                            let p2 = cube.v111;
                            let p3 = cube.v101;

                            indices.push(p0.index, p2.index, p1.index, p0.index, p3.index, p2.index);
                        }
                        let mYCube = this.getCube(i, j - 1, k);
                        if (!mYCube) {
                            let p0 = cube.v001;
                            let p1 = cube.v000;
                            let p2 = cube.v100;
                            let p3 = cube.v101;

                            indices.push(p0.index, p2.index, p1.index, p0.index, p3.index, p2.index);
                        }
                        let pYCube = this.getCube(i, j + 1, k);
                        if (!pYCube) {
                            let p0 = cube.v111;
                            let p1 = cube.v110;
                            let p2 = cube.v010;
                            let p3 = cube.v011;

                            indices.push(p0.index, p2.index, p1.index, p0.index, p3.index, p2.index);
                        }
                        let mZCube = this.getCube(i, j, k - 1);
                        if (!mZCube) {
                            let p0 = cube.v000;
                            let p1 = cube.v010;
                            let p2 = cube.v110;
                            let p3 = cube.v100;

                            indices.push(p0.index, p2.index, p1.index, p0.index, p3.index, p2.index);
                        }
                        let pZCube = this.getCube(i, j, k + 1);
                        if (!pZCube) {
                            let p0 = cube.v101;
                            let p1 = cube.v111;
                            let p2 = cube.v011;
                            let p3 = cube.v001;

                            indices.push(p0.index, p2.index, p1.index, p0.index, p3.index, p2.index);
                        }
                    }
                }
            }
        }

        data.positions = positions;
        data.indices = indices;
        data.normals = [];
        BABYLON.VertexData.ComputeNormals(data.positions, data.indices, data.normals);

        let mesh = new BABYLON.Mesh("test");
        mesh.position.x = - CHUNCK_SIZE / 2 - 0.5;
        mesh.position.y = - CHUNCK_SIZE / 2 - 0.5;
        mesh.position.z = - CHUNCK_SIZE / 2 - 0.5;
        data.applyToMesh(mesh);

        mesh.material = Main.cellShadingMaterial;
    }
}
