var TILE_SIZE = 8;

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

    public updateTerrainMesh(): void {
        let data = new BABYLON.VertexData();
        let positions: number[] = [];
        let colors: number[] = [];
        let indices: number[] = [];

        for (let i = 0; i < TILE_SIZE; i++) {
            
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
