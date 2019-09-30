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
        player.position.y = 100;
        player.register();

		let inventory = new Inventory(player);
		inventory.initialize();
		inventory.addItem(InventoryItem.Cube(CubeType.Dirt));
		inventory.addItem(InventoryItem.Cube(CubeType.Dirt));
		inventory.addItem(InventoryItem.Cube(CubeType.Dirt));
		inventory.addItem(InventoryItem.Cube(CubeType.Dirt));
		inventory.addItem(InventoryItem.Cube(CubeType.Dirt));
		inventory.addItem(InventoryItem.Cube(CubeType.Dirt));
		inventory.addItem(InventoryItem.Cube(CubeType.Dirt));
		inventory.addItem(InventoryItem.Cube(CubeType.Dirt));
		inventory.addItem(InventoryItem.Cube(CubeType.Dirt));
		inventory.addItem(InventoryItem.Cube(CubeType.Dirt));
		inventory.addItem(InventoryItem.Cube(CubeType.Rock));
		inventory.addItem(InventoryItem.Cube(CubeType.Rock));
		inventory.addItem(InventoryItem.Cube(CubeType.Rock));
		inventory.addItem(InventoryItem.Cube(CubeType.Rock));
		inventory.addItem(InventoryItem.Cube(CubeType.Rock));
		inventory.addItem(InventoryItem.Cube(CubeType.Rock));
		inventory.addItem(InventoryItem.Cube(CubeType.Rock));
		inventory.addItem(InventoryItem.Cube(CubeType.Rock));
		inventory.addItem(InventoryItem.Cube(CubeType.Rock));
		inventory.addItem(InventoryItem.Cube(CubeType.Rock));
		inventory.addItem(InventoryItem.Cube(CubeType.Sand));
		inventory.addItem(InventoryItem.Cube(CubeType.Sand));
		inventory.addItem(InventoryItem.Cube(CubeType.Sand));
		inventory.addItem(InventoryItem.Cube(CubeType.Sand));
		inventory.addItem(InventoryItem.Cube(CubeType.Sand));
		inventory.addItem(InventoryItem.Block("wall"));
		inventory.addItem(InventoryItem.Block("wall"));
		inventory.addItem(InventoryItem.Block("wall"));
		inventory.addItem(InventoryItem.Block("wall"));
		inventory.addItem(InventoryItem.Block("wall"));
		inventory.addItem(InventoryItem.Block("wall"));
		inventory.addItem(InventoryItem.Block("wall"));
		inventory.addItem(InventoryItem.Block("wall"));
		inventory.addItem(InventoryItem.Block("wall-hole"));
		inventory.addItem(InventoryItem.Block("wall-hole"));
		inventory.addItem(InventoryItem.Block("wall-hole"));
		inventory.addItem(InventoryItem.Block("wall-hole"));
		inventory.addItem(InventoryItem.Block("wall-corner-out"));
		inventory.addItem(InventoryItem.Block("wall-corner-out"));
		inventory.addItem(InventoryItem.Block("brick-1-1-1"));
		inventory.addItem(InventoryItem.Block("brick-1-1-1"));
		inventory.addItem(InventoryItem.Block("brick-1-1-1"));
		inventory.addItem(InventoryItem.Block("brick-1-1-1"));
		inventory.addItem(InventoryItem.Block("brick-1-1-2"));
		inventory.addItem(InventoryItem.Block("brick-1-1-2"));
		inventory.addItem(InventoryItem.Block("brick-1-1-2"));
		inventory.addItem(InventoryItem.Block("brick-1-1-4"));
		inventory.addItem(InventoryItem.Block("brick-1-1-4"));
		inventory.addItem(InventoryItem.Block("brick-1-1-4"));
		inventory.addItem(InventoryItem.Block("ramp-1-1-2"));
		inventory.addItem(InventoryItem.Block("ramp-1-1-2"));
		inventory.addItem(InventoryItem.Block("ramp-1-1-2"));
		inventory.addItem(InventoryItem.Block("ramp-1-1-4"));
		inventory.addItem(InventoryItem.Block("guard"));
		inventory.addItem(InventoryItem.Block("guard"));
		inventory.addItem(InventoryItem.Block("guard-corner"));
		inventory.addItem(InventoryItem.Block("guard-corner"));
		inventory.update();

        if (Main.Camera instanceof BABYLON.FreeCamera) {
            Main.Camera.parent = player;
            Main.Camera.position.y = 1.25;
        }
    }
}