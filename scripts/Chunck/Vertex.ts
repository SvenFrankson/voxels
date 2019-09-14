class Vertex {

    public index: number;
    public links: Vertex[] = [];
    public faces: Face[] = [];
    public position: BABYLON.Vector3;
    public smoothedPosition: BABYLON.Vector3;

    public cubeTypes: number[] = [0, 0, 0];
    public smoothedCubeTypes: number[] = [0, 0, 0];
    public colorSources: number = 0;

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
        if (this.colorSources === 0) {
            this.cubeTypes[ct] = 1;
            this.colorSources = 1;
        }
        else {
            this.colorSources++;
            for (let i = 0; i < this.cubeTypes.length; i++) {
                this.cubeTypes[i] = this.cubeTypes[i] * (1 - 1 / this.colorSources) + (ct === i ? 1 : 0) / this.colorSources;
            }
        }
    }

    public smooth(factor: number): void {
        this.smoothedCubeTypes = [...this.cubeTypes];
        this.smoothedPosition.copyFrom(this.position);
        for (let i = 0; i < this.links.length; i++) {
            this.smoothedPosition.addInPlace(this.links[i].position.scale(factor));
            for (let j = 0; j < this.smoothedCubeTypes.length; j++) {
                this.smoothedCubeTypes[j] += this.links[i].cubeTypes[j] * factor;
            }
        }
        this.smoothedPosition.scaleInPlace(1 / (this.links.length * factor + 1));
        for (let i = 0; i < this.smoothedCubeTypes.length; i++) {
            this.smoothedCubeTypes[i] /= (this.links.length * factor + 1);
        }
    }

    public applySmooth() {
        this.position.copyFrom(this.smoothedPosition);
        this.cubeTypes = [...this.smoothedCubeTypes];
    }
}