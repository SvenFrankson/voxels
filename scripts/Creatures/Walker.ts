class Walker extends BABYLON.Mesh {

    public leftFoot: BABYLON.Mesh;
    public leftLeg: BABYLON.Mesh;
    public leftHip: BABYLON.Mesh;
    public leftHipJoin: BABYLON.Mesh;

    public rightFoot: BABYLON.Mesh;
    public rightLeg: BABYLON.Mesh;
    public rightHip: BABYLON.Mesh;
    public rightHipJoin: BABYLON.Mesh;

    public body: BABYLON.Mesh;

    public bodySpeed: BABYLON.Vector3 = BABYLON.Vector3.Zero();

    public async instantiate(): Promise<void> {
        let data = await VertexDataLoader.instance.get("walker");
        this.leftFoot = new BABYLON.Mesh("left-foot");
        data[0].applyToMesh(this.leftFoot);

        this.rightFoot = new BABYLON.Mesh("right-foot");
        data[0].applyToMesh(this.rightFoot);

        this.body = BABYLON.MeshBuilder.CreateBox("body", { width: 2, height: 1.5, depth: 3});

        this.leftHipJoin = BABYLON.MeshBuilder.CreateSphere("left-hip-join", { diameter: 0.5 }, this.getScene());
        this.leftHipJoin.position.copyFromFloats(-1, -0.75, 0);
        this.leftHipJoin.parent = this.body;

        this.rightHipJoin = BABYLON.MeshBuilder.CreateSphere("right-hip-join", { diameter: 0.5 }, this.getScene());
        this.rightHipJoin.position.copyFromFloats(1, -0.75, 0);
        this.rightHipJoin.parent = this.body;

        this.leftLeg = BABYLON.MeshBuilder.CreateBox("left-leg", { width: 0.2, height: 2, depth: 0.2 });
        this.leftHip = BABYLON.MeshBuilder.CreateBox("left-leg", { width: 0.2, height: 2, depth: 0.2 });

        this.rightLeg = BABYLON.MeshBuilder.CreateBox("right-leg", { width: 0.2, height: 2, depth: 0.2 });
        this.rightHip = BABYLON.MeshBuilder.CreateBox("right-leg", { width: 0.2, height: 2, depth: 0.2 });

        this.getScene().onBeforeRenderObservable.add(this.update);

        let loop = async () => {
            while (true) {
                await this.moveLeftFootTo(this.leftFoot.position.add(new BABYLON.Vector3(0, 0, 2 + Math.random())));
                await this.moveRightFootTo(this.rightFoot.position.add(new BABYLON.Vector3(0, 0, 2 + Math.random())));
            }
        }
        setTimeout(
            () => {
                loop();
            },
            1000
        )
    }

    public async moveLeftFootTo(p: BABYLON.Vector3): Promise<void> {
        return new Promise<void>(
            resolve => {
                let pZero = this.leftFoot.position.clone();
                let i = 1;
                let step = () => {
                    this.leftFoot.position = BABYLON.Vector3.Lerp(pZero, p, i / 60);
                    this.leftFoot.position.y += 2 * Math.sin(i / 60 * Math.PI);
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
                let i = 1;
                let step = () => {
                    this.rightFoot.position = BABYLON.Vector3.Lerp(pZero, p, i / 60);
                    this.rightFoot.position.y += 2 * Math.sin(i / 60 * Math.PI);
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
        this.bodySpeed.addInPlace(forLeft.scale(0.015 * 5));

        let forRight = this.rightFoot.position.subtract(this.rightHipJoin.absolutePosition);
        let lenRight = forRight.length();
        forRight.scaleInPlace(1 / lenRight);
        forRight.scaleInPlace(lenRight - 3);
        this.bodySpeed.addInPlace(forRight.scale(0.015 * 5));

        let center = this.leftFoot.position.add(this.rightFoot.position).scaleInPlace(0.5);
        let forCenter = center.subtract(this.body.position);
        forCenter.y = 0;
        let lenCenter = forCenter.length();
        forCenter.scaleInPlace(1 / lenCenter);
        forCenter.scaleInPlace(lenCenter);

        this.bodySpeed.addInPlace(forCenter.scale(0.015 * 2));

        let localZ = this.body.getDirection(BABYLON.Axis.Z);

        let leftKneePos = this.leftFoot.position.add(this.leftHipJoin.absolutePosition).scaleInPlace(0.5);
        leftKneePos.subtractInPlace(localZ.scale(2));
        this.leftLeg.position.copyFrom(this.leftFoot.position);
        this.leftLeg.position.addInPlace(leftKneePos);
        this.leftLeg.position.scaleInPlace(0.5);
        this.leftLeg.lookAt(leftKneePos, 0, Math.PI / 2);

        this.leftHip.position.copyFrom(this.leftHipJoin.absolutePosition);
        this.leftHip.position.addInPlace(leftKneePos);
        this.leftHip.position.scaleInPlace(0.5);
        this.leftHip.lookAt(leftKneePos, 0, Math.PI / 2);

        let rightKneePos = this.rightFoot.position.add(this.rightHipJoin.absolutePosition).scaleInPlace(0.5);
        rightKneePos.subtractInPlace(localZ.scale(2));
        this.rightLeg.position.copyFrom(this.rightFoot.position);
        this.rightLeg.position.addInPlace(rightKneePos);
        this.rightLeg.position.scaleInPlace(0.5);
        this.rightLeg.lookAt(rightKneePos, 0, Math.PI / 2);

        this.rightHip.position.copyFrom(this.rightHipJoin.absolutePosition);
        this.rightHip.position.addInPlace(rightKneePos);
        this.rightHip.position.scaleInPlace(0.5);
        this.rightHip.lookAt(rightKneePos, 0, Math.PI / 2);

        this.body.position.addInPlace(this.bodySpeed.scale(0.015));
        this.bodySpeed.scaleInPlace(0.99);
    }
}