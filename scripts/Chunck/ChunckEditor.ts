class ChunckEditor {

    private _xPointerDown: number = NaN;
    private _yPointerDown: number = NaN;
    public currentCubeType: CubeType = CubeType.None;
    public brushSize: number = 0;

    public brushMesh: BABYLON.Mesh;

    constructor(
        public chunckManager: ChunckManager
    ) {
        this.brushMesh = new BABYLON.Mesh("brush-mesh");
        this.updateBrushMesh();
        for (let i = 0; i < 4; i++) {
            let ii = i;
            document.getElementById("brush-type-button-" + ii).addEventListener("click", () => {
                this.currentCubeType = ii;
                this.applyBrushTypeButtonStyle();
                this.updateBrushMesh();
            });
        }
        for (let i = 0; i < 5; i++) {
            let ii = i;
            document.getElementById("brush-size-button-" + ii).addEventListener("click", () => {
                this.brushSize = ii;
                this.applyBrushSizeButtonStyle();
                this.updateBrushMesh();
            });
        }
        document.getElementById("save").addEventListener("click", () => {
            let data = chunckManager.serialize();
            let stringData = JSON.stringify(data);
            console.log("StringData length = " + stringData.length);
            window.localStorage.setItem("terrain", stringData);
        })
        Main.Scene.onPointerObservable.add(
			(eventData: BABYLON.PointerInfo, eventState: BABYLON.EventState) => {
                console.log("Pouet");
                if (eventData.type === BABYLON.PointerEventTypes.POINTERDOWN) {
                    this._xPointerDown = eventData.event.clientX;
                    this._yPointerDown = eventData.event.clientY;
                }
				else {
					let pickInfo = Main.Scene.pickWithRay(
                        eventData.pickInfo.ray,
                        (m) => {
                            return m instanceof Chunck;
                        }
                    );
                    let pickedMesh = pickInfo.pickedMesh;
					if (pickedMesh instanceof Chunck) {
						let chunck = pickedMesh as Chunck;
						let localPickedPoint = pickInfo.pickedPoint.subtract(chunck.position);
                        let n = pickInfo.getNormal();
                        localPickedPoint.subtractInPlace(n.scale(0.5));
                        let coordinates = new BABYLON.Vector3(
                            Math.floor(localPickedPoint.x),
                            Math.floor(localPickedPoint.y),
                            Math.floor(localPickedPoint.z)
                        );
                        if (this.currentCubeType !== CubeType.None) {
                            let absN = new BABYLON.Vector3(
                                Math.abs(n.x),
                                Math.abs(n.y),
                                Math.abs(n.z)
                            );
                            if (absN.x > absN.y && absN.x > absN.z) {
                                if (n.x > 0) {
                                    coordinates.x++;
                                }
                                else {
                                    coordinates.x--;
                                }
                            }
                            if (absN.y > absN.x && absN.y > absN.z) {
                                if (n.y > 0) {
                                    coordinates.y++;
                                }
                                else {
                                    coordinates.y--;
                                }
                            }
                            if (absN.z > absN.x && absN.z > absN.y) {
                                if (n.z > 0) {
                                    coordinates.z++;
                                }
                                else {
                                    coordinates.z--;
                                }
                            }
                        }
                        if (eventData.type === BABYLON.PointerEventTypes.POINTERUP) {
                            if (Math.abs(eventData.event.clientX - this._xPointerDown) < 5 && Math.abs(eventData.event.clientY - this._yPointerDown) < 5) {
                                this.chunckManager.setChunckCube(chunck, coordinates.x, coordinates.y, coordinates.z, this.currentCubeType, this.brushSize, true);
                            }
                        }
                        this.brushMesh.position.copyFrom(chunck.position).addInPlace(coordinates);
                        this.brushMesh.position.x += 0.5;
                        this.brushMesh.position.y += 0.5;
                        this.brushMesh.position.z += 0.5;
                    }
				}
			}
        );
        this.applyBrushTypeButtonStyle();
        this.applyBrushSizeButtonStyle();
    }

    public applyBrushTypeButtonStyle(): void {
        document.querySelectorAll(".brush-type-button").forEach(
            e => {
                if (e instanceof HTMLElement) {
                    e.style.background = "white";
                    e.style.color = "black";
                }
            }
        );
        let e = document.getElementById("brush-type-button-" + this.currentCubeType);
        e.style.background = "black";
        e.style.color = "white";
    }

    public applyBrushSizeButtonStyle(): void {
        document.querySelectorAll(".brush-size-button").forEach(
            e => {
                if (e instanceof HTMLElement) {
                    e.style.background = "white";
                    e.style.color = "black";
                }
            }
        );
        let e = document.getElementById("brush-size-button-" + this.brushSize);
        e.style.background = "black";
        e.style.color = "white";
    }

    public updateBrushMesh(): void {
        BABYLON.VertexData.CreateBox({
            width: 1 + 2 * this.brushSize + 0.2,
            height: 1 + 2 * this.brushSize + 0.2,
            depth: 1 + 2 * this.brushSize + 0.2
        }).applyToMesh(this.brushMesh);
    }
}