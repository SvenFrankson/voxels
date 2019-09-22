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
			for (let i = -l; i <= l; i++) {
				for (let j = -1; j <= l; j++) {
					for (let k = -l; k <= l; k++) {
						let chunck = Main.ChunckManager.createChunck(i, j, k);
						if (chunck) {
							manyChuncks.push(chunck);
						}
					}
				}
            }
            for (let i = - l; i <= l; i++) {
                for (let k = - l; k <= l; k++) {
                    let chunck = Main.ChunckManager.getChunck(i, - 1, k);
                    chunck.generateFull(CubeType.Dirt);
                    chunck = Main.ChunckManager.getChunck(i, 0, k);
                    chunck.generateFull(CubeType.Dirt);
                }
            }
			let loopOut = async () => {
                console.log(manyChuncks.length);
				await Main.ChunckManager.generateManyChuncks(manyChuncks);
				let t1 = performance.now();
				console.log("Scene generated in " + (t1 - t0).toFixed(1) + " ms");
			}
			loopOut();
		}
		
		let pauseMenu = new PauseMenu();
		pauseMenu.initialize();
        
        let player = new Player();
        player.position.y = 10;
        player.register();
        if (Main.Camera instanceof BABYLON.FreeCamera) {
            Main.Camera.parent = player;
            Main.Camera.position.y = 1.25;
        }
    }
}