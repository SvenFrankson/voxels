/// <reference path="./Main.ts"/>

class PlayerTest extends Main {

    public initializeCamera(): void {
        let camera = new BABYLON.FreeCamera("camera1", BABYLON.Vector3.Zero(), Main.Scene);
		Main.Camera = camera;
    }

    public async initialize(): Promise<void> {
        await super.initializeScene();
        //Main.ChunckEditor.saveSceneName = "player-test";
        let l = 2;
		let manyChuncks = [];
		let savedTerrainString = window.localStorage.getItem("player-test");
		if (savedTerrainString) {
			let t0 = performance.now();
			let savedTerrain = JSON.parse(savedTerrainString) as TerrainData;
			Main.ChunckManager.deserialize(savedTerrain);
			Main.ChunckManager.foreachChunck(
				chunck => {
					manyChuncks.push(chunck);
				}
			);
			let loopOut = async () => {
				await Main.ChunckManager.generateManyChuncks(manyChuncks);
				let t1 = performance.now();
				console.log("Scene loaded from local storage in " + (t1 - t0).toFixed(1) + " ms");
			}
			loopOut();
		}
		else {
			let t0 = performance.now();
			var request = new XMLHttpRequest();
			request.open('GET', './datas/scenes/island.json', true);

			request.onload = () => {
				if (request.status >= 200 && request.status < 400) {
					let defaultTerrain = JSON.parse(request.responseText) as TerrainData;
					Main.ChunckManager.deserialize(defaultTerrain);
					Main.ChunckManager.foreachChunck(
						chunck => {
							manyChuncks.push(chunck);
						}
					);
					let loopOut = async () => {
						await Main.ChunckManager.generateManyChuncks(manyChuncks);
						let t1 = performance.now();
						console.log("Scene loaded from file in " + (t1 - t0).toFixed(1) + " ms");
					}
					loopOut();
				} else {
					alert("Scene file not found. My bad. Sven.")
				}
			};

			request.onerror = () => {
				alert("Unknown error. My bad. Sven.")
			};

			request.send();
		}
        
        let player = new Player();
        player.position.y = 60;
        player.register();

		let inventory = new Inventory(player);
		inventory.initialize();

		let inventoryEditBlock = new InventoryItem();
		inventoryEditBlock.name = "EditBlock";
		inventoryEditBlock.section = InventorySection.Action;
		inventoryEditBlock.iconUrl = "./datas/textures/miniatures/move-arrow.png";
		inventoryEditBlock.playerAction = PlayerActionTemplate.EditBlockAction();
		inventory.addItem(inventoryEditBlock);

		for (let i = 0; i <= Math.random() * 100; i++) {
			inventory.addItem(InventoryItem.Cube(CubeType.Dirt));
		}
		for (let i = 0; i <= Math.random() * 100; i++) {
			inventory.addItem(InventoryItem.Cube(CubeType.Rock));
		}
		for (let i = 0; i <= Math.random() * 100; i++) {
			inventory.addItem(InventoryItem.Cube(CubeType.Sand));
		}
		for (let i = 0; i < BlockList.References.length; i++) {
			let reference = BlockList.References[i];
			for (let n = 0; n <= Math.random() * 100; n++) {
				inventory.addItem(InventoryItem.Block(reference));
			}
		}
		inventory.update();

        if (Main.Camera instanceof BABYLON.FreeCamera) {
            Main.Camera.parent = player;
            Main.Camera.position.y = 1.25;
		}
		
		let walker = new Walker("walker");
		await walker.instantiate();
		let dx = -16 + 8 * Math.random();
		let dz = -8 * Math.random();
		walker.body.position.copyFromFloats(0 + dx, 18, 8 + dz);
		walker.leftFoot.position.copyFromFloats(-2 + dx, 15, 7 + dz);
		walker.rightFoot.position.copyFromFloats(2 + dx, 15, 7 + dz);

		Main.Scene.onBeforeRenderObservable.add(
			() => {
				walker.target.copyFrom(player.position);
				walker.target.y += 1.7;
			}
		)
    }
}