class BrickVertexData {

    public static BrickColors: Map<string, BABYLON.Color3> = new Map<string, BABYLON.Color3>();

    private static _BrickVertexDatas: Map<string, BABYLON.VertexData> = new Map<string, BABYLON.VertexData>();
    private static _KnobVertexDatas: BABYLON.VertexData[] = [];

    private static async _LoadKnobsVertexDatas(): Promise<void> {
        return new Promise<void>(
            resolve => {
                BABYLON.SceneLoader.ImportMesh(
                    "",
                    "./datas/meshes/knobs.babylon",
                    "",
                    Main.Scene,
                    (meshes) => {
                        for (let i = 0; i < meshes.length; i++) {
                            let mesh = meshes[i];
                            if (mesh instanceof BABYLON.Mesh) {
                                let lod = parseInt(mesh.name.replace("knob-lod", ""));
                                BrickVertexData._KnobVertexDatas[lod] = BABYLON.VertexData.ExtractFromMesh(mesh);
                                mesh.dispose();
                            }
                        }
                        resolve();
                    }
                );
            }
        );
    }

    private static async _LoadBricksVertexDatas(): Promise<void> {
        return new Promise<void>(
            resolve => {
                BABYLON.SceneLoader.ImportMesh(
                    "",
                    "./datas/meshes/bricks.babylon",
                    "",
                    Main.Scene,
                    (meshes) => {
                        for (let i = 0; i < meshes.length; i++) {
                            let mesh = meshes[i];
                            if (mesh instanceof BABYLON.Mesh) {
                                BrickVertexData._BrickVertexDatas.set(mesh.name, BABYLON.VertexData.ExtractFromMesh(mesh));
                                mesh.dispose();
                            }
                        }
                        resolve();
                    }
                );
            }
        );
    }

    public static async InitializeData(): Promise<boolean> {
        BrickVertexData.BrickColors.set("red", new BABYLON.Color3(1, 0, 0));
        BrickVertexData.BrickColors.set("green", new BABYLON.Color3(0, 1, 0));
        BrickVertexData.BrickColors.set("blue", new BABYLON.Color3(0, 0, 1));
        BrickVertexData.BrickColors.set("white", new BABYLON.Color3(1, 1, 1));
        BrickVertexData.BrickColors.set("black", new BABYLON.Color3(0.1, 0.1, 0.1));
        await BrickVertexData._LoadKnobsVertexDatas();
        return true;
    }
        
    public static AddKnob(x: number, y: number, z: number, positions: number[], indices: number[], normals: number[], lod: number): void {
        let l = positions.length / 3;
        let data = BrickVertexData._KnobVertexDatas[lod];
        if (data) {

            for (let i = 0; i < data.positions.length / 3; i++) {
                let kx = data.positions[3 * i];
                let ky = data.positions[3 * i + 1];
                let kz = data.positions[3 * i + 2];
                positions.push(kx + x * DX, ky + y * DY, kz + z * DX);
            }
    
            for (let i = 0; i < data.normals.length / 3; i++) {
                let knx = data.normals[3 * i];
                let kny = data.normals[3 * i + 1];
                let knz = data.normals[3 * i + 2];
                normals.push(knx, kny, knz);
            }
    
            for (let i = 0; i < data.indices.length; i++) {
                let kn = data.indices[i];
                indices.push(kn + l);
            }
        }
    }

    public static async GetBrickVertexData(brickReference: IBrickReference): Promise<BABYLON.VertexData> {
        let data = BrickVertexData._BrickVertexDatas.get(brickReference.name);
        if (!data) {
            await BrickVertexData._LoadBricksVertexDatas();
            data = BrickVertexData._BrickVertexDatas.get(brickReference.name);
        }
        return data;
    }
    
    public static async GetFullBrickVertexData(brickReference: IBrickReference): Promise<BABYLON.VertexData> {
        let vertexData = await BrickVertexData.GetBrickVertexData(brickReference);
        let positions = [...vertexData.positions];
        let indices = [...vertexData.indices];
        let normals = [...vertexData.normals];
        let brickData = BrickDataManager.GetBrickData(brickReference);
        for (let i = 0; i < brickData.knobs.length; i++) {
            BrickVertexData.AddKnob(brickData.knobs[3 * i], brickData.knobs[3 * i + 1], brickData.knobs[3 * i + 2], positions, indices, normals, 0);
        }
        let colors = [];
        let color = BrickVertexData.BrickColors.get(brickReference.color);
        for (let i = 0; i < positions.length / 3; i++) {
            colors.push(color.r, color.g, color.b, 1);
        }
        let fullVertexData = new BABYLON.VertexData();
        fullVertexData.positions = positions;
        fullVertexData.normals = normals;
        fullVertexData.indices = indices;
        fullVertexData.colors = colors;
        return fullVertexData;
    }
}