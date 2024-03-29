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
        BrickDataManager.InitializeProceduralData();
        await BrickDataManager.InitializeDataFromFile();

        let player = new Player();
        player.position.y = 30;
        player.register(true);

		let inventory = new Inventory(player);
        inventory.initialize();
        
        for (let i = 0; i < 20; i++) {
            let type = BrickType.Concrete;
            let brickName = BrickDataManager.BrickNames[Math.floor(Math.random() * BrickDataManager.BrickNames.length)];
            let count = Math.floor(Math.random() * 9 + 2);
            for (let n = 0; n < count; n++) {
                inventory.addItem(await InventoryItem.Brick({ name: brickName, type: type, color: Brick.DefaultColor(type) }));
            }
        }
        player.playerActionManager.linkAction(inventory.items[0].playerAction, 1);

		inventory.update();

        if (Main.Camera instanceof BABYLON.FreeCamera) {
            Main.Camera.parent = player;
            Main.Camera.position.y = 1.25;
		}

        let tileManager = new TileManager();
        Main.Scene.onBeforeRenderObservable.add(tileManager.updateLoop);
    }
}