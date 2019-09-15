class RayIntersection {

    constructor(
        public point: BABYLON.Vector3,
        public normal: BABYLON.Vector3
    ) {

    }
}

class Intersections3D {

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