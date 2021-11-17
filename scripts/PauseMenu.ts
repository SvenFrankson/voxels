enum MenuPage {
    Pause,
    Inventory
}

class MenuManager {

    public pauseMenu: PauseMenu;
    public inventory: Inventory;

    public currentMenu: MenuPage = MenuPage.Pause;

    public initialize(): void {
        let update = () => {
            if (document.pointerLockElement) {
                if (this.pauseMenu) {
                    this.pauseMenu.background.style.display = "none";
                }
                if (this.inventory) {
                    this.inventory.body.style.display = "none";
                }
            }
            if (this.currentMenu === MenuPage.Pause && this.pauseMenu) {
                if (!document.pointerLockElement) {
                    this.pauseMenu.background.style.display = "";
                }
            }
            else if (this.currentMenu === MenuPage.Inventory && this.inventory) {
                if (!document.pointerLockElement) {
                    this.inventory.body.style.display = "";
                }
            }
            if (this.currentMenu === undefined) {
                this.currentMenu = MenuPage.Pause;
            }
            requestAnimationFrame(update);
        }
        update();
    }
}

class PauseMenu {

    public background: HTMLDivElement;

    public optionsButton: HTMLButtonElement;
    public saveButton: HTMLButtonElement;
    public resumeButton: HTMLButtonElement;

    constructor() {
        Main.MenuManager.pauseMenu = this;
    }

    public initialize(): void {
        let canvasBBox = Main.Canvas.getBoundingClientRect();
        let w = canvasBBox.width;
        let h = canvasBBox.height;

        this.background = document.getElementById("pause-menu") as HTMLDivElement;
        this.background.style.position = "absolute";
        this.background.style.left = canvasBBox.left + "px";
        this.background.style.top = canvasBBox.top + "px";
        this.background.style.width = w + "px";
        this.background.style.height = h + "px";
        this.background.style.backgroundColor = "rgba(0, 0, 0, 40%)";
        this.background.style.zIndex = "1";

        this.optionsButton = document.getElementById("options-button") as HTMLButtonElement;
        this.optionsButton.style.left = Math.floor((canvasBBox.width - 240) * 0.5) + "px";
        this.optionsButton.style.top = (h * 0.5 - 160) + "px";
        this.saveButton = document.getElementById("save-button") as HTMLButtonElement;
        this.saveButton.style.left = Math.floor((canvasBBox.width - 240) * 0.5) + "px";
        this.saveButton.style.top = (h * 0.5 - 40) + "px";
        this.resumeButton = document.getElementById("resume-button") as HTMLButtonElement;
        this.resumeButton.style.left = Math.floor((canvasBBox.width - 240) * 0.5) + "px";
        this.resumeButton.style.top = (h * 0.5 + 80) + "px";
        
        this.resumeButton.addEventListener("pointerup", () => {
            Main.Canvas.requestPointerLock();
            Main.Canvas.focus();
        });

        this.saveButton.addEventListener("pointerup", () => {
            let data = Main.ChunckManager.serialize();
            let stringData = JSON.stringify(data);
            window.localStorage.setItem("player-test-scene", stringData);
            
            let playerData = PlayerTest.Player.serialize();
            let playerStringData = JSON.stringify(playerData);
            window.localStorage.setItem("player-test-player", playerStringData);
        });
    }
}