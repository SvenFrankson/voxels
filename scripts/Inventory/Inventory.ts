enum InventorySection {
    Action,
    Cube,
    Block,
    Brick
}

class InventoryItem {

    public section: InventorySection;
    public subSection: string;
    public count: number = 1;
    public name: string;
    public brickReference: IBrickReference;
    public size: number = 1;
    public playerAction: PlayerAction;
    public iconUrl: string;
    public timeUse: number = 0;

    public static Block(reference: string): InventoryItem {
        let it = new InventoryItem();
        it.section = InventorySection.Block;
        it.name = reference;
        it.size = 27;
        it.playerAction = PlayerActionTemplate.CreateBlockAction(reference);
        it.iconUrl = "./datas/textures/miniatures/" + reference + "-miniature.png";
        return it;
    }

    public static async Brick(reference: IBrickReference): Promise<InventoryItem> {
        let it = new InventoryItem();
        it.section = InventorySection.Brick;
        it.name = Brick.ReferenceToString(reference);
        it.brickReference = reference;
        let data = await BrickDataManager.GetBrickData(reference);
        it.size = data.locks.length / 3;
        it.playerAction = await PlayerActionTemplate.CreateBrickAction(reference);
        it.iconUrl = "./datas/textures/miniatures/" + it.name + "-miniature.png";
        return it;
    }

    public static Cube(cubeType: CubeType): InventoryItem {
        let it = new InventoryItem();
        it.section = InventorySection.Cube;
        it.name = "Cube-" + cubeType;
        it.playerAction = PlayerActionTemplate.CreateCubeAction(cubeType);
        it.iconUrl = "./datas/textures/miniatures/" + ChunckUtils.CubeTypeToString(cubeType) + "-miniature.png";
        return it;
    }
}

enum BrickSortingOrder {
    Recent,
    TypeAsc,
    TypeDesc,
    SizeAsc,
    SizeDesc,
    ColorAsc,
    ColorDesc
}

class Inventory {

    public currentSection: InventorySection;
    public items: InventoryItem[] = [];

    public body: HTMLDivElement;

    private _sectionActions: HTMLButtonElement;
    private _sectionCubes: HTMLButtonElement;
    private _sectionBlocks: HTMLButtonElement;
    private _sectionBricks: HTMLButtonElement;

    private _brickSorting: BrickSortingOrder = BrickSortingOrder.TypeAsc;

    private _sortBrick: HTMLDivElement;
    private _sortBrickMostRecent: HTMLButtonElement;
    private _sortBrickType: HTMLButtonElement;
    private _sortBrickSize: HTMLButtonElement;
    private _sortBrickColor: HTMLButtonElement;

    private _items: HTMLDivElement;

    private _draggedItem: InventoryItem;

    constructor(
        public player: Player
    ) {

    }

