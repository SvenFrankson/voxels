class PauseMenu {

    public background: HTMLDivElement;
    public resumeButton: HTMLDivElement;

    constructor() {
        
    }

    public initialize(): void {
        this.background = document.createElement("div");
        this.background.style.position = "absolute";
        let canvasBBox = Main.Canvas.getBoundingClientRect();
        this.background.style.left = canvasBBox.left + "px";
        this.background.style.top = canvasBBox.top + "px";
        this.background.style.width = canvasBBox.width + "px";
        this.background.style.height = canvasBBox.height + "px";
        this.background.style.backgroundColor = "rgba(0, 0, 0, 40%)";
        this.background.style.zIndex = "1";
        document.body.appendChild(this.background);
        
        this.background.addEventListener("pointerup", () => {
            Main.Canvas.requestPointerLock();
            Main.Canvas.focus();
        });

        let update = () => {
            if (document.pointerLockElement) {
                this.background.style.display = "none";
            }
            else {
                this.background.style.display = "";
            }
            requestAnimationFrame(update);
        }
        update();
    }
}