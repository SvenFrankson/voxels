class BranchMesh {

    public branches: Branch[] = [];
    public radius: number;

    constructor() {

    }
}

class Branch {

    public d: number = 0;
    public generation: number = 0;
    public direction: BABYLON.Vector3;
    public radius: number;
    public children: Branch[] = [];

    constructor(
        public position: BABYLON.Vector3,
        public parent: Branch,
        public tree: Tree
    ) {
        if (this.parent) {
            this.direction = this.position.subtract(this.parent.position).normalize();
            this.d = this.parent.d + 1;
            this.generation = this.parent.generation;
            this.parent.children.push(this);
        }
        else {
            this.direction = new BABYLON.Vector3(0, 1, 0);
        }
    }

    public generate(): void {
        if (this.d >= this.tree.size) {
            return;
        }
        let p = this.direction.clone();
        p.addInPlaceFromFloats(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).scaleInPlace(2);
        if (this.generation === 0) {
            p.y += this.tree.trunkDY;
        }
        else {
            p.y += this.tree.branchDY;
        }
        p.normalize().scaleInPlace(this.generation === 0 ? this.tree.trunkLength : this.tree.branchLength);
        new Branch(this.position.add(p), this, this.tree);
        let done = false;
        let branchness = 0;
        if (this.generation === 0) {
            branchness = this.tree.trunkBranchness(this.d);
        }
        else {
            branchness = this.tree.branchBranchness(this.d);
        }
        while (!done) {
            if (Math.random() < branchness) {
                branchness *= 0.5;
                let branchPosFound = false;
                let attempts = 0;
                while (!branchPosFound && attempts++ < 10) {
                    let r = new BABYLON.Vector3(Math.random(), Math.random(), Math.random());
                    let p = BABYLON.Vector3.Cross(this.direction, r);
                    p.addInPlaceFromFloats(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
                    p.normalize().scaleInPlace(this.tree.branchLength);
                    p.addInPlace(this.position);
                    branchPosFound = true;
                    for (let i = 1; i < this.children.length; i++) {
                        let distFromOtherBranch = BABYLON.Vector3.DistanceSquared(this.children[i].position, p);
                        if (distFromOtherBranch < this.tree.branchLength * 1.5) {
                            branchPosFound = false;
                        }
                    }
                    if (branchPosFound) {
                        let b = new Branch(p, this, this.tree);
                        b.generation++;
                    }
                }
            }
            else {
                done = true;
            }
        }
        this.children.forEach(
            c => {
                c.generate();
            }
        )
    }

    public addChildrenToBranchMeshes(currentBranchMesh: BranchMesh, branchMeshes: BranchMesh[]): void {
        if (this.children[0]) {
            currentBranchMesh.branches.push(this.children[0]);
            this.children[0].addChildrenToBranchMeshes(currentBranchMesh, branchMeshes);
        }
        for (let i = 1; i < this.children.length; i++) {
            let newBranchMesh = new BranchMesh();
            branchMeshes.push(newBranchMesh);
            newBranchMesh.radius = currentBranchMesh.radius * 0.7;
            newBranchMesh.branches.push(this, this.children[i]);
            this.children[i].addChildrenToBranchMeshes(newBranchMesh, branchMeshes);
        }
    }
}

class Tree {

    public size: number = 10;

    public trunkLength: number = 1.2;
    public trunkDY: number = 0.5;
    public trunkBranchness: (l: number) => number = () => { return 0.5; };

    public branchSizeRandomize: number = 2;
    public branchLength: number = 1;
    public branchDY: number = 0.2;
    public branchBranchness: (l: number) => number = () => { return 0.5; };

    public root: Branch;

    constructor() {
        this.trunkBranchness = (l) => {
            return 3 * l / this.size - 1;
        }
        this.branchBranchness = (l) => {
            return 2 * l / this.size - 1;
        }
    }

    public generate(p: BABYLON.Vector3): void {
        this.root = new Branch(p, undefined, this);
        this.root.generate();
    }

    public async createMesh(): Promise<void> {
        let brancheMeshes: BranchMesh[] = [];
        let rootBranchMesh: BranchMesh = new BranchMesh();
        rootBranchMesh.radius = 0.5;
        brancheMeshes.push(rootBranchMesh);
        rootBranchMesh.branches.push(this.root);
        this.root.addChildrenToBranchMeshes(rootBranchMesh, brancheMeshes);

        let leaveDatas = await VertexDataLoader.instance.getColorizedMultiple("leaves", "#b4eb34");

        for (let i = 0; i < brancheMeshes.length; i++) {
            let branchMesh = brancheMeshes[i];
            let generation = branchMesh.branches[branchMesh.branches.length - 1].generation;
            let points: BABYLON.Vector3[] = [];
            branchMesh.branches.forEach(
                branch => {
                    points.push(branch.position);
                    if (branch.children.length === 0) {
                        let d = Math.random();
                        let leafPos = BABYLON.Vector3.Lerp(branch.parent.position, branch.position, d);
                        let leafRot = new BABYLON.Vector3(Math.PI * 2 * Math.random(), Math.PI * 2 * Math.random(), Math.PI * 2 * Math.random());
                        let leaf = new BABYLON.Mesh("leaf");
                        leaveDatas[Math.floor(Math.random() * 5)].applyToMesh(leaf);
                        leaf.position = leafPos;
                        leaf.rotation = leafRot;
                        leaf.scaling.scaleInPlace(1 / (Math.sqrt(branch.generation)));
                        leaf.material = Main.cellShadingMaterial;
                    }
                    if (branch.children.length === 0) {
                        let leafRot = new BABYLON.Vector3(Math.PI * 2 * Math.random(), Math.PI * 2 * Math.random(), Math.PI * 2 * Math.random());
                        let leaf = new BABYLON.Mesh("leaf");
                        leaveDatas[Math.floor(Math.random() * 5)].applyToMesh(leaf);
                        leaf.position = branch.position;
                        leaf.computeWorldMatrix(true);
                        leaf.lookAt(leaf.position.add(branch.direction));
                        leaf.scaling.scaleInPlace(1 / (Math.sqrt(branch.generation)));
                        leaf.material = Main.cellShadingMaterial;
                    }
                }
            );
            let l = points.length;
            let mesh = BABYLON.MeshBuilder.CreateTube(
                "branch",
                {
                    path: points,
                    radiusFunction: (i) => {
                        let branch = branchMesh.branches[i];
                        let genFactor = Math.pow(1.3, generation);
                        let factor = (1 - branch.d / this.size) * 0.8 + 0.2;
                        return factor * 0.5 / genFactor;
                    },
                    cap: 2,
                    updatable: true
                },
                Main.Scene
            );
            let data = BABYLON.VertexData.ExtractFromMesh(mesh);
            let colors = [];
            for (let v = 0; v < data.positions.length / 3; v++) {
                colors.push(168 / 255, 113 / 255, 50 / 255, 1);
            }
            data.colors = colors;
            data.applyToMesh(mesh);
            mesh.material = Main.cellShadingMaterial;
        }
    }
}