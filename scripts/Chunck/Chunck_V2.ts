/// <reference path="./Chunck.ts"/>

var CHUNCK_SIZE = 8;

class Chunck_V2 extends Chunck {

    constructor(
        manager: ChunckManager,
        i: number,
        j: number,
        k: number
    ) {
        super(manager, i, j, k);
        this.name = "chunck_v2_" + i + "_" + j + "_" + k;
        this.position.x = CHUNCK_SIZE * this.i * 1.6;
        this.position.y = CHUNCK_SIZE * this.j * 0.96;
        this.position.z = CHUNCK_SIZE * this.k * 1.6;
    }

    public static HasLoged: boolean = false;
    public async generate(): Promise<void> {
        let positions: number[] = [];
        let indices: number[] = [];
        let normals: number[] = [];

        for (let i = 0; i < CHUNCK_SIZE; i++) {
            for (let j = 0; j < CHUNCK_SIZE; j++) {
                for (let k = 0; k < CHUNCK_SIZE; k++) {
                    let c0 = this.getCube(i, j, k) ? "1" : "0";
                    let c1 = this.getCube(i + 1, j, k) ? "1" : "0";
                    let c2 = this.getCube(i + 1, j, k + 1) ? "1" : "0";
                    let c3 = this.getCube(i, j, k + 1) ? "1" : "0";
                    let c4 = this.getCube(i, j + 1, k) ? "1" : "0";
                    let c5 = this.getCube(i + 1, j + 1, k) ? "1" : "0";
                    let c6 = this.getCube(i + 1, j + 1, k + 1) ? "1" : "0";
                    let c7 = this.getCube(i, j + 1, k + 1) ? "1" : "0";
                    let ref = c0 + c1 + c2 + c3 + c4 + c5 + c6 + c7;

                    if (ref === "00000000" || ref === "11111111") {
                        continue;
                    }

                    let data = ChunckVertexData.Get(ref);

                    if (data) {
                        let l = positions.length / 3;
                        for (let n = 0; n < data.positions.length / 3; n++) {
                            positions.push(data.positions[3 * n] + i * 1.6 + 0.8);
                            positions.push(data.positions[3 * n + 1] + j * 0.96 + 0.48);
                            positions.push(data.positions[3 * n + 2] + k * 1.6 + 0.8);
                        }
                        normals.push(...data.normals);
                        for (let n = 0; n < data.indices.length; n++) {
                            indices.push(data.indices[n] + l);
                        }
                    }
                    else if (!Chunck_V2.HasLoged) {
                        console.warn("Missing ChunckPart : " + ref);
                        Chunck_V2.HasLoged = true;
                    }
                }
            }
        }

        let vertexData = new BABYLON.VertexData();
        vertexData.positions = positions;
        vertexData.indices = indices;
        vertexData.normals = normals;

        vertexData.applyToMesh(this);
    }
}
