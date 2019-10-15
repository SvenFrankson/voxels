class BranchMesh {

    public branches: Branch[] = [];
    public radius: number;

    constructor() {

    }
}

class Branch {

    public n: number;
    public d: number = 0;
    public direction: BABYLON.Vector3;
    public radius: number;
    public isTrunk = true;
    public children: Branch[] = [];

    constructor(
        public position: BABYLON.Vector3,
        public parent: Branch,
        public tree: Tree
    ) {
        if (this.parent) {
            this.direction = this.position.subtract(this.parent.position).normalize();
            this.n = this.parent.n - 1;
            this.d = this.parent.d + 1;
            this.isTrunk = this.parent.isTrunk;
            if (this.parent.children.length > 0) {
                this.isTrunk = false;
            }
            this.parent.children.push(this);
        }
        else {
            this.direction = new BABYLON.Vector3(0, 1, 0);
            this.n = this.tree.trunkSize;
        }
    }

    public generate(): void {
        if (this.n > 0) {
            let p = this.direction.clone();
            p.addInPlaceFromFloats(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).scaleInPlace(2);
            if (this.isTrunk) {
                p.y += this.tree.trunkDY;
            }
            else {
                p.y += this.tree.branchDY;
            }
            p.normalize().scaleInPlace(this.isTrunk ? this.tree.trunkLength : this.tree.branchLength);
            new Branch(this.position.add(p), this, this.tree);
            let done = false;
            let branchness = 0;
            if (this.isTrunk) {
                branchness = this.tree.trunkBranchness(this.n);
            }
            else {
                branchness = this.tree.branchBranchness(this.n);
            }
            while (!done) {
                if (Math.random() < branchness) {
                    branchness *= 0.8;
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
                            if (this.isTrunk) {
                                b.n = this.tree.branchSize - 1 + Math.round((Math.random() - 0.5) * 2 * this.tree.branchSizeRandomize);
                            }
                        }
                    }
                }
                else {
                    done = true;
                }
            }
        }
        this.children.forEach(
            c => {
                c.generate();
            }
        )
    }

    public createMesh(): void {
        if (this.parent) {
            let p1 = this.parent.position;
            let p2 = this.position;
            let mesh = BABYLON.MeshBuilder.CreateTube(
                "t",
                {
                    path: [p1, p2],
                    radius: 0.15
                },
                Main.Scene
            );
            if (this.isTrunk) {
                let m = new BABYLON.StandardMaterial("tMat", Main.Scene);
                m.diffuseColor.copyFromFloats(0.9, 0.1, 0.1);
                m.specularColor.copyFromFloats(0.1, 0.1, 0.1);
                mesh.material = m;
            }
            else {
                let m = new BABYLON.StandardMaterial("tMat", Main.Scene);
                m.diffuseColor.copyFromFloats(0.1, 0.1, 0.9);
                m.specularColor.copyFromFloats(0.1, 0.1, 0.1);
                mesh.material = m;
            }
        }
        this.children.forEach(
            c => {
                c.createMesh();
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

    public trunkSize: number = 10;
    public trunkLength: number = 1.5;
    public trunkDY: number = 0.5;
    public trunkBranchness: (l: number) => number = () => { return 0.5; };

    public branchSize: number = 4;
    public branchSizeRandomize: number = 2;
    public branchLength: number = 1;
    public branchDY: number = 0.2;
    public branchBranchness: (l: number) => number = () => { return 0.5; };

    public root: Branch;

    constructor() {
        this.trunkBranchness = (l) => {
            return (this.trunkSize - l) / this.trunkSize - 0.1;
        }
        this.branchBranchness = (l) => {
            return (l - 2) / this.branchSize;
        }
    }

    public generate(p: BABYLON.Vector3): void {
        this.root = new Branch(p, undefined, this);
        this.root.generate();
    }

    public createMesh(): void {
        let brancheMeshes: BranchMesh[] = [];
        let rootBranchMesh: BranchMesh = new BranchMesh();
        rootBranchMesh.radius = 0.5;
        brancheMeshes.push(rootBranchMesh);
        rootBranchMesh.branches.push(this.root);
        this.root.addChildrenToBranchMeshes(rootBranchMesh, brancheMeshes);

        for (let i = 0; i < brancheMeshes.length; i++) {
            let branchMesh = brancheMeshes[i];
            let points: BABYLON.Vector3[] = [];
            branchMesh.branches.forEach(
                branch => {
                    points.push(branch.position);
                }
            );
            let l = points.length;
            BABYLON.MeshBuilder.CreateTube(
                "branch",
                {
                    path: points,
                    radiusFunction: (i, d) => {
                        let indexFromRoot = branchMesh.branches[i].d;
                        let factor = Math.pow(0.9, indexFromRoot);
                        return factor * 0.5;
                    }
                },
                Main.Scene
            )
        }
    }
}