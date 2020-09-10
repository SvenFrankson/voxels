abstract class Chunck extends BABYLON.Mesh {
    public isEmpty: boolean = true;

    public faces: Face[] = [];
    public vertices: Vertex[] = [];
    public cubes: Cube[][][] = [];

    public blocks: Block[] = [];

    constructor(
        public manager: ChunckManager,
        public i: number,
        public j: number,
        public k: number
    ) {
        super("chunck_" + i + "_" + j + "_" + k);
    }

    public static ConstructChunck(manager: ChunckManager, i: number, j: number, k: number): Chunck {
        return new Chunck_V2(manager, i, j, k);
    }

    public getCube(i: number, j: number, k: number): Cube {
        return this.manager.getCube(this.i * CHUNCK_SIZE + i, this.j * CHUNCK_SIZE + j, this.k * CHUNCK_SIZE + k);
    }

    public setCube(i: number, j: number, k: number, cubeType?: CubeType): void {
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

    public fatCube(): void {
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

    public generateRandom(): void {
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
    
    public makeEmpty(): void {
        this.cubes = [];
        for (let i = 0; i < CHUNCK_SIZE; i++) {
            this.cubes[i] = [];
            for (let j = 0; j < CHUNCK_SIZE; j++) {
                this.cubes[i][j] = [];
            }
        }
        
        this.isEmpty = false;
    }

    public generateFull(cubeType?: CubeType): void {
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

    public randomizeNiceDouble(): void {
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

    public generateTerrain(): void {
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

    public async generate(): Promise<void> {

    }

    public addBlock(block: Block): void {
        block.chunck = this;
        let i = this.blocks.indexOf(block);
        if (i === -1) {
            this.blocks.push(block);
        }
    }

    public removeBlock(block: Block): void {
        let i = this.blocks.indexOf(block);
        if (i !== -1) {
            this.blocks.splice(i, 1);
        }
    }

    public serialize(): ChunckData {
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
        let brickDatas = [];
        if (this instanceof Chunck_V2) {
            for (let i = 0; i < this.bricks.length; i++) {
                brickDatas.push(this.bricks[i].serialize());
            }
        }
        return {
            i: this.i,
            j: this.j,
            k: this.k,
            data: data,
            blocks: blockDatas,
            bricks: brickDatas
        };
    }

    public deserialize(data: ChunckData): void {
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
        if (data.bricks && this instanceof Chunck_V2) {
            for (let b = 0; b < data.bricks.length; b++) {
                let brick = new Brick();
                brick.deserialize(data.bricks[b]);
                this.addBrick(brick);
            }
        }
    }
}