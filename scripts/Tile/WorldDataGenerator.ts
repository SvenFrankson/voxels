var DATA_SIZE = 128;

class WorldDataGenerator {

    private static _RawDatas: Map<string, number[][]> = new Map<string, number[][]>();
    private static _Datas: Map<string, number[][]> = new Map<string, number[][]>();

    private static _GetRawData(IRaw: number, JRaw: number): number[][] {
        let rawTile = WorldDataGenerator._RawDatas.get(IRaw.toFixed(0) + "_" + JRaw.toFixed(0));
        if (rawTile) {
            return rawTile;
        }
        rawTile = WorldDataGenerator.GenerateRawTileFor(IRaw, JRaw);
        WorldDataGenerator._RawDatas.set(IRaw.toFixed(0) + "_" + JRaw.toFixed(0), rawTile);
        return rawTile;
    }

    public static GetData(I: number, J: number): number[][] {
        let tile = WorldDataGenerator._Datas.get(I.toFixed(0) + "_" + J.toFixed(0));
        if (tile) {
            return tile;
        }
        let s = DATA_SIZE;
        let s2 = s / 2;

        let rawI = 2 * I;
        let rawJ = 2 * J;

        let rawTile = WorldDataGenerator._GetRawData(rawI, rawJ);
        let rawTileMM = WorldDataGenerator._GetRawData(rawI - 1, rawJ - 1);
        let rawTilePM = WorldDataGenerator._GetRawData(rawI + 1, rawJ - 1);
        let rawTilePP = WorldDataGenerator._GetRawData(rawI + 1, rawJ + 1);
        let rawTileMP = WorldDataGenerator._GetRawData(rawI - 1, rawJ + 1);

        tile = [];

        for (let i = 0; i < s; i++) {
            tile[i] = [];
        }

        for (let i = 0; i < s / 2; i++) {
            for (let j = 0; j < s / 2; j++) {
                let pMM = Math.min(i / s2, j / s2);
                tile[i][j] = rawTile[i][j] * pMM + rawTileMM[i + s2][j + s2] * (1 - pMM);
                
                let pPM = Math.min((s2 - i) / s2, j / s2);
                tile[s2 + i][j] = rawTile[s2 + i][j] * pPM + rawTilePM[i][j + s2] * (1 - pPM); 
                
                let pPP = Math.min((s2 - i) / s2, (s2 - j) / s2);
                tile[s2 + i][s2 + j] = rawTile[s2 + i][s2 + j] * pPP + rawTilePP[i][j] * (1 - pPP); 
                
                let pMP = Math.min(i / s2, (s2 - j) / s2);
                tile[i][s2 + j] = rawTile[i][s2 + j] * pMP + rawTileMP[s2 + i][j] * (1 - pMP); 
            }
        }

        for (let i = 0; i < s; i++) {
            for (let j = 0; j < s; j++) {
                tile[i][j] = Math.round(tile[i][j]);
            }
        }

        let done = false;
        while (!done) {
            done = true;
            for (let i = 0; i < DATA_SIZE - 1; i++) {
                for (let j = 0; j < DATA_SIZE - 1; j++) {
                    let h1 = tile[i][j];
                    let h2 = tile[i][j + 1];
                    let h3 = tile[i + 1][j + 1];
                    let h4 = tile[i + 1][j];
                    let max = Math.max(h1, h2, h3, h4);
                    let min = Math.min(h1, h2, h3, h4);
                    if (max - min > 2) {
                        tile[i][j] = Math.floor(h1 * 0.4 + h2 * 0.2 + h3 * 0.2 + h4 * 0.2);
                        tile[i][j + 1] = Math.floor(h1 * 0.2 + h2 * 0.4 + h3 * 0.2 + h4 * 0.2);
                        tile[i + 1][j + 1] = Math.floor(h1 * 0.2 + h2 * 0.2 + h3 * 0.4 + h4 * 0.2);
                        tile[i + 1][j] = Math.floor(h1 * 0.2 + h2 * 0.2 + h3 * 0.2 + h4 * 0.4);
                        done = false;
                    }
                }
            }
        }

        WorldDataGenerator._Datas.set(I.toFixed(0) + "_" + J.toFixed(0), tile);

        return tile;
    }

