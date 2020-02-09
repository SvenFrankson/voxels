class TerrainTileVertexData {

    public static LoadedRefs: string[] = [
        "0000",
        "0001", "0011", "0101", "0111",
        "0102", "0022", "0122", "0002", "0222", "0221", "0212", "0121", "0211", "0112", "0012", "0021", "0202"
    ];

    private static _VertexDatas: Map<string, BABYLON.VertexData> = new Map<string, BABYLON.VertexData>();

    private static async _LoadTerrainTileVertexDatas(): Promise<void> {
        return new Promise<void>(
            resolve => {
                BABYLON.SceneLoader.ImportMesh(
                    "",
                    "./datas/meshes/terrain-tiles.babylon",
                    "",
                    Main.Scene,
                    (meshes) => {
                        for (let i = 0; i < meshes.length; i++) {
                            let mesh = meshes[i];
                            if (mesh instanceof BABYLON.Mesh) {
                                TerrainTileVertexData._VertexDatas.set(mesh.name + "-rz-0", BABYLON.VertexData.ExtractFromMesh(mesh));
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
        await TerrainTileVertexData._LoadTerrainTileVertexDatas();
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

    public static Get(name: string, dir: number = 0): BABYLON.VertexData {
        let ref = name + "-rz-" + dir;
        if (TerrainTileVertexData._VertexDatas.get(ref)) {
            return TerrainTileVertexData._VertexDatas.get(ref);
        }

        if (dir === 0) {
            return TerrainTileVertexData._VertexDatas.get(ref);
        }
        else {
            let base = TerrainTileVertexData.Get(name, 0);
            if (!base) {
                console.log(name + " not found.");
            }
            let data = TerrainTileVertexData.RotateZ(base, dir * Math.PI / 2);
            TerrainTileVertexData._VertexDatas.set(ref, data);
            return TerrainTileVertexData._VertexDatas.get(ref);
        }
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

    public static GetDataFor(h1: number, h2: number, h3: number, h4: number): BABYLON.VertexData {
        let sRef = h1.toFixed(0) + h2.toFixed(0) + h3.toFixed(0) + h4.toFixed(0);

        for (let i = 0; i < TerrainTileVertexData.LoadedRefs.length; i++) {
            let ref = TerrainTileVertexData.LoadedRefs[i];
            for (let r = 0; r < 4; r++) {
                if (sRef === TerrainTileVertexData.RotateRef(ref, r)) {
                    return TerrainTileVertexData.Get(ref, r);
                }
            }
        }
    }
}