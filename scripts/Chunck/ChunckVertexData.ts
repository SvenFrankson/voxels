class ChunckVertexData {

    private static _VertexDatas: Map<string, BABYLON.VertexData> = new Map<string, BABYLON.VertexData>();

    public static RotateYChunckPartName(name: string): string {
        let v0 = name[0];
        let v1 = name[1];
        let v2 = name[2];
        let v3 = name[3];
        let v4 = name[4];
        let v5 = name[5];
        let v6 = name[6];
        let v7 = name[7];

        return v1 + v2 + v3 + v0 + v5 + v6 + v7 + v4;
    }

    private static _Flip01(c: string): string {
        return c === "0" ? "1" : "0";
    }
    public static FlipChunckPartName(name: string): string {
        let output = "";
        for (let i = 0; i < name.length; i++) {
            output += ChunckVertexData._Flip01(name[i]);
        }
        return output
    }

    public static MirrorYChunckPartName(name: string): string {
        let v0 = name[0];
        let v1 = name[1];
        let v2 = name[2];
        let v3 = name[3];
        let v4 = name[4];
        let v5 = name[5];
        let v6 = name[6];
        let v7 = name[7];

        return v4 + v5 + v6 + v7 + v0 + v1 + v2 + v3;
    }

    private static _TryAddFlipedChunckPart(name: string, data): void {
        let flipedName = ChunckVertexData.FlipChunckPartName(name);
        if (!ChunckVertexData._VertexDatas.has(flipedName)) {
            console.log(flipedName);
            let flipedData = ChunckVertexData.Flip(data);
            ChunckVertexData._VertexDatas.set(flipedName, flipedData);
        }
    }

    private static _TryAddMirrorYChunckPart(name: string, data): void {
        let mirrorYName = ChunckVertexData.MirrorYChunckPartName(name);
        if (!ChunckVertexData._VertexDatas.has(mirrorYName)) {
            console.log(mirrorYName);
            let mirrorYData = ChunckVertexData.MirrorY(data);
            ChunckVertexData._VertexDatas.set(mirrorYName, mirrorYData);
        }
    }

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
                            if (mesh instanceof BABYLON.Mesh && mesh.name != "zero") {
                                let name = mesh.name;
                                console.log(name);
                                let data = BABYLON.VertexData.ExtractFromMesh(mesh);
                                mesh.dispose();
                                if (!ChunckVertexData._VertexDatas.has(name)) {
                                    ChunckVertexData._VertexDatas.set(name, data);
                                }

                                ChunckVertexData._TryAddFlipedChunckPart(name, data);
                                ChunckVertexData._TryAddMirrorYChunckPart(name, data);

                                for (let i = 0; i < 3; i++) {
                                    name = ChunckVertexData.RotateYChunckPartName(name);
                                    data = ChunckVertexData.RotateY(data, - Math.PI / 2);
                                    if (!ChunckVertexData._VertexDatas.has(name)) {
                                        ChunckVertexData._VertexDatas.set(name, data);
                                    }
                                    ChunckVertexData._TryAddFlipedChunckPart(name, data);
                                    ChunckVertexData._TryAddMirrorYChunckPart(name, data);
                                }
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

    public static RotateY(baseData: BABYLON.VertexData, angle: number): BABYLON.VertexData {
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

    public static Flip(baseData: BABYLON.VertexData): BABYLON.VertexData {
        let data = new BABYLON.VertexData();
        data.positions = [...baseData.positions];
        if (baseData.normals && baseData.normals.length === baseData.positions.length) {
            let normals: number[] = [];
            for (let i = 0; i < baseData.normals.length / 3; i++) {
                normals.push(- baseData.normals[3 * i], - baseData.normals[3 * i + 1], - baseData.normals[3 * i + 2]);
            }
            data.normals = normals;
        }
        let indices: number[] = [];
        for (let i = 0; i < baseData.indices.length / 3; i++) {
            indices.push(baseData.indices[3 * i], baseData.indices[3 * i + 2], baseData.indices[3 * i + 1]);
        }
        data.indices = indices;
        
        return data;
    }

    public static MirrorY(baseData: BABYLON.VertexData): BABYLON.VertexData {
        let data = new BABYLON.VertexData();

        let positions: number[] = [];
        for (let i = 0; i < baseData.positions.length / 3; i++) {
            positions.push(baseData.positions[3 * i], - baseData.positions[3 * i + 1], baseData.positions[3 * i + 2]);
        }
        data.positions = positions;

        if (baseData.normals && baseData.normals.length === baseData.positions.length) {
            let normals: number[] = [];
            for (let i = 0; i < baseData.normals.length / 3; i++) {
                normals.push(baseData.normals[3 * i], - baseData.normals[3 * i + 1], baseData.normals[3 * i + 2]);
            }
            data.normals = normals;
        }

        let indices: number[] = [];
        for (let i = 0; i < baseData.indices.length / 3; i++) {
            indices.push(baseData.indices[3 * i], baseData.indices[3 * i + 2], baseData.indices[3 * i + 1]);
        }
        data.indices = indices;
        
        return data;
    }

    public static RotateRef(ref: string, rotation: number): string {
        return ref.substr(rotation) + ref.substring(0, rotation);
    }
}