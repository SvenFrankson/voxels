var TILE_VERTEX_SIZE = 9;
var TILE_SIZE = 8;
var DX = 0.8;
var DY = 0.32;

interface TileData {
    i: number;
    j: number;
    heights: number[][];
}

class Tile extends BABYLON.Mesh {

    public heights: number[][];
    public currentLOD: number = -1;

    constructor(
        public i: number,
        public j: number
    ) {
        super("tile_" + i + "_" + j);
        this.position.x = TILE_SIZE * this.i * DX * 2;
        this.position.z = TILE_SIZE * this.j * DX * 2;
    }

    public makeEmpty(): void {
        this.heights = [];
        for (let i = 0; i < TILE_VERTEX_SIZE; i++) {
            this.heights[i] = [];
            for (let j = 0; j < TILE_VERTEX_SIZE; j++) {
                this.heights[i][j] = 0;
            }
        }
    }

    public makeRandom(): void {
        this.heights = [];
        for (let i = 0; i < TILE_VERTEX_SIZE; i++) {
            this.heights[i] = [];
            for (let j = 0; j < TILE_VERTEX_SIZE; j++) {
                this.heights[i][j] = Math.floor(Math.random() * 3);
            }
        }
    }

    private async _generateFromMesh(positions: number[], indices: number[], normals: number[]): Promise<void> {
        for (let j = 0; j < TILE_VERTEX_SIZE - 1; j++) {
            for (let i = 0; i < TILE_VERTEX_SIZE - 1; i++) {
                let h1 = this.heights[i][j];
                    let h2 = this.heights[i][j + 1];
                    let h3 = this.heights[i + 1][j + 1];
                    let h4 = this.heights[i + 1][j];
                    let min = Math.min(h1, h2, h3, h4);
                    h1 -= min;
                    h2 -= min;
                    h3 -= min;
                    h4 -= min;

                    let data = await TerrainTile.GetDataFor(h1, h2, h3, h4);
                    if (data) {
                        let l = positions.length / 3;
                        for (let ip = 0; ip < data.positions.length / 3; ip++) {
                            let x = data.positions[3 * ip];
                            let y = data.positions[3 * ip + 1];
                            let z = data.positions[3 * ip + 2];
                            positions.push(x + (2 * i + 1) * DX);
                            positions.push(y + min * DY * 3);
                            positions.push(z + (2 * j + 1) * DX);
                        }
                        for (let ii = 0; ii < data.indices.length; ii++) {
                            indices.push(data.indices[ii] + l);
                        }
                        normals.push(...data.normals);
                    }
            }
        }
    }

    private _addKnobs(positions: number[], indices: number[], normals: number[]): void {
        for (let j = 0; j < TILE_SIZE; j++) {
            for (let i = 0; i < TILE_SIZE; i++) {
                let h00 = this.heights[i][j];
                let h10 = this.heights[i + 1][j];
                let h11 = this.heights[i + 1][j + 1];
                let h01 = this.heights[i][j + 1];

                BrickVertexData.AddKnob(2 * i * DX, this.heights[i][j] * DY * 3, 2 * j * DX, positions, indices, normals);
                if (h00 === h10) {
                    BrickVertexData.AddKnob(2 * i * DX + DX, this.heights[i][j] * DY * 3, 2 * j * DX, positions, indices, normals);
                }
                if (h00 === h01) {
                    BrickVertexData.AddKnob(2 * i * DX, this.heights[i][j] * DY * 3, 2 * j * DX + DX, positions, indices, normals);
                    if (h00 === h10 && h00 === h11) {
                        BrickVertexData.AddKnob(2 * i * DX + DX, this.heights[i][j] * DY * 3, 2 * j * DX + DX, positions, indices, normals);
                    }
                }
            }
        }
    }

    public async updateTerrainMeshLod0(): Promise<void> {
        this.currentLOD = 0;
        let data = new BABYLON.VertexData();
        let positions: number[] = [];
        let indices: number[] = [];
        let normals: number[] = [];
        let colors: number[] = [];

        await this._generateFromMesh(positions, indices, normals);
        this._addKnobs(positions, indices, normals);

        for (let i = 0; i < positions.length / 3; i++) {
            colors.push(1, 0, 0, 1);
        }

        data.positions = positions;
        data.colors = colors;
        data.indices = indices;
        data.normals = normals;

        data.applyToMesh(this);
        this.currentLOD = 0;
    }

