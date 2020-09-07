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

    public static WorldPositionToChunckBlockCoordinates(world: BABYLON.Vector3): { chunck: Chunck, coordinates: BABYLON.Vector3 } {
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

    public static XYScreenToChunckCoordinates(x: number, y: number, behindPickedFace: boolean = false): { chunck: Chunck_V1, coordinates: BABYLON.Vector3 } {
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
}