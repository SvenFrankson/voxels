class PlayerAction {

    public iconUrl: string;

    public onUpdate: () => void;
    public onClick: () => void;
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
            if (this.linkedActions[index]) {
                // Unequip current action
                if (this.player.currentAction) {
                    if (this.player.currentAction.onUnequip) {
                        this.player.currentAction.onUnequip();
                    }
                }
                // If request action was already equiped, remove it.
                if (this.player.currentAction === this.linkedActions[index]) {
                    this.player.currentAction = undefined;
                }
                // Equip new action.
                else {
                    this.player.currentAction = this.linkedActions[index];
                    if (this.player.currentAction) {
                        if (this.player.currentAction.onEquip) {
                            this.player.currentAction.onEquip();
                        }
                    }
                }
            }
        });
    }

    public linkAction(action: PlayerAction, index: number): void {
        if (index >= 0 && index <= 9) {
            this.linkedActions[index] = action;
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