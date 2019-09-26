class PlayerActionTemplate {

    public static CreateCubeAction(cubeType: CubeType): PlayerAction {
        let action = new PlayerAction();
        let previewMesh: BABYLON.Mesh;

        action.iconUrl = "./datas/textures/";
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
        action.iconUrl += ".png";

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

    public static CreateBlockAction(blockReference: string): PlayerAction {
        let action = new PlayerAction();
        let previewMesh: BABYLON.Mesh;
        let r = 0;

        action.iconUrl = "./datas/textures/delete.png";

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
                        if (blockReference === "wall") {
                            VertexDataLoader.instance.get("wall").then(
                                datas => {
                                    datas[0].applyToMesh(previewMesh);
                                }
                            )
                        }
                        else if (blockReference === "wall-hole") {
                            VertexDataLoader.instance.get("wall").then(
                                datas => {
                                    datas[1].applyToMesh(previewMesh);
                                }
                            )
                        }
                        else if (blockReference === "wall-corner-out") {
                            VertexDataLoader.instance.get("wall").then(
                                datas => {
                                    datas[2].applyToMesh(previewMesh);
                                }
                            )
                        }
                        previewMesh.material = Cube.PreviewMaterials[CubeType.None];
                    }
                    previewMesh.position.copyFrom(coordinates);
                    console.log("Coordinates " + coordinates.toString());
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