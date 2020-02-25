class BrickData {

    public knobs: number[] = [];
    public covers: number[] = [];
    public blocks: number[] = [];
}

class BrickDataManager {

    public static BrickNames: string[] = [];
    private static _BrickDatas: Map<string, BrickData> = new Map<string, BrickData>();

    public static InitializeData(): void {
        let LValues = [1, 2, 3, 4, 6, 8];
        let WValues = [1, 2];
        for (let i = 0; i < LValues.length; i++) {
            let L = LValues[i];
            for (let j = 0; j < WValues.length; j++) {
                let W = WValues[j];
                if (L >= W) {
                    // Brick
                    let brickData = new BrickData();
                    let brickName = "brick-" + W + "x" + L;
                    for (let w = 0; w < W; w++) {
                        for (let l = 0; l < L; l++) {
                            brickData.knobs.push(w, 3, l);
                            for (let h = 0; h < 0; h++) {
                                brickData.covers.push(w, h, l);
                                brickData.blocks.push(w, h, l);
                            }
                        }
                    }
                    BrickDataManager._BrickDatas.set(brickName, brickData);
                    BrickDataManager.BrickNames.push(brickName);
    
                    // Tile
                    let tileData = new BrickData();
                    let tileName = "tile-" + W + "x" + L;
                    for (let w = 0; w < W; w++) {
                        for (let l = 0; l < L; l++) {
                            tileData.covers.push(w, 0, l);
                            tileData.blocks.push(w, 0, l);
                        }
                    }
                    BrickDataManager._BrickDatas.set(tileName, tileData);
                    BrickDataManager.BrickNames.push(tileName);
    
                    // Plate
                    let plateData = new BrickData();
                    let plateName = "plate-" + W + "x" + L;
                    for (let w = 0; w < W; w++) {
                        for (let l = 0; l < L; l++) {
                            plateData.knobs.push(w, 1, l);
                            plateData.covers.push(w, 0, l);
                            plateData.blocks.push(w, 0, l);
                        }
                    }
                    BrickDataManager._BrickDatas.set(plateName, plateData);
                    BrickDataManager.BrickNames.push(plateName);
                }
            }
        }
    }

    public static GetBrickData(brickReference: IBrickReference): BrickData {
        return BrickDataManager._BrickDatas.get(brickReference.name);
    }
}