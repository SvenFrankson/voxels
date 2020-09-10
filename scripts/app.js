var MenuPage;
(function (MenuPage) {
    MenuPage[MenuPage["Pause"] = 0] = "Pause";
    MenuPage[MenuPage["Inventory"] = 1] = "Inventory";
})(MenuPage || (MenuPage = {}));
class MenuManager {
    constructor() {
        this.currentMenu = MenuPage.Pause;
    }
    initialize() {
        let update = () => {
            if (document.pointerLockElement) {
                if (this.pauseMenu) {
                    this.pauseMenu.background.style.display = "none";
                }
                if (this.inventory) {
                    this.inventory.body.style.display = "none";
                }
            }
            if (this.currentMenu === MenuPage.Pause && this.pauseMenu) {
                if (!document.pointerLockElement) {
                    this.pauseMenu.background.style.display = "";
                }
            }
            else if (this.currentMenu === MenuPage.Inventory && this.inventory) {
                if (!document.pointerLockElement) {
                    this.inventory.body.style.display = "";
                }
            }
            if (this.currentMenu === undefined) {
                this.currentMenu = MenuPage.Pause;
            }
            requestAnimationFrame(update);
        };
        update();
    }
}
class PauseMenu {
    constructor() {
        Main.MenuManager.pauseMenu = this;
    }
    initialize() {
        let canvasBBox = Main.Canvas.getBoundingClientRect();
        let w = canvasBBox.width;
        let h = canvasBBox.height;
        this.background = document.getElementById("pause-menu");
        this.background.style.position = "absolute";
        this.background.style.left = canvasBBox.left + "px";
        this.background.style.top = canvasBBox.top + "px";
        this.background.style.width = w + "px";
        this.background.style.height = h + "px";
        this.background.style.backgroundColor = "rgba(0, 0, 0, 40%)";
        this.background.style.zIndex = "1";
        this.optionsButton = document.getElementById("options-button");
        this.optionsButton.style.left = Math.floor((canvasBBox.width - 240) * 0.5) + "px";
        this.optionsButton.style.top = (h * 0.5 - 160) + "px";
        this.saveButton = document.getElementById("save-button");
        this.saveButton.style.left = Math.floor((canvasBBox.width - 240) * 0.5) + "px";
        this.saveButton.style.top = (h * 0.5 - 40) + "px";
        this.resumeButton = document.getElementById("resume-button");
        this.resumeButton.style.left = Math.floor((canvasBBox.width - 240) * 0.5) + "px";
        this.resumeButton.style.top = (h * 0.5 + 80) + "px";
        this.resumeButton.addEventListener("pointerup", () => {
            Main.Canvas.requestPointerLock();
            Main.Canvas.focus();
        });
        this.saveButton.addEventListener("pointerup", () => {
            let data = Main.ChunckManager.serialize();
            let stringData = JSON.stringify(data);
            window.localStorage.setItem("player-test", stringData);
        });
    }
}
class VertexDataLoader {
    constructor(scene) {
        this.scene = scene;
        this._vertexDatas = new Map();
        VertexDataLoader.instance = this;
    }
    static clone(data) {
        let clonedData = new BABYLON.VertexData();
        clonedData.positions = [...data.positions];
        clonedData.indices = [...data.indices];
        clonedData.normals = [...data.normals];
        if (data.matricesIndices) {
            clonedData.matricesIndices = [...data.matricesIndices];
        }
        if (data.matricesWeights) {
            clonedData.matricesWeights = [...data.matricesWeights];
        }
        if (data.uvs) {
            clonedData.uvs = [...data.uvs];
        }
        if (data.colors) {
            clonedData.colors = [...data.colors];
        }
        return clonedData;
    }
    async get(name) {
        if (this._vertexDatas.get(name)) {
            return this._vertexDatas.get(name);
        }
        let vertexData = undefined;
        let loadedFile = await BABYLON.SceneLoader.ImportMeshAsync("", "./datas/meshes/" + name + ".babylon", "", Main.Scene);
        let vertexDatas = [];
        loadedFile.meshes = loadedFile.meshes.sort((m1, m2) => {
            if (m1.name < m2.name) {
                return -1;
            }
            else if (m1.name > m2.name) {
                return 1;
            }
            return 0;
        });
        for (let i = 0; i < loadedFile.meshes.length; i++) {
            let loadedMesh = loadedFile.meshes[i];
            if (loadedMesh instanceof BABYLON.Mesh) {
                vertexData = BABYLON.VertexData.ExtractFromMesh(loadedMesh);
                vertexDatas.push(vertexData);
            }
        }
        loadedFile.meshes.forEach(m => { m.dispose(); });
        loadedFile.skeletons.forEach(s => { s.dispose(); });
        return vertexDatas;
    }
    async getColorized(name, baseColorHex = "#FFFFFF", frameColorHex = "", color1Hex = "", // Replace red
    color2Hex = "", // Replace green
    color3Hex = "" // Replace blue
    ) {
        let vertexDatas = await this.getColorizedMultiple(name, baseColorHex, frameColorHex, color1Hex, color2Hex, color3Hex);
        return vertexDatas[0];
    }
    async getColorizedMultiple(name, baseColorHex = "#FFFFFF", frameColorHex = "", color1Hex = "", // Replace red
    color2Hex = "", // Replace green
    color3Hex = "" // Replace blue
    ) {
        let baseColor;
        if (baseColorHex !== "") {
            baseColor = BABYLON.Color3.FromHexString(baseColorHex);
        }
        let frameColor;
        if (frameColorHex !== "") {
            frameColor = BABYLON.Color3.FromHexString(frameColorHex);
        }
        let color1;
        if (color1Hex !== "") {
            color1 = BABYLON.Color3.FromHexString(color1Hex);
        }
        let color2;
        if (color2Hex !== "") {
            color2 = BABYLON.Color3.FromHexString(color2Hex);
        }
        let color3;
        if (color3Hex !== "") {
            color3 = BABYLON.Color3.FromHexString(color3Hex);
        }
        let vertexDatas = await VertexDataLoader.instance.get(name);
        let colorizedVertexDatas = [];
        for (let d = 0; d < vertexDatas.length; d++) {
            let vertexData = vertexDatas[d];
            let colorizedVertexData = VertexDataLoader.clone(vertexData);
            if (colorizedVertexData.colors) {
                for (let i = 0; i < colorizedVertexData.colors.length / 4; i++) {
                    let r = colorizedVertexData.colors[4 * i];
                    let g = colorizedVertexData.colors[4 * i + 1];
                    let b = colorizedVertexData.colors[4 * i + 2];
                    if (baseColor) {
                        if (r === 1 && g === 1 && b === 1) {
                            colorizedVertexData.colors[4 * i] = baseColor.r;
                            colorizedVertexData.colors[4 * i + 1] = baseColor.g;
                            colorizedVertexData.colors[4 * i + 2] = baseColor.b;
                            continue;
                        }
                    }
                    if (frameColor) {
                        if (r === 0.502 && g === 0.502 && b === 0.502) {
                            colorizedVertexData.colors[4 * i] = frameColor.r;
                            colorizedVertexData.colors[4 * i + 1] = frameColor.g;
                            colorizedVertexData.colors[4 * i + 2] = frameColor.b;
                            continue;
                        }
                    }
                    if (color1) {
                        if (r === 1 && g === 0 && b === 0) {
                            colorizedVertexData.colors[4 * i] = color1.r;
                            colorizedVertexData.colors[4 * i + 1] = color1.g;
                            colorizedVertexData.colors[4 * i + 2] = color1.b;
                            continue;
                        }
                    }
                    if (color2) {
                        if (r === 0 && g === 1 && b === 0) {
                            colorizedVertexData.colors[4 * i] = color2.r;
                            colorizedVertexData.colors[4 * i + 1] = color2.g;
                            colorizedVertexData.colors[4 * i + 2] = color2.b;
                            continue;
                        }
                    }
                    if (color3) {
                        if (r === 0 && g === 0 && b === 1) {
                            colorizedVertexData.colors[4 * i] = color3.r;
                            colorizedVertexData.colors[4 * i + 1] = color3.g;
                            colorizedVertexData.colors[4 * i + 2] = color3.b;
                            continue;
                        }
                    }
                }
            }
            else {
                let colors = [];
                for (let i = 0; i < colorizedVertexData.positions.length / 3; i++) {
                    colors[4 * i] = baseColor.r;
                    colors[4 * i + 1] = baseColor.g;
                    colors[4 * i + 2] = baseColor.b;
                    colors[4 * i + 3] = 1;
                }
                colorizedVertexData.colors = colors;
            }
            colorizedVertexDatas.push(colorizedVertexData);
        }
        return colorizedVertexDatas;
    }
}
var BlockMaterial;
(function (BlockMaterial) {
    BlockMaterial[BlockMaterial["Stone"] = 0] = "Stone";
    BlockMaterial[BlockMaterial["Wood"] = 1] = "Wood";
    BlockMaterial[BlockMaterial["SandStone"] = 2] = "SandStone";
    BlockMaterial[BlockMaterial["Brick"] = 3] = "Brick";
    BlockMaterial[BlockMaterial["Plastic"] = 4] = "Plastic";
})(BlockMaterial || (BlockMaterial = {}));
class Block extends BABYLON.Mesh {
    constructor() {
        super("block");
        this._i = 0;
        this._j = 0;
        this._k = 0;
        this._r = 0;
        this.material = Main.cellShadingMaterial;
    }
    get chunck() {
        return this._chunck;
    }
    set chunck(c) {
        this._chunck = c;
        this.parent = this.chunck;
    }
    get i() {
        return this._i;
    }
    set i(v) {
        this._i = v;
        this.position.x = this.i + 0.25;
    }
    get j() {
        return this._j;
    }
    set j(v) {
        this._j = v;
        this.position.y = this.j + 0.125;
    }
    get k() {
        return this._k;
    }
    set k(v) {
        this._k = v;
        this.position.z = this.k + 0.25;
    }
    get r() {
        return this._r;
    }
    set r(v) {
        this._r = v;
        this.rotation.y = Math.PI / 2 * this.r;
    }
    highlight() {
        this.renderOutline = true;
        this.outlineColor = BABYLON.Color3.Blue();
        this.outlineWidth = 0.01;
    }
    unlit() {
        this.renderOutline = false;
    }
    setCoordinates(coordinates) {
        this.i = coordinates.x;
        this.j = coordinates.y;
        this.k = coordinates.z;
    }
    setReference(reference) {
        this.reference = reference;
        this.name = "block-" + this.reference;
        this.blockMaterial = BlockVertexData.StringToBlockMaterial(this.reference.split("-")[0]);
        let m = this.reference.split("-");
        m.splice(0, 1);
        this.meshName = m.join("-");
        console.log("MeshName = " + this.meshName);
        BlockVertexData.GetVertexData(this.meshName, this.blockMaterial).then(data => {
            data.applyToMesh(this);
        });
    }
    serialize() {
        return {
            i: this.i,
            j: this.j,
            k: this.k,
            r: this.r,
            reference: this.reference
        };
    }
    deserialize(data) {
        this.i = data.i;
        this.j = data.j;
        this.k = data.k;
        this.r = data.r;
        this.setReference(data.reference);
    }
}
class BlockList {
}
BlockList.References = [
    "wood-bar-1-1-1",
    "wood-bar-1-1-2",
    "wood-bar-1-1-4",
    "stone-brick-1-1-1",
    "stone-brick-1-1-2",
    "stone-brick-1-1-4",
    "sandstone-brick-1-1-1",
    "sandstone-brick-1-1-2",
    "sandstone-brick-1-1-4",
    "stone-ramp-1-1-2",
    "stone-ramp-1-1-4",
    "sandstone-ramp-1-1-2",
    "sandstone-ramp-1-1-4",
    "brick-ramp-1-1-2",
    "brick-ramp-1-1-4",
    "plastic-light-wall",
    "plastic-light-wall-corner",
    "plastic-light-wall-door",
    "plastic-light-wall-window",
];
class BlockVertexData {
    static get BlockColors() {
        if (!BlockVertexData._BlockColors) {
            BlockVertexData._BlockColors = new Map();
            BlockVertexData._BlockColors.set(BlockMaterial.Stone, "#8a8a8a");
            BlockVertexData._BlockColors.set(BlockMaterial.Wood, "#784c05");
            BlockVertexData._BlockColors.set(BlockMaterial.SandStone, "#c9b449");
            BlockVertexData._BlockColors.set(BlockMaterial.Brick, "#b02e17");
            BlockVertexData._BlockColors.set(BlockMaterial.Plastic, "#cad8db");
        }
        return BlockVertexData._BlockColors;
    }
    static StringToBlockMaterial(s) {
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
    static async GetVertexData(reference, material) {
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
        return new Promise(resolve => {
            VertexDataLoader.instance.getColorizedMultiple(fileName, color).then(datas => {
                resolve(datas[meshIndex]);
            });
        });
    }
}
class Brick {
    constructor() {
        this._i = 0;
        this._j = 0;
        this._k = 0;
        this._r = 0;
    }
    static ParseReference(brickReference) {
        let splitRef = brickReference.split("-");
        let color = splitRef.pop();
        let name = splitRef.join("-");
        return {
            name: name,
            color: color
        };
    }
    get tile() {
        return this._tile;
    }
    set tile(c) {
        this._tile = c;
    }
    get i() {
        return this._i;
    }
    set i(v) {
        this._i = v;
    }
    get j() {
        return this._j;
    }
    set j(v) {
        this._j = v;
    }
    get k() {
        return this._k;
    }
    set k(v) {
        this._k = v;
    }
    get r() {
        return this._r;
    }
    set r(v) {
        this._r = v;
    }
    setCoordinates(coordinates) {
        this.i = coordinates.x;
        this.j = coordinates.y;
        this.k = coordinates.z;
    }
    serialize() {
        return {
            i: this.i,
            j: this.j,
            k: this.k,
            r: this.r,
            reference: this.reference.name + "-" + this.reference.color
        };
    }
    deserialize(data) {
        this.i = data.i;
        this.j = data.j;
        this.k = data.k;
        this.r = data.r;
        this.reference = Brick.ParseReference(data.reference);
    }
}
class BrickData {
    constructor() {
        this.knobs = [];
        this.covers = [];
        this.blocks = [];
    }
}
class BrickDataManager {
    static InitializeData() {
        BrickDataManager.BrickColors.set("brightyellow", BABYLON.Color4.FromInts(255, 205, 3, 255));
        BrickDataManager.BrickColors.set("brightorange", BABYLON.Color4.FromInts(245, 125, 32, 255));
        BrickDataManager.BrickColors.set("brightred", BABYLON.Color4.FromInts(221, 26, 33, 255));
        BrickDataManager.BrickColors.set("brightpurple", BABYLON.Color4.FromInts(233, 93, 162, 255));
        BrickDataManager.BrickColors.set("brightblue", BABYLON.Color4.FromInts(0, 108, 183, 255));
        BrickDataManager.BrickColors.set("brightbluetransparent", BABYLON.Color4.FromInts(0, 108, 183, 192));
        BrickDataManager.BrickColors.set("darkazur", BABYLON.Color4.FromInts(0, 163, 218, 255));
        BrickDataManager.BrickColors.set("yellowishgreen", BABYLON.Color4.FromInts(204, 225, 151, 255));
        BrickDataManager.BrickColors.set("brightgreen", BABYLON.Color4.FromInts(0, 175, 77, 255));
        BrickDataManager.BrickColors.set("brightyellowishgreen", BABYLON.Color4.FromInts(154, 202, 60, 255));
        BrickDataManager.BrickColors.set("redishbrown", BABYLON.Color4.FromInts(105, 46, 20, 255));
        BrickDataManager.BrickColors.set("nougat", BABYLON.Color4.FromInts(222, 139, 95, 255));
        BrickDataManager.BrickColors.set("white", BABYLON.Color4.FromInts(244, 244, 244, 255));
        BrickDataManager.BrickColors.forEach((color, name) => {
            BrickDataManager.BrickColorNames.push(name);
        });
        let LValues = [1, 2, 3, 4, 6, 8];
        let WValues = [1, 2];
        for (let i = 0; i < LValues.length; i++) {
            let L = LValues[i];
            for (let j = 0; j < WValues.length; j++) {
                let W = WValues[j];
                if (L >= W) {
                    // Brick
                    let brickData = new BrickData();
                    let brickName = "brick-" + W + "x" + L;
                    for (let w = 0; w < W; w++) {
                        for (let l = 0; l < L; l++) {
                            brickData.knobs.push(w, 3, l);
                            for (let h = 0; h < 0; h++) {
                                brickData.covers.push(w, h, l);
                                brickData.blocks.push(w, h, l);
                            }
                        }
                    }
                    BrickDataManager._BrickDatas.set(brickName, brickData);
                    BrickDataManager.BrickNames.push(brickName);
                    // Tile
                    let tileData = new BrickData();
                    let tileName = "tile-" + W + "x" + L;
                    for (let w = 0; w < W; w++) {
                        for (let l = 0; l < L; l++) {
                            tileData.covers.push(w, 0, l);
                            tileData.blocks.push(w, 0, l);
                        }
                    }
                    BrickDataManager._BrickDatas.set(tileName, tileData);
                    BrickDataManager.BrickNames.push(tileName);
                    // Plate
                    let plateData = new BrickData();
                    let plateName = "plate-" + W + "x" + L;
                    for (let w = 0; w < W; w++) {
                        for (let l = 0; l < L; l++) {
                            plateData.knobs.push(w, 1, l);
                            plateData.covers.push(w, 0, l);
                            plateData.blocks.push(w, 0, l);
                        }
                    }
                    BrickDataManager._BrickDatas.set(plateName, plateData);
                    BrickDataManager.BrickNames.push(plateName);
                }
            }
        }
        BrickDataManager.BrickNames.push("windshield-6x2x2");
        BrickDataManager._BrickDatas.set("windshield-6x2x2", {
            knobs: [0, 6, 0, 1, 6, 0, 2, 6, 0, 3, 6, 0, 4, 6, 0, 5, 6, 0],
            covers: [],
            blocks: []
        });
        BrickDataManager.BrickNames.push("windshield-6x3x2");
        BrickDataManager._BrickDatas.set("windshield-6x3x2", {
            knobs: [0, 9, 0, 1, 9, 0, 2, 9, 0, 3, 9, 0, 4, 9, 0, 5, 9, 0],
            covers: [],
            blocks: []
        });
    }
    static GetBrickData(brickReference) {
        return BrickDataManager._BrickDatas.get(brickReference.name);
    }
}
BrickDataManager.BrickColorNames = [];
BrickDataManager.BrickColors = new Map();
BrickDataManager.BrickNames = [];
BrickDataManager._BrickDatas = new Map();
class BrickVertexData {
    static async _LoadKnobsVertexDatas() {
        return new Promise(resolve => {
            BABYLON.SceneLoader.ImportMesh("", "./datas/meshes/knobs.babylon", "", Main.Scene, (meshes) => {
                for (let i = 0; i < meshes.length; i++) {
                    let mesh = meshes[i];
                    if (mesh instanceof BABYLON.Mesh) {
                        let lod = parseInt(mesh.name.replace("knob-lod", ""));
                        BrickVertexData._KnobVertexDatas[lod] = BABYLON.VertexData.ExtractFromMesh(mesh);
                        mesh.dispose();
                    }
                }
                resolve();
            });
        });
    }
    static async _LoadCubicTemplateVertexData() {
        return new Promise(resolve => {
            BABYLON.SceneLoader.ImportMesh("", "./datas/meshes/cubic-template.babylon", "", Main.Scene, (meshes) => {
                for (let i = 0; i < meshes.length; i++) {
                    let mesh = meshes[i];
                    if (mesh instanceof BABYLON.Mesh) {
                        BrickVertexData._CubicTemplateVertexData[i] = BABYLON.VertexData.ExtractFromMesh(mesh);
                        mesh.dispose();
                    }
                }
                resolve();
            });
        });
    }
    static async _LoadVertexData(fileName) {
        return new Promise(resolve => {
            BABYLON.SceneLoader.ImportMesh("", "./datas/meshes/" + fileName + ".babylon", "", Main.Scene, (meshes) => {
                for (let i = 0; i < meshes.length; i++) {
                    let mesh = meshes[i];
                    if (mesh instanceof BABYLON.Mesh) {
                        let name = mesh.name.split("-")[0];
                        let sizeString = mesh.name.split("-")[1];
                        let lodString = mesh.name.split("-")[2];
                        BrickVertexData._BrickVertexDatas.set(mesh.name, BABYLON.VertexData.ExtractFromMesh(mesh));
                        mesh.dispose();
                    }
                }
                resolve();
            });
        });
    }
    static async GenerateFromCubicTemplate(w, h, l, lod) {
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
    static async _LoadBrickVertexData(brickName, lod) {
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
        else {
            await BrickVertexData._LoadVertexData(type);
            return undefined;
        }
    }
    static async InitializeData() {
        await BrickVertexData._LoadKnobsVertexDatas();
        return true;
    }
    static AddKnob(x, y, z, positions, indices, normals, lod, colors, color) {
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
    static async GetBrickVertexData(brickReference, lod) {
        let data = BrickVertexData._BrickVertexDatas.get(brickReference.name + "-lod" + lod);
        if (!data) {
            data = await BrickVertexData._LoadBrickVertexData(brickReference.name, lod);
            if (data) {
                BrickVertexData._BrickVertexDatas.set(brickReference.name + "-lod" + lod, data);
            }
            else {
                data = BrickVertexData._BrickVertexDatas.get(brickReference.name + "-lod" + lod);
                if (!data) {
                    console.warn("GetBrickVertexData failed for brick " + brickReference + " at lod " + lod);
                }
            }
        }
        return data;
    }
    static async GetFullBrickVertexData(brickReference) {
        let vertexData = await BrickVertexData.GetBrickVertexData(brickReference, 0);
        let positions = [...vertexData.positions];
        let indices = [...vertexData.indices];
        let normals = [...vertexData.normals];
        let colors = [];
        let color = BrickDataManager.BrickColors.get(brickReference.color);
        for (let i = 0; i < positions.length / 3; i++) {
            colors.push(color.r, color.g, color.b, color.a);
        }
        let brickData = BrickDataManager.GetBrickData(brickReference);
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
BrickVertexData._CubicTemplateVertexData = [];
BrickVertexData._BrickVertexDatas = new Map();
BrickVertexData._KnobVertexDatas = [];
BrickVertexData.knobColorFactor = 0.9;
class Chunck extends BABYLON.Mesh {
    constructor(manager, i, j, k) {
        super("chunck_" + i + "_" + j + "_" + k);
        this.manager = manager;
        this.i = i;
        this.j = j;
        this.k = k;
        this.isEmpty = true;
        this.faces = [];
        this.vertices = [];
        this.cubes = [];
        this.blocks = [];
    }
    static ConstructChunck(manager, i, j, k) {
        return new Chunck_V2(manager, i, j, k);
    }
    getCube(i, j, k) {
        return this.manager.getCube(this.i * CHUNCK_SIZE + i, this.j * CHUNCK_SIZE + j, this.k * CHUNCK_SIZE + k);
    }
    setCube(i, j, k, cubeType) {
        if (cubeType !== CubeType.None) {
            if (!this.cubes[i]) {
                this.cubes[i] = [];
            }
            if (!this.cubes[i][j]) {
                this.cubes[i][j] = [];
            }
            this.cubes[i][j][k] = new Cube(this, i, j, k, cubeType);
            this.isEmpty = false;
        }
        else {
            if (this.cubes[i]) {
                if (this.cubes[i][j]) {
                    if (this.cubes[i][j][k]) {
                        this.cubes[i][j][k] = undefined;
                    }
                }
            }
        }
    }
    fatCube() {
        this.cubes = [];
        for (let i = 0; i < CHUNCK_SIZE; i++) {
            this.cubes[i] = [];
            for (let j = 0; j < CHUNCK_SIZE; j++) {
                this.cubes[i][j] = [];
            }
        }
        for (let i = 3; i < CHUNCK_SIZE - 3; i++) {
            for (let j = 3; j < CHUNCK_SIZE - 3; j++) {
                for (let k = 3; k < CHUNCK_SIZE - 3; k++) {
                    this.cubes[i][j][k] = new Cube(this, i, j, k);
                }
            }
        }
    }
    generateRandom() {
        this.cubes = [];
        for (let i = 0; i < CHUNCK_SIZE; i++) {
            this.cubes[i] = [];
            for (let j = 0; j < CHUNCK_SIZE; j++) {
                this.cubes[i][j] = [];
            }
        }
        for (let i = 0; i < CHUNCK_SIZE; i++) {
            for (let j = 0; j < CHUNCK_SIZE; j++) {
                for (let k = 0; k < CHUNCK_SIZE; k++) {
                    if (Math.random() > 0.4) {
                        this.cubes[i][j][k] = new Cube(this, i, j, k);
                    }
                }
            }
        }
    }
    makeEmpty() {
        this.cubes = [];
        for (let i = 0; i < CHUNCK_SIZE; i++) {
            this.cubes[i] = [];
            for (let j = 0; j < CHUNCK_SIZE; j++) {
                this.cubes[i][j] = [];
            }
        }
        this.isEmpty = false;
    }
    generateFull(cubeType) {
        this.cubes = [];
        for (let i = 0; i < CHUNCK_SIZE; i++) {
            this.cubes[i] = [];
            for (let j = 0; j < CHUNCK_SIZE; j++) {
                this.cubes[i][j] = [];
            }
        }
        for (let i = 0; i < CHUNCK_SIZE; i++) {
            for (let j = 0; j < CHUNCK_SIZE; j++) {
                for (let k = 0; k < CHUNCK_SIZE; k++) {
                    this.cubes[i][j][k] = new Cube(this, i, j, k, cubeType);
                }
            }
        }
        this.isEmpty = false;
    }
    randomizeNiceDouble() {
        this.cubes = [];
        for (let i = 0; i < CHUNCK_SIZE; i++) {
            this.cubes[i] = [];
            for (let j = 0; j < CHUNCK_SIZE; j++) {
                this.cubes[i][j] = [];
            }
        }
        for (let i = 1; i < CHUNCK_SIZE / 2 - 1; i++) {
            for (let j = 1; j < CHUNCK_SIZE / 2 - 1; j++) {
                for (let k = 1; k < CHUNCK_SIZE / 2 - 1; k++) {
                    if (Math.random() > 0.3) {
                        this.cubes[2 * i][2 * j][2 * k] = new Cube(this, 2 * i, 2 * j, 2 * k);
                        this.cubes[2 * i + 1][2 * j][2 * k] = new Cube(this, 2 * i + 1, 2 * j, 2 * k);
                        this.cubes[2 * i][2 * j + 1][2 * k] = new Cube(this, 2 * i, 2 * j + 1, 2 * k);
                        this.cubes[2 * i][2 * j][2 * k + 1] = new Cube(this, 2 * i, 2 * j, 2 * k + 1);
                        this.cubes[2 * i + 1][2 * j + 1][2 * k] = new Cube(this, 2 * i + 1, 2 * j + 1, 2 * k);
                        this.cubes[2 * i][2 * j + 1][2 * k + 1] = new Cube(this, 2 * i, 2 * j + 1, 2 * k + 1);
                        this.cubes[2 * i + 1][2 * j][2 * k + 1] = new Cube(this, 2 * i + 1, 2 * j, 2 * k + 1);
                        this.cubes[2 * i + 1][2 * j + 1][2 * k + 1] = new Cube(this, 2 * i + 1, 2 * j + 1, 2 * k + 1);
                    }
                }
            }
        }
    }
    generateTerrain() {
        this.cubes = [];
        for (let i = 0; i < CHUNCK_SIZE; i++) {
            this.cubes[i] = [];
            for (let j = 0; j < CHUNCK_SIZE; j++) {
                this.cubes[i][j] = [];
            }
        }
        for (let i = 0; i < CHUNCK_SIZE; i++) {
            for (let k = 0; k < CHUNCK_SIZE; k++) {
                let h = Math.floor(Math.random() * 4) + 2;
                for (let j = 0; j < h; j++) {
                    this.cubes[i][j][k] = new Cube(this, i, j, k);
                }
            }
        }
    }
    async generate() {
    }
    addBlock(block) {
        block.chunck = this;
        let i = this.blocks.indexOf(block);
        if (i === -1) {
            this.blocks.push(block);
        }
    }
    removeBlock(block) {
        let i = this.blocks.indexOf(block);
        if (i !== -1) {
            this.blocks.splice(i, 1);
        }
    }
    serialize() {
        let data = "";
        for (let i = 0; i < CHUNCK_SIZE; i++) {
            for (let j = 0; j < CHUNCK_SIZE; j++) {
                for (let k = 0; k < CHUNCK_SIZE; k++) {
                    let cube = this.getCube(i, j, k);
                    if (cube) {
                        data += cube.cubeType;
                    }
                    else {
                        data += "_";
                    }
                }
            }
        }
        let blockDatas = [];
        for (let i = 0; i < this.blocks.length; i++) {
            blockDatas.push(this.blocks[i].serialize());
        }
        let brickDatas = [];
        if (this instanceof Chunck_V2) {
            for (let i = 0; i < this.bricks.length; i++) {
                brickDatas.push(this.bricks[i].serialize());
            }
        }
        return {
            i: this.i,
            j: this.j,
            k: this.k,
            data: data,
            blocks: blockDatas,
            bricks: brickDatas
        };
    }
    deserialize(data) {
        let l = CHUNCK_SIZE * CHUNCK_SIZE * CHUNCK_SIZE;
        let i = 0;
        let j = 0;
        let k = 0;
        for (let n = 0; n < l; n++) {
            let v = data.data[n];
            if (v === "0") {
                this.setCube(i, j, k, CubeType.Dirt);
            }
            if (v === "1") {
                this.setCube(i, j, k, CubeType.Rock);
            }
            if (v === "2") {
                this.setCube(i, j, k, CubeType.Sand);
            }
            k++;
            if (k >= CHUNCK_SIZE) {
                k = 0;
                j++;
                if (j >= CHUNCK_SIZE) {
                    j = 0;
                    i++;
                }
            }
        }
        if (data.blocks) {
            for (let b = 0; b < data.blocks.length; b++) {
                let block = new Block();
                block.deserialize(data.blocks[b]);
                this.addBlock(block);
            }
        }
        if (data.bricks && this instanceof Chunck_V2) {
            for (let b = 0; b < data.bricks.length; b++) {
                let brick = new Brick();
                brick.deserialize(data.bricks[b]);
                this.addBrick(brick);
            }
        }
    }
}
class ChunckEditor {
    constructor(chunckManager) {
        this.chunckManager = chunckManager;
        this._xPointerDown = NaN;
        this._yPointerDown = NaN;
        this.brushCubeType = undefined;
        this.brushSize = 0;
        this.saveSceneName = "scene";
        document.getElementById("chunck-editor").style.display = "block";
        this.brushMesh = new BABYLON.Mesh("brush-mesh");
        this.updateBrushMesh();
        for (let i = 0; i < 4; i++) {
            let ii = i;
            document.getElementById("brush-type-button-" + ii).addEventListener("click", () => {
                if (this.brushCubeType === ii) {
                    this.brushCubeType = undefined;
                }
                else {
                    this.brushCubeType = ii;
                }
                this.applyBrushTypeButtonStyle();
                this.updateBrushMesh();
            });
        }
        for (let i = 0; i < 5; i++) {
            let ii = i;
            document.getElementById("brush-size-button-" + ii).addEventListener("click", () => {
                this.brushSize = ii;
                this.applyBrushSizeButtonStyle();
                this.updateBrushMesh();
            });
        }
        document.getElementById("save").addEventListener("click", () => {
            let data = chunckManager.serialize();
            let stringData = JSON.stringify(data);
            window.localStorage.setItem(this.saveSceneName, stringData);
        });
        Main.Scene.onPointerObservable.add((eventData, eventState) => {
            let showBrush = false;
            if (this.brushCubeType !== undefined) {
                if (eventData.type === BABYLON.PointerEventTypes.POINTERDOWN) {
                    this._xPointerDown = eventData.event.clientX;
                    this._yPointerDown = eventData.event.clientY;
                }
                else {
                    let pickInfo = Main.Scene.pickWithRay(eventData.pickInfo.ray, (m) => {
                        return m instanceof Chunck_V1;
                    });
                    let pickedMesh = pickInfo.pickedMesh;
                    if (pickedMesh instanceof Chunck_V1) {
                        let chunck = pickedMesh;
                        let localPickedPoint = pickInfo.pickedPoint.subtract(chunck.position);
                        let n = pickInfo.getNormal();
                        localPickedPoint.subtractInPlace(n.scale(0.5));
                        let coordinates = new BABYLON.Vector3(Math.floor(localPickedPoint.x), Math.floor(localPickedPoint.y), Math.floor(localPickedPoint.z));
                        if (this.brushCubeType !== CubeType.None) {
                            let absN = new BABYLON.Vector3(Math.abs(n.x), Math.abs(n.y), Math.abs(n.z));
                            if (absN.x > absN.y && absN.x > absN.z) {
                                if (n.x > 0) {
                                    coordinates.x++;
                                }
                                else {
                                    coordinates.x--;
                                }
                            }
                            if (absN.y > absN.x && absN.y > absN.z) {
                                if (n.y > 0) {
                                    coordinates.y++;
                                }
                                else {
                                    coordinates.y--;
                                }
                            }
                            if (absN.z > absN.x && absN.z > absN.y) {
                                if (n.z > 0) {
                                    coordinates.z++;
                                }
                                else {
                                    coordinates.z--;
                                }
                            }
                        }
                        if (eventData.type === BABYLON.PointerEventTypes.POINTERUP) {
                            if (Math.abs(eventData.event.clientX - this._xPointerDown) < 5 && Math.abs(eventData.event.clientY - this._yPointerDown) < 5) {
                                this.chunckManager.setChunckCube(chunck, coordinates.x, coordinates.y, coordinates.z, this.brushCubeType, this.brushSize, true);
                            }
                        }
                        this.brushMesh.position.copyFrom(chunck.position).addInPlace(coordinates);
                        this.brushMesh.position.x += 0.5;
                        this.brushMesh.position.y += 0.5;
                        this.brushMesh.position.z += 0.5;
                        showBrush = true;
                    }
                }
            }
            if (showBrush) {
                this.brushMesh.isVisible = true;
            }
            else {
                this.brushMesh.isVisible = false;
            }
        });
        this.applyBrushTypeButtonStyle();
        this.applyBrushSizeButtonStyle();
    }
    applyBrushTypeButtonStyle() {
        document.querySelectorAll(".brush-type-button").forEach(e => {
            if (e instanceof HTMLElement) {
                e.style.background = "white";
                e.style.color = "black";
            }
        });
        let e = document.getElementById("brush-type-button-" + this.brushCubeType);
        if (e) {
            e.style.background = "black";
            e.style.color = "white";
        }
    }
    applyBrushSizeButtonStyle() {
        document.querySelectorAll(".brush-size-button").forEach(e => {
            if (e instanceof HTMLElement) {
                e.style.background = "white";
                e.style.color = "black";
            }
        });
        let e = document.getElementById("brush-size-button-" + this.brushSize);
        e.style.background = "black";
        e.style.color = "white";
    }
    updateBrushMesh() {
        BABYLON.VertexData.CreateBox({
            width: 1 + 2 * this.brushSize + 0.2,
            height: 1 + 2 * this.brushSize + 0.2,
            depth: 1 + 2 * this.brushSize + 0.2
        }).applyToMesh(this.brushMesh);
        if (isFinite(this.brushCubeType)) {
            this.brushMesh.material = Cube.PreviewMaterials[this.brushCubeType];
        }
    }
}
class ChunckManager {
    constructor() {
        this.chuncks = new Map();
        this.updateBuffer = [];
        this.updateChunck = () => {
            if (this.updateBuffer.length > 0) {
                let sortSteps = Math.min(this.updateBuffer.length * 3, 100);
                let camPos = Main.Camera.position;
                for (let i = 0; i < sortSteps; i++) {
                    let r1 = Math.floor(Math.random() * (this.updateBuffer.length));
                    let r2 = Math.floor(Math.random() * (this.updateBuffer.length));
                    let i1 = Math.min(r1, r2);
                    let i2 = Math.max(r1, r2);
                    let c1 = this.updateBuffer[i1];
                    let c2 = this.updateBuffer[i2];
                    if (c1 && c2 && c1 !== c2) {
                        let d1 = BABYLON.Vector3.DistanceSquared(camPos, c1.position);
                        let d2 = BABYLON.Vector3.DistanceSquared(camPos, c2.position);
                        if (d2 > d1) {
                            this.updateBuffer[i1] = c2;
                            this.updateBuffer[i2] = c1;
                        }
                    }
                }
                let done = false;
                while (!done) {
                    let chunck = this.updateBuffer.pop();
                    if (chunck) {
                        if (!chunck.isEmpty) {
                            chunck.generate();
                            done = true;
                        }
                    }
                    else {
                        done = true;
                    }
                }
            }
        };
        Main.Scene.onBeforeRenderObservable.add(this.updateChunck);
    }
    async generateManyChuncks(chuncks) {
        return new Promise(resolve => {
            let iterator = 0;
            let step = () => {
                let done = false;
                while (!done) {
                    let chunck = chuncks[iterator];
                    iterator++;
                    if (chunck) {
                        if (!chunck.isEmpty) {
                            chunck.generate();
                            done = true;
                            requestAnimationFrame(step);
                        }
                    }
                    else {
                        done = true;
                        resolve();
                    }
                }
            };
            step();
        });
    }
    generateRandom(d = 1) {
        this.generateAroundZero(d);
        for (let i = -d; i <= d; i++) {
            let mapMapChuncks = this.chuncks.get(i);
            for (let j = -d; j <= d; j++) {
                let mapChuncks = mapMapChuncks.get(j);
                for (let k = -d; k <= d; k++) {
                    mapChuncks.get(k).generateRandom();
                }
            }
        }
    }
    generateFromMesh(skullMesh, rockMesh, sandMesh, dirtMesh, d = 2) {
        this.generateAboveZero(d);
        for (let i = -3 * CHUNCK_SIZE; i < 3 * CHUNCK_SIZE; i++) {
            for (let j = -CHUNCK_SIZE; j < 2 * 3 * CHUNCK_SIZE; j++) {
                for (let k = -3 * CHUNCK_SIZE; k < 3 * CHUNCK_SIZE; k++) {
                    let p = new BABYLON.Vector3(i + 0.5, j + 0.5, k + 0.5);
                    let dir = p.subtract(new BABYLON.Vector3(0, 20, 0)).normalize();
                    let r = new BABYLON.Ray(p, dir);
                    if (r.intersectsMesh(skullMesh).hit) {
                        this.setCube(i, j, k, CubeType.Rock);
                    }
                }
            }
        }
        for (let i = -d * CHUNCK_SIZE; i < d * CHUNCK_SIZE; i++) {
            for (let k = -d * CHUNCK_SIZE; k < d * CHUNCK_SIZE; k++) {
                for (let j = 2 * d * CHUNCK_SIZE; j >= -CHUNCK_SIZE; j--) {
                    let cube = this.getCube(i, j, k);
                    if (cube) {
                        let r = Math.random();
                        if (r > 0.05) {
                            this.setCube(i, j + 1, k, CubeType.Dirt);
                        }
                        if (r > 0.9) {
                            this.setCube(i, j + 2, k, CubeType.Dirt);
                        }
                        break;
                    }
                }
            }
        }
        for (let i = -d * CHUNCK_SIZE; i < d * CHUNCK_SIZE; i++) {
            for (let k = -d * CHUNCK_SIZE; k < d * CHUNCK_SIZE; k++) {
                let p = new BABYLON.Vector3(i + 0.5, 100, k + 0.5);
                let dir = new BABYLON.Vector3(0, -1, 0);
                let r = new BABYLON.Ray(p, dir);
                let pickInfo = r.intersectsMesh(dirtMesh);
                if (pickInfo.hit) {
                    let h = pickInfo.pickedPoint.y;
                    for (let j = -1; j <= h; j++) {
                        this.setCube(i, j, k, CubeType.Dirt);
                    }
                }
            }
        }
        for (let i = -d * CHUNCK_SIZE; i < d * CHUNCK_SIZE; i++) {
            for (let k = -d * CHUNCK_SIZE; k < d * CHUNCK_SIZE; k++) {
                let p = new BABYLON.Vector3(i + 0.5, 100, k + 0.5);
                let dir = new BABYLON.Vector3(0, -1, 0);
                let r = new BABYLON.Ray(p, dir);
                let pickInfo = r.intersectsMesh(rockMesh);
                if (pickInfo.hit) {
                    let h = pickInfo.pickedPoint.y;
                    for (let j = -1; j <= h; j++) {
                        this.setCube(i, j, k, CubeType.Rock);
                    }
                }
            }
        }
        for (let i = -d * CHUNCK_SIZE; i < d * CHUNCK_SIZE; i++) {
            for (let k = -d * CHUNCK_SIZE; k < d * CHUNCK_SIZE; k++) {
                let p = new BABYLON.Vector3(i + 0.5, 100, k + 0.5);
                let dir = new BABYLON.Vector3(0, -1, 0);
                let r = new BABYLON.Ray(p, dir);
                let pickInfo = r.intersectsMesh(sandMesh);
                let h = 0;
                if (pickInfo.hit) {
                    h = pickInfo.pickedPoint.y;
                }
                for (let j = -1; j <= Math.max(h, 0); j++) {
                    this.setCube(i, j, k, CubeType.Sand);
                }
            }
        }
    }
    generateTerrain(d = 2) {
        this.generateAroundZero(d);
        for (let i = -d * CHUNCK_SIZE; i < d * CHUNCK_SIZE; i++) {
            for (let k = -d * CHUNCK_SIZE; k < d * CHUNCK_SIZE; k++) {
                let r = Math.floor(i * i + k * k);
                let pSand = r / (d * CHUNCK_SIZE * 10);
                pSand = 1 - pSand;
                let hSand = Math.max(-1, Math.floor(Math.random() * pSand * 3));
                for (let j = 0; j <= hSand; j++) {
                    this.setCube(i, j, k, CubeType.Sand);
                }
                let pDirt = r / (d * CHUNCK_SIZE * 7);
                pDirt = 1 - pDirt;
                let hDirt = Math.max(-1, Math.floor(Math.random() * pDirt * 4));
                for (let j = 1; j <= hDirt; j++) {
                    this.setCube(i, j + hSand, k, CubeType.Dirt);
                }
            }
        }
    }
    generateHeightFunction(d, heightFunction) {
        this.generateAroundZero(d);
        for (let i = -d * CHUNCK_SIZE; i < d * CHUNCK_SIZE; i++) {
            for (let k = -d * CHUNCK_SIZE; k < d * CHUNCK_SIZE; k++) {
                let h = Math.floor(heightFunction(i, k));
                let hDirt = Math.floor(Math.random() * 3 + 0.5);
                for (let j = -d * CHUNCK_SIZE; j <= h - hDirt; j++) {
                    this.setCube(i, j, k, CubeType.Rock);
                }
                for (let j = h - hDirt + 1; j <= h; j++) {
                    this.setCube(i, j, k, CubeType.Dirt);
                }
            }
        }
    }
    createChunck(i, j, k) {
        let mapMapChuncks = this.chuncks.get(i);
        if (!mapMapChuncks) {
            mapMapChuncks = new Map();
            this.chuncks.set(i, mapMapChuncks);
        }
        let mapChuncks = mapMapChuncks.get(j);
        if (!mapChuncks) {
            mapChuncks = new Map();
            mapMapChuncks.set(j, mapChuncks);
        }
        let chunck = mapChuncks.get(k);
        if (!chunck) {
            chunck = Chunck.ConstructChunck(this, i, j, k);
            mapChuncks.set(k, chunck);
        }
        return chunck;
    }
    getChunck(i, j, k) {
        let mapMapChuncks = this.chuncks.get(i);
        if (mapMapChuncks) {
            let mapChuncks = mapMapChuncks.get(j);
            if (mapChuncks) {
                return mapChuncks.get(k);
            }
        }
    }
    getCube(I, J, K) {
        let iChunck = Math.floor(I / CHUNCK_SIZE);
        let jChunck = Math.floor(J / CHUNCK_SIZE);
        let kChunck = Math.floor(K / CHUNCK_SIZE);
        let chunck = this.getChunck(iChunck, jChunck, kChunck);
        if (chunck) {
            let iCube = I - iChunck * CHUNCK_SIZE;
            let jCube = J - jChunck * CHUNCK_SIZE;
            let kCube = K - kChunck * CHUNCK_SIZE;
            if (chunck.cubes[iCube]) {
                if (chunck.cubes[iCube][jCube]) {
                    return chunck.cubes[iCube][jCube][kCube];
                }
            }
        }
    }
    setChunckCube(chunck, i, j, k, cubeType, r = 0, redraw = false) {
        this.setCube(chunck.i * CHUNCK_SIZE + i, chunck.j * CHUNCK_SIZE + j, chunck.k * CHUNCK_SIZE + k, cubeType, r, redraw);
    }
    setCube(I, J, K, cubeType, r = 0, redraw = false) {
        if (r === 0) {
            let iChunck = Math.floor(I / CHUNCK_SIZE);
            let jChunck = Math.floor(J / CHUNCK_SIZE);
            let kChunck = Math.floor(K / CHUNCK_SIZE);
            let chunck = this.getChunck(iChunck, jChunck, kChunck);
            if (chunck) {
                let iCube = I - iChunck * CHUNCK_SIZE;
                let jCube = J - jChunck * CHUNCK_SIZE;
                let kCube = K - kChunck * CHUNCK_SIZE;
                chunck.setCube(iCube, jCube, kCube, cubeType);
                if (redraw) {
                    this.redrawZone(I - 1, J - 1, K - 1, I + 1, J + 1, K + 1);
                }
            }
        }
        else {
            for (let II = -r; II <= r; II++) {
                for (let JJ = -r; JJ <= r; JJ++) {
                    for (let KK = -r; KK <= r; KK++) {
                        this.setCube(I + II, J + JJ, K + KK, cubeType, 0, false);
                    }
                }
            }
            if (redraw) {
                this.redrawZone(I - 1 - r, J - 1 - r, K - 1 - r, I + 1 + r, J + 1 + r, K + 1 + r);
            }
        }
    }
    redrawZone(IMin, JMin, KMin, IMax, JMax, KMax) {
        let iChunckMin = Math.floor(IMin / CHUNCK_SIZE);
        let jChunckMin = Math.floor(JMin / CHUNCK_SIZE);
        let kChunckMin = Math.floor(KMin / CHUNCK_SIZE);
        let iChunckMax = Math.floor(IMax / CHUNCK_SIZE);
        let jChunckMax = Math.floor(JMax / CHUNCK_SIZE);
        let kChunckMax = Math.floor(KMax / CHUNCK_SIZE);
        for (let i = iChunckMin; i <= iChunckMax; i++) {
            for (let j = jChunckMin; j <= jChunckMax; j++) {
                for (let k = kChunckMin; k <= kChunckMax; k++) {
                    let redrawnChunck = this.getChunck(i, j, k);
                    if (redrawnChunck) {
                        redrawnChunck.generate();
                    }
                }
            }
        }
    }
    generateAroundZero(d) {
        for (let i = -d; i <= d; i++) {
            let mapMapChuncks = new Map();
            this.chuncks.set(i, mapMapChuncks);
            for (let j = -d; j <= d; j++) {
                let mapChuncks = new Map();
                mapMapChuncks.set(j, mapChuncks);
                for (let k = -d; k <= d; k++) {
                    let chunck = Chunck.ConstructChunck(this, i, j, k);
                    mapChuncks.set(k, chunck);
                }
            }
        }
    }
    generateAboveZero(d) {
        for (let i = -d; i <= d; i++) {
            let mapMapChuncks = new Map();
            this.chuncks.set(i, mapMapChuncks);
            for (let j = -1; j <= 2 * d - 1; j++) {
                let mapChuncks = new Map();
                mapMapChuncks.set(j, mapChuncks);
                for (let k = -d; k <= d; k++) {
                    let chunck = Chunck.ConstructChunck(this, i, j, k);
                    mapChuncks.set(k, chunck);
                }
            }
        }
    }
    foreachChunck(callback) {
        this.chuncks.forEach(m => {
            m.forEach(mm => {
                mm.forEach(chunck => {
                    callback(chunck);
                });
            });
        });
    }
    serialize() {
        let data = {
            chuncks: []
        };
        this.chuncks.forEach(m => {
            m.forEach(mm => {
                mm.forEach(chunck => {
                    data.chuncks.push(chunck.serialize());
                });
            });
        });
        return data;
    }
    deserialize(data) {
        for (let i = 0; i < data.chuncks.length; i++) {
            let d = data.chuncks[i];
            if (d) {
                this.createChunck(d.i, d.j, d.k).deserialize(d);
            }
        }
    }
}
class ChunckUtils {
    static CubeTypeToString(cubeType) {
        if (cubeType === CubeType.Dirt) {
            return "Dirt";
        }
        if (cubeType === CubeType.Rock) {
            return "Rock";
        }
        if (cubeType === CubeType.Sand) {
            return "Sand";
        }
        if (cubeType === CubeType.None) {
            return "None";
        }
    }
    static WorldPositionToChunckBlockCoordinates_V1(world) {
        let I = Math.floor(world.x / CHUNCK_SIZE);
        let J = Math.floor(world.y / CHUNCK_SIZE);
        let K = Math.floor(world.z / CHUNCK_SIZE);
        let coordinates = world.clone();
        coordinates.x = Math.floor(2 * (coordinates.x - I * CHUNCK_SIZE)) / 2;
        coordinates.y = Math.floor(4 * (coordinates.y - J * CHUNCK_SIZE)) / 4;
        coordinates.z = Math.floor(2 * (coordinates.z - K * CHUNCK_SIZE)) / 2;
        return {
            chunck: Main.ChunckManager.getChunck(I, J, K),
            coordinates: coordinates
        };
    }
    static WorldPositionToChunckBlockCoordinates_V2(world) {
        let I = Math.floor(world.x / CHUNCK_SIZE * 1.6);
        let J = Math.floor(world.y / CHUNCK_SIZE * 0.96);
        let K = Math.floor(world.z / CHUNCK_SIZE * 1.6);
        let coordinates = world.clone();
        coordinates.x = Math.floor(2 * (coordinates.x - I * CHUNCK_SIZE * 1.6)) / 2;
        coordinates.y = Math.floor(2 * (coordinates.y - J * CHUNCK_SIZE * 0.96)) / 2;
        coordinates.z = Math.floor(2 * (coordinates.z - K * CHUNCK_SIZE * 1.6)) / 2;
        return {
            chunck: Main.ChunckManager.getChunck(I, J, K),
            coordinates: coordinates
        };
    }
    static WorldPositionToChunckBrickCoordinates_V2(world) {
        let I = Math.floor(world.x / CHUNCK_SIZE * 1.6);
        let J = Math.floor(world.y / CHUNCK_SIZE * 0.96);
        let K = Math.floor(world.z / CHUNCK_SIZE * 1.6);
        let coordinates = world.clone();
        coordinates.x -= I * CHUNCK_SIZE * 1.6;
        coordinates.y -= J * CHUNCK_SIZE * 0.96;
        coordinates.z -= K * CHUNCK_SIZE * 1.6;
        coordinates.x = Math.round(coordinates.x / 0.8);
        coordinates.y = Math.floor(coordinates.y / 0.32);
        coordinates.z = Math.round(coordinates.z / 0.8);
        return {
            chunck: Main.ChunckManager.getChunck(I, J, K),
            coordinates: coordinates
        };
    }
    static WorldPositionToTileBrickCoordinates(world) {
        let iGlobal = Math.round(world.x / DX);
        let jGlobal = Math.round(world.z / DX);
        let I = Math.floor(iGlobal / TILE_SIZE / 2);
        let J = Math.floor(jGlobal / TILE_SIZE / 2);
        let tile = TileManager.GetTile(I, J);
        let i = Math.round((world.x - I * (TILE_SIZE * DX * 2)) / DX);
        let j = Math.round((world.z - J * (TILE_SIZE * DX * 2)) / DX);
        let k = Math.floor(world.y / DY);
        return {
            tile: tile,
            i: i,
            j: j,
            k: k
        };
    }
    static XYScreenToChunckV1Coordinates(x, y, behindPickedFace = false) {
        let pickInfo = Main.Scene.pick(x, y, (m) => {
            return m instanceof Chunck_V1;
        });
        let pickedMesh = pickInfo.pickedMesh;
        if (pickedMesh instanceof Chunck_V1) {
            let chunck = pickedMesh;
            let localPickedPoint = pickInfo.pickedPoint.subtract(chunck.position);
            let n = pickInfo.getNormal();
            localPickedPoint.subtractInPlace(n.scale(0.5));
            let coordinates = new BABYLON.Vector3(Math.floor(localPickedPoint.x), Math.floor(localPickedPoint.y), Math.floor(localPickedPoint.z));
            let absN = new BABYLON.Vector3(Math.abs(n.x), Math.abs(n.y), Math.abs(n.z));
            if (!behindPickedFace) {
                if (absN.x > absN.y && absN.x > absN.z) {
                    if (n.x > 0) {
                        coordinates.x++;
                    }
                    else {
                        coordinates.x--;
                    }
                }
                if (absN.y > absN.x && absN.y > absN.z) {
                    if (n.y > 0) {
                        coordinates.y++;
                    }
                    else {
                        coordinates.y--;
                    }
                }
                if (absN.z > absN.x && absN.z > absN.y) {
                    if (n.z > 0) {
                        coordinates.z++;
                    }
                    else {
                        coordinates.z--;
                    }
                }
            }
            return {
                chunck: chunck,
                coordinates: coordinates
            };
        }
    }
    static XYScreenToChunckV2Coordinates(x, y, behindPickedFace = false) {
        let pickInfo = Main.Scene.pick(x, y, (m) => {
            return m instanceof Chunck_V2;
        });
        let pickedMesh = pickInfo.pickedMesh;
        if (pickedMesh instanceof Chunck_V2) {
            let chunck = pickedMesh;
            let localPickedPoint = pickInfo.pickedPoint.subtract(chunck.position);
            let n = pickInfo.getNormal();
            localPickedPoint.subtractInPlace(n.scale(0.5));
            let coordinates = new BABYLON.Vector3(Math.round(localPickedPoint.x / 1.6), Math.floor(localPickedPoint.y / 0.96) + 1, Math.round(localPickedPoint.z / 1.6));
            let absN = new BABYLON.Vector3(Math.abs(n.x), Math.abs(n.y), Math.abs(n.z));
            if (!behindPickedFace) {
                if (absN.x > absN.y && absN.x > absN.z) {
                    if (n.x > 0) {
                        coordinates.x++;
                    }
                    else {
                        coordinates.x--;
                    }
                }
                if (absN.y > absN.x && absN.y > absN.z) {
                    if (n.y > 0) {
                        coordinates.y++;
                    }
                    else {
                        coordinates.y--;
                    }
                }
                if (absN.z > absN.x && absN.z > absN.y) {
                    if (n.z > 0) {
                        coordinates.z++;
                    }
                    else {
                        coordinates.z--;
                    }
                }
            }
            return {
                chunck: chunck,
                coordinates: coordinates
            };
        }
    }
}
class ChunckVertexData {
    static RotateYChunckPartName(name) {
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
    static _Flip01(c) {
        return c === "0" ? "1" : "0";
    }
    static FlipChunckPartName(name) {
        let output = "";
        for (let i = 0; i < name.length; i++) {
            output += ChunckVertexData._Flip01(name[i]);
        }
        return output;
    }
    static MirrorXChunckPartName(name) {
        let v0 = name[0];
        let v1 = name[1];
        let v2 = name[2];
        let v3 = name[3];
        let v4 = name[4];
        let v5 = name[5];
        let v6 = name[6];
        let v7 = name[7];
        return v1 + v0 + v3 + v2 + v5 + v4 + v7 + v6;
    }
    static MirrorYChunckPartName(name) {
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
    static MirrorZChunckPartName(name) {
        let v0 = name[0];
        let v1 = name[1];
        let v2 = name[2];
        let v3 = name[3];
        let v4 = name[4];
        let v5 = name[5];
        let v6 = name[6];
        let v7 = name[7];
        return v3 + v2 + v1 + v0 + v7 + v6 + v5 + v4;
    }
    static _TryAddFlipedChunckPart(name, data) {
        return false;
        let flipedName = ChunckVertexData.FlipChunckPartName(name);
        if (!ChunckVertexData._VertexDatas.has(flipedName)) {
            let flipedData = ChunckVertexData.Flip(data);
            ChunckVertexData._VertexDatas.set(flipedName, flipedData);
            return true;
        }
        return false;
    }
    static _TryAddMirrorXChunckPart(name, data) {
        let mirrorXName = ChunckVertexData.MirrorXChunckPartName(name);
        if (!ChunckVertexData._VertexDatas.has(mirrorXName)) {
            let mirrorXData = ChunckVertexData.MirrorX(data);
            ChunckVertexData._VertexDatas.set(mirrorXName, mirrorXData);
            ChunckVertexData._TryAddMirrorZChunckPart(mirrorXName, mirrorXData);
            return true;
        }
        return false;
    }
    static _TryAddMirrorYChunckPart(name, data) {
        let mirrorYName = ChunckVertexData.MirrorYChunckPartName(name);
        if (!ChunckVertexData._VertexDatas.has(mirrorYName)) {
            let mirrorYData = ChunckVertexData.MirrorY(data);
            ChunckVertexData._VertexDatas.set(mirrorYName, mirrorYData);
            ChunckVertexData._TryAddMirrorZChunckPart(mirrorYName, mirrorYData);
            return true;
        }
        return false;
    }
    static _TryAddMirrorZChunckPart(name, data) {
        let mirrorZName = ChunckVertexData.MirrorZChunckPartName(name);
        if (!ChunckVertexData._VertexDatas.has(mirrorZName)) {
            let mirrorZData = ChunckVertexData.MirrorZ(data);
            ChunckVertexData._VertexDatas.set(mirrorZName, mirrorZData);
            return true;
        }
        return false;
    }
    static async _LoadChunckVertexDatas() {
        return new Promise(resolve => {
            BABYLON.SceneLoader.ImportMesh("", "./datas/meshes/chunck-parts.babylon", "", Main.Scene, (meshes) => {
                for (let i = 0; i < meshes.length; i++) {
                    let mesh = meshes[i];
                    if (mesh instanceof BABYLON.Mesh && mesh.name != "zero") {
                        let useful = false;
                        let name = mesh.name;
                        let data = BABYLON.VertexData.ExtractFromMesh(mesh);
                        if (!data.colors || data.colors.length / 4 != data.positions.length / 3) {
                            let colors = [];
                            for (let j = 0; j < data.positions.length / 3; j++) {
                                colors.push(1, 1, 1, 1);
                            }
                            data.colors = colors;
                        }
                        mesh.dispose();
                        if (!ChunckVertexData._VertexDatas.has(name)) {
                            ChunckVertexData._VertexDatas.set(name, data);
                            useful = true;
                        }
                        useful = ChunckVertexData._TryAddFlipedChunckPart(name, data) || useful;
                        useful = ChunckVertexData._TryAddMirrorXChunckPart(name, data) || useful;
                        useful = ChunckVertexData._TryAddMirrorYChunckPart(name, data) || useful;
                        useful = ChunckVertexData._TryAddMirrorZChunckPart(name, data) || useful;
                        let rotatedName = name;
                        for (let j = 0; j < 3; j++) {
                            rotatedName = ChunckVertexData.RotateYChunckPartName(rotatedName);
                            data = ChunckVertexData.RotateY(data, -Math.PI / 2);
                            if (!ChunckVertexData._VertexDatas.has(rotatedName)) {
                                ChunckVertexData._VertexDatas.set(rotatedName, data);
                                useful = true;
                            }
                            useful = ChunckVertexData._TryAddFlipedChunckPart(rotatedName, data) || useful;
                            useful = ChunckVertexData._TryAddMirrorXChunckPart(rotatedName, data) || useful;
                            useful = ChunckVertexData._TryAddMirrorYChunckPart(rotatedName, data) || useful;
                            useful = ChunckVertexData._TryAddMirrorZChunckPart(rotatedName, data) || useful;
                        }
                        if (!useful) {
                            console.warn("Chunck-Part " + name + " is redundant.");
                        }
                    }
                }
                resolve();
            });
        });
    }
    static async InitializeData() {
        await ChunckVertexData._LoadChunckVertexDatas();
        return true;
    }
    static Clone(data) {
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
    static Get(name) {
        return ChunckVertexData._VertexDatas.get(name);
    }
    static RotateY(baseData, angle) {
        let data = new BABYLON.VertexData();
        let positions = [...baseData.positions];
        let normals;
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
            positions[3 * i + 2] = x * sina + z * cosa;
            if (normals) {
                let xn = normals[3 * i];
                let zn = normals[3 * i + 2];
                normals[3 * i] = xn * cosa - zn * sina;
                normals[3 * i + 2] = xn * sina + zn * cosa;
            }
        }
        data.positions = positions;
        if (normals) {
            data.normals = normals;
        }
        if (baseData.colors) {
            data.colors = [...baseData.colors];
        }
        return data;
    }
    static Flip(baseData) {
        let data = new BABYLON.VertexData();
        data.positions = [...baseData.positions];
        if (baseData.normals && baseData.normals.length === baseData.positions.length) {
            let normals = [];
            for (let i = 0; i < baseData.normals.length / 3; i++) {
                normals.push(-baseData.normals[3 * i], -baseData.normals[3 * i + 1], -baseData.normals[3 * i + 2]);
            }
            data.normals = normals;
        }
        let indices = [];
        for (let i = 0; i < baseData.indices.length / 3; i++) {
            indices.push(baseData.indices[3 * i], baseData.indices[3 * i + 2], baseData.indices[3 * i + 1]);
        }
        data.indices = indices;
        if (baseData.colors) {
            data.colors = [...baseData.colors];
        }
        return data;
    }
    static MirrorX(baseData) {
        let data = new BABYLON.VertexData();
        let positions = [];
        for (let i = 0; i < baseData.positions.length / 3; i++) {
            positions.push(-baseData.positions[3 * i], baseData.positions[3 * i + 1], baseData.positions[3 * i + 2]);
        }
        data.positions = positions;
        if (baseData.normals && baseData.normals.length === baseData.positions.length) {
            let normals = [];
            for (let i = 0; i < baseData.normals.length / 3; i++) {
                normals.push(-baseData.normals[3 * i], baseData.normals[3 * i + 1], baseData.normals[3 * i + 2]);
            }
            data.normals = normals;
        }
        let indices = [];
        for (let i = 0; i < baseData.indices.length / 3; i++) {
            indices.push(baseData.indices[3 * i], baseData.indices[3 * i + 2], baseData.indices[3 * i + 1]);
        }
        data.indices = indices;
        if (baseData.colors) {
            data.colors = [...baseData.colors];
        }
        return data;
    }
    static MirrorY(baseData) {
        let data = new BABYLON.VertexData();
        let positions = [];
        for (let i = 0; i < baseData.positions.length / 3; i++) {
            positions.push(baseData.positions[3 * i], -baseData.positions[3 * i + 1], baseData.positions[3 * i + 2]);
        }
        data.positions = positions;
        if (baseData.normals && baseData.normals.length === baseData.positions.length) {
            let normals = [];
            for (let i = 0; i < baseData.normals.length / 3; i++) {
                normals.push(baseData.normals[3 * i], -baseData.normals[3 * i + 1], baseData.normals[3 * i + 2]);
            }
            data.normals = normals;
        }
        let indices = [];
        for (let i = 0; i < baseData.indices.length / 3; i++) {
            indices.push(baseData.indices[3 * i], baseData.indices[3 * i + 2], baseData.indices[3 * i + 1]);
        }
        data.indices = indices;
        if (baseData.colors) {
            data.colors = [...baseData.colors];
        }
        return data;
    }
    static MirrorZ(baseData) {
        let data = new BABYLON.VertexData();
        let positions = [];
        for (let i = 0; i < baseData.positions.length / 3; i++) {
            positions.push(baseData.positions[3 * i], baseData.positions[3 * i + 1], -baseData.positions[3 * i + 2]);
        }
        data.positions = positions;
        if (baseData.normals && baseData.normals.length === baseData.positions.length) {
            let normals = [];
            for (let i = 0; i < baseData.normals.length / 3; i++) {
                normals.push(baseData.normals[3 * i], baseData.normals[3 * i + 1], -baseData.normals[3 * i + 2]);
            }
            data.normals = normals;
        }
        let indices = [];
        for (let i = 0; i < baseData.indices.length / 3; i++) {
            indices.push(baseData.indices[3 * i], baseData.indices[3 * i + 2], baseData.indices[3 * i + 1]);
        }
        data.indices = indices;
        if (baseData.colors) {
            data.colors = [...baseData.colors];
        }
        return data;
    }
    static RotateRef(ref, rotation) {
        return ref.substr(rotation) + ref.substring(0, rotation);
    }
}
ChunckVertexData._VertexDatas = new Map();
/// <reference path="./Chunck.ts"/>
var CHUNCK_SIZE = 8;
class Face {
    constructor(vertices, cubeType, draw = true) {
        this.vertices = vertices;
        this.cubeType = cubeType;
        this.draw = draw;
    }
}
class Chunck_V1 extends Chunck {
    constructor(manager, i, j, k) {
        super(manager, i, j, k);
        this.name = "chunck_v1_" + i + "_" + j + "_" + k;
        this.position.x = CHUNCK_SIZE * this.i;
        this.position.y = CHUNCK_SIZE * this.j;
        this.position.z = CHUNCK_SIZE * this.k;
    }
    async generate() {
        this.generateVertices();
        this.generateFaces();
    }
    generateVertices() {
        this.vertices = [];
        this.faces = [];
        for (let i = -2; i < CHUNCK_SIZE + 3; i++) {
            for (let j = -2; j < CHUNCK_SIZE + 3; j++) {
                for (let k = -2; k < CHUNCK_SIZE + 3; k++) {
                    let cube = this.getCube(i, j, k);
                    if (cube) {
                        delete cube.v000;
                        delete cube.v001;
                        delete cube.v010;
                        delete cube.v011;
                        delete cube.v100;
                        delete cube.v101;
                        delete cube.v110;
                        delete cube.v111;
                    }
                }
            }
        }
        for (let i = -1; i < CHUNCK_SIZE + 2; i++) {
            for (let j = -1; j < CHUNCK_SIZE + 2; j++) {
                for (let k = -1; k < CHUNCK_SIZE + 2; k++) {
                    let adjacentCubes = [];
                    for (let ii = -1; ii < 1; ii++) {
                        for (let jj = -1; jj < 1; jj++) {
                            for (let kk = -1; kk < 1; kk++) {
                                let cube = this.getCube(i + ii, j + jj, k + kk);
                                if (cube) {
                                    adjacentCubes.push(cube);
                                }
                            }
                        }
                    }
                    if (adjacentCubes.length > 0) {
                        if (adjacentCubes.length === 1) {
                            let v = new Vertex(i, j, k);
                            v.index = this.vertices.length;
                            this.vertices.push(v);
                            adjacentCubes[0].addVertex(v);
                            v.addCubeType(adjacentCubes[0].cubeType);
                        }
                        else if (adjacentCubes.length > 1 && adjacentCubes.length < 6) {
                            while (adjacentCubes.length > 0) {
                                let v = new Vertex(i, j, k);
                                v.index = this.vertices.length;
                                this.vertices.push(v);
                                let vCubes = [adjacentCubes.pop()];
                                vCubes[0].addVertex(v);
                                v.addCubeType(vCubes[0].cubeType);
                                let done = false;
                                let lastCubeLength = adjacentCubes.length;
                                while (!done) {
                                    for (let c = 0; c < adjacentCubes.length; c++) {
                                        let cube = adjacentCubes[c];
                                        let shareFace = false;
                                        for (let v = 0; v < vCubes.length; v++) {
                                            if (vCubes[v].shareFace(cube)) {
                                                shareFace = true;
                                                break;
                                            }
                                        }
                                        if (shareFace) {
                                            cube.addVertex(v);
                                            v.addCubeType(cube.cubeType);
                                            adjacentCubes.splice(c, 1);
                                            c--;
                                            vCubes.push(cube);
                                        }
                                    }
                                    done = lastCubeLength === adjacentCubes.length;
                                    lastCubeLength = adjacentCubes.length;
                                }
                            }
                        }
                        else if (adjacentCubes.length < 8) {
                            let v = new Vertex(i, j, k);
                            v.index = this.vertices.length;
                            v.addCubeType(adjacentCubes[0].cubeType);
                            this.vertices.push(v);
                            for (let c = 0; c < adjacentCubes.length; c++) {
                                adjacentCubes[c].addVertex(v);
                                v.addCubeType(adjacentCubes[c].cubeType);
                            }
                        }
                    }
                }
            }
        }
        for (let i = -1; i < CHUNCK_SIZE + 1; i++) {
            for (let j = -1; j < CHUNCK_SIZE + 1; j++) {
                for (let k = -1; k < CHUNCK_SIZE + 1; k++) {
                    let cube = this.getCube(i, j, k);
                    let draw = i >= 0 && j >= 0 && k >= 0 && i < CHUNCK_SIZE && j < CHUNCK_SIZE && k < CHUNCK_SIZE;
                    if (cube) {
                        if (!this.getCube(i - 1, j, k)) {
                            this.faces.push(new Face([cube.v000, cube.v001, cube.v011, cube.v010], cube.cubeType, draw));
                        }
                        if (!this.getCube(i + 1, j, k)) {
                            this.faces.push(new Face([cube.v100, cube.v110, cube.v111, cube.v101], cube.cubeType, draw));
                        }
                        if (!this.getCube(i, j - 1, k)) {
                            this.faces.push(new Face([cube.v000, cube.v100, cube.v101, cube.v001], cube.cubeType, draw));
                        }
                        if (!this.getCube(i, j + 1, k)) {
                            this.faces.push(new Face([cube.v010, cube.v011, cube.v111, cube.v110], cube.cubeType, draw));
                        }
                        if (!this.getCube(i, j, k - 1)) {
                            this.faces.push(new Face([cube.v000, cube.v010, cube.v110, cube.v100], cube.cubeType, draw));
                        }
                        if (!this.getCube(i, j, k + 1)) {
                            this.faces.push(new Face([cube.v001, cube.v101, cube.v111, cube.v011], cube.cubeType, draw));
                        }
                    }
                }
            }
        }
        let subVertices = new Map();
        for (let i = 0; i < this.faces.length; i++) {
            let f = this.faces[i];
            let center = new Vertex(f.vertices[0].position.x * 0.25 + f.vertices[1].position.x * 0.25 + f.vertices[2].position.x * 0.25 + f.vertices[3].position.x * 0.25, f.vertices[0].position.y * 0.25 + f.vertices[1].position.y * 0.25 + f.vertices[2].position.y * 0.25 + f.vertices[3].position.y * 0.25, f.vertices[0].position.z * 0.25 + f.vertices[1].position.z * 0.25 + f.vertices[2].position.z * 0.25 + f.vertices[3].position.z * 0.25);
            center.index = this.vertices.length;
            center.addCubeType(f.cubeType);
            this.vertices.push(center);
            let subs = [];
            for (let n = 0; n < 4; n++) {
                let n1 = (n + 1) % 4;
                let subKey = Math.min(f.vertices[n].index, f.vertices[n1].index) + "" + Math.max(f.vertices[n].index, f.vertices[n1].index);
                let sub = subVertices.get(subKey);
                if (!sub) {
                    sub = new Vertex(f.vertices[n].position.x * 0.5 + f.vertices[n1].position.x * 0.5, f.vertices[n].position.y * 0.5 + f.vertices[n1].position.y * 0.5, f.vertices[n].position.z * 0.5 + f.vertices[n1].position.z * 0.5);
                    sub.index = this.vertices.length;
                    sub.cubeTypes.copyFrom(f.vertices[n].cubeTypes);
                    sub.cubeTypes.lerpInPlace(f.vertices[n1].cubeTypes, 0.5);
                    subVertices.set(subKey, sub);
                    this.vertices.push(sub);
                    sub.connect(f.vertices[n]);
                    sub.connect(f.vertices[n1]);
                }
                sub.connect(center);
                subs.push(sub);
            }
            for (let i = 3; i >= 0; i--) {
                f.vertices.splice(i + 1, 0, subs[i]);
            }
            f.vertices.splice(0, 0, center);
        }
        for (let i = 0; i < this.vertices.length; i++) {
            this.vertices[i].smooth(1.5);
        }
        for (let i = 0; i < this.vertices.length; i++) {
            this.vertices[i].applySmooth();
        }
        /*
        for (let i = 0; i < this.vertices.length; i++) {
            this.vertices[i].smooth(1);
        }

        for (let i = 0; i < this.vertices.length; i++) {
            this.vertices[i].applySmooth();
        }
        */
    }
    generateFaces() {
        let data = new BABYLON.VertexData();
        let positions = [];
        let colors = [];
        for (let i = 0; i < this.vertices.length; i++) {
            let v = this.vertices[i];
            positions.push(v.smoothedPosition.x, v.smoothedPosition.y, v.smoothedPosition.z);
            colors.push(...v.cubeTypes.getColorAsArray(), 1);
        }
        let indices = [];
        for (let i = 0; i < this.faces.length; i++) {
            let f = this.faces[i];
            let p0 = f.vertices[0];
            let p1 = f.vertices[8];
            let p2 = f.vertices[1];
            let p3 = f.vertices[2];
            let diag0 = p0.position.subtract(p2.position);
            let diag1 = p1.position.subtract(p3.position);
            let nFace = BABYLON.Vector3.Cross(diag0, diag1);
            let d0 = diag0.length();
            let d1 = diag1.length();
            p0.normalSum.addInPlace(nFace);
            p1.normalSum.addInPlace(nFace);
            p2.normalSum.addInPlace(nFace);
            p3.normalSum.addInPlace(nFace);
            if (f.draw) {
                if (d0 < d1) {
                    indices.push(p0.index, p2.index, p1.index, p0.index, p3.index, p2.index);
                }
                else {
                    indices.push(p0.index, p3.index, p1.index, p3.index, p2.index, p1.index);
                }
            }
            p0 = f.vertices[0];
            p1 = f.vertices[2];
            p2 = f.vertices[3];
            p3 = f.vertices[4];
            diag0 = p0.position.subtract(p2.position);
            diag1 = p1.position.subtract(p3.position);
            nFace = BABYLON.Vector3.Cross(diag0, diag1);
            d0 = diag0.length();
            d1 = diag1.length();
            p0.normalSum.addInPlace(nFace);
            p1.normalSum.addInPlace(nFace);
            p2.normalSum.addInPlace(nFace);
            p3.normalSum.addInPlace(nFace);
            if (f.draw) {
                if (d0 < d1) {
                    indices.push(p0.index, p2.index, p1.index, p0.index, p3.index, p2.index);
                }
                else {
                    indices.push(p0.index, p3.index, p1.index, p3.index, p2.index, p1.index);
                }
            }
            p0 = f.vertices[0];
            p1 = f.vertices[4];
            p2 = f.vertices[5];
            p3 = f.vertices[6];
            diag0 = p0.position.subtract(p2.position);
            diag1 = p1.position.subtract(p3.position);
            nFace = BABYLON.Vector3.Cross(diag0, diag1);
            d0 = diag0.length();
            d1 = diag1.length();
            p0.normalSum.addInPlace(nFace);
            p1.normalSum.addInPlace(nFace);
            p2.normalSum.addInPlace(nFace);
            p3.normalSum.addInPlace(nFace);
            if (f.draw) {
                if (d0 < d1) {
                    indices.push(p0.index, p2.index, p1.index, p0.index, p3.index, p2.index);
                }
                else {
                    indices.push(p0.index, p3.index, p1.index, p3.index, p2.index, p1.index);
                }
            }
            p0 = f.vertices[0];
            p1 = f.vertices[6];
            p2 = f.vertices[7];
            p3 = f.vertices[8];
            diag0 = p0.position.subtract(p2.position);
            diag1 = p1.position.subtract(p3.position);
            nFace = BABYLON.Vector3.Cross(diag0, diag1);
            d0 = diag0.length();
            d1 = diag1.length();
            p0.normalSum.addInPlace(nFace);
            p1.normalSum.addInPlace(nFace);
            p2.normalSum.addInPlace(nFace);
            p3.normalSum.addInPlace(nFace);
            if (f.draw) {
                if (d0 < d1) {
                    indices.push(p0.index, p2.index, p1.index, p0.index, p3.index, p2.index);
                }
                else {
                    indices.push(p0.index, p3.index, p1.index, p3.index, p2.index, p1.index);
                }
            }
        }
        data.positions = positions;
        data.colors = colors;
        data.indices = indices;
        let normals = [];
        for (let i = 0; i < this.vertices.length; i++) {
            this.vertices[i].normalSum.normalize();
            normals.push(...this.vertices[i].normalSum.asArray());
        }
        data.normals = normals;
        data.applyToMesh(this);
        this.material = Main.terrainCellShadingMaterial;
    }
}
/// <reference path="./Chunck.ts"/>
var CHUNCK_SIZE = 8;
class Chunck_V2 extends Chunck {
    constructor(manager, i, j, k) {
        super(manager, i, j, k);
        this.bricks = [];
        this.brickMeshes = [];
        this.name = "chunck_v2_" + i + "_" + j + "_" + k;
        this.position.x = CHUNCK_SIZE * this.i * 1.6;
        this.position.y = CHUNCK_SIZE * this.j * 0.96;
        this.position.z = CHUNCK_SIZE * this.k * 1.6;
        this.material = Main.terrainCellShadingMaterial;
        this.knobsMesh = new BABYLON.Mesh(this.name + "_knobs");
        this.knobsMesh.parent = this;
        this.knobsMesh.material = Main.cellShadingMaterial;
    }
    addBrick(brick) {
        let i = this.bricks.indexOf(brick);
        if (i === -1) {
            this.bricks.push(brick);
        }
    }
    async generate() {
        let positions = [];
        let indices = [];
        let normals = [];
        let colors = [];
        let knobsPositions = [];
        let knobsIndices = [];
        let knobsNormals = [];
        let knobsColors = [];
        for (let i = 0; i < CHUNCK_SIZE; i++) {
            for (let j = 0; j < CHUNCK_SIZE; j++) {
                for (let k = 0; k < CHUNCK_SIZE; k++) {
                    let c0 = this.getCube(i, j, k);
                    let c1 = this.getCube(i + 1, j, k);
                    let c2 = this.getCube(i + 1, j, k + 1);
                    let c3 = this.getCube(i, j, k + 1);
                    let c4 = this.getCube(i, j + 1, k);
                    let c5 = this.getCube(i + 1, j + 1, k);
                    let c6 = this.getCube(i + 1, j + 1, k + 1);
                    let c7 = this.getCube(i, j + 1, k + 1);
                    let ref = (c0 ? "1" : "0") + (c1 ? "1" : "0") + (c2 ? "1" : "0") + (c3 ? "1" : "0") + (c4 ? "1" : "0") + (c5 ? "1" : "0") + (c6 ? "1" : "0") + (c7 ? "1" : "0");
                    if (ref === "00000000" || ref === "11111111") {
                        continue;
                    }
                    // debug
                    /*
                    if (c0) {
                        let debugData = BABYLON.VertexData.CreateBox({ size: 0.3 });
                        let debugColors = [];
                        for (let n = 0; n < debugData.positions.length / 3; n++) {
                            debugColors.push(...c0.color.asArray());
                        }
                        debugData.colors = debugColors;
                        let debugMesh = new BABYLON.Mesh("debug");
                        debugData.applyToMesh(debugMesh);
                        debugMesh.parent = this;
                        debugMesh.position.x = i * 1.6;
                        debugMesh.position.y = j * 0.96;
                        debugMesh.position.z = k * 1.6;
                        debugMesh.scaling.y = 4;
                        debugMesh.material = Main.cellShadingMaterial;
                        debugMesh.freezeWorldMatrix();
                    }
                    */
                    let data = ChunckVertexData.Get(ref);
                    if (c0 && !c4) {
                        BrickVertexData.AddKnob(2 * i, 3 * j, 2 * k, knobsPositions, knobsIndices, knobsNormals, 0, knobsColors, c0.displayedColor);
                        if (c1 && !c5) {
                            BrickVertexData.AddKnob(2 * i + 1, 3 * j, 2 * k, knobsPositions, knobsIndices, knobsNormals, 0, knobsColors, c0.displayedColor);
                            if (c3 && !c7 && c2 && !c6) {
                                BrickVertexData.AddKnob(2 * i + 1, 3 * j, 2 * k + 1, knobsPositions, knobsIndices, knobsNormals, 0, knobsColors, c0.displayedColor);
                            }
                        }
                        if (c3 && !c7) {
                            BrickVertexData.AddKnob(2 * i, 3 * j, 2 * k + 1, knobsPositions, knobsIndices, knobsNormals, 0, knobsColors, c0.displayedColor);
                        }
                    }
                    if (data) {
                        let l = positions.length / 3;
                        for (let n = 0; n < data.positions.length / 3; n++) {
                            let x = data.positions[3 * n];
                            let y = data.positions[3 * n + 1];
                            let z = data.positions[3 * n + 2];
                            positions.push(x + i * 1.6 + 0.8);
                            positions.push(y + j * 0.96);
                            positions.push(z + k * 1.6 + 0.8);
                            let color0 = c0 ? c0.color : undefined;
                            let color1 = c1 ? c1.color : undefined;
                            let color2 = c2 ? c2.color : undefined;
                            let color3 = c3 ? c3.color : undefined;
                            let color4 = c4 ? c4.color : undefined;
                            let color5 = c5 ? c5.color : undefined;
                            let color6 = c6 ? c6.color : undefined;
                            let color7 = c7 ? c7.color : undefined;
                            let d = Infinity;
                            let color;
                            if (color0) {
                                if (x < 0 && y < 0 && z < 0) {
                                    colors.push(color0.r, color0.g, color0.b, color0.a);
                                    continue;
                                }
                                let dd = x + 0.8 + y + 0.48 + z + 0.8;
                                if (dd < d) {
                                    d = dd;
                                    color = color0;
                                }
                            }
                            if (color1) {
                                if (x > 0 && y < 0 && z < 0) {
                                    colors.push(color1.r, color1.g, color1.b, color1.a);
                                    continue;
                                }
                                let dd = 0.8 - x + y + 0.48 + z + 0.8;
                                if (dd < d) {
                                    d = dd;
                                    color = color1;
                                }
                            }
                            if (color3) {
                                if (x < 0 && y < 0 && z > 0) {
                                    colors.push(color3.r, color3.g, color3.b, color3.a);
                                    continue;
                                }
                                let dd = x + 0.8 + y + 0.48 + 0.8 - z;
                                if (dd < d) {
                                    d = dd;
                                    color = color3;
                                }
                            }
                            if (color2) {
                                if (x > 0 && y < 0 && z > 0) {
                                    colors.push(color2.r, color2.g, color2.b, color2.a);
                                    continue;
                                }
                                let dd = 0.8 - x + y + 0.48 + 0.8 - z;
                                if (dd < d) {
                                    d = dd;
                                    color = color2;
                                }
                            }
                            if (color4) {
                                if (x < 0 && y > 0 && z < 0) {
                                    colors.push(color4.r, color4.g, color4.b, color4.a);
                                    continue;
                                }
                                let dd = x + 0.8 + 0.48 - y + z + 0.8;
                                if (dd < d) {
                                    d = dd;
                                    color = color4;
                                }
                            }
                            if (color5) {
                                if (x > 0 && y > 0 && z < 0) {
                                    colors.push(color5.r, color5.g, color5.b, color5.a);
                                    continue;
                                }
                                let dd = 0.8 - x + 0.48 - y + z + 0.8;
                                if (dd < d) {
                                    d = dd;
                                    color = color5;
                                }
                            }
                            if (color7) {
                                if (x < 0 && y > 0 && z > 0) {
                                    colors.push(color7.r, color7.g, color7.b, color7.a);
                                    continue;
                                }
                                let dd = x + 0.8 + 0.48 - y + 0.8 - z;
                                if (dd < d) {
                                    d = dd;
                                    color = color7;
                                }
                            }
                            if (color6) {
                                if (x > 0 && y > 0 && z > 0) {
                                    colors.push(color6.r, color6.g, color6.b, color6.a);
                                    continue;
                                }
                                let dd = 0.8 - x + 0.48 - y + 0.8 - z;
                                if (dd < d) {
                                    d = dd;
                                    color = color6;
                                }
                            }
                            colors.push(color.r, color.g, color.b, color.a);
                        }
                        normals.push(...data.normals);
                        for (let n = 0; n < data.indices.length; n++) {
                            indices.push(data.indices[n] + l);
                        }
                    }
                    else if (!Chunck_V2.HasLoged) {
                        console.warn("Missing ChunckPart : " + ref);
                        Chunck_V2.HasLoged = true;
                    }
                }
            }
        }
        let vertexData = new BABYLON.VertexData();
        vertexData.positions = positions;
        vertexData.indices = indices;
        vertexData.normals = normals;
        vertexData.colors = colors;
        vertexData.applyToMesh(this);
        let knobsVertexData = new BABYLON.VertexData();
        knobsVertexData.positions = knobsPositions;
        knobsVertexData.indices = knobsIndices;
        knobsVertexData.normals = knobsNormals;
        knobsVertexData.colors = knobsColors;
        knobsVertexData.applyToMesh(this.knobsMesh);
        this.updateBricks();
    }
    async updateBricks() {
        while (this.brickMeshes.length > 1) {
            this.brickMeshes.pop().dispose();
        }
        for (let i = 0; i < this.bricks.length; i++) {
            let brick = this.bricks[i];
            let b = new BABYLON.Mesh("brick-" + i);
            let data = await BrickVertexData.GetFullBrickVertexData(brick.reference);
            data.applyToMesh(b);
            b.position.copyFromFloats(brick.i * DX, brick.j * DY, brick.k * DX);
            b.rotation.y = Math.PI / 2 * brick.r;
            b.parent = this;
            if (brick.reference.color.indexOf("transparent") != -1) {
                b.material = Main.cellShadingTransparentMaterial;
            }
            else {
                b.material = Main.cellShadingMaterial;
            }
            this.brickMeshes.push(b);
        }
    }
}
Chunck_V2.HasLoged = false;
var CubeType;
(function (CubeType) {
    CubeType[CubeType["Dirt"] = 0] = "Dirt";
    CubeType[CubeType["Rock"] = 1] = "Rock";
    CubeType[CubeType["Sand"] = 2] = "Sand";
    CubeType[CubeType["None"] = 3] = "None";
})(CubeType || (CubeType = {}));
class Cube {
    constructor(chunck, i, j, k, cubeType) {
        this.chunck = chunck;
        this.i = i;
        this.j = j;
        this.k = k;
        this._color = new BABYLON.Color4();
        this._displayedColor = new BABYLON.Color4();
        this.cubeType = cubeType;
        if (this.cubeType === undefined) {
            this.cubeType = Math.floor(Math.random() * 3);
        }
    }
    static get PreviewMaterials() {
        if (!Cube._PreviewMaterials) {
            Cube._PreviewMaterials = [];
            for (let i = 0; i < 4; i++) {
                Cube._PreviewMaterials[i] = new BABYLON.StandardMaterial("brush-material-" + i, Main.Scene);
                Cube._PreviewMaterials[i].alpha = 0.5;
                Cube._PreviewMaterials[i].specularColor.copyFromFloats(0.1, 0.1, 0.1);
            }
            Cube._PreviewMaterials[0].diffuseColor = BABYLON.Color3.FromHexString("#a86f32");
            Cube._PreviewMaterials[1].diffuseColor = BABYLON.Color3.FromHexString("#8c8c89");
            Cube._PreviewMaterials[2].diffuseColor = BABYLON.Color3.FromHexString("#dbc67b");
            Cube._PreviewMaterials[3].diffuseColor = BABYLON.Color3.FromHexString("#ff0000");
        }
        return Cube._PreviewMaterials;
    }
    get cubeType() {
        return this._cubeType;
    }
    set cubeType(t) {
        this._cubeType = t;
        if (this.cubeType === CubeType.Dirt) {
            this._color.copyFromFloats(1, 0, 0, 1);
            this._displayedColor.copyFromFloats(71 / 255, 166 / 255, 50 / 255, 255);
        }
        else if (this.cubeType === CubeType.Rock) {
            this._color.copyFromFloats(0, 1, 0, 1);
            this._displayedColor.copyFromFloats(140 / 255, 140 / 255, 137 / 255, 255);
        }
        else if (this.cubeType === CubeType.Sand) {
            this._color.copyFromFloats(0, 0, 1, 1);
            this._displayedColor.copyFromFloats(219 / 255, 198 / 255, 123 / 255, 255);
        }
    }
    get color() {
        return this._color;
    }
    get displayedColor() {
        return this._displayedColor;
    }
    addVertex(v) {
        if (v.i === this.i) {
            if (v.j === this.j) {
                if (v.k === this.k) {
                    this.v000 = v;
                }
                else {
                    this.v001 = v;
                }
            }
            else {
                if (v.k === this.k) {
                    this.v010 = v;
                }
                else {
                    this.v011 = v;
                }
            }
        }
        else {
            if (v.j === this.j) {
                if (v.k === this.k) {
                    this.v100 = v;
                }
                else {
                    this.v101 = v;
                }
            }
            else {
                if (v.k === this.k) {
                    this.v110 = v;
                }
                else {
                    if (this.v111) {
                        debugger;
                    }
                    this.v111 = v;
                }
            }
        }
    }
    makeLinksMX() {
        if (this.v000) {
            this.v000.connect(this.v001);
            this.v000.connect(this.v010);
        }
        if (this.v011) {
            this.v011.connect(this.v010);
            this.v011.connect(this.v001);
        }
    }
    makeLinksPX() {
        if (this.v100) {
            this.v100.connect(this.v101);
            this.v100.connect(this.v110);
        }
        if (this.v111) {
            this.v111.connect(this.v110);
            this.v111.connect(this.v101);
        }
    }
    makeLinksMY() {
        if (this.v000) {
            this.v000.connect(this.v001);
            this.v000.connect(this.v100);
        }
        if (this.v101) {
            this.v101.connect(this.v001);
            this.v101.connect(this.v100);
        }
    }
    makeLinksPY() {
        if (this.v010) {
            this.v010.connect(this.v011);
            this.v010.connect(this.v110);
        }
        if (this.v111) {
            this.v111.connect(this.v011);
            this.v111.connect(this.v110);
        }
    }
    makeLinksMZ() {
        if (this.v000) {
            this.v000.connect(this.v100);
            this.v000.connect(this.v010);
        }
        if (this.v110) {
            this.v110.connect(this.v010);
            this.v110.connect(this.v100);
        }
    }
    makeLinksPZ() {
        if (this.v001) {
            this.v001.connect(this.v101);
            this.v001.connect(this.v011);
        }
        if (this.v111) {
            this.v111.connect(this.v011);
            this.v111.connect(this.v101);
        }
    }
    makeLinks() {
        if (this.v000) {
            this.v000.connect(this.v001);
            this.v000.connect(this.v010);
            this.v000.connect(this.v100);
        }
        if (this.v001) {
            this.v001.connect(this.v011);
            this.v001.connect(this.v101);
        }
        if (this.v010) {
            this.v010.connect(this.v011);
            this.v010.connect(this.v110);
        }
        if (this.v011) {
            this.v011.connect(this.v111);
        }
        if (this.v100) {
            this.v100.connect(this.v101);
            this.v100.connect(this.v110);
        }
        if (this.v101) {
            this.v101.connect(this.v111);
        }
        if (this.v110) {
            this.v110.connect(this.v111);
        }
    }
    shareFace(c) {
        let diff = 0;
        if (this.i !== c.i) {
            diff++;
        }
        if (this.j !== c.j) {
            diff++;
        }
        if (this.k !== c.k) {
            diff++;
        }
        return diff < 2;
    }
}
class VertexCubeType {
    constructor() {
        this.sourceCount = 0;
        this.values = [0, 0, 0];
    }
    getColor() {
        return new BABYLON.Color3(this.values[0], this.values[1], this.values[2]);
    }
    getColorAsArray() {
        return this.values;
    }
    copyFrom(other) {
        for (let i = 0; i < this.values.length; i++) {
            this.values[i] = other.values[i];
        }
        return this;
    }
    clone() {
        let c = new VertexCubeType();
        c.values = [...this.values];
        return c;
    }
    addCubeType(cubeType) {
        this.sourceCount++;
        this.values[cubeType] = this.values[cubeType] * (1 - 1 / this.sourceCount) + 1 / this.sourceCount;
    }
    addInPlace(other) {
        for (let i = 0; i < this.values.length; i++) {
            this.values[i] += other.values[i];
        }
    }
    scaleInPlace(n) {
        for (let i = 0; i < this.values.length; i++) {
            this.values[i] *= n;
        }
    }
    lerpInPlace(other, distance) {
        for (let i = 0; i < this.values.length; i++) {
            this.values[i] = this.values[i] * (1 - distance) + other.values[i] * distance;
        }
    }
}
class Vertex {
    constructor(i, j, k) {
        this.i = i;
        this.j = j;
        this.k = k;
        this.links = [];
        this.faces = [];
        this.cubeTypes = new VertexCubeType();
        this.smoothedCubeTypes = new VertexCubeType();
        this.normalSum = BABYLON.Vector3.Zero();
        this.position = new BABYLON.Vector3(i, j, k);
        this.smoothedPosition = this.position.clone();
        while (this.i < 0) {
            this.i += CHUNCK_SIZE;
        }
        while (this.j < 0) {
            this.j += CHUNCK_SIZE;
        }
        while (this.k < 0) {
            this.k += CHUNCK_SIZE;
        }
        while (this.i >= CHUNCK_SIZE) {
            this.i -= CHUNCK_SIZE;
        }
        while (this.j >= CHUNCK_SIZE) {
            this.j -= CHUNCK_SIZE;
        }
        while (this.k >= CHUNCK_SIZE) {
            this.k -= CHUNCK_SIZE;
        }
    }
    connect(v) {
        if (v) {
            if (this.links.indexOf(v) === -1) {
                this.links.push(v);
            }
            if (v.links.indexOf(this) === -1) {
                v.links.push(this);
            }
        }
    }
    addCubeType(ct) {
        this.cubeTypes.addCubeType(ct);
    }
    smooth(factor) {
        this.smoothedCubeTypes.copyFrom(this.cubeTypes);
        this.smoothedPosition.copyFrom(this.position);
        for (let i = 0; i < this.links.length; i++) {
            this.smoothedPosition.addInPlace(this.links[i].position.scale(factor));
            this.smoothedCubeTypes.addInPlace(this.links[i].cubeTypes);
        }
        this.smoothedPosition.scaleInPlace(1 / (this.links.length * factor + 1));
        this.smoothedCubeTypes.scaleInPlace(1 / (this.links.length * factor + 1));
    }
    applySmooth() {
        this.position.copyFrom(this.smoothedPosition);
        this.cubeTypes.copyFrom(this.smoothedCubeTypes);
    }
}
class Walker extends BABYLON.Mesh {
    constructor() {
        super(...arguments);
        this.target = BABYLON.Vector3.Zero();
        this.speed = 1;
        this.bodySpeed = BABYLON.Vector3.Zero();
        this.yaw = 0;
        this.yawSpeed = 0;
        this.pitch = 0;
        this.roll = 0;
        this.update = () => {
            let forLeft = this.leftFoot.position.subtract(this.leftHipJoin.absolutePosition);
            let lenLeft = forLeft.length();
            forLeft.scaleInPlace(1 / lenLeft);
            forLeft.scaleInPlace(lenLeft - 4);
            this.bodySpeed.addInPlace(forLeft.scale(0.015 * 25));
            let forRight = this.rightFoot.position.subtract(this.rightHipJoin.absolutePosition);
            let lenRight = forRight.length();
            forRight.scaleInPlace(1 / lenRight);
            forRight.scaleInPlace(lenRight - 4);
            this.bodySpeed.addInPlace(forRight.scale(0.015 * 25));
            let center = this.leftFoot.position.add(this.rightFoot.position).scaleInPlace(0.5);
            let forCenter = center.subtract(this.body.position);
            forCenter.y = 0;
            let lenCenter = forCenter.length();
            forCenter.scaleInPlace(1 / lenCenter);
            forCenter.scaleInPlace(lenCenter);
            this.bodySpeed.addInPlace(forCenter.scale(0.015 * 10));
            let localX = this.body.getDirection(BABYLON.Axis.X);
            let localZ = this.body.getDirection(BABYLON.Axis.Z);
            this.leftKnee.position = this.leftFootJoin.absolutePosition.add(this.leftHipJoin.absolutePosition).scaleInPlace(0.5);
            this.leftKnee.position.subtractInPlace(localZ.scale(4)).subtractInPlace(localX.scale(2));
            for (let i = 0; i < 5; i++) {
                let dHip = this.leftKnee.position.subtract(this.leftHipJoin.absolutePosition).normalize();
                this.leftKnee.position.copyFrom(this.leftHipJoin.absolutePosition).addInPlace(dHip.scale(3));
                let dFoot = this.leftKnee.position.subtract(this.leftFootJoin.absolutePosition).normalize();
                this.leftKnee.position.copyFrom(this.leftFootJoin.absolutePosition).addInPlace(dFoot.scale(3));
            }
            this.leftLeg.position.copyFrom(this.leftFootJoin.absolutePosition);
            this.leftLeg.position.addInPlace(this.leftKnee.position);
            this.leftLeg.position.scaleInPlace(0.5);
            this.leftLeg.lookAt(this.leftKnee.position);
            this.leftHip.position.copyFrom(this.leftHipJoin.absolutePosition);
            this.leftHip.position.addInPlace(this.leftKnee.position);
            this.leftHip.position.scaleInPlace(0.5);
            this.leftHip.lookAt(this.leftKnee.position);
            this.rightKnee.position = this.rightFootJoin.absolutePosition.add(this.rightHipJoin.absolutePosition).scaleInPlace(0.5);
            this.rightKnee.position.subtractInPlace(localZ.scale(4)).addInPlace(localX.scale(2));
            for (let i = 0; i < 5; i++) {
                let dHip = this.rightKnee.position.subtract(this.rightHipJoin.absolutePosition).normalize();
                this.rightKnee.position.copyFrom(this.rightHipJoin.absolutePosition).addInPlace(dHip.scale(3));
                let dFoot = this.rightKnee.position.subtract(this.rightFootJoin.absolutePosition).normalize();
                this.rightKnee.position.copyFrom(this.rightFootJoin.absolutePosition).addInPlace(dFoot.scale(3));
            }
            this.rightLeg.position.copyFrom(this.rightFootJoin.absolutePosition);
            this.rightLeg.position.addInPlace(this.rightKnee.position);
            this.rightLeg.position.scaleInPlace(0.5);
            this.rightLeg.lookAt(this.rightKnee.position);
            this.rightHip.position.copyFrom(this.rightHipJoin.absolutePosition);
            this.rightHip.position.addInPlace(this.rightKnee.position);
            this.rightHip.position.scaleInPlace(0.5);
            this.rightHip.lookAt(this.rightKnee.position);
            this.body.position.addInPlace(this.bodySpeed.scale(0.015));
            this.body.position.y = Math.max(this.body.position.y, center.y + 1);
            let yaw = VMath.AngleFromToAround(BABYLON.Axis.Z, this.target.subtract(this.body.position), BABYLON.Axis.Y);
            this.yaw = Math2D.LerpFromToCircular(this.yaw, yaw, 0.001);
            let footZ = this.rightFoot.position.subtract(this.leftFoot.position);
            footZ = BABYLON.Vector3.Cross(footZ, BABYLON.Axis.Y);
            let yawFoot = VMath.AngleFromToAround(localZ, footZ, BABYLON.Axis.Y);
            let lim = Math.PI / 2 * 0.8;
            if (yawFoot > lim) {
                this.yaw -= yawFoot - lim;
            }
            if (yawFoot < -lim) {
                this.yaw += yawFoot + lim;
            }
            this.roll = Math.PI / 4 * (this.rightFoot.position.y - this.leftFoot.position.y) / 4;
            BABYLON.Quaternion.RotationYawPitchRollToRef(this.yaw, this.pitch, this.roll, this.body.rotationQuaternion);
            this.bodySpeed.scaleInPlace(0.95);
        };
    }
    async instantiate() {
        let data = await VertexDataLoader.instance.getColorizedMultiple("walker", "#ffebb0", "", "#609400", "#beff45", "#243a40");
        this.leftFoot = new BABYLON.Mesh("left-foot");
        this.leftFoot.material = Main.cellShadingMaterial;
        data[1].applyToMesh(this.leftFoot);
        this.leftFoot.rotationQuaternion = BABYLON.Quaternion.Identity();
        this.rightFoot = new BABYLON.Mesh("right-foot");
        this.rightFoot.material = Main.cellShadingMaterial;
        data[1].applyToMesh(this.rightFoot);
        this.rightFoot.rotationQuaternion = BABYLON.Quaternion.Identity();
        this.leftFootJoin = new BABYLON.Mesh("left-foot-join", this.getScene());
        this.leftFootJoin.position.copyFromFloats(0, 0.12, -0.3);
        this.leftFootJoin.parent = this.leftFoot;
        this.rightFootJoin = new BABYLON.Mesh("right-foot-join", this.getScene());
        this.rightFootJoin.position.copyFromFloats(0, 0.12, -0.3);
        this.rightFootJoin.parent = this.rightFoot;
        this.body = new BABYLON.Mesh("body");
        this.body.material = Main.cellShadingMaterial;
        data[0].applyToMesh(this.body);
        this.body.rotationQuaternion = BABYLON.Quaternion.Identity();
        this.leftHipJoin = new BABYLON.Mesh("left-hip-join", this.getScene());
        this.leftHipJoin.position.copyFromFloats(-1, -0.75, 0);
        this.leftHipJoin.parent = this.body;
        this.rightHipJoin = new BABYLON.Mesh("right-hip-join", this.getScene());
        this.rightHipJoin.position.copyFromFloats(1, -0.75, 0);
        this.rightHipJoin.parent = this.body;
        this.leftLeg = new BABYLON.Mesh("left-leg", this.getScene());
        this.leftLeg.material = Main.cellShadingMaterial;
        data[3].applyToMesh(this.leftLeg);
        this.leftHip = new BABYLON.Mesh("left-leg", this.getScene());
        this.leftHip.material = Main.cellShadingMaterial;
        data[2].applyToMesh(this.leftHip);
        this.leftKnee = new BABYLON.Mesh("left-knee", this.getScene());
        this.rightLeg = new BABYLON.Mesh("right-leg", this.getScene());
        this.rightLeg.material = Main.cellShadingMaterial;
        data[3].applyToMesh(this.rightLeg);
        this.rightHip = new BABYLON.Mesh("right-leg", this.getScene());
        this.rightHip.material = Main.cellShadingMaterial;
        data[2].applyToMesh(this.rightHip);
        this.rightKnee = new BABYLON.Mesh("right-knee", this.getScene());
        let wait = async (t) => {
            return new Promise(resolve => {
                setTimeout(resolve, t);
            });
        };
        let loop = async () => {
            while (true) {
                await this.moveLeftFootTo(this.nextLeftFootPos());
                await wait(200);
                await this.moveRightFootTo(this.nextRightFootPos());
                await wait(200);
            }
        };
        setTimeout(() => {
            this.getScene().onBeforeRenderObservable.add(this.update);
            this.update();
            loop();
        }, 5000);
    }
    nextLeftFootPos() {
        let dir = (new BABYLON.Vector3(-0.2, -2, this.speed)).normalize();
        let ray = new BABYLON.Ray(this.leftHipJoin.absolutePosition, this.body.getDirection(dir));
        let help = BABYLON.RayHelper.CreateAndShow(ray, this.getScene(), BABYLON.Color3.Blue());
        setTimeout(() => {
            help.dispose();
        }, 1000);
        let pick = this.getScene().pickWithRay(ray, (m) => {
            return m instanceof Chunck_V1;
        });
        if (pick.hit) {
            if (BABYLON.Vector3.DistanceSquared(pick.pickedPoint, this.leftHipJoin.absolutePosition) < 49) {
                if (Math.abs(pick.pickedPoint.y - this.leftFoot.position.y) < 3) {
                    this.speed += 0.1;
                    this.speed = Math.min(2, this.speed);
                    return pick.pickedPoint;
                }
            }
        }
        this.speed -= 0.1;
        return this.leftFoot.position.clone();
    }
    nextRightFootPos() {
        let dir = (new BABYLON.Vector3(0.2, -2, this.speed)).normalize();
        let ray = new BABYLON.Ray(this.rightHipJoin.absolutePosition, this.body.getDirection(dir));
        let help = BABYLON.RayHelper.CreateAndShow(ray, this.getScene(), BABYLON.Color3.Red());
        setTimeout(() => {
            help.dispose();
        }, 1000);
        let pick = this.getScene().pickWithRay(ray, (m) => {
            return m instanceof Chunck_V1;
        });
        if (pick.hit) {
            if (BABYLON.Vector3.DistanceSquared(pick.pickedPoint, this.rightHipJoin.absolutePosition) < 49) {
                if (Math.abs(pick.pickedPoint.y - this.rightFoot.position.y) < 3) {
                    this.speed += 0.1;
                    this.speed = Math.min(2, this.speed);
                    return pick.pickedPoint;
                }
            }
        }
        this.speed -= 0.1;
        return this.rightFoot.position.clone();
    }
    async moveLeftFootTo(p) {
        return new Promise(resolve => {
            let pZero = this.leftFoot.position.clone();
            let d = BABYLON.Vector3.Distance(p, pZero) * 0.8 + 0.6;
            let q = this.body.rotationQuaternion.clone();
            let qZero = this.leftFoot.rotationQuaternion.clone();
            let i = 1;
            let duration = d * 15;
            duration /= 40;
            duration = Math.sqrt(duration);
            duration *= 40;
            duration = Math.ceil(duration + 25);
            let step = () => {
                this.leftFoot.position = BABYLON.Vector3.Lerp(pZero, p, (i / duration) * (i / duration));
                this.leftFoot.position.y += d * 0.5 * Math.sin((i / duration) * (i / duration) * Math.PI);
                this.leftFoot.rotationQuaternion = BABYLON.Quaternion.Slerp(qZero, q, (i / duration) * (i / duration));
                if (i < duration) {
                    i++;
                    requestAnimationFrame(step);
                }
                else {
                    resolve();
                }
            };
            step();
        });
    }
    async moveRightFootTo(p) {
        return new Promise(resolve => {
            let pZero = this.rightFoot.position.clone();
            let d = BABYLON.Vector3.Distance(p, pZero) * 0.8 + 0.6;
            let q = this.body.rotationQuaternion.clone();
            let qZero = this.rightFoot.rotationQuaternion.clone();
            let i = 1;
            let duration = d * 15;
            duration /= 40;
            duration = Math.sqrt(duration);
            duration *= 40;
            duration = Math.ceil(duration + 25);
            let step = () => {
                this.rightFoot.position = BABYLON.Vector3.Lerp(pZero, p, (i / duration) * (i / duration));
                this.rightFoot.position.y += d * 0.5 * Math.sin((i / duration) * (i / duration) * Math.PI);
                this.rightFoot.rotationQuaternion = BABYLON.Quaternion.Slerp(qZero, q, (i / duration) * (i / duration));
                if (i < duration) {
                    i++;
                    requestAnimationFrame(step);
                }
                else {
                    resolve();
                }
            };
            step();
        });
    }
}
class Player extends BABYLON.Mesh {
    constructor() {
        super("player");
        this._inputLeft = false;
        this._inputRight = false;
        this._inputBack = false;
        this._inputForward = false;
        this._downSpeed = 0;
        this.update = () => {
            let right = this.getDirection(BABYLON.Axis.X);
            let forward = this.getDirection(BABYLON.Axis.Z);
            if (this._inputLeft) {
                this.position.addInPlace(right.scale(-0.04));
            }
            if (this._inputRight) {
                this.position.addInPlace(right.scale(0.04));
            }
            if (this._inputBack) {
                this.position.addInPlace(forward.scale(-0.04));
            }
            if (this._inputForward) {
                this.position.addInPlace(forward.scale(0.04));
            }
            this.position.y -= this._downSpeed;
            this._downSpeed += 0.005;
            this._downSpeed *= 0.99;
            Main.ChunckManager.foreachChunck((chunck) => {
                let intersections = Intersections3D.SphereChunck(this.position, 0.5, chunck);
                if (intersections) {
                    for (let j = 0; j < intersections.length; j++) {
                        let d = this.position.subtract(intersections[j].point);
                        let l = d.length();
                        d.normalize();
                        if (d.y > 0.8) {
                            this._downSpeed = 0.0;
                        }
                        d.scaleInPlace((0.5 - l) * 0.5);
                        this.position.addInPlace(d);
                    }
                }
            });
            if (this.currentAction) {
                if (this.currentAction.onUpdate) {
                    this.currentAction.onUpdate();
                }
            }
        };
        this.updateBrickMode = () => {
            let right = this.getDirection(BABYLON.Axis.X);
            let forward = this.getDirection(BABYLON.Axis.Z);
            if (this._inputLeft) {
                this.position.addInPlace(right.scale(-0.08));
            }
            if (this._inputRight) {
                this.position.addInPlace(right.scale(0.08));
            }
            if (this._inputBack) {
                this.position.addInPlace(forward.scale(-0.08));
            }
            if (this._inputForward) {
                this.position.addInPlace(forward.scale(0.08));
            }
            let ray = new BABYLON.Ray(this.position, new BABYLON.Vector3(0, -1, 0));
            let pick = Main.Scene.pickWithRay(ray, (mesh) => {
                return mesh instanceof Tile;
            });
            if (pick.hit) {
                let y = Math.floor((pick.pickedPoint.y + 0.01) / DY) * DY + 1;
                this.position.y *= 0.5;
                this.position.y += y * 0.5;
            }
            if (this.currentAction) {
                if (this.currentAction.onUpdate) {
                    this.currentAction.onUpdate();
                }
            }
        };
        this.playerActionManager = new PlayerActionManager(this);
        // debug
        //BABYLON.VertexData.CreateSphere({ diameter: 1}).applyToMesh(this);
    }
    register(brickMode = false) {
        this.playerActionManager.register();
        if (brickMode) {
            Main.Scene.onBeforeRenderObservable.add(this.updateBrickMode);
        }
        else {
            Main.Scene.onBeforeRenderObservable.add(this.update);
        }
        Main.Canvas.addEventListener("keyup", (e) => {
            if (this.currentAction) {
                if (this.currentAction.onKeyUp) {
                    this.currentAction.onKeyUp(e);
                }
            }
            if (e.keyCode === 81) {
                this._inputLeft = false;
            }
            else if (e.keyCode === 68) {
                this._inputRight = false;
            }
            else if (e.keyCode === 83) {
                this._inputBack = false;
            }
            else if (e.keyCode === 90) {
                this._inputForward = false;
            }
            else if (e.keyCode === 32) {
                this._downSpeed = -0.15;
            }
        });
        Main.Canvas.addEventListener("keydown", (e) => {
            if (e.keyCode === 81) {
                this._inputLeft = true;
            }
            else if (e.keyCode === 68) {
                this._inputRight = true;
            }
            else if (e.keyCode === 83) {
                this._inputBack = true;
            }
            else if (e.keyCode === 90) {
                this._inputForward = true;
            }
        });
        let smoothnessX = 3;
        let smoothnessXFactor = 1 / smoothnessX;
        let smoothnessY = 3;
        let smoothnessYFactor = 1 / smoothnessY;
        Main.Canvas.addEventListener("pointermove", (e) => {
            if (document.pointerLockElement) {
                let newRY = this.rotation.y + e.movementX / 200;
                this.rotation.y = this.rotation.y * (1 - smoothnessYFactor) + newRY * smoothnessYFactor;
                if (Main.Camera instanceof BABYLON.FreeCamera) {
                    let newRX = Math.min(Math.max(Main.Camera.rotation.x + e.movementY / 200, -Math.PI / 2 + Math.PI / 60), Math.PI / 2 - Math.PI / 60);
                    Main.Camera.rotation.x = Main.Camera.rotation.x * (1 - smoothnessXFactor) + newRX * smoothnessXFactor;
                }
            }
        });
        Main.Canvas.addEventListener("pointerup", (e) => {
            if (this.currentAction) {
                if (this.currentAction.onClick) {
                    this.currentAction.onClick();
                }
            }
        });
        document.getElementById("player-actions").style.display = "block";
    }
}
class PlayerActionTemplate {
    static CreateCubeAction(cubeType) {
        let action = new PlayerAction();
        let previewMesh;
        action.iconUrl = "./datas/textures/miniatures/";
        if (cubeType === CubeType.Dirt) {
            action.iconUrl += "dirt";
        }
        if (cubeType === CubeType.Rock) {
            action.iconUrl += "rock";
        }
        if (cubeType === CubeType.Sand) {
            action.iconUrl += "sand";
        }
        if (cubeType === CubeType.None) {
            action.iconUrl += "delete";
        }
        action.iconUrl += "-miniature.png";
        action.onUpdate = () => {
            let x = Main.Engine.getRenderWidth() * 0.5;
            let y = Main.Engine.getRenderHeight() * 0.5;
            let coordinates = ChunckUtils.XYScreenToChunckV2Coordinates(x, y, cubeType === CubeType.None);
            if (coordinates) {
                if (!previewMesh) {
                    if (coordinates.chunck instanceof Chunck_V1) {
                        previewMesh = BABYLON.MeshBuilder.CreateBox("preview-mesh", { size: 1.2 });
                    }
                    else {
                        previewMesh = BABYLON.MeshBuilder.CreateBox("preview-mesh", { width: 1.8, height: 1.16, depth: 1.8 });
                    }
                    previewMesh.material = Cube.PreviewMaterials[cubeType];
                }
                previewMesh.position.copyFrom(coordinates.chunck.position);
                if (coordinates.chunck instanceof Chunck_V1) {
                    previewMesh.position.addInPlace(coordinates.coordinates);
                    previewMesh.position.addInPlaceFromFloats(0.5, 0.5, 0.5);
                }
                else {
                    previewMesh.position.addInPlace(coordinates.coordinates.multiplyByFloats(1.6, 0.96, 1.6));
                    previewMesh.position.addInPlaceFromFloats(0, -0.48, 0);
                }
            }
            else {
                if (previewMesh) {
                    previewMesh.dispose();
                    previewMesh = undefined;
                }
            }
        };
        action.onClick = () => {
            let x = Main.Engine.getRenderWidth() * 0.5;
            let y = Main.Engine.getRenderHeight() * 0.5;
            let coordinates = ChunckUtils.XYScreenToChunckV2Coordinates(x, y, cubeType === CubeType.None);
            if (coordinates) {
                Main.ChunckManager.setChunckCube(coordinates.chunck, coordinates.coordinates.x, coordinates.coordinates.y, coordinates.coordinates.z, cubeType, 0, true);
            }
        };
        action.onUnequip = () => {
            if (previewMesh) {
                previewMesh.dispose();
                previewMesh = undefined;
            }
        };
        return action;
    }
    static EditBlockAction() {
        let action = new PlayerAction();
        let pickedBlock;
        let aimedBlock;
        action.iconUrl = "./datas/textures/miniatures/move-arrow.png";
        action.onKeyUp = (e) => {
            if (e.keyCode === 82) {
                if (pickedBlock) {
                    pickedBlock.r = (pickedBlock.r + 1) % 4;
                }
            }
        };
        action.onUpdate = () => {
            let x = Main.Engine.getRenderWidth() * 0.5;
            let y = Main.Engine.getRenderHeight() * 0.5;
            if (!pickedBlock) {
                let pickInfo = Main.Scene.pick(x, y);
                if (pickInfo.hit) {
                    if (pickInfo.pickedMesh !== aimedBlock) {
                        if (aimedBlock) {
                            aimedBlock.unlit();
                        }
                        aimedBlock = undefined;
                        if (pickInfo.pickedMesh instanceof Block) {
                            aimedBlock = pickInfo.pickedMesh;
                            aimedBlock.highlight();
                        }
                    }
                }
            }
            else {
                let pickInfo = Main.Scene.pick(x, y, (m) => {
                    return m !== pickedBlock;
                });
                if (pickInfo.hit) {
                    let coordinates = pickInfo.pickedPoint.clone();
                    coordinates.addInPlace(pickInfo.getNormal(true).multiplyInPlace(new BABYLON.Vector3(0.25, 0.125, 0.25)));
                    coordinates.x = Math.floor(2 * coordinates.x) / 2 + 0.25;
                    coordinates.y = Math.floor(4 * coordinates.y) / 4 + 0.125;
                    coordinates.z = Math.floor(2 * coordinates.z) / 2 + 0.25;
                    if (coordinates) {
                        pickedBlock.position.copyFrom(coordinates);
                    }
                }
            }
        };
        action.onClick = () => {
            if (!pickedBlock) {
                if (aimedBlock) {
                    pickedBlock = aimedBlock;
                    if (pickedBlock.chunck) {
                        pickedBlock.chunck.removeBlock(pickedBlock);
                        pickedBlock.chunck = undefined;
                    }
                }
            }
            else {
                let x = Main.Engine.getRenderWidth() * 0.5;
                let y = Main.Engine.getRenderHeight() * 0.5;
                let pickInfo = Main.Scene.pick(x, y, (m) => {
                    return m !== pickedBlock;
                });
                let world = pickInfo.pickedPoint.clone();
                world.addInPlace(pickInfo.getNormal(true).multiplyInPlace(new BABYLON.Vector3(0.25, 0.125, 0.25)));
                let coordinates = ChunckUtils.WorldPositionToChunckBlockCoordinates_V1(world);
                if (coordinates) {
                    coordinates.chunck.addBlock(pickedBlock);
                    pickedBlock.setCoordinates(coordinates.coordinates);
                }
                pickedBlock = undefined;
            }
        };
        action.onUnequip = () => {
            if (aimedBlock) {
                aimedBlock.unlit();
            }
        };
        return action;
    }
    static CreateBlockAction(blockReference) {
        let action = new PlayerAction();
        let previewMesh;
        let r = 0;
        action.iconUrl = "./datas/textures/miniatures/" + blockReference + "-miniature.png";
        action.onKeyUp = (e) => {
            if (e.keyCode === 82) {
                r = (r + 1) % 4;
                previewMesh.rotation.y = Math.PI / 2 * r;
            }
        };
        action.onUpdate = () => {
            let x = Main.Engine.getRenderWidth() * 0.5;
            let y = Main.Engine.getRenderHeight() * 0.5;
            let pickInfo = Main.Scene.pick(x, y, (m) => {
                return m !== previewMesh;
            });
            if (pickInfo.hit) {
                let coordinates = pickInfo.pickedPoint.clone();
                coordinates.addInPlace(pickInfo.getNormal(true).multiplyInPlace(new BABYLON.Vector3(0.25, 0.125, 0.25)));
                coordinates.x = Math.floor(2 * coordinates.x) / 2 + 0.25;
                coordinates.y = Math.floor(4 * coordinates.y) / 4 + 0.125;
                coordinates.z = Math.floor(2 * coordinates.z) / 2 + 0.25;
                if (coordinates) {
                    if (!previewMesh) {
                        previewMesh = BABYLON.MeshBuilder.CreateBox("preview-mesh", { size: 0.2 });
                        let blockMaterial = BlockVertexData.StringToBlockMaterial(blockReference.split("-")[0]);
                        let m = blockReference.split("-");
                        m.splice(0, 1);
                        let meshName = m.join("-");
                        BlockVertexData.GetVertexData(meshName, blockMaterial).then(data => {
                            data.applyToMesh(previewMesh);
                        });
                        previewMesh.material = Cube.PreviewMaterials[CubeType.None];
                    }
                    previewMesh.position.copyFrom(coordinates);
                }
                else {
                    if (previewMesh) {
                        previewMesh.dispose();
                        previewMesh = undefined;
                    }
                }
            }
        };
        action.onClick = () => {
            let x = Main.Engine.getRenderWidth() * 0.5;
            let y = Main.Engine.getRenderHeight() * 0.5;
            let pickInfo = Main.Scene.pick(x, y, (m) => {
                return m !== previewMesh;
            });
            if (pickInfo.hit) {
                let world = pickInfo.pickedPoint.clone();
                world.addInPlace(pickInfo.getNormal(true).multiplyInPlace(new BABYLON.Vector3(0.25, 0.125, 0.25)));
                let coordinates = ChunckUtils.WorldPositionToChunckBlockCoordinates_V1(world);
                if (coordinates) {
                    let block = new Block();
                    block.setReference(blockReference);
                    coordinates.chunck.addBlock(block);
                    block.setCoordinates(coordinates.coordinates);
                    block.r = r;
                }
            }
        };
        action.onUnequip = () => {
            if (previewMesh) {
                previewMesh.dispose();
                previewMesh = undefined;
            }
        };
        return action;
    }
    static CreateBrickAction(brickReferenceStr) {
        let brickReference = Brick.ParseReference(brickReferenceStr);
        let action = new PlayerAction();
        let previewMesh;
        let r = 0;
        action.iconUrl = "./datas/textures/miniatures/" + brickReferenceStr + "-miniature.png";
        action.onKeyUp = (e) => {
            if (e.keyCode === 82) {
                r = (r + 1) % 4;
                previewMesh.rotation.y = Math.PI / 2 * r;
            }
        };
        action.onUpdate = () => {
            let x = Main.Engine.getRenderWidth() * 0.5;
            let y = Main.Engine.getRenderHeight() * 0.5;
            let pickInfo = Main.Scene.pick(x, y, (m) => {
                return m !== previewMesh;
            });
            if (pickInfo.hit) {
                let world = pickInfo.pickedPoint.clone();
                let hitKnob = TileUtils.IsKnobHit(world, pickInfo.getNormal(true));
                document.getElementById("is-knob-hit").textContent = hitKnob ? "TRUE" : "FALSE";
                if (!hitKnob) {
                    world.addInPlace(pickInfo.getNormal(true).multiplyInPlace(new BABYLON.Vector3(DX / 4, DY / 4, DX / 4)));
                }
                world.x = Math.round(world.x / DX) * DX;
                world.y = Math.floor(world.y / DY) * DY;
                world.z = Math.round(world.z / DX) * DX;
                if (world) {
                    if (!previewMesh) {
                        previewMesh = BABYLON.MeshBuilder.CreateBox("preview-mesh", { size: DX });
                        BrickVertexData.GetFullBrickVertexData(brickReference).then(data => {
                            data.applyToMesh(previewMesh);
                        });
                    }
                    previewMesh.position.copyFrom(world);
                    previewMesh.rotation.y = Math.PI / 2 * r;
                }
                else {
                    if (previewMesh) {
                        previewMesh.dispose();
                        previewMesh = undefined;
                    }
                }
            }
        };
        action.onClick = () => {
            let x = Main.Engine.getRenderWidth() * 0.5;
            let y = Main.Engine.getRenderHeight() * 0.5;
            let pickInfo = Main.Scene.pick(x, y, (m) => {
                return m !== previewMesh;
            });
            if (pickInfo.hit) {
                let world = pickInfo.pickedPoint.clone();
                let hitKnob = TileUtils.IsKnobHit(world, pickInfo.getNormal(true));
                document.getElementById("is-knob-hit").textContent = hitKnob ? "TRUE" : "FALSE";
                if (!hitKnob) {
                    world.addInPlace(pickInfo.getNormal(true).multiplyInPlace(new BABYLON.Vector3(DX / 4, DY / 4, DX / 4)));
                }
                //let coordinates = ChunckUtils.WorldPositionToTileBrickCoordinates(world);
                let coordinates = ChunckUtils.WorldPositionToChunckBrickCoordinates_V2(world);
                if (coordinates) {
                    let brick = new Brick();
                    brick.reference = brickReference;
                    brick.i = coordinates.coordinates.x;
                    brick.j = coordinates.coordinates.y;
                    brick.k = coordinates.coordinates.z;
                    brick.r = r;
                    if (coordinates.chunck && coordinates.chunck instanceof Chunck_V2) {
                        coordinates.chunck.bricks.push(brick);
                        coordinates.chunck.updateBricks();
                    }
                }
            }
        };
        action.onUnequip = () => {
            if (previewMesh) {
                previewMesh.dispose();
                previewMesh = undefined;
            }
        };
        return action;
    }
    static CreateMountainAction(r, h, roughness) {
        let action = new PlayerAction();
        action.iconUrl = "./datas/textures/miniatures/move-arrow.png";
        action.onClick = () => {
            let x = Main.Engine.getRenderWidth() * 0.5;
            let y = Main.Engine.getRenderHeight() * 0.5;
            let coordinates = ChunckUtils.XYScreenToChunckV1Coordinates(x, y);
            if (coordinates) {
                let I = coordinates.coordinates.x + coordinates.chunck.i * CHUNCK_SIZE;
                let J = coordinates.coordinates.y + coordinates.chunck.j * CHUNCK_SIZE;
                let K = coordinates.coordinates.z + coordinates.chunck.k * CHUNCK_SIZE;
                for (let i = -r; i <= r; i++) {
                    for (let k = -r; k <= r; k++) {
                        let d = Math.sqrt(i * i + k * k);
                        let localH = (Math.random() * h * roughness + h * (1 - roughness)) * (1 - d / r);
                        for (let j = -1; j < localH; j++) {
                            Main.ChunckManager.setCube(I + i, J + j, K + k, CubeType.Rock, 0, false);
                        }
                    }
                }
                Main.ChunckManager.redrawZone(I - 5, J - 3, K - 5, I + 5, J + 7, K + 5);
            }
        };
        return action;
    }
    static CreateTreeAction() {
        let action = new PlayerAction();
        action.iconUrl = "./datas/textures/miniatures/move-arrow.png";
        action.onClick = () => {
            let x = Main.Engine.getRenderWidth() * 0.5;
            let y = Main.Engine.getRenderHeight() * 0.5;
            let pickInfo = Main.Scene.pick(x, y, (m) => {
                return m instanceof Chunck_V1;
            });
            if (pickInfo.hit) {
                let tree = new Tree(Math.floor(Math.random() * 49 + 1));
                tree.generate(pickInfo.pickedPoint);
                let t = 0;
                let growthLoop = () => {
                    t += 0.01;
                    tree.createMesh(Math.min(t, 1)).then(() => {
                        if (t < 1) {
                            requestAnimationFrame(growthLoop);
                        }
                    });
                };
                growthLoop();
            }
        };
        return action;
    }
}
class PlayerAction {
}
class PlayerActionManager {
    constructor(player) {
        this.player = player;
        this.linkedActions = [];
    }
    register() {
        Main.Canvas.addEventListener("keyup", (e) => {
            let index = e.keyCode - 48;
            if (index >= 0 && index < 10) {
                for (let i = 0; i < 10; i++) {
                    document.getElementById("player-action-" + i + "-icon").style.border = "";
                    document.getElementById("player-action-" + i + "-icon").style.margin = "";
                }
                // Unequip current action
                if (this.player.currentAction) {
                    if (this.player.currentAction.onUnequip) {
                        this.player.currentAction.onUnequip();
                    }
                }
                if (this.linkedActions[index]) {
                    // If request action was already equiped, remove it.
                    if (this.player.currentAction === this.linkedActions[index]) {
                        this.player.currentAction = undefined;
                    }
                    // Equip new action.
                    else {
                        this.player.currentAction = this.linkedActions[index];
                        if (this.player.currentAction) {
                            document.getElementById("player-action-" + index + "-icon").style.border = "solid 3px white";
                            document.getElementById("player-action-" + index + "-icon").style.margin = "-2px -2px -2px 8px";
                            if (this.player.currentAction.onEquip) {
                                this.player.currentAction.onEquip();
                            }
                        }
                    }
                }
                else {
                    this.player.currentAction = undefined;
                }
            }
        });
    }
    linkAction(action, index) {
        if (index >= 0 && index <= 9) {
            this.linkedActions[index] = action;
            document.getElementById("player-action-" + index + "-icon").style.backgroundImage = "url(" + action.iconUrl + ")";
        }
    }
    unlinkAction(index) {
        if (index >= 0 && index <= 9) {
            this.linkedActions[index] = undefined;
            document.getElementById("player-action-" + index + "-icon").style.backgroundImage = "";
        }
    }
}
var InventorySection;
(function (InventorySection) {
    InventorySection[InventorySection["Action"] = 0] = "Action";
    InventorySection[InventorySection["Cube"] = 1] = "Cube";
    InventorySection[InventorySection["Block"] = 2] = "Block";
    InventorySection[InventorySection["Brick"] = 3] = "Brick";
})(InventorySection || (InventorySection = {}));
class InventoryItem {
    constructor() {
        this.count = 1;
    }
    static Block(reference) {
        let it = new InventoryItem();
        it.section = InventorySection.Block;
        it.name = reference;
        it.playerAction = PlayerActionTemplate.CreateBlockAction(reference);
        it.iconUrl = "./datas/textures/miniatures/" + reference + "-miniature.png";
        return it;
    }
    static Brick(reference) {
        let it = new InventoryItem();
        it.section = InventorySection.Brick;
        it.name = reference;
        it.playerAction = PlayerActionTemplate.CreateBrickAction(reference);
        it.iconUrl = "./datas/textures/miniatures/" + reference + "-miniature.png";
        return it;
    }
    static Cube(cubeType) {
        let it = new InventoryItem();
        it.section = InventorySection.Cube;
        it.name = "Cube-" + cubeType;
        it.playerAction = PlayerActionTemplate.CreateCubeAction(cubeType);
        it.iconUrl = "./datas/textures/miniatures/" + ChunckUtils.CubeTypeToString(cubeType) + "-miniature.png";
        return it;
    }
}
class Inventory {
    constructor(player) {
        this.player = player;
        this.items = [];
    }
    initialize() {
        Main.MenuManager.inventory = this;
        for (let i = 0; i < 10; i++) {
            let ii = i;
            let playerAction = document.getElementById("player-action-" + i + "-icon");
            playerAction.ondragover = (e) => {
                e.preventDefault();
            };
            playerAction.ondrop = (e) => {
                if (this._draggedItem) {
                    this.player.playerActionManager.linkAction(this._draggedItem.playerAction, ii);
                }
                this._draggedItem = undefined;
            };
        }
        this.body = document.getElementById("inventory");
        this._sectionActions = document.getElementById("section-actions");
        if (this._sectionActions) {
            this._sectionActions.addEventListener("pointerup", () => {
                this.currentSection = InventorySection.Action;
                this.update();
            });
        }
        this._sectionCubes = document.getElementById("section-cubes");
        if (this._sectionCubes) {
            this._sectionCubes.addEventListener("pointerup", () => {
                this.currentSection = InventorySection.Cube;
                this.update();
            });
        }
        this._sectionBlocks = document.getElementById("section-blocks");
        if (this._sectionBlocks) {
            this._sectionBlocks.addEventListener("pointerup", () => {
                this.currentSection = InventorySection.Block;
                this.update();
            });
        }
        this._sectionBricks = document.getElementById("section-bricks");
        if (this._sectionBricks) {
            this._sectionBricks.addEventListener("pointerup", () => {
                this.currentSection = InventorySection.Brick;
                this.update();
            });
        }
        this._subSections = document.getElementById("sub-sections");
        this._items = document.getElementById("items");
        document.getElementById("inventory-close").addEventListener("pointerup", () => {
            delete Main.MenuManager.currentMenu;
            Main.Canvas.requestPointerLock();
            Main.Canvas.focus();
        });
        Main.Canvas.addEventListener("keyup", (e) => {
            if (e.keyCode === 73) {
                Main.MenuManager.currentMenu = MenuPage.Inventory;
                document.exitPointerLock();
            }
        });
        this.update();
    }
    addItem(item) {
        let same = this.items.find(it => { return it.name === item.name; });
        if (same) {
            same.count++;
        }
        else {
            this.items.push(item);
        }
    }
    getCurrentSectionItems() {
        let sectionItems = [];
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].section === this.currentSection) {
                sectionItems.push(this.items[i]);
            }
        }
        return sectionItems;
    }
    update() {
        if (this._sectionActions) {
            if (this.currentSection === InventorySection.Action) {
                this._sectionActions.style.background = "white";
                this._sectionActions.style.color = "black";
            }
            else {
                this._sectionActions.style.background = "black";
                this._sectionActions.style.color = "white";
            }
        }
        if (this._sectionCubes) {
            if (this.currentSection === InventorySection.Cube) {
                this._sectionCubes.style.background = "white";
                this._sectionCubes.style.color = "black";
            }
            else {
                this._sectionCubes.style.background = "black";
                this._sectionCubes.style.color = "white";
            }
        }
        if (this._sectionBlocks) {
            if (this.currentSection === InventorySection.Block) {
                this._sectionBlocks.style.background = "white";
                this._sectionBlocks.style.color = "black";
            }
            else {
                this._sectionBlocks.style.background = "black";
                this._sectionBlocks.style.color = "white";
            }
        }
        if (this._sectionBricks) {
            if (this.currentSection === InventorySection.Brick) {
                this._sectionBricks.style.background = "white";
                this._sectionBricks.style.color = "black";
            }
            else {
                this._sectionBricks.style.background = "black";
                this._sectionBricks.style.color = "white";
            }
        }
        this.clearSubsections();
        this.clearItems();
        let currentSectionItems = this.getCurrentSectionItems();
        for (let i = 0; i < currentSectionItems.length; i++) {
            let it = currentSectionItems[i];
            let itemDiv = document.createElement("div");
            itemDiv.classList.add("item");
            itemDiv.style.backgroundImage = "url(" + it.iconUrl + ")";
            if (it.playerAction) {
                itemDiv.setAttribute("draggable", "true");
                itemDiv.ondragstart = (e) => {
                    this._draggedItem = it;
                };
                itemDiv.ondragend = (e) => {
                    this._draggedItem = undefined;
                };
            }
            let itemCount = document.createElement("div");
            itemCount.classList.add("item-count");
            itemCount.innerText = it.count.toFixed(0);
            itemDiv.appendChild(itemCount);
            this._items.appendChild(itemDiv);
        }
    }
    clearSubsections() {
        this._subSections.innerHTML = "";
    }
    clearItems() {
        this._items.innerHTML = "";
    }
}
/// <reference path="../../lib/babylon.d.ts"/>
class Main {
    static get cellShadingMaterial() {
        if (!Main._cellShadingMaterial) {
            Main._cellShadingMaterial = new ToonMaterial("CellMaterial", false, Main.Scene);
        }
        return Main._cellShadingMaterial;
    }
    static get cellShadingTransparentMaterial() {
        if (!Main._cellShadingTransparentMaterial) {
            Main._cellShadingTransparentMaterial = new ToonMaterial("CellMaterial", true, Main.Scene);
        }
        return Main._cellShadingTransparentMaterial;
    }
    static get terrainCellShadingMaterial() {
        if (!Main._terrainCellShadingMaterial) {
            Main._terrainCellShadingMaterial = new TerrainToonMaterial("CellMaterial", BABYLON.Color3.White(), Main.Scene);
        }
        return Main._terrainCellShadingMaterial;
    }
    static get toonRampTexture() {
        if (!Main._toonRampTexture) {
            Main._toonRampTexture = new BABYLON.Texture("./datas/textures/toon-ramp.png", Main.Scene);
        }
        return Main._toonRampTexture;
    }
    constructor(canvasElement) {
        Main.Canvas = document.getElementById(canvasElement);
        Main.Engine = new BABYLON.Engine(Main.Canvas, true, { preserveDrawingBuffer: true, stencil: true });
    }
    initializeCamera() {
        let camera = new BABYLON.ArcRotateCamera("camera1", 0, 0, 1, new BABYLON.Vector3(0, 10, 0), Main.Scene);
        camera.setPosition(new BABYLON.Vector3(-20, 50, 60));
        camera.attachControl(Main.Canvas, true);
        camera.lowerRadiusLimit = 6;
        camera.upperRadiusLimit = 200;
        camera.wheelPrecision *= 4;
        Main.Camera = camera;
    }
    async initialize() {
        await this.initializeScene();
    }
    async initializeScene() {
        Main.Scene = new BABYLON.Scene(Main.Engine);
        this.initializeCamera();
        Main.Camera.minZ = 0.2;
        Main.Camera.maxZ = 2000;
        Main.Light = new BABYLON.HemisphericLight("AmbientLight", new BABYLON.Vector3(1, 3, 2), Main.Scene);
        BABYLON.Effect.ShadersStore["EdgeFragmentShader"] = `
			#ifdef GL_ES
			precision highp float;
			#endif
			varying vec2 vUV;
			uniform sampler2D textureSampler;
			uniform sampler2D depthSampler;
			uniform float 		width;
			uniform float 		height;
			void make_kernel_color(inout vec4 n[9], sampler2D tex, vec2 coord)
			{
				float w = 1.0 / width;
				float h = 1.0 / height;
				n[0] = texture2D(tex, coord + vec2( -w, -h));
				n[1] = texture2D(tex, coord + vec2(0.0, -h));
				n[2] = texture2D(tex, coord + vec2(  w, -h));
				n[3] = texture2D(tex, coord + vec2( -w, 0.0));
				n[4] = texture2D(tex, coord);
				n[5] = texture2D(tex, coord + vec2(  w, 0.0));
				n[6] = texture2D(tex, coord + vec2( -w, h));
				n[7] = texture2D(tex, coord + vec2(0.0, h));
				n[8] = texture2D(tex, coord + vec2(  w, h));
			}
			void make_kernel_depth(inout float n[9], sampler2D tex, vec2 coord)
			{
				float w = 1.0 / width;
				float h = 1.0 / height;
				n[0] = texture2D(tex, coord + vec2( -w, -h)).r;
				n[1] = texture2D(tex, coord + vec2(0.0, -h)).r;
				n[2] = texture2D(tex, coord + vec2(  w, -h)).r;
				n[3] = texture2D(tex, coord + vec2( -w, 0.0)).r;
				n[4] = texture2D(tex, coord).r;
				n[5] = texture2D(tex, coord + vec2(  w, 0.0)).r;
				n[6] = texture2D(tex, coord + vec2( -w, h)).r;
				n[7] = texture2D(tex, coord + vec2(0.0, h)).r;
				n[8] = texture2D(tex, coord + vec2(  w, h)).r;
			}
			void main(void) 
			{
				vec4 d = texture2D(depthSampler, vUV);
				float depth = d.r * (2000.0 - 0.2) + 0.2;
				
				float nD[9];
				make_kernel_depth( nD, depthSampler, vUV );
				float sobel_depth_edge_h = nD[2] + (2.0*nD[5]) + nD[8] - (nD[0] + (2.0*nD[3]) + nD[6]);
				float sobel_depth_edge_v = nD[0] + (2.0*nD[1]) + nD[2] - (nD[6] + (2.0*nD[7]) + nD[8]);
				float sobel_depth = sqrt((sobel_depth_edge_h * sobel_depth_edge_h) + (sobel_depth_edge_v * sobel_depth_edge_v));
				float thresholdDepth = 0.002;

				vec4 n[9];
				make_kernel_color( n, textureSampler, vUV );
				vec4 sobel_edge_h = n[2] + (2.0*n[5]) + n[8] - (n[0] + (2.0*n[3]) + n[6]);
				vec4 sobel_edge_v = n[0] + (2.0*n[1]) + n[2] - (n[6] + (2.0*n[7]) + n[8]);
				vec4 sobel = sqrt((sobel_edge_h * sobel_edge_h) + (sobel_edge_v * sobel_edge_v));
				float threshold = 0.2;
				
				gl_FragColor = vec4(n[4]) * 0.5;
				gl_FragColor.a = 1.0;
				if (sobel_depth < thresholdDepth || depth > 1000.) {
					if (max(sobel.r, max(sobel.g, sobel.b)) < threshold) {
						gl_FragColor = n[4];
					}
				}
			}
        `;
        BABYLON.Engine.ShadersRepository = "./shaders/";
        let depthMap = Main.Scene.enableDepthRenderer(Main.Camera).getDepthMap();
        let postProcess = new BABYLON.PostProcess("Edge", "Edge", ["width", "height"], ["depthSampler"], 1, Main.Camera);
        postProcess.onApply = (effect) => {
            effect.setTexture("depthSampler", depthMap);
            effect.setFloat("width", Main.Engine.getRenderWidth());
            effect.setFloat("height", Main.Engine.getRenderHeight());
        };
        let noPostProcessCamera = new BABYLON.FreeCamera("no-post-process-camera", BABYLON.Vector3.Zero(), Main.Scene);
        noPostProcessCamera.parent = Main.Camera;
        noPostProcessCamera.layerMask = 0x10000000;
        Main.Scene.activeCameras.push(Main.Camera, noPostProcessCamera);
        // Skybox seed : 1vt3h8rxhb28
        Main.Skybox = BABYLON.MeshBuilder.CreateSphere("skyBox", { diameter: 3000.0 }, Main.Scene);
        Main.Skybox.layerMask = 1;
        Main.Skybox.infiniteDistance = true;
        let skyboxMaterial = new BABYLON.StandardMaterial("skyBox", Main.Scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.emissiveTexture = new BABYLON.Texture("./datas/textures/sky.png", Main.Scene);
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        Main.Skybox.material = skyboxMaterial;
        Main.ChunckManager = new ChunckManager();
        new VertexDataLoader(Main.Scene);
        Main.MenuManager = new MenuManager();
        Main.MenuManager.initialize();
        let pauseMenu = new PauseMenu();
        pauseMenu.initialize();
        console.log("Main scene Initialized.");
    }
    animate() {
        let fpsValues = [];
        Main.Engine.runRenderLoop(() => {
            Main.Scene.render();
            let dt = Main.Engine.getDeltaTime();
            let fps = 1000 / dt;
            if (isFinite(fps)) {
                fpsValues.push(fps);
                while (fpsValues.length > 60) {
                    fpsValues.splice(0, 1);
                }
                let fpsCurrent = fpsValues[0];
                let fpsSpike = fpsValues[0];
                for (let i = 1; i < fpsValues.length; i++) {
                    fpsCurrent += fpsValues[i];
                    fpsSpike = Math.min(fpsSpike, fpsValues[i]);
                }
                fpsCurrent /= fpsValues.length;
                document.getElementById("fps-current").textContent = fpsCurrent.toFixed(0);
                document.getElementById("fps-spike").textContent = fpsSpike.toFixed(0);
            }
        });
        window.addEventListener("resize", () => {
            Main.Engine.resize();
        });
    }
}
window.addEventListener("load", async () => {
    let main;
    let url = window.location.href;
    let allParams = url.split("?")[1];
    if (allParams) {
        let params = allParams.split("&");
        for (let i = 0; i < params.length; i++) {
            let splitParam = params[i].split("=");
            if (splitParam[0] === "main") {
                if (splitParam[1] === "skull_island") {
                    main = new SkullIsland("render-canvas");
                }
                else if (splitParam[1] === "collisions_test") {
                    main = new CollisionsTest("render-canvas");
                }
                else if (splitParam[1] === "player_test") {
                    main = new PlayerTest("render-canvas");
                }
                else if (splitParam[1] === "miniature") {
                    main = new Miniature("render-canvas");
                }
                else if (splitParam[1] === "tile_test") {
                    main = new TileTest("render-canvas");
                }
            }
        }
    }
    await main.initialize();
    main.animate();
});
/// <reference path="./Main.ts"/>
class CollisionsTest extends Main {
    static DisplayCross(p, duration = 200) {
        let crossX = BABYLON.MeshBuilder.CreateBox("cube", {
            width: 3,
            height: 0.1,
            depth: 0.1
        }, Main.Scene);
        crossX.position.copyFrom(p);
        let crossY = BABYLON.MeshBuilder.CreateBox("cube", {
            width: 0.1,
            height: 3,
            depth: 0.1
        }, Main.Scene);
        crossY.parent = crossX;
        let crossZ = BABYLON.MeshBuilder.CreateBox("cube", {
            width: 0.1,
            height: 0.1,
            depth: 3
        }, Main.Scene);
        crossZ.parent = crossX;
        setTimeout(() => {
            crossX.dispose();
        }, duration);
    }
    async initialize() {
        await super.initializeScene();
        let l = 2;
        let manyChuncks = [];
        let savedTerrainString = window.localStorage.getItem("collisions-test");
        if (savedTerrainString) {
            let t0 = performance.now();
            let savedTerrain = JSON.parse(savedTerrainString);
            Main.ChunckManager.deserialize(savedTerrain);
            for (let i = -l; i <= l; i++) {
                for (let j = -1; j <= 2 * l - 1; j++) {
                    for (let k = -l; k <= l; k++) {
                        let chunck = Main.ChunckManager.getChunck(i, j, k);
                        if (chunck) {
                            manyChuncks.push(chunck);
                        }
                    }
                }
            }
            let loopOut = async () => {
                await Main.ChunckManager.generateManyChuncks(manyChuncks);
                let t1 = performance.now();
                console.log("Scene loaded from local storage in " + (t1 - t0).toFixed(1) + " ms");
            };
            loopOut();
        }
        else {
            let t0 = performance.now();
            for (let i = -l; i <= l; i++) {
                for (let j = -1; j <= l; j++) {
                    for (let k = -l; k <= l; k++) {
                        let chunck = Main.ChunckManager.createChunck(i, j, k);
                        if (chunck) {
                            manyChuncks.push(chunck);
                        }
                    }
                }
            }
            for (let i = -l; i <= l; i++) {
                for (let k = -l; k <= l; k++) {
                    let chunck = Main.ChunckManager.getChunck(i, -1, k);
                    chunck.generateFull(CubeType.Dirt);
                    chunck = Main.ChunckManager.getChunck(i, 0, k);
                    chunck.generateFull(CubeType.Dirt);
                }
            }
            let loopOut = async () => {
                console.log(manyChuncks.length);
                await Main.ChunckManager.generateManyChuncks(manyChuncks);
                let t1 = performance.now();
                console.log("Scene generated in " + (t1 - t0).toFixed(1) + " ms");
            };
            loopOut();
        }
        let inputLeft = false;
        let inputRight = false;
        let inputBack = false;
        let inputForward = false;
        let sphere = BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: 1 }, Main.Scene);
        sphere.position.copyFromFloats(0, 10, 0);
        //let cube = BABYLON.MeshBuilder.CreateBox("cube", { width: 2, height: 2, depth: 2}, Main.Scene);
        //cube.position.copyFromFloats(3, 10, 3);
        let downSpeed = 0.005;
        let update = () => {
            if (Main.Camera instanceof BABYLON.ArcRotateCamera) {
                sphere.rotation.y = -Math.PI / 2 - Main.Camera.alpha;
            }
            let right = sphere.getDirection(BABYLON.Axis.X);
            let forward = sphere.getDirection(BABYLON.Axis.Z);
            if (inputLeft) {
                sphere.position.addInPlace(right.scale(-0.04));
            }
            if (inputRight) {
                sphere.position.addInPlace(right.scale(0.04));
            }
            if (inputBack) {
                sphere.position.addInPlace(forward.scale(-0.04));
            }
            if (inputForward) {
                sphere.position.addInPlace(forward.scale(0.04));
            }
            sphere.position.y -= downSpeed;
            downSpeed += 0.005;
            downSpeed *= 0.99;
            //let intersection = Intersections3D.SphereCube(sphere.position, 0.5, cube.getBoundingInfo().minimum.add(cube.position), cube.getBoundingInfo().maximum.add(cube.position));
            //if (intersection && intersection.point) {
            //    CollisionsTest.DisplayCross(intersection.point, 200);
            //}
            let count = 0;
            for (let i = 0; i < manyChuncks.length; i++) {
                let intersections = Intersections3D.SphereChunck_V1(sphere.position, 0.5, manyChuncks[i]);
                if (intersections) {
                    for (let j = 0; j < intersections.length; j++) {
                        //CollisionsTest.DisplayCross(intersections[j].point, 200);
                        let d = sphere.position.subtract(intersections[j].point);
                        let l = d.length();
                        d.normalize();
                        if (d.y > 0.8) {
                            downSpeed = 0.0;
                        }
                        d.scaleInPlace((0.5 - l) * 0.2);
                        sphere.position.addInPlace(d);
                        count++;
                    }
                }
            }
            //console.log("DownSpeed = " + downSpeed);
            console.log("Count = " + count);
            requestAnimationFrame(update);
        };
        update();
        window.addEventListener("keyup", (e) => {
            if (e.keyCode === 81) {
                inputLeft = false;
            }
            else if (e.keyCode === 68) {
                inputRight = false;
            }
            else if (e.keyCode === 83) {
                inputBack = false;
            }
            else if (e.keyCode === 90) {
                inputForward = false;
            }
            else if (e.keyCode === 32) {
                downSpeed = -0.15;
            }
        });
        window.addEventListener("keydown", (e) => {
            if (e.keyCode === 81) {
                inputLeft = true;
            }
            else if (e.keyCode === 68) {
                inputRight = true;
            }
            else if (e.keyCode === 83) {
                inputBack = true;
            }
            else if (e.keyCode === 90) {
                inputForward = true;
            }
        });
        if (Main.Camera instanceof BABYLON.ArcRotateCamera) {
            Main.Camera.setTarget(sphere);
            Main.Camera.alpha = -Math.PI / 2;
            Main.Camera.beta = Math.PI / 4;
            Main.Camera.radius = 10;
        }
        Main.ChunckEditor = new ChunckEditor(Main.ChunckManager);
        Main.ChunckEditor.saveSceneName = "collisions-test";
    }
}
/// <reference path="Main.ts"/>
class Miniature extends Main {
    constructor() {
        super(...arguments);
        this.targets = [];
    }
    updateCameraPosition() {
        if (Main.Camera instanceof BABYLON.ArcRotateCamera) {
            Main.Camera.lowerRadiusLimit = 0.01;
            Main.Camera.upperRadiusLimit = 1000;
            let size = 0;
            this.targets.forEach(t => {
                let bbox = t.getBoundingInfo();
                size = Math.max(size, bbox.maximum.x - bbox.minimum.x);
                size = Math.max(size, bbox.maximum.y - bbox.minimum.y);
                size = Math.max(size, bbox.maximum.z - bbox.minimum.z);
            });
            let bbox = this.targets[0].getBoundingInfo();
            Main.Camera.target.copyFrom(bbox.maximum).addInPlace(bbox.minimum).scaleInPlace(0.5);
            let cameraPosition = new BABYLON.Vector3(-1, 0.6, 0.8);
            cameraPosition.scaleInPlace(size * 1.8);
            cameraPosition.addInPlace(Main.Camera.target);
            Main.Camera.setPosition(cameraPosition);
        }
    }
    async initialize() {
        super.initialize();
        await BrickVertexData.InitializeData();
        await BrickDataManager.InitializeData();
        Main.Scene.clearColor.copyFromFloats(0, 1, 0, 1);
        console.log("Miniature initialized.");
        let loop = () => {
            if (document.pointerLockElement) {
                setTimeout(async () => {
                    this.runAllScreenShots();
                }, 100);
            }
            else {
                requestAnimationFrame(loop);
            }
        };
        loop();
    }
    async runAllScreenShots() {
        let colors = BrickDataManager.BrickColorNames;
        for (let i = 0; i < BrickDataManager.BrickNames.length; i++) {
            let name = BrickDataManager.BrickNames[i];
            for (let j = 0; j < colors.length; j++) {
                let color = colors[j];
                await this.createBrick(name + "-" + color);
            }
        }
        /*
        await this.createCube(CubeType.Dirt);
        await this.createCube(CubeType.Rock);
        await this.createCube(CubeType.Sand);
        for (let i = 0; i < BlockList.References.length; i++) {
            let reference = BlockList.References[i];
            await this.createBlock(reference);
        }
        */
    }
    async createCube(cubeType) {
        let chunck = Main.ChunckManager.createChunck(0, 0, 0);
        this.targets = [chunck];
        chunck.setCube(0, 0, 0, cubeType);
        chunck.setCube(1, 0, 0, cubeType);
        chunck.setCube(0, 1, 0, cubeType);
        chunck.setCube(0, 0, 1, cubeType);
        chunck.setCube(1, 1, 1, cubeType);
        chunck.setCube(0, 1, 1, cubeType);
        chunck.setCube(1, 0, 1, cubeType);
        chunck.setCube(1, 1, 0, cubeType);
        chunck.generate();
        chunck.computeWorldMatrix(true);
        return new Promise(resolve => {
            setTimeout(() => {
                this.updateCameraPosition();
                setTimeout(async () => {
                    await this.makeScreenShot(ChunckUtils.CubeTypeToString(cubeType).toLocaleLowerCase(), false);
                    resolve();
                }, 80);
            }, 80);
        });
    }
    async createBlock(reference) {
        let chunck = Main.ChunckManager.createChunck(0, 0, 0);
        chunck.makeEmpty();
        chunck.generate();
        chunck.computeWorldMatrix(true);
        let block = new Block();
        block.setReference(reference);
        this.targets = [block];
        return new Promise(resolve => {
            setTimeout(() => {
                this.updateCameraPosition();
                setTimeout(async () => {
                    await this.makeScreenShot(reference, false);
                    block.dispose();
                    resolve();
                }, 200);
            }, 200);
        });
    }
    async createBrick(brickReferenceStr) {
        let brickReference = Brick.ParseReference(brickReferenceStr);
        let mesh = new BABYLON.Mesh("mesh");
        let data = await BrickVertexData.GetFullBrickVertexData(brickReference);
        data.applyToMesh(mesh);
        this.targets = [mesh];
        return new Promise(resolve => {
            setTimeout(() => {
                this.updateCameraPosition();
                setTimeout(async () => {
                    await this.makeScreenShot(brickReferenceStr, false);
                    mesh.dispose();
                    resolve();
                }, 200);
            }, 200);
        });
    }
    async makeScreenShot(miniatureName, desaturate = true) {
        return new Promise(resolve => {
            requestAnimationFrame(() => {
                BABYLON.ScreenshotTools.CreateScreenshot(Main.Engine, Main.Camera, {
                    width: 256 * Main.Canvas.width / Main.Canvas.height,
                    height: 256
                }, (data) => {
                    let img = document.createElement("img");
                    img.src = data;
                    img.onload = () => {
                        let sx = (img.width - 256) * 0.5;
                        let sy = (img.height - 256) * 0.5;
                        let canvas = document.createElement("canvas");
                        canvas.width = 256;
                        canvas.height = 256;
                        let context = canvas.getContext("2d");
                        context.drawImage(img, sx, sy, 256, 256, 0, 0, 256, 256);
                        let data = context.getImageData(0, 0, 256, 256);
                        for (let i = 0; i < data.data.length / 4; i++) {
                            let r = data.data[4 * i];
                            let g = data.data[4 * i + 1];
                            let b = data.data[4 * i + 2];
                            if (r === 0 && g === 255 && b === 0) {
                                data.data[4 * i] = 0;
                                data.data[4 * i + 1] = 0;
                                data.data[4 * i + 2] = 0;
                                data.data[4 * i + 3] = 0;
                            }
                            else if (desaturate) {
                                let desat = (r + g + b) / 3;
                                desat = Math.floor(Math.sqrt(desat / 255) * 255);
                                data.data[4 * i] = desat;
                                data.data[4 * i + 1] = desat;
                                data.data[4 * i + 2] = desat;
                                data.data[4 * i + 3] = 255;
                            }
                        }
                        for (let i = 0; i < data.data.length / 4; i++) {
                            let a = data.data[4 * i + 3];
                            if (a === 0) {
                                let hasColoredNeighbour = false;
                                for (let ii = -2; ii <= 2; ii++) {
                                    for (let jj = -2; jj <= 2; jj++) {
                                        if (ii !== 0 || jj !== 0) {
                                            let index = 4 * i + 3;
                                            index += ii * 4;
                                            index += jj * 4 * 256;
                                            if (index >= 0 && index < data.data.length) {
                                                let aNeighbour = data.data[index];
                                                if (aNeighbour === 255) {
                                                    hasColoredNeighbour = true;
                                                }
                                            }
                                        }
                                    }
                                }
                                if (hasColoredNeighbour) {
                                    data.data[4 * i] = 255;
                                    data.data[4 * i + 1] = 255;
                                    data.data[4 * i + 2] = 255;
                                    data.data[4 * i + 3] = 254;
                                }
                            }
                        }
                        context.putImageData(data, 0, 0);
                        var tmpLink = document.createElement('a');
                        let name = "Unknown";
                        if (miniatureName) {
                            name = miniatureName;
                        }
                        tmpLink.download = name + "-miniature.png";
                        tmpLink.href = canvas.toDataURL();
                        document.body.appendChild(tmpLink);
                        tmpLink.click();
                        document.body.removeChild(tmpLink);
                        resolve();
                    };
                });
            });
        });
    }
}
/// <reference path="./Main.ts"/>
class PlayerTest extends Main {
    initializeCamera() {
        let camera = new BABYLON.FreeCamera("camera1", BABYLON.Vector3.Zero(), Main.Scene);
        Main.Camera = camera;
    }
    async initialize() {
        await super.initializeScene();
        await ChunckVertexData.InitializeData();
        await BrickVertexData.InitializeData();
        await BrickDataManager.InitializeData();
        //Main.ChunckEditor.saveSceneName = "player-test";
        let l = 5;
        let savedTerrainString = window.localStorage.getItem("player-test");
        if (savedTerrainString) {
            let t0 = performance.now();
            let savedTerrain = JSON.parse(savedTerrainString);
            Main.ChunckManager.deserialize(savedTerrain);
            Main.ChunckManager.foreachChunck(chunck => {
                Main.ChunckManager.updateBuffer.push(chunck);
            });
            console.log("Scene loaded from local storage");
        }
        else {
            let t0 = performance.now();
            let f = [];
            for (let i = 0; i < 6; i++) {
                f[i] = Math.random() * i + 2;
                if (Math.random() < 0.5) {
                    f[i] *= -1;
                }
            }
            Main.ChunckManager.generateHeightFunction(l, (i, j) => {
                return Math.cos(i / f[0] + j / f[1]) * 0.5 + Math.sin(i / f[2] + j / f[3]) * 1 + Math.cos(i / f[4] + j / f[5]) * 1.5 - 0.5 + Math.random();
            });
            Main.ChunckManager.foreachChunck(chunck => {
                Main.ChunckManager.updateBuffer.push(chunck);
            });
        }
        let player = new Player();
        player.position.y = 60;
        player.register();
        let inventory = new Inventory(player);
        inventory.initialize();
        let inventoryEditBlock = new InventoryItem();
        inventoryEditBlock.name = "EditBlock";
        inventoryEditBlock.section = InventorySection.Action;
        inventoryEditBlock.iconUrl = "./datas/textures/miniatures/move-arrow.png";
        inventoryEditBlock.playerAction = PlayerActionTemplate.EditBlockAction();
        inventory.addItem(inventoryEditBlock);
        /*
        let inventoryCreateTree = new InventoryItem();
        inventoryCreateTree.name = "CreateTree";
        inventoryCreateTree.section = InventorySection.Action;
        inventoryCreateTree.iconUrl = "./datas/textures/miniatures/move-arrow.png";
        inventoryCreateTree.playerAction = PlayerActionTemplate.CreateTreeAction();
        inventory.addItem(inventoryCreateTree);
        player.playerActionManager.linkAction(inventoryCreateTree.playerAction, 1);
        */
        let inventoryCreateMountainSmall = new InventoryItem();
        inventoryCreateMountainSmall.name = "CreateMountainSmall";
        inventoryCreateMountainSmall.section = InventorySection.Action;
        inventoryCreateMountainSmall.iconUrl = "./datas/textures/miniatures/move-arrow.png";
        inventoryCreateMountainSmall.playerAction = PlayerActionTemplate.CreateMountainAction(3, 3, 0.6);
        inventory.addItem(inventoryCreateMountainSmall);
        let inventoryCreateMountainTall = new InventoryItem();
        inventoryCreateMountainTall.name = "CreateMountainTall";
        inventoryCreateMountainTall.section = InventorySection.Action;
        inventoryCreateMountainTall.iconUrl = "./datas/textures/miniatures/move-arrow.png";
        inventoryCreateMountainTall.playerAction = PlayerActionTemplate.CreateMountainAction(2, 7, 0.9);
        inventory.addItem(inventoryCreateMountainTall);
        let inventoryCreateMountainLarge = new InventoryItem();
        inventoryCreateMountainLarge.name = "CreateMountainLarge";
        inventoryCreateMountainLarge.section = InventorySection.Action;
        inventoryCreateMountainLarge.iconUrl = "./datas/textures/miniatures/move-arrow.png";
        inventoryCreateMountainLarge.playerAction = PlayerActionTemplate.CreateMountainAction(5, 5, 0.6);
        inventory.addItem(inventoryCreateMountainLarge);
        player.playerActionManager.linkAction(PlayerActionTemplate.CreateCubeAction(CubeType.Dirt), 1);
        player.playerActionManager.linkAction(PlayerActionTemplate.CreateCubeAction(CubeType.Rock), 2);
        player.playerActionManager.linkAction(PlayerActionTemplate.CreateCubeAction(CubeType.Sand), 3);
        for (let i = 0; i <= Math.random() * 100; i++) {
            inventory.addItem(InventoryItem.Cube(CubeType.Dirt));
        }
        for (let i = 0; i <= Math.random() * 100; i++) {
            inventory.addItem(InventoryItem.Cube(CubeType.Rock));
        }
        for (let i = 0; i <= Math.random() * 100; i++) {
            inventory.addItem(InventoryItem.Cube(CubeType.Sand));
        }
        for (let i = 0; i < BlockList.References.length; i++) {
            let reference = BlockList.References[i];
            for (let n = 0; n <= Math.random() * 100; n++) {
                inventory.addItem(InventoryItem.Block(reference));
            }
        }
        let firstBrick = inventory.items.length;
        for (let i = 0; i < 20; i++) {
            let colors = BrickDataManager.BrickColorNames;
            let color = colors[Math.floor(Math.random() * colors.length)];
            let brickName = BrickDataManager.BrickNames[Math.floor(Math.random() * BrickDataManager.BrickNames.length)];
            let count = Math.floor(Math.random() * 9 + 2);
            for (let n = 0; n < count; n++) {
                inventory.addItem(InventoryItem.Brick(brickName + "-" + color));
            }
        }
        player.playerActionManager.linkAction(inventory.items[firstBrick].playerAction, 4);
        firstBrick = inventory.items.length;
        inventory.addItem(InventoryItem.Brick("windshield-6x2x2-brightbluetransparent"));
        player.playerActionManager.linkAction(inventory.items[firstBrick].playerAction, 5);
        inventory.update();
        if (Main.Camera instanceof BABYLON.FreeCamera) {
            Main.Camera.parent = player;
            Main.Camera.position.y = 1.25;
        }
        return;
        setTimeout(async () => {
            let walker = new Walker("walker");
            await walker.instantiate();
            let point;
            while (!point) {
                let ray = new BABYLON.Ray(new BABYLON.Vector3(-50 + 100 * Math.random(), 100, -50 + 100 * Math.random()), new BABYLON.Vector3(0, -1, 0));
                let pick = Main.Scene.pickWithRay(ray, (m) => {
                    return m instanceof Chunck_V1;
                });
                if (pick.hit) {
                    point = pick.pickedPoint;
                }
            }
            walker.target = BABYLON.Vector3.Zero();
            walker.target.y += 2.5;
            walker.body.position.copyFrom(point);
            walker.body.position.y += 4;
            walker.body.position.addInPlaceFromFloats(Math.random(), Math.random(), Math.random());
            walker.leftFoot.position.copyFrom(point);
            walker.leftFoot.position.x -= 2;
            walker.leftFoot.position.addInPlaceFromFloats(Math.random(), Math.random(), Math.random());
            walker.rightFoot.position.copyFrom(point);
            walker.rightFoot.position.x += 2;
            walker.rightFoot.position.addInPlaceFromFloats(Math.random(), Math.random(), Math.random());
            setInterval(() => {
                let point;
                while (!point) {
                    let ray = new BABYLON.Ray(new BABYLON.Vector3(-50 + 100 * Math.random(), 100, -50 + 100 * Math.random()), new BABYLON.Vector3(0, -1, 0));
                    let pick = Main.Scene.pickWithRay(ray, (m) => {
                        return m instanceof Chunck_V1;
                    });
                    if (pick.hit) {
                        point = pick.pickedPoint;
                    }
                }
                walker.target = point;
                walker.target.y += 2.5;
            }, 15000);
        }, 12000);
    }
}
class SkullIsland extends Main {
    async initialize() {
        await super.initializeScene();
        let borderMaterial = new BABYLON.StandardMaterial("border-material", Main.Scene);
        borderMaterial.diffuseColor.copyFromFloats(0.2, 0.2, 0.2);
        borderMaterial.specularColor.copyFromFloats(0.1, 0.1, 0.1);
        let borderXP = BABYLON.MeshBuilder.CreateBox("border-xp", {
            width: 2,
            depth: 12 * CHUNCK_SIZE + 2,
            height: 6
        });
        borderXP.position.copyFromFloats(6 * CHUNCK_SIZE + 1, 2, -1);
        borderXP.material = borderMaterial;
        let borderXM = BABYLON.MeshBuilder.CreateBox("border-xm", {
            width: 2,
            depth: 12 * CHUNCK_SIZE + 2,
            height: 6
        });
        borderXM.position.copyFromFloats(-6 * CHUNCK_SIZE - 1, 2, 1);
        borderXM.material = borderMaterial;
        let borderZP = BABYLON.MeshBuilder.CreateBox("border-zp", {
            width: 12 * CHUNCK_SIZE + 2,
            depth: 2,
            height: 6
        });
        borderZP.position.copyFromFloats(1, 2, 6 * CHUNCK_SIZE + 1);
        borderZP.material = borderMaterial;
        let borderZM = BABYLON.MeshBuilder.CreateBox("border-zm", {
            width: 12 * CHUNCK_SIZE + 2,
            depth: 2,
            height: 6
        });
        borderZM.position.copyFromFloats(-1, 2, -6 * CHUNCK_SIZE - 1);
        borderZM.material = borderMaterial;
        let water = BABYLON.MeshBuilder.CreateGround("water", {
            width: 12 * CHUNCK_SIZE,
            height: 12 * CHUNCK_SIZE
        }, Main.Scene);
        water.position.y = 4.5;
        let waterMaterial = new BABYLON.StandardMaterial("water-material", Main.Scene);
        waterMaterial.alpha = 0.3;
        waterMaterial.diffuseColor = BABYLON.Color3.FromHexString("#2097c9");
        waterMaterial.specularColor.copyFromFloats(0.1, 0.1, 0.1);
        water.material = waterMaterial;
        let l = 6;
        let manyChuncks = [];
        let savedTerrainString = window.localStorage.getItem("terrain");
        console.log(savedTerrainString);
        if (savedTerrainString) {
            let t0 = performance.now();
            let savedTerrain = JSON.parse(savedTerrainString);
            Main.ChunckManager.deserialize(savedTerrain);
            for (let i = -l; i <= l; i++) {
                for (let j = -1; j <= 2 * l - 1; j++) {
                    for (let k = -l; k <= l; k++) {
                        let chunck = Main.ChunckManager.getChunck(i, j, k);
                        if (chunck) {
                            manyChuncks.push(chunck);
                        }
                    }
                }
            }
            let loopOut = async () => {
                await Main.ChunckManager.generateManyChuncks(manyChuncks);
                let t1 = performance.now();
                console.log("Scene loaded from local storage in " + (t1 - t0).toFixed(1) + " ms");
            };
            loopOut();
        }
        else {
            let t0 = performance.now();
            var request = new XMLHttpRequest();
            request.open('GET', './datas/scenes/crane_island.json', true);
            request.onload = () => {
                if (request.status >= 200 && request.status < 400) {
                    let defaultTerrain = JSON.parse(request.responseText);
                    Main.ChunckManager.deserialize(defaultTerrain);
                    for (let i = -l; i <= l; i++) {
                        for (let j = -1; j <= 2 * l - 1; j++) {
                            for (let k = -l; k <= l; k++) {
                                let chunck = Main.ChunckManager.getChunck(i, j, k);
                                if (chunck) {
                                    manyChuncks.push(chunck);
                                }
                            }
                        }
                    }
                    let loopOut = async () => {
                        await Main.ChunckManager.generateManyChuncks(manyChuncks);
                        let t1 = performance.now();
                        console.log("Scene loaded from file in " + (t1 - t0).toFixed(1) + " ms");
                    };
                    loopOut();
                }
                else {
                    alert("Scene file not found. My bad. Sven.");
                }
            };
            request.onerror = () => {
                alert("Unknown error. My bad. Sven.");
            };
            request.send();
        }
        Main.ChunckEditor = new ChunckEditor(Main.ChunckManager);
    }
}
/// <reference path="./Main.ts"/>
class TileTest extends Main {
    initializeCamera() {
        let camera = new BABYLON.FreeCamera("camera1", BABYLON.Vector3.Zero(), Main.Scene);
        Main.Camera = camera;
    }
    async initialize() {
        await super.initializeScene();
        await TerrainTileVertexData.InitializeData();
        await BrickVertexData.InitializeData();
        await BrickDataManager.InitializeData();
        let player = new Player();
        player.position.y = 30;
        player.register(true);
        let inventory = new Inventory(player);
        inventory.initialize();
        for (let i = 0; i < 20; i++) {
            let colors = BrickDataManager.BrickColorNames;
            let color = colors[Math.floor(Math.random() * colors.length)];
            let brickName = BrickDataManager.BrickNames[Math.floor(Math.random() * BrickDataManager.BrickNames.length)];
            let count = Math.floor(Math.random() * 9 + 2);
            for (let n = 0; n < count; n++) {
                inventory.addItem(InventoryItem.Brick(brickName + "-" + color));
            }
        }
        player.playerActionManager.linkAction(inventory.items[0].playerAction, 1);
        inventory.update();
        if (Main.Camera instanceof BABYLON.FreeCamera) {
            Main.Camera.parent = player;
            Main.Camera.position.y = 1.25;
        }
        let tileManager = new TileManager();
        Main.Scene.onBeforeRenderObservable.add(tileManager.updateLoop);
    }
}
class SeaMaterial extends BABYLON.ShaderMaterial {
    constructor(name, scene) {
        super(name, scene, {
            vertex: "sea",
            fragment: "sea",
        }, {
            attributes: ["position", "normal", "uv"],
            uniforms: ["world", "worldView", "worldViewProjection", "view", "projection"],
            needAlphaBlending: true
        });
        this.t = 0;
        this.dir0 = BABYLON.Vector2.Zero();
        this.dir1 = BABYLON.Vector2.Zero();
        this.dir2 = BABYLON.Vector2.Zero();
        this.dir3 = BABYLON.Vector2.Zero();
        this.dir4 = BABYLON.Vector2.Zero();
        this.dir5 = BABYLON.Vector2.Zero();
        this.dir6 = BABYLON.Vector2.Zero();
        this._updateTime = () => {
            this.setFloat("time", this.t++ / 60);
        };
        this.dir0 = new BABYLON.Vector2(Math.random(), Math.random()).normalize();
        this.dir1 = new BABYLON.Vector2(Math.random(), Math.random()).normalize();
        this.dir2 = new BABYLON.Vector2(Math.random(), Math.random()).normalize();
        this.dir3 = new BABYLON.Vector2(Math.random(), Math.random()).normalize();
        this.dir4 = new BABYLON.Vector2(Math.random(), Math.random()).normalize();
        this.dir5 = new BABYLON.Vector2(Math.random(), Math.random()).normalize();
        this.dir6 = new BABYLON.Vector2(Math.random(), Math.random()).normalize();
        this.setVector2("dir0", this.dir0);
        this.setVector2("dir1", this.dir1);
        this.setVector2("dir2", this.dir2);
        this.setVector2("dir3", this.dir3);
        this.setVector2("dir4", this.dir4);
        this.setVector2("dir5", this.dir5);
        this.setVector2("dir6", this.dir6);
        this.setFloat("a0", 1 / 7);
        this.setFloat("a1", 1 / 7);
        this.setFloat("a2", 1 / 7);
        this.setFloat("a3", 1 / 7);
        this.setFloat("a4", 1 / 7);
        this.setFloat("a5", 1 / 7);
        this.setFloat("a6", 1 / 7);
        scene.registerBeforeRender(this._updateTime);
    }
}
class TerrainToonMaterial extends BABYLON.ShaderMaterial {
    constructor(name, color, scene) {
        super(name, scene, {
            vertex: "terrainToon",
            fragment: "terrainToon",
        }, {
            attributes: ["position", "normal", "uv", "color"],
            uniforms: ["world", "worldView", "worldViewProjection", "view", "projection"]
        });
        this.setVector3("lightInvDirW", (new BABYLON.Vector3(0.5 + Math.random(), 2.5 + Math.random(), 1.5 + Math.random())).normalize());
        this.setColor3("colGrass", BABYLON.Color3.FromHexString("#47a632"));
        this.setColor3("colDirt", BABYLON.Color3.FromHexString("#a86f32"));
        this.setColor3("colRock", BABYLON.Color3.FromHexString("#8c8c89"));
        this.setColor3("colSand", BABYLON.Color3.FromHexString("#dbc67b"));
    }
}
class TerrainTileToonMaterial extends BABYLON.ShaderMaterial {
    constructor(name, scene) {
        super(name, scene, {
            vertex: "terrainTileToon",
            fragment: "terrainTileToon",
        }, {
            attributes: ["position", "normal", "uv"],
            uniforms: ["world", "worldView", "worldViewProjection", "view", "projection"]
        });
        this.setVector3("lightInvDirW", (new BABYLON.Vector3(0.5, 2.5, 1.5)).normalize());
        this.setTexture("toonRampTexture", Main.toonRampTexture);
    }
    get diffuseTexture() {
        return this._diffuseTexture;
    }
    set diffuseTexture(tex) {
        this._diffuseTexture = tex;
        this.setTexture("diffuseTexture", this._diffuseTexture);
    }
}
class ToonMaterial extends BABYLON.ShaderMaterial {
    constructor(name, transparent, scene) {
        super(name, scene, {
            vertex: "toon",
            fragment: "toon",
        }, {
            attributes: ["position", "normal", "uv", "color"],
            uniforms: ["world", "worldView", "worldViewProjection", "view", "projection"],
            needAlphaBlending: transparent
        });
        this.setVector3("lightInvDirW", (new BABYLON.Vector3(0.5 + Math.random(), 2.5 + Math.random(), 1.5 + Math.random())).normalize());
    }
}
class RayIntersection {
    constructor(point, normal) {
        this.point = point;
        this.normal = normal;
    }
}
class SphereIntersection {
    constructor(point) {
        this.point = point;
    }
}
class Intersections3D {
    static SphereCube(center, radius, min, max) {
        let closest = center.clone();
        if (closest.x < min.x) {
            closest.x = min.x;
        }
        else if (closest.x > max.x) {
            closest.x = max.x;
        }
        if (closest.y < min.y) {
            closest.y = min.y;
        }
        else if (closest.y > max.y) {
            closest.y = max.y;
        }
        if (closest.z < min.z) {
            closest.z = min.z;
        }
        else if (closest.z > max.z) {
            closest.z = max.z;
        }
        if (BABYLON.Vector3.DistanceSquared(center, closest) < radius * radius) {
            return new SphereIntersection(closest);
        }
        return undefined;
    }
    static SphereChunck(center, radius, chunck) {
        if (chunck instanceof Chunck_V1) {
            return Intersections3D.SphereChunck_V1(center, radius, chunck);
        }
        if (chunck instanceof Chunck_V2) {
            return Intersections3D.SphereChunck_V2(center, radius, chunck);
        }
    }
    static SphereChunck_V1(center, radius, chunck) {
        let intersections = [];
        if (!chunck.isEmpty) {
            center = center.subtract(chunck.position);
            if (Intersections3D.SphereCube(center, radius, chunck.getBoundingInfo().minimum, chunck.getBoundingInfo().maximum)) {
                let min = center.clone();
                min.x = Math.floor(min.x - radius);
                min.y = Math.floor(min.y - radius);
                min.z = Math.floor(min.z - radius);
                let max = center.clone();
                max.x = Math.ceil(max.x + radius);
                max.y = Math.ceil(max.y + radius);
                max.z = Math.ceil(max.z + radius);
                for (let i = min.x; i <= max.x; i += 1) {
                    for (let j = min.y; j <= max.y; j += 1) {
                        for (let k = min.z; k <= max.z; k += 1) {
                            if (chunck.getCube(i, j, k)) {
                                let intersection = Intersections3D.SphereCube(center, radius, new BABYLON.Vector3(i, j, k), new BABYLON.Vector3(i + 1, j + 1, k + 1));
                                if (intersection) {
                                    intersection.point.addInPlace(chunck.position);
                                    intersections.push(intersection);
                                }
                            }
                        }
                    }
                }
            }
        }
        return intersections;
    }
    static SphereChunck_V2(center, radius, chunck) {
        let intersections = [];
        if (!chunck.isEmpty) {
            center = center.subtract(chunck.position);
            if (Intersections3D.SphereCube(center, radius, chunck.getBoundingInfo().minimum, chunck.getBoundingInfo().maximum)) {
                let min = center.clone();
                min.x = Math.floor(min.x / 1.6 - radius);
                min.y = Math.floor(min.y / 0.96 - radius);
                min.z = Math.floor(min.z / 1.6 - radius);
                let max = center.clone();
                max.x = Math.ceil(max.x / 1.6 + radius);
                max.y = Math.ceil(max.y / 0.96 + radius);
                max.z = Math.ceil(max.z / 1.6 + radius);
                for (let i = min.x; i <= max.x; i += 1) {
                    for (let j = min.y; j <= max.y; j += 1) {
                        for (let k = min.z; k <= max.z; k += 1) {
                            if (chunck.getCube(i, j, k)) {
                                let intersection = Intersections3D.SphereCube(center, radius, new BABYLON.Vector3(i * 1.6 - 0.8, (j - 1) * 0.96, k * 1.6 - 0.8), new BABYLON.Vector3((i + 1) * 1.6 - 0.8, j * 0.96, (k + 1) * 1.6 - 0.8));
                                if (intersection) {
                                    intersection.point.addInPlace(chunck.position);
                                    intersections.push(intersection);
                                }
                            }
                        }
                    }
                }
            }
        }
        return intersections;
    }
    static RayChunck(ray, chunck) {
        let pickingInfo = chunck.getScene().pickWithRay(ray, (m) => {
            return m === chunck;
        });
        return new RayIntersection(pickingInfo.pickedPoint, pickingInfo.getNormal());
    }
}
class Math2D {
    static AreEqualsCircular(a1, a2, epsilon = Math.PI / 60) {
        while (a1 < 0) {
            a1 += 2 * Math.PI;
        }
        while (a1 >= 2 * Math.PI) {
            a1 -= 2 * Math.PI;
        }
        while (a2 < 0) {
            a2 += 2 * Math.PI;
        }
        while (a2 >= 2 * Math.PI) {
            a2 -= 2 * Math.PI;
        }
        return Math.abs(a1 - a2) < epsilon;
    }
    static StepFromToCirular(from, to, step = Math.PI / 60) {
        while (from < 0) {
            from += 2 * Math.PI;
        }
        while (from >= 2 * Math.PI) {
            from -= 2 * Math.PI;
        }
        while (to < 0) {
            to += 2 * Math.PI;
        }
        while (to >= 2 * Math.PI) {
            to -= 2 * Math.PI;
        }
        if (Math.abs(to - from) <= step) {
            return to;
        }
        if (Math.abs(to - from) >= 2 * Math.PI - step) {
            return to;
        }
        if (to - from >= 0) {
            if (Math.abs(to - from) <= Math.PI) {
                return from + step;
            }
            return from - step;
        }
        if (to - from < 0) {
            if (Math.abs(to - from) <= Math.PI) {
                return from - step;
            }
            return from + step;
        }
    }
    static LerpFromToCircular(from, to, amount = 0.5) {
        while (to < from) {
            to += 2 * Math.PI;
        }
        while (to - 2 * Math.PI > from) {
            to -= 2 * Math.PI;
        }
        return from + (to - from) * amount;
    }
    static BissectFromTo(from, to, amount = 0.5) {
        let aFrom = Math2D.AngleFromTo(new BABYLON.Vector2(1, 0), from, true);
        let aTo = Math2D.AngleFromTo(new BABYLON.Vector2(1, 0), to, true);
        let angle = Math2D.LerpFromToCircular(aFrom, aTo, amount);
        return new BABYLON.Vector2(Math.cos(angle), Math.sin(angle));
    }
    static Dot(vector1, vector2) {
        return vector1.x * vector2.x + vector1.y * vector2.y;
    }
    static Cross(vector1, vector2) {
        return vector1.x * vector2.y - vector1.y * vector2.x;
    }
    static DistanceSquared(from, to) {
        return (from.x - to.x) * (from.x - to.x) + (from.y - to.y) * (from.y - to.y);
    }
    static Distance(from, to) {
        return Math.sqrt(Math2D.DistanceSquared(from, to));
    }
    static AngleFromTo(from, to, keepPositive = false) {
        let dot = Math2D.Dot(from, to) / from.length() / to.length();
        let angle = Math.acos(dot);
        let cross = from.x * to.y - from.y * to.x;
        if (cross === 0) {
            cross = 1;
        }
        angle *= Math.sign(cross);
        if (keepPositive && angle < 0) {
            angle += Math.PI * 2;
        }
        return angle;
    }
    static Rotate(vector, alpha) {
        let v = vector.clone();
        Math2D.RotateInPlace(v, alpha);
        return v;
    }
    static RotateInPlace(vector, alpha) {
        let x = Math.cos(alpha) * vector.x - Math.sin(alpha) * vector.y;
        let y = Math.cos(alpha) * vector.y + Math.sin(alpha) * vector.x;
        vector.x = x;
        vector.y = y;
    }
    static get _Tmp0() {
        if (!Math2D.__Tmp0) {
            Math2D.__Tmp0 = new BABYLON.Vector2(1, 0);
        }
        return Math2D.__Tmp0;
    }
    static get _Tmp1() {
        if (!Math2D.__Tmp1) {
            Math2D.__Tmp1 = new BABYLON.Vector2(1, 0);
        }
        return Math2D.__Tmp1;
    }
    static get _Tmp2() {
        if (!Math2D.__Tmp2) {
            Math2D.__Tmp2 = new BABYLON.Vector2(1, 0);
        }
        return Math2D.__Tmp2;
    }
    static get _Tmp3() {
        if (!Math2D.__Tmp3) {
            Math2D.__Tmp3 = new BABYLON.Vector2(1, 0);
        }
        return Math2D.__Tmp3;
    }
    static PointSegmentABDistanceSquared(point, segA, segB) {
        Math2D._Tmp0.copyFrom(segB).subtractInPlace(segA).normalize();
        Math2D._Tmp1.copyFrom(point).subtractInPlace(segA);
        let projectionDistance = Math2D.Dot(Math2D._Tmp1, Math2D._Tmp0);
        if (projectionDistance < 0) {
            return Math2D.DistanceSquared(point, segA);
        }
        if (projectionDistance * projectionDistance > Math2D.DistanceSquared(segB, segA)) {
            return Math2D.DistanceSquared(point, segB);
        }
        Math2D._Tmp0.scaleInPlace(projectionDistance);
        return Math2D.Dot(Math2D._Tmp1, Math2D._Tmp1) - Math2D.Dot(Math2D._Tmp0, Math2D._Tmp0);
    }
    static PointSegmentAxAyBxByDistanceSquared(point, segAx, segAy, segBx, segBy) {
        Math2D._Tmp2.x = segAx;
        Math2D._Tmp2.y = segAy;
        Math2D._Tmp3.x = segBx;
        Math2D._Tmp3.y = segBy;
        return Math2D.PointSegmentABDistanceSquared(point, Math2D._Tmp2, Math2D._Tmp3);
    }
    static PointSegmentABUDistanceSquared(point, segA, segB, u) {
        Math2D._Tmp1.copyFrom(point).subtractInPlace(segA);
        let projectionDistance = Math2D.Dot(Math2D._Tmp1, u);
        if (projectionDistance < 0) {
            return Math2D.DistanceSquared(point, segA);
        }
        if (projectionDistance * projectionDistance > Math2D.DistanceSquared(segB, segA)) {
            return Math2D.DistanceSquared(point, segB);
        }
        Math2D._Tmp0.copyFrom(u).scaleInPlace(projectionDistance);
        return Math2D.Dot(Math2D._Tmp1, Math2D._Tmp1) - Math2D.Dot(Math2D._Tmp0, Math2D._Tmp0);
    }
    static IsPointInSegment(point, segA, segB) {
        if ((point.x - segA.x) * (segB.x - segA.x) + (point.y - segA.y) * (segB.y - segA.y) < 0) {
            return false;
        }
        if ((point.x - segB.x) * (segA.x - segB.x) + (point.y - segB.y) * (segA.y - segB.y) < 0) {
            return false;
        }
        return true;
    }
    static IsPointInRay(point, rayOrigin, rayDirection) {
        if ((point.x - rayOrigin.x) * rayDirection.x + (point.y - rayOrigin.y) * rayDirection.y < 0) {
            return false;
        }
        return true;
    }
    static IsPointInRegion(point, region) {
        let count = 0;
        let randomDir = Math.random() * Math.PI * 2;
        Math2D._Tmp0.x = Math.cos(randomDir);
        Math2D._Tmp0.y = Math.sin(randomDir);
        for (let i = 0; i < region.length; i++) {
            Math2D._Tmp1.x = region[i][0];
            Math2D._Tmp1.y = region[i][1];
            Math2D._Tmp2.x = region[(i + 1) % region.length][0];
            Math2D._Tmp2.y = region[(i + 1) % region.length][1];
            if (Math2D.RaySegmentIntersection(point, Math2D._Tmp0, Math2D._Tmp1, Math2D._Tmp2)) {
                count++;
            }
        }
        return count % 2 === 1;
    }
    static IsPointInPath(point, path) {
        let count = 0;
        let randomDir = Math.random() * Math.PI * 2;
        Math2D._Tmp0.x = Math.cos(randomDir);
        Math2D._Tmp0.y = Math.sin(randomDir);
        for (let i = 0; i < path.length; i++) {
            if (Math2D.RaySegmentIntersection(point, Math2D._Tmp0, path[i], path[(i + 1) % path.length])) {
                count++;
            }
        }
        return count % 2 === 1;
    }
    static SegmentShapeIntersection(segA, segB, shape) {
        let intersections = [];
        for (let i = 0; i < shape.length; i++) {
            let shapeA = shape[i];
            let shapeB = shape[(i + 1) % shape.length];
            let intersection = Math2D.SegmentSegmentIntersection(segA, segB, shapeA, shapeB);
            if (intersection) {
                intersections.push(intersection);
            }
        }
        return intersections;
    }
    static FattenShrinkPointShape(shape, distance) {
        let newShape = [];
        let edgesDirs = [];
        for (let i = 0; i < shape.length; i++) {
            let p = shape[i];
            let pNext = shape[(i + 1) % shape.length];
            edgesDirs[i] = pNext.subtract(p).normalize();
        }
        for (let i = 0; i < shape.length; i++) {
            let p = shape[i];
            let edgeDir = edgesDirs[i];
            let edgeDirPrev = edgesDirs[(i - 1 + shape.length) % shape.length];
            let bissection = Math2D.BissectFromTo(edgeDirPrev.scale(-1), edgeDir, 0.5);
            newShape[i] = p.add(bissection.scaleInPlace(distance));
        }
        return newShape;
    }
    static FattenShrinkEdgeShape(shape, distance) {
        let newShape = [];
        let edgesNormals = [];
        let edgesDirs = [];
        for (let i = 0; i < shape.length; i++) {
            let p = shape[i];
            let pNext = shape[(i + 1) % shape.length];
            edgesDirs[i] = pNext.subtract(p).normalize();
            edgesNormals[i] = Math2D.Rotate(edgesDirs[i], -Math.PI / 2).scaleInPlace(distance);
        }
        for (let i = 0; i < shape.length; i++) {
            let p = shape[i];
            let pNext = shape[(i + 1) % shape.length];
            let edgeDir = edgesDirs[i];
            let edgeDirNext = edgesDirs[(i + 1) % shape.length];
            p = p.add(edgesNormals[i]);
            pNext = pNext.add(edgesNormals[(i + 1) % shape.length]);
            if (Math2D.Cross(edgeDir, edgeDirNext) === 0) {
                newShape[i] = p.add(pNext).scaleInPlace(0.5);
                console.warn("Oups 1");
            }
            else {
                let newP = Math2D.LineLineIntersection(p, edgeDir, pNext, edgeDirNext);
                if (newP) {
                    newShape[i] = newP;
                }
                else {
                    newShape[i] = p;
                    console.warn("Oups 2");
                }
            }
        }
        return newShape;
    }
    static RayRayIntersection(ray1Origin, ray1Direction, ray2Origin, ray2Direction) {
        let x1 = ray1Origin.x;
        let y1 = ray1Origin.y;
        let x2 = x1 + ray1Direction.x;
        let y2 = y1 + ray1Direction.y;
        let x3 = ray2Origin.x;
        let y3 = ray2Origin.y;
        let x4 = x3 + ray2Direction.x;
        let y4 = y3 + ray2Direction.y;
        let det = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (det !== 0) {
            let x = (x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4);
            let y = (x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4);
            let intersection = new BABYLON.Vector2(x / det, y / det);
            if (Math2D.IsPointInRay(intersection, ray1Origin, ray1Direction)) {
                if (Math2D.IsPointInRay(intersection, ray2Origin, ray2Direction)) {
                    return intersection;
                }
            }
        }
        return undefined;
    }
    static LineLineIntersection(line1Origin, line1Direction, line2Origin, line2Direction) {
        let x1 = line1Origin.x;
        let y1 = line1Origin.y;
        let x2 = x1 + line1Direction.x;
        let y2 = y1 + line1Direction.y;
        let x3 = line2Origin.x;
        let y3 = line2Origin.y;
        let x4 = x3 + line2Direction.x;
        let y4 = y3 + line2Direction.y;
        let det = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (det !== 0) {
            let x = (x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4);
            let y = (x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4);
            return new BABYLON.Vector2(x / det, y / det);
        }
        return undefined;
    }
    static RaySegmentIntersection(rayOrigin, rayDirection, segA, segB) {
        let x1 = rayOrigin.x;
        let y1 = rayOrigin.y;
        let x2 = x1 + rayDirection.x;
        let y2 = y1 + rayDirection.y;
        let x3 = segA.x;
        let y3 = segA.y;
        let x4 = segB.x;
        let y4 = segB.y;
        let det = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (det !== 0) {
            let x = (x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4);
            let y = (x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4);
            let intersection = new BABYLON.Vector2(x / det, y / det);
            if (Math2D.IsPointInRay(intersection, rayOrigin, rayDirection)) {
                if (Math2D.IsPointInSegment(intersection, segA, segB)) {
                    return intersection;
                }
            }
        }
        return undefined;
    }
    static SegmentSegmentIntersection(seg1A, seg1B, seg2A, seg2B) {
        let x1 = seg1A.x;
        let y1 = seg1A.y;
        let x2 = seg1B.x;
        let y2 = seg1B.y;
        let x3 = seg2A.x;
        let y3 = seg2A.y;
        let x4 = seg2B.x;
        let y4 = seg2B.y;
        let det = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (det !== 0) {
            let x = (x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4);
            let y = (x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4);
            let intersection = new BABYLON.Vector2(x / det, y / det);
            if (Math2D.IsPointInSegment(intersection, seg1A, seg1B)) {
                if (Math2D.IsPointInSegment(intersection, seg2A, seg2B)) {
                    return intersection;
                }
            }
        }
        return undefined;
    }
    static PointRegionDistanceSquared(point, region) {
        let minimalSquaredDistance = Infinity;
        for (let i = 0; i < region.length; i++) {
            Math2D._Tmp1.x = region[i][0];
            Math2D._Tmp1.y = region[i][1];
            Math2D._Tmp2.x = region[(i + 1) % region.length][0];
            Math2D._Tmp2.y = region[(i + 1) % region.length][1];
            let distSquared = Math2D.PointSegmentAxAyBxByDistanceSquared(point, region[i][0], region[i][1], region[(i + 1) % region.length][0], region[(i + 1) % region.length][1]);
            minimalSquaredDistance = Math.min(minimalSquaredDistance, distSquared);
        }
        return minimalSquaredDistance;
    }
}
class VMath {
    // Method adapted from gre's work (https://github.com/gre/bezier-easing). Thanks !
    static easeOutElastic(t, b = 0, c = 1, d = 1) {
        var s = 1.70158;
        var p = 0;
        var a = c;
        if (t == 0) {
            return b;
        }
        if ((t /= d) == 1) {
            return b + c;
        }
        if (!p) {
            p = d * .3;
        }
        if (a < Math.abs(c)) {
            a = c;
            s = p / 4;
        }
        else {
            s = p / (2 * Math.PI) * Math.asin(c / a);
        }
        return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
    }
    static ProjectPerpendicularAt(v, at) {
        let p = BABYLON.Vector3.Zero();
        let k = (v.x * at.x + v.y * at.y + v.z * at.z);
        k = k / (at.x * at.x + at.y * at.y + at.z * at.z);
        p.copyFrom(v);
        p.subtractInPlace(at.multiplyByFloats(k, k, k));
        return p;
    }
    static Angle(from, to) {
        let pFrom = BABYLON.Vector3.Normalize(from);
        let pTo = BABYLON.Vector3.Normalize(to);
        let angle = Math.acos(BABYLON.Vector3.Dot(pFrom, pTo));
        return angle;
    }
    static AngleFromToAround(from, to, around) {
        let pFrom = VMath.ProjectPerpendicularAt(from, around).normalize();
        let pTo = VMath.ProjectPerpendicularAt(to, around).normalize();
        let angle = Math.acos(BABYLON.Vector3.Dot(pFrom, pTo));
        if (BABYLON.Vector3.Dot(BABYLON.Vector3.Cross(pFrom, pTo), around) < 0) {
            angle = -angle;
        }
        return angle;
    }
    static CatmullRomPath(path) {
        let interpolatedPoints = [];
        for (let i = 0; i < path.length; i++) {
            let p0 = path[(i - 1 + path.length) % path.length];
            let p1 = path[i];
            let p2 = path[(i + 1) % path.length];
            let p3 = path[(i + 2) % path.length];
            interpolatedPoints.push(BABYLON.Vector3.CatmullRom(p0, p1, p2, p3, 0.5));
        }
        for (let i = 0; i < interpolatedPoints.length; i++) {
            path.splice(2 * i + 1, 0, interpolatedPoints[i]);
        }
    }
}
class TerrainTileTexture extends BABYLON.DynamicTexture {
    constructor(tile, _size = 64) {
        super(tile.name + "-texture-" + _size, _size, Main.Scene, true);
        this.tile = tile;
        this._size = _size;
    }
    resize() {
        if (this._size !== TerrainTileTexture.LodResolutions[this.tile.currentLOD]) {
            let resizedTexture = new TerrainTileTexture(this.tile, TerrainTileTexture.LodResolutions[this.tile.currentLOD]);
            this.tile.tileTexture = resizedTexture;
            resizedTexture.redraw();
            this.dispose();
            return true;
        }
        return false;
    }
    redraw() {
        if (this.resize()) {
            return;
        }
        let context = this.getContext();
        let types = this.tile.types;
        let w = this._size / TILE_SIZE;
        for (let j = 0; j < TILE_SIZE; j++) {
            for (let i = 0; i < TILE_SIZE; i++) {
                let t1 = types[i][j];
                let t2 = types[i + 1][j];
                let t3 = types[i + 1][j + 1];
                let t4 = types[i][j + 1];
                let values = [t1, t2, t3, t4].sort((a, b) => { return a - b; });
                let max = -1;
                let maxOcc = -1;
                for (let ii = 0; ii < 4; ii++) {
                    let occ = 1;
                    for (let jj = 0; jj < 4; jj++) {
                        if (ii != jj) {
                            if (values[ii] === values[jj]) {
                                occ++;
                            }
                        }
                    }
                    if (occ > maxOcc) {
                        max = values[ii];
                        maxOcc = occ;
                    }
                }
                let color = TerrainTileTexture.TerrainColors[max];
                context.fillStyle = color;
                context.fillRect(i * w, (TILE_SIZE - 1 - j) * w, w, w);
                if (t1 !== max) {
                    let color = TerrainTileTexture.TerrainColors[t1];
                    context.fillStyle = color;
                    if (t1 !== t2 && t1 !== t4) {
                        context.beginPath();
                        context.moveTo(i * w, (TILE_SIZE - j) * w);
                        context.arc(i * w, (TILE_SIZE - j) * w, w * 0.5, 1.5 * Math.PI, 0);
                        context.lineTo(i * w, (TILE_SIZE - j) * w);
                        context.fill();
                    }
                    if (t1 === t2 && t1 != t4) {
                        context.fillRect(i * w, (TILE_SIZE - 1 - j) * w + 0.5 * w, w, w * 0.5);
                    }
                    if (t1 != t2 && t1 === t4) {
                        context.fillRect(i * w, (TILE_SIZE - 1 - j) * w, w * 0.5, w);
                    }
                }
                if (t2 !== max) {
                    let color = TerrainTileTexture.TerrainColors[t2];
                    context.fillStyle = color;
                    if (t2 !== t1 && t2 !== t3) {
                        context.beginPath();
                        context.moveTo((i + 1) * w, (TILE_SIZE - j) * w);
                        context.arc((i + 1) * w, (TILE_SIZE - j) * w, w * 0.5, Math.PI, 1.5 * Math.PI);
                        context.lineTo((i + 1) * w, (TILE_SIZE - j) * w);
                        context.fill();
                    }
                    if (t2 === t3) {
                        context.fillRect(i * w + 0.5 * w, (TILE_SIZE - 1 - j) * w, w * 0.5, w);
                    }
                }
                if (t3 !== max) {
                    let color = TerrainTileTexture.TerrainColors[t3];
                    context.fillStyle = color;
                    if (t3 !== t2 && t3 !== t4) {
                        context.beginPath();
                        context.moveTo((i + 1) * w, (TILE_SIZE - 1 - j) * w);
                        context.arc((i + 1) * w, (TILE_SIZE - 1 - j) * w, w * 0.5, 0.5 * Math.PI, Math.PI);
                        context.lineTo((i + 1) * w, (TILE_SIZE - 1 - j) * w);
                        context.fill();
                    }
                    if (t3 === t4) {
                        context.fillRect(i * w, (TILE_SIZE - 1 - j) * w, w, w * 0.5);
                    }
                }
                if (t4 !== max) {
                    if (t4 !== t1 && t4 !== t3) {
                        let color = TerrainTileTexture.TerrainColors[t4];
                        context.fillStyle = color;
                        context.beginPath();
                        context.moveTo(i * w, (TILE_SIZE - 1 - j) * w);
                        context.arc(i * w, (TILE_SIZE - 1 - j) * w, w * 0.5, 0, 0.5 * Math.PI);
                        context.lineTo(i * w, (TILE_SIZE - 1 - j) * w);
                        context.fill();
                    }
                }
            }
        }
        this.update();
    }
}
TerrainTileTexture.LodResolutions = [1024, 256, 128, 64];
TerrainTileTexture.TerrainColors = [
    "#47a632",
    "#a86f32",
    "#8c8c89",
    "#dbc67b"
];
TerrainTileTexture.debugTextures = [];
class TerrainTileVertexData {
    static async _LoadTerrainTileVertexDatas() {
        return new Promise(resolve => {
            BABYLON.SceneLoader.ImportMesh("", "./datas/meshes/terrain-tiles.babylon", "", Main.Scene, (meshes) => {
                for (let i = 0; i < meshes.length; i++) {
                    let mesh = meshes[i];
                    if (mesh instanceof BABYLON.Mesh) {
                        TerrainTileVertexData._VertexDatas.set(mesh.name + "-rz-0", BABYLON.VertexData.ExtractFromMesh(mesh));
                        mesh.dispose();
                    }
                }
                resolve();
            });
        });
    }
    static async InitializeData() {
        await TerrainTileVertexData._LoadTerrainTileVertexDatas();
        return true;
    }
    static Clone(data) {
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
    static Get(name, dir = 0) {
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
    static RotateZ(baseData, angle) {
        let data = new BABYLON.VertexData();
        let positions = [...baseData.positions];
        let normals;
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
            positions[3 * i + 2] = x * sina + z * cosa;
            if (normals) {
                let xn = normals[3 * i];
                let zn = normals[3 * i + 2];
                normals[3 * i] = xn * cosa - zn * sina;
                normals[3 * i + 2] = xn * sina + zn * cosa;
            }
        }
        data.positions = positions;
        if (normals) {
            data.normals = normals;
        }
        return data;
    }
    static RotateRef(ref, rotation) {
        return ref.substr(rotation) + ref.substring(0, rotation);
    }
    static GetDataFor(h1, h2, h3, h4) {
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
TerrainTileVertexData.LoadedRefs = [
    "0000",
    "0001", "0011", "0101", "0111",
    "0102", "0022", "0122", "0002", "0222", "0221", "0212", "0121", "0211", "0112", "0012", "0021", "0202"
];
TerrainTileVertexData._VertexDatas = new Map();
var TILE_VERTEX_SIZE = 9;
var TILE_SIZE = 8;
var DX = 0.8;
var DY = 0.32;
var TILE_LENGTH = TILE_SIZE * DX * 2;
class Tile extends BABYLON.Mesh {
    constructor(i, j) {
        super("tile_" + i + "_" + j);
        this.i = i;
        this.j = j;
        this.bricks = [];
        this.currentLOD = -1;
        this.position.x = TILE_SIZE * this.i * DX * 2;
        this.position.z = TILE_SIZE * this.j * DX * 2;
        let material = new TerrainTileToonMaterial(this.name + "-material", Main.Scene);
        material.diffuseTexture = new TerrainTileTexture(this);
        this.material = material;
    }
    get tileTexture() {
        if (this.material instanceof TerrainTileToonMaterial) {
            if (this.material.diffuseTexture instanceof TerrainTileTexture) {
                return this.material.diffuseTexture;
            }
        }
    }
    set tileTexture(t) {
        if (this.material instanceof TerrainTileToonMaterial) {
            this.material.diffuseTexture = t;
        }
    }
    makeEmpty() {
        this.heights = [];
        this.types = [];
        for (let i = 0; i < TILE_VERTEX_SIZE; i++) {
            this.heights[i] = [];
            this.types[i] = [];
            for (let j = 0; j < TILE_VERTEX_SIZE; j++) {
                this.heights[i][j] = 0;
                this.types[i][j] = 0;
            }
        }
    }
    makeRandom() {
        this.heights = [];
        for (let i = 0; i < TILE_VERTEX_SIZE; i++) {
            this.heights[i] = [];
            for (let j = 0; j < TILE_VERTEX_SIZE; j++) {
                this.heights[i][j] = Math.floor(Math.random() * 3);
            }
        }
    }
    _generateFromMesh(positions, indices, normals) {
        for (let j = 0; j < TILE_VERTEX_SIZE - 1; j++) {
            for (let i = 0; i < TILE_VERTEX_SIZE - 1; i++) {
                let h1 = this.heights[i][j];
                let h2 = this.heights[i][j + 1];
                let h3 = this.heights[i + 1][j + 1];
                let h4 = this.heights[i + 1][j];
                let min = Math.min(h1, h2, h3, h4);
                h1 -= min;
                h2 -= min;
                h3 -= min;
                h4 -= min;
                let data = TerrainTileVertexData.GetDataFor(h1, h2, h3, h4);
                if (data) {
                    let l = positions.length / 3;
                    for (let ip = 0; ip < data.positions.length / 3; ip++) {
                        let x = data.positions[3 * ip];
                        let y = data.positions[3 * ip + 1];
                        let z = data.positions[3 * ip + 2];
                        positions.push(x + (2 * i + 1) * DX);
                        positions.push(y + min * DY * 3);
                        positions.push(z + (2 * j + 1) * DX);
                    }
                    for (let ii = 0; ii < data.indices.length; ii++) {
                        indices.push(data.indices[ii] + l);
                    }
                    normals.push(...data.normals);
                }
            }
        }
    }
    _generateFromData(positions, indices, normals) {
        for (let j = 0; j < TILE_VERTEX_SIZE; j++) {
            for (let i = 0; i < TILE_VERTEX_SIZE; i++) {
                let y = this.heights[i][j] * DY * 3;
                let x00 = 2 * i * DX;
                if (i > 0) {
                    x00 -= DX * 0.5;
                }
                let z00 = 2 * j * DX;
                if (j > 0) {
                    z00 -= DX * 0.5;
                }
                positions.push(x00, y, z00);
                let x10 = 2 * i * DX;
                if (i < TILE_VERTEX_SIZE - 1) {
                    x10 += DX * 0.5;
                }
                let z10 = 2 * j * DX;
                if (j > 0) {
                    z10 -= DX * 0.5;
                }
                positions.push(x10, y, z10);
                let x11 = 2 * i * DX;
                if (i < TILE_VERTEX_SIZE - 1) {
                    x11 += DX * 0.5;
                }
                let z11 = 2 * j * DX;
                if (j < TILE_VERTEX_SIZE - 1) {
                    z11 += DX * 0.5;
                }
                positions.push(x11, y, z11);
                let x01 = 2 * i * DX;
                if (i > 0) {
                    x01 -= DX * 0.5;
                }
                let z01 = 2 * j * DX;
                if (j < TILE_VERTEX_SIZE - 1) {
                    z01 += DX * 0.5;
                }
                positions.push(x01, y, z01);
                let n = 4 * (i + j * TILE_VERTEX_SIZE);
                let nJ = n + 4 * TILE_VERTEX_SIZE;
                indices.push(n, n + 1, n + 2);
                indices.push(n, n + 2, n + 3);
                if (i < TILE_VERTEX_SIZE - 1) {
                    indices.push(n + 1, n + 4, n + 7);
                    indices.push(n + 1, n + 7, n + 2);
                }
                if (j < TILE_VERTEX_SIZE - 1) {
                    indices.push(n + 3, n + 2, nJ + 1);
                    indices.push(n + 3, nJ + 1, nJ);
                }
                if (i < TILE_VERTEX_SIZE - 1 && j < TILE_VERTEX_SIZE - 1) {
                    indices.push(n + 2, n + 7, nJ + 4);
                    indices.push(n + 2, nJ + 4, nJ + 1);
                }
            }
        }
        BABYLON.VertexData.ComputeNormals(positions, indices, normals);
    }
    _generateUVS(positions, uvs) {
        for (let i = 0; i < positions.length / 3; i++) {
            let x = positions[3 * i];
            let z = positions[3 * i + 2];
            uvs.push(x / TILE_LENGTH, z / TILE_LENGTH);
        }
    }
    _addKnobs(positions, indices, normals, lod) {
        for (let j = 0; j < TILE_SIZE; j++) {
            for (let i = 0; i < TILE_SIZE; i++) {
                let h00 = this.heights[i][j];
                let h10 = this.heights[i + 1][j];
                let h11 = this.heights[i + 1][j + 1];
                let h01 = this.heights[i][j + 1];
                BrickVertexData.AddKnob(2 * i, this.heights[i][j] * 3, 2 * j, positions, indices, normals, lod);
                if (h00 === h10) {
                    BrickVertexData.AddKnob(2 * i + 1, this.heights[i][j] * 3, 2 * j, positions, indices, normals, lod);
                }
                if (h00 === h01) {
                    BrickVertexData.AddKnob(2 * i, this.heights[i][j] * 3, 2 * j + 1, positions, indices, normals, lod);
                    if (h00 === h10 && h00 === h11) {
                        BrickVertexData.AddKnob(2 * i + 1, this.heights[i][j] * 3, 2 * j + 1, positions, indices, normals, lod);
                    }
                }
            }
        }
    }
    updateTerrainMesh(lod) {
        this.currentLOD = lod;
        let data = new BABYLON.VertexData();
        let positions = [];
        let normals = [];
        //let colors: number[] = [];
        let uvs = [];
        let indices = [];
        if (lod === 0) {
            this._generateFromMesh(positions, indices, normals);
            this._addKnobs(positions, indices, normals, 0);
            this._generateUVS(positions, uvs);
        }
        else if (lod === 1) {
            this._generateFromMesh(positions, indices, normals);
            this._addKnobs(positions, indices, normals, 1);
            this._generateUVS(positions, uvs);
        }
        else if (lod === 2) {
            this._generateFromData(positions, indices, normals);
            this._addKnobs(positions, indices, normals, 2);
            this._generateUVS(positions, uvs);
        }
        else if (lod === 3) {
            this._generateFromData(positions, indices, normals);
            this._generateUVS(positions, uvs);
        }
        /*
        for (let i = 0; i < positions.length / 3; i++) {
            colors.push(1, 0, 0, 1);
        }
        */
        data.positions = positions;
        data.normals = normals;
        //data.colors = colors;
        data.uvs = uvs;
        data.indices = indices;
        data.applyToMesh(this);
        this.tileTexture.redraw();
        this.freezeWorldMatrix();
        this.currentLOD = lod;
    }
    async updateBricks() {
        let children = this.getChildMeshes();
        while (children.length > 0) {
            children.pop().dispose();
        }
        for (let i = 0; i < this.bricks.length; i++) {
            let brick = this.bricks[i];
            let b = new BABYLON.Mesh("brick-" + i);
            let data = await BrickVertexData.GetFullBrickVertexData(brick.reference);
            data.applyToMesh(b);
            b.position.copyFromFloats(brick.i * DX, brick.k * DY, brick.j * DX);
            b.rotation.y = Math.PI / 2 * brick.r;
            b.parent = this;
            b.material = Main.cellShadingMaterial;
        }
    }
    serialize() {
        return {
            i: this.i,
            j: this.j,
            heights: this.heights
        };
    }
    deserialize(data) {
        this.i = data.i;
        this.j = data.j;
        this.heights = data.heights;
    }
}
var LOD0_DIST = 4;
var LOD1_DIST = 6;
var LOD2_DIST = 8;
var LOD3_DIST = 10;
class TileManager {
    constructor() {
        this.tiles = new Map();
        this._checkPositions = [];
        this._camIReset = NaN;
        this._camJReset = NaN;
        this._checkIndex = 0;
        this.updateLoop = () => {
            let cameraPosition = Main.Camera.globalPosition;
            let camI = Math.round(cameraPosition.x / (TILE_SIZE * DX * 2));
            let camJ = Math.round(cameraPosition.z / (TILE_SIZE * DX * 2));
            let done = false;
            let t0 = performance.now();
            while (!done) {
                let _checkPosition = this._checkPositions[this._checkIndex];
                this._checkIndex++;
                if (_checkPosition) {
                    let tile = this.getOrCreateTile(_checkPosition.i + camI, _checkPosition.j + camJ);
                    if (tile.currentLOD === -1) {
                        if (_checkPosition.d <= LOD0_DIST) {
                            tile.updateTerrainMesh(0);
                        }
                        else if (_checkPosition.d <= LOD1_DIST) {
                            tile.updateTerrainMesh(1);
                        }
                        else if (_checkPosition.d <= LOD2_DIST) {
                            tile.updateTerrainMesh(2);
                        }
                        else if (_checkPosition.d <= LOD3_DIST) {
                            tile.updateTerrainMesh(3);
                        }
                    }
                    else if (tile.currentLOD === 3) {
                        if (_checkPosition.d <= LOD2_DIST) {
                            tile.updateTerrainMesh(2);
                        }
                    }
                    else if (tile.currentLOD === 2) {
                        if (_checkPosition.d <= LOD1_DIST) {
                            tile.updateTerrainMesh(1);
                        }
                        else if (_checkPosition.d >= LOD2_DIST + 4) {
                            tile.updateTerrainMesh(3);
                        }
                    }
                    else if (tile.currentLOD === 1) {
                        if (_checkPosition.d <= LOD0_DIST) {
                            tile.updateTerrainMesh(0);
                        }
                        else if (_checkPosition.d >= LOD1_DIST + 2) {
                            tile.updateTerrainMesh(2);
                        }
                    }
                    else if (tile.currentLOD === 0) {
                        if (_checkPosition.d >= LOD0_DIST + 1) {
                            tile.updateTerrainMesh(1);
                        }
                    }
                    done = performance.now() - t0 > 30;
                }
                else {
                    if (this._camIReset !== camI || this._camJReset !== camJ) {
                        this._camIReset = camI;
                        this._camJReset = camJ;
                        this._checkIndex = 0;
                    }
                    return;
                }
            }
        };
        TileManager.Instance = this;
        this._checkPositions = [];
        for (let i = -LOD3_DIST; i <= LOD3_DIST; i++) {
            for (let j = -LOD3_DIST; j <= LOD3_DIST; j++) {
                let d = Math.sqrt(i * i + j * j);
                if (d <= LOD3_DIST) {
                    this._checkPositions.push({ i: i, j: j, d: d });
                }
            }
        }
        this._checkPositions.sort((a, b) => {
            return (a.i * a.i + a.j * a.j) - (b.i * b.i + b.j * b.j);
        });
    }
    _createTile(iTile, jTile) {
        let tile = new Tile(iTile, jTile);
        tile.makeEmpty();
        let IData = Math.floor(iTile * TILE_SIZE / DATA_SIZE);
        let JData = Math.floor(jTile * TILE_SIZE / DATA_SIZE);
        let data = WorldDataGenerator.GetData(IData, JData);
        let iOffsetData = iTile * TILE_SIZE - IData * DATA_SIZE;
        let jOffsetData = jTile * TILE_SIZE - JData * DATA_SIZE;
        let dataOverX;
        let dataOverY;
        let dataOverXY;
        for (let i = 0; i < TILE_VERTEX_SIZE; i++) {
            for (let j = 0; j < TILE_VERTEX_SIZE; j++) {
                if (i + iOffsetData >= DATA_SIZE) {
                    if (j + jOffsetData >= DATA_SIZE) {
                        if (!dataOverXY) {
                            dataOverXY = WorldDataGenerator.GetData(IData + 1, JData + 1);
                            tile.heights[i][j] = dataOverXY[0][0];
                        }
                    }
                    else {
                        if (!dataOverX) {
                            dataOverX = WorldDataGenerator.GetData(IData + 1, JData);
                        }
                        tile.heights[i][j] = dataOverX[0][j + jOffsetData];
                    }
                }
                else if (j + jOffsetData >= DATA_SIZE) {
                    if (!dataOverY) {
                        dataOverY = WorldDataGenerator.GetData(IData, JData + 1);
                    }
                    tile.heights[i][j] = dataOverY[i + iOffsetData][0];
                }
                else {
                    tile.heights[i][j] = data[i + iOffsetData][j + jOffsetData];
                }
            }
        }
        return tile;
    }
    static GetTile(i, j) {
        let tileRef = i + "_" + j;
        return TileManager.Instance.tiles.get(tileRef);
    }
    getOrCreateTile(i, j) {
        let tileRef = i + "_" + j;
        let tile = this.tiles.get(tileRef);
        if (!tile) {
            tile = this._createTile(i, j);
            this.tiles.set(tileRef, tile);
        }
        return tile;
    }
}
var KNOB_RADIUS_SQUARED = 0.24 * 0.24;
class TileUtils {
    static IsKnobHit(worldPosition, normal) {
        if (normal.y === 0) {
            let dy = worldPosition.y - Math.floor(worldPosition.y / DY) * DY;
            if (dy < 0.17) {
                let dx = worldPosition.x - Math.round(worldPosition.x / DX) * DX;
                let dz = worldPosition.z - Math.round(worldPosition.z / DX) * DX;
                let dd = dx * dx + dz * dz;
                if (dd <= KNOB_RADIUS_SQUARED) {
                    if (dd >= KNOB_RADIUS_SQUARED * 0.6) {
                        return true;
                    }
                }
            }
        }
        else if (normal.y === 1) {
            let dy = worldPosition.y - Math.floor(worldPosition.y / DY) * DY;
            if (Math.abs(dy - 0.17) < 0.001) {
                let dx = worldPosition.x - Math.round(worldPosition.x / DX) * DX;
                let dz = worldPosition.z - Math.round(worldPosition.z / DX) * DX;
                let dd = dx * dx + dz * dz;
                if (dd <= KNOB_RADIUS_SQUARED) {
                    return true;
                }
            }
        }
        return false;
    }
}
var DATA_SIZE = 128;
class WorldDataGenerator {
    static _GetRawData(IRaw, JRaw) {
        let rawTile = WorldDataGenerator._RawDatas.get(IRaw.toFixed(0) + "_" + JRaw.toFixed(0));
        if (rawTile) {
            return rawTile;
        }
        rawTile = WorldDataGenerator.GenerateRawTileFor(IRaw, JRaw);
        WorldDataGenerator._RawDatas.set(IRaw.toFixed(0) + "_" + JRaw.toFixed(0), rawTile);
        return rawTile;
    }
    static GetData(I, J) {
        let tile = WorldDataGenerator._Datas.get(I.toFixed(0) + "_" + J.toFixed(0));
        if (tile) {
            return tile;
        }
        let s = DATA_SIZE;
        let s2 = s / 2;
        let rawI = 2 * I;
        let rawJ = 2 * J;
        let rawTile = WorldDataGenerator._GetRawData(rawI, rawJ);
        let rawTileMM = WorldDataGenerator._GetRawData(rawI - 1, rawJ - 1);
        let rawTilePM = WorldDataGenerator._GetRawData(rawI + 1, rawJ - 1);
        let rawTilePP = WorldDataGenerator._GetRawData(rawI + 1, rawJ + 1);
        let rawTileMP = WorldDataGenerator._GetRawData(rawI - 1, rawJ + 1);
        tile = [];
        for (let i = 0; i < s; i++) {
            tile[i] = [];
        }
        for (let i = 0; i < s / 2; i++) {
            for (let j = 0; j < s / 2; j++) {
                let pMM = Math.min(i / s2, j / s2);
                tile[i][j] = rawTile[i][j] * pMM + rawTileMM[i + s2][j + s2] * (1 - pMM);
                let pPM = Math.min((s2 - i) / s2, j / s2);
                tile[s2 + i][j] = rawTile[s2 + i][j] * pPM + rawTilePM[i][j + s2] * (1 - pPM);
                let pPP = Math.min((s2 - i) / s2, (s2 - j) / s2);
                tile[s2 + i][s2 + j] = rawTile[s2 + i][s2 + j] * pPP + rawTilePP[i][j] * (1 - pPP);
                let pMP = Math.min(i / s2, (s2 - j) / s2);
                tile[i][s2 + j] = rawTile[i][s2 + j] * pMP + rawTileMP[s2 + i][j] * (1 - pMP);
            }
        }
        for (let i = 0; i < s; i++) {
            for (let j = 0; j < s; j++) {
                tile[i][j] = Math.round(tile[i][j]);
            }
        }
        let done = false;
        while (!done) {
            done = true;
            for (let i = 0; i < DATA_SIZE - 1; i++) {
                for (let j = 0; j < DATA_SIZE - 1; j++) {
                    let h1 = tile[i][j];
                    let h2 = tile[i][j + 1];
                    let h3 = tile[i + 1][j + 1];
                    let h4 = tile[i + 1][j];
                    let max = Math.max(h1, h2, h3, h4);
                    let min = Math.min(h1, h2, h3, h4);
                    if (max - min > 2) {
                        tile[i][j] = Math.floor(h1 * 0.4 + h2 * 0.2 + h3 * 0.2 + h4 * 0.2);
                        tile[i][j + 1] = Math.floor(h1 * 0.2 + h2 * 0.4 + h3 * 0.2 + h4 * 0.2);
                        tile[i + 1][j + 1] = Math.floor(h1 * 0.2 + h2 * 0.2 + h3 * 0.4 + h4 * 0.2);
                        tile[i + 1][j] = Math.floor(h1 * 0.2 + h2 * 0.2 + h3 * 0.2 + h4 * 0.4);
                        done = false;
                    }
                }
            }
        }
        WorldDataGenerator._Datas.set(I.toFixed(0) + "_" + J.toFixed(0), tile);
        return tile;
    }
    static GenerateRawTileFor(I, J) {
        let output = [];
        for (let i = 0; i < DATA_SIZE; i++) {
            output[i] = [];
            for (let j = 0; j < DATA_SIZE; j++) {
                output[i][j] = 10;
            }
        }
        for (let n = 0; n < 10; n++) {
            let x = Math.floor(Math.random() * DATA_SIZE);
            let y = Math.floor(Math.random() * DATA_SIZE);
            let h = Math.random() * 10 - 5;
            for (let i = Math.max(x - 32, 0); i < x + 32 && i < DATA_SIZE; i++) {
                for (let j = Math.max(y - 32, 0); j < y + 32 && j < DATA_SIZE; j++) {
                    output[i][j] += h;
                }
            }
        }
        for (let n = 0; n < 20; n++) {
            let x = Math.floor(Math.random() * DATA_SIZE);
            let y = Math.floor(Math.random() * DATA_SIZE);
            let h = Math.random() * 4 - 2;
            for (let i = Math.max(x - 16, 0); i < x + 16 && i < DATA_SIZE; i++) {
                for (let j = Math.max(y - 16, 0); j < y + 16 && j < DATA_SIZE; j++) {
                    output[i][j] += h;
                }
            }
        }
        for (let n = 0; n < 100; n++) {
            let x = Math.floor(Math.random() * DATA_SIZE);
            let y = Math.floor(Math.random() * DATA_SIZE);
            let h = Math.random() * 4 - 2;
            for (let i = Math.max(x - 8, 0); i < x + 8 && i < DATA_SIZE; i++) {
                for (let j = Math.max(y - 8, 0); j < y + 8 && j < DATA_SIZE; j++) {
                    output[i][j] += h;
                }
            }
        }
        for (let i = 0; i < DATA_SIZE; i++) {
            for (let j = 0; j < DATA_SIZE; j++) {
                let n = 0;
                let o = 0;
                for (let ii = i - 1; ii <= i + 1; ii++) {
                    for (let jj = j - 1; jj <= j + 1; jj++) {
                        if (ii >= 0 && ii < DATA_SIZE && jj > 0 && jj < DATA_SIZE) {
                            n++;
                            o += output[ii][jj];
                        }
                    }
                }
                output[i][j] = Math.floor(o / n);
            }
        }
        let done = false;
        while (!done) {
            done = true;
            for (let i = 0; i < DATA_SIZE - 1; i++) {
                for (let j = 0; j < DATA_SIZE - 1; j++) {
                    let h1 = output[i][j];
                    let h2 = output[i][j + 1];
                    let h3 = output[i + 1][j + 1];
                    let h4 = output[i + 1][j];
                    let max = Math.max(h1, h2, h3, h4);
                    let min = Math.min(h1, h2, h3, h4);
                    if (max - min > 2) {
                        output[i][j] = Math.floor(h1 * 0.4 + h2 * 0.2 + h3 * 0.2 + h4 * 0.2);
                        output[i][j + 1] = Math.floor(h1 * 0.2 + h2 * 0.4 + h3 * 0.2 + h4 * 0.2);
                        output[i + 1][j + 1] = Math.floor(h1 * 0.2 + h2 * 0.2 + h3 * 0.4 + h4 * 0.2);
                        output[i + 1][j] = Math.floor(h1 * 0.2 + h2 * 0.2 + h3 * 0.2 + h4 * 0.4);
                        done = false;
                    }
                }
            }
        }
        return output;
    }
}
WorldDataGenerator._RawDatas = new Map();
WorldDataGenerator._Datas = new Map();
class BranchMesh {
    constructor() {
        this.branches = [];
    }
}
class Leaf {
    constructor(d, quaternion, scaling, index) {
        this.d = d;
        this.quaternion = quaternion;
        this.scaling = scaling;
        this.index = index;
    }
}
class Branch {
    constructor(position, parent, tree) {
        this.position = position;
        this.parent = parent;
        this.tree = tree;
        this.d = 0;
        this.generation = 0;
        this.children = [];
        this.leaves = [];
        if (this.parent) {
            this.direction = this.position.subtract(this.parent.position).normalize();
            this.d = this.parent.d + 1;
            this.generation = this.parent.generation;
            this.parent.children.push(this);
        }
        else {
            this.direction = new BABYLON.Vector3(0, 1, 0);
        }
    }
    generate() {
        if (this.d < this.tree.size) {
            let branchness = 0;
            if (this.generation === 0) {
                branchness = this.tree.trunkBranchness(this.d, this.generation);
            }
            else {
                branchness = this.tree.branchBranchness(this.d, this.generation);
            }
            if (this.generation === 0 || this.tree.randomizer.random() < branchness) {
                if (this.generation > 0) {
                    branchness *= 0.7;
                }
                let p = this.direction.clone();
                p.addInPlaceFromFloats(this.tree.randomizer.random() - 0.5, this.tree.randomizer.random() - 0.5, this.tree.randomizer.random() - 0.5).scaleInPlace(2);
                if (this.generation === 0) {
                    p.y += this.tree.trunkDY;
                }
                else {
                    let dr = this.position.clone();
                    dr.y = 0;
                    dr.normalize();
                    dr.scaleInPlace(this.tree.branchDR);
                    p.addInPlace(dr);
                    p.y += this.tree.branchDY;
                }
                p.normalize().scaleInPlace(this.generation === 0 ? this.tree.trunkLength : this.tree.branchLength);
                new Branch(this.position.add(p), this, this.tree);
            }
            let done = false;
            while (!done) {
                if (this.tree.randomizer.random() < branchness) {
                    branchness *= 0.7;
                    let branchPosFound = false;
                    let attempts = 0;
                    while (!branchPosFound && attempts++ < 10) {
                        let r = new BABYLON.Vector3(this.tree.randomizer.random(), this.tree.randomizer.random(), this.tree.randomizer.random());
                        let p = BABYLON.Vector3.Cross(this.direction, r);
                        p.addInPlaceFromFloats(this.tree.randomizer.random() - 0.5, this.tree.randomizer.random() - 0.5, this.tree.randomizer.random() - 0.5);
                        p.normalize().scaleInPlace(this.tree.branchLength);
                        p.addInPlace(this.position);
                        branchPosFound = true;
                        for (let i = 1; i < this.children.length; i++) {
                            let distFromOtherBranch = BABYLON.Vector3.DistanceSquared(this.children[i].position, p);
                            if (distFromOtherBranch < this.tree.branchLength * 1.5) {
                                branchPosFound = false;
                            }
                        }
                        if (branchPosFound) {
                            let b = new Branch(p, this, this.tree);
                            b.generation++;
                        }
                    }
                }
                else {
                    done = true;
                }
            }
            this.children.forEach(c => {
                c.generate();
            });
        }
        if (this.parent) {
            if (this.children.length === 0) {
                let d = this.tree.randomizer.random();
                let index = Math.floor(this.tree.randomizer.random() * 5);
                let leafRot = BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(this.tree.randomizer.random(), this.tree.randomizer.random(), this.tree.randomizer.random()), Math.PI * 2 * this.tree.randomizer.random());
                this.leaves.push(new Leaf(d, leafRot, 1 / (Math.sqrt(this.generation + 1)), index));
                index = Math.floor(this.tree.randomizer.random() * 5);
                let zAxis = this.direction;
                let xAxis = BABYLON.Vector3.Cross(BABYLON.Axis.Y, zAxis);
                let yAxis = BABYLON.Vector3.Cross(zAxis, xAxis);
                leafRot = BABYLON.Quaternion.RotationQuaternionFromAxis(xAxis, yAxis, zAxis);
                this.leaves.push(new Leaf(1, leafRot, 1 / (Math.sqrt(this.generation + 1)), index));
            }
        }
    }
    addChildrenToBranchMeshes(currentBranchMesh, branchMeshes) {
        if (this.children[0]) {
            currentBranchMesh.branches.push(this.children[0]);
            this.children[0].addChildrenToBranchMeshes(currentBranchMesh, branchMeshes);
        }
        for (let i = 1; i < this.children.length; i++) {
            let newBranchMesh = new BranchMesh();
            branchMeshes.push(newBranchMesh);
            newBranchMesh.radius = currentBranchMesh.radius * 0.7;
            newBranchMesh.branches.push(this, this.children[i]);
            this.children[i].addChildrenToBranchMeshes(newBranchMesh, branchMeshes);
        }
    }
}
class Randomizer {
    constructor(seed) {
        this.seed = seed;
        this._index = 0;
        this._loops = 0;
        this.seed = Math.floor(this.seed);
    }
    random() {
        this._index += this.seed;
        if (this._index >= randoms.length) {
            this._index = this._loops;
            this._loops++;
            if (this._loops >= randoms.length) {
                this._loops = 0;
            }
        }
        return randoms[this._index];
    }
    reset() {
        console.log(this._index + " " + this._loops);
        this._index = 0;
        this._loops = 0;
    }
}
class Tree extends BABYLON.Mesh {
    constructor(seed = 42) {
        super("tree");
        this.size = 10;
        this.trunkLength = 1.2;
        this.trunkDY = 0.5;
        this.trunkBranchness = () => { return 0.5; };
        this.branchSizeRandomize = 2;
        this.branchLength = 1;
        this.branchDR = 1;
        this.branchDY = 1;
        this.branchBranchness = () => { return 0.5; };
        this.randomizer = new Randomizer(seed);
        this.trunkBranchness = (l, gen) => {
            return 2.5 * l / this.size - 0.5;
        };
        this.branchBranchness = (l, gen) => {
            if (gen === 1) {
                return 1;
            }
            else {
                return 0.2;
            }
        };
    }
    generate(p) {
        this.position = p;
        this.root = new Branch(BABYLON.Vector3.Zero(), undefined, this);
        this.root.generate();
    }
    async createMesh(t) {
        this.randomizer.reset();
        let brancheMeshes = [];
        let rootBranchMesh = new BranchMesh();
        rootBranchMesh.radius = 0.5;
        brancheMeshes.push(rootBranchMesh);
        rootBranchMesh.branches.push(this.root);
        this.root.addChildrenToBranchMeshes(rootBranchMesh, brancheMeshes);
        let leaveDatas = await VertexDataLoader.instance.getColorizedMultiple("leaves", "#b4eb34");
        let meshes = [];
        let dLim = Math.floor(this.size * t);
        let dt = this.size * t - dLim;
        for (let i = 0; i < brancheMeshes.length; i++) {
            let branchMesh = brancheMeshes[i];
            let generation = branchMesh.branches[branchMesh.branches.length - 1].generation;
            let points = [];
            branchMesh.branches.forEach(branch => {
                if (branch.d <= dLim) {
                    points.push(branch.position);
                    branch.leaves.forEach(leaf => {
                        let leafMesh = new BABYLON.Mesh("leaf");
                        leafMesh.position = BABYLON.Vector3.Lerp(branch.parent.position, branch.position, leaf.d);
                        leafMesh.rotationQuaternion = leaf.quaternion;
                        leafMesh.scaling.scaleInPlace(leaf.scaling);
                        leaveDatas[leaf.index].applyToMesh(leafMesh);
                        meshes.push(leafMesh);
                    });
                }
                else if (branch.d === dLim + 1 && branch.parent) {
                    let p = BABYLON.Vector3.Lerp(branch.parent.position, branch.position, dt);
                    points.push(p);
                    branch.leaves.forEach(leaf => {
                        let leafMesh = new BABYLON.Mesh("leaf");
                        leafMesh.position = BABYLON.Vector3.Lerp(branch.parent.position, branch.position, leaf.d * dt);
                        leafMesh.rotationQuaternion = leaf.quaternion;
                        leafMesh.scaling.scaleInPlace(leaf.scaling * dt);
                        leaveDatas[leaf.index].applyToMesh(leafMesh);
                        meshes.push(leafMesh);
                    });
                }
            });
            if (points.length >= 2) {
                let genFactor = Math.pow(1.3, generation);
                let branch = branchMesh.branches[0];
                let factor = (1 - branch.d / this.size) * 0.8 + 0.2;
                let rStart = 0.5 / genFactor * factor;
                let rEnd = 0.1 / genFactor;
                let vertexData = TreeMeshBuilder.CreateTubeVertexData(points, (d) => {
                    return rStart * (1 - d) + rEnd * d;
                }, new BABYLON.Color4(168 / 255, 113 / 255, 50 / 255, 1));
                let mesh = new BABYLON.Mesh("branch");
                vertexData.applyToMesh(mesh);
                meshes.push(mesh);
            }
        }
        if (meshes.length > 0) {
            let mergedMesh = BABYLON.Mesh.MergeMeshes(meshes, true);
            let data = BABYLON.VertexData.ExtractFromMesh(mergedMesh);
            mergedMesh.dispose();
            data.applyToMesh(this);
            this.material = Main.cellShadingMaterial;
        }
    }
}
var randoms = [0.7242700599, 0.0493068431, 0.5422877367, 0.1155181657, 0.2589516440, 0.9393757207, 0.1050213169, 0.2918769867, 0.9654547756, 0.6608105994, 0.0804853787, 0.6764936525, 0.4725352234, 0.4789722782, 0.7597937290, 0.7099366252, 0.6373429094, 0.6463509444, 0.7628570521, 0.6117278313, 0.6345756043, 0.3686689588, 0.4746355440, 0.1050554798, 0.2292831362, 0.0122525857, 0.2110570742, 0.6577345865, 0.2738793904, 0.9850751247, 0.7189840089, 0.2583777933, 0.3248560024, 0.4391433454, 0.0513389327, 0.2618335775, 0.5141906503, 0.0118307786, 0.4606407831, 0.3534065693, 0.1273363899, 0.4317617511, 0.1757455333, 0.2303439940, 0.1691254663, 0.0246304385, 0.9990007667, 0.2751558719, 0.2559454405, 0.8144072106, 0.4124306405, 0.7796093815, 0.1272457310, 0.9694824364, 0.3586842434, 0.5723316900, 0.4694900147, 0.6274267780, 0.7490841632, 0.9607010980, 0.0247781632, 0.8272898348, 0.8120756273, 0.4937788706, 0.8134985318, 0.7969832511, 0.8605236709, 0.6972437660, 0.1616883610, 0.2899764558, 0.0550764116, 0.6729259381, 0.8333863574, 0.7823799482, 0.6633547194, 0.0474525009, 0.7753385769, 0.8436966080, 0.4718841805, 0.3838246825, 0.6942509018, 0.7967364900, 0.9230281813, 0.3997794697, 0.4054416334, 0.9114997279, 0.1680495318, 0.2552886619, 0.3386279628, 0.2719746019, 0.6284024361, 0.4699365633, 0.5020716600, 0.8288275212, 0.1260017701, 0.8545485952, 0.0268598778, 0.3131287750, 0.5409139230, 0.4218396776, 0.2110576441, 0.5841654280, 0.0069623749, 0.3676826704, 0.4783344444, 0.6952728730, 0.1935424777, 0.8690971574, 0.7869382084, 0.5365594171, 0.4049723332, 0.1862909502, 0.8698437916, 0.9434257749, 0.0926046635, 0.5927811200, 0.8252708107, 0.7920356459, 0.7745536416, 0.2454967733, 0.5983826377, 0.0004461594, 0.7852858679, 0.6504476590, 0.0831056213, 0.0361474429, 0.3351674424, 0.4482753492, 0.7351609241, 0.9398288552, 0.4155562105, 0.9029766907, 0.4379223573, 0.3499556550, 0.9304110741, 0.3036975833, 0.0892269263, 0.4509153552, 0.0203847143, 0.8894592030, 0.9317293204, 0.6251866432, 0.1042043362, 0.3877613367, 0.5439226566, 0.3087234085, 0.5760028769, 0.2130198381, 0.0962961602, 0.5517591999, 0.1167301573, 0.4520639047, 0.0098701030, 0.4225291149, 0.7821020664, 0.6798952865, 0.6083060491, 0.7194023792, 0.5460400173, 0.7025148274, 0.7755279534, 0.6283414166, 0.7080025465, 0.8624036057, 0.6122573564, 0.3236481038, 0.7462935976, 0.1928970649, 0.4359210590, 0.2409878239, 0.7029757359, 0.7464879981, 0.4158457995, 0.8863452932, 0.2860072561, 0.6476758784, 0.6248748838, 0.6265892509, 0.0671532371, 0.3915217916, 0.9131664768, 0.0652272242, 0.0882384702, 0.1152783761, 0.9645111551, 0.4396360646, 0.7849090465, 0.9748901436, 0.9597332202, 0.4240333292, 0.5853662551, 0.0591033653, 0.0885885525, 0.3922866085, 0.4542205364, 0.3215328764, 0.2003332475, 0.8756006365, 0.8843277921, 0.4501462511, 0.3125754303, 0.8195215403, 0.9624757132, 0.4698564261, 0.1024654601, 0.9036904001, 0.0827528128, 0.4639685772, 0.4544798246, 0.9029108164, 0.0590481294, 0.0954582618, 0.3599908703, 0.0320718644, 0.8442975936, 0.9074342513, 0.5745667980, 0.7543980752, 0.7252522612, 0.5843540342, 0.4099296652, 0.1075638416, 0.2706947579, 0.1775494161, 0.5315456242, 0.6187001742, 0.0785214912, 0.0454971203, 0.2689649292, 0.0160659903, 0.2319657186, 0.3785473553, 0.4720611737, 0.8647573913, 0.2839007290, 0.9941299463, 0.3808066657, 0.6351589251, 0.8722220793, 0.9416734636, 0.7956589339, 0.0440075630, 0.3753263507, 0.8866323874, 0.2791323390, 0.7083749850, 0.9077391747, 0.6139200628, 0.0163262418, 0.4331295453, 0.5772057739, 0.4613739901, 0.5617081421, 0.3306423041, 0.8971317107, 0.5892410464, 0.6943365595, 0.6384280686, 0.8377175055, 0.0171168379, 0.0730566683, 0.4925365936, 0.7829017214, 0.6441249934, 0.7238788408, 0.1034354008, 0.3084766780, 0.2280655424, 0.1918914642, 0.9929759453, 0.9646530421, 0.1486785630, 0.6192536720, 0.5964290053, 0.1071561711, 0.1331322947, 0.6136940291, 0.9229802281, 0.4982749293, 0.8140446263, 0.6235184895, 0.6121024877, 0.9900876276, 0.3299750340, 0.8292967664, 0.2499477564, 0.7093055687, 0.9415518620, 0.5233943171, 0.4610735192, 0.1540224350, 0.3733147452, 0.5414278444, 0.0145062016, 0.6752233682, 0.7863680600, 0.1053181288, 0.1511605927, 0.3436139131, 0.2822695044, 0.0850694228, 0.6311106664, 0.7895092360, 0.3055335459, 0.0266564502, 0.7418065020, 0.5717429115, 0.1525647681, 0.8717105884, 0.3516006033, 0.3248899980, 0.3847826029, 0.9619904495, 0.6640942389, 0.1799009378, 0.6082680373, 0.1897113943, 0.6953407643, 0.3224327341, 0.9053061042, 0.1005653053, 0.6997991174, 0.5780051022, 0.3785862030, 0.4539759788, 0.0012537337, 0.2106805153, 0.6249807674, 0.3098250503, 0.9480142752, 0.5752148845, 0.9576217629, 0.3446185879, 0.9789061954, 0.9565093920, 0.9327901455, 0.1764110584, 0.3539711952, 0.1581804006, 0.3707084861, 0.4328390473, 0.8360334515, 0.2755712263, 0.9518532023, 0.8626766698, 0.0064201573, 0.5434304878, 0.0773955106, 0.8525197818, 0.5046323877, 0.2131218229, 0.7377617413, 0.1669677053, 0.9906101730, 0.6109655254, 0.1599562508, 0.9399006684, 0.7642581592, 0.3255356999, 0.7429558256, 0.8696550372, 0.9897098084, 0.7234799391, 0.1040380442, 0.4022594418, 0.5593281926, 0.4266466521, 0.7814338403, 0.1650412751, 0.9247418712, 0.1991958562, 0.8220697698, 0.4770719533, 0.4779802347, 0.8929487341, 0.6674516444, 0.7572695686, 0.0305798561, 0.3203678820, 0.8944742313, 0.3165600188, 0.6285656789, 0.3481055093, 0.8712954703, 0.9179803772, 0.1300864748, 0.9476540353, 0.9239366349, 0.9281898679, 0.0605899163, 0.5114434217, 0.1166775900, 0.5635161472, 0.8322400267, 0.5777929829, 0.6664148478, 0.2069780890, 0.6379790591, 0.2010510735, 0.2144044222, 0.9138874917, 0.0880099281, 0.1931881672, 0.5755539782, 0.1703985379, 0.8401477858, 0.0363213968, 0.0736225604, 0.4788747286, 0.4168127789, 0.0417379264, 0.1819225915, 0.3468983755, 0.4883995109, 0.2028467758, 0.4625718857, 0.2018054082, 0.5038428033, 0.5790877526, 0.5190273002, 0.9756712807, 0.1996946698, 0.1887465690, 0.7180341131, 0.3935661182, 0.9517568502, 0.1003021667, 0.4026021422, 0.0655911483, 0.7194643989, 0.7819022391, 0.8389647784, 0.1686014187, 0.3566954912, 0.1769990163, 0.0199771463, 0.7750562347, 0.0675238158, 0.1025482180, 0.3834718955, 0.5754452847, 0.3828602524, 0.9552030591, 0.4888887311, 0.5852257146, 0.9401637429, 0.1485991792, 0.8242239978, 0.8276330948, 0.9333590938, 0.7287074959, 0.7908470174, 0.5969027170, 0.8798085095, 0.2800575785, 0.7348325376, 0.7835277557, 0.4422669437, 0.4147665293, 0.0669014501, 0.7035491239, 0.0806318157, 0.3914370260, 0.6209230341, 0.9949791452, 0.6669788114, 0.7387263668, 0.3443991316, 0.0786236455, 0.0327835402, 0.0208224175, 0.8044662181, 0.9665148555, 0.5437099569, 0.9438406889, 0.8334965332, 0.6408899431, 0.6004960429, 0.9094606440, 0.4545623088, 0.5416014298, 0.5185310218, 0.2876935339, 0.9787282010, 0.4109265628, 0.7897397697, 0.6690263787, 0.7711525727, 0.3958383852, 0.1743711888, 0.1811211592, 0.9947046025, 0.6230898274, 0.5494245205, 0.2578150412, 0.1051019226, 0.6825386241, 0.6844593414, 0.3478449995, 0.3460278132, 0.6033225786, 0.2629854091, 0.1393437360, 0.7570739543, 0.2016361738, 0.5894335977, 0.4186086423, 0.2886165027, 0.5070499941, 0.7372869796, 0.8482298722, 0.7313670957, 0.5543738603, 0.6552679897, 0.7034867547, 0.4473726010, 0.1183425006, 0.4813962094, 0.0574677492, 0.6036604564, 0.7629301955, 0.5942371794, 0.4272393240, 0.3161286887, 0.1185665298, 0.6273876346, 0.2957832764, 0.6036353640, 0.6863712662, 0.6690338396, 0.1629004689, 0.7731658551, 0.4109630014, 0.4676929542, 0.4294323266, 0.8376912829, 0.7553402757, 0.3570785878, 0.0458421193, 0.1997259129, 0.3598863356, 0.5358072399, 0.3649016062, 0.7108706691, 0.3367744380, 0.5256662841, 0.5974763969, 0.8738525816, 0.5061275693, 0.5048239078, 0.4874456508, 0.5759687938, 0.4423145794, 0.1815517900, 0.0866558894, 0.2257759579, 0.2543508331, 0.5438101235, 0.1966876948, 0.9370037721, 0.7707698461, 0.5055027809, 0.2076097061, 0.6918017889, 0.3799813862, 0.7963112721, 0.3237059080, 0.3872077438, 0.4484776571, 0.4411365245, 0.0545198991, 0.4965492496, 0.9086043362, 0.4293899510, 0.9717660536, 0.6977726405, 0.9953251296, 0.1842726525, 0.8157435661, 0.9816793225, 0.4590247116, 0.7140027545, 0.6574292681, 0.7265972665, 0.4029564212, 0.7187616104, 0.6637664394, 0.8516865726, 0.9062964450, 0.8120468845, 0.3770243262, 0.3372623889, 0.3701231964, 0.8182719769, 0.8023526980, 0.3614009920, 0.0945888207, 0.7407996622, 0.1002062243, 0.2066907365, 0.7096173283, 0.9245362794, 0.9193271037, 0.5893148860, 0.7776287471, 0.6591243713, 0.1830842800, 0.4408506112, 0.1926844638, 0.0148201297, 0.5437490613, 0.7810157905, 0.9981941820, 0.2212992911, 0.7714958203, 0.8911554930, 0.8128932648, 0.3616850864, 0.2081259162, 0.4867771963, 0.6648050416, 0.6254082279, 0.9614145738, 0.9982457950, 0.3076433275, 0.7113963400, 0.1830239100, 0.4346326550, 0.0147995066, 0.2434031157, 0.6191448732, 0.4150566806, 0.2116296007, 0.0640168544, 0.6512485151, 0.2075248379, 0.4767852917, 0.2453957135, 0.0803823845, 0.4005574346, 0.1716000454, 0.3452395886, 0.8644328931, 0.3067756647, 0.4560416823, 0.9739858822, 0.6677710000, 0.9256537852, 0.9104970317, 0.4308814312, 0.1238320586, 0.8111159496, 0.3739132358, 0.0174815154, 0.8569335344, 0.6729540170, 0.9266056540, 0.6517561561, 0.3219967007, 0.5211270386, 0.3359621172, 0.6369315909, 0.5808091618, 0.2011359953, 0.6147151266, 0.6912483120, 0.0845924877, 0.5648851645, 0.7490772283, 0.3994773967, 0.9591359105, 0.4817541729, 0.3587105074, 0.4776497310, 0.2210426447, 0.1491077416, 0.9759423618, 0.2614206807, 0.5203813603, 0.8036516953, 0.6436417011, 0.3817707341, 0.3605820654, 0.2141530566, 0.6889066523, 0.0413795170, 0.5905508017, 0.3749438237, 0.8992870072, 0.7350622443, 0.6906559369, 0.3156713677, 0.8321190127, 0.8183336652, 0.9119546325, 0.3840133372, 0.8265941556, 0.7168369323, 0.9932810787, 0.0824861959, 0.1316771260, 0.5248158811, 0.4864885637, 0.8517346535, 0.9922336827, 0.7814991063, 0.4039137743, 0.8568281476, 0.7725111814, 0.8990166154, 0.4405614525, 0.4278781393, 0.9048678851, 0.8149336999, 0.3550270115, 0.9993628811, 0.4790769664, 0.8281622312, 0.8205501422, 0.2997732510, 0.4790797104, 0.0360771712, 0.5451067649, 0.4188647166, 0.6595943311, 0.5474661960, 0.8034773959, 0.9088917567, 0.0994198604, 0.4393934615, 0.6435395245, 0.9314730441, 0.1669751855, 0.6972210960, 0.8646594610, 0.6206810408, 0.3494463092, 0.5911595005, 0.7305150577, 0.5274720990, 0.3608072253, 0.3739056014, 0.8240302583, 0.8093947482, 0.2830850285, 0.8982751829, 0.0705978571, 0.1208311212, 0.3375047867, 0.5848364668, 0.9824035432, 0.8273516581, 0.9238173686, 0.7349447625, 0.5559300026, 0.9855984217, 0.3665797933, 0.2812392593, 0.0103364105, 0.3447246688, 0.0249127583, 0.5013726791, 0.0668634880, 0.9940454286, 0.7004167271, 0.1879393445, 0.2820476049, 0.8775177712, 0.6459385052, 0.7144977555, 0.3595636262, 0.0762262314, 0.4175779994, 0.3625217852, 0.6206054282, 0.0721474664, 0.9272464969, 0.5089201319, 0.3678173055, 0.9839281028, 0.9380474491, 0.7704951535, 0.0823085457, 0.5279481816, 0.2553816826, 0.1261776565, 0.5424213316, 0.7307648740, 0.6524229752, 0.7139727673, 0.2808533116, 0.4860174122, 0.8901169115, 0.8251365780, 0.4361213889, 0.9903281038, 0.5220581403, 0.7529180910, 0.3767807658, 0.6540117299, 0.3398082936, 0.1915120783, 0.0483394170, 0.5314662109, 0.5289851442, 0.2269031058, 0.9869964429, 0.7344832992, 0.6765234385, 0.4228584159, 0.1414953346, 0.4825023655, 0.1769820987, 0.9365497497, 0.3654644038, 0.1089106396, 0.6193485078, 0.2712745369, 0.6691275168, 0.2746523211, 0.9628977904, 0.0913388318, 0.5585104744, 0.9465911890, 0.8012934558, 0.7431091672, 0.8774299116, 0.4048360852, 0.2287810732, 0.3130717338, 0.0283188138, 0.5690451594, 0.9487421092, 0.0112612707, 0.5984484447, 0.1670231452, 0.3208097079, 0.3154187390, 0.4464264441, 0.2984804430, 0.6835090596, 0.7532906692, 0.8372468615, 0.1804386641, 0.2881406181, 0.3548981236, 0.9862165374, 0.5254544169, 0.2337670630, 0.2305122048, 0.3499720512, 0.1037841402, 0.4070929490, 0.2684014095, 0.0881662639, 0.8299891382, 0.3345257748, 0.6780060736, 0.9586809936, 0.3994630867, 0.6765117934, 0.4834768403, 0.6914101131, 0.6119240925, 0.0194356634, 0.4634791533, 0.4711018851, 0.5985505092, 0.6540403696, 0.1547801615, 0.2416340994, 0.6091429599, 0.5641116157, 0.3970097817, 0.0431418413, 0.1624580953, 0.8727724543, 0.5573944414, 0.7019240718, 0.2373427161, 0.6320177534, 0.8413323510, 0.2676511045, 0.1739817557, 0.9924947722, 0.0725140274, 0.9883033119, 0.2998545930, 0.2135089074, 0.3268373207, 0.6093808380, 0.1114221603, 0.9777823066, 0.3316591616, 0.7886764292, 0.5203446263, 0.8008522626, 0.0526976573, 0.4595948112, 0.1421890690, 0.6245773799, 0.0479492805, 0.7980149239, 0.7579457769, 0.4345499731, 0.6448086538, 0.9460194372, 0.2869939945, 0.8062114069, 0.7368628065, 0.4540553125, 0.2109252202, 0.6383435590, 0.7308604929, 0.8488876527, 0.7919969151, 0.5362662798, 0.8822105687, 0.9912453393, 0.3319019419, 0.2193287094, 0.6350240476, 0.2446239759, 0.8691996646, 0.0043214415, 0.5775778649, 0.4866951622, 0.5029004142, 0.8159517258, 0.3293561954, 0.7851142047, 0.5495315865, 0.8195157748, 0.0972854223, 0.2116187806, 0.2272285320, 0.6547600830, 0.0431959139, 0.5567732016, 0.0725161541, 0.6577055698, 0.2995409921, 0.9291052861, 0.3639760000, 0.2679724639, 0.0724978499, 0.8259188558, 0.0580923330, 0.9692715581, 0.7680634495, 0.5284981411, 0.6262385713, 0.6953433254, 0.1322043182, 0.3337001534, 0.7334780467, 0.5108243732, 0.9659628637, 0.7730966436, 0.5729263574, 0.5664871582, 0.9118440415, 0.1118118041, 0.8899543388, 0.3044219849, 0.7648354089, 0.4371592858, 0.3261678216, 0.2066050807, 0.7957998124, 0.0838956731, 0.9802235533, 0.3819044299, 0.3787963371, 0.0387293142, 0.4566537281, 0.6634002723, 0.8084787223, 0.3796131639, 0.5618096739, 0.6747628759, 0.6732670736, 0.8823342179, 0.2114956955, 0.7507445924, 0.5042911130, 0.6342335806, 0.4909884180, 0.6434017994, 0.2286114560, 0.5512288898, 0.7136266237, 0.9419148911, 0.4711444672, 0.5438793909, 0.0311638063, 0.8752503902, 0.0314147397, 0.7947786019, 0.5001851634];
class TreeMeshBuilder {
    static CreateTubeVertexData(points, radiusFunction, color = new BABYLON.Color4(1, 1, 1, 1)) {
        let axisX = new BABYLON.Vector3(1, 0, 0);
        let axisY = new BABYLON.Vector3(0, 1, 0);
        let axisZ = new BABYLON.Vector3(0, 0, 1);
        let lastAxisZ = axisZ.clone();
        let circle = [];
        let positions = [];
        let indices = [];
        let normals = [];
        let colors = [];
        let uvs = [];
        let curve = BABYLON.Curve3.CreateCatmullRomSpline(points, 3);
        points = curve.getPoints();
        let length = curve.length();
        for (let i = 0; i < 6; i++) {
            circle[i] = new BABYLON.Vector3(Math.cos(i * Math.PI / 3), 0, Math.sin(i * Math.PI / 3));
        }
        let l = 0;
        for (let i = 0; i < points.length; i++) {
            let pPrev = points[i - 1];
            let p = points[i];
            let pNext = points[i + 1];
            if (pNext) {
                axisY.copyFrom(pNext);
                axisY.subtractInPlace(p);
                axisY.normalize();
            }
            else {
                axisY.copyFrom(p);
                axisY.subtractInPlace(pPrev);
                axisY.normalize();
            }
            if (pPrev) {
                l += BABYLON.Vector3.Distance(pPrev, p);
            }
            BABYLON.Vector3.CrossToRef(axisY, lastAxisZ, axisX);
            axisX.normalize();
            BABYLON.Vector3.CrossToRef(axisX, axisY, axisZ);
            lastAxisZ.copyFrom(axisZ);
            let q = BABYLON.Quaternion.RotationQuaternionFromAxis(axisX, axisY, axisZ);
            let s = radiusFunction(l / length);
            let m = BABYLON.Matrix.Compose(new BABYLON.Vector3(s, s, s), q, p);
            for (let j = 0; j < 6; j++) {
                let v0 = circle[j];
                let v = BABYLON.Vector3.TransformCoordinates(v0, m);
                positions.push(v.x, v.y, v.z);
                colors.push(color.r, color.g, color.b, color.a);
                uvs.push(0, 0);
                if (i < points.length - 1) {
                    let index = i * 6 + j;
                    if (j < 6 - 1) {
                        indices.push(index, index + 1, index + 6);
                        indices.push(index + 1, index + 6 + 1, index + 6);
                    }
                    else {
                        indices.push(index, index + 1 - 6, index + 6);
                        indices.push(index + 1 - 6, index + 1, index + 6);
                    }
                }
            }
        }
        BABYLON.VertexData.ComputeNormals(positions, indices, normals);
        let data = new BABYLON.VertexData();
        data.positions = positions;
        data.indices = indices;
        data.normals = normals;
        data.colors = colors;
        data.uvs = uvs;
        return data;
    }
}
