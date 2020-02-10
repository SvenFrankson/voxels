class TerrainTileTexture extends BABYLON.DynamicTexture {

    public static LodResolutions: number[] = [256, 128, 64, 32];
    public static TerrainColors: string[] = [
        "#47a632",
        "#a86f32",
        "#8c8c89",
        "#dbc67b"
    ];

    public static debugTextures: BABYLON.StandardMaterial[] = [];

    constructor(public tile: Tile, private _size: number = 32) {
        super(tile.name + "-texture-" + _size, _size, Main.Scene, true);
    }

    public resize(): boolean {
        if (this._size !== TerrainTileTexture.LodResolutions[this.tile.currentLOD]) {
            let resizedTexture = new TerrainTileTexture(this.tile, TerrainTileTexture.LodResolutions[this.tile.currentLOD]);
            this.tile.tileTexture = resizedTexture;
            resizedTexture.redraw();
            this.dispose();
            return true;
        }
        return false;
    }

    public redraw(): void {
        if (this.resize()) {
            return;
        }
        let context = this.getContext();
        let types = this.tile.types;
        
        let w = this._size / TILE_SIZE;

        for (let j = 0; j < TILE_SIZE; j++) {
            for (let i = 0; i < TILE_SIZE; i++) {
                let t1 = types[i][j];
                let t2 = types[i + 1][j];
                let t3 = types[i + 1][j + 1];
                let t4 = types[i][j + 1];

                let values = [t1, t2, t3, t4].sort((a, b) => { return a - b; });
                
                let max = - 1;
                let maxOcc = -1;
                for (let ii = 0; ii < 4; ii++) {
                    let occ = 1;
                    for (let jj = 0; jj < 4; jj++) {
                        if (ii != jj) {
                            if (values[ii] === values[jj]) {
                                occ++;
                            }
                        }
                    }
                    if (occ > maxOcc) {
                        max = values[ii];
                        maxOcc = occ;
                    }
                }

                let color = TerrainTileTexture.TerrainColors[max];
                context.fillStyle = color;
                context.fillRect(i * w, (TILE_SIZE - 1 - j) * w, w, w);

                if (t1 !== max) {
                    let color = TerrainTileTexture.TerrainColors[t1];
                    context.fillStyle = color;
                    if (t1 !== t2 && t1 !== t4) {
                        context.beginPath();
                        context.moveTo(i * w, (TILE_SIZE - j) * w);
                        context.arc(i * w, (TILE_SIZE - j) * w, w * 0.5, 1.5 * Math.PI, 0);
                        context.lineTo(i * w, (TILE_SIZE - j) * w);
                        context.fill();
                    }
                    if (t1 === t2 && t1 != t4) {
                        context.fillRect(i * w, (TILE_SIZE - 1 - j) * w + 0.5 * w, w, w * 0.5);
                    }
                    if (t1 != t2 && t1 === t4) {
                        context.fillRect(i * w, (TILE_SIZE - 1 - j) * w, w * 0.5, w);
                    }
                }
                if (t2 !== max) {
                    let color = TerrainTileTexture.TerrainColors[t2];
                    context.fillStyle = color;
                    if (t2 !== t1 && t2 !== t3) {
                        context.beginPath();
                        context.moveTo((i + 1) * w, (TILE_SIZE - j) * w);
                        context.arc((i + 1) * w, (TILE_SIZE - j) * w, w * 0.5, Math.PI, 1.5 * Math.PI);
                        context.lineTo((i + 1) * w, (TILE_SIZE - j) * w);
                        context.fill();
                    }
                    if (t2 === t3) {
                        context.fillRect(i * w + 0.5 * w, (TILE_SIZE - 1 - j) * w, w * 0.5, w);
                    }
                }
                if (t3 !== max) {
                    let color = TerrainTileTexture.TerrainColors[t3];
                    context.fillStyle = color;
                    if (t3 !== t2 && t3 !== t4) {
                        context.beginPath();
                        context.moveTo((i + 1) * w, (TILE_SIZE - 1 - j) * w);
                        context.arc((i + 1) * w, (TILE_SIZE - 1 - j) * w, w * 0.5, 0.5 * Math.PI, Math.PI);
                        context.lineTo((i + 1) * w, (TILE_SIZE - 1 - j) * w);
                        context.fill();
                    }
                    if (t3 === t4) {
                        context.fillRect(i * w, (TILE_SIZE - 1 - j) * w, w, w * 0.5);
                    }
                }
                if (t4 !== max) {
                    if (t4 !== t1 && t4 !== t3) {
                        let color = TerrainTileTexture.TerrainColors[t4];
                        context.fillStyle = color;
                        context.beginPath();
                        context.moveTo(i * w, (TILE_SIZE - 1 - j) * w);
                        context.arc(i * w, (TILE_SIZE - 1 - j) * w, w * 0.5, 0, 0.5 * Math.PI);
                        context.lineTo(i * w, (TILE_SIZE - 1 - j) * w);
                        context.fill();
                    }
                }
            }
        }

        this.update();
    }
}