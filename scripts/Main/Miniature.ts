/// <reference path="Main.ts"/>

class Miniature extends Main {

	public targets: BABYLON.Mesh[] = [];

	public updateCameraPosition(): void {
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
            let bbox = this.targets[0].getBoundingInfo();
            Main.Camera.target.copyFrom(bbox.maximum).addInPlace(bbox.minimum).scaleInPlace(0.5);
            let cameraPosition = new BABYLON.Vector3(- 1, 0.6, 0.8);
            cameraPosition.scaleInPlace(size * 1.8);
            cameraPosition.addInPlace(Main.Camera.target);
            Main.Camera.setPosition(cameraPosition);
        }
    }

    public async initialize(): Promise<void> {
        super.initialize();
        await BrickVertexData.InitializeData();
        await BrickDataManager.InitializeData();

		Main.Scene.clearColor.copyFromFloats(0, 1, 0, 1);

        console.log("Miniature initialized.");

		let loop = () => {
			if (document.pointerLockElement) {
				setTimeout(
					async () => {
						//this.runAllScreenShots()
						await this.createBrick("windshield-6x2x2-brightbluetransparent");
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

	public async runAllScreenShots(): Promise<void> {
		let colors = BrickDataManager.BrickColorNames;
		for (let i = 0; i < BrickDataManager.BrickNames.length; i++) {
			let name = BrickDataManager.BrickNames[i];
			for (let j = 0; j < colors.length; j++) {
				let color = colors[j];
				await this.createBrick(name + "-" + color);
			}
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

	public async createBrick(brickReferenceStr: string): Promise<void> {
		let brickReference = Brick.ParseReference(brickReferenceStr);
		let mesh = new BABYLON.Mesh("mesh");
		let data = await BrickVertexData.GetFullBrickVertexData(brickReference);
		data.applyToMesh(mesh);
		
		this.targets = [mesh];
		
		return new Promise<void>(
            resolve => {
                setTimeout(
                    () => {
                        this.updateCameraPosition();
                        setTimeout(
                            async () => {
								await this.makeScreenShot(brickReferenceStr, false);
								mesh.dispose();
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
										if (r === 0 && g === 255 && b === 0) {
											data.data[4 * i] = 0;
											data.data[4 * i + 1] = 0;
											data.data[4 * i + 2] = 0;
											data.data[4 * i + 3] = 0;
										}
										else if (desaturate) {
											let desat = (r + g + b) / 3;
											desat = Math.floor(Math.sqrt(desat / 255) * 255);
											data.data[4 * i] = desat;
											data.data[4 * i + 1] = desat;
											data.data[4 * i + 2] = desat;
											data.data[4 * i + 3] = 255;
										}
									}
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