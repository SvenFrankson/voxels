class BrickData {

    public knobs: number[] = [];
    public covers: number[] = [];
    public blocks: number[] = [];
}

class BrickDataManager {

    public static BrickColorNames: string[] = [];
    public static BrickColors: Map<string, BABYLON.Color3> = new Map<string, BABYLON.Color3>();
    public static BrickNames: string[] = [];
    private static _BrickDatas: Map<string, BrickData> = new Map<string, BrickData>();

    public static InitializeData(): void {
        BrickDataManager.BrickColors.set("brightyellow", BABYLON.Color3.FromInts(255, 205, 3));
        BrickDataManager.BrickColors.set("brightorange", BABYLON.Color3.FromInts(245, 125, 32));
        BrickDataManager.BrickColors.set("brightred", BABYLON.Color3.FromInts(221, 26, 33));
        BrickDataManager.BrickColors.set("brightpurple", BABYLON.Color3.FromInts(233, 93, 162));
        BrickDataManager.BrickColors.set("brightblue", BABYLON.Color3.FromInts(0, 108, 183));
        BrickDataManager.BrickColors.set("darkazur", BABYLON.Color3.FromInts(0, 163, 218));
        BrickDataManager.BrickColors.set("yellowishgreen", BABYLON.Color3.FromInts(204, 225, 151));
        BrickDataManager.BrickColors.set("brightgreen", BABYLON.Color3.FromInts(0, 175, 77));
        BrickDataManager.BrickColors.set("brightyellowishgreen", BABYLON.Color3.FromInts(154, 202, 60));
        BrickDataManager.BrickColors.set("redishbrown", BABYLON.Color3.FromInts(105, 46, 20));
        BrickDataManager.BrickColors.set("nougat", BABYLON.Color3.FromInts(222, 139, 95));
        BrickDataManager.BrickColors.set("white", BABYLON.Color3.FromInts(244, 244, 244));

        BrickDataManager.BrickColors.forEach((color, name) => {
            BrickDataManager.BrickColorNames.push(name);
        });

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