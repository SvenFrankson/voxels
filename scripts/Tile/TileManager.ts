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

    public async updateTile(i: number, j: number): Promise<void> {
        let tileRef = i + "_" + j;
        let tile = this.tiles.get(tileRef);
        if (!tile) {
            tile = this._createTile(i, j);
            this.tiles.set(tileRef, tile);
        }
        await tile.updateTerrainMeshLod0();
    }
}