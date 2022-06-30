/// <reference path="Main.ts"/>

class Miniature extends Main {

	public targets: BABYLON.Mesh[] = [];
	public sizeMarkers: BABYLON.Mesh;
	public sizeMarkerMaterial: BABYLON.StandardMaterial;

	public updateCameraPosition(useSizeMarker: boolean = false): void {
        if (Main.Camera instanceof BABYLON.ArcRotateCamera) {
            Main.Camera.lowerRadiusLimit = 0.01;
            Main.Camera.upperRadiusLimit = 1000;
            let size = 0;
            this.targets.forEach(
                t => {
                    let bbox = t.getBoundingInfo();
                    size = Math.max(size, bbox.maximum.x - bbox.minimum.x);
                    size = Math.max(size, bbox.maximum.y - bbox.minimum.y);
                    size = Math.max(size, bbox.maximum.z - bbox.minimum.z);
                }
			)
			if (useSizeMarker) {
				size += 1.5;
			}
			document.getElementById("size").innerText = size.toFixed(2);
            let bbox = this.targets[0].getBoundingInfo();
            Main.Camera.target.copyFrom(bbox.maximum).addInPlace(bbox.minimum).scaleInPlace(0.5);
            let cameraPosition = (new BABYLON.Vector3(- 1, 0.6, 0.8)).normalize();

			let f = (size - 0.4) / (7.90 - 0.4);
            //cameraPosition.scaleInPlace(Math.pow(size, 0.6) * 3.2);
            cameraPosition.scaleInPlace(1 * (1 - f) + 12 * f);
            cameraPosition.addInPlace(Main.Camera.target);
            Main.Camera.setPosition(cameraPosition);

			if (this.sizeMarkers) {
				this.sizeMarkers.dispose();
			}
			if (useSizeMarker) {
				this.sizeMarkers = new BABYLON.Mesh("size-markers");
				let n = 0;
				for (let x = bbox.minimum.x; x < bbox.maximum.x - DX05; x += DX) {
					let cylinder = BABYLON.MeshBuilder.CreateCylinder("x", { diameter: 0.04, height: (n % 2 === 0) ? 0.8 : 0.3 });
					cylinder.material = this.sizeMarkerMaterial;
					cylinder.position.x = x;
					cylinder.position.z = bbox.maximum.z + ((n % 2 === 0) ? 0.6 : 0.35);
					cylinder.rotation.x = Math.PI / 2;
					cylinder.parent = this.sizeMarkers;
					cylinder.layerMask = 1;
					n++;
				}
				n = 0;
				for (let y = bbox.minimum.y; y < bbox.maximum.y + DY05; y += DY) {
					let cylinder = BABYLON.MeshBuilder.CreateCylinder("y", { diameter: 0.04, height: (n % 3 === 0) ? 0.8 : 0.3 });
					cylinder.material = this.sizeMarkerMaterial;
					cylinder.position.x = bbox.maximum.x;
					cylinder.position.y = y;
					cylinder.position.z = bbox.maximum.z + ((n % 3 === 0) ? 0.6 : 0.35);
					cylinder.rotation.x = Math.PI / 2;
					cylinder.parent = this.sizeMarkers;
					cylinder.layerMask = 1;
					n++;
				}
				n = 0;
				for (let z = bbox.minimum.z; z < bbox.maximum.z + DX05; z += DX) {
					let cylinder = BABYLON.MeshBuilder.CreateCylinder("z", { diameter: 0.04, height: (n % 2 === 0) ? 0.8 : 0.3 });
					cylinder.material = this.sizeMarkerMaterial;
					cylinder.position.x = bbox.minimum.x - ((n % 2 === 0) ? 0.6 : 0.35);
					cylinder.position.z = z;
					cylinder.rotation.z = Math.PI / 2;
					cylinder.parent = this.sizeMarkers;
					cylinder.layerMask = 1;
					n++;
				}
			}
        }
    }

