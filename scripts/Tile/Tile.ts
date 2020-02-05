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

    private static _Signs = [[- 1, - 1], [1, - 1], [1, 1], [- 1, 1]];
    public updateTerrainMesh(): void {
        let data = new BABYLON.VertexData();
        let positions: number[] = [];
        let colors: number[] = [];
        let indices: number[] = [];

        for (let j = 0; j < TILE_SIZE; j++) {
            for (let i = 0; i < TILE_SIZE; i++) {
                let y = this.heights[i][j] * DY * 3;

                Tile._Signs.forEach(signs => {
                    let x = 2 * i * DX + signs[0] * DX * 0.5;
                    let z = 2 * j * DX + signs[1] * DX * 0.5;
                    x = Math.max(0, x);
                    z = Math.max(0, z);
                    positions.push(x, y, z);
                });
            }
        }

        data.positions = positions;
        data.colors = colors;
        data.indices = indices;
        let normals = [];
        data.normals = normals;

        data.applyToMesh(this);

        this.material = Main.terrainCellShadingMaterial;
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
