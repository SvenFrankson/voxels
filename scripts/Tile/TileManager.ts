var LOD0_DIST = 4;
var LOD1_DIST = 6;
var LOD2_DIST = 8;
var LOD3_DIST = 10;

class TileManager {

    public static Instance: TileManager;

    public tiles: Map<string, Tile> = new Map<string, Tile>();

    private _checkPositions: {i: number, j: number, d: number}[] = [];

    constructor() {
        TileManager.Instance = this;
        this._checkPositions = [];
        for (let i = - LOD3_DIST; i <= LOD3_DIST; i++) {
            for (let j = - LOD3_DIST; j <= LOD3_DIST; j++) {
                let d = Math.sqrt(i * i + j * j);
                if (d <= LOD3_DIST) {
                    this._checkPositions.push({i: i, j: j, d: d});
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

    public static GetTile(i: number, j: number): Tile {
        let tileRef = i + "_" + j;
        return TileManager.Instance.tiles.get(tileRef);
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

    private _camIReset: number = NaN;
    private _camJReset: number = NaN;
    private _checkIndex: number = 0;
    public updateLoop = () => {
        let cameraPosition = Main.Camera.globalPosition;

        let camI = Math.round(cameraPosition.x / (TILE_SIZE * DX * 2));
        let camJ = Math.round(cameraPosition.z / (TILE_SIZE * DX * 2));

        let done = false;
        let t0 = performance.now();
        while (!done) {
            let _checkPosition = this._checkPositions[this._checkIndex];
            this._checkIndex++;
            if (_checkPosition) {
                let tile = this.getOrCreateTile(_checkPosition.i + camI, _checkPosition.j + camJ);
                if (tile.currentLOD === - 1) {
                    if (_checkPosition.d <= LOD0_DIST) {
                        tile.updateTerrainMesh(0);
                    }
                    else if (_checkPosition.d <= LOD1_DIST) {
                        tile.updateTerrainMesh(1);
                    }
                    else if (_checkPosition.d <= LOD2_DIST) {
                        tile.updateTerrainMesh(2);
                    }
                    else if (_checkPosition.d <= LOD3_DIST) {
                        tile.updateTerrainMesh(3);
                    }
                }
                else if (tile.currentLOD === 3) {
                    if (_checkPosition.d <= LOD2_DIST) {
                        tile.updateTerrainMesh(2);
                    }
                }
                else if (tile.currentLOD === 2) {
                    if (_checkPosition.d <= LOD1_DIST) {
                        tile.updateTerrainMesh(1);
                    }
                    else if (_checkPosition.d >= LOD2_DIST + 4) {
                        tile.updateTerrainMesh(3);
                    }
                }
                else if (tile.currentLOD === 1) {
                    if (_checkPosition.d <= LOD0_DIST) {
                        tile.updateTerrainMesh(0);
                    }
                    else if (_checkPosition.d >= LOD1_DIST + 2) {
                        tile.updateTerrainMesh(2);
                    }
                }
                else if (tile.currentLOD === 0) {
                    if (_checkPosition.d >= LOD0_DIST + 1) {
                        tile.updateTerrainMesh(1);
                    }
                }
                done = performance.now() - t0 > 30;
            }
            else {
                if (this._camIReset !== camI || this._camJReset !== camJ) {
                    this._camIReset = camI;
                    this._camJReset = camJ;
                    this._checkIndex = 0;
                }
                return;
            }
        }
    }
}