    public async initialize(): Promise<void> {
        super.initialize();
        await BrickVertexData.InitializeData();
        BrickDataManager.InitializeProceduralData();
        await BrickDataManager.InitializeDataFromFile();

		this.sizeMarkerMaterial = new BABYLON.StandardMaterial("size-marker-material", Main.Scene);
		this.sizeMarkerMaterial.specularColor.copyFromFloats(0, 0, 0);
		this.sizeMarkerMaterial.diffuseColor.copyFromFloats(0, 0, 0);

		Main.Skybox.dispose();
		Main.Scene.clearColor.copyFromFloats(0, 0, 0, 0);

		
        if (Main.Camera instanceof BABYLON.ArcRotateCamera) {
            Main.Camera.wheelPrecision *= 10;
		}
		Main.Scene.onBeforeRenderObservable.add(() => {
			if (Main.Camera instanceof BABYLON.ArcRotateCamera) {
				document.getElementById("radius").innerText = Main.Camera.radius.toFixed(2);
			}
		})

        console.log("Miniature initialized.");

		let loop = () => {
			if (document.pointerLockElement) {
				setTimeout(
					async () => {
						//this.runManyScreenShots();
						//this.runAllScreenShots();
						await this.createBrick("pilar-6-1-17", true);
						//this.runPaintBucketsScreenShots();
						//await this.createWorldItem("paint-bucket", BrickColor.Red, true);
					},
					100
				);
			}
			else {
				requestAnimationFrame(loop);
			}
		}
		loop();
	}

	public async runManyScreenShots(): Promise<void> {
		let colors = [
			"white",
			"black"
		];
		
		/*
		let bricks = [];
		BrickDataManager.BrickNames.forEach(n => {
			if (n.indexOf("slope") != -1) {
				bricks.push(n);
			}
		});
		*/

		let bricks = [
			"plateCurb-2x2",
			"plateCurb-3x3",
			"plateCurb-4x4",
			"plateCurb-5x5",
			"plateCurb-6x6",
			"plateCurb-7x7",
			"plateCurb-8x8",
			"plateCurb-9x9",
			"plateCurb-10x10",
			"brickCurb-2x2",
			"brickCurb-3x3",
			"brickCurb-4x4",
			"brickCurb-5x5",
			"brickCurb-6x6",
			"brickCurb-7x7",
			"brickCurb-8x8",
			"brickCurb-9x9",
			"brickCurb-10x10",
		];

		for (let i = 0; i < bricks.length; i++) {
			let name = bricks[i];
			for (let j = 0; j < colors.length; j++) {
				let color = colors[j];
				await this.createBrick(name + "-" + color);
			}
		}
	}

	public async runAllScreenShots(): Promise<void> {
		for (let i = 0; i < BrickDataManager.BrickNames.length; i++) {
			let name = BrickDataManager.BrickNames[i];
			let type = BrickType.Concrete;
			await this.createBrick(name + "-" + type.toFixed(0) + "-" + Brick.DefaultColor(type).toFixed(0));
		}
		/*
        await this.createCube(CubeType.Dirt);
        await this.createCube(CubeType.Rock);
        await this.createCube(CubeType.Sand);
		for (let i = 0; i < BlockList.References.length; i++) {
			let reference = BlockList.References[i];
			await this.createBlock(reference);
		}
		*/
	}

	public async runPaintBucketsScreenShots(): Promise<void> {
		for (let i = 0; i < BrickDataManager.BrickColorIndexes.length; i++) {
			let color = BrickDataManager.BrickColorIndexes[i];
			await this.createWorldItem("paint-bucket", color, i === BrickDataManager.BrickColorIndexes.length);
		};
	}

	public async createCube(cubeType: CubeType): Promise<void> {
        let chunck = Main.ChunckManager.createChunck(0, 0, 0);

        this.targets = [chunck];

        chunck.setCube(0, 0, 0, cubeType);
        chunck.setCube(1, 0, 0, cubeType);
        chunck.setCube(0, 1, 0, cubeType);
        chunck.setCube(0, 0, 1, cubeType);
        chunck.setCube(1, 1, 1, cubeType);
        chunck.setCube(0, 1, 1, cubeType);
        chunck.setCube(1, 0, 1, cubeType);
        chunck.setCube(1, 1, 0, cubeType);
        chunck.generate();

        chunck.computeWorldMatrix(true);

        return new Promise<void>(
            resolve => {
                setTimeout(
                    () => {
                        this.updateCameraPosition();
                        setTimeout(
                            async () => {
                                await this.makeScreenShot(ChunckUtils.CubeTypeToString(cubeType).toLocaleLowerCase(), false);
                                resolve();
                            },
                            80
                        )
                    },
                    80
                )
            }
        )
	}

	public async createBlock(reference: string): Promise<void> {
		let chunck = Main.ChunckManager.createChunck(0, 0, 0);

        chunck.makeEmpty();
        chunck.generate();

		chunck.computeWorldMatrix(true);
		
		let block = new Block();
		block.setReference(reference);
		
		this.targets = [block];
		
		return new Promise<void>(
            resolve => {
                setTimeout(
                    () => {
                        this.updateCameraPosition();
                        setTimeout(
                            async () => {
								await this.makeScreenShot(reference, false);
								block.dispose();
                                resolve();
                            },
                            200
                        )
                    },
                    200
                )
            }
        )
	}

