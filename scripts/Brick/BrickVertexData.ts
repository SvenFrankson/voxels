class BrickVertexData {

    private static _CubicTemplateVertexData: BABYLON.VertexData[] = [];
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

    private static async _LoadCubicTemplateVertexData(): Promise<void> {
        return new Promise<void>(
            resolve => {
                BABYLON.SceneLoader.ImportMesh(
                    "",
                    "./datas/meshes/cubic-template.babylon",
                    "",
                    Main.Scene,
                    (meshes) => {
                        for (let i = 0; i < meshes.length; i++) {
                            let mesh = meshes[i];
                            if (mesh instanceof BABYLON.Mesh) {
                                BrickVertexData._CubicTemplateVertexData[i] = BABYLON.VertexData.ExtractFromMesh(mesh);
                                mesh.dispose();
                            }
                        }
                        resolve();
                    }
                );
            }
        );
    }

    private static async _LoadVertexData(fileName: string): Promise<void> {
        return new Promise<void>(
            resolve => {
                BABYLON.SceneLoader.ImportMesh(
                    "",
                    "./datas/meshes/" + fileName + ".babylon",
                    "",
                    Main.Scene,
                    (meshes) => {
                        for (let i = 0; i < meshes.length; i++) {
                            let mesh = meshes[i];
                            if (mesh instanceof BABYLON.Mesh) {
                                let name = mesh.name.split("-")[0];
                                let sizeString = mesh.name.split("-")[1];
                                let lodString = mesh.name.split("-")[2];
                                BrickVertexData._BrickVertexDatas.set(mesh.name, BABYLON.VertexData.ExtractFromMesh(mesh));
                                if (name === "tileRound") {
                                    BrickVertexData._BrickVertexDatas.set("plateRound-" + sizeString + "-" + lodString, BABYLON.VertexData.ExtractFromMesh(mesh));
                                }
                                mesh.dispose();
                            }
                        }
                        resolve();
                    }
                );
            }
        );
    }

    private static async _LoadConstructVertexData(constructName: string, lod: number): Promise<BABYLON.VertexData> {
        console.log("_LoadConstructVertexData for " + constructName);
        return new Promise<BABYLON.VertexData>(resolve => {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', "datas/constructs/" + constructName + ".json");
            xhr.onload = async () => {
                let data = JSON.parse(xhr.responseText);
                
                let bricks = data.bricks;
                let vertexData = new BABYLON.VertexData();
                let positions = [];
                let indices = [];
                let normals = [];
                let colors = [];

                for (let i = 0; i < bricks.length; i++) {
                    let brick = bricks[i];
                    
                    let vertexData = await BrickVertexData.GetFullBrickVertexData(brick.brickReference);
                    let l = positions.length / 3;
                    for (let n = 0; n < vertexData.positions.length / 3; n++) {
                        positions.push(
                            vertexData.positions[3 * n] + brick.position[0],
                            vertexData.positions[3 * n + 1] + brick.position[1],
                            vertexData.positions[3 * n + 2] + brick.position[2]
                        );
                    }
                    for (let n = 0; n < vertexData.indices.length; n++) {
                        indices.push(vertexData.indices[n] + l);
                    }
                    for (let n = 0; n < vertexData.normals.length / 3; n++) {
                        normals.push(
                            vertexData.normals[3 * n],
                            vertexData.normals[3 * n + 1],
                            vertexData.normals[3 * n + 2]
                        );
                    }
                    for (let n = 0; n < vertexData.colors.length / 4; n++) {
                        colors.push(
                            vertexData.colors[4 * n],
                            vertexData.colors[4 * n + 1],
                            vertexData.colors[4 * n + 2],
                            vertexData.colors[4 * n + 3]
                        );
                    }
                }
                vertexData.positions = positions;
                vertexData.indices = indices;
                vertexData.normals = normals;
                vertexData.colors = colors;

                resolve(vertexData);
            }
            xhr.send();
        });
    }

    private static async GenerateFromCubicTemplate(w: number, h: number, l: number, lod: number): Promise<BABYLON.VertexData> {
        if (!BrickVertexData._CubicTemplateVertexData[lod]) {
            await BrickVertexData._LoadCubicTemplateVertexData();
        }
        let data = new BABYLON.VertexData();
        let positions = [...BrickVertexData._CubicTemplateVertexData[lod].positions];
        let indices = [...BrickVertexData._CubicTemplateVertexData[lod].indices];
        let normals = [...BrickVertexData._CubicTemplateVertexData[lod].normals];
        for (let i = 0; i < positions.length / 3; i++) {
            let x = positions[3 * i];
            let y = positions[3 * i + 1];
            let z = positions[3 * i + 2];
            if (x > 0) {
                positions[3 * i] = x + (w - 1) * DX;
            }
            if (y > DY * 0.5) {
                positions[3 * i + 1] = y + (h - 1) * DY;
            }
            if (z > 0) {
                positions[3 * i + 2] = z + (l - 1) * DX;
            }
        }
        data.positions = positions;
        data.indices = indices;
        data.normals = normals;
        return data;
    }

    private static async GenerateFromSlopeTemplate(w: number, h: number, l: number, lod: number): Promise<BABYLON.VertexData> {
        let baseData: BABYLON.VertexData;
        let baseBrickName = "slope" + h + "-" + w + "x1";
        baseData = await BrickVertexData.GetBrickVertexData(baseBrickName, lod);
        let data = new BABYLON.VertexData();
        let positions = [...baseData.positions];
        let indices = [...baseData.indices];
        let normals = [...baseData.normals];
        for (let i = 0; i < positions.length / 3; i++) {
            let z = positions[3 * i + 2];
            if (z > 0) {
                positions[3 * i + 2] = z + (l - 1) * DX;
            }
        }
        data.positions = positions;
        data.indices = indices;
        data.normals = normals;
        return data;
    }

    private static _GetFileNameFromType(type: string): string {
        if (type === "brickRound" || type === "tileRound" || type === "plateRound" || type === "cone") {
            return "round";
        }
        return type;
    }

    private static async _LoadBrickVertexData(brickName: string, lod: number): Promise<BABYLON.VertexData> {
        let type = brickName.split("-")[0];
        let size = brickName.split("-")[1];
        if (type === "brick") {
            let w = parseInt(size.split("x")[0]);
            let l = parseInt(size.split("x")[1]);
            return BrickVertexData.GenerateFromCubicTemplate(w, 3, l, lod);
        }
        else if (type === "plate" || type === "tile") {
            let w = parseInt(size.split("x")[0]);
            let l = parseInt(size.split("x")[1]);
            return BrickVertexData.GenerateFromCubicTemplate(w, 1, l, lod);
        }
        else if (type.indexOf("slope") != -1) {
            let w = parseInt(size.split("x")[0]);
            let l = parseInt(size.split("x")[1]);
            if (l === 1) {
                await BrickVertexData._LoadVertexData("slope-template");
                return undefined;
            }
            else {
                let h = parseInt(type.replace("slope", ""));
                return await BrickVertexData.GenerateFromSlopeTemplate(w, h, l, lod);
            }
        }
        else if (type.startsWith("construct_")) {
            let constructName = type.replace("construct_", "");
            return BrickVertexData._LoadConstructVertexData(constructName, lod);
        }
        else {
            let fileName = BrickVertexData._GetFileNameFromType(type);
            await BrickVertexData._LoadVertexData(fileName);
            return undefined;
        }
    }

    public static async InitializeData(): Promise<boolean> {
        await BrickVertexData._LoadKnobsVertexDatas();
        return true;
    }
        
    public static knobColorFactor: number = 0.9;
    public static AddKnob(x: number, y: number, z: number, positions: number[], indices: number[], normals: number[], lod: number, colors?: number[], color?: BABYLON.Color4): void {
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

                if (color) {
                    if (kny >= 0.9) {
                        colors.push(color.r * BrickVertexData.knobColorFactor, color.g * BrickVertexData.knobColorFactor, color.b * BrickVertexData.knobColorFactor, color.a);
                    }
                    else {
                        colors.push(color.r, color.g, color.b, color.a);
                    }
                }
            }
    
            for (let i = 0; i < data.indices.length; i++) {
                let kn = data.indices[i];
                indices.push(kn + l);
            }
        }
    }

    public static async GetBrickVertexData(brickName: string, lod: number): Promise<BABYLON.VertexData> {
        let data = BrickVertexData._BrickVertexDatas.get(brickName + "-lod" + lod);
        if (!data) {
            data = await BrickVertexData._LoadBrickVertexData(brickName, lod);
            if (data) {
                BrickVertexData._BrickVertexDatas.set(brickName + "-lod" + lod, data);
            }
            else {
                data = BrickVertexData._BrickVertexDatas.get(brickName + "-lod" + lod);
                if (!data) {
                    console.warn("GetBrickVertexData failed for brick " + brickName + " at lod " + lod);
                }
            }
        }
        return data;
    }
    
    public static async GetFullBrickVertexData(brickReference: IBrickReference): Promise<BABYLON.VertexData> {
        let vertexData = await BrickVertexData.GetBrickVertexData(brickReference.name, 0);
        if (brickReference.name.startsWith("construct_")) {
            return vertexData;
        }
        let positions = [...vertexData.positions];
        let indices = [...vertexData.indices];
        let normals = [...vertexData.normals];
        let colors = [];
        let color = BrickDataManager.BrickColors.get(brickReference.color);
        for (let i = 0; i < positions.length / 3; i++) {
            colors.push(color.r, color.g, color.b, color.a);
        }
        let brickData = await BrickDataManager.GetBrickData(brickReference);
        for (let i = 0; i < brickData.knobs.length; i++) {
            BrickVertexData.AddKnob(brickData.knobs[3 * i], brickData.knobs[3 * i + 1], brickData.knobs[3 * i + 2], positions, indices, normals, 0, colors, color);
        }
        let fullVertexData = new BABYLON.VertexData();
        fullVertexData.positions = positions;
        fullVertexData.normals = normals;
        fullVertexData.indices = indices;
        fullVertexData.colors = colors;
        return fullVertexData;
    }
}