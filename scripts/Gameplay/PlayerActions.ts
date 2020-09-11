class PlayerAction {

    public iconUrl: string;

    public onUpdate: () => void;
    public onClick: () => void;
    public onKeyUp: (e: KeyboardEvent) => void;
    public onEquip: () => void;
    public onUnequip: () => void;
}

class PlayerActionManager {

    public linkedActions: PlayerAction[] = [];

    constructor(
        public player: Player
    ) {

    }

    public register(): void {
        Main.Canvas.addEventListener("keyup", (e) => {
            let index = e.keyCode - 48;
            if (index >= 0 && index < 10) {
                for (let i = 0; i < 10; i++) {
                    document.getElementById("player-action-" + i + "-icon").style.border = "";
                    document.getElementById("player-action-" + i + "-icon").style.margin = "";
                }
                // Unequip current action
                if (this.player.currentAction) {
                    if (this.player.currentAction.onUnequip) {
                        this.player.currentAction.onUnequip();
                    }
                }
                if (this.linkedActions[index]) {
                    // If request action was already equiped, remove it.
                    if (this.player.currentAction === this.linkedActions[index]) {
                        this.player.currentAction = undefined;
                    }
                    // Equip new action.
                    else {
                        this.player.currentAction = this.linkedActions[index];
                        if (this.player.currentAction) {
                            document.getElementById("player-action-" + index + "-icon").style.border = "solid 3px white";
                            document.getElementById("player-action-" + index + "-icon").style.margin = "-2px -2px -2px 8px";
                            if (this.player.currentAction.onEquip) {
                                this.player.currentAction.onEquip();
                            }
                        }
                    }
                }
                else {
                    this.player.currentAction = undefined;
                }
            }
        });
    }

    public linkAction(action: PlayerAction, index: number): void {
        if (index >= 0 && index <= 9) {
            this.linkedActions[index] = action;
            console.log(index + " " + action.iconUrl);
            document.getElementById("player-action-" + index + "-icon").style.backgroundImage = "url(" + action.iconUrl + ")";
        }
    }

    public unlinkAction(index: number): void {
        if (index >= 0 && index <= 9) {
            this.linkedActions[index] = undefined;
            document.getElementById("player-action-" + index + "-icon").style.backgroundImage = "";
        }
    }
}