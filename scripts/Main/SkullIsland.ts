class SkullIsland extends Main {
    
    public async initialize(): Promise<void> {
		await super.initializeScene();
		
		let borderMaterial = new BABYLON.StandardMaterial("border-material", Main.Scene);
		borderMaterial.diffuseColor.copyFromFloats(0.2, 0.2, 0.2);
		borderMaterial.specularColor.copyFromFloats(0.1, 0.1, 0.1);
		let borderXP = BABYLON.MeshBuilder.CreateBox(
			"border-xp",
			{
				width: 2,
				depth: 12 * CHUNCK_SIZE + 2,
				height: 6
			}
		);
		borderXP.position.copyFromFloats(6 * CHUNCK_SIZE + 1, 2, - 1);
		borderXP.material = borderMaterial;
		let borderXM = BABYLON.MeshBuilder.CreateBox(
			"border-xm",
			{
				width: 2,
				depth: 12 * CHUNCK_SIZE + 2,
				height: 6
			}
		);
		borderXM.position.copyFromFloats(- 6 * CHUNCK_SIZE - 1, 2, 1);
		borderXM.material = borderMaterial;
		let borderZP = BABYLON.MeshBuilder.CreateBox(
			"border-zp",
			{
				width: 12 * CHUNCK_SIZE + 2,
				depth: 2,
				height: 6
			}
		);
		borderZP.position.copyFromFloats(1, 2, 6 * CHUNCK_SIZE + 1);
		borderZP.material = borderMaterial;
		let borderZM = BABYLON.MeshBuilder.CreateBox(
			"border-zm",
			{
				width: 12 * CHUNCK_SIZE + 2,
				depth: 2,
				height: 6
			}
		);
		borderZM.position.copyFromFloats(- 1, 2, - 6 * CHUNCK_SIZE - 1);
		borderZM.material = borderMaterial;
		
		let water = BABYLON.MeshBuilder.CreateGround(
			"water",
			{
				width: 12 * CHUNCK_SIZE,
				height: 12 * CHUNCK_SIZE
			},
			Main.Scene
		);
		water.position.y = 4.5;
		let waterMaterial = new BABYLON.StandardMaterial("water-material", Main.Scene);
		waterMaterial.alpha = 0.3;
		waterMaterial.diffuseColor = BABYLON.Color3.FromHexString("#2097c9");
		waterMaterial.specularColor.copyFromFloats(0.1, 0.1, 0.1);
		water.material = waterMaterial;

        let l = 6;
		let manyChuncks = [];
		let savedTerrainString = window.localStorage.getItem("terrain");
		console.log(savedTerrainString);
		if (savedTerrainString) {
			let t0 = performance.now();
			let savedTerrain = JSON.parse(savedTerrainString) as TerrainData;
			Main.ChunckManager.deserialize(savedTerrain);
			for (let i = -l; i <= l; i++) {
				for (let j = -1; j <= 2 * l - 1; j++) {
					for (let k = -l; k <= l; k++) {
						let chunck = Main.ChunckManager.getChunck(i, j, k);
						if (chunck) {
							manyChuncks.push(chunck);
						}
					}
				}
			}
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
			request.open('GET', './datas/scenes/crane_island.json', true);

			request.onload = () => {
				if (request.status >= 200 && request.status < 400) {
					let defaultTerrain = JSON.parse(request.responseText) as TerrainData;
					Main.ChunckManager.deserialize(defaultTerrain);
					for (let i = -l; i <= l; i++) {
						for (let j = -1; j <= 2 * l - 1; j++) {
							for (let k = -l; k <= l; k++) {
								let chunck = Main.ChunckManager.getChunck(i, j, k);
								if (chunck) {
									manyChuncks.push(chunck);
								}
							}
						}
					}
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
		Main.ChunckEditor = new ChunckEditor(Main.ChunckManager);
    }
}