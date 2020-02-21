var KNOB_RADIUS_SQUARED = 0.24 * 0.24;

class TileUtils {

    public static IsKnobHit(worldPosition: BABYLON.Vector3, normal: BABYLON.Vector3): boolean {
        if (normal.y === 0) {
            console.log("a");
            let dy = worldPosition.y - Math.floor(worldPosition.y / DY) * DY;
            if (dy < 0.17) {
                let dx = worldPosition.x - Math.round(worldPosition.x / DX) * DX;
                let dz = worldPosition.z - Math.round(worldPosition.z / DX) * DX;
                let dd = dx * dx + dz * dz;
                console.log(Math.sqrt(dd));
                if (dd <= KNOB_RADIUS_SQUARED) {
                    if (dd >= KNOB_RADIUS_SQUARED * 0.6) {
                        return true;
                    }
                }
            }
        }
        else if (normal.y === 1) {
            let dy = worldPosition.y - Math.floor(worldPosition.y / DY) * DY;
            if (Math.abs(dy - 0.17) < 0.001) {
                let dx = worldPosition.x - Math.round(worldPosition.x / DX) * DX;
                let dz = worldPosition.z - Math.round(worldPosition.z / DX) * DX;
                let dd = dx * dx + dz * dz;
                if (dd <= KNOB_RADIUS_SQUARED) {
                    return true;
                }
            }
        }

        return false;
    }
}