class Block extends BABYLON.Mesh {

    public chunck: Chunck;
    public i: number = 0;
    public j: number = 0;
    public k: number = 0;
    public r: number = 0;

    constructor(
        public reference: string
    ) {
        super("block-" + reference);

        if (reference === "cube") {
            BABYLON.VertexData.CreateBox(
                {
                    size: 0.5,
                    faceColors: [
                        new BABYLON.Color4(27 / 256, 153 / 256, 155 / 256, 1),
                        new BABYLON.Color4(27 / 256, 153 / 256, 155 / 256, 1),
                        new BABYLON.Color4(27 / 256, 153 / 256, 155 / 256, 1),
                        new BABYLON.Color4(27 / 256, 153 / 256, 155 / 256, 1),
                        new BABYLON.Color4(27 / 256, 153 / 256, 155 / 256, 1),
                        new BABYLON.Color4(27 / 256, 153 / 256, 155 / 256, 1)
                    ]
                }
            ).applyToMesh(this);
        }
        else if (reference === "plate") {
            BABYLON.VertexData.CreateBox(
                {
                    width: 1.5,
                    height: 0.5,
                    depth: 1.5,
                    faceColors: [
                        new BABYLON.Color4(153 / 256, 27 / 256, 155 / 256, 1),
                        new BABYLON.Color4(153 / 256, 27 / 256, 155 / 256, 1),
                        new BABYLON.Color4(153 / 256, 27 / 256, 155 / 256, 1),
                        new BABYLON.Color4(153 / 256, 27 / 256, 155 / 256, 1),
                        new BABYLON.Color4(153 / 256, 27 / 256, 155 / 256, 1),
                        new BABYLON.Color4(153 / 256, 27 / 256, 155 / 256, 1)
                    ]
                }
            ).applyToMesh(this);
        }
        this.material = Main.cellShadingMaterial;
    }
}