interface BrickData {
    reference: string;
    i: number;
    j: number;
    k: number;
    r: number;
}

class Brick extends BABYLON.Mesh {

    public reference: string;
    public meshName: string;
    private _tile: Tile;
    public get tile(): Tile {
        return this._tile;
    }
    public set tile(c: Tile) {
        this._tile = c;
        this.parent = this.tile;
    }
    private _i: number = 0;
    public get i(): number {
        return this._i;
    }
    public set i(v: number) {
        this._i = v;
        this.position.x = (this.i + 0.5) * DX;
    }
    private _j: number = 0;
    public get j(): number {
        return this._j;
    }
    public set j(v: number) {
        this._j = v;
        this.position.y = this.j * DY;
    }
    private _k: number = 0;
    public get k(): number {
        return this._k;
    }
    public set k(v: number) {
        this._k = v;
        this.position.z = (this.k + 0.5) * DX;
    }
    private _r: number = 0;
    public get r(): number {
        return this._r;
    }
    public set r(v: number) {
        this._r = v;
        this.rotation.y = Math.PI / 2 * this.r;
    }

    constructor() {
        super("brick");
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
        this.name = "Brick-" + this.reference;
        // Need to generate mesh here.
    }

    public serialize(): BrickData {
        return {
            i: this.i,
            j: this.j,
            k: this.k,
            r: this.r,
            reference: this.reference
        };
    }

    public deserialize(data: BrickData): void {
        this.i = data.i;
        this.j = data.j;
        this.k = data.k;
        this.r = data.r;
        this.setReference(data.reference);
    }
}