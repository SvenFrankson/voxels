class ChunckManager {

    public chuncks: Map<number, Map<number, Map<number, Chunck>>> = new Map<number, Map<number, Map<number, Chunck>>>();

    constructor() {

    }

    public generateRandom(d: number = 1): void {
        this.generateAroundZero(d);
        for (let i = - d; i <= d; i++) {
            let mapMapChuncks = this.chuncks.get(i);
            for (let j = - d; j <= d; j++) {
                let mapChuncks = mapMapChuncks.get(j);
                for (let k = - d; k <= d; k++) {
                    mapChuncks.get(k).generateRandom();
                }
            }
        }
    }

    public generateTerrain(d: number = 2): void {
        this.generateAroundZero(d);
        for (let i = - d * CHUNCK_SIZE; i <= d * CHUNCK_SIZE; i++) {
            for (let k = - d * CHUNCK_SIZE; k <= d * CHUNCK_SIZE; k++) {
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

    public getChunck(i: number, j: number, k: number): Chunck {
        let mapMapChuncks = this.chuncks.get(i);
        if (mapMapChuncks) {
            let mapChuncks = mapMapChuncks.get(j);
            if (mapChuncks) {
                return mapChuncks.get(k);
            }
        }
    }

    public getCube(I: number, J: number, K: number): Cube {
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

    public setChunckCube(chunck: Chunck, i: number, j: number, k: number, cubeType: CubeType, redraw: boolean = false): void {
        this.setCube(
            chunck.i * CHUNCK_SIZE + i,
            chunck.j * CHUNCK_SIZE + j,
            chunck.k * CHUNCK_SIZE + k,
            cubeType,
            redraw
        );
    }

    public setCube(I: number, J: number, K: number, cubeType: CubeType, redraw: boolean = false): void {
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
                
                let i0 = iCube === 0 ? - 1 : 0;
                let i1 = iCube === (CHUNCK_SIZE - 1) ? 1 : 0;
                let j0 = jCube === 0 ? - 1 : 0;
                let j1 = jCube === (CHUNCK_SIZE - 1) ? 1 : 0;
                let k0 = kCube === 0 ? - 1 : 0;
                let k1 = kCube === (CHUNCK_SIZE - 1) ? 1 : 0;

                for (let i = i0; i <= i1; i++) {
                    for (let j = j0; j <= j1; j++) {
                        for (let k = k0; k <= k1; k++) {
                            let redrawnChunck = this.getChunck(i + iChunck, j + jChunck, k + kChunck);
                            if (redrawnChunck) {
                                redrawnChunck.generateVertices();
                                redrawnChunck.generateFaces();
                            }
                        }
                    }
                }
            }
        }
    }

    public generateAroundZero(d: number): void {
        for (let i = - d; i <= d; i++) {
            let mapMapChuncks = new Map<number, Map<number, Chunck>>()
            this.chuncks.set(i, mapMapChuncks);
            for (let j = - d; j <= d; j++) {
                let mapChuncks = new Map<number, Chunck>()
                mapMapChuncks.set(j, mapChuncks);
                for (let k = - d; k <= d; k++) {
                    let chunck = new Chunck(this, i, j, k);
                    mapChuncks.set(k, chunck);
                }
            }
        }
    }
}