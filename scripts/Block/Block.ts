interface BlockData {
    reference: string;
    material: BlockMaterial,
    i: number;
    j: number;
    k: number;
    r: number;
}

enum BlockMaterial {
    Stone,
    Wood,
    SandStone,
    Brick
}

class Block extends BABYLON.Mesh {

    public reference: string;
    private _chunck: Chunck;
    public get chunck(): Chunck {
        return this._chunck;
    }
    public set chunck(c: Chunck) {
        this._chunck = c;
        this.parent = this.chunck;
    }
    private _i: number = 0;
    public get i(): number {
        return this._i;
    }
    public set i(v: number) {
        this._i = v;
        this.position.x = this.i + 0.25;
    }
    private _j: number = 0;
    public get j(): number {
        return this._j;
    }
    public set j(v: number) {
        this._j = v;
        this.position.y = this.j + 0.125;
    }
    private _k: number = 0;
    public get k(): number {
        return this._k;
    }
    public set k(v: number) {
        this._k = v;
        this.position.z = this.k + 0.25;
    }
    private _r: number = 0;
    public get r(): number {
        return this._r;
    }
    public set r(v: number) {
        this._r = v;
        this.rotation.y = Math.PI / 2 * this.r;
    }

    constructor(
        public blockMaterial: BlockMaterial
    ) {
        super("block");
        this.material = Main.cellShadingMaterial;
    }

    public highlight() {
        this.renderOutline = true;
        this.outlineColor = BABYLON.Color3.Blue();
        this.outlineWidth = 0.01;
    }

    public unlit() {
        this.renderOutline = false;
    }

    public setCoordinates(coordinates: BABYLON.Vector3) {
        this.i = coordinates.x;
        this.j = coordinates.y;
        this.k = coordinates.z;
    }

    public setReference(reference: string) {
        this.reference = reference;
        this.name = "block-" + this.reference;

        BlockVertexData.GetVertexData(this.reference, this.blockMaterial).then(
            data => {
                data.applyToMesh(this);
            }
        )
    }

    public serialize(): BlockData {
        return {
            i: this.i,
            j: this.j,
            k: this.k,
            r: this.r,
            reference: this.reference,
            material: this.blockMaterial
        };
    }

    public deserialize(data: BlockData): void {
        this.i = data.i;
        this.j = data.j;
        this.k = data.k;
        this.r = data.r;
        this.blockMaterial = data.material;
        this.setReference(data.reference);
    }
}