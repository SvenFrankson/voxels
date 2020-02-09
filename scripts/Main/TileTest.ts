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
        Main.Scene.onBeforeRenderObservable.add(tileManager.updateLoop);
    }
}