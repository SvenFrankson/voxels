var ACTIVE_DEBUG_BRICK = true;

interface IPlayerData {
    position: IVec3;
    rX: number;
    rY: number;
    playerActionManager: IPlayerActionManagerData
}

class Player extends BABYLON.Mesh {

    public static DEBUG_INSTANCE: Player;

    public inventory: Inventory;

    public speed: number = 5;

    public camVario: number = 1.6;
    public camSensitivity: number = 1;
    public camSmoothness = 0.5;
    public camMaxSpeed: number = 1200; // in mouse pixels per second
    
    public camXVelocity: number = 0;
    public camYVelocity: number = 0;
    
    public targetRX: number = 0;
    public targetRY: number = 0;

    public pointerDX: number = 0;
    public pointerDY: number = 0;

    private _downVelocity: number = 0;

    public playerActionManager: PlayerActionManager;
    public currentAction: PlayerAction;

    private _aimedObject: Brick;

    public areNearChunckReady: boolean = false;

    constructor() {
        super("player");
        this.playerActionManager = new PlayerActionManager(this);
        // debug
        //BABYLON.VertexData.CreateSphere({ diameter: 1}).applyToMesh(this);
        Player.DEBUG_INSTANCE = this;
    }

    public get aimedObject(): Brick {
        return this._aimedObject;
    }

    public setAimedObject(b: Brick) {
        if (b === this._aimedObject) {
            return;
        }
        if (this._aimedObject) {
            if (ACTIVE_DEBUG_BRICK) {
                this._aimedObject.hideDebug();
            }
        }
        this._aimedObject = b;
        if (this._aimedObject) {
            if (ACTIVE_DEBUG_BRICK) {
                this._aimedObject.showDebug();
            }
        }
    }

    public register(brickMode: boolean = false): void {
        this.playerActionManager.initialize();

        if (brickMode) {
            Main.Scene.onBeforeRenderObservable.add(this.updateBrickMode);
        }
        else {
            Main.Scene.onBeforeRenderObservable.add(this.update);
        }

        Main.Canvas.addEventListener("keyup", (e) => {
            if (this.currentAction) {
                if (this.currentAction.onKeyUp) {
                    this.currentAction.onKeyUp(e);
                }
            }
        });

        Main.InputManager.addMappedKeyDownListener(KeyInput.JUMP, () => {
            this._downVelocity = - 0.15;
        })
        
        Main.Canvas.addEventListener("keydown", (e) => {
            if (this.currentAction) {
                if (this.currentAction.onKeyDown) {
                    this.currentAction.onKeyDown(e);
                }
            }
        });

        Main.Canvas.addEventListener("pointermove", (e) => {
            if (document.pointerLockElement) {
                this.pointerDX += e.movementX;
                this.pointerDY += e.movementY;
            }
        });

        Main.Canvas.addEventListener("pointerup", (e) => {
            if (this.currentAction) {
                if (this.currentAction.onClick) {
                    this.currentAction.onClick();
                }
            }
            else {
                if (e.button === 0) {
                    this.takeBrick();
                }
                else if (e.button === 2) {
                    this.storeBrick();
                }
            }
        });

        Main.Canvas.onwheel = (e: WheelEvent) => {
            if (this.currentAction) {
                if (this.currentAction.onWheel) {
                    this.currentAction.onWheel(e);
                }
            }
        };

        document.getElementById("player-actions").style.display = "block";
    }

    public checkPause(): void {
        if (!document.pointerLockElement) {
            if (this.currentAction) {
                if (this.currentAction.onUnequip) {
                    this.currentAction.onUnequip();
                }
                this.currentAction = undefined;
            }
        }
    }

    public async storeBrick(): Promise<Brick> {
        if (this.aimedObject && this.aimedObject instanceof Brick) {
            this.aimedObject.chunck.removeBrick(this.aimedObject);
            await this.aimedObject.chunck.updateBricks();
            return this.aimedObject;
        }
    }

    public async takeBrick(): Promise<boolean> {
        let brick = await this.storeBrick();
        let r = brick.r;
        if (brick) {
            this.currentAction = await PlayerActionTemplate.CreateBrickAction(
                brick.reference,
                () => {
                    if (this.currentAction.onUnequip) {
                        this.currentAction.onUnequip();
                    }
                    this.currentAction = undefined;
                }
            );
            this.currentAction.r = brick.r;
            return true;
        }
        return false;
    }