	public async createBrick(brickReferenceStr: string, keepAlive?: boolean): Promise<void> {
		let brickReference = Brick.ParseReference(brickReferenceStr);
		let mesh = new BABYLON.Mesh("mesh");
		let data = await BrickVertexData.GetFullBrickVertexData(brickReference);
		data.applyToMesh(mesh);
		
		this.targets = [mesh];
		
		return new Promise<void>(
            resolve => {
                setTimeout(
                    () => {
                        this.updateCameraPosition(true);
                        setTimeout(
                            async () => {
								await this.makeScreenShot(brickReferenceStr, false);
								if (!keepAlive) {
									mesh.dispose();
								}
                                resolve();
                            },
                            200
                        )
                    },
                    200
                )
            }
        )
	}

	public async createWorldItem(name: string, color?: BrickColor, keepAlive?: boolean): Promise<void> {
		let item = new WorldItem(name, color);
		await item.instantiate();
		
		this.targets = [item];
		
		return new Promise<void>(
            resolve => {
                setTimeout(
                    () => {
                        this.updateCameraPosition();
                        setTimeout(
                            async () => {
								await this.makeScreenShot(name + "-" + color.toFixed(0), false);
								if (!keepAlive) {
									item.dispose();
								}
                                resolve();
                            },
                            200
                        )
                    },
                    200
                )
            }
        )
	}

	public async makeScreenShot(miniatureName?: string, desaturate: boolean = true): Promise<void> {
		return new Promise<void>(
			resolve => {
				requestAnimationFrame(
					() => {
						BABYLON.ScreenshotTools.CreateScreenshot(
							Main.Engine,
							Main.Camera,
							{
								width: 256 * Main.Canvas.width / Main.Canvas.height,
								height: 256
							},
							(data) => {
								let img = document.createElement("img");
								img.src = data;
								img.onload = () => {
									let sx = (img.width - 256) * 0.5;
									let sy = (img.height - 256) * 0.5;
									let canvas = document.createElement("canvas");
									canvas.width = 256;
									canvas.height = 256;
									let context = canvas.getContext("2d");
									context.drawImage(img, sx, sy, 256, 256, 0, 0, 256, 256);

									let data = context.getImageData(0, 0, 256, 256);
									for (let i = 0; i < data.data.length / 4; i++) {
										let r = data.data[4 * i];
										let g = data.data[4 * i + 1];
										let b = data.data[4 * i + 2];
										/*if (r === 0 && g === 255 && b === 0) {
											data.data[4 * i] = 0;
											data.data[4 * i + 1] = 0;
											data.data[4 * i + 2] = 0;
											data.data[4 * i + 3] = 0;
										}
										else*/ if (desaturate) {
											let desat = (r + g + b) / 3;
											desat = Math.floor(Math.sqrt(desat / 255) * 255);
											data.data[4 * i] = desat;
											data.data[4 * i + 1] = desat;
											data.data[4 * i + 2] = desat;
											data.data[4 * i + 3] = 255;
										}
									}
									/*
									for (let i = 0; i < data.data.length / 4; i++) {
										let a = data.data[4 * i + 3];
										if (a === 0) {
											let hasColoredNeighbour = false;
											for (let ii = -2; ii <= 2; ii++) {
												for (let jj = -2; jj <= 2; jj++) {
													if (ii !== 0 || jj !== 0) {
														let index = 4 * i + 3;
														index += ii * 4;
														index += jj * 4 * 256;
														if (index >= 0 && index < data.data.length) {
															let aNeighbour = data.data[index];
															if (aNeighbour === 255) {
																hasColoredNeighbour = true;
															}
														}
													}
												}
											}
											if (hasColoredNeighbour) {
												data.data[4 * i] = 255;
												data.data[4 * i + 1] = 255;
												data.data[4 * i + 2] = 255;
												data.data[4 * i + 3] = 254;
											}
										}
									}
									*/
									context.putImageData(data, 0, 0);

									var tmpLink = document.createElement( 'a' );
									let name = "Unknown";
									if (miniatureName) {
										name = miniatureName;
									}
									tmpLink.download = name + "-miniature.png";
									tmpLink.href = canvas.toDataURL();  
									
									document.body.appendChild( tmpLink );
									tmpLink.click(); 
									document.body.removeChild( tmpLink );
									resolve();
								}
							}
						);
					}
				)
			}
		)
	}
}