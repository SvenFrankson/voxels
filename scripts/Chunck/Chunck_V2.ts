/// <reference path="./Chunck.ts"/>

var CHUNCK_SIZE = 8;
var DX_PER_CHUNCK = CHUNCK_SIZE * 2;
var DY_PER_CHUNCK = CHUNCK_SIZE * 3;

var ACTIVE_DEBUG_CHUNCK = false;
var ACTIVE_DEBUG_CHUNCK_LOCK = false;
var ACTIVE_DEBUG_SPLIT_CHUNCKS = false;

class Chunck_V2 extends Chunck {

    private _barycenter: BABYLON.Vector3 = BABYLON.Vector3.Zero();

    public bricks: Brick[] = [];
    public brickMeshes: BABYLON.Mesh[] = [];

    private _locks: Brick[][][] = [];

    private _debugText: DebugText3D;
    private _debugOrigin: DebugCross;
    private _debugBox: DebugBox;
    private _debugLocks: DebugCrosses;

    constructor(
        manager: ChunckManager,
        i: number,
        j: number,
        k: number
    ) {
        super(manager, i, j, k);
        this.name = "chunck_v2_" + i + "_" + j + "_" + k;

        this.position.x = CHUNCK_SIZE * this.i * 1.6;
        this.position.y = CHUNCK_SIZE * this.j * 0.96;
        this.position.z = CHUNCK_SIZE * this.k * 1.6;

        this._barycenter.copyFrom(this.position);
        this._barycenter.x += CHUNCK_SIZE * 1.6 * 0.5;
        this._barycenter.y += CHUNCK_SIZE * 0.96 * 0.5;
        this._barycenter.z += CHUNCK_SIZE * 1.6 * 0.5;

        if (ACTIVE_DEBUG_SPLIT_CHUNCKS) {
            this.scaling.copyFromFloats(0.995, 0.995, 0.995);
        }

        this.material = Main.terrainCellShadingMaterial;
    }

    public get barycenter(): BABYLON.Vector3 {
        return this._barycenter;
    }

    public async canAddBrick(brick: Brick): Promise<boolean> {
        let data = await BrickDataManager.GetBrickData(brick.reference);
        let locks = data.getLocks(brick.r);
        for (let n = 0; n < locks.length / 3; n++) {
            let ii = locks[3 * n];
            let jj = locks[3 * n + 1];
            let kk = locks[3 * n + 2];
            if (this.getLockSafe(brick.i + ii, brick.j + jj, brick.k + kk)) {
                return false;
            }
        }
        return true;
    }

    public canAddBrickDataAt(data: BrickData, i: number, j: number, k: number, r: number): boolean {
        let locks = data.getLocks(r);
        for (let n = 0; n < locks.length / 3; n++) {
            let ii = locks[3 * n];
            let jj = locks[3 * n + 1];
            let kk = locks[3 * n + 2];
            if (this.getLockSafe(i + ii, j + jj, k + kk)) {
                return false;
            }
        }
        return true;
    }

    public addBrick(brick: Brick): void {
        let i = this.bricks.indexOf(brick);
        if (i === -1) {
            this.bricks.push(brick);
            brick.chunck = this;
        }
    }

    public async addBrickSafe(brick: Brick): Promise<boolean> {
        if (await this.canAddBrick(brick)) {
            this.addBrick(brick);
            return true;
        }
        return false;
    }

    public removeBrick(brick: Brick): void {
        let index = this.bricks.indexOf(brick);
        if (index != -1) {
            this.bricks.splice(index, 1);
        }
    }

    public getLock(i: number, j: number, k: number): Brick {
        if (this._locks[i]) {
            if (this._locks[i][j]) {
                return this._locks[i][j][k];
            }
        }
    }

    public getLockSafe(i: number, j: number, k: number): Brick {
        return this.manager.getChunckLock(this, i, j, k);
    }

    public setLock(i: number, j: number, k: number, brick?: Brick): void {
        if (brick) {
            if (!this._locks[i]) {
                this._locks[i] = [];
            } 
            if (!this._locks[i][j]) {
                this._locks[i][j] = [];
            } 
            this._locks[i][j][k] = brick;
        }
        else {
            if (this._locks[i]) {
                if (this._locks[j]) {
                    this._locks[i][j][k] = undefined;
                }
            }
        }
    }

    public setLockSafe(i: number, j: number, k: number, brick?: Brick): void {
        return this.manager.setChunckLock(this, i, j, k, brick);
    }

