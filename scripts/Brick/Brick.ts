interface IBrickData {
    reference: string;
    i: number;
    j: number;
    k: number;
    r: number;
}

enum BrickType {
    None = 0,
    Concrete,
    Steel
}

enum BrickColor {
    None = 0,
    Red,
    Orange,
    Gold,
    Yellow,
    Lemon,
    Green,
    Mint,
    Turquoise,
    Aqua,
    Azure,
    Blue,
    Indigo,
    Purple,
    Fushia,
    Pink,
    White,
    Gray,
    Black,
}

interface IBrickReference {
    name: string;
    type: BrickType;
    color: BrickColor;
}

class Brick {

    public static DefaultColor(type: BrickType): BrickColor {
        if (type === BrickType.None) {
            return BrickColor.None;
        }
        else if (type === BrickType.Concrete) {
            return BrickColor.Gray;
        }
        else if (type === BrickType.Steel) {
            return BrickColor.Black;
        }
    }

    public static ParseReference(brickReference: string): IBrickReference {
        if (brickReference.startsWith("construct_")) {
            return {
                name: brickReference,
                type: BrickType.None,
                color: BrickColor.None,
            };
        }
        let splitRef = brickReference.split("-");
        let color = parseInt(splitRef.pop());
        let type = parseInt(splitRef.pop());
        let name = splitRef.join("-");
        return {
            name: name,
            type: type,
            color: color
        };
    }

    public static ReferenceToString(brickReference: IBrickReference): string {
        if (brickReference.name.startsWith("construct_")) {
            return brickReference.name;
        }
        return brickReference.name + "-" + brickReference.type.toFixed(0) + "-" + brickReference.color.toFixed(0);
    }

    public reference: IBrickReference;

    private _tile: Tile;
    public get tile(): Tile {
        return this._tile;
    }
    public set tile(t: Tile) {
        this._tile = t;
    }

    private _chunck: Chunck_V2;
    public get chunck(): Chunck_V2 {
        return this._chunck;
    }
    public set chunck(c: Chunck_V2) {
        this._chunck = c;
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

    public setColor(color: BrickColor) {
        this.reference = {
            name: this.reference.name,
            type: this.reference.type,
            color: color
        }
    }

    private _debugText: DebugText3D;
    private _debugOrigin: DebugCross;

    public mesh: BABYLON.Mesh;
    
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
            reference: this.reference.name + "-" + this.reference.type.toFixed(0) + "-" + this.reference.color.toFixed(0)
        };
    }

    public deserialize(data: IBrickData): void {
        this.i = data.i;
        this.j = data.j;
        this.k = data.k;
        this.r = data.r;
        this.reference = Brick.ParseReference(data.reference);
    }

    public showDebug(): void {
        if (this.mesh) {
            if (!this._debugText) {
                this._debugText = DebugText3D.CreateText("", this.mesh.absolutePosition);
            }
            let text = "";
            text += "Chunck : " + this.chunck.i + " " + this.chunck.j + " " + this.chunck.k + "<br>";
            text += "IJK : " + this.i + " " + this.j + " " + this.k + "<br>";
            this._debugText.setText(text);

            if (!this._debugOrigin) {
                this._debugOrigin = DebugCross.CreateCross(2, BABYLON.Color3.Green(), this.mesh.absolutePosition);
            }
        }
    }

    public hideDebug(): void {
        if (this._debugText) {
            this._debugText.dispose();
            this._debugText = undefined;
        }
        if (this._debugOrigin) {
            this._debugOrigin.dispose();
            this._debugOrigin = undefined;
        }
    }
}