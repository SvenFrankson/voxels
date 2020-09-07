class ChunckVertexData {

    private static _VertexDatas: Map<string, BABYLON.VertexData> = new Map<string, BABYLON.VertexData>();

    private static async _LoadChunckVertexDatas(): Promise<void> {
        return new Promise<void>(
            resolve => {
                BABYLON.SceneLoader.ImportMesh(
                    "",
                    "./datas/meshes/chunck-parts.babylon",
                    "",
                    Main.Scene,
                    (meshes) => {
                        for (let i = 0; i < meshes.length; i++) {
                            let mesh = meshes[i];
                            if (mesh instanceof BABYLON.Mesh) {
                                ChunckVertexData._VertexDatas.set(mesh.name, BABYLON.VertexData.ExtractFromMesh(mesh));
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
        await ChunckVertexData._LoadChunckVertexDatas();
        return true;
    }

    public static Clone(data: BABYLON.VertexData): BABYLON.VertexData {
        let clonedData = new BABYLON.VertexData();
        clonedData.positions = [...data.positions];
        clonedData.indices = [...data.indices];
        clonedData.normals = [...data.normals];
        if (data.uvs) {
            clonedData.uvs = [...data.uvs];
        }
        if (data.colors) {
            clonedData.colors = [...data.colors];
        }
        return clonedData;
    }

    public static Get(name: string): BABYLON.VertexData {
        return ChunckVertexData._VertexDatas.get(name);
    }

    public static RotateZ(baseData: BABYLON.VertexData, angle: number): BABYLON.VertexData {
        let data = new BABYLON.VertexData();
        let positions = [...baseData.positions];
        let normals: number[];
        if (baseData.normals && baseData.normals.length === baseData.positions.length) {
            normals = [...baseData.normals];
        }
        data.indices = [...baseData.indices];

        let cosa = Math.cos(angle);
        let sina = Math.sin(angle);
        for (let i = 0; i < positions.length / 3; i++) {
            let x = positions[3 * i];
            let z = positions[3 * i + 2];
            positions[3 * i] = x * cosa - z * sina;
            positions[3 * i + 2] =  x * sina + z * cosa;
            if (normals) {
                let xn = normals[3 * i];
                let zn = normals[3 * i + 2];
                normals[3 * i] = xn * cosa - zn * sina;
                normals[3 * i + 2] =  xn * sina + zn * cosa;
            }
        }
        data.positions = positions;
        if (normals) {
            data.normals = normals;
        }

        return data;
    }

    public static RotateRef(ref: string, rotation: number): string {
        return ref.substr(rotation) + ref.substring(0, rotation);
    }
}