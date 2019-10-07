class Walker extends BABYLON.Mesh {

    public leftFoot: BABYLON.Mesh;
    public leftLeg: BABYLON.Mesh;
    public leftKnee: BABYLON.Mesh;
    public leftHip: BABYLON.Mesh;
    public leftHipJoin: BABYLON.Mesh;
    public leftFootJoin: BABYLON.Mesh;

    public rightFoot: BABYLON.Mesh;
    public rightLeg: BABYLON.Mesh;
    public rightKnee: BABYLON.Mesh;
    public rightHip: BABYLON.Mesh;
    public rightHipJoin: BABYLON.Mesh;
    public rightFootJoin: BABYLON.Mesh;

    public body: BABYLON.Mesh;

    public bodySpeed: BABYLON.Vector3 = BABYLON.Vector3.Zero();

    public async instantiate(): Promise<void> {
        let data = await VertexDataLoader.instance.get("walker");
        this.leftFoot = new BABYLON.Mesh("left-foot");
        data[0].applyToMesh(this.leftFoot);

        this.rightFoot = new BABYLON.Mesh("right-foot");
        data[0].applyToMesh(this.rightFoot);

        this.leftFootJoin = BABYLON.MeshBuilder.CreateSphere("left-foot-join", { diameter: 0.3 }, this.getScene());
        this.leftFootJoin.position.copyFromFloats(0, 0.6, -0.4);
        this.leftFootJoin.parent = this.leftFoot;

        this.rightFootJoin = BABYLON.MeshBuilder.CreateSphere("right-foot-join", { diameter: 0.3 }, this.getScene());
        this.rightFootJoin.position.copyFromFloats(0, 0.6, -0.4);
        this.rightFootJoin.parent = this.rightFoot;

        this.body = BABYLON.MeshBuilder.CreateBox("body", { width: 2, height: 1.5, depth: 3});

        this.leftHipJoin = BABYLON.MeshBuilder.CreateSphere("left-hip-join", { diameter: 0.5 }, this.getScene());
        this.leftHipJoin.position.copyFromFloats(-1, -0.75, 0);
        this.leftHipJoin.parent = this.body;

        this.rightHipJoin = BABYLON.MeshBuilder.CreateSphere("right-hip-join", { diameter: 0.5 }, this.getScene());
        this.rightHipJoin.position.copyFromFloats(1, -0.75, 0);
        this.rightHipJoin.parent = this.body;

        this.leftLeg = BABYLON.MeshBuilder.CreateBox("left-leg", { width: 0.2, height: 2.5, depth: 0.2 });
        this.leftHip = BABYLON.MeshBuilder.CreateBox("left-leg", { width: 0.2, height: 2.5, depth: 0.2 });

        this.leftKnee = BABYLON.MeshBuilder.CreateSphere("left-knee", { diameter: 0.3 }, this.getScene());

        this.rightLeg = BABYLON.MeshBuilder.CreateBox("right-leg", { width: 0.2, height: 2.5, depth: 0.2 });
        this.rightHip = BABYLON.MeshBuilder.CreateBox("right-leg", { width: 0.2, height: 2.5, depth: 0.2 });

        this.rightKnee = BABYLON.MeshBuilder.CreateSphere("right-knee", { diameter: 0.3 }, this.getScene());

        this.getScene().onBeforeRenderObservable.add(this.update);

        let loop = async () => {
            while (true) {
                await this.moveLeftFootTo(this.nextLeftFootPos());
                await this.moveRightFootTo(this.nextRightFootPos());
            }
        }
        setTimeout(
            () => {
                loop();
            },
            5000
        )
    }

    public nextLeftFootPos(): BABYLON.Vector3 {
        let ray = new BABYLON.Ray(this.leftHipJoin.absolutePosition, (new BABYLON.Vector3(- 0.1, - 1.5, 1).normalize()));
        let pick = this.getScene().pickWithRay(
            ray,
            (m) => {
                return m instanceof Chunck;
            }
        )
        if (pick.hit) {
            if (BABYLON.Vector3.DistanceSquared(pick.pickedPoint, this.leftHipJoin.absolutePosition) < 25) {
                if (Math.abs(pick.pickedPoint.y - this.leftFoot.position.y) < 1.5) {
                    return pick.pickedPoint;
                }
            }
        }
        return this.leftFoot.position.clone();
    }

    public nextRightFootPos(): BABYLON.Vector3 {
        let ray = new BABYLON.Ray(this.rightHipJoin.absolutePosition, (new BABYLON.Vector3(0.1, - 1.5, 1).normalize()));
        let pick = this.getScene().pickWithRay(
            ray,
            (m) => {
                return m instanceof Chunck;
            }
        )
        if (pick.hit) {
            if (BABYLON.Vector3.DistanceSquared(pick.pickedPoint, this.rightHipJoin.absolutePosition) < 25) {
                if (Math.abs(pick.pickedPoint.y - this.rightFoot.position.y) < 1.5) {
                    return pick.pickedPoint;
                }
            }
        }
        return this.rightFoot.position.clone();
    }

    public async moveLeftFootTo(p: BABYLON.Vector3): Promise<void> {
        return new Promise<void>(
            resolve => {
                let pZero = this.leftFoot.position.clone();
                let d = BABYLON.Vector3.Distance(p, pZero);
                let i = 1;
                let step = () => {
                    this.leftFoot.position = BABYLON.Vector3.Lerp(pZero, p, (i / 60) * (i / 60));
                    this.leftFoot.position.y += d * 0.5 * Math.sin((i / 60) * (i / 60) * Math.PI);
                    if (i < 60) {
                        i++;
                        requestAnimationFrame(step);
                    }
                    else {
                        resolve();
                    }
                }
                step();
            }
        )
    }

    public async moveRightFootTo(p: BABYLON.Vector3): Promise<void> {
        return new Promise<void>(
            resolve => {
                let pZero = this.rightFoot.position.clone();
                let d = BABYLON.Vector3.Distance(p, pZero);
                let i = 1;
                let step = () => {
                    this.rightFoot.position = BABYLON.Vector3.Lerp(pZero, p, (i / 60) * (i / 60));
                    this.rightFoot.position.y += d * 0.5 * Math.sin((i / 60) * (i / 60) * Math.PI);
                    if (i < 60) {
                        i++;
                        requestAnimationFrame(step);
                    }
                    else {
                        resolve();
                    }
                }
                step();
            }
        )
    }

    public update = () => {
        let forLeft = this.leftFoot.position.subtract(this.leftHipJoin.absolutePosition);
        let lenLeft = forLeft.length();
        forLeft.scaleInPlace(1 / lenLeft);
        forLeft.scaleInPlace(lenLeft - 3);
        this.bodySpeed.addInPlace(forLeft.scale(0.015 * 15));

        let forRight = this.rightFoot.position.subtract(this.rightHipJoin.absolutePosition);
        let lenRight = forRight.length();
        forRight.scaleInPlace(1 / lenRight);
        forRight.scaleInPlace(lenRight - 3);
        this.bodySpeed.addInPlace(forRight.scale(0.015 * 15));

        let center = this.leftFoot.position.add(this.rightFoot.position).scaleInPlace(0.5);
        let forCenter = center.subtract(this.body.position);
        forCenter.y = 0;
        let lenCenter = forCenter.length();
        forCenter.scaleInPlace(1 / lenCenter);
        forCenter.scaleInPlace(lenCenter);

        this.bodySpeed.addInPlace(forCenter.scale(0.015 * 10));

        let localZ = this.body.getDirection(BABYLON.Axis.Z);

        this.leftKnee.position = this.leftFootJoin.absolutePosition.add(this.leftHipJoin.absolutePosition).scaleInPlace(0.5);
        this.leftKnee.position.subtractInPlace(localZ.scale(2));

        for (let i = 0; i < 5; i++) {
            let dHip = this.leftKnee.position.subtract(this.leftHipJoin.absolutePosition).normalize();
            this.leftKnee.position.copyFrom(this.leftHipJoin.absolutePosition).addInPlace(dHip.scale(2.5));

            let dFoot = this.leftKnee.position.subtract(this.leftFootJoin.absolutePosition).normalize();
            this.leftKnee.position.copyFrom(this.leftFootJoin.absolutePosition).addInPlace(dFoot.scale(2.5));
        }

        this.leftLeg.position.copyFrom(this.leftFootJoin.absolutePosition);
        this.leftLeg.position.addInPlace(this.leftKnee.position);
        this.leftLeg.position.scaleInPlace(0.5);
        this.leftLeg.lookAt(this.leftKnee.position, 0, Math.PI / 2);

        this.leftHip.position.copyFrom(this.leftHipJoin.absolutePosition);
        this.leftHip.position.addInPlace(this.leftKnee.position);
        this.leftHip.position.scaleInPlace(0.5);
        this.leftHip.lookAt(this.leftKnee.position, 0, Math.PI / 2);

        this.rightKnee.position = this.rightFootJoin.absolutePosition.add(this.rightHipJoin.absolutePosition).scaleInPlace(0.5);
        this.rightKnee.position.subtractInPlace(localZ.scale(2));

        for (let i = 0; i < 5; i++) {
            let dHip = this.rightKnee.position.subtract(this.rightHipJoin.absolutePosition).normalize();
            this.rightKnee.position.copyFrom(this.rightHipJoin.absolutePosition).addInPlace(dHip.scale(2.5));

            let dFoot = this.rightKnee.position.subtract(this.rightFootJoin.absolutePosition).normalize();
            this.rightKnee.position.copyFrom(this.rightFootJoin.absolutePosition).addInPlace(dFoot.scale(2.5));
        }

        this.rightLeg.position.copyFrom(this.rightFootJoin.absolutePosition);
        this.rightLeg.position.addInPlace(this.rightKnee.position);
        this.rightLeg.position.scaleInPlace(0.5);
        this.rightLeg.lookAt(this.rightKnee.position, 0, Math.PI / 2);

        this.rightHip.position.copyFrom(this.rightHipJoin.absolutePosition);
        this.rightHip.position.addInPlace(this.rightKnee.position);
        this.rightHip.position.scaleInPlace(0.5);
        this.rightHip.lookAt(this.rightKnee.position, 0, Math.PI / 2);

        this.body.position.addInPlace(this.bodySpeed.scale(0.015));
        this.body.position.y = Math.max(this.body.position.y, center.y + 1);
        this.bodySpeed.scaleInPlace(0.98);
    }
}