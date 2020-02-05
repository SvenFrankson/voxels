class TreeMeshBuilder {

    public static CreateTubeVertexData(
        points: BABYLON.Vector3[],
        radiusFunction: (t: number) => number,
        color: BABYLON.Color4 = new BABYLON.Color4(1, 1, 1, 1)
    ): BABYLON.VertexData {
        let axisX: BABYLON.Vector3 = new BABYLON.Vector3(1, 0, 0);
        let axisY: BABYLON.Vector3 = new BABYLON.Vector3(0, 1, 0);
        let axisZ: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, 1);
        let lastAxisZ: BABYLON.Vector3 = axisZ.clone();

        let circle: BABYLON.Vector3[] = [];

        let positions: number[] = [];
        let indices: number[] = [];
        let normals: number[] = [];
        let colors: number[] = [];
        let uvs: number[] = [];

        let curve = BABYLON.Curve3.CreateCatmullRomSpline(points, 3);
        points = curve.getPoints();
        let length = curve.length();

        for (let i = 0; i < 6; i++) {
            circle[i] = new BABYLON.Vector3(
                Math.cos(i * Math.PI / 3),
                0,
                Math.sin(i * Math.PI / 3)
            );
        }

        let l = 0;
        for (let i = 0; i < points.length; i++) {
            let pPrev = points[i - 1];
            let p = points[i];
            let pNext = points[i + 1];
            if (pNext) {
                axisY.copyFrom(pNext);
                axisY.subtractInPlace(p);
                axisY.normalize();
            }
            else {
                axisY.copyFrom(p);
                axisY.subtractInPlace(pPrev);
                axisY.normalize();
            }

            if (pPrev) {
                l += BABYLON.Vector3.Distance(pPrev, p);
            }

            BABYLON.Vector3.CrossToRef(axisY, lastAxisZ, axisX);
            axisX.normalize();
            BABYLON.Vector3.CrossToRef(axisX, axisY, axisZ);
            lastAxisZ.copyFrom(axisZ);

            let q = BABYLON.Quaternion.RotationQuaternionFromAxis(axisX, axisY, axisZ);
            let s = radiusFunction(l / length);

            let m = BABYLON.Matrix.Compose(new BABYLON.Vector3(s, s, s), q, p);

            for (let j = 0; j < 6; j++) {
                let v0 = circle[j];
                let v = BABYLON.Vector3.TransformCoordinates(v0, m);
                positions.push(v.x, v.y, v.z);
                colors.push(color.r, color.g, color.b, color.a);
                uvs.push(0, 0);

                if (i < points.length - 1) {
                    let index = i * 6 + j;
                    if (j < 6 - 1) {
                        indices.push(index, index + 1, index + 6);
                        indices.push(index + 1, index + 6 + 1, index + 6);
                    }
                    else {
                        indices.push(index, index + 1 - 6, index + 6);
                        indices.push(index + 1 - 6, index + 1, index + 6);
                    }
                }
            }
        }

        BABYLON.VertexData.ComputeNormals(positions, indices, normals);

        let data = new BABYLON.VertexData();
        data.positions = positions;
        data.indices = indices;
        data.normals = normals;
        data.colors = colors;
        data.uvs = uvs;

        return data;
    }
}