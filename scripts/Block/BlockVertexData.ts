class BlockVertexData {

    private static _BlockColors: Map<BlockMaterial, string>;
    public static get BlockColors(): Map<BlockMaterial, string> {
        if (!BlockVertexData._BlockColors) {
            BlockVertexData._BlockColors = new Map<BlockMaterial, string>();
            BlockVertexData._BlockColors.set(BlockMaterial.Stone, "#8a8a8a");
            BlockVertexData._BlockColors.set(BlockMaterial.Wood, "#784c05");
            BlockVertexData._BlockColors.set(BlockMaterial.SandStone, "#c9b449");
            BlockVertexData._BlockColors.set(BlockMaterial.Brick, "#b02e17");
            BlockVertexData._BlockColors.set(BlockMaterial.Plastic, "#cad8db");
        }
        return BlockVertexData._BlockColors;
    }

    public static StringToBlockMaterial(s: string): BlockMaterial {
        if (s === "stone") {
            return BlockMaterial.Stone;
        }
        if (s === "wood") {
            return BlockMaterial.Wood;
        }
        if (s === "sandstone") {
            return BlockMaterial.SandStone;
        }
        if (s === "brick") {
            return BlockMaterial.Brick;
        }
        if (s === "plastic") {
            return BlockMaterial.Plastic;
        }
    }

    public static async GetVertexData(reference: string, material: BlockMaterial): Promise<BABYLON.VertexData> {
        let color = BlockVertexData.BlockColors.get(material);
        let fileName = "";
        let meshIndex = 0;

        if (reference === "light-wall") {
            fileName = "light-wall";
            meshIndex = 0;
        }
        else if (reference === "light-wall-corner") {
            fileName = "light-wall";
            meshIndex = 1;
        }
        else if (reference === "light-wall-door") {
            fileName = "light-wall";
            meshIndex = 2;
        }
        else if (reference === "light-wall-window") {
            fileName = "light-wall";
            meshIndex = 3;
        }
        else if (reference === "bar-1-1-1") {
            fileName = "block-basic";
            meshIndex = 0;
        }
        else if (reference === "bar-1-1-2") {
            fileName = "block-basic";
            meshIndex = 1;
        }
        else if (reference === "bar-1-1-4") {
            fileName = "block-basic";
            meshIndex = 2;
        }
        else if (reference === "brick-1-1-1") {
            fileName = "block-basic";
            meshIndex = 3;
        }
        else if (reference === "brick-1-1-2") {
            fileName = "block-basic";
            meshIndex = 4;
        }
        else if (reference === "brick-1-1-4") {
            fileName = "block-basic";
            meshIndex = 5;
        }
        else if (reference === "ramp-1-1-2") {
            fileName = "block-basic";
            meshIndex = 6;
        }
        else if (reference === "ramp-1-1-4") {
            fileName = "block-basic";
            meshIndex = 7;
        }
        
        return new Promise<BABYLON.VertexData>(
            resolve => {
                VertexDataLoader.instance.getColorizedMultiple(fileName, color).then(
                    datas => {
                        resolve(datas[meshIndex]);
                    }
                )
            }
        );
    }
}