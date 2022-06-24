class ColorizedTextureLoader {

    public static instance: ColorizedTextureLoader;

    public scene: BABYLON.Scene;
    private _baseTextures: Map<string, ImageData>;
    private _baseColorTextures: Map<string, ImageData>;
    private _colorizedTextures: Map<string, Map<BrickColor, BABYLON.Texture>>;

    constructor(scene: BABYLON.Scene) {
        this.scene = scene;
        this._baseTextures = new Map<string, ImageData>();
        this._baseColorTextures = new Map<string, ImageData>();
        this._colorizedTextures = new Map<string, Map<BrickColor, BABYLON.Texture>>();
        ColorizedTextureLoader.instance = this;
    }

    public loadTexture(url: string): Promise<ImageData> {
        return new Promise<ImageData>(resolve => {
            let img = new Image();
            img.src = url;
            img.onload = () => {
                let canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                let context = canvas.getContext("2d");
                context.drawImage(img, 0, 0);
                let data = context.getImageData(0, 0, canvas.width, canvas.height);
                resolve(data);
            }
        });
    }

    public async get(name: string, color: BrickColor): Promise<BABYLON.Texture> {
        if (this._colorizedTextures.get(name)) {
            if (this._colorizedTextures.get(name).get(color)) {
                return this._colorizedTextures.get(name).get(color)
            }
        }
        else {
            this._colorizedTextures.set(name, new Map<BrickColor, BABYLON.Texture>());
        }
        let baseTexture = this._baseTextures.get(name);
        if (!baseTexture) {
            baseTexture = await this.loadTexture("datas/meshes/" + name + ".png");
            this._baseTextures.set(name, baseTexture);
        }
        let baseColorTexture = this._baseColorTextures.get(name);
        if (!baseColorTexture) {
            baseColorTexture = await this.loadTexture("datas/meshes/" + name + "-color.png");
            this._baseColorTextures.set(name, baseColorTexture);
        }
        if (baseTexture.data.length === baseColorTexture.data.length) {
            let data = [];
            let l = baseTexture.data.length;
            let color4 = BrickDataManager.BrickColors.get(color);
            for (let i = 0; i < l / 4; i++) {
                data[4 * i] = baseTexture.data[4 * i];
                data[4 * i + 1] = baseTexture.data[4 * i + 1];
                data[4 * i + 2] = baseTexture.data[4 * i + 2];
                data[4 * i + 3] = baseTexture.data[4 * i + 3];
                let a = baseColorTexture.data[4 * i + 3] / 255;
                if (a > 0) {
                    data[4 * i] = Math.floor(data[4 * i] * (1 - a) + color4.r * 255 * a);
                    data[4 * i + 1] = Math.floor(data[4 * i + 1] * (1 - a) + color4.g * 255 * a);
                    data[4 * i + 2] = Math.floor(data[4 * i + 2] * (1 - a) + color4.b * 255 * a);
                }
            }
            let texture = new BABYLON.RawTexture(new Uint8Array(data), baseTexture.width, baseTexture.height, BABYLON.Engine.TEXTUREFORMAT_RGBA, this.scene, true, true);
            this._colorizedTextures.get(name).set(color, texture);
            return texture;            
        }
        this._colorizedTextures.get(name).set(color, undefined);
        return undefined;
    }
}