    public initialize(): void {
        Main.MenuManager.inventory = this;

        for (let i = 0; i < 10; i++) {
            let ii = i;
            let playerAction = document.getElementById("player-action-" + i + "-icon");
            playerAction.ondragover = (e) => {
                e.preventDefault();
            }
            playerAction.ondrop = (e) => {
                if (this._draggedItem) {
                    this.player.playerActionManager.linkAction(this._draggedItem.playerAction, ii);
                    this._draggedItem.timeUse = (new Date()).getTime();
                }
                this._draggedItem = undefined;
            }
        }

        this.body = document.getElementById("inventory") as HTMLDivElement;

        this._sectionActions = document.getElementById("section-actions") as HTMLButtonElement;
        if (this._sectionActions) {
            this._sectionActions.addEventListener("pointerup", () => {
                this.currentSection = InventorySection.Action;
                this.update();
            });
        }
        this._sectionCubes = document.getElementById("section-cubes") as HTMLButtonElement;
        if (this._sectionCubes) {
            this._sectionCubes.addEventListener("pointerup", () => {
                this.currentSection = InventorySection.Cube;
                this.update();
            });
        }
        this._sectionBlocks = document.getElementById("section-blocks") as HTMLButtonElement;
        if (this._sectionBlocks) {
            this._sectionBlocks.addEventListener("pointerup", () => {
                this.currentSection = InventorySection.Block;
                this.update();
            });
        }
        this._sectionBricks = document.getElementById("section-bricks") as HTMLButtonElement;
        if (this._sectionBricks) {
            this._sectionBricks.addEventListener("pointerup", () => {
                this.currentSection = InventorySection.Brick;
                this.update();
            });
        }

        this._sortBrick = document.getElementById("sort-brick") as HTMLDivElement;
        this._sortBrickMostRecent = document.getElementById("sort-brick-most-recent") as HTMLButtonElement;
        if (this._sortBrickMostRecent) {
            this._sortBrickMostRecent.addEventListener("pointerup", () => {
                this._brickSorting = BrickSortingOrder.Recent;
                this.update();
            });
        }
        this._sortBrickType = document.getElementById("sort-brick-type") as HTMLButtonElement;
        if (this._sortBrickType) {
            this._sortBrickType.addEventListener("pointerup", () => {
                if (this._brickSorting === BrickSortingOrder.TypeAsc) {
                    this._brickSorting = BrickSortingOrder.TypeDesc;
                }
                else {
                    this._brickSorting = BrickSortingOrder.TypeAsc;
                }
                this.update();
            });
        }
        this._sortBrickSize = document.getElementById("sort-brick-size") as HTMLButtonElement;
        if (this._sortBrickSize) {
            this._sortBrickSize.addEventListener("pointerup", () => {
                if (this._brickSorting === BrickSortingOrder.SizeAsc) {
                    this._brickSorting = BrickSortingOrder.SizeDesc;
                }
                else {
                    this._brickSorting = BrickSortingOrder.SizeAsc;
                }
                this.update();
            });
        }
        this._sortBrickColor = document.getElementById("sort-brick-color") as HTMLButtonElement;
        if (this._sortBrickColor) {
            this._sortBrickColor.addEventListener("pointerup", () => {
                if (this._brickSorting === BrickSortingOrder.ColorAsc) {
                    this._brickSorting = BrickSortingOrder.ColorDesc;
                }
                else {
                    this._brickSorting = BrickSortingOrder.ColorAsc;
                }
                this.update();
            });
        }

        this._items = document.getElementById("items") as HTMLDivElement;
        document.getElementById("inventory-close").addEventListener("pointerup", () => {
            delete Main.MenuManager.currentMenu;
            Main.Canvas.requestPointerLock();
            Main.Canvas.focus();
        });
        Main.Canvas.addEventListener("keyup", (e) => {
            if (e.keyCode === 73) {
                Main.MenuManager.currentMenu = MenuPage.Inventory;
                document.exitPointerLock();
            }
        });
        this.update();
    }

    public addItem(item: InventoryItem): void {
        let same = this.items.find(it => { return it.name === item.name; });
        if (same) {
            same.count++;
        }
        else {
            this.items.push(item);
        }
    }