    public update = () => {
        this.checkPause();

        if (!this.areNearChunckReady) {
            let o = ChunckUtils.WorldPositionToChunckBlockCoordinates_V2(this.position);
            console.log(o);
            if (o.chunck) {
                this.areNearChunckReady = true;
            }
            return;
        }

        let right = this.getDirection(BABYLON.Axis.X);
        let forward = this.getDirection(BABYLON.Axis.Z);
        let dt = this.getEngine().getDeltaTime() / 1000;

        if (Main.InputManager.isKeyInputDown(KeyInput.MOVE_FORWARD)) {
            this.position.addInPlace(forward.scale( this.speed * dt)); 
        }
        if (Main.InputManager.isKeyInputDown(KeyInput.MOVE_LEFT)) {
            this.position.addInPlace(right.scale(-  this.speed * dt)); 
        }
        if (Main.InputManager.isKeyInputDown(KeyInput.MOVE_BACK)) {
            this.position.addInPlace(forward.scale(- this.speed * dt)); 
        }
        if (Main.InputManager.isKeyInputDown(KeyInput.MOVE_RIGHT)) {
            this.position.addInPlace(right.scale( this.speed * dt)); 
        }
        this.position.y -= this._downVelocity;
        this._downVelocity += 0.1 * dt;
        this._downVelocity *= 0.99;

        let maxSpeed = this.camMaxSpeed * dt;
        let pDX = this.pointerDX;
        if (Math.abs(this.pointerDX) > maxSpeed) {
            pDX = Math.sign(this.pointerDX) * maxSpeed;
        }
        this.targetRY += Math.sign(pDX) * Math.pow(Math.abs(pDX), this.camVario) * this.camSensitivity / 1000;
        this.pointerDX = 0;
        this.rotation.y = this.rotation.y * (1 - this.camSmoothness) + this.targetRY * this.camSmoothness;
        //this.rotation.y = Math2D.Step(this.rotation.y, this.targetRY, 4 * Math.PI * dt);

        if (Main.Camera instanceof BABYLON.FreeCamera) {
            let pDY = this.pointerDY;
            if (Math.abs(this.pointerDY) > maxSpeed) {
                pDY = Math.sign(this.pointerDY) * maxSpeed;
            }
            this.targetRX += Math.sign(pDY) * Math.pow(Math.abs(pDY), this.camVario) * this.camSensitivity / 1000;
            this.targetRX = Math.min(Math.max(this.targetRX, - Math.PI / 2 + Math.PI / 60), Math.PI / 2  - Math.PI / 60);
            this.pointerDY = 0;
            Main.Camera.rotation.x = Main.Camera.rotation.x * (1 - this.camSmoothness) + this.targetRX * this.camSmoothness;
            //Main.Camera.rotation.x = Math2D.Step(Main.Camera.rotation.x, this.targetRX, 4 * Math.PI * dt);
        }
        
        
        ChunckUtils.WorldPositionToChuncks(this.position).forEach(
            (chunck) => {
                let intersections = Intersections3D.SphereChunck(this.position, 0.5, chunck);
                if (intersections) {
                    for (let j = 0; j < intersections.length; j++) {
                        let d = this.position.subtract(intersections[j].point);
                        let l = d.length();
                        d.normalize();
                        if (d.y > 0.8) {
                            this._downVelocity = 0.0;
                        }
                        d.scaleInPlace((0.5 - l) * 0.5);
                        this.position.addInPlace(d);
                    }
                }
            }
        );

        if (this.currentAction) {
            if (this.currentAction.onUpdate) {
                this.currentAction.onUpdate();
            }
        }
        else {
            let aimed: Brick;
            let x = Main.Engine.getRenderWidth() * 0.5;
            let y = Main.Engine.getRenderHeight() * 0.5;
            let pickInfo = ChunckUtils.ScenePickAround(this.position, x, y);
            if (pickInfo && pickInfo.pickedMesh) {
                let chunck = pickInfo.pickedMesh.parent;
                if (chunck instanceof Chunck_V2) {
                    let brick = chunck.bricks.find(b => { return b.mesh === pickInfo.pickedMesh });
                    if (brick) {
                        aimed = brick;
                    }
                }
            }
            this.setAimedObject(aimed);
        }
    }

    public updateBrickMode = () => {
        let right = this.getDirection(BABYLON.Axis.X);
        let forward = this.getDirection(BABYLON.Axis.Z);
        
        if (Main.InputManager.isKeyInputDown(KeyInput.MOVE_FORWARD)) {
            this.position.addInPlace(forward.scale(0.08));
        }
        if (Main.InputManager.isKeyInputDown(KeyInput.MOVE_LEFT)) {
            this.position.addInPlace(right.scale(- 0.08));
        }
        if (Main.InputManager.isKeyInputDown(KeyInput.MOVE_BACK)) {
            this.position.addInPlace(forward.scale(- 0.08));
        }
        if (Main.InputManager.isKeyInputDown(KeyInput.MOVE_RIGHT)) {
            this.position.addInPlace(right.scale(0.08));
        }
        
        let ray = new BABYLON.Ray(this.position, new BABYLON.Vector3(0, - 1, 0));
        let pick = Main.Scene.pickWithRay(
            ray,
            (mesh) => {
                return mesh instanceof Tile;
            }
        );
        if (pick.hit) {
            let y = Math.floor((pick.pickedPoint.y + 0.01) / DY) * DY + 1;
            this.position.y *= 0.5;
            this.position.y += y * 0.5;
        }

        if (this.currentAction) {
            if (this.currentAction.onUpdate) {
                this.currentAction.onUpdate();
            }
        }
    }

    public serialize(): IPlayerData {
        let data: IPlayerData = {
            position: { x: this.position.x, y: this.position.y, z: this.position.z },
            rX: (Main.Camera as BABYLON.FreeCamera).rotation.x,
            rY: this.rotation.y,
            playerActionManager: this.playerActionManager.serialize()
        };
        console.log(data);
        return data;
    }

    public deserialize(data: IPlayerData): void {
        this.position.x = data.position.x;
        this.position.y = data.position.y;
        this.position.z = data.position.z;
        (Main.Camera as BABYLON.FreeCamera).rotation.x = data.rX;
        this.targetRX = data.rX;
        this.rotation.y = data.rY;
        this.targetRY = data.rY;
        this.playerActionManager.deserialize(data.playerActionManager);
    }

    // Debug
    public static DEBUG_CurrentChunck(): Chunck {
        return ChunckUtils.WorldPositionToChunckBlockCoordinates_V2(Player.DEBUG_INSTANCE.position).chunck;
    }
}