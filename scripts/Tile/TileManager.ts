class TileManager {

    public tiles: Map<string, Tile> = new Map<string, Tile>();

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

    public async updateTile(i: number, j: number, lod: number): Promise<void> {
        let tileRef = i + "_" + j;
        let tile = this.tiles.get(tileRef);
        if (!tile) {
            tile = this._createTile(i, j);
            this.tiles.set(tileRef, tile);
        }
        if (lod === 0) {
            await tile.updateTerrainMeshLod0();
        }
        else if (lod === 1) {
            await tile.updateTerrainMeshLod1();
        }
    }

    private _requestLod: {i: number, j: number, lod: number}[] = [];

    public updateLoop = () => {
        let cameraPosition = Main.Camera.position;

        let camI = Math.round(cameraPosition.x / (TILE_SIZE * DX * 2));
        let camJ = Math.round(cameraPosition.z / (TILE_SIZE * DX * 2));

        for (let i = camI - 6; i <= camI + 6; i++) {
            for (let j = camJ - 6; j <= camJ + 6; j++) {
                let request = this._requestLod.find(r => { return r.i === i && r.j === j});
                if (!request) {
                    request = { i: i, j: j, lod: 2};
                    this._requestLod.push(request);
                }
                let dSquare = (i - camI) * (i - camI) + (j - camJ) * (j - camJ);
                if (dSquare < 9) {
                    request.lod = 0;
                }
                else if (dSquare <= 36) {
                    request.lod = 1;
                }
                else {
                    request.lod = 2;
                }
            }
        }

        for (let i = 0; i < 10; i++) {
            if (this._requestLod.length > 0) {
                let request = this._requestLod.splice(0, 1)[0];
                if (request.lod < 2) {
                    let tile = this.getOrCreateTile(request.i, request.j);
                    if (tile.currentLOD !== request.lod) {
                        if (request.lod === 0) {
                            tile.updateTerrainMeshLod0();
                        }
                        else if (request.lod === 1) {
                            tile.updateTerrainMeshLod1();
                        }
                    }
                }
            }
        }
    }
}