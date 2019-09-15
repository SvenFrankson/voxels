class VertexCubeType {

    public values: number[];
    public sourceCount: number = 0;

    constructor() {
        this.values = [0, 0, 0];
    }

    public getColor(): BABYLON.Color3 {
        return new BABYLON.Color3(this.values[0], this.values[1], this.values[2]);
    }

    public getColorAsArray(): number[] {
        return this.values;
    }

    public copyFrom(other: VertexCubeType): VertexCubeType {
        for (let i = 0; i < this.values.length; i++) {
            this.values[i] = other.values[i];
        }
        return this;
    }

    public clone(): VertexCubeType {
        let c = new VertexCubeType();
        c.values = [...this.values];
        return c;
    }

    public addCubeType(cubeType: CubeType): void {
        this.sourceCount++;
        this.values[cubeType] = this.values[cubeType] * (1 - 1 / this.sourceCount) + 1 / this.sourceCount;
    }

    public addInPlace(other: VertexCubeType): void {
        for (let i = 0; i < this.values.length; i++) {
            this.values[i] += other.values[i];
        }
    }

    public scaleInPlace(n: number): void {
        for (let i = 0; i < this.values.length; i++) {
            this.values[i] *= n;
        }
    }

    public lerpInPlace(other: VertexCubeType, distance: number): void {
        for (let i = 0; i < this.values.length; i++) {
            this.values[i] = this.values[i] * (1 - distance) + other.values[i] * distance;
        }
    }
}

class Vertex {

    public index: number;
    public links: Vertex[] = [];
    public faces: Face[] = [];
    public position: BABYLON.Vector3;
    public smoothedPosition: BABYLON.Vector3;

    public cubeTypes: VertexCubeType = new VertexCubeType();
    public smoothedCubeTypes: VertexCubeType = new VertexCubeType();

    constructor(
        public i: number,
        public j: number,
        public k: number
    ) {
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

    public connect(v: Vertex) {
        if (v) {
            if (this.links.indexOf(v) === -1) {
                this.links.push(v);
            }
            if (v.links.indexOf(this) === -1) {
                v.links.push(this);
            }
        }
    }

    public addCubeType(ct: CubeType): void {
        this.cubeTypes.addCubeType(ct);
    }

    public smooth(factor: number): void {
        this.smoothedCubeTypes.copyFrom(this.cubeTypes);
        this.smoothedPosition.copyFrom(this.position);
        for (let i = 0; i < this.links.length; i++) {
            this.smoothedPosition.addInPlace(this.links[i].position.scale(factor));
            this.smoothedCubeTypes.addInPlace(this.links[i].cubeTypes);
        }
        this.smoothedPosition.scaleInPlace(1 / (this.links.length * factor + 1));
        this.smoothedCubeTypes.scaleInPlace(1 / (this.links.length * factor + 1));
    }

    public applySmooth() {
        this.position.copyFrom(this.smoothedPosition);
        this.cubeTypes.copyFrom(this.smoothedCubeTypes);
    }
}