    public static GenerateRawTileFor(I: number, J: number): number[][] {

        let output: number[][] = [];
        
        for (let i = 0; i < DATA_SIZE; i++) {
            output[i] = [];
            for (let j = 0; j < DATA_SIZE; j++) {
                output[i][j] = 10;
            }
        }

        for (let n = 0; n < 10; n++) {
            let x = Math.floor(Math.random() * DATA_SIZE);
            let y = Math.floor(Math.random() * DATA_SIZE);
            let h = Math.random() * 10 - 5;

            for (let i = Math.max(x - 32, 0); i < x + 32 && i < DATA_SIZE; i++) {
                for (let j = Math.max(y - 32, 0); j < y + 32 && j < DATA_SIZE; j++) {
                    output[i][j] += h;
                }
            }
        }

        for (let n = 0; n < 20; n++) {
            let x = Math.floor(Math.random() * DATA_SIZE);
            let y = Math.floor(Math.random() * DATA_SIZE);
            let h = Math.random() * 4 - 2;

            for (let i = Math.max(x - 16, 0); i < x + 16 && i < DATA_SIZE; i++) {
                for (let j = Math.max(y - 16, 0); j < y + 16 && j < DATA_SIZE; j++) {
                    output[i][j] += h;
                }
            }
        }

        for (let n = 0; n < 100; n++) {
            let x = Math.floor(Math.random() * DATA_SIZE);
            let y = Math.floor(Math.random() * DATA_SIZE);
            let h = Math.random() * 4 - 2;

            for (let i = Math.max(x - 8, 0); i < x + 8 && i < DATA_SIZE; i++) {
                for (let j = Math.max(y - 8, 0); j < y + 8 && j < DATA_SIZE; j++) {
                    output[i][j] += h;
                }
            }
        }

        for (let i = 0; i < DATA_SIZE; i++) {
            for (let j = 0; j < DATA_SIZE; j++) {
                let n = 0;
                let o = 0;
                for (let ii = i - 1; ii <= i + 1; ii++) {
                    for (let jj = j - 1; jj <= j + 1; jj++) {
                        if (ii >= 0 && ii < DATA_SIZE && jj > 0 && jj < DATA_SIZE) {
                            n++;
                            o += output[ii][jj];
                        }
                    }
                }
                output[i][j] = Math.floor(o / n);
            }
        }

        let done = false;
        while (!done) {
            done = true;
            for (let i = 0; i < DATA_SIZE - 1; i++) {
                for (let j = 0; j < DATA_SIZE - 1; j++) {
                    let h1 = output[i][j];
                    let h2 = output[i][j + 1];
                    let h3 = output[i + 1][j + 1];
                    let h4 = output[i + 1][j];
                    let max = Math.max(h1, h2, h3, h4);
                    let min = Math.min(h1, h2, h3, h4);
                    if (max - min > 2) {
                        output[i][j] = Math.floor(h1 * 0.4 + h2 * 0.2 + h3 * 0.2 + h4 * 0.2);
                        output[i][j + 1] = Math.floor(h1 * 0.2 + h2 * 0.4 + h3 * 0.2 + h4 * 0.2);
                        output[i + 1][j + 1] = Math.floor(h1 * 0.2 + h2 * 0.2 + h3 * 0.4 + h4 * 0.2);
                        output[i + 1][j] = Math.floor(h1 * 0.2 + h2 * 0.2 + h3 * 0.2 + h4 * 0.4);
                        done = false;
                    }
                }
            }
        }

        return output;
    }
}