class Player extends BABYLON.Mesh {

    private _inputLeft: boolean = false;
    private _inputRight: boolean = false;
    private _inputBack: boolean = false;
    private _inputForward: boolean = false;

    private _downSpeed: number = 0;

    public playerActionManager: PlayerActionManager;
    public currentAction: PlayerAction;

    constructor() {
        super("player");
        this.playerActionManager = new PlayerActionManager(this);
    }

    public register(): void {
        this.playerActionManager.register();
        let dirtAction = PlayerActionTemplate.CreateCubeAction(CubeType.Dirt);
        this.playerActionManager.linkAction(dirtAction, 1);
        let rockAction = PlayerActionTemplate.CreateCubeAction(CubeType.Rock);
        this.playerActionManager.linkAction(rockAction, 2);
        let sandAction = PlayerActionTemplate.CreateCubeAction(CubeType.Sand);
        this.playerActionManager.linkAction(sandAction, 3);
        let deleteCubeAction = PlayerActionTemplate.CreateCubeAction(CubeType.None);
        this.playerActionManager.linkAction(deleteCubeAction, 0);
        
        let wallAction = PlayerActionTemplate.CreateBlockAction("wall");
        this.playerActionManager.linkAction(wallAction, 4);
        let wallHoleAction = PlayerActionTemplate.CreateBlockAction("wall-hole");
        this.playerActionManager.linkAction(wallHoleAction, 5);
        let wallCornerOutAction = PlayerActionTemplate.CreateBlockAction("wall-corner-out");
        this.playerActionManager.linkAction(wallCornerOutAction, 6);
        
        let editBlockAction = PlayerActionTemplate.EditBlockAction();
        this.playerActionManager.linkAction(editBlockAction, 7);

        Main.Scene.onBeforeRenderObservable.add(this.update);

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

        Main.Canvas.addEventListener("pointermove", (e) => {
            this.rotation.y += e.movementX / 200;
            if (Main.Camera instanceof BABYLON.FreeCamera) {
                Main.Camera.rotation.x = Math.min(Math.max(
                    Main.Camera.rotation.x + e.movementY / 200, - Math.PI / 2 + Math.PI / 60), Math.PI / 2  - Math.PI / 60
                )
                    
            }
        });

        Main.Canvas.addEventListener("pointerup", (e) => {
            if (this.currentAction) {
                if (this.currentAction.onClick) {
                    this.currentAction.onClick();
                }
            }
        });

        document.getElementById("player-actions").style.display = "block";
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
    }
}