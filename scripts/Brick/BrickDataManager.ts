class BrickData {

    public knobs: number[] = [];
    public covers: number[] = [];
    public blocks: number[] = [];
}

class BrickDataManager {

    public static BrickColorNames: string[] = [];
    public static BrickColors: Map<string, BABYLON.Color4> = new Map<string, BABYLON.Color4>();
    public static BrickNames: string[] = [];
    private static _BrickDatas: Map<string, BrickData> = new Map<string, BrickData>();

    public static InitializeData(): void {
        BrickDataManager.BrickColors.set("brightyellow", BABYLON.Color4.FromInts(255, 205, 3, 255));
        BrickDataManager.BrickColors.set("brightorange", BABYLON.Color4.FromInts(245, 125, 32, 255));
        BrickDataManager.BrickColors.set("brightred", BABYLON.Color4.FromInts(221, 26, 33, 255));
        BrickDataManager.BrickColors.set("brightpurple", BABYLON.Color4.FromInts(233, 93, 162, 255));
        BrickDataManager.BrickColors.set("brightblue", BABYLON.Color4.FromInts(0, 108, 183, 255));
        BrickDataManager.BrickColors.set("brightbluetransparent", BABYLON.Color4.FromInts(0, 108, 183, 192));
        BrickDataManager.BrickColors.set("darkazur", BABYLON.Color4.FromInts(0, 163, 218, 255));
        BrickDataManager.BrickColors.set("yellowishgreen", BABYLON.Color4.FromInts(204, 225, 151, 255));
        BrickDataManager.BrickColors.set("brightgreen", BABYLON.Color4.FromInts(0, 175, 77, 255));
        BrickDataManager.BrickColors.set("brightyellowishgreen", BABYLON.Color4.FromInts(154, 202, 60, 255));
        BrickDataManager.BrickColors.set("redishbrown", BABYLON.Color4.FromInts(105, 46, 20, 255));
        BrickDataManager.BrickColors.set("nougat", BABYLON.Color4.FromInts(222, 139, 95, 255));
        BrickDataManager.BrickColors.set("white", BABYLON.Color4.FromInts(244, 244, 244, 255));

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

        BrickDataManager.BrickNames.push("windshield-6x2x2");
        BrickDataManager._BrickDatas.set("windshield-6x2x2", {
            knobs: [0, 6, 0, 1, 6, 0, 2, 6, 0, 3, 6, 0, 4, 6, 0, 5, 6, 0],
            covers: [],
            blocks: []
        });
        BrickDataManager.BrickNames.push("windshield-6x3x2");
        BrickDataManager._BrickDatas.set("windshield-6x3x2", {
            knobs: [0, 9, 0, 1, 9, 0, 2, 9, 0, 3, 9, 0, 4, 9, 0, 5, 9, 0],
            covers: [],
            blocks: []
        });
    }

    public static GetBrickData(brickReference: IBrickReference): BrickData {
        return BrickDataManager._BrickDatas.get(brickReference.name);
    }
}