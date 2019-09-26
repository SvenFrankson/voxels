enum InventorySection {
    Action,
    Cube,
    Block
}

class InventoryItem {

    public section: InventorySection;
    public subSection: string;
    public count: number = 1;
    public name: string;
    public playerAction: PlayerAction;

    public static Block(reference: string): InventoryItem {
        let it = new InventoryItem();
        it.section = InventorySection.Block;
        it.name = reference;
        it.playerAction = PlayerActionTemplate.CreateBlockAction(reference);
        return it;
    }

    public static Cube(cubeType: CubeType): InventoryItem {
        let it = new InventoryItem();
        it.section = InventorySection.Cube;
        it.name = "Cube-" + cubeType;
        it.playerAction = PlayerActionTemplate.CreateCubeAction(cubeType);
        return it;
    }
}

class Inventory {

    public currentSection: InventorySection;
    public items: InventoryItem[] = [];

    private _sectionActions: HTMLButtonElement;
    private _sectionCubes: HTMLButtonElement;
    private _sectionBlocks: HTMLButtonElement;

    private _subSections: HTMLDivElement;
    private _items: HTMLDivElement;

    private _draggedItem: InventoryItem;

    constructor(
        public player: Player
    ) {

    }

    public initialize(): void {
        for (let i = 0; i < 10; i++) {
            let ii = i;
            let playerAction = document.getElementById("player-action-" + i + "-icon");
            playerAction.ondragover = (e) => {
                e.preventDefault();
            }
            playerAction.ondrop = (e) => {
                if (this._draggedItem) {
                    this.player.playerActionManager.linkAction(this._draggedItem.playerAction, ii);
                }
                this._draggedItem = undefined;
            }
        }

        this._sectionActions = document.getElementById("section-actions") as HTMLButtonElement;
        this._sectionActions.addEventListener("click", () => {
            this.currentSection = InventorySection.Action;
            this.update();
        });
        this._sectionCubes = document.getElementById("section-cubes") as HTMLButtonElement;
        this._sectionCubes.addEventListener("click", () => {
            this.currentSection = InventorySection.Cube;
            this.update();
        });
        this._sectionBlocks = document.getElementById("section-blocks") as HTMLButtonElement;
        this._sectionBlocks.addEventListener("click", () => {
            this.currentSection = InventorySection.Block;
            this.update();
        });
        this._subSections = document.getElementById("sub-sections") as HTMLDivElement;
        this._items = document.getElementById("items") as HTMLDivElement;
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
        if (this.currentSection === InventorySection.Action) {
            this._sectionActions.style.background = "white";
            this._sectionActions.style.color = "black";
        }
        else {
            this._sectionActions.style.background = "black";
            this._sectionActions.style.color = "white";
        }
        if (this.currentSection === InventorySection.Cube) {
            this._sectionCubes.style.background = "white";
            this._sectionCubes.style.color = "black";
        }
        else {
            this._sectionCubes.style.background = "black";
            this._sectionCubes.style.color = "white";
        }
        if (this.currentSection === InventorySection.Block) {
            this._sectionBlocks.style.background = "white";
            this._sectionBlocks.style.color = "black";
        }
        else {
            this._sectionBlocks.style.background = "black";
            this._sectionBlocks.style.color = "white";
        }
        this.clearSubsections();
        this.clearItems();
        let currentSectionItems = this.getCurrentSectionItems();
        for (let i = 0; i < currentSectionItems.length; i++) {
            let it = currentSectionItems[i];
            let itemDiv = document.createElement("div");
            itemDiv.classList.add("item");
            if (it.playerAction) {
                itemDiv.setAttribute("draggable", "true");
                itemDiv.ondragstart = (e: DragEvent) => {
                    this._draggedItem = it;
                }
                itemDiv.ondragend = (e: DragEvent) => {
                    this._draggedItem = undefined;
                }
            }

            let itemCount = document.createElement("div");
            itemCount.classList.add("item-count");
            itemCount.innerText = it.count.toFixed(0);

            itemDiv.appendChild(itemCount);
            this._items.appendChild(itemDiv);
        }
    }

    public clearSubsections(): void {
        this._subSections.innerHTML = "";
    }

    public clearItems(): void {
        this._items.innerHTML = "";
    }
}