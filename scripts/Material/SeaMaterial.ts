class SeaMaterial extends BABYLON.ShaderMaterial {
    
    public t = 0;
    public dir0: BABYLON.Vector2 = BABYLON.Vector2.Zero();
    public dir1: BABYLON.Vector2 = BABYLON.Vector2.Zero();
    public dir2: BABYLON.Vector2 = BABYLON.Vector2.Zero();
    public dir3: BABYLON.Vector2 = BABYLON.Vector2.Zero();
    public dir4: BABYLON.Vector2 = BABYLON.Vector2.Zero();
    public dir5: BABYLON.Vector2 = BABYLON.Vector2.Zero();
    public dir6: BABYLON.Vector2 = BABYLON.Vector2.Zero();

    constructor(name: string, scene: BABYLON.Scene) {
        super(
            name,
            scene,
            {
                vertex: "sea",
                fragment: "sea",
            },
            {
                attributes: ["position", "normal", "uv"],
                uniforms: ["world", "worldView", "worldViewProjection", "view", "projection"],
                needAlphaBlending: true
            }
        );
        this.dir0 = new BABYLON.Vector2(Math.random(), Math.random()).normalize();
        this.dir1 = new BABYLON.Vector2(Math.random(), Math.random()).normalize();
        this.dir2 = new BABYLON.Vector2(Math.random(), Math.random()).normalize();
        this.dir3 = new BABYLON.Vector2(Math.random(), Math.random()).normalize();
        this.dir4 = new BABYLON.Vector2(Math.random(), Math.random()).normalize();
        this.dir5 = new BABYLON.Vector2(Math.random(), Math.random()).normalize();
        this.dir6 = new BABYLON.Vector2(Math.random(), Math.random()).normalize();
        this.setVector2("dir0", this.dir0);
        this.setVector2("dir1", this.dir1);
        this.setVector2("dir2", this.dir2);
        this.setVector2("dir3", this.dir3);
        this.setVector2("dir4", this.dir4);
        this.setVector2("dir5", this.dir5);
        this.setVector2("dir6", this.dir6);
        this.setFloat("a0", 1/ 7);
        this.setFloat("a1", 1/ 7);
        this.setFloat("a2", 1/ 7);
        this.setFloat("a3", 1/ 7);
        this.setFloat("a4", 1/ 7);
        this.setFloat("a5", 1/ 7);
        this.setFloat("a6", 1/ 7);
        scene.registerBeforeRender(this._updateTime);
    }

    private _updateTime = () => {
        this.setFloat("time", this.t++/60);
    }
}