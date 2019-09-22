class ChunckUtils {

    public static XYScreenToChunckCoordinates(x: number, y: number, behindPickedFace: boolean = false): { chunck: Chunck, coordinates: BABYLON.Vector3 } {
        let pickInfo = Main.Scene.pick(
            x, y,
            (m) => {
                return m instanceof Chunck;
            }
        );
        let pickedMesh = pickInfo.pickedMesh;
        if (pickedMesh instanceof Chunck) {
            let chunck = pickedMesh as Chunck;
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