enum KeyInput {
    NULL = -1,
    ACTION_SLOT_0 = 0,
    ACTION_SLOT_1,
    ACTION_SLOT_2,
    ACTION_SLOT_3,
    ACTION_SLOT_4,
    ACTION_SLOT_5,
    ACTION_SLOT_6,
    ACTION_SLOT_7,
    ACTION_SLOT_8,
    ACTION_SLOT_9,
    INVENTORY,
}

class InputManager {

    public keyInputMap: Map<string, KeyInput> = new Map<string, KeyInput>();

    public keyInputDown: UniqueList<KeyInput> = new UniqueList<KeyInput>();

    public keyDownListeners: ((k: KeyInput) => any)[] = [];
    public keyUpListeners: ((k: KeyInput) => any)[] = [];

    public initialize(): void {

        this.keyInputMap.set("Digit0", KeyInput.ACTION_SLOT_0);
        this.keyInputMap.set("Digit1", KeyInput.ACTION_SLOT_1);
        this.keyInputMap.set("Digit2", KeyInput.ACTION_SLOT_2);
        this.keyInputMap.set("Digit3", KeyInput.ACTION_SLOT_3);
        this.keyInputMap.set("Digit4", KeyInput.ACTION_SLOT_4);
        this.keyInputMap.set("Digit5", KeyInput.ACTION_SLOT_5);
        this.keyInputMap.set("Digit6", KeyInput.ACTION_SLOT_6);
        this.keyInputMap.set("Digit7", KeyInput.ACTION_SLOT_7);
        this.keyInputMap.set("Digit8", KeyInput.ACTION_SLOT_8);
        this.keyInputMap.set("Digit9", KeyInput.ACTION_SLOT_9);
        this.keyInputMap.set("KeyI", KeyInput.INVENTORY);

        window.addEventListener("keydown", (e) => {
            let keyInput = this.keyInputMap.get(e.code);
            if (isFinite(keyInput)) {
                this.keyInputDown.push(keyInput);
                for (let i = 0; i < this.keyDownListeners.length; i++) {
                    this.keyDownListeners[i](keyInput);
                }
            }
        });
        window.addEventListener("keyup", (e) => {
            let keyInput = this.keyInputMap.get(e.code);
            if (isFinite(keyInput)) {
                this.keyInputDown.remove(keyInput);
                for (let i = 0; i < this.keyUpListeners.length; i++) {
                    this.keyUpListeners[i](keyInput);
                }
            }
        });
    }

    public addKeyDownListener(callback: (k: KeyInput) => any): void {
        this.keyDownListeners.push(callback);
    }

    public removeKeyDownListener(callback: (k: KeyInput) => any): void {
        let i = this.keyDownListeners.indexOf(callback);
        if (i != -1) {
            this.keyDownListeners.splice(i, 1);
        }
    }

    public addKeyUpListener(callback: (k: KeyInput) => any): void {
        this.keyUpListeners.push(callback);
    }

    public removeKeyUpListener(callback: (k: KeyInput) => any): void {
        let i = this.keyUpListeners.indexOf(callback);
        if (i != -1) {
            this.keyUpListeners.splice(i, 1);
        }
    }

    public getkeyInputActionSlotDown(): KeyInput {
        if (this.keyInputDown.contains(KeyInput.ACTION_SLOT_0)) {
            return KeyInput.ACTION_SLOT_0;
        }
        if (this.keyInputDown.contains(KeyInput.ACTION_SLOT_1)) {
            return KeyInput.ACTION_SLOT_1;
        }
        if (this.keyInputDown.contains(KeyInput.ACTION_SLOT_2)) {
            return KeyInput.ACTION_SLOT_2;
        }
        if (this.keyInputDown.contains(KeyInput.ACTION_SLOT_3)) {
            return KeyInput.ACTION_SLOT_3;
        }
        if (this.keyInputDown.contains(KeyInput.ACTION_SLOT_4)) {
            return KeyInput.ACTION_SLOT_4;
        }
        if (this.keyInputDown.contains(KeyInput.ACTION_SLOT_5)) {
            return KeyInput.ACTION_SLOT_5;
        }
        if (this.keyInputDown.contains(KeyInput.ACTION_SLOT_6)) {
            return KeyInput.ACTION_SLOT_6;
        }
        if (this.keyInputDown.contains(KeyInput.ACTION_SLOT_7)) {
            return KeyInput.ACTION_SLOT_7;
        }
        if (this.keyInputDown.contains(KeyInput.ACTION_SLOT_8)) {
            return KeyInput.ACTION_SLOT_8;
        }
        if (this.keyInputDown.contains(KeyInput.ACTION_SLOT_9)) {
            return KeyInput.ACTION_SLOT_9;
        }
        return KeyInput.NULL;
    }
}