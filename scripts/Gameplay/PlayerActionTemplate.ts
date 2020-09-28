var ACTIVE_DEBUG_PLAYER_ACTION = true;

var ADD_BRICK_ANIMATION_DURATION = 1000;

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

            let coordinates = ChunckUtils.XYScreenToChunckV2Coordinates(x, y, cubeType === CubeType.None);
            if (coordinates) {
                if (!previewMesh) {
                    if (coordinates.chunck instanceof Chunck_V1) {
                        previewMesh = BABYLON.MeshBuilder.CreateBox("preview-mesh", { size: 1.2 });
                    }
                    else {
                        previewMesh = BABYLON.MeshBuilder.CreateBox("preview-mesh", { width: 1.8, height: 1.16, depth: 1.8 });
                    }
                    previewMesh.material = Cube.PreviewMaterials[cubeType];
                }
                previewMesh.position.copyFrom(coordinates.chunck.position);
                if (coordinates.chunck instanceof Chunck_V1) {
                    previewMesh.position.addInPlace(coordinates.coordinates);
                    previewMesh.position.addInPlaceFromFloats(0.5, 0.5, 0.5);
                }
                else {
                    previewMesh.position.addInPlace(coordinates.coordinates.multiplyByFloats(1.6, 0.96, 1.6));
                    previewMesh.position.addInPlaceFromFloats(0, - 0.48, 0);
                }
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

            let coordinates = ChunckUtils.XYScreenToChunckV2Coordinates(x, y, cubeType === CubeType.None);
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
                let coordinates = ChunckUtils.WorldPositionToChunckBlockCoordinates_V1(world);
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
                let coordinates = ChunckUtils.WorldPositionToChunckBlockCoordinates_V1(world);
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

    private static _animationCannotAddBrick(t: number, offsetRef: BABYLON.Vector3): void {
        if (t > ADD_BRICK_ANIMATION_DURATION * 0.7) {
            offsetRef.x = 0;
            offsetRef.z = 0;
            return;
        }
        let q = 0;
        let d = 70;
        let max = 0.05;
        let a = t - Math.floor(t / (2 * d)) * 2 * d;
        if (a < d) {
            q = max - 2 * a * max / d;
        }
        else {
            a -= d;
            q = - max + 2 * a * max / d;
        }
        q *= (1 - Math.sqrt(t / (ADD_BRICK_ANIMATION_DURATION * 0.7)));
        offsetRef.x = Math.cos(t / (ADD_BRICK_ANIMATION_DURATION * 0.2) * Math.PI * 2) * q;
        offsetRef.z = Math.sin(t / (ADD_BRICK_ANIMATION_DURATION * 0.2) * Math.PI * 2) * q;
    }

    public static async CreateBrickAction(brickReference: IBrickReference, onBrickAddedCallback = () => {}): Promise<PlayerAction> {
        let data = await BrickDataManager.GetBrickData(brickReference);
        let action = new PlayerAction();
        let previewMesh: BABYLON.Mesh;
        let previewMeshOffset: BABYLON.Vector3 = BABYLON.Vector3.Zero();

        let debugText: DebugText3D;
        let r = 0;
        let ctrlDown = false;
        let anchorX = 0;
        let anchorZ = 0;

        let t = 0;

        action.iconUrl = "./datas/textures/miniatures/" + brickReference.name + "-" + brickReference.color + "-miniature.png";

        action.onKeyDown = (e: KeyboardEvent) => {
            if (e.code === "ControlLeft") {
                ctrlDown = true;
            }
        }

        action.onKeyUp = (e: KeyboardEvent) => {
            if (e.code === "KeyR") {
                r = (r + 1) % 4;
                previewMesh.rotation.y = Math.PI / 2 * r;
                let az = anchorZ;
                anchorZ = - anchorX;
                anchorX = az;
            }
            else if (e.code === "ControlLeft") {
                ctrlDown = false;
            }
        }

        action.onWheel = (e: WheelEvent) => {
            e.preventDefault();
            let forward = Main.Camera.getDirection(BABYLON.Axis.Z);
            if (
                (Math.abs(forward.x) > Math.abs(forward.z) && !ctrlDown) || 
                (Math.abs(forward.x) < Math.abs(forward.z) && ctrlDown)
            ) {
                anchorX += Math.sign(forward.x) * Math.sign(e.deltaY);
            }
            else {
                anchorZ += Math.sign(forward.z) * Math.sign(e.deltaY);
            }
            if (r === 0) {
                anchorX = Math.min(data.maxBlockX, Math.max(data.minBlockX, anchorX));
                anchorZ = Math.min(data.maxBlockZ, Math.max(data.minBlockZ, anchorZ));
            }
            else if (r === 1) {
                anchorX = Math.min(data.maxBlockZ, Math.max(data.minBlockZ, anchorX));
                anchorZ = Math.max(- data.maxBlockX, Math.min(- data.minBlockX, anchorZ));
            }
            else if (r === 2) {
                anchorX = Math.max(- data.maxBlockX, Math.min(- data.minBlockX, anchorX));
                anchorZ = Math.max(- data.maxBlockZ, Math.min(- data.minBlockZ, anchorZ));
            }
            else if (r === 3) {
                anchorX = Math.max(- data.maxBlockZ, Math.min(- data.minBlockZ, anchorX));
                anchorZ = Math.min(data.maxBlockX, Math.max(data.minBlockX, anchorZ));
            }
        }

        action.onUpdate = () => {
            t += Main.Engine.getDeltaTime();
            if (t >= ADD_BRICK_ANIMATION_DURATION) {
                t = 0;
            }

            let x = Main.Engine.getRenderWidth() * 0.5;
            let y = Main.Engine.getRenderHeight() * 0.5;

            let pickInfo = Main.Scene.pick(
                x,
                y,
                (m) => {
                    return m.isPickable;
                }
            );
            if (pickInfo.hit) {
                let world = pickInfo.pickedPoint.clone();
                let hitKnob = TileUtils.IsKnobHit(world, pickInfo.getNormal(true));
                document.getElementById("is-knob-hit").textContent = hitKnob ? "TRUE" : "FALSE";
                if (!hitKnob) {
                    world.addInPlace(pickInfo.getNormal(true).multiplyInPlace(new BABYLON.Vector3(DX / 4, DY / 4, DX / 4)));
                }
                //let coordinates = ChunckUtils.WorldPositionToTileBrickCoordinates(world);
                let coordinates = ChunckUtils.WorldPositionToChunckBrickCoordinates_V2(world);
                if (coordinates) {
                    let i = coordinates.coordinates.x - anchorX;
                    let j = coordinates.coordinates.y;
                    let k = coordinates.coordinates.z - anchorZ;
                    if (coordinates.chunck instanceof Chunck_V2) {
                        if (!coordinates.chunck.canAddBrickDataAt(data, i, j, k, r)) {
                            PlayerActionTemplate._animationCannotAddBrick(t, previewMeshOffset);
                        }
                        else {
                            previewMeshOffset.copyFromFloats(0, 0, 0);
                        }
                        if (!previewMesh) {
                            previewMesh = BABYLON.MeshBuilder.CreateBox("preview-mesh", { size: DX });
                            previewMesh.isPickable = false;
                            BrickVertexData.GetFullBrickVertexData(brickReference).then(
                                data => {
                                    data.applyToMesh(previewMesh);
                                }
                            );
                            if (brickReference.color.indexOf("transparent") != -1) {
                                previewMesh.material = Main.cellShadingTransparentMaterial;
                            }
                            else {
                                previewMesh.material = Main.cellShadingMaterial;
                            }
                        }
                        previewMesh.position.copyFrom(coordinates.chunck.position);
                        previewMesh.position.addInPlaceFromFloats(i * DX, j * DY, k * DX);
                        previewMesh.position.addInPlace(previewMeshOffset);
                        previewMesh.rotation.y = Math.PI / 2 * r;
                    }
                }
                else {
                    if (previewMesh) {
                        previewMesh.dispose();
                        previewMesh = undefined;
                    }
                }
            }
            else {
                if (previewMesh) {
                    previewMesh.dispose();
                    previewMesh = undefined;
                }
            }

            if (ACTIVE_DEBUG_PLAYER_ACTION && previewMesh) {
                if (!debugText) {
                    debugText = DebugText3D.CreateText("", previewMesh.position);
                }
                let text = "";
                text += "r = " + r + "<br>";
                text += "anchorX = " + anchorX + "<br>";
                text += "anchorZ = " + anchorZ + "<br>";
                debugText.setText(text);
            }
        }

        action.onClick = async () => {
            let x = Main.Engine.getRenderWidth() * 0.5;
            let y = Main.Engine.getRenderHeight() * 0.5;

            let pickInfo = Main.Scene.pick(
                x,
                y,
                (m) => {
                    return m.isPickable;
                }
            );
            if (pickInfo.hit) {
                let world = pickInfo.pickedPoint.clone();
                let hitKnob = TileUtils.IsKnobHit(world, pickInfo.getNormal(true));
                document.getElementById("is-knob-hit").textContent = hitKnob ? "TRUE" : "FALSE";
                if (!hitKnob) {
                    world.addInPlace(pickInfo.getNormal(true).multiplyInPlace(new BABYLON.Vector3(DX / 4, DY / 4, DX / 4)));
                }
                //let coordinates = ChunckUtils.WorldPositionToTileBrickCoordinates(world);
                let coordinates = ChunckUtils.WorldPositionToChunckBrickCoordinates_V2(world);
                console.log(coordinates.chunck);
                console.log(coordinates.coordinates);
                if (coordinates) {
                    console.log("alpha");
                    let brick = new Brick();
                    brick.reference = brickReference;
                    brick.i = coordinates.coordinates.x - anchorX;
                    brick.j = coordinates.coordinates.y;
                    brick.k = coordinates.coordinates.z - anchorZ;
                    brick.r = r;
                    if (coordinates.chunck && coordinates.chunck instanceof Chunck_V2) {
                        console.log("bravo");
                        if (await coordinates.chunck.addBrickSafe(brick)) {
                            console.log("charly");
                            await coordinates.chunck.updateBricks();
                            onBrickAddedCallback();
                        }
                    }
                }
            }
        }

        action.onUnequip = () => {
            if (previewMesh) {
                previewMesh.dispose();
                previewMesh = undefined;
            }
            if (ACTIVE_DEBUG_PLAYER_ACTION) {
                if (debugText) {
                    debugText.dispose();
                }
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

            let coordinates = ChunckUtils.XYScreenToChunckV1Coordinates(x, y);
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
                    return m instanceof Chunck_V1;
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