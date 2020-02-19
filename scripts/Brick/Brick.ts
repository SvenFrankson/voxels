interface IBrickData {
    reference: string;
    i: number;
    j: number;
    k: number;
    r: number;
}

interface IBrickReference {
    name: string;
    color: string;
}

class Brick {

    public static ParseReference(brickReference: string): IBrickReference {
        let splitRef = brickReference.split("-");
        let color = splitRef.pop();
        let name = splitRef.join("-");
        return {
            name: name,
            color: color
        };
    }

    public reference: IBrickReference;

    private _tile: Tile;
    public get tile(): Tile {
        return this._tile;
    }
    public set tile(c: Tile) {
        this._tile = c;
    }
    private _i: number = 0;
    public get i(): number {
        return this._i;
    }
    public set i(v: number) {
        this._i = v;
    }
    private _j: number = 0;
    public get j(): number {
        return this._j;
    }
    public set j(v: number) {
        this._j = v;
    }
    private _k: number = 0;
    public get k(): number {
        return this._k;
    }
    public set k(v: number) {
        this._k = v;
    }
    private _r: number = 0;
    public get r(): number {
        return this._r;
    }
    public set r(v: number) {
        this._r = v;
    }
    
    public setCoordinates(coordinates: BABYLON.Vector3) {
        this.i = coordinates.x;
        this.j = coordinates.y;
        this.k = coordinates.z;
    }

    public serialize(): IBrickData {
        return {
            i: this.i,
            j: this.j,
            k: this.k,
            r: this.r,
            reference: this.reference.name + "-" + this.reference.color
        };
    }

    public deserialize(data: IBrickData): void {
        this.i = data.i;
        this.j = data.j;
        this.k = data.k;
        this.r = data.r;
        this.reference = Brick.ParseReference(data.reference);
    }
}