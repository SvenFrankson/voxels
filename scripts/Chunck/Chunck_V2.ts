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
        this.material = Main.terrainCellShadingMaterial;
    }

    public static HasLoged: boolean = false;
    public async generate(): Promise<void> {
        let positions: number[] = [];
        let indices: number[] = [];
        let normals: number[] = [];
        let colors: number[] = [];

        for (let i = 0; i < CHUNCK_SIZE; i++) {
            for (let j = 0; j < CHUNCK_SIZE; j++) {
                for (let k = 0; k < CHUNCK_SIZE; k++) {
                    let c0 = this.getCube(i, j, k);
                    let c1 = this.getCube(i + 1, j, k);
                    let c2 = this.getCube(i + 1, j, k + 1);
                    let c3 = this.getCube(i, j, k + 1);
                    let c4 = this.getCube(i, j + 1, k);
                    let c5 = this.getCube(i + 1, j + 1, k);
                    let c6 = this.getCube(i + 1, j + 1, k + 1);
                    let c7 = this.getCube(i, j + 1, k + 1);
                    let ref = (c0 ? "1" : "0") + (c1 ? "1" : "0") + (c2 ? "1" : "0") + (c3 ? "1" : "0") + (c4 ? "1" : "0") + (c5 ? "1" : "0") + (c6 ? "1" : "0") + (c7 ? "1" : "0");

                    if (ref === "00000000" || ref === "11111111") {
                        continue;
                    }

                    // debug
                    if (c0) {
                        let debugData = BABYLON.VertexData.CreateBox({ size: 0.3 });
                        let debugColors = [];
                        for (let n = 0; n < debugData.positions.length / 3; n++) {
                            debugColors.push(...c0.color.asArray());
                        }
                        debugData.colors = debugColors;
                        let debugMesh = new BABYLON.Mesh("debug");
                        debugData.applyToMesh(debugMesh);
                        debugMesh.parent = this;
                        debugMesh.position.x = i * 1.6;
                        debugMesh.position.y = j * 0.96;
                        debugMesh.position.z = k * 1.6;
                        debugMesh.scaling.y = 4;
                        debugMesh.material = Main.cellShadingMaterial;
                        debugMesh.freezeWorldMatrix();
                    }

                    let data = ChunckVertexData.Get(ref);

                    if (data) {
                        let l = positions.length / 3;
                        for (let n = 0; n < data.positions.length / 3; n++) {
                            let x = data.positions[3 * n];
                            let dx = (x + 0.8) / 1.6;
                            let y = data.positions[3 * n + 1];
                            let dy = (y + 0.48) / 0.96;
                            let z = data.positions[3 * n + 2];
                            let dz = (z + 0.8) / 1.6;
                            positions.push(x + i * 1.6 + 0.8);
                            positions.push(y + j * 0.96 + 0.48);
                            positions.push(z + k * 1.6 + 0.8);
                            
                            let color0: BABYLON.Color4 = c0 ? c0.color : undefined;
                            let color1: BABYLON.Color4 = c1 ? c1.color : undefined;
                            let color2: BABYLON.Color4 = c2 ? c2.color : undefined;
                            let color3: BABYLON.Color4 = c3 ? c3.color : undefined;
                            let color4: BABYLON.Color4 = c4 ? c4.color : undefined;
                            let color5: BABYLON.Color4 = c5 ? c5.color : undefined;
                            let color6: BABYLON.Color4 = c6 ? c6.color : undefined;
                            let color7: BABYLON.Color4 = c7 ? c7.color : undefined;

                            let color01: BABYLON.Color4;
                            if (color0 && color1) {
                                color01 = color0.scale(1 - dx).add(color1.scale(dx));
                            }
                            else if (color0) {
                                color01 = color0;
                            }
                            else {
                                color01 = color1;
                            }

                            let color23: BABYLON.Color4;
                            if (color2 && color3) {
                                color23 = color3.scale(1 - dx).add(color2.scale(dx));
                            }
                            else if (color2) {
                                color23 = color2;
                            }
                            else {
                                color23 = color3;
                            }

                            let color45: BABYLON.Color4;
                            if (color4 && color5) {
                                color45 = color4.scale(1 - dx).add(color5.scale(dx));
                            }
                            else if (color4) {
                                color45 = color4;
                            }
                            else {
                                color45 = color5;
                            }
                            
                            let color67: BABYLON.Color4;
                            if (color6 && color7) {
                                color67 = color7.scale(1 - dx).add(color6.scale(dx));
                            }
                            else if (color6) {
                                color67 = color6;
                            }
                            else {
                                color67 = color7;
                            }

                            let color0123: BABYLON.Color4;
                            if (color01 && color23) {
                                color0123 = color01.scale(1 - dz).add(color23.scale(dz));
                            }
                            else if (color01) {
                                color0123 = color01;
                            }
                            else {
                                color0123 = color23;
                            }

                            let color4567: BABYLON.Color4;
                            if (color45 && color67) {
                                color4567 = color45.scale(1 - dz).add(color67.scale(dz));
                            }
                            else if (color45) {
                                color4567 = color45;
                            }
                            else {
                                color4567 = color67;
                            }

                            let color: BABYLON.Color4;
                            if (color0123 && color4567) {
                                color = color0123.scale(1 - dy).add(color4567.scale(dy));
                            }
                            else if (color0123) {
                                color = color0123;
                            }
                            else {
                                color = color4567;
                            }

                            colors.push(color.r, color.g, color.b, color.a);                            
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
        vertexData.colors = colors;

        vertexData.applyToMesh(this);
    }
}
