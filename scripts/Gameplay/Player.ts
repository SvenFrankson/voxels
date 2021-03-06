var ACTIVE_DEBUG_BRICK = true;

class Player extends BABYLON.Mesh {

    private _inputLeft: boolean = false;
    private _inputRight: boolean = false;
    private _inputBack: boolean = false;
    private _inputForward: boolean = false;

    private _downSpeed: number = 0;

    public playerActionManager: PlayerActionManager;
    public currentAction: PlayerAction;

    private _aimedObject: Brick;

    constructor() {
        super("player");
        this.playerActionManager = new PlayerActionManager(this);
        // debug
        //BABYLON.VertexData.CreateSphere({ diameter: 1}).applyToMesh(this);
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
        this.playerActionManager.register();

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
            
            if (e.keyCode === 81) {
                this._inputLeft = false;
            }
            else if (e.keyCode === 68) {
                this._inputRight = false;
            }
            else if (e.keyCode === 83) {
                this._inputBack = false;
            }
            else if (e.keyCode === 90) {
                this._inputForward = false;
            }
            else if (e.keyCode === 32) {
                this._downSpeed = -0.15;
            }
        });
        
        Main.Canvas.addEventListener("keydown", (e) => {
            if (this.currentAction) {
                if (this.currentAction.onKeyDown) {
                    this.currentAction.onKeyDown(e);
                }
            }

            if (e.keyCode === 81) {
                this._inputLeft = true;
            }
            else if (e.keyCode === 68) {
                this._inputRight = true;
            }
            else if (e.keyCode === 83) {
                this._inputBack = true;
            }
            else if (e.keyCode === 90) {
                this._inputForward = true;
            }
        });

        let smoothnessX: number = 3;
        let smoothnessXFactor: number = 1 / smoothnessX;
        let smoothnessY: number = 3;
        let smoothnessYFactor: number = 1 / smoothnessY;
        Main.Canvas.addEventListener("pointermove", (e) => {
            if (document.pointerLockElement) {
                let newRY = this.rotation.y + e.movementX / 200;
                this.rotation.y = this.rotation.y * (1 - smoothnessYFactor) + newRY * smoothnessYFactor;
                if (Main.Camera instanceof BABYLON.FreeCamera) {
                    let newRX = Math.min(Math.max(
                        Main.Camera.rotation.x + e.movementY / 200, - Math.PI / 2 + Math.PI / 60), Math.PI / 2  - Math.PI / 60
                    )
                    Main.Camera.rotation.x = Main.Camera.rotation.x * (1 - smoothnessXFactor) + newRX * smoothnessXFactor;
                }
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

    public async storeBrick(): Promise<Brick> {
        if (this.aimedObject && this.aimedObject instanceof Brick) {
            this.aimedObject.chunck.removeBrick(this.aimedObject);
            await this.aimedObject.chunck.updateBricks();
            return this.aimedObject;
        }
    }

    public async takeBrick(): Promise<boolean> {
        let brick = await this.storeBrick();
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
            return true;
        }
        return false;
    }

    public update = () => {
        let right = this.getDirection(BABYLON.Axis.X);
        let forward = this.getDirection(BABYLON.Axis.Z);

        if (this._inputLeft) { this.position.addInPlace(right.scale(-0.04)); }
        if (this._inputRight) { this.position.addInPlace(right.scale(0.04)); }
        if (this._inputBack) { this.position.addInPlace(forward.scale(-0.04)); }
        if (this._inputForward) { this.position.addInPlace(forward.scale(0.04)); }
        this.position.y -= this._downSpeed;
        this._downSpeed += 0.005;
        this._downSpeed *= 0.99;
        
        Main.ChunckManager.foreachChunck(
            (chunck) => {
                let intersections = Intersections3D.SphereChunck(this.position, 0.5, chunck);
                if (intersections) {
                    for (let j = 0; j < intersections.length; j++) {
                        let d = this.position.subtract(intersections[j].point);
                        let l = d.length();
                        d.normalize();
                        if (d.y > 0.8) {
                            this._downSpeed = 0.0;
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
            let pickInfo = Main.Scene.pick(
                x, y,
                (m) => {
                    return m && m.parent && m.parent instanceof Chunck_V2;
                }
            );
            let pickedMesh = pickInfo.pickedMesh;
            if (pickedMesh) {
                let chunck = pickedMesh.parent;
                if (chunck instanceof Chunck_V2) {
                    let brick = chunck.bricks.find(b => { return b.mesh === pickedMesh });
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

        if (this._inputLeft) { this.position.addInPlace(right.scale(-0.08)); }
        if (this._inputRight) { this.position.addInPlace(right.scale(0.08)); }
        if (this._inputBack) { this.position.addInPlace(forward.scale(-0.08)); }
        if (this._inputForward) { this.position.addInPlace(forward.scale(0.08)); }
        
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
}