class TileManager {

    public tiles: Map<string, Tile> = new Map<string, Tile>();

    private _requestLod: {i: number, j: number, lod: number}[] = [];
    private _checkPositions: {i: number, j: number, d: number}[] = [];

    constructor() {
        let sqr15 = 15 * 15
        this._checkPositions = [];
        for (let i = - 15; i <= 15; i++) {
            for (let j = - 15; j <= 15; j++) {
                if (i * i + j * j <= sqr15) {
                    this._checkPositions.push({i: i, j: j, d: Math.sqrt(i * i + j * j)});
                }
            }
        }
        this._checkPositions.sort((a, b) => {
            return (a.i * a.i + a.j * a.j) - (b.i * b.i + b.j * b.j);
        });
    }

    private _createTile(iTile: number, jTile: number): Tile {
        let tile = new Tile(iTile, jTile);
        tile.makeEmpty();
        let IData = Math.floor(iTile * TILE_SIZE / DATA_SIZE);
        let JData = Math.floor(jTile * TILE_SIZE / DATA_SIZE);
        let data = WorldDataGenerator.GetData(IData, JData);
        let iOffsetData = iTile * TILE_SIZE - IData * DATA_SIZE;
        let jOffsetData = jTile * TILE_SIZE - JData * DATA_SIZE;

        let dataOverX: number[][];
        let dataOverY: number[][];
        let dataOverXY: number[][];

        for (let i = 0; i < TILE_VERTEX_SIZE; i++) {
            for (let j = 0; j < TILE_VERTEX_SIZE; j++) {
                if (i + iOffsetData >= DATA_SIZE) {
                    if (j + jOffsetData >= DATA_SIZE) {
                        if (!dataOverXY) {
                            dataOverXY = WorldDataGenerator.GetData(IData + 1, JData + 1);
                            tile.heights[i][j] = dataOverXY[0][0];
                        }
                    }
                    else {
                        if (!dataOverX) {
                            dataOverX = WorldDataGenerator.GetData(IData + 1, JData);
                        }
                        tile.heights[i][j] = dataOverX[0][j + jOffsetData];
                    }
                }
                else if (j + jOffsetData >= DATA_SIZE) {
                    if (!dataOverY) {
                        dataOverY = WorldDataGenerator.GetData(IData, JData + 1);
                    }
                    tile.heights[i][j] = dataOverY[i + iOffsetData][0];
                }
                else {
                    tile.heights[i][j] = data[i + iOffsetData][j + jOffsetData];
                }
            }
        }

        return tile;
    }

    public getOrCreateTile(i: number, j: number): Tile {
        let tileRef = i + "_" + j;
        let tile = this.tiles.get(tileRef);
        if (!tile) {
            tile = this._createTile(i, j);
            this.tiles.set(tileRef, tile);
        }
        return tile;
    }

    private _checkIndex: number = 0;
    public updateLoop = () => {
        let cameraPosition = Main.Camera.position;

        let camI = Math.round(cameraPosition.x / (TILE_SIZE * DX * 2));
        let camJ = Math.round(cameraPosition.z / (TILE_SIZE * DX * 2));

        for (let n = 0; n < 30; n++) {
            let _checkPosition = this._checkPositions[this._checkIndex];
            this._checkIndex++;
            if (_checkPosition) {
                let tile = this.getOrCreateTile(_checkPosition.i + camI, _checkPosition.j + camJ);
                let lod = Math.floor(_checkPosition.d / 5);
                if (tile.currentLOD !== lod) {
                    if (lod === 0) {
                        tile.updateTerrainMeshLod0();
                    }
                    else if (lod === 1) {
                        tile.updateTerrainMeshLod1();
                    }
                }
            }
            else {
                this._checkIndex = 0;
                return;
            }
        }
    }
}