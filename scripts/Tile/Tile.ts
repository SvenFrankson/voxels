var TILE_VERTEX_SIZE = 9;
var TILE_SIZE = 8;
var DX = 0.8;
var DY = 0.32;
var TILE_LENGTH = TILE_SIZE * DX * 2;

interface TileData {
    i: number;
    j: number;
    heights: number[][];
}

class Tile extends BABYLON.Mesh {

    public heights: number[][];
    public types: number[][];
    public bricks: Brick[] = [];
    public currentLOD: number = -1;

    public get tileTexture(): TerrainTileTexture {
        if (this.material instanceof TerrainTileToonMaterial) {
            if (this.material.diffuseTexture instanceof TerrainTileTexture) {
                return this.material.diffuseTexture;
            }
        }
    }

    public set tileTexture(t: TerrainTileTexture) {
        if (this.material instanceof TerrainTileToonMaterial) {
            this.material.diffuseTexture = t;
        }
    }

    constructor(
        public i: number,
        public j: number
    ) {
        super("tile_" + i + "_" + j);
        this.position.x = TILE_SIZE * this.i * DX * 2;
        this.position.z = TILE_SIZE * this.j * DX * 2;
        let material = new TerrainTileToonMaterial(this.name + "-material", Main.Scene);
        material.diffuseTexture = new TerrainTileTexture(this);
        this.material = material;
    }

    public makeEmpty(): void {
        this.heights = [];
        this.types = [];
        for (let i = 0; i < TILE_VERTEX_SIZE; i++) {
            this.heights[i] = [];
            this.types[i] = [];
            for (let j = 0; j < TILE_VERTEX_SIZE; j++) {
                this.heights[i][j] = 0;
                this.types[i][j] = 0;
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

    private _generateFromMesh(positions: number[], indices: number[], normals: number[]): void {
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

                    let data = TerrainTileVertexData.GetDataFor(h1, h2, h3, h4);
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

    private _generateFromData(positions: number[], indices: number[], normals: number[]): void {
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
        BABYLON.VertexData.ComputeNormals(positions, indices, normals);
    }

    private _generateUVS(positions: number[], uvs: number[]): void {
        for (let i = 0; i < positions.length / 3; i++) {
            let x = positions[3 * i];
            let z = positions[3 * i + 2];
            uvs.push(x / TILE_LENGTH, z / TILE_LENGTH);
        }
    }

    private _addKnobs(positions: number[], indices: number[], normals: number[], lod: number): void {
        for (let j = 0; j < TILE_SIZE; j++) {
            for (let i = 0; i < TILE_SIZE; i++) {
                let h00 = this.heights[i][j];
                let h10 = this.heights[i + 1][j];
                let h11 = this.heights[i + 1][j + 1];
                let h01 = this.heights[i][j + 1];

                BrickVertexData.AddKnob(2 * i, this.heights[i][j] * 3, 2 * j, positions, indices, normals, lod);
                if (h00 === h10) {
                    BrickVertexData.AddKnob(2 * i + 1, this.heights[i][j] * 3, 2 * j, positions, indices, normals, lod);
                }
                if (h00 === h01) {
                    BrickVertexData.AddKnob(2 * i, this.heights[i][j] * 3, 2 * j + 1, positions, indices, normals, lod);
                    if (h00 === h10 && h00 === h11) {
                        BrickVertexData.AddKnob(2 * i + 1, this.heights[i][j] * 3, 2 * j + 1, positions, indices, normals, lod);
                    }
                }
            }
        }
    }

    public updateTerrainMesh(lod: number): void {
        this.currentLOD = lod;
        let data = new BABYLON.VertexData();
        let positions: number[] = [];
        let normals: number[] = [];
        //let colors: number[] = [];
        let uvs: number[] = [];
        let indices: number[] = [];

        if (lod === 0) {
            this._generateFromMesh(positions, indices, normals);
            this._addKnobs(positions, indices, normals, 0);
            this._generateUVS(positions, uvs);
        }
        else if (lod === 1) {
            this._generateFromMesh(positions, indices, normals);
            this._addKnobs(positions, indices, normals, 1);
            this._generateUVS(positions, uvs);
        }
        else if (lod === 2) {
            this._generateFromData(positions, indices, normals);
            this._addKnobs(positions, indices, normals, 2);
            this._generateUVS(positions, uvs);
        }
        else if (lod === 3) {
            this._generateFromData(positions, indices, normals);
            this._generateUVS(positions, uvs);
        }

        /*
        for (let i = 0; i < positions.length / 3; i++) {
            colors.push(1, 0, 0, 1);
        }
        */

        data.positions = positions;
        data.normals = normals;
        //data.colors = colors;
        data.uvs = uvs;
        data.indices = indices;

        data.applyToMesh(this);
        this.tileTexture.redraw();
        this.freezeWorldMatrix();
        this.currentLOD = lod;
    }

    public async updateBricks(): Promise<void> {
        let children = this.getChildMeshes();
        while (children.length > 0) {
            children.pop().dispose();
        }
        for (let i = 0; i < this.bricks.length; i++) {
            let brick = this.bricks[i];
            let b = new BABYLON.Mesh("brick-" + i);
            let data = await BrickVertexData.GetFullBrickVertexData(brick.reference);
            data.applyToMesh(b);
            b.position.copyFromFloats(brick.i * DX, brick.k * DY, brick.j * DX);
            b.rotation.y = Math.PI / 2 * brick.r;
            b.parent = this;
            b.material = Main.cellShadingMaterial;
        }
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
