class ChunckUtils {

    public static CubeTypeToString(cubeType: CubeType): string {
        if (cubeType === CubeType.Dirt) {
            return "Dirt";
        }
        if (cubeType === CubeType.Rock) {
            return "Rock";
        }
        if (cubeType === CubeType.Sand) {
            return "Sand";
        }
        if (cubeType === CubeType.None) {
            return "None";
        }
    }

    public static ScenePick(x: number, y: number): BABYLON.PickingInfo {
        let pickInfo: BABYLON.PickingInfo;
        let ray = Main.Scene.createPickingRay(x, y, BABYLON.Matrix.Identity(), Main.Camera);
        Main.Scene.meshes.forEach(m => {
            if (m.isPickable) {
                let tryPick = ray.intersectsMesh(m, false);
                if (tryPick.hit && isFinite(tryPick.pickedPoint.x) && isFinite(tryPick.pickedPoint.x) && isFinite(tryPick.pickedPoint.x)) {
                    pickInfo = tryPick;
                }
            }
        });
        return pickInfo;
    }

    public static ScenePickAround(world: BABYLON.Vector3, x: number, y: number, radius?: number): BABYLON.PickingInfo {
        let chuncks = ChunckUtils.WorldPositionToChuncks(world, radius);
        //console.log(chuncks.length);

        let pickInfo: BABYLON.PickingInfo;
        if (chuncks) {
            let meshes: BABYLON.Mesh[] = [...chuncks];
            for (let i = 0; i < chuncks.length; i++) {
                let chunck = chuncks[i];
                if (chunck instanceof Chunck_V2) {
                    meshes.push(...chunck.brickMeshes);
                }
            }
            let ray = Main.Scene.createPickingRay(x, y, BABYLON.Matrix.Identity(), Main.Camera);
            meshes.forEach(m => {
                if (m.isPickable) {
                    let tryPick = ray.intersectsMesh(m, false);
                    if (tryPick.hit && isFinite(tryPick.pickedPoint.x) && isFinite(tryPick.pickedPoint.x) && isFinite(tryPick.pickedPoint.x)) {
                        pickInfo = tryPick;
                    }
                }
            });
        }
        return pickInfo;
    }

    public static WorldPositionToChuncks(world: BABYLON.Vector3, radius: number = 1.74): Chunck[] {
        let sqrRadius = radius * radius;
        
        let I = Math.floor(world.x / CHUNCK_SIZE);
        let J = Math.floor(world.y / CHUNCK_SIZE);
        let K = Math.floor(world.z / CHUNCK_SIZE);

        let rMin = Math.floor(- radius);
        let rMax = Math.ceil(radius);

        let chuncks: Chunck[] = [];

        for (let i = rMin; i <= rMax; i++) {
            for (let j = rMin; j <= rMax; j++) {
                for (let k = rMin; k <= rMax; k++) {
                    let dd = i * i + j * j + k * k;
                    if (dd <= sqrRadius) {
                        let chunck = Main.ChunckManager.getChunck(I + i, J + j, K + k);
                        if (chunck) {
                            chuncks.push(chunck);
                        }
                    }
                }
            }
        }

        return chuncks;
    }

    public static WorldPositionToChunck(world: BABYLON.Vector3): Chunck {
        let I = Math.floor(world.x / CHUNCK_SIZE);
        let J = Math.floor(world.y / CHUNCK_SIZE);
        let K = Math.floor(world.z / CHUNCK_SIZE);

        return Main.ChunckManager.getChunck(I, J, K);
    }

    public static WorldPositionToChunckBlockCoordinates_V1(world: BABYLON.Vector3): { chunck: Chunck, coordinates: BABYLON.Vector3 } {
        let I = Math.floor(world.x / CHUNCK_SIZE);
        let J = Math.floor(world.y / CHUNCK_SIZE);
        let K = Math.floor(world.z / CHUNCK_SIZE);

        let coordinates = world.clone();
        coordinates.x = Math.floor(2 * (coordinates.x - I * CHUNCK_SIZE)) / 2;
        coordinates.y = Math.floor(4 * (coordinates.y - J * CHUNCK_SIZE)) / 4;
        coordinates.z = Math.floor(2 * (coordinates.z - K * CHUNCK_SIZE)) / 2;
        
        return {
            chunck: Main.ChunckManager.getChunck(I, J, K),
            coordinates: coordinates
        }
    }

    public static WorldPositionToChunckBlockCoordinates_V2(world: BABYLON.Vector3): { chunck: Chunck, coordinates: BABYLON.Vector3 } {
        let I = Math.floor(world.x / (CHUNCK_SIZE * 1.6));
        let J = Math.floor(world.y / (CHUNCK_SIZE * 0.96));
        let K = Math.floor(world.z / (CHUNCK_SIZE * 1.6));

        let coordinates = world.clone();
        coordinates.x = Math.floor(2 * (coordinates.x - I * CHUNCK_SIZE * 1.6)) / 2;
        coordinates.y = Math.floor(2 * (coordinates.y - J * CHUNCK_SIZE * 0.96)) / 2;
        coordinates.z = Math.floor(2 * (coordinates.z - K * CHUNCK_SIZE * 1.6)) / 2;
        
        return {
            chunck: Main.ChunckManager.getChunck(I, J, K),
            coordinates: coordinates
        }
    }

