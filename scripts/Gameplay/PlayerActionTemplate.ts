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

        action.iconUrl = "./datas/textures/delete.png";

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
                    coordinates.addInPlace(pickInfo.getNormal().scale(0.25));
                    coordinates.x = Math.floor(2 * coordinates.x) / 2 + 0.25;
                    coordinates.y = Math.floor(2 * coordinates.y) / 2 + 0.25;
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
                world.addInPlace(pickInfo.getNormal().scale(0.25));
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
                coordinates.addInPlace(pickInfo.getNormal().scale(0.25));
                coordinates.x = Math.floor(2 * coordinates.x) / 2 + 0.25;
                coordinates.y = Math.floor(2 * coordinates.y) / 2 + 0.25;
                coordinates.z = Math.floor(2 * coordinates.z) / 2 + 0.25;
                if (coordinates) {
                    if (!previewMesh) {
                        previewMesh = BABYLON.MeshBuilder.CreateBox("preview-mesh", { size: 0.2 });

                        BlockVertexData.GetVertexData(blockReference).then(
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
                world.addInPlace(pickInfo.getNormal().scale(0.25));
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
}