    public static HasLoged: boolean = false;
    public async generate(): Promise<void> {
        let positions: number[] = [];
        let indices: number[] = [];
        let normals: number[] = [];
        let colors: number[] = [];

        for (let i = 0; i < CHUNCK_SIZE; i++) {
            for (let j = 0; j < CHUNCK_SIZE; j++) {
                for (let k = 0; k < CHUNCK_SIZE; k++) {
                    let c0 = this.getCube(i, j, k);
                    let c1 = this.getCube(i + 1, j, k);
                    let c2 = this.getCube(i + 1, j, k + 1);
                    let c3 = this.getCube(i, j, k + 1);
                    let c4 = this.getCube(i, j + 1, k);
                    let c5 = this.getCube(i + 1, j + 1, k);
                    let c6 = this.getCube(i + 1, j + 1, k + 1);
                    let c7 = this.getCube(i, j + 1, k + 1);
                    let ref = (c0 ? "1" : "0") + (c1 ? "1" : "0") + (c2 ? "1" : "0") + (c3 ? "1" : "0") + (c4 ? "1" : "0") + (c5 ? "1" : "0") + (c6 ? "1" : "0") + (c7 ? "1" : "0");

                    if (ref === "00000000" || ref === "11111111") {
                        continue;
                    }
                    
                    let data = ChunckVertexData.Get(ref);

                    if (data) {
                        let l = positions.length / 3;
                        for (let n = 0; n < data.positions.length / 3; n++) {
                            let x = data.positions[3 * n];
                            let y = data.positions[3 * n + 1];
                            let z = data.positions[3 * n + 2];
                            
                            positions.push(x + i * 1.6 + 0.8);
                            positions.push(y + j * 0.96);
                            positions.push(z + k * 1.6 + 0.8);
                            
                            let color0: BABYLON.Color4 = c0 ? c0.color : undefined;
                            let color1: BABYLON.Color4 = c1 ? c1.color : undefined;
                            let color2: BABYLON.Color4 = c2 ? c2.color : undefined;
                            let color3: BABYLON.Color4 = c3 ? c3.color : undefined;
                            let color4: BABYLON.Color4 = c4 ? c4.color : undefined;
                            let color5: BABYLON.Color4 = c5 ? c5.color : undefined;
                            let color6: BABYLON.Color4 = c6 ? c6.color : undefined;
                            let color7: BABYLON.Color4 = c7 ? c7.color : undefined;

                            let d = Infinity;
                            let color: BABYLON.Color4;
                            if (color0) {
                                if (x < 0 && y < 0 && z < 0) {
                                    colors.push(color0.r, color0.g, color0.b, color0.a);
                                    continue;  
                                }
                                let dd = x + 0.8 + y + 0.48 + z + 0.8;
                                if (dd < d) {
                                    d = dd;
                                    color = color0;
                                }
                            }
                            if (color1) {
                                if (x > 0 && y < 0 && z < 0) {
                                    colors.push(color1.r, color1.g, color1.b, color1.a);
                                    continue;  
                                }
                                let dd = 0.8 - x + y + 0.48 + z + 0.8;
                                if (dd < d) {
                                    d = dd;
                                    color = color1;
                                }
                            }
                            if (color3) {
                                if (x < 0 && y < 0 && z > 0) {
                                    colors.push(color3.r, color3.g, color3.b, color3.a);
                                    continue;  
                                }
                                let dd = x + 0.8 + y + 0.48 + 0.8 - z;
                                if (dd < d) {
                                    d = dd;
                                    color = color3;
                                }
                            }
                            if (color2) {
                                if (x > 0 && y < 0 && z > 0) {
                                    colors.push(color2.r, color2.g, color2.b, color2.a);
                                    continue;  
                                }
                                let dd = 0.8 - x + y + 0.48 + 0.8 - z;
                                if (dd < d) {
                                    d = dd;
                                    color = color2;
                                }
                            }
                            if (color4) {
                                if (x < 0 && y > 0 && z < 0) {
                                    colors.push(color4.r, color4.g, color4.b, color4.a);
                                    continue;  
                                }
                                let dd = x + 0.8 + 0.48 - y + z + 0.8;
                                if (dd < d) {
                                    d = dd;
                                    color = color4;
                                }
                            }
                            if (color5) {
                                if (x > 0 && y > 0 && z < 0) {
                                    colors.push(color5.r, color5.g, color5.b, color5.a);
                                    continue;  
                                }
                                let dd = 0.8 - x + 0.48 - y + z + 0.8;
                                if (dd < d) {
                                    d = dd;
                                    color = color5;
                                }
                            }
                            if (color7) {
                                if (x < 0 && y > 0 && z > 0) {
                                    colors.push(color7.r, color7.g, color7.b, color7.a);
                                    continue;  
                                }
                                let dd = x + 0.8 + 0.48 - y + 0.8 - z;
                                if (dd < d) {
                                    d = dd;
                                    color = color7;
                                }
                            }
                            if (color6) {
                                if (x > 0 && y > 0 && z > 0) {
                                    colors.push(color6.r, color6.g, color6.b, color6.a);
                                    continue;  
                                }
                                let dd = 0.8 - x + 0.48 - y + 0.8 - z;
                                if (dd < d) {
                                    d = dd;
                                    color = color6;
                                }
                            }

                            colors.push(color.r, color.g, color.b, color.a);
                        }
                        normals.push(...data.normals);
                        for (let n = 0; n < data.indices.length; n++) {
                            indices.push(data.indices[n] + l);
                        }
                        
                    }
                    else if (!Chunck_V2.HasLoged) {
                        console.warn("Missing ChunckPart : " + ref);
                        Chunck_V2.HasLoged = true;
                    }
                }
            }
        }

        let vertexData = new BABYLON.VertexData();
        vertexData.positions = positions;
        vertexData.indices = indices;
        vertexData.normals = normals;
        vertexData.colors = colors;

        vertexData.applyToMesh(this);

        this.updateBricks();

        if (ACTIVE_DEBUG_CHUNCK) {
            Main.AddOnUpdateDebugCallback(this._updateDebug);
        }
        if (ACTIVE_DEBUG_CHUNCK_LOCK) {
            Main.AddOnUpdateDebugCallback(this._updateDebugLock);
        }
    }

