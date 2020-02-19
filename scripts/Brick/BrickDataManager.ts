class BrickData {

    public knobs: number[];
    public covers: number[];
    public blocks: number[];
}

class BrickDataManager {

    private static _BrickDatas: Map<string, BrickData> = new Map<string, BrickData>();

    public static InitializeData(): void {
        BrickDataManager._BrickDatas.set("brick-1x1", {
            knobs: [0, 3, 0],
            covers: [0, 0, 0, 0, 1, 0, 0, 2, 0],
            blocks: [0, 0, 0, 0, 1, 0, 0, 2, 0]
        });
        BrickDataManager._BrickDatas.set("brick-1x2", {
            knobs: [0, 3, 0, 0, 3, 1],
            covers: [0, 0, 0, 0, 1, 0, 0, 2, 0],
            blocks: [0, 0, 0, 0, 1, 0, 0, 2, 0]
        });
        BrickDataManager._BrickDatas.set("brick-1x4", {
            knobs: [0, 3, 0, 0, 3, 1, 0, 3, 2, 0, 3, 3],
            covers: [0, 0, 0, 0, 1, 0, 0, 2, 0],
            blocks: [0, 0, 0, 0, 1, 0, 0, 2, 0]
        });
    }

    public static GetBrickData(brickReference: IBrickReference): BrickData {
        return BrickDataManager._BrickDatas.get(brickReference.name);
    }
}