    public async updateTerrainMeshLod1(): Promise<void> {
        this.currentLOD = 1;
        let data = new BABYLON.VertexData();
        let positions: number[] = [];
        let indices: number[] = [];
        let normals: number[] = [];
        let colors: number[] = [];

        await this._generateFromMesh(positions, indices, normals);

        for (let i = 0; i < positions.length / 3; i++) {
            colors.push(0, 1, 0, 1);
        }

        data.positions = positions;
        data.colors = colors;
        data.indices = indices;
        data.normals = normals;

        data.applyToMesh(this);
        this.currentLOD = 1;
    }

    public updateTerrainMeshLod2(): void {
        this.currentLOD = 2;
        let data = new BABYLON.VertexData();
        let positions: number[] = [];
        let colors: number[] = [];
        let indices: number[] = [];

        for (let j = 0; j < TILE_VERTEX_SIZE; j++) {
            for (let i = 0; i < TILE_VERTEX_SIZE; i++) {
                let y = this.heights[i][j] * DY * 3;

                let x00 = 2 * i * DX;
                if (i > 0) {
                    x00 -= DX * 0.5;
                }
                let z00 = 2 * j * DX;
                if (j > 0) {
                    z00 -= DX * 0.5;
                }
                positions.push(x00, y, z00);

                let x10 = 2 * i * DX;
                if (i < TILE_VERTEX_SIZE - 1) {
                    x10 += DX * 0.5;
                }
                let z10 = 2 * j * DX;
                if (j > 0) {
                    z10 -= DX * 0.5;
                }
                positions.push(x10, y, z10);

                let x11 = 2 * i * DX;
                if (i < TILE_VERTEX_SIZE - 1) {
                    x11 += DX * 0.5;
                }
                let z11 = 2 * j * DX;
                if (j < TILE_VERTEX_SIZE - 1) {
                    z11 += DX * 0.5;
                }
                positions.push(x11, y, z11);

                let x01 = 2 * i * DX;
                if (i > 0) {
                    x01 -= DX * 0.5;
                }
                let z01 = 2 * j * DX;
                if (j < TILE_VERTEX_SIZE - 1) {
                    z01 += DX * 0.5;
                }
                positions.push(x01, y, z01);

                let n = 4 * (i + j * TILE_VERTEX_SIZE);
                let nJ = n + 4 * TILE_VERTEX_SIZE;

                indices.push(n, n + 1, n + 2);
                indices.push(n, n + 2, n + 3);

                if (i < TILE_VERTEX_SIZE - 1) {
                    indices.push(n + 1, n + 4, n + 7);
                    indices.push(n + 1, n + 7, n + 2);
                }

                if (j < TILE_VERTEX_SIZE - 1) {
                    indices.push(n + 3, n + 2, nJ + 1);
                    indices.push(n + 3, nJ + 1, nJ);
                }

                if (i < TILE_VERTEX_SIZE - 1 && j < TILE_VERTEX_SIZE - 1) {
                    indices.push(n + 2, n + 7, nJ + 4);
                    indices.push(n + 2, nJ + 4, nJ + 1);
                }
            }
        }

        for (let i = 0; i < positions.length / 3; i++) {
            colors.push(0, 0, 1, 1);
        }

        data.positions = positions;
        data.colors = colors;
        data.indices = indices;
        let normals = [];
        BABYLON.VertexData.ComputeNormals(positions, indices, normals);
        data.normals = normals;

        data.applyToMesh(this);
        this.currentLOD = 2;
    }

    public updateTerrainMeshLod3(): void {
        this.currentLOD = 3;
        this.updateTerrainMeshLod2();
        this.currentLOD = 3;
    }

    public serialize(): TileData {
        return {
            i: this.i,
            j: this.j,
            heights: this.heights
        };
    }

    public deserialize(data: TileData): void {
        this.i = data.i;
        this.j = data.j;
        this.heights = data.heights;
    }
}
