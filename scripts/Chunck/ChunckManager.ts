interface ChunckData {
    i: number;
    j: number;
    k: number;
    data: string;
    blocks: BlockData[];
}

interface TerrainData {
    chuncks: ChunckData[];
}

class ChunckManager {

    public chuncks: Map<number, Map<number, Map<number, Chunck>>> = new Map<number, Map<number, Map<number, Chunck>>>();
    public updateBuffer: Chunck[] = [];

    constructor() {
        Main.Scene.onBeforeRenderObservable.add(this.updateChunck);
    }

    public updateChunck = () => {
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
    }

    public async generateManyChuncks(chuncks: Chunck[]): Promise<void> {
        return new Promise<void>(
            resolve => {
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
                }
                step();
            }
        );
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

    public generateFromMesh(
        skullMesh: BABYLON.Mesh,
        rockMesh: BABYLON.Mesh,
        sandMesh: BABYLON.Mesh,
        dirtMesh: BABYLON.Mesh,
        d: number = 2
    ): void {
        this.generateAboveZero(d);
        for (let i = - 3 * CHUNCK_SIZE; i < 3 * CHUNCK_SIZE; i++) {
            for (let j = - CHUNCK_SIZE; j < 2 * 3 * CHUNCK_SIZE; j++) {
                for (let k = - 3 * CHUNCK_SIZE; k < 3 * CHUNCK_SIZE; k++) {
                    let p = new BABYLON.Vector3(
                        i + 0.5,
                        j + 0.5,
                        k + 0.5
                    );
                    let dir = p.subtract(new BABYLON.Vector3(0, 20, 0)).normalize();
                    let r = new BABYLON.Ray(p, dir);
                    if (r.intersectsMesh(skullMesh).hit) {
                        this.setCube(i, j, k, CubeType.Rock);
                    }
                }
            }
        }
        for (let i = - d * CHUNCK_SIZE; i < d * CHUNCK_SIZE; i++) {
            for (let k = - d * CHUNCK_SIZE; k < d * CHUNCK_SIZE; k++) {
                for (let j =  2 * d * CHUNCK_SIZE; j >= - CHUNCK_SIZE; j--) {
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
        for (let i = - d * CHUNCK_SIZE; i < d * CHUNCK_SIZE; i++) {
            for (let k = - d * CHUNCK_SIZE; k < d * CHUNCK_SIZE; k++) {
                let p = new BABYLON.Vector3(
                    i + 0.5,
                    100,
                    k + 0.5
                );
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
        for (let i = - d * CHUNCK_SIZE; i < d * CHUNCK_SIZE; i++) {
            for (let k = - d * CHUNCK_SIZE; k < d * CHUNCK_SIZE; k++) {
                let p = new BABYLON.Vector3(
                    i + 0.5,
                    100,
                    k + 0.5
                );
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
        for (let i = - d * CHUNCK_SIZE; i < d * CHUNCK_SIZE; i++) {
            for (let k = - d * CHUNCK_SIZE; k < d * CHUNCK_SIZE; k++) {
                let p = new BABYLON.Vector3(
                    i + 0.5,
                    100,
                    k + 0.5
                );
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

    public generateTerrain(d: number = 2): void {
        this.generateAroundZero(d);
        for (let i = - d * CHUNCK_SIZE; i < d * CHUNCK_SIZE; i++) {
            for (let k = - d * CHUNCK_SIZE; k < d * CHUNCK_SIZE; k++) {
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

    public generateHeightFunction(d: number, heightFunction: (x: number, y: number) => number): void {
        this.generateAroundZero(d);
        for (let i = - d * CHUNCK_SIZE; i < d * CHUNCK_SIZE; i++) {
            for (let k = - d * CHUNCK_SIZE; k < d * CHUNCK_SIZE; k++) {
                let h = Math.floor(heightFunction(i, k));
                let hDirt = Math.floor(Math.random() * 3 + 0.5);
                for (let j = - d * CHUNCK_SIZE; j <= h - hDirt; j++) {
                    this.setCube(i, j, k, CubeType.Rock);
                }
                for (let j = h - hDirt + 1; j <= h; j++) {
                    this.setCube(i, j, k, CubeType.Dirt);
                }
            }
        }
    }

    public createChunck(i: number, j: number, k: number): Chunck {
        let mapMapChuncks = this.chuncks.get(i);
        if (!mapMapChuncks) {
            mapMapChuncks = new Map<number, Map<number, Chunck>>();
            this.chuncks.set(i, mapMapChuncks);
        }
        let mapChuncks = mapMapChuncks.get(j);
        if (!mapChuncks) {
            mapChuncks = new Map<number, Chunck>();
            mapMapChuncks.set(j, mapChuncks);
        }
        let chunck = mapChuncks.get(k);
        if (!chunck) {
            chunck = Chunck.ConstructChunck(this, i, j, k);
            mapChuncks.set(k, chunck);
        }
        return chunck;
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

    public setChunckCube(chunck: Chunck, i: number, j: number, k: number, cubeType: CubeType, r: number = 0, redraw: boolean = false): void {
        this.setCube(
            chunck.i * CHUNCK_SIZE + i,
            chunck.j * CHUNCK_SIZE + j,
            chunck.k * CHUNCK_SIZE + k,
            cubeType,
            r,
            redraw
        );
    }

    public setCube(I: number, J: number, K: number, cubeType: CubeType, r: number = 0, redraw: boolean = false): void {
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
            for (let II = - r; II <= r; II++) {
                for (let JJ = - r; JJ <= r; JJ++) {
                    for (let KK = - r; KK <= r; KK++) {
                        this.setCube(I + II, J + JJ, K + KK, cubeType, 0, false);
                    }
                }
            }
            if (redraw) {
                this.redrawZone(I - 1 - r, J - 1 - r, K - 1 - r, I + 1 + r, J + 1 + r, K + 1 + r);
            }
        }
    }

    public redrawZone(IMin: number, JMin: number, KMin: number, IMax: number, JMax: number, KMax: number): void {
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

    public generateAroundZero(d: number): void {
        for (let i = - d; i <= d; i++) {
            let mapMapChuncks = new Map<number, Map<number, Chunck>>()
            this.chuncks.set(i, mapMapChuncks);
            for (let j = - d; j <= d; j++) {
                let mapChuncks = new Map<number, Chunck>()
                mapMapChuncks.set(j, mapChuncks);
                for (let k = - d; k <= d; k++) {
                    let chunck = Chunck.ConstructChunck(this, i, j, k);
                    mapChuncks.set(k, chunck);
                }
            }
        }
    }

    public generateAboveZero(d: number): void {
        for (let i = - d; i <= d; i++) {
            let mapMapChuncks = new Map<number, Map<number, Chunck>>()
            this.chuncks.set(i, mapMapChuncks);
            for (let j = - 1; j <= 2 * d - 1; j++) {
                let mapChuncks = new Map<number, Chunck>()
                mapMapChuncks.set(j, mapChuncks);
                for (let k = - d; k <= d; k++) {
                    let chunck = Chunck.ConstructChunck(this, i, j, k);
                    mapChuncks.set(k, chunck);
                }
            }
        }
    }

    public foreachChunck(callback: (chunck: Chunck) => void): void {
        this.chuncks.forEach(
            m => {
                m.forEach(
                    mm => {
                        mm.forEach(
                            chunck => {
                                callback(chunck);
                            }
                        )
                    }
                )
            }
        );
    }

    public serialize(): TerrainData {
        let data = {
            chuncks: []
        };
        this.chuncks.forEach(
            m => {
                m.forEach(
                    mm => {
                        mm.forEach(
                            chunck => {
                                data.chuncks.push(chunck.serialize());
                            }
                        )
                    }
                )
            }
        );
        return data;
    }

    public deserialize(data: TerrainData): void {
        for (let i = 0; i < data.chuncks.length; i++) {
            let d = data.chuncks[i];
            if (d) {
                this.createChunck(d.i, d.j, d.k).deserialize(d);
            }
        }
    }
}