    public static WorldPositionToChunckBrickCoordinates_V2(world: BABYLON.Vector3): { chunck: Chunck, coordinates: BABYLON.Vector3 } {
        let I = Math.floor(world.x / (CHUNCK_SIZE * 1.6));
        let J = Math.floor(world.y / (CHUNCK_SIZE * 0.96));
        let K = Math.floor(world.z / (CHUNCK_SIZE * 1.6));

        let coordinates = world.clone();
        coordinates.x -= I * CHUNCK_SIZE * 1.6;
        coordinates.y -= J * CHUNCK_SIZE * 0.96;
        coordinates.z -= K * CHUNCK_SIZE * 1.6;

        coordinates.x = Math.round(coordinates.x / 0.8);
        coordinates.y = Math.floor(coordinates.y / 0.32);
        coordinates.z = Math.round(coordinates.z / 0.8);
        
        return {
            chunck: Main.ChunckManager.getChunck(I, J, K),
            coordinates: coordinates
        }
    }

    public static WorldPositionToTileBrickCoordinates(world: BABYLON.Vector3): { tile: Tile, i: number, j: number, k: number} {
        let iGlobal = Math.round(world.x / DX);
        let jGlobal = Math.round(world.z / DX);

        let I = Math.floor(iGlobal / TILE_SIZE / 2);
        let J = Math.floor(jGlobal / TILE_SIZE / 2);

        let tile = TileManager.GetTile(I, J);

        let i = Math.round((world.x - I * (TILE_SIZE * DX * 2)) / DX);
        let j = Math.round((world.z - J * (TILE_SIZE * DX * 2)) / DX);
        let k = Math.floor(world.y / DY);

        return {
            tile: tile,
            i: i,
            j: j,
            k: k
        };
    }

    public static XYScreenToChunckV1Coordinates(x: number, y: number, behindPickedFace: boolean = false): { chunck: Chunck_V1, coordinates: BABYLON.Vector3 } {
        let pickInfo = Main.Scene.pick(
            x, y,
            (m) => {
                return m instanceof Chunck_V1;
            }
        );
        let pickedMesh = pickInfo.pickedMesh;
        if (pickedMesh instanceof Chunck_V1) {
            let chunck = pickedMesh as Chunck_V1;
            let localPickedPoint = pickInfo.pickedPoint.subtract(chunck.position);
            let n = pickInfo.getNormal();
            localPickedPoint.subtractInPlace(n.scale(0.5));
            let coordinates = new BABYLON.Vector3(
                Math.floor(localPickedPoint.x),
                Math.floor(localPickedPoint.y),
                Math.floor(localPickedPoint.z)
            );
            let absN = new BABYLON.Vector3(
                Math.abs(n.x),
                Math.abs(n.y),
                Math.abs(n.z)
            );
            if (!behindPickedFace) {
                if (absN.x > absN.y && absN.x > absN.z) {
                    if (n.x > 0) {
                        coordinates.x++;
                    }
                    else {
                        coordinates.x--;
                    }
                }
                if (absN.y > absN.x && absN.y > absN.z) {
                    if (n.y > 0) {
                        coordinates.y++;
                    }
                    else {
                        coordinates.y--;
                    }
                }
                if (absN.z > absN.x && absN.z > absN.y) {
                    if (n.z > 0) {
                        coordinates.z++;
                    }
                    else {
                        coordinates.z--;
                    }
                }
            }
            return {
                chunck: chunck,
                coordinates: coordinates
            }
        }
    }

    public static XYScreenToChunckV2Coordinates(x: number, y: number, behindPickedFace: boolean = false): { chunck: Chunck_V2, coordinates: BABYLON.Vector3 } {
        let pickInfo = Main.Scene.pick(
            x, y,
            (m) => {
                return m instanceof Chunck_V2;
            }
        );
        let pickedMesh = pickInfo.pickedMesh;
        if (pickedMesh instanceof Chunck_V2) {
            let chunck = pickedMesh as Chunck_V2;
            let localPickedPoint = pickInfo.pickedPoint.subtract(chunck.position);
            let n = pickInfo.getNormal();
            let absN = new BABYLON.Vector3(
                Math.abs(n.x),
                Math.abs(n.y),
                Math.abs(n.z)
            );
            if (absN.x > absN.y && absN.x > absN.z) {
                localPickedPoint.x -= Math.sign(n.x) * DX;
            }
            if (absN.y > absN.x && absN.y > absN.z) {
                localPickedPoint.y -= Math.sign(n.y) * DY * 1.5;
            }
            if (absN.z > absN.x && absN.z > absN.y) {
                
                localPickedPoint.z -= Math.sign(n.z) * DX;
            }
            let coordinates = new BABYLON.Vector3(
                Math.round(localPickedPoint.x / 1.6),
                Math.floor(localPickedPoint.y / 0.96) + 1,
                Math.round(localPickedPoint.z / 1.6)
            );
            if (!behindPickedFace) {
                if (absN.x > absN.y && absN.x > absN.z) {
                    if (n.x > 0) {
                        coordinates.x++;
                    }
                    else {
                        coordinates.x--;
                    }
                }
                if (absN.y > absN.x && absN.y > absN.z) {
                    if (n.y > 0) {
                        coordinates.y++;
                    }
                    else {
                        coordinates.y--;
                    }
                }
                if (absN.z > absN.x && absN.z > absN.y) {
                    if (n.z > 0) {
                        coordinates.z++;
                    }
                    else {
                        coordinates.z--;
                    }
                }
            }
            return {
                chunck: chunck,
                coordinates: coordinates
            }
        }
    }
}