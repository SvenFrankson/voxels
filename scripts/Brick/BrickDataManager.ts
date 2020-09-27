class BrickData {

    private _rotatedLocks: number[][];

    constructor(
        public knobs: number[] = [],
        public covers: number[] = [],
        public locks: number[] = []
    ) {
        this.computeRotatedLocks();
    }

    public computeRotatedLocks(): void {
        this._rotatedLocks = [[], [], [], []];
        for (let i = 0; i < this.locks.length; i++) {
            this._rotatedLocks[0][i] = this.locks[i];
        }
        for (let i = 0; i < this.locks.length / 3; i++) {
            this._rotatedLocks[1][3 * i] = this.locks[3 * i + 2];
            this._rotatedLocks[1][3 * i + 1] = this.locks[3 * i + 1];
            this._rotatedLocks[1][3 * i + 2] = - this.locks[3 * i];
        }
        for (let i = 0; i < this.locks.length / 3; i++) {
            this._rotatedLocks[2][3 * i] = - this.locks[3 * i];
            this._rotatedLocks[2][3 * i + 1] = this.locks[3 * i + 1];
            this._rotatedLocks[2][3 * i + 2] = - this.locks[3 * i + 2];
        }
        for (let i = 0; i < this.locks.length / 3; i++) {
            this._rotatedLocks[3][3 * i] = - this.locks[3 * i + 2];
            this._rotatedLocks[3][3 * i + 1] = this.locks[3 * i + 1];
            this._rotatedLocks[3][3 * i + 2] = this.locks[3 * i];
        }
    }

    public getLocks(direction: number): number[] {
        return this._rotatedLocks[direction];
    }

    public get minBlockX(): number {
        let min = Infinity;
        for (let i = 0; i < this.locks.length; i += 3) {
            min = Math.min(this.locks[i], min);
        } 
        return min;
    }

    public get maxBlockX(): number {
        let max = - Infinity;
        for (let i = 0; i < this.locks.length; i += 3) {
            max = Math.max(this.locks[i], max);
        } 
        return max;
    }

    public get minBlockY(): number {
        let min = Infinity;
        for (let i = 1; i < this.locks.length; i += 3) {
            min = Math.min(this.locks[i], min);
        } 
        return min;
    }

    public get maxBlockY(): number {
        let max = - Infinity;
        for (let i = 1; i < this.locks.length; i += 3) {
            max = Math.max(this.locks[i], max);
        } 
        return max;
    }

    public get minBlockZ(): number {
        let min = Infinity;
        for (let i = 2; i < this.locks.length; i += 3) {
            min = Math.min(this.locks[i], min);
        } 
        return min;
    }

    public get maxBlockZ(): number {
        let max = - Infinity;
        for (let i = 2; i < this.locks.length; i += 3) {
            max = Math.max(this.locks[i], max);
        } 
        return max;
    }
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
        BrickDataManager.BrickColors.set("black", BABYLON.Color4.FromInts(50, 52, 51, 255));

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
                            for (let h = 0; h < 3; h++) {
                                brickData.covers.push(w, h, l);
                                brickData.locks.push(w, h, l);
                            }
                        }
                    }
                    brickData.computeRotatedLocks();
                    BrickDataManager._BrickDatas.set(brickName, brickData);
                    BrickDataManager.BrickNames.push(brickName);
    
                    // Tile
                    let tileData = new BrickData();
                    let tileName = "tile-" + W + "x" + L;
                    for (let w = 0; w < W; w++) {
                        for (let l = 0; l < L; l++) {
                            tileData.covers.push(w, 0, l);
                            tileData.locks.push(w, 0, l);
                        }
                    }
                    tileData.computeRotatedLocks();
                    BrickDataManager._BrickDatas.set(tileName, tileData);
                    BrickDataManager.BrickNames.push(tileName);
    
                    // Plate
                    let plateData = new BrickData();
                    let plateName = "plate-" + W + "x" + L;
                    for (let w = 0; w < W; w++) {
                        for (let l = 0; l < L; l++) {
                            plateData.knobs.push(w, 1, l);
                            plateData.covers.push(w, 0, l);
                            plateData.locks.push(w, 0, l);
                        }
                    }
                    plateData.computeRotatedLocks();
                    BrickDataManager._BrickDatas.set(plateName, plateData);
                    BrickDataManager.BrickNames.push(plateName);
                    
                    plateData = new BrickData();
                    plateName = "plate-4x4";
                    for (let w = 0; w < 4; w++) {
                        for (let l = 0; l < 4; l++) {
                            plateData.knobs.push(w, 1, l);
                            plateData.covers.push(w, 0, l);
                            plateData.locks.push(w, 0, l);
                        }
                    }
                    plateData.computeRotatedLocks();
                    BrickDataManager._BrickDatas.set(plateName, plateData);
                    BrickDataManager.BrickNames.push(plateName);
                }
            }
        }

        let locks = [];
        for (let w = 0; w < 6; w++) {
            for (let l = 0; l < 2; l++) {
                for (let h = 0; h < 6; h++) {
                    locks.push(w, h, l);
                }
            }
        }
        BrickDataManager.BrickNames.push("windshield-6x2x2");
        BrickDataManager._BrickDatas.set("windshield-6x2x2", new BrickData(
            [0, 6, 0, 1, 6, 0, 2, 6, 0, 3, 6, 0, 4, 6, 0, 5, 6, 0],
            [],
            locks
        ));

        locks = [];
        for (let w = 0; w < 6; w++) {
            for (let l = 0; l < 2; l++) {
                for (let h = 0; h < 9; h++) {
                    locks.push(w, h, l);
                }
            }
        }
        BrickDataManager.BrickNames.push("windshield-6x3x2");
        BrickDataManager._BrickDatas.set("windshield-6x3x2", new BrickData(
            [0, 9, 0, 1, 9, 0, 2, 9, 0, 3, 9, 0, 4, 9, 0, 5, 9, 0],
            [],
            locks
        ));

        let slopeLValues = [1, 2, 4, 6, 8];
        let slopeWValues = [2, 4];
        let slopeHValues = [1, 2, 4];
        for (let i = 0; i < slopeLValues.length; i++) {
            let L = slopeLValues[i];
            for (let j = 0; j < slopeWValues.length; j++) {
                let W = slopeWValues[j];
                for (let k = 0; k < slopeHValues.length; k++) {
                    let H = slopeHValues[k];
                    // Slope
                    let brickData = new BrickData();
                    let brickName = "slope" + H + "-" + W + "x" + L;
                    for (let l = 0; l < L; l++) {
                        brickData.knobs.push(W - 1, H * 3, l);
                        for (let w = 0; w < W; w++) {
                            for (let h = 0; h < H * 3; h++) {
                                brickData.covers.push(w, h, l);
                                brickData.locks.push(w, h, l);
                            }
                        }
                    }
                    brickData.computeRotatedLocks();
                    BrickDataManager._BrickDatas.set(brickName, brickData);
                    BrickDataManager.BrickNames.push(brickName);
                }
            }
        }
    }

    public static GetBrickData(brickReference: IBrickReference): BrickData {
        return BrickDataManager._BrickDatas.get(brickReference.name);
    }
}