/// <reference path="./Main.ts"/>

class TileTest extends Main {

    public initializeCamera(): void {
        let camera = new BABYLON.FreeCamera("camera1", BABYLON.Vector3.Zero(), Main.Scene);
		Main.Camera = camera;
    }

    public async initialize(): Promise<void> {
        await super.initializeScene();
        await TerrainTileVertexData.InitializeData();
        await BrickVertexData.InitializeData();
        await BrickDataManager.InitializeData();

        let player = new Player();
        player.position.y = 30;
        player.register(true);

		let inventory = new Inventory(player);
		inventory.initialize();

		for (let n = 0; n <= Math.random() * 100; n++) {
            inventory.addItem(InventoryItem.Brick("brick-1x1-red"));
        }
		for (let n = 0; n <= Math.random() * 100; n++) {
            inventory.addItem(InventoryItem.Brick("brick-1x2-green"));
        }
		for (let n = 0; n <= Math.random() * 100; n++) {
            inventory.addItem(InventoryItem.Brick("brick-1x4-blue"));
        }
		for (let n = 0; n <= Math.random() * 100; n++) {
            inventory.addItem(InventoryItem.Brick("brick-1x1-black"));
        }
		for (let n = 0; n <= Math.random() * 100; n++) {
            inventory.addItem(InventoryItem.Brick("brick-1x2-black"));
        }
		for (let n = 0; n <= Math.random() * 100; n++) {
            inventory.addItem(InventoryItem.Brick("brick-1x4-black"));
        }
		for (let n = 0; n <= Math.random() * 100; n++) {
            inventory.addItem(InventoryItem.Brick("brick-1x1-white"));
        }
		for (let n = 0; n <= Math.random() * 100; n++) {
            inventory.addItem(InventoryItem.Brick("brick-1x2-white"));
        }
		for (let n = 0; n <= Math.random() * 100; n++) {
            inventory.addItem(InventoryItem.Brick("brick-1x4-white"));
        }
		inventory.update();

        if (Main.Camera instanceof BABYLON.FreeCamera) {
            Main.Camera.parent = player;
            Main.Camera.position.y = 1.25;
		}

        let tileManager = new TileManager();
        Main.Scene.onBeforeRenderObservable.add(tileManager.updateLoop);
    }
}