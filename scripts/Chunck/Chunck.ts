var CHUNCK_SIZE = 8;

class Vertex {

    public index: number;
    public links: Vertex[] = [];
    public faces: Face[] = [];
    public position: BABYLON.Vector3;
    public smoothedPosition: BABYLON.Vector3;

    constructor(
        public i: number,
        public j: number,
        public k: number
    ) {
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

    constructor(
        public vertices: Vertex[],
        public draw: boolean = true
    ) {

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
        public chunck: Chunck,
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
                    if (this.v111) {
                        debugger;
                    }
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


    public faces: Face[] = [];
    public vertices: Vertex[] = [];
    public cubes: Cube[][][] = [];

    public getCube(i: number, j: number, k: number): Cube {
        return this.manager.getCube(this.i * CHUNCK_SIZE + i, this.j * CHUNCK_SIZE + j, this.k * CHUNCK_SIZE + k);
    }

    constructor(
        public manager: ChunckManager,
        public i: number,
        public j: number,
        public k: number
    ) {
        
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
                    this.cubes[i][j][k] = new Cube(this, i, j, k);
                }
            }
        }
    }

    public generateRandom(): void {
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

    public generateFull(): void {
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

    public randomizeNiceDouble(): void {
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

    public generateTerrain(): void {
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

    public generateVertices(): void {
        for (let i = - 2; i < CHUNCK_SIZE + 3; i++) {
            for (let j = - 2; j < CHUNCK_SIZE + 3; j++) {
                for (let k = - 2; k < CHUNCK_SIZE + 3; k++) {
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

        for (let i = - 1; i < CHUNCK_SIZE + 2; i++) {
            for (let j = - 1; j < CHUNCK_SIZE + 2; j++) {
                for (let k = - 1; k < CHUNCK_SIZE + 2; k++) {
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

        for (let i = - 1; i < CHUNCK_SIZE + 1; i++) {
            for (let j = - 1; j < CHUNCK_SIZE + 1; j++) {
                for (let k = - 1; k < CHUNCK_SIZE + 1; k++) {
                    let cube = this.getCube(i, j, k);
                    let draw = i >= 0 && j >= 0 && k >= 0 && i < CHUNCK_SIZE && j < CHUNCK_SIZE && k < CHUNCK_SIZE;
                    if (cube) {
                        if (!this.getCube(i - 1, j, k)) {
                            this.faces.push(new Face([cube.v000, cube.v001, cube.v011, cube.v010], draw));
                        }
                        if (!this.getCube(i + 1, j, k)) {
                            this.faces.push(new Face([cube.v100, cube.v110, cube.v111, cube.v101], draw));
                        }
                        if (!this.getCube(i, j - 1, k)) {
                            this.faces.push(new Face([cube.v000, cube.v100, cube.v101, cube.v001], draw));
                        }
                        if (!this.getCube(i, j + 1, k)) {
                            this.faces.push(new Face([cube.v010, cube.v011, cube.v111, cube.v110], draw));
                        }
                        if (!this.getCube(i, j, k - 1)) {
                            this.faces.push(new Face([cube.v000, cube.v010, cube.v110, cube.v100], draw));
                        }
                        if (!this.getCube(i, j, k + 1)) {
                            this.faces.push(new Face([cube.v001, cube.v101, cube.v111, cube.v011], draw));
                        }
                    }
                }
            }
        }

        let subVertices = new Map<string, Vertex>();
        for (let i = 0; i < this.faces.length; i++) {
            let f = this.faces[i];
            let center = new Vertex(
                f.vertices[0].position.x * 0.25 + f.vertices[1].position.x * 0.25 + f.vertices[2].position.x * 0.25 + f.vertices[3].position.x * 0.25,
                f.vertices[0].position.y * 0.25 + f.vertices[1].position.y * 0.25 + f.vertices[2].position.y * 0.25 + f.vertices[3].position.y * 0.25,
                f.vertices[0].position.z * 0.25 + f.vertices[1].position.z * 0.25 + f.vertices[2].position.z * 0.25 + f.vertices[3].position.z * 0.25,
            );
            center.index = this.vertices.length;
            this.vertices.push(center);
            let subs = [];
            for (let n = 0; n < 4; n++) {
                let n1 = (n + 1) % 4;
                let subKey = Math.min(f.vertices[n].index, f.vertices[n1].index) + "" + Math.max(f.vertices[n].index, f.vertices[n1].index);
                let sub = subVertices.get(subKey);
                if (!sub) {
                    sub = new Vertex(
                        f.vertices[n].position.x * 0.5 + f.vertices[n1].position.x * 0.5,
                        f.vertices[n].position.y * 0.5 + f.vertices[n1].position.y * 0.5,
                        f.vertices[n].position.z * 0.5 + f.vertices[n1].position.z * 0.5,
                    );
                    sub.index = this.vertices.length;
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

    public generateFaces(): void {
        let data = new BABYLON.VertexData();
        let positions: number[] = [];
        for (let i = 0; i < this.vertices.length; i++) {
            let v = this.vertices[i];
            positions.push(v.smoothedPosition.x, v.smoothedPosition.y, v.smoothedPosition.z);
        }
        let indices: number[] = [];

        for (let i = 0; i < this.faces.length; i++) {
            let f = this.faces[i];
            if (f.draw) {
                let p0 = f.vertices[0];
                let p1 = f.vertices[8];
                let p2 = f.vertices[1];
                let p3 = f.vertices[2];
    
                indices.push(p0.index, p2.index, p1.index, p0.index, p3.index, p2.index);
    
                p0 = f.vertices[0];
                p1 = f.vertices[2];
                p2 = f.vertices[3];
                p3 = f.vertices[4];
    
                indices.push(p0.index, p2.index, p1.index, p0.index, p3.index, p2.index);
    
                p0 = f.vertices[0];
                p1 = f.vertices[4];
                p2 = f.vertices[5];
                p3 = f.vertices[6];
    
                indices.push(p0.index, p2.index, p1.index, p0.index, p3.index, p2.index);
    
                p0 = f.vertices[0];
                p1 = f.vertices[6];
                p2 = f.vertices[7];
                p3 = f.vertices[8];
    
                indices.push(p0.index, p2.index, p1.index, p0.index, p3.index, p2.index);
            }
        }

        data.positions = positions;
        data.indices = indices;
        data.normals = [];
        BABYLON.VertexData.ComputeNormals(data.positions, data.indices, data.normals);

        let mesh = new BABYLON.Mesh("test");
        mesh.position.x = - CHUNCK_SIZE / 2 - 0.5 + CHUNCK_SIZE * this.i;
        mesh.position.y = - CHUNCK_SIZE / 2 - 0.5 + CHUNCK_SIZE * this.j;
        mesh.position.z = - CHUNCK_SIZE / 2 - 0.5 + CHUNCK_SIZE * this.k;
        data.applyToMesh(mesh);

        mesh.material = Main.cellShadingMaterial;
    }
}
