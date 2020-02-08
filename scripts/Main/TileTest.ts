/// <reference path="./Main.ts"/>

class TileTest extends Main {

    public initializeCamera(): void {
        let camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 10, -20), Main.Scene);
        camera.attachControl(Main.Canvas);
		Main.Camera = camera;
    }

    public async initialize(): Promise<void> {
        await super.initializeScene();

        let tileManager = new TileManager();
        
        for (let I = -6; I <= 6; I++) {
            for (let J = -6; J <= 6; J++) {
                await tileManager.updateTile(I, J);
            }
        }
    }
}