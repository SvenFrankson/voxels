class PlayerActionTemplate {

    public static CreateCubeAction(cubeType: CubeType): PlayerAction {
        let action = new PlayerAction();
        let previewMesh: BABYLON.Mesh;

        action.iconUrl = "./datas/textures/miniatures/";
        if (cubeType === CubeType.Dirt) {
            action.iconUrl += "dirt";
        }
        if (cubeType === CubeType.Rock) {
            action.iconUrl += "rock";
        }
        if (cubeType === CubeType.Sand) {
            action.iconUrl += "sand";
        }
        if (cubeType === CubeType.None) {
            action.iconUrl += "delete";
        }
        action.iconUrl += "-miniature.png";

        action.onUpdate = () => {
            let x = Main.Engine.getRenderWidth() * 0.5;
            let y = Main.Engine.getRenderHeight() * 0.5;

            let coordinates = ChunckUtils.XYScreenToChunckCoordinates(x, y, cubeType === CubeType.None);
            if (coordinates) {
                if (!previewMesh) {
                    previewMesh = BABYLON.MeshBuilder.CreateBox("preview-mesh", { size: 1.2 });
                    previewMesh.material = Cube.PreviewMaterials[cubeType];
                }
                previewMesh.position.copyFrom(coordinates.chunck.position);
                previewMesh.position.addInPlace(coordinates.coordinates);
                previewMesh.position.addInPlaceFromFloats(0.5, 0.5, 0.5);
            }
            else {
                if (previewMesh) {
                    previewMesh.dispose();
                    previewMesh = undefined;
                }
            }
        }

        action.onClick = () => {
            let x = Main.Engine.getRenderWidth() * 0.5;
            let y = Main.Engine.getRenderHeight() * 0.5;

            let coordinates = ChunckUtils.XYScreenToChunckCoordinates(x, y, cubeType === CubeType.None);
            if (coordinates) {
                Main.ChunckManager.setChunckCube(coordinates.chunck, coordinates.coordinates.x, coordinates.coordinates.y, coordinates.coordinates.z, cubeType, 0, true);
            }
        }

        action.onUnequip = () => {
            if (previewMesh) {
                previewMesh.dispose();
                previewMesh = undefined;
            }
        }
        
        return action;
    }

    public static EditBlockAction(): PlayerAction {
        let action = new PlayerAction();
        let pickedBlock: Block;
        let aimedBlock: Block;

        action.iconUrl = "./datas/textures/miniatures/move-arrow.png";

        action.onKeyUp = (e: KeyboardEvent) => {
            if (e.keyCode === 82) {
                if (pickedBlock) {
                    pickedBlock.r = (pickedBlock.r + 1) % 4;
                }
            }
        }

        action.onUpdate = () => {
            let x = Main.Engine.getRenderWidth() * 0.5;
            let y = Main.Engine.getRenderHeight() * 0.5;

            if (!pickedBlock) {
                let pickInfo = Main.Scene.pick(
                    x, y
                );
                if (pickInfo.hit) {
                    if (pickInfo.pickedMesh !== aimedBlock) {
                        if (aimedBlock) {
                            aimedBlock.unlit();
                        }
                        aimedBlock = undefined;
                        if (pickInfo.pickedMesh instanceof Block) {
                            aimedBlock = pickInfo.pickedMesh;
                            aimedBlock.highlight();
                        }
                    }
                }
            }
            else {
                let pickInfo = Main.Scene.pick(
                    x, y,
                    (m) => {
                        return m !== pickedBlock;
                    }
                );
                if (pickInfo.hit) {
                    let coordinates = pickInfo.pickedPoint.clone();
                    coordinates.addInPlace(pickInfo.getNormal(true).multiplyInPlace(new BABYLON.Vector3(0.25, 0.125, 0.25)));
                    coordinates.x = Math.floor(2 * coordinates.x) / 2 + 0.25;
                    coordinates.y = Math.floor(4 * coordinates.y) / 4 + 0.125;
                    coordinates.z = Math.floor(2 * coordinates.z) / 2 + 0.25;
                    if (coordinates) {
                        pickedBlock.position.copyFrom(coordinates);
                    }
                }
            }
        }

        action.onClick = () => {
            if (!pickedBlock) {
                if (aimedBlock) {
                    pickedBlock = aimedBlock;
                    if (pickedBlock.chunck) {
                        pickedBlock.chunck.removeBlock(pickedBlock);
                        pickedBlock.chunck = undefined;
                    }
                }
            }
            else {
                let x = Main.Engine.getRenderWidth() * 0.5;
                let y = Main.Engine.getRenderHeight() * 0.5;
                let pickInfo = Main.Scene.pick(
                    x, y,
                    (m) => {
                        return m !== pickedBlock;
                    }
                );

                let world = pickInfo.pickedPoint.clone();
                world.addInPlace(pickInfo.getNormal(true).multiplyInPlace(new BABYLON.Vector3(0.25, 0.125, 0.25)));
                let coordinates = ChunckUtils.WorldPositionToChunckBlockCoordinates(world);
                if (coordinates) {
                    coordinates.chunck.addBlock(pickedBlock);
                    pickedBlock.setCoordinates(coordinates.coordinates);
                }
                pickedBlock = undefined;
            }
        }

        action.onUnequip = () => {
            if (aimedBlock) {
                aimedBlock.unlit();
            }
        }

        return action;
    }

    public static CreateBlockAction(blockReference: string): PlayerAction {
        let action = new PlayerAction();
        let previewMesh: BABYLON.Mesh;
        let r = 0;

        action.iconUrl = "./datas/textures/miniatures/" + blockReference + "-miniature.png";

        action.onKeyUp = (e: KeyboardEvent) => {
            if (e.keyCode === 82) {
                r = (r + 1) % 4;
                previewMesh.rotation.y = Math.PI / 2 * r;
            }
        }

        action.onUpdate = () => {
            let x = Main.Engine.getRenderWidth() * 0.5;
            let y = Main.Engine.getRenderHeight() * 0.5;

            let pickInfo = Main.Scene.pick(
                x,
                y,
                (m) => {
                    return m !== previewMesh;
                }
            );
            if (pickInfo.hit) {
                let coordinates = pickInfo.pickedPoint.clone();
                coordinates.addInPlace(pickInfo.getNormal(true).multiplyInPlace(new BABYLON.Vector3(0.25, 0.125, 0.25)));
                coordinates.x = Math.floor(2 * coordinates.x) / 2 + 0.25;
                coordinates.y = Math.floor(4 * coordinates.y) / 4 + 0.125;
                coordinates.z = Math.floor(2 * coordinates.z) / 2 + 0.25;
                if (coordinates) {
                    if (!previewMesh) {
                        previewMesh = BABYLON.MeshBuilder.CreateBox("preview-mesh", { size: 0.2 });

                        let blockMaterial = BlockVertexData.StringToBlockMaterial(blockReference.split("-")[0]);
                        let m = blockReference.split("-");
                        m.splice(0, 1);
                        let meshName = m.join("-");
                        BlockVertexData.GetVertexData(meshName, blockMaterial).then(
                            data => {
                                data.applyToMesh(previewMesh);
                            }
                        )
                        previewMesh.material = Cube.PreviewMaterials[CubeType.None];
                    }
                    previewMesh.position.copyFrom(coordinates);
                }
                else {
                    if (previewMesh) {
                        previewMesh.dispose();
                        previewMesh = undefined;
                    }
                }
            }
        }

        action.onClick = () => {
            let x = Main.Engine.getRenderWidth() * 0.5;
            let y = Main.Engine.getRenderHeight() * 0.5;

            let pickInfo = Main.Scene.pick(
                x,
                y,
                (m) => {
                    return m !== previewMesh;
                }
            );
            if (pickInfo.hit) {
                let world = pickInfo.pickedPoint.clone();
                world.addInPlace(pickInfo.getNormal(true).multiplyInPlace(new BABYLON.Vector3(0.25, 0.125, 0.25)));
                let coordinates = ChunckUtils.WorldPositionToChunckBlockCoordinates(world);
                if (coordinates) {
                    let block = new Block();
                    block.setReference(blockReference);
                    coordinates.chunck.addBlock(block);
                    block.setCoordinates(coordinates.coordinates);
                    block.r = r;
                }
            }
        }

        action.onUnequip = () => {
            if (previewMesh) {
                previewMesh.dispose();
                previewMesh = undefined;
            }
        }
        
        return action;
    }

    public static CreateBrickAction(brickReference: string): PlayerAction {
        let action = new PlayerAction();
        let previewMesh: BABYLON.Mesh;
        let r = 0;

        action.iconUrl = "./datas/textures/miniatures/" + brickReference + "-miniature.png";

        action.onKeyUp = (e: KeyboardEvent) => {
            if (e.keyCode === 82) {
                r = (r + 1) % 4;
                previewMesh.rotation.y = Math.PI / 2 * r;
            }
        }

        action.onUpdate = () => {
            let x = Main.Engine.getRenderWidth() * 0.5;
            let y = Main.Engine.getRenderHeight() * 0.5;

            let pickInfo = Main.Scene.pick(
                x,
                y,
                (m) => {
                    return m !== previewMesh;
                }
            );
            if (pickInfo.hit) {
                let world = pickInfo.pickedPoint.clone();
                world.addInPlace(pickInfo.getNormal(true).multiplyInPlace(new BABYLON.Vector3(DX / 4, DY / 4, DX / 4)));
                world.x = Math.round(world.x / DX) * DX;
                world.y = Math.floor(world.y / DY) * DY;
                world.z = Math.round(world.z / DX) * DX;
                if (world) {
                    if (!previewMesh) {
                        previewMesh = BABYLON.MeshBuilder.CreateBox("preview-mesh", { size: DX });
                        BrickVertexData.GetFullBrickVertexData(brickReference).then(
                            data => {
                                data.applyToMesh(previewMesh);
                            }
                        )
                    }
                    previewMesh.position.copyFrom(world);
                    previewMesh.rotation.y = Math.PI / 2 * r;
                }
                else {
                    if (previewMesh) {
                        previewMesh.dispose();
                        previewMesh = undefined;
                    }
                }
            }
        }

        action.onClick = () => {
            let x = Main.Engine.getRenderWidth() * 0.5;
            let y = Main.Engine.getRenderHeight() * 0.5;

            let pickInfo = Main.Scene.pick(
                x,
                y,
                (m) => {
                    return m !== previewMesh;
                }
            );
            if (pickInfo.hit) {
                let world = pickInfo.pickedPoint.clone();
                world.addInPlace(pickInfo.getNormal(true).multiplyInPlace(new BABYLON.Vector3(DX / 4, DY / 4, DX / 4)));
                let coordinates = ChunckUtils.WorldPositionToTileBrickCoordinates(world);
                console.log(coordinates);
                if (coordinates) {
                    let brick = new Brick();
                    brick.setReference(brickReference);
                    brick.i = coordinates.i;
                    brick.j = coordinates.j;
                    brick.k = coordinates.k;
                    brick.r = r;
                    if (coordinates.tile) {
                        coordinates.tile.bricks.push(brick);
                        coordinates.tile.updateBricks();
                    }
                }
            }
        }

        action.onUnequip = () => {
            if (previewMesh) {
                previewMesh.dispose();
                previewMesh = undefined;
            }
        }
        
        return action;
    }

    public static CreateMountainAction(r: number, h: number, roughness: number): PlayerAction {
        let action = new PlayerAction();

        action.iconUrl = "./datas/textures/miniatures/move-arrow.png";

        action.onClick = () => {
            let x = Main.Engine.getRenderWidth() * 0.5;
            let y = Main.Engine.getRenderHeight() * 0.5;

            let coordinates = ChunckUtils.XYScreenToChunckCoordinates(x, y);
            if (coordinates) {
                let I = coordinates.coordinates.x + coordinates.chunck.i * CHUNCK_SIZE;
                let J = coordinates.coordinates.y + coordinates.chunck.j * CHUNCK_SIZE;
                let K = coordinates.coordinates.z + coordinates.chunck.k * CHUNCK_SIZE;
                for (let i = - r; i <= r; i++) {
                    for (let k = - r; k <= r; k++) {
                        let d = Math.sqrt(i * i + k * k);
                        let localH = (Math.random() * h * roughness + h * (1 - roughness)) * (1 - d / r);
                        for (let j = - 1; j < localH; j++) {
                            Main.ChunckManager.setCube(I + i, J + j, K + k, CubeType.Rock, 0, false);
                        }
                    }
                }
                Main.ChunckManager.redrawZone(
                    I - 5,
                    J - 3,
                    K - 5,
                    I + 5,
                    J + 7,
                    K + 5
                )
            }
        }
        
        return action;
    }

    public static CreateTreeAction(): PlayerAction {
        let action = new PlayerAction();

        action.iconUrl = "./datas/textures/miniatures/move-arrow.png";

        action.onClick = () => {
            let x = Main.Engine.getRenderWidth() * 0.5;
            let y = Main.Engine.getRenderHeight() * 0.5;

            let pickInfo = Main.Scene.pick(
                x,
                y,
                (m) => {
                    return m instanceof Chunck;
                }
            );
            if (pickInfo.hit) {
                let tree = new Tree(Math.floor(Math.random() * 49 + 1));
                tree.generate(pickInfo.pickedPoint);
                let t = 0;
                let growthLoop = () => {
                    t += 0.01;
                    tree.createMesh(Math.min(t, 1)).then(
                        () => {
                            if (t < 1) {
                                requestAnimationFrame(growthLoop);
                            }
                        }
                    )
                }
                growthLoop();
            }
        }
        
        return action;
    }
}