enum CubeType {
    Dirt = 0,
    Rock,
    Sand,
    None
}

class Cube {

    public static get PreviewMaterials(): BABYLON.StandardMaterial[] {
        if (!Cube._PreviewMaterials) {
            Cube._PreviewMaterials = []
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
    private static _PreviewMaterials: BABYLON.StandardMaterial[];

    public v000: Vertex;
    public v001: Vertex;
    public v010: Vertex;
    public v011: Vertex;
    public v100: Vertex;
    public v101: Vertex;
    public v110: Vertex;
    public v111: Vertex;

    constructor(
        public chunck: Chunck,
        public i: number,
        public j: number,
        public k: number,
        public cubeType?: CubeType
    ) {
        if (this.cubeType === undefined) {
            this.cubeType = Math.floor(Math.random() * 3);
        }
    }

    public addVertex(v: Vertex): void {
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

    public makeLinksMX() {
        if (this.v000) {
            this.v000.connect(this.v001);
            this.v000.connect(this.v010);
        }
        if (this.v011) {
            this.v011.connect(this.v010);
            this.v011.connect(this.v001);
        }
    }

    public makeLinksPX() {
        if (this.v100) {
            this.v100.connect(this.v101);
            this.v100.connect(this.v110);
        }
        if (this.v111) {
            this.v111.connect(this.v110);
            this.v111.connect(this.v101);
        }
    }

    public makeLinksMY() {
        if (this.v000) {
            this.v000.connect(this.v001);
            this.v000.connect(this.v100);
        }
        if (this.v101) {
            this.v101.connect(this.v001);
            this.v101.connect(this.v100);
        }
    }

    public makeLinksPY() {
        if (this.v010) {
            this.v010.connect(this.v011);
            this.v010.connect(this.v110);
        }
        if (this.v111) {
            this.v111.connect(this.v011);
            this.v111.connect(this.v110);
        }
    }

    public makeLinksMZ() {
        if (this.v000) {
            this.v000.connect(this.v100);
            this.v000.connect(this.v010);
        }
        if (this.v110) {
            this.v110.connect(this.v010);
            this.v110.connect(this.v100);
        }
    }

    public makeLinksPZ() {
        if (this.v001) {
            this.v001.connect(this.v101);
            this.v001.connect(this.v011);
        }
        if (this.v111) {
            this.v111.connect(this.v011);
            this.v111.connect(this.v101);
        }
    }

    public makeLinks(): void {
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

    public shareFace(c: Cube): boolean {
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