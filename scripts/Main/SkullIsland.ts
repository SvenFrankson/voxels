class SkullIsland extends Main {
    
    public async initialize(): Promise<void> {
        await super.initializeScene();
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