var TILE_SIZE = 9;
var DX = 0.7;
var DY = 0.3;

interface TileData {
    i: number;
    j: number;
    heights: number[][];
}

class Tile extends BABYLON.Mesh {

    public heights: number[][];

    constructor(
        public i: number,
        public j: number
    ) {
        super("tile_" + i + "_" + j);
        this.position.x = TILE_SIZE * this.i;
        this.position.y = TILE_SIZE * this.j;
    }

    public makeEmpty(): void {
        this.heights = [];
        for (let i = 0; i < TILE_SIZE; i++) {
            this.heights[i] = [];
            for (let j = 0; j < TILE_SIZE; j++) {
                this.heights[i][j] = 0;
            }
        }
    }

    public makeRandom(): void {
        this.heights = [];
        for (let i = 0; i < TILE_SIZE; i++) {
            this.heights[i] = [];
            for (let j = 0; j < TILE_SIZE; j++) {
                this.heights[i][j] = Math.floor(Math.random() * 2);
            }
        }
    }

    public updateTerrainMesh(): void {
        let data = new BABYLON.VertexData();
        let positions: number[] = [];
        let colors: number[] = [];
        let indices: number[] = [];

        for (let j = 0; j < TILE_SIZE; j++) {
            for (let i = 0; i < TILE_SIZE; i++) {
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
                if (i < TILE_SIZE - 1) {
                    x10 += DX * 0.5;
                }
                let z10 = 2 * j * DX;
                if (j > 0) {
                    z10 -= DX * 0.5;
                }
                positions.push(x10, y, z10);

                let x11 = 2 * i * DX;
                if (i < TILE_SIZE - 1) {
                    x11 += DX * 0.5;
                }
                let z11 = 2 * j * DX;
                if (j < TILE_SIZE - 1) {
                    z11 += DX * 0.5;
                }
                positions.push(x11, y, z11);

                let x01 = 2 * i * DX;
                if (i > 0) {
                    x01 -= DX * 0.5;
                }
                let z01 = 2 * j * DX;
                if (j < TILE_SIZE - 1) {
                    z01 += DX * 0.5;
                }
                positions.push(x01, y, z01);

                let n = 4 * (i + j * TILE_SIZE);
                let nJ = n + 4 * TILE_SIZE;

                indices.push(n, n + 1, n + 2);
                indices.push(n, n + 2, n + 3);

                if (i < TILE_SIZE - 1) {
                    indices.push(n + 1, n + 4, n + 7);
                    indices.push(n + 1, n + 7, n + 2);
                }

                if (j < TILE_SIZE - 1) {
                    indices.push(n + 3, n + 2, nJ + 1);
                    indices.push(n + 3, nJ + 1, nJ);
                }

                if (i < TILE_SIZE - 1 && j < TILE_SIZE - 1) {
                    indices.push(n + 2, n + 7, nJ + 4);
                    indices.push(n + 2, nJ + 4, nJ + 1);
                }
            }
        }

        data.positions = positions;
        //data.colors = colors;
        data.indices = indices;
        let normals = [];
        BABYLON.VertexData.ComputeNormals(positions, indices, normals);
        data.normals = normals;

        
        for (let j = 0; j < TILE_SIZE - 1; j++) {
            for (let i = 0; i < TILE_SIZE - 1; i++) {
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

        data.applyToMesh(this);
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