    public getCurrentSectionItems(): InventoryItem[] {
        let sectionItems: InventoryItem[] = [];
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].section === this.currentSection) {
                sectionItems.push(this.items[i]);
            }
        }

        return sectionItems;
    }

    public update(): void {
        if (this._sectionActions) {
            if (this.currentSection === InventorySection.Action) {
                this._sectionActions.style.background = "white";
                this._sectionActions.style.color = "black";
            }
            else {
                this._sectionActions.style.background = "black";
                this._sectionActions.style.color = "white";
            }
        }
        if (this._sectionCubes) {
            if (this.currentSection === InventorySection.Cube) {
                this._sectionCubes.style.background = "white";
                this._sectionCubes.style.color = "black";
            }
            else {
                this._sectionCubes.style.background = "black";
                this._sectionCubes.style.color = "white";
            }
        }
        if (this._sectionBlocks) {
            if (this.currentSection === InventorySection.Block) {
                this._sectionBlocks.style.background = "white";
                this._sectionBlocks.style.color = "black";
            }
            else {
                this._sectionBlocks.style.background = "black";
                this._sectionBlocks.style.color = "white";
            }
        }
        if (this._sectionBricks) {
            if (this.currentSection === InventorySection.Brick) {
                this._sectionBricks.style.background = "white";
                this._sectionBricks.style.color = "black";
            }
            else {
                this._sectionBricks.style.background = "black";
                this._sectionBricks.style.color = "white";
            }
        }

        this.clearItems();
        let currentSectionItems = this.getCurrentSectionItems();

        if (this.currentSection === InventorySection.Brick) {
            this._sortBrick.style.display = "block";
            this.unlitButton(this._sortBrickMostRecent);
            this.unlitButton(this._sortBrickType);
            this.unlitButton(this._sortBrickSize);
            this.unlitButton(this._sortBrickColor);
            if (this._brickSorting === BrickSortingOrder.TypeAsc) {
                this.hightlightButton(this._sortBrickType);
                currentSectionItems = currentSectionItems.sort(
                    (a, b) => {
                        return a.brickReference.name.localeCompare(b.brickReference.name);
                    }
                )
            }
            else if (this._brickSorting === BrickSortingOrder.TypeDesc) {
                this.hightlightButton(this._sortBrickType);
                currentSectionItems = currentSectionItems.sort(
                    (a, b) => {
                        return - a.brickReference.name.localeCompare(b.brickReference.name);
                    }
                )
            }
            else if (this._brickSorting === BrickSortingOrder.SizeAsc) {
                this.hightlightButton(this._sortBrickSize);
                currentSectionItems = currentSectionItems.sort(
                    (a, b) => {
                        return a.size - b.size;
                    }
                )
            }
            else if (this._brickSorting === BrickSortingOrder.SizeDesc) {
                this.hightlightButton(this._sortBrickSize);
                currentSectionItems = currentSectionItems.sort(
                    (a, b) => {
                        return b.size - a.size;
                    }
                )
            }
            else if (this._brickSorting === BrickSortingOrder.ColorAsc) {
                this.hightlightButton(this._sortBrickColor);
                currentSectionItems = currentSectionItems.sort(
                    (a, b) => {
                        return a.brickReference.color.localeCompare(b.brickReference.color);
                    }
                )
            }
            else if (this._brickSorting === BrickSortingOrder.ColorDesc) {
                this.hightlightButton(this._sortBrickColor);
                currentSectionItems = currentSectionItems.sort(
                    (a, b) => {
                        return - a.brickReference.color.localeCompare(b.brickReference.color);
                    }
                )
            }
            else if (this._brickSorting === BrickSortingOrder.Recent) {
                this.hightlightButton(this._sortBrickMostRecent);
                currentSectionItems = currentSectionItems.sort(
                    (a, b) => {
                        return b.timeUse - a.timeUse;
                    }
                )
            }
        }
        else {
            this._sortBrick.style.display = "none";
        }

        for (let i = 0; i < currentSectionItems.length; i++) {
            let it = currentSectionItems[i];
            let itemDiv = document.createElement("div");
            itemDiv.classList.add("item");
            itemDiv.style.backgroundImage = "url(" + it.iconUrl + ")";
            if (it.playerAction) {
                itemDiv.setAttribute("draggable", "true");
                itemDiv.ondragstart = (e: DragEvent) => {
                    this._draggedItem = it;
                }
                itemDiv.ondragend = (e: DragEvent) => {
                    this._draggedItem = undefined;
                }
                itemDiv.onpointerup = (e: PointerEvent) => {
                    let keyInputActionSlot = Main.InputManager.getkeyInputActionSlotDown();
                    if (keyInputActionSlot != KeyInput.NULL) {
                        this.player.playerActionManager.linkAction(it.playerAction, keyInputActionSlot);
                        it.timeUse = (new Date()).getTime();
                    }
                }
            }

            let itemCount = document.createElement("div");
            itemCount.classList.add("item-count");
            itemCount.innerText = it.count.toFixed(0);

            itemDiv.appendChild(itemCount);
            this._items.appendChild(itemDiv);
        }
    }

    public clearItems(): void {
        this._items.innerHTML = "";
    }

    public hightlightButton(button: HTMLButtonElement): void {
        button.style.background = "white";
        button.style.color = "black";
    }

    public unlitButton(button: HTMLButtonElement): void {
        button.style.background = "black";
        button.style.color = "white";
    }
}