    private _updateDebug = () => {
        if (BABYLON.Vector3.DistanceSquared(this.barycenter, Main.Camera.globalPosition) < 1.5 * CHUNCK_SIZE * 1.6 * 1.5 * CHUNCK_SIZE * 1.6) {
            if (!this._debugText) {
                this._debugText = DebugText3D.CreateText("", this.position);
            }
            let text = "";
            text += "IJK : " + this.i + " " + this.j + " " + this.k + "<br>";
            this._debugText.setText(text);

            if (!this._debugOrigin) {
                this._debugOrigin = DebugCross.CreateCross(2, BABYLON.Color3.Red(), this.position);
            }

            if (!this._debugBox) {
                this._debugBox = DebugBox.CreateBox(CHUNCK_SIZE * 1.6 - 0.05, CHUNCK_SIZE * 0.96 - 0.05, CHUNCK_SIZE * 1.6 - 0.05, new BABYLON.Color4(0, 0, 1, 0.2), this.barycenter);
            }
        }
        else {
            if (this._debugText) {
                this._debugText.dispose();
                this._debugText = undefined;
            }
            if (this._debugOrigin) {
                this._debugOrigin.dispose();
                this._debugOrigin = undefined;
            }
            if (this._debugBox) {
                this._debugBox.dispose();
                this._debugBox = undefined;
            }
        }
    }
    
    private _updateDebugLock = () => {
        if (BABYLON.Vector3.DistanceSquared(this.barycenter, Main.Camera.globalPosition) < 1.5 * CHUNCK_SIZE * 1.6 * 1.5 * CHUNCK_SIZE * 1.6) {
            if (!this._debugLocks) {
                let positions: BABYLON.Vector3[] = [];
                for (let i = 0; i < this._locks.length; i++) {
                    if (this._locks[i]) {
                        for (let j = 0; j < this._locks[i].length; j++) {
                            if (this._locks[i][j]) {
                                for (let k = 0; k < this._locks[i][j].length; k++) {
                                    if (this._locks[i][j][k]) {
                                        positions.push(new BABYLON.Vector3(
                                            this.position.x + i * DX,
                                            this.position.y + j * DY + DY * 0.5,
                                            this.position.z + k * DX
                                        ));
                                    }
                                }
                            }
                        }
                    }
                }
                this._debugLocks = DebugCrosses.CreateCrosses(DX + 0.2, DY + 0.2, BABYLON.Color3.Magenta(), positions);
            }
        }
        else {
            if (this._debugLocks) {
                this._debugLocks.dispose();
                this._debugLocks = undefined;
            }
        }
    }

    public async updateBricks(): Promise<void> {
        while (this.brickMeshes.length > 0) {
            this.brickMeshes.pop().dispose();
        }
        for (let i = 0; i < this.bricks.length; i++) {
            let brick = this.bricks[i];
            let b = new BABYLON.Mesh("brick-" + i);
            brick.mesh = b;
            let vertexData = await BrickVertexData.GetFullBrickVertexData(brick.reference, Math.random(), Math.random(), Math.random() * 2 * Math.PI);
            vertexData.applyToMesh(b);
            b.position.copyFromFloats(brick.i * DX, brick.j * DY, brick.k * DX);
            b.rotation.y = Math.PI / 2 * brick.r;
            b.parent = this;
            b.material = Main.cellShadingMaterial;
            this.brickMeshes.push(b);
        }
        await this.updateLocks();
    }

    public async updateLocks(): Promise<void> {
        this._locks = [];
        for (let i = 0; i < this.bricks.length; i++) {
            let brick = this.bricks[i];
            let data = await BrickDataManager.GetBrickData(brick.reference);
            let locks = data.getLocks(brick.r);
            console.log(brick.reference.name);
            console.log(data);
            for (let n = 0; n < locks.length / 3; n++) {
                let ii = locks[3 * n];
                let jj = locks[3 * n + 1];
                let kk = locks[3 * n + 2];
                this.setLockSafe(brick.i + ii, brick.j + jj, brick.k + kk, brick);
            }
        }
        if (ACTIVE_DEBUG_CHUNCK_LOCK) {
            if (this._debugLocks) {
                this._debugLocks.dispose();
                this._debugLocks = undefined;
            }
        }
    }
}
