class DebugText3D {

    public position: BABYLON.Vector3;
    public element: HTMLDivElement;
    public creationTime: number = 0;
    public duration: number = - 1;

    public static CreateText(text: string, position: BABYLON.Vector3, duration: number = - 1): DebugText3D {
        let debugText = new DebugText3D();

        debugText.element = document.createElement("div");
        debugText.element.classList.add("debug-text-3d");
        debugText.element.innerHTML = text;
        document.body.appendChild(debugText.element);

        debugText.position = position;

        debugText.duration = duration;

        Main.Scene.onBeforeRenderObservable.add(debugText._update)

        return debugText;
    }

    private _update = () => {
        
        let screenPos = BABYLON.Vector3.Project(
            this.position,
            BABYLON.Matrix.Identity(),
            Main.Scene.getTransformMatrix(),
            Main.Camera.viewport.toGlobal(1, 1)
        );
        this.element.style.left = (screenPos.x * Main.Canvas.width) + "px";
        this.element.style.bottom = ((1 - screenPos.y) * Main.Canvas.height - this.element.clientHeight * 0.5) + "px";

        if (this.duration > 0) {
            if (performance.now() - this.creationTime > this.duration) {
                this.dispose();
            }
        }
    }

    public setText(text: string): void {
        this.element.innerHTML = text;
    }

    public dispose(): void {
        document.body.removeChild(this.element);
        Main.Scene.onBeforeRenderObservable.removeCallback(this._update);
    }
}