/// <reference path="./Main.ts"/>

class CollisionsTest extends Main {
    
    public static DisplayCross(p: BABYLON.Vector3, duration: number = 200): void {
        let crossX = BABYLON.MeshBuilder.CreateBox(
            "cube",
            {
                width: 3,
                height: 0.1,
                depth: 0.1
            },
            Main.Scene
        );
        crossX.position.copyFrom(p);
        let crossY = BABYLON.MeshBuilder.CreateBox(
            "cube",
            {
                width: 0.1,
                height: 3,
                depth: 0.1
            },
            Main.Scene
        );
        crossY.parent = crossX;
        let crossZ = BABYLON.MeshBuilder.CreateBox(
            "cube",
            {
                width: 0.1,
                height: 0.1,
                depth: 3
            },
            Main.Scene
        );
        crossZ.parent = crossX;
        setTimeout(
            () => {
                crossX.dispose();
            },
            duration
        );
    }
    public async initialize(): Promise<void> {
        await super.initializeScene();
        let l = 1;
		let manyChuncks = [];
		let savedTerrainString = window.localStorage.getItem("collisions-test");
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
        let inputDown: boolean = false;
        let inputUp: boolean = false;
        let inputLeft: boolean = false;
        let inputRight: boolean = false;
        let inputBack: boolean = false;
        let inputForward: boolean = false;

		let sphere = BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: 1}, Main.Scene);
        sphere.position.copyFromFloats(0, 10, 0);
        
        //let cube = BABYLON.MeshBuilder.CreateBox("cube", { width: 2, height: 2, depth: 2}, Main.Scene);
        //cube.position.copyFromFloats(3, 10, 3);
		let update = () => {

            if (inputLeft) { sphere.position.x -= 0.02; }
            if (inputRight) { sphere.position.x += 0.02; }
            if (inputDown) { sphere.position.y -= 0.02; }
            if (inputUp) { sphere.position.y += 0.02; }
            if (inputBack) { sphere.position.z -= 0.02; }
            if (inputForward) { sphere.position.z += 0.02; }

            //let intersection = Intersections3D.SphereCube(sphere.position, 0.5, cube.getBoundingInfo().minimum.add(cube.position), cube.getBoundingInfo().maximum.add(cube.position));
            //if (intersection && intersection.point) {
            //    CollisionsTest.DisplayCross(intersection.point, 200);
            //}

			for (let i = 0; i < manyChuncks.length; i++) {
				let intersections = Intersections3D.SphereChunck(sphere.position, 0.5, manyChuncks[i]);
				if (intersections) {
					for (let j = 0; j < intersections.length; j++) {
                        CollisionsTest.DisplayCross(intersections[j].point, 200);
					}
				}
			}
			requestAnimationFrame(update);
		}
        update();
        
        window.addEventListener("keyup", (e) => {
            if (e.keyCode === 81) {
                inputLeft = false;
            }
            else if (e.keyCode === 68) {
                inputRight = false;
            }
            else if (e.keyCode === 65) {
                inputDown = false;
            }
            else if (e.keyCode === 69) {
                inputUp = false;
            }
            else if (e.keyCode === 83) {
                inputBack = false;
            }
            else if (e.keyCode === 90) {
                inputForward = false;
            }
        });
        
        window.addEventListener("keydown", (e) => {
            if (e.keyCode === 81) {
                inputLeft = true;
            }
            else if (e.keyCode === 68) {
                inputRight = true;
            }
            else if (e.keyCode === 65) {
                inputDown = true;
            }
            else if (e.keyCode === 69) {
                inputUp = true;
            }
            else if (e.keyCode === 83) {
                inputBack = true;
            }
            else if (e.keyCode === 90) {
                inputForward = true;
            }
        });
        
        Main.Camera.setTarget(sphere);
        Main.Camera.alpha = - Math.PI / 2;
        Main.Camera.beta = Math.PI / 4;
        Main.Camera.radius = 10;
    }
}