/// <reference path="./Main.ts"/>

class TileTest extends Main {

    public initializeCamera(): void {
        let camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 10, -20), Main.Scene);
        camera.attachControl(Main.Canvas);
		Main.Camera = camera;
    }

    public async initialize(): Promise<void> {
        await super.initializeScene();
        
        let tile = new Tile(0, 0);
        tile.makeRandom();

        tile.updateTerrainMeshLod0();
    }
}