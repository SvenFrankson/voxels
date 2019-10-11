/// <reference path="./Main.ts"/>

class PlayerTest extends Main {

    public initializeCamera(): void {
        let camera = new BABYLON.FreeCamera("camera1", BABYLON.Vector3.Zero(), Main.Scene);
		Main.Camera = camera;
    }

    public async initialize(): Promise<void> {
        await super.initializeScene();
        //Main.ChunckEditor.saveSceneName = "player-test";
        let l = 5;
		let savedTerrainString = window.localStorage.getItem("player-test");
		if (savedTerrainString) {
			let t0 = performance.now();
			let savedTerrain = JSON.parse(savedTerrainString) as TerrainData;
			Main.ChunckManager.deserialize(savedTerrain);
			Main.ChunckManager.foreachChunck(
				chunck => {
					Main.ChunckManager.updateBuffer.push(chunck);
				}
			);
			console.log("Scene loaded from local storage");
		}
		else {
			let t0 = performance.now();
			let f = [];
			for (let i = 0; i < 6; i++) {
				f[i] = Math.random() * i + 2;
				if (Math.random() < 0.5) {
					f[i] *= - 1;
				}
			}
			
			Main.ChunckManager.generateHeightFunction(
				l,
				(i, j) => {
					return Math.cos(i / f[0] + j / f[1]) * 0.5 + Math.sin(i / f[2] + j / f[3]) * 1 + Math.cos(i / f[4] + j / f[5]) * 1.5 - 0.5 + Math.random();
				}
			);
			Main.ChunckManager.foreachChunck(
				chunck => {
					Main.ChunckManager.updateBuffer.push(chunck);
				}
			);
			console.log("Scene generated");
			/*
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
			*/
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

		let inventoryCreateMountainSmall = new InventoryItem();
		inventoryCreateMountainSmall.name = "CreateMountainSmall";
		inventoryCreateMountainSmall.section = InventorySection.Action;
		inventoryCreateMountainSmall.iconUrl = "./datas/textures/miniatures/move-arrow.png";
		inventoryCreateMountainSmall.playerAction = PlayerActionTemplate.CreateMountainAction(3, 3, 0.6);
		inventory.addItem(inventoryCreateMountainSmall);

		let inventoryCreateMountainTall = new InventoryItem();
		inventoryCreateMountainTall.name = "CreateMountainTall";
		inventoryCreateMountainTall.section = InventorySection.Action;
		inventoryCreateMountainTall.iconUrl = "./datas/textures/miniatures/move-arrow.png";
		inventoryCreateMountainTall.playerAction = PlayerActionTemplate.CreateMountainAction(2, 7, 0.9);
		inventory.addItem(inventoryCreateMountainTall);

		let inventoryCreateMountainLarge = new InventoryItem();
		inventoryCreateMountainLarge.name = "CreateMountainLarge";
		inventoryCreateMountainLarge.section = InventorySection.Action;
		inventoryCreateMountainLarge.iconUrl = "./datas/textures/miniatures/move-arrow.png";
		inventoryCreateMountainLarge.playerAction = PlayerActionTemplate.CreateMountainAction(5, 5, 0.6);
		inventory.addItem(inventoryCreateMountainLarge);

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
		
		setTimeout(
			async () => {
				let walker = new Walker("walker");
				await walker.instantiate();
				
				let point: BABYLON.Vector3;
				while (!point) {
					let ray = new BABYLON.Ray(
						new BABYLON.Vector3(- 50 + 100 * Math.random(), 100, - 50 + 100 * Math.random()),
						new BABYLON.Vector3(0, - 1, 0)
					);
					let pick = Main.Scene.pickWithRay(
						ray,
						(m) => {
							return m instanceof Chunck;
						}
					);
					if (pick.hit) {
						point = pick.pickedPoint;
					}
				}
				walker.target = BABYLON.Vector3.Zero();
				walker.target.y += 2.5;
				
				walker.body.position.copyFrom(point);
				walker.body.position.y += 4;
				walker.body.position.addInPlaceFromFloats(
					Math.random(),
					Math.random(),
					Math.random()
				)
				walker.leftFoot.position.copyFrom(point);
				walker.leftFoot.position.x -= 2;
				walker.leftFoot.position.addInPlaceFromFloats(
					Math.random(),
					Math.random(),
					Math.random()
				)
				walker.rightFoot.position.copyFrom(point);
				walker.rightFoot.position.x += 2;
				walker.rightFoot.position.addInPlaceFromFloats(
					Math.random(),
					Math.random(),
					Math.random()
				)
				
				setInterval(
					() => {
						let point: BABYLON.Vector3;
						while (!point) {
							let ray = new BABYLON.Ray(
								new BABYLON.Vector3(- 50 + 100 * Math.random(), 100, - 50 + 100 * Math.random()),
								new BABYLON.Vector3(0, - 1, 0)
							);
							let pick = Main.Scene.pickWithRay(
								ray,
								(m) => {
									return m instanceof Chunck;
								}
							);
							if (pick.hit) {
								point = pick.pickedPoint;
							}
						}
						walker.target = point;
						walker.target.y += 2.5;
					},
					15000
				)
			},
			12000
		)
    }
}