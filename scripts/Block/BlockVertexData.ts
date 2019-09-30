class BlockVertexData {

    public static async GetVertexData(reference: string): Promise<BABYLON.VertexData> {
        let fileName = "";
        let meshIndex = 0;

        if (reference === "wall") {
            fileName = "wall";
            meshIndex = 0;
        }
        else if (reference === "wall-corner-out") {
            fileName = "wall";
            meshIndex = 1;
        }
        else if (reference === "wall-hole") {
            fileName = "wall";
            meshIndex = 2;
        }
        else if (reference === "brick-1-1-1") {
            fileName = "block-basic";
            meshIndex = 0;
        }
        else if (reference === "brick-1-1-2") {
            fileName = "block-basic";
            meshIndex = 1;
        }
        else if (reference === "brick-1-1-4") {
            fileName = "block-basic";
            meshIndex = 2;
        }
        else if (reference === "ramp-1-1-2") {
            fileName = "block-basic";
            meshIndex = 3;
        }
        else if (reference === "ramp-1-1-4") {
            fileName = "block-basic";
            meshIndex = 4;
        }
        else if (reference === "guard") {
            fileName = "block-guard";
            meshIndex = 0;
        }
        else if (reference === "guard-corner") {
            fileName = "block-guard";
            meshIndex = 1;
        }
        
        return new Promise<BABYLON.VertexData>(
            resolve => {
                VertexDataLoader.instance.get(fileName).then(
                    datas => {
                        resolve(datas[meshIndex]);
                    }
                )
            }
        );
    }
}