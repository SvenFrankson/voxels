class Branch {

    public n: number;
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
            return (this.trunkSize - l - 1) / this.trunkSize;
        }
        this.branchBranchness = (l) => {
            return (l - 1) / this.branchSize;
        }
    }

    public generate(p: BABYLON.Vector3): void {
        this.root = new Branch(p, undefined, this);
        this.root.generate();
    }

    public createMesh(): void {
        this.root.createMesh();
    }
}