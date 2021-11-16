class PlayerAction {

    public iconUrl: string;

    public onUpdate: () => void;
    public onClick: () => void;
    public onWheel: (e: WheelEvent) => void;
    public onKeyDown: (e: KeyboardEvent) => void;
    public onKeyUp: (e: KeyboardEvent) => void;
    public onEquip: () => void;
    public onUnequip: () => void;
}

class PlayerActionManager {

    public linkedActions: PlayerAction[] = [];

    public hintedSlotIndex: UniqueList<number> = new UniqueList<number>();

    constructor(
        public player: Player
    ) {

    }

    public initialize(): void {
        Main.Scene.onBeforeRenderObservable.add(this.update);
        
        Main.InputManager.addKeyDownListener((e: KeyInput) => {
            let slotIndex = e;
            if (slotIndex >= 0 && slotIndex < 10) {
                if (!document.pointerLockElement) {
                    this.startHint(slotIndex);
                }
            }
        });
        Main.InputManager.addKeyUpListener((e: KeyInput) => {
            let slotIndex = e;
            if (slotIndex >= 0 && slotIndex < 10) {
                this.stopHint(slotIndex);
                if (!document.pointerLockElement) {
                    return;
                }
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
                if (this.linkedActions[slotIndex]) {
                    // If request action was already equiped, remove it.
                    if (this.player.currentAction === this.linkedActions[slotIndex]) {
                        this.player.currentAction = undefined;
                    }
                    // Equip new action.
                    else {
                        this.player.currentAction = this.linkedActions[slotIndex];
                        if (this.player.currentAction) {
                            document.getElementById("player-action-" + slotIndex + "-icon").style.border = "solid 3px white";
                            document.getElementById("player-action-" + slotIndex + "-icon").style.margin = "-2px -2px -2px 8px";
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

    public update = () => {
        if (this.hintedSlotIndex.length > 0) {
            let t = (new Date()).getTime();
            let thickness = Math.cos(2 * Math.PI * t / 1000) * 2 + 3;
            let opacity = (Math.cos(2 * Math.PI * t / 1000) + 1) * 0.5 * 0.5 + 0.25;
            for (let i = 0; i < this.hintedSlotIndex.length; i++) {
                let slotIndex = this.hintedSlotIndex.get(i);
                console.log(thickness);
                document.getElementById("player-action-" + slotIndex + "-icon").style.backgroundColor = "rgba(255, 255, 255, " + opacity.toFixed(2) + ")";
            }
        }
    }

    public linkAction(action: PlayerAction, slotIndex: number): void {
        if (slotIndex >= 0 && slotIndex <= 9) {
            this.linkedActions[slotIndex] = action;
            console.log(slotIndex + " " + action.iconUrl);
            document.getElementById("player-action-" + slotIndex + "-icon").style.backgroundImage = "url(" + action.iconUrl + ")";
        }
    }

    public unlinkAction(slotIndex: number): void {
        if (slotIndex >= 0 && slotIndex <= 9) {
            this.linkedActions[slotIndex] = undefined;
            document.getElementById("player-action-" + slotIndex + "-icon").style.backgroundImage = "";
        }
    }

    public startHint(slotIndex: number): void {
        this.hintedSlotIndex.push(slotIndex);
    }

    public stopHint(slotIndex: number): void {
        this.hintedSlotIndex.remove(slotIndex);
        document.getElementById("player-action-" + slotIndex + "-icon").style.backgroundColor = "";
    }
}