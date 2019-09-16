class ChunckEditor {

    private _xPointerDown: number = NaN;
    private _yPointerDown: number = NaN;
    public currentCubeType: CubeType;

    constructor(
        public chunckManager: ChunckManager
    ) {
        document.getElementById("destroy").addEventListener("click", () => {
            this.currentCubeType = CubeType.None;
        });
        document.getElementById("dirt").addEventListener("click", () => {
            this.currentCubeType = CubeType.Dirt;
        });
        document.getElementById("rock").addEventListener("click", () => {
            this.currentCubeType = CubeType.Rock;
        });
        document.getElementById("sand").addEventListener("click", () => {
            this.currentCubeType = CubeType.Sand;
        });
        document.getElementById("save").addEventListener("click", () => {
            let data = chunckManager.serialize();
            let stringData = JSON.stringify(data);
            console.log("StringData length = " + stringData.length);
            window.localStorage.setItem("terrain", stringData);
        })
        Main.Scene.onPointerObservable.add(
			(eventData: BABYLON.PointerInfo, eventState: BABYLON.EventState) => {
                if (eventData.type === BABYLON.PointerEventTypes.POINTERDOWN) {
                    this._xPointerDown = eventData.event.clientX;
                    this._yPointerDown = eventData.event.clientY;
                }
				if (eventData.type === BABYLON.PointerEventTypes.POINTERUP) {
                    if (Math.abs(eventData.event.clientX - this._xPointerDown) > 5 || Math.abs(eventData.event.clientY - this._yPointerDown) > 5) {
                        return;
                    }
					let pickedMesh = eventData.pickInfo.pickedMesh;
					if (pickedMesh instanceof Chunck) {
						let chunck = pickedMesh as Chunck;
						let localPickedPoint = eventData.pickInfo.pickedPoint.subtract(chunck.position);
                        let n = eventData.pickInfo.getNormal();
                        if (this.currentCubeType !== CubeType.None) {
                            localPickedPoint.subtractInPlace(n.scale(0.5));
                            let coordinates = new BABYLON.Vector3(
                                Math.floor(localPickedPoint.x),
                                Math.floor(localPickedPoint.y),
                                Math.floor(localPickedPoint.z)
                            );
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
    
                            this.chunckManager.setChunckCube(chunck, coordinates.x, coordinates.y, coordinates.z, this.currentCubeType, true);
                        }
                        else {
                            localPickedPoint.subtractInPlace(n.scale(0.5));
                            let coordinates = new BABYLON.Vector3(
                                Math.floor(localPickedPoint.x),
                                Math.floor(localPickedPoint.y),
                                Math.floor(localPickedPoint.z)
                            );
                            this.chunckManager.setChunckCube(chunck, coordinates.x, coordinates.y, coordinates.z, this.currentCubeType, true);
                        }
					}
				}
			}
		)
    }
}