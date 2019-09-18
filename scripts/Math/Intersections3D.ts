class RayIntersection {

    constructor(
        public point: BABYLON.Vector3,
        public normal: BABYLON.Vector3
    ) {

    }
}

class SphereIntersection {

    constructor(
        public point: BABYLON.Vector3
    ) {

    }
}

class Intersections3D {

    public static SphereCube(center: BABYLON.Vector3, radius: number, min: BABYLON.Vector3, max: BABYLON.Vector3): SphereIntersection {
        let closest = center.clone();
        if (closest.x < min.x) {
            closest.x = min.x;
        }
        else if (closest.x > max.x) {
            closest.x = max.x;
        }
        if (closest.y < min.y) {
            closest.y = min.y;
        }
        else if (closest.y > max.y) {
            closest.y = max.y;
        }
        if (closest.z < min.z) {
            closest.z = min.z;
        }
        else if (closest.z > max.z) {
            closest.z = max.z;
        }
        if (BABYLON.Vector3.DistanceSquared(center, closest) < radius * radius) {
            return new SphereIntersection(closest);
        }
        return undefined;
    }

    public static SphereChunck(center: BABYLON.Vector3, radius: number, chunck: Chunck): SphereIntersection[] {
        let intersections: SphereIntersection[] = [];
        if (!chunck.isEmpty) {
            center = center.subtract(chunck.position);
            if (Intersections3D.SphereCube(center, radius, chunck.getBoundingInfo().minimum, chunck.getBoundingInfo().maximum)) {
                let min = center;
                min.x = Math.floor(min.x - radius);
                min.y = Math.floor(min.y - radius);
                min.z = Math.floor(min.z - radius);
                let max = center;
                max.x = Math.ceil(max.x + radius);
                max.y = Math.ceil(max.y + radius);
                max.z = Math.ceil(max.z + radius);
                for (let i = min.x; i <= max.x; i++) {
                    for (let j = min.y; j <= max.y; j++) {
                        for (let k = min.z; k <= max.z; k++) {
                            if (chunck.getCube(i, j, k)) {
                                let intersection = Intersections3D.SphereCube(center, radius, new BABYLON.Vector3(i, j, k), new BABYLON.Vector3(i + 1, j + 1, k+ 1));
                                if (intersection) {
                                    intersection.point.addInPlace(chunck.position);
                                    intersections.push(intersection);
                                }
                            }
                        }
                    }
                }
            }
        }
        return intersections;
    }

    public static RayChunck(ray: BABYLON.Ray, chunck: Chunck): RayIntersection {
        let pickingInfo = chunck.getScene().pickWithRay(
            ray,
            (m) => {
                return m === chunck;
            }
        );
        return new RayIntersection(
            pickingInfo.pickedPoint,
            pickingInfo.getNormal()
        );
    }
}