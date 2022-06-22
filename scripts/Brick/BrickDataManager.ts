class BrickData {

    private _rotatedLocks: number[][];

    constructor(
        public locks: number[] = [],
        public covers: number[] = []
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

    public static BrickColors: Map<BrickColor, BABYLON.Color4> = new Map<BrickColor, BABYLON.Color4>();
    public static BrickNames: string[] = [
        "plate-1x1",
        "plate-1x2",
        "plate-1x3",
        "plate-1x4",
        "plate-1x6",
        "plate-1x8",
        "plate-1x12",
        
        "plate-2x2",
        "plate-2x3",
        "plate-2x4",
        "plate-2x6",
        "plate-2x8",
        "plate-2x12",
        
        "plate-4x4",

        "brick-1x1",
        "brick-1x2",
        "brick-1x3",
        "brick-1x4",
        "brick-1x6",
        "brick-1x8",
        "brick-1x12",

        "plateCurb-2",
        "plateCurb-3",
        "plateCurb-4",

        "brickCurb-2",
        "brickCurb-3",
        "brickCurb-4",

        "pilar-2",
        "pilar-4",
    ];
    private static _BrickDatas: Map<string, BrickData> = new Map<string, BrickData>();

    private static async _LoadConstructBrickData(constructName: string): Promise<BrickData> {
        return new Promise<BrickData>(resolve => {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', "datas/constructs/" + constructName + ".json");
            xhr.onload = () => {
                let data = JSON.parse(xhr.responseText);
                
                let locks = [];
                let covers = [];
                if (data.locks) {
                    if (data.locks.min && data.locks.max) {
                        for (let i = data.locks.min[0]; i <= data.locks.max[0]; i++) {
                            for (let j = data.locks.min[1]; j <= data.locks.max[1]; j++) {
                                for (let k = data.locks.min[2]; k <= data.locks.max[2]; k++) {
                                    locks.push(i, j, k);
                                }
                            }
                        }
                    }
                    else {
                        locks = data.locks;
                    }
                }
                if (data.covers) {
                    if (data.covers === "locks") {
                        covers = locks;
                    }
                    if (data.covers.min && data.covers.max) {
                        for (let i = data.covers.min[0]; i <= data.covers.max[0]; i++) {
                            for (let j = data.covers.min[1]; j <= data.covers.max[1]; j++) {
                                for (let k = data.covers.min[2]; k <= data.covers.max[2]; k++) {
                                    covers.push(i, j, k);
                                }
                            }
                        }
                    }
                    else {
                        covers = data.covers;
                    }
                }
                let brickData = new BrickData(locks, covers);
                console.log(brickData);
                resolve(brickData);
            }
            xhr.send();
        });
    }

    public static async InitializeDataFromFile(): Promise<void> {
        return;
        return new Promise<void>(resolve => {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', "bricksData.json");
            xhr.onload = () => {
                let datas = JSON.parse(xhr.responseText);
                for (let brickName in datas) {
                    console.log(brickName);
                    let data = datas[brickName];
                    let locks = [];
                    let covers = [];
                    if (data.locks) {
                        if (data.locks.min && data.locks.max) {
                            for (let i = data.locks.min[0]; i <= data.locks.max[0]; i++) {
                                for (let j = data.locks.min[1]; j <= data.locks.max[1]; j++) {
                                    for (let k = data.locks.min[2]; k <= data.locks.max[2]; k++) {
                                        locks.push(i, j, k);
                                    }
                                }
                            }
                        }
                        else {
                            locks = data.locks;
                        }
                    }
                    if (data.covers) {
                        if (data.covers === "locks") {
                            covers = locks;
                        }
                        if (data.covers.min && data.covers.max) {
                            for (let i = data.covers.min[0]; i <= data.covers.max[0]; i++) {
                                for (let j = data.covers.min[1]; j <= data.covers.max[1]; j++) {
                                    for (let k = data.covers.min[2]; k <= data.covers.max[2]; k++) {
                                        covers.push(i, j, k);
                                    }
                                }
                            }
                        }
                        else {
                            covers = data.covers;
                        }
                    }
                    let brickData = new BrickData(locks, covers);
                    BrickDataManager._BrickDatas.set(brickName, brickData);
                    BrickDataManager.BrickNames.push(brickName);
                }
                resolve();
            }
            xhr.send();
        });
    }

    private static MakeCubeData(W: number, L: number, H: number): BrickData {
        let cubeData = new BrickData();
        for (let w = 0; w < W; w++) {
            for (let l = 0; l < L; l++) {
                for (let h = 0; h < H; h++) {
                    cubeData.locks.push(w, h, l);
                    cubeData.covers.push(w, h, l);
                }
            }
        }
        cubeData.computeRotatedLocks();

        return cubeData;
    }

    private static MakeCurbData(W: number, H: number): BrickData {
        let curbData = new BrickData();

        for (let h = 0; h < H; h++) {
            curbData.locks.push(0, h, 0);
            curbData.locks.push(W - 1, h, W - 1);

            curbData.covers.push(0, h, 0);
            curbData.covers.push(W - 1, h, W - 1);
        }
        
        curbData.computeRotatedLocks();

        return curbData;
    }

    public static InitializeProceduralData(): void {
        //BrickDataManager.BrickColors.set("brightyellow", BABYLON.Color4.FromInts(255, 205, 3, 255));
        //BrickDataManager.BrickColors.set("brightorange", BABYLON.Color4.FromInts(245, 125, 32, 255));
        //BrickDataManager.BrickColors.set("brightred", BABYLON.Color4.FromInts(221, 26, 33, 255));
        //BrickDataManager.BrickColors.set("brightpurple", BABYLON.Color4.FromInts(233, 93, 162, 255));
        //BrickDataManager.BrickColors.set("brightblue", BABYLON.Color4.FromInts(0, 108, 183, 255));
        //BrickDataManager.BrickColors.set("brightbluetransparent", BABYLON.Color4.FromInts(0, 108, 183, 192));
        //BrickDataManager.BrickColors.set("darkazur", BABYLON.Color4.FromInts(0, 163, 218, 255));
        //BrickDataManager.BrickColors.set("yellowishgreen", BABYLON.Color4.FromInts(204, 225, 151, 255));
        //BrickDataManager.BrickColors.set("brightgreen", BABYLON.Color4.FromInts(0, 175, 77, 255));
        //BrickDataManager.BrickColors.set("brightyellowishgreen", BABYLON.Color4.FromInts(154, 202, 60, 255));
        //BrickDataManager.BrickColors.set("redishbrown", BABYLON.Color4.FromInts(105, 46, 20, 255));
        //BrickDataManager.BrickColors.set("nougat", BABYLON.Color4.FromInts(222, 139, 95, 255));
        BrickDataManager.BrickColors.set(BrickColor.White, BABYLON.Color4.FromInts(244, 244, 244, 255));
        BrickDataManager.BrickColors.set(BrickColor.Gray, BABYLON.Color4.FromInts(180, 180, 180, 255));
        BrickDataManager.BrickColors.set(BrickColor.Red, BABYLON.Color4.FromInts(255, 0, 0, 255));
        BrickDataManager.BrickColors.set(BrickColor.Green, BABYLON.Color4.FromInts(0, 255, 0, 255));
        BrickDataManager.BrickColors.set(BrickColor.Blue, BABYLON.Color4.FromInts(0, 0, 255, 255));
        //BrickDataManager.BrickColors.set("black", BABYLON.Color4.FromInts(50, 52, 51, 255));

        let plateNames = BrickDataManager.BrickNames.filter(name => { return name.startsWith("plate-"); });
        for (let i = 0; i < plateNames.length; i++) {
            let plateName = plateNames[i];
            let size = plateName.split("-")[1];
            let W = parseInt(size.split("x")[0]);
            let L = parseInt(size.split("x")[1]);

            BrickDataManager._BrickDatas.set(plateName, BrickDataManager.MakeCubeData(W, L, 1));
        }

        let brickNames = BrickDataManager.BrickNames.filter(name => { return name.startsWith("brick-"); });
        for (let i = 0; i < brickNames.length; i++) {
            let brickName = brickNames[i];
            let size = brickName.split("-")[1];
            let W = parseInt(size.split("x")[0]);
            let L = parseInt(size.split("x")[1]);

            BrickDataManager._BrickDatas.set(brickName, BrickDataManager.MakeCubeData(W, L, 3));
            console.log(BrickDataManager._BrickDatas.get(brickName));
        }

        let pilarNames = BrickDataManager.BrickNames.filter(name => { return name.startsWith("pilar-"); });
        for (let i = 0; i < pilarNames.length; i++) {
            let pilarName = pilarNames[i];
            let H = parseInt(pilarName.split("-")[1]);

            BrickDataManager._BrickDatas.set(pilarName, BrickDataManager.MakeCubeData(1, 1, H * 3));
        }

        let plateCurbs = BrickDataManager.BrickNames.filter(name => { return name.startsWith("plateCurb-"); });
        for (let i = 0; i < plateCurbs.length; i++) {
            let brickName = plateCurbs[i];
            let W = parseInt(brickName.split("-")[1]);

            BrickDataManager._BrickDatas.set(brickName, BrickDataManager.MakeCurbData(W, 1));
        }

        let brickCurbs = BrickDataManager.BrickNames.filter(name => { return name.startsWith("brickCurb-"); });
        for (let i = 0; i < brickCurbs.length; i++) {
            let brickName = brickCurbs[i];
            let W = parseInt(brickName.split("-")[1]);

            BrickDataManager._BrickDatas.set(brickName, BrickDataManager.MakeCurbData(W, 3));
        }
        /*
        let LValues = [];
        let WValues = [];
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
                            for (let h = 0; h < 3; h++) {
                                brickData.locks.push(w, h, l);
                                brickData.covers.push(w, h, l);
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
                            tileData.locks.push(w, 0, l);
                            tileData.covers.push(w, 0, l);
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
                            plateData.locks.push(w, 0, l);
                            plateData.covers.push(w, 0, l);
                        }
                    }
                    plateData.computeRotatedLocks();
                    BrickDataManager._BrickDatas.set(plateName, plateData);
                    BrickDataManager.BrickNames.push(plateName);
                    
                    plateData = new BrickData();
                    plateName = "plate-4x4";
                    for (let w = 0; w < 4; w++) {
                        for (let l = 0; l < 4; l++) {
                            plateData.locks.push(w, 0, l);
                            plateData.covers.push(w, 0, l);
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
            locks,
            []
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
            locks,
            []
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
                        for (let w = 0; w < W; w++) {
                            for (let h = 0; h < H * 3; h++) {
                                brickData.locks.push(w, h, l);
                                brickData.covers.push(w, h, l);
                            }
                        }
                    }
                    brickData.computeRotatedLocks();
                    BrickDataManager._BrickDatas.set(brickName, brickData);
                    BrickDataManager.BrickNames.push(brickName);
                }
            }
        }

        // PlateCurb
        for (let S = 2; S <= 10; S++) {
            let plateCurbData = new BrickData();
            let plateCurbName = "plateCurb-" + S + "x" + S;
            
            plateCurbData.locks.push(0, 0, 0);
            plateCurbData.locks.push(S - 1, 0, S - 1);
            
            plateCurbData.covers.push(0, 0, 0);
            plateCurbData.covers.push(S - 1, 0, S - 1);
            
            plateCurbData.computeRotatedLocks();
            BrickDataManager._BrickDatas.set(plateCurbName, plateCurbData);
            BrickDataManager.BrickNames.push(plateCurbName);
        }

        // TileCurb
        for (let S = 2; S <= 10; S++) {
            let tileCurbData = new BrickData();
            let tileCurbName = "tileCurb-" + S + "x" + S;
            
            tileCurbData.locks.push(0, 0, 0);
            tileCurbData.locks.push(S - 1, 0, S - 1);
            
            tileCurbData.covers.push(0, 0, 0);
            tileCurbData.covers.push(S - 1, 0, S - 1);
            
            tileCurbData.computeRotatedLocks();
            BrickDataManager._BrickDatas.set(tileCurbName, tileCurbData);
            BrickDataManager.BrickNames.push(tileCurbName);
        }

        // BrickCurb
        for (let S = 2; S <= 10; S++) {
            let brickCurbData = new BrickData();
            let brickCurbName = "brickCurb-" + S + "x" + S;

            for (let h = 0; h < 3; h++) {
                brickCurbData.locks.push(0, h, 0);
                brickCurbData.locks.push(S - 1, h, S - 1);

                brickCurbData.covers.push(0, h, 0);
                brickCurbData.covers.push(S - 1, h, S - 1);
            }
            
            brickCurbData.computeRotatedLocks();
            BrickDataManager._BrickDatas.set(brickCurbName, brickCurbData);
            BrickDataManager.BrickNames.push(brickCurbName);
        }
        */
    }

    public static async GetBrickData(brickReference: IBrickReference): Promise<BrickData> {
        if (brickReference.name.startsWith("construct_")) {
            if (!BrickDataManager._BrickDatas.get(brickReference.name)) {
                let constructName = brickReference.name.replace("construct_", "");
                let data = await BrickDataManager._LoadConstructBrickData(constructName);
                BrickDataManager._BrickDatas.set(brickReference.name, data);
            }
        }
        return BrickDataManager._BrickDatas.get(brickReference.name);
    }
}