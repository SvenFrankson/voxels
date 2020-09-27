var ACTIVE_DEBUG_CHUNCK_INTERSECTION = false;

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
        if (chunck instanceof Chunck_V1) {
            return Intersections3D.SphereChunck_V1(center, radius, chunck);
        }
        if (chunck instanceof Chunck_V2) {
            return Intersections3D.SphereChunck_V2(center, radius, chunck);
        }
    }

    public static SphereChunck_V1(center: BABYLON.Vector3, radius: number, chunck: Chunck_V1): SphereIntersection[] {
        let intersections: SphereIntersection[] = [];
        if (!chunck.isEmpty) {
            center = center.subtract(chunck.position);
            if (Intersections3D.SphereCube(center, radius, chunck.getBoundingInfo().minimum, chunck.getBoundingInfo().maximum)) {
                let min = center.clone();
                min.x = Math.floor(min.x - radius);
                min.y = Math.floor(min.y - radius);
                min.z = Math.floor(min.z - radius);
                let max = center.clone();
                max.x = Math.ceil(max.x + radius);
                max.y = Math.ceil(max.y + radius);
                max.z = Math.ceil(max.z + radius);
                for (let i = min.x; i <= max.x; i += 1) {
                    for (let j = min.y; j <= max.y; j += 1) {
                        for (let k = min.z; k <= max.z; k += 1) {
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

    public static SphereChunck_V2(centerWorld: BABYLON.Vector3, radius: number, chunck: Chunck_V2): SphereIntersection[] {
        let intersections: SphereIntersection[] = [];
        if (!chunck.isEmpty) {
            let chunckMin = new BABYLON.Vector3(
                chunck.barycenter.x - CHUNCK_SIZE * 1.6 * 0.5,
                chunck.barycenter.y - CHUNCK_SIZE * 0.96 * 0.5,
                chunck.barycenter.z - CHUNCK_SIZE * 1.6 * 0.5,
            );
            let chunckMax = new BABYLON.Vector3(
                chunck.barycenter.x + CHUNCK_SIZE * 1.6 * 0.5,
                chunck.barycenter.y + (CHUNCK_SIZE + 1) * 0.96 * 0.5,
                chunck.barycenter.z + CHUNCK_SIZE * 1.6 * 0.5,
            )
            if (Intersections3D.SphereCube(centerWorld, radius, chunckMin, chunckMax)) {
                let center = centerWorld.subtract(chunck.position);
                let min = center.clone();
                min.x = Math.floor((min.x - radius) / 1.6);
                min.y = Math.floor((min.y - radius) / 0.96);
                min.z = Math.floor((min.z - radius) / 1.6);
                let max = center.clone();
                max.x = Math.ceil((max.x + radius) / 1.6);
                max.y = Math.ceil((max.y + radius) / 0.96);
                max.z = Math.ceil((max.z + radius) / 1.6);
                for (let i = min.x; i <= max.x; i += 1) {
                    for (let j = min.y; j <= max.y; j += 1) {
                        for (let k = min.z; k <= max.z; k += 1) {
                            if (chunck.getCube(i, j, k)) {
                                let intersection = Intersections3D.SphereCube(
                                    center,
                                    radius,
                                    new BABYLON.Vector3(i * 1.6 - 0.8, (j - 1) * 0.96, k * 1.6 - 0.8),
                                    new BABYLON.Vector3((i + 1) * 1.6 - 0.8, j * 0.96, (k + 1) * 1.6 - 0.8)
                                );
                                if (intersection) {
                                    if (ACTIVE_DEBUG_CHUNCK_INTERSECTION) {
                                        DebugCross.CreateCross(0.5, BABYLON.Color3.Red(), intersection.point, 100);
                                    }
                                    intersection.point.addInPlace(chunck.position);
                                    intersections.push(intersection);
                                }
                            }
                        }
                    }
                }

                min.copyFrom(center);
                min.x = Math.floor((min.x - radius) / DX);
                min.y = Math.floor((min.y - radius) / DY);
                min.z = Math.floor((min.z - radius) / DX);
                max.copyFrom(center);
                max.x = Math.ceil((max.x + radius) / DX);
                max.y = Math.ceil((max.y + radius) / DY);
                max.z = Math.ceil((max.z + radius) / DX);
                for (let i = min.x; i <= max.x; i += 1) {
                    for (let j = min.y; j <= max.y; j += 1) {
                        for (let k = min.z; k <= max.z; k += 1) {
                            if (chunck.getLockSafe(i, j, k)) {
                                let intersection = Intersections3D.SphereCube(
                                    center,
                                    radius,
                                    new BABYLON.Vector3(i * DX - DX05, j * DY, k * DX - DX05),
                                    new BABYLON.Vector3((i + 1) * DX - DX05, (j + 1) * DY, (k + 1) * DX - DX05)
                                );
                                if (intersection) {
                                    if (ACTIVE_DEBUG_CHUNCK_INTERSECTION) {
                                        DebugCross.CreateCross(0.5, BABYLON.Color3.Red(), intersection.point, 100);
                                    }
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

    public static RayChunck(ray: BABYLON.Ray, chunck: Chunck_V1): RayIntersection {
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