class WorldItem extends BABYLON.Mesh {

    constructor(name: string) {
        super(name);
    }

    public async instantiate(): Promise<void> {
        let data = await VertexDataLoader.instance.get(this.name);
        if (data.length === 1) {
            data[0].applyToMesh(this);
        }
        let material = new BABYLON.StandardMaterial("test", this.getScene());
        material.specularColor.copyFromFloats(0, 0, 0);
        material.diffuseTexture = new BABYLON.Texture("datas/meshes/" + this.name + ".png", this.getScene());
        this.material = material;
    }
}