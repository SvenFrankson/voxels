/// <reference path="./Chunck.ts"/>

var CHUNCK_SIZE = 8;

class Face {

    constructor(
        public vertices: Vertex[],
        public cubeType: CubeType,
        public draw: boolean = true
    ) {

    }
}

class Chunck_V1 extends Chunck {

    constructor(
        manager: ChunckManager,
        i: number,
        j: number,
        k: number
    ) {
        super(manager, i, j, k);
        this.name = "chunck_v1_" + i + "_" + j + "_" + k;
        this.position.x = CHUNCK_SIZE * this.i;
        this.position.y = CHUNCK_SIZE * this.j;
        this.position.z = CHUNCK_SIZE * this.k;
    }

    public async generate(): Promise<void> {
        this.generateVertices();
        this.generateFaces();
    }

    public generateVertices(): void {
        this.vertices = [];
        this.faces = [];
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

        for (let i = - 1; i < CHUNCK_SIZE + 1; i++) {
            for (let j = - 1; j < CHUNCK_SIZE + 1; j++) {
                for (let k = - 1; k < CHUNCK_SIZE + 1; k++) {
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

        let subVertices = new Map<string, Vertex>();
        for (let i = 0; i < this.faces.length; i++) {
            let f = this.faces[i];
            let center = new Vertex(
                f.vertices[0].position.x * 0.25 + f.vertices[1].position.x * 0.25 + f.vertices[2].position.x * 0.25 + f.vertices[3].position.x * 0.25,
                f.vertices[0].position.y * 0.25 + f.vertices[1].position.y * 0.25 + f.vertices[2].position.y * 0.25 + f.vertices[3].position.y * 0.25,
                f.vertices[0].position.z * 0.25 + f.vertices[1].position.z * 0.25 + f.vertices[2].position.z * 0.25 + f.vertices[3].position.z * 0.25,
            );
            center.index = this.vertices.length;
            center.addCubeType(f.cubeType);
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
            this.vertices[i].smooth(1.5);
        }

        for (let i = 0; i < this.vertices.length; i++) {
            this.vertices[i].applySmooth();
        }

        /*
        for (let i = 0; i < this.vertices.length; i++) {
            this.vertices[i].smooth(1);
        }

        for (let i = 0; i < this.vertices.length; i++) {
            this.vertices[i].applySmooth();
        }
        */
    }

    public generateFaces(): void {
        let data = new BABYLON.VertexData();
        let positions: number[] = [];
        let colors: number[] = [];
        for (let i = 0; i < this.vertices.length; i++) {
            let v = this.vertices[i];
            positions.push(v.smoothedPosition.x, v.smoothedPosition.y, v.smoothedPosition.z);
            colors.push(...v.cubeTypes.getColorAsArray(), 1);
        }
        let indices: number[] = [];

        for (let i = 0; i < this.faces.length; i++) {
            let f = this.faces[i];
            let p0 = f.vertices[0];
            let p1 = f.vertices[8];
            let p2 = f.vertices[1];
            let p3 = f.vertices[2];

            let diag0 = p0.position.subtract(p2.position);
            let diag1 = p1.position.subtract(p3.position);
            let nFace = BABYLON.Vector3.Cross(diag0, diag1);
            let d0 = diag0.length();
            let d1 = diag1.length();
            p0.normalSum.addInPlace(nFace);
            p1.normalSum.addInPlace(nFace);
            p2.normalSum.addInPlace(nFace);
            p3.normalSum.addInPlace(nFace);
            if (f.draw) {
                if (d0 < d1) {
                    indices.push(p0.index, p2.index, p1.index, p0.index, p3.index, p2.index);
                }
                else {
                    indices.push(p0.index, p3.index, p1.index, p3.index, p2.index, p1.index);
                }
            }

            p0 = f.vertices[0];
            p1 = f.vertices[2];
            p2 = f.vertices[3];
            p3 = f.vertices[4];

            diag0 = p0.position.subtract(p2.position);
            diag1 = p1.position.subtract(p3.position);
            nFace = BABYLON.Vector3.Cross(diag0, diag1);
            d0 = diag0.length();
            d1 = diag1.length();
            p0.normalSum.addInPlace(nFace);
            p1.normalSum.addInPlace(nFace);
            p2.normalSum.addInPlace(nFace);
            p3.normalSum.addInPlace(nFace);
            if (f.draw) {
                if (d0 < d1) {
                    indices.push(p0.index, p2.index, p1.index, p0.index, p3.index, p2.index);
                }
                else {
                    indices.push(p0.index, p3.index, p1.index, p3.index, p2.index, p1.index);
                }
            }

            p0 = f.vertices[0];
            p1 = f.vertices[4];
            p2 = f.vertices[5];
            p3 = f.vertices[6];

            diag0 = p0.position.subtract(p2.position);
            diag1 = p1.position.subtract(p3.position);
            nFace = BABYLON.Vector3.Cross(diag0, diag1);
            d0 = diag0.length();
            d1 = diag1.length();
            p0.normalSum.addInPlace(nFace);
            p1.normalSum.addInPlace(nFace);
            p2.normalSum.addInPlace(nFace);
            p3.normalSum.addInPlace(nFace);
            if (f.draw) {
                if (d0 < d1) {
                    indices.push(p0.index, p2.index, p1.index, p0.index, p3.index, p2.index);
                }
                else {
                    indices.push(p0.index, p3.index, p1.index, p3.index, p2.index, p1.index);
                }
            }

            p0 = f.vertices[0];
            p1 = f.vertices[6];
            p2 = f.vertices[7];
            p3 = f.vertices[8];

            diag0 = p0.position.subtract(p2.position);
            diag1 = p1.position.subtract(p3.position);
            nFace = BABYLON.Vector3.Cross(diag0, diag1);
            d0 = diag0.length();
            d1 = diag1.length();
            p0.normalSum.addInPlace(nFace);
            p1.normalSum.addInPlace(nFace);
            p2.normalSum.addInPlace(nFace);
            p3.normalSum.addInPlace(nFace);
            if (f.draw) {
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
        let normals = [];
        for (let i = 0; i < this.vertices.length; i++) {
            this.vertices[i].normalSum.normalize();
            normals.push(...this.vertices[i].normalSum.asArray());
        }
        data.normals = normals;

        data.applyToMesh(this);

        this.material = Main.terrainCellShadingMaterial;
    }
}
