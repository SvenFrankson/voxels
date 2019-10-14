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
var CHUNCK_SIZE = 8;
class Face {
    constructor(vertices, cubeType, draw = true) {
        this.vertices = vertices;
        this.cubeType = cubeType;
        this.draw = draw;
    }
}
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
        this.position.x = CHUNCK_SIZE * this.i;
        this.position.y = CHUNCK_SIZE * this.j;
        this.position.z = CHUNCK_SIZE * this.k;
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
            this.vertices[i].smooth(1);
        }
        for (let i = 0; i < this.vertices.length; i++) {
            this.vertices[i].applySmooth();
        }
        for (let i = 0; i < this.vertices.length; i++) {
            this.vertices[i].smooth(1);
        }
        for (let i = 0; i < this.vertices.length; i++) {
            this.vertices[i].applySmooth();
        }
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
        return {
            i: this.i,
            j: this.j,
            k: this.k,
            data: data,
            blocks: blockDatas
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
                        return m instanceof Chunck;
                    });
                    let pickedMesh = pickInfo.pickedMesh;
                    if (pickedMesh instanceof Chunck) {
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
                            chunck.generateVertices();
                            chunck.generateFaces();
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
                            chunck.generateVertices();
                            chunck.generateFaces();
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
            chunck = new Chunck(this, i, j, k);
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
                        redrawnChunck.generateVertices();
                        redrawnChunck.generateFaces();
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
                    let chunck = new Chunck(this, i, j, k);
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
                    let chunck = new Chunck(this, i, j, k);
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
    static WorldPositionToChunckBlockCoordinates(world) {
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
    static XYScreenToChunckCoordinates(x, y, behindPickedFace = false) {
        let pickInfo = Main.Scene.pick(x, y, (m) => {
            return m instanceof Chunck;
        });
        let pickedMesh = pickInfo.pickedMesh;
        if (pickedMesh instanceof Chunck) {
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
}
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
            return m instanceof Chunck;
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
            return m instanceof Chunck;
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
        this.playerActionManager = new PlayerActionManager(this);
    }
    register() {
        this.playerActionManager.register();
        Main.Scene.onBeforeRenderObservable.add(this.update);
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
        Main.Canvas.addEventListener("pointermove", (e) => {
            if (document.pointerLockElement) {
                this.rotation.y += e.movementX / 200;
                if (Main.Camera instanceof BABYLON.FreeCamera) {
                    Main.Camera.rotation.x = Math.min(Math.max(Main.Camera.rotation.x + e.movementY / 200, -Math.PI / 2 + Math.PI / 60), Math.PI / 2 - Math.PI / 60);
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
            let coordinates = ChunckUtils.XYScreenToChunckCoordinates(x, y, cubeType === CubeType.None);
            if (coordinates) {
                if (!previewMesh) {
                    previewMesh = BABYLON.MeshBuilder.CreateBox("preview-mesh", { size: 1.2 });
                    previewMesh.material = Cube.PreviewMaterials[cubeType];
                }
                previewMesh.position.copyFrom(coordinates.chunck.position);
                previewMesh.position.addInPlace(coordinates.coordinates);
                previewMesh.position.addInPlaceFromFloats(0.5, 0.5, 0.5);
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
            let coordinates = ChunckUtils.XYScreenToChunckCoordinates(x, y, cubeType === CubeType.None);
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
                let coordinates = ChunckUtils.WorldPositionToChunckBlockCoordinates(world);
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
                let coordinates = ChunckUtils.WorldPositionToChunckBlockCoordinates(world);
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
    static CreateMountainAction(r, h, roughness) {
        let action = new PlayerAction();
        action.iconUrl = "./datas/textures/miniatures/move-arrow.png";
        action.onClick = () => {
            let x = Main.Engine.getRenderWidth() * 0.5;
            let y = Main.Engine.getRenderHeight() * 0.5;
            let coordinates = ChunckUtils.XYScreenToChunckCoordinates(x, y);
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
            if (this.linkedActions[index]) {
                // Unequip current action
                if (this.player.currentAction) {
                    if (this.player.currentAction.onUnequip) {
                        this.player.currentAction.onUnequip();
                    }
                }
                // If request action was already equiped, remove it.
                if (this.player.currentAction === this.linkedActions[index]) {
                    this.player.currentAction = undefined;
                }
                // Equip new action.
                else {
                    this.player.currentAction = this.linkedActions[index];
                    if (this.player.currentAction) {
                        if (this.player.currentAction.onEquip) {
                            this.player.currentAction.onEquip();
                        }
                    }
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
        this._sectionActions.addEventListener("pointerup", () => {
            this.currentSection = InventorySection.Action;
            this.update();
        });
        this._sectionCubes = document.getElementById("section-cubes");
        this._sectionCubes.addEventListener("pointerup", () => {
            this.currentSection = InventorySection.Cube;
            this.update();
        });
        this._sectionBlocks = document.getElementById("section-blocks");
        this._sectionBlocks.addEventListener("pointerup", () => {
            this.currentSection = InventorySection.Block;
            this.update();
        });
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
        if (this.currentSection === InventorySection.Action) {
            this._sectionActions.style.background = "white";
            this._sectionActions.style.color = "black";
        }
        else {
            this._sectionActions.style.background = "black";
            this._sectionActions.style.color = "white";
        }
        if (this.currentSection === InventorySection.Cube) {
            this._sectionCubes.style.background = "white";
            this._sectionCubes.style.color = "black";
        }
        else {
            this._sectionCubes.style.background = "black";
            this._sectionCubes.style.color = "white";
        }
        if (this.currentSection === InventorySection.Block) {
            this._sectionBlocks.style.background = "white";
            this._sectionBlocks.style.color = "black";
        }
        else {
            this._sectionBlocks.style.background = "black";
            this._sectionBlocks.style.color = "white";
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
            Main._cellShadingMaterial = new ToonMaterial("CellMaterial", BABYLON.Color3.White(), Main.Scene);
        }
        return Main._cellShadingMaterial;
    }
    static get terrainCellShadingMaterial() {
        if (!Main._terrainCellShadingMaterial) {
            Main._terrainCellShadingMaterial = new TerrainToonMaterial("CellMaterial", BABYLON.Color3.White(), Main.Scene);
        }
        return Main._terrainCellShadingMaterial;
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
				float threshold = 0.4 + max((depth - 20.) / 30., 0.);
				
				gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
				if (sobel_depth < thresholdDepth) {
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
        /*
        Main.Skybox = BABYLON.MeshBuilder.CreateSphere("skyBox", { diameter: 4000.0 }, Main.Scene);
        Main.Skybox.layerMask = 1;
        Main.Skybox.infiniteDistance = true;
        let skyboxMaterial: BABYLON.StandardMaterial = new BABYLON.StandardMaterial("skyBox", Main.Scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.emissiveTexture = new BABYLON.Texture(
            "./datas/textures/sky.png",
            Main.Scene
        );
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        Main.Skybox.material = skyboxMaterial;
        */
        Main.ChunckManager = new ChunckManager();
        new VertexDataLoader(Main.Scene);
        Main.MenuManager = new MenuManager();
        Main.MenuManager.initialize();
        let pauseMenu = new PauseMenu();
        pauseMenu.initialize();
        console.log("Main scene Initialized.");
    }
    animate() {
        Main.Engine.runRenderLoop(() => {
            Main.Scene.render();
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
        Main.ChunckEditor.saveSceneName = "collisions-test";
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
                let intersections = Intersections3D.SphereChunck(sphere.position, 0.5, manyChuncks[i]);
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
        await this.createCube(CubeType.Dirt);
        await this.createCube(CubeType.Rock);
        await this.createCube(CubeType.Sand);
        for (let i = 0; i < BlockList.References.length; i++) {
            let reference = BlockList.References[i];
            await this.createBlock(reference);
        }
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
        chunck.generateVertices();
        chunck.generateFaces();
        chunck.computeWorldMatrix(true);
        return new Promise(resolve => {
            setTimeout(() => {
                this.updateCameraPosition();
                setTimeout(async () => {
                    await this.makeScreenShot(ChunckUtils.CubeTypeToString(cubeType).toLocaleLowerCase(), false);
                    resolve();
                }, 100);
            }, 100);
        });
    }
    async createBlock(reference) {
        let chunck = Main.ChunckManager.createChunck(0, 0, 0);
        chunck.makeEmpty();
        chunck.generateVertices();
        chunck.generateFaces();
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
            console.log("Scene generated");
            /*
            let t0 = performance.now();
            var request = new XMLHttpRequest();
            request.open('GET', './datas/scenes/island.json', true);

            request.onload = () => {
                if (request.status >= 200 && request.status < 400) {
                    let defaultTerrain = JSON.parse(request.responseText) as TerrainData;
                    Main.ChunckManager.deserialize(defaultTerrain);
                    Main.ChunckManager.foreachChunck(
                        chunck => {
                            manyChuncks.push(chunck);
                        }
                    );
                    let loopOut = async () => {
                        await Main.ChunckManager.generateManyChuncks(manyChuncks);
                        let t1 = performance.now();
                        console.log("Scene loaded from file in " + (t1 - t0).toFixed(1) + " ms");
                    }
                    loopOut();
                } else {
                    alert("Scene file not found. My bad. Sven.")
                }
            };

            request.onerror = () => {
                alert("Unknown error. My bad. Sven.")
            };

            request.send();
            */
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
        inventory.update();
        if (Main.Camera instanceof BABYLON.FreeCamera) {
            Main.Camera.parent = player;
            Main.Camera.position.y = 1.25;
        }
        setTimeout(async () => {
            let walker = new Walker("walker");
            await walker.instantiate();
            let point;
            while (!point) {
                let ray = new BABYLON.Ray(new BABYLON.Vector3(-50 + 100 * Math.random(), 100, -50 + 100 * Math.random()), new BABYLON.Vector3(0, -1, 0));
                let pick = Main.Scene.pickWithRay(ray, (m) => {
                    return m instanceof Chunck;
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
                        return m instanceof Chunck;
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
class ToonMaterial extends BABYLON.ShaderMaterial {
    constructor(name, color, scene) {
        super(name, scene, {
            vertex: "toon",
            fragment: "toon",
        }, {
            attributes: ["position", "normal", "uv", "color"],
            uniforms: ["world", "worldView", "worldViewProjection", "view", "projection"]
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
