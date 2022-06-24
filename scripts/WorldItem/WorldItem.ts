class WorldItem extends BABYLON.Mesh {

    constructor(
        name: string,
        public color: BrickColor = BrickColor.None
    ) {
        super(name);
    }

    public async instantiate(): Promise<void> {
        let data = await VertexDataLoader.instance.get(this.name);
        if (data.length === 1) {
            data[0].applyToMesh(this);
        }
        let material = new BABYLON.StandardMaterial("test", this.getScene());
        material.specularColor.copyFromFloats(0, 0, 0);
        if (this.color === BrickColor.None) {
            material.diffuseTexture = new BABYLON.Texture("datas/meshes/" + this.name + ".png", this.getScene());
        }
        else {
            material.diffuseTexture = await ColorizedTextureLoader.instance.get(this.name, this.color);
        }
        this.material = material;
    }
}