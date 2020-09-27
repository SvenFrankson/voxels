class DebugMesh {

    public position: BABYLON.Vector3;
    public mesh: BABYLON.LinesMesh | BABYLON.Mesh;
    public creationTime: number = 0;
    public duration: number = - 1;

    constructor() {
        this.creationTime = performance.now();
    }

    protected _update = () => {
        if (this.duration > 0) {
            if (performance.now() - this.creationTime > this.duration) {
                this.dispose();
            }
        }
    }

    public dispose(): void {
        if (this.mesh) {
            this.mesh.dispose();
        }
        Main.Scene.onBeforeRenderObservable.removeCallback(this._update);
    }
}

class DebugCross extends DebugMesh {
    
    public static CreateCross(size: number, color: BABYLON.Color3 | BABYLON.Color4, position: BABYLON.Vector3, duration: number = - 1): DebugCross {
        let debugCross = new DebugCross();
        debugCross.mesh = new BABYLON.LinesMesh("DebugCross");
        debugCross.mesh.isPickable = false;

        let s = size * 0.5;
        let lines = [
            [new BABYLON.Vector3(- s, 0, 0), new BABYLON.Vector3(s, 0, 0)],
            [new BABYLON.Vector3(0, - s, 0), new BABYLON.Vector3(0, s, 0)],
            [new BABYLON.Vector3(0, 0, - s), new BABYLON.Vector3(0, 0, s)]
        ]

        let c: BABYLON.Color4;
        if (color instanceof BABYLON.Color4) {
            c = color;
        }
        else {
            c = new BABYLON.Color4(color.r, color.g, color.b, 1);
        }
        let colors = [
            [c, c],
            [c, c],
            [c, c]
        ];

        BABYLON.VertexData.CreateLineSystem({ lines: lines, colors: colors}).applyToMesh(debugCross.mesh);

        debugCross.mesh.position = position;

        debugCross.duration = duration;

        Main.Scene.onBeforeRenderObservable.add(debugCross._update)

        return debugCross;
    }
}

class DebugCrosses extends DebugMesh {
    
    public static CreateCrosses(size: number, height: number, color: BABYLON.Color3 | BABYLON.Color4, positions: BABYLON.Vector3[], duration: number = - 1): DebugCross {
        let debugCrosses = new DebugCrosses();
        debugCrosses.mesh = new BABYLON.LinesMesh("DebugCrosses");
        debugCrosses.mesh.isPickable = false;

        let s = size * 0.5;
        let h = height * 0.5;
        let c: BABYLON.Color4;
        if (color instanceof BABYLON.Color4) {
            c = color;
        }
        else {
            c = new BABYLON.Color4(color.r, color.g, color.b, 1);
        }

        let lines = [];
        let colors = [];

        for (let i = 0; i < positions.length; i++) {
            let p = positions[i];

            lines.push(
                [new BABYLON.Vector3(- s + p.x, 0 + p.y, 0 + p.z), new BABYLON.Vector3(s + p.x, 0 + p.y, 0 + p.z)],
                [new BABYLON.Vector3(0 + p.x, - h + p.y, 0 + p.z), new BABYLON.Vector3(0 + p.x, h + p.y, 0 + p.z)],
                [new BABYLON.Vector3(0 + p.x, 0 + p.y, - s + p.z), new BABYLON.Vector3(0 + p.x, 0 + p.y, s + p.z)]
            );

            colors.push(
                [c, c],
                [c, c],
                [c, c]
            );
        }        

        BABYLON.VertexData.CreateLineSystem({ lines: lines, colors: colors}).applyToMesh(debugCrosses.mesh);

        debugCrosses.duration = duration;

        Main.Scene.onBeforeRenderObservable.add(debugCrosses._update)

        return debugCrosses;
    }
}

class DebugBox extends DebugMesh {
    
    public static CreateBoxP0P1(
        p0: BABYLON.Vector3,
        p1: BABYLON.Vector3,
        color: BABYLON.Color3 | BABYLON.Color4,
        duration: number = - 1
    ): DebugBox {
        let width = Math.abs(p0.x - p1.x);
        let height = Math.abs(p0.y - p1.y);
        let depth = Math.abs(p0.z - p1.z);
        let position = p0.add(p1).scaleInPlace(0.5);
        return DebugBox.CreateBox(width, height, depth, color, position, duration);
    }

    public static CreateBox(
        width: number,
        height: number,
        depth: number,
        color: BABYLON.Color3 | BABYLON.Color4,
        position: BABYLON.Vector3,
        duration: number = - 1
    ): DebugBox {
        let debugBox = new DebugBox();
        debugBox.mesh = new BABYLON.Mesh("DebugMesh");
        debugBox.mesh.isPickable = false;

        BABYLON.VertexData.CreateBox({ width: width, height: height, depth: depth, sideOrientation: BABYLON.Mesh.DOUBLESIDE }).applyToMesh(debugBox.mesh);

        debugBox.mesh.position = position;

        debugBox.duration = duration;

        let material = new BABYLON.StandardMaterial("StandardMaterial", Main.Scene);
        material.diffuseColor.copyFromFloats(color.r, color.g, color.b);
        if (color instanceof BABYLON.Color4) {
            material.alpha = color.a;
        }
        material.specularColor.copyFromFloats(0, 0, 0);
        debugBox.mesh.material = material;

        Main.Scene.onBeforeRenderObservable.add(debugBox._update)

        return debugBox;
    }
}