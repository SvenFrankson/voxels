/// <reference path="./Chunck.ts"/>

var CHUNCK_SIZE = 8;

class Chunck_V2 extends Chunck {

    public knobsMesh: BABYLON.Mesh;

    public bricks: Brick[] = [];
    public brickMeshes: BABYLON.Mesh[] = [];

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

        this.knobsMesh = new BABYLON.Mesh(this.name + "_knobs");
        this.knobsMesh.parent = this;
        this.knobsMesh.material = Main.cellShadingMaterial;
    }

    public addBrick(brick: Brick): void {
        let i = this.bricks.indexOf(brick);
        if (i === -1) {
            this.bricks.push(brick);
        }
    }

    public static HasLoged: boolean = false;
    public async generate(): Promise<void> {
        let positions: number[] = [];
        let indices: number[] = [];
        let normals: number[] = [];
        let colors: number[] = [];

        let knobsPositions: number[] = [];
        let knobsIndices: number[] = [];
        let knobsNormals: number[] = [];
        let knobsColors: number[] = [];

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
                    /*
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
                    */

                    let data = ChunckVertexData.Get(ref);

                    if (c0 && !c4) {
                        BrickVertexData.AddKnob(2 * i, 3 * j, 2 * k, knobsPositions, knobsIndices, knobsNormals, 0, knobsColors, c0.displayedColor);
                        if (c1 && !c5) {
                            BrickVertexData.AddKnob(2 * i + 1, 3 * j, 2 * k, knobsPositions, knobsIndices, knobsNormals, 0, knobsColors, c0.displayedColor);
                            if (c3 && !c7 && c2 && !c6) {
                                BrickVertexData.AddKnob(2 * i + 1, 3 * j, 2 * k + 1, knobsPositions, knobsIndices, knobsNormals, 0, knobsColors, c0.displayedColor);
                            }
                        }
                        if (c3 && !c7) {
                            BrickVertexData.AddKnob(2 * i, 3 * j, 2 * k + 1, knobsPositions, knobsIndices, knobsNormals, 0, knobsColors, c0.displayedColor);
                        }
                    }

                    if (data) {
                        let l = positions.length / 3;
                        for (let n = 0; n < data.positions.length / 3; n++) {
                            let x = data.positions[3 * n];
                            let y = data.positions[3 * n + 1];
                            let z = data.positions[3 * n + 2];
                            
                            positions.push(x + i * 1.6 + 0.8);
                            positions.push(y + j * 0.96);
                            positions.push(z + k * 1.6 + 0.8);
                            
                            let color0: BABYLON.Color4 = c0 ? c0.color : undefined;
                            let color1: BABYLON.Color4 = c1 ? c1.color : undefined;
                            let color2: BABYLON.Color4 = c2 ? c2.color : undefined;
                            let color3: BABYLON.Color4 = c3 ? c3.color : undefined;
                            let color4: BABYLON.Color4 = c4 ? c4.color : undefined;
                            let color5: BABYLON.Color4 = c5 ? c5.color : undefined;
                            let color6: BABYLON.Color4 = c6 ? c6.color : undefined;
                            let color7: BABYLON.Color4 = c7 ? c7.color : undefined;

                            let d = Infinity;
                            let color: BABYLON.Color4;
                            if (color0) {
                                if (x < 0 && y < 0 && z < 0) {
                                    colors.push(color0.r, color0.g, color0.b, color0.a);
                                    continue;  
                                }
                                let dd = x + 0.8 + y + 0.48 + z + 0.8;
                                if (dd < d) {
                                    d = dd;
                                    color = color0;
                                }
                            }
                            if (color1) {
                                if (x > 0 && y < 0 && z < 0) {
                                    colors.push(color1.r, color1.g, color1.b, color1.a);
                                    continue;  
                                }
                                let dd = 0.8 - x + y + 0.48 + z + 0.8;
                                if (dd < d) {
                                    d = dd;
                                    color = color1;
                                }
                            }
                            if (color3) {
                                if (x < 0 && y < 0 && z > 0) {
                                    colors.push(color3.r, color3.g, color3.b, color3.a);
                                    continue;  
                                }
                                let dd = x + 0.8 + y + 0.48 + 0.8 - z;
                                if (dd < d) {
                                    d = dd;
                                    color = color3;
                                }
                            }
                            if (color2) {
                                if (x > 0 && y < 0 && z > 0) {
                                    colors.push(color2.r, color2.g, color2.b, color2.a);
                                    continue;  
                                }
                                let dd = 0.8 - x + y + 0.48 + 0.8 - z;
                                if (dd < d) {
                                    d = dd;
                                    color = color2;
                                }
                            }
                            if (color4) {
                                if (x < 0 && y > 0 && z < 0) {
                                    colors.push(color4.r, color4.g, color4.b, color4.a);
                                    continue;  
                                }
                                let dd = x + 0.8 + 0.48 - y + z + 0.8;
                                if (dd < d) {
                                    d = dd;
                                    color = color4;
                                }
                            }
                            if (color5) {
                                if (x > 0 && y > 0 && z < 0) {
                                    colors.push(color5.r, color5.g, color5.b, color5.a);
                                    continue;  
                                }
                                let dd = 0.8 - x + 0.48 - y + z + 0.8;
                                if (dd < d) {
                                    d = dd;
                                    color = color5;
                                }
                            }
                            if (color7) {
                                if (x < 0 && y > 0 && z > 0) {
                                    colors.push(color7.r, color7.g, color7.b, color7.a);
                                    continue;  
                                }
                                let dd = x + 0.8 + 0.48 - y + 0.8 - z;
                                if (dd < d) {
                                    d = dd;
                                    color = color7;
                                }
                            }
                            if (color6) {
                                if (x > 0 && y > 0 && z > 0) {
                                    colors.push(color6.r, color6.g, color6.b, color6.a);
                                    continue;  
                                }
                                let dd = 0.8 - x + 0.48 - y + 0.8 - z;
                                if (dd < d) {
                                    d = dd;
                                    color = color6;
                                }
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

        let knobsVertexData = new BABYLON.VertexData();
        knobsVertexData.positions = knobsPositions;
        knobsVertexData.indices = knobsIndices;
        knobsVertexData.normals = knobsNormals;
        knobsVertexData.colors = knobsColors;

        knobsVertexData.applyToMesh(this.knobsMesh);

        this.updateBricks();
    }

    public async updateBricks(): Promise<void> {
        while (this.brickMeshes.length > 1) {
            this.brickMeshes.pop().dispose();
        }
        for (let i = 0; i < this.bricks.length; i++) {
            let brick = this.bricks[i];
            let b = new BABYLON.Mesh("brick-" + i);
            let data = await BrickVertexData.GetFullBrickVertexData(brick.reference);
            data.applyToMesh(b);
            b.position.copyFromFloats(brick.i * DX, brick.j * DY, brick.k * DX);
            b.rotation.y = Math.PI / 2 * brick.r;
            b.parent = this;
            if (brick.reference.color.indexOf("transparent") != -1) {
                b.material = Main.cellShadingTransparentMaterial;
            }
            else {
                b.material = Main.cellShadingMaterial;
            }
            this.brickMeshes.push(b);
        }
    }
}
