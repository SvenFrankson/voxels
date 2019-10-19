class BranchMesh {

    public branches: Branch[] = [];
    public radius: number;

    constructor() {

    }
}

class Leaf {

    constructor(
        public d: number,
        public quaternion: BABYLON.Quaternion,
        public scaling: number,
        public index: number
    ) {

    }
}

class Branch {

    public d: number = 0;
    public generation: number = 0;
    public direction: BABYLON.Vector3;
    public radius: number;
    public children: Branch[] = [];
    public leaves: Leaf[] = [];

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
        if (this.d < this.tree.size) {
            let branchness = 0;
            if (this.generation === 0) {
                branchness = this.tree.trunkBranchness(this.d);
            }
            else {
                branchness = this.tree.branchBranchness(this.d);
            }
            if (this.generation === 0 || this.tree.randomizer.random() < branchness) {
                if (this.generation > 0) {
                    branchness *= 0.7;
                }
                let p = this.direction.clone();
                p.addInPlaceFromFloats(this.tree.randomizer.random() - 0.5, this.tree.randomizer.random() - 0.5, this.tree.randomizer.random() - 0.5).scaleInPlace(2);
                if (this.generation === 0) {
                    p.y += this.tree.trunkDY;
                }
                else {
                    p.y += this.tree.branchDY;
                }
                p.normalize().scaleInPlace(this.generation === 0 ? this.tree.trunkLength : this.tree.branchLength);
                new Branch(this.position.add(p), this, this.tree);
            }
            let done = false;
            while (!done) {
                if (this.tree.randomizer.random() < branchness) {
                    branchness *= 0.7;
                    let branchPosFound = false;
                    let attempts = 0;
                    while (!branchPosFound && attempts++ < 10) {
                        let r = new BABYLON.Vector3(this.tree.randomizer.random(), this.tree.randomizer.random(), this.tree.randomizer.random());
                        let p = BABYLON.Vector3.Cross(this.direction, r);
                        p.addInPlaceFromFloats(this.tree.randomizer.random() - 0.5, this.tree.randomizer.random() - 0.5, this.tree.randomizer.random() - 0.5);
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
        if (this.parent) {
            if (this.children.length === 0) {
                let d = this.tree.randomizer.random();
                let index = Math.floor(this.tree.randomizer.random() * 5);
                let leafRot = BABYLON.Quaternion.RotationAxis(
                    new BABYLON.Vector3(this.tree.randomizer.random(), this.tree.randomizer.random(), this.tree.randomizer.random()),
                    Math.PI * 2 * this.tree.randomizer.random()
                );
                this.leaves.push(new Leaf(
                    d,
                    leafRot,
                    1 / (Math.sqrt(this.generation + 1)),
                    index
                ));

                
                index = Math.floor(this.tree.randomizer.random() * 5);
                let zAxis = this.direction;
                let xAxis = BABYLON.Vector3.Cross(BABYLON.Axis.Y, zAxis);
                let yAxis = BABYLON.Vector3.Cross(zAxis, xAxis);
                leafRot = BABYLON.Quaternion.RotationQuaternionFromAxis(xAxis, yAxis, zAxis);
                
                this.leaves.push(new Leaf(
                    1,
                    leafRot,
                    1 / (Math.sqrt(this.generation + 1)),
                    index
                ));
            }
        }

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

class Randomizer {

    private _index: number = 0;
    private _loops: number = 0;

    constructor(
        public seed: number
    ) {
        this.seed = Math.floor(this.seed);
    }

    public random(): number {
        this._index += this.seed;
        if (this._index >= randoms.length) {
            this._index = this._loops;
            this._loops++;
            if (this._loops >= randoms.length) {
                this._loops = 0;
            }
        }

        return randoms[this._index];
    }

    public reset(): void {
        console.log(this._index + " " + this._loops);
        this._index = 0;
        this._loops = 0;
    }
}

class Tree extends BABYLON.Mesh {

    public randomizer: Randomizer;

    public size: number = 10;

    public trunkLength: number = 1.2;
    public trunkDY: number = 0.5;
    public trunkBranchness: (l: number) => number = () => { return 0.5; };

    public branchSizeRandomize: number = 2;
    public branchLength: number = 1;
    public branchDY: number = 1;
    public branchBranchness: (l: number) => number = () => { return 0.5; };

    public root: Branch;

    constructor(seed: number = 42) {
        super("tree");
        this.randomizer = new Randomizer(seed);
        this.trunkBranchness = (l) => {
            return 3 * l / this.size - 1;
        }
        this.branchBranchness = (l) => {
            return 4 * l / this.size - 2;
        }
    }

    public generate(p: BABYLON.Vector3): void {
        this.position = p;
        this.root = new Branch(BABYLON.Vector3.Zero(), undefined, this);
        this.root.generate();
    }

    public async createMesh(t: number): Promise<void> {
        this.randomizer.reset();
        let brancheMeshes: BranchMesh[] = [];
        let rootBranchMesh: BranchMesh = new BranchMesh();
        rootBranchMesh.radius = 0.5;
        brancheMeshes.push(rootBranchMesh);
        rootBranchMesh.branches.push(this.root);
        this.root.addChildrenToBranchMeshes(rootBranchMesh, brancheMeshes);

        let leaveDatas = await VertexDataLoader.instance.getColorizedMultiple("leaves", "#b4eb34");

        let meshes: BABYLON.Mesh[] = [];
        let dLim = Math.floor(this.size * t);
        let dt = this.size * t - dLim;

        for (let i = 0; i < brancheMeshes.length; i++) {
            let branchMesh = brancheMeshes[i];
            let generation = branchMesh.branches[branchMesh.branches.length - 1].generation;
            let points: BABYLON.Vector3[] = [];
            branchMesh.branches.forEach(
                branch => {
                    if (branch.d <= dLim) {
                        points.push(branch.position);
                        branch.leaves.forEach(
                            leaf => {
                                let leafMesh = new BABYLON.Mesh("leaf");
                                leafMesh.position = BABYLON.Vector3.Lerp(branch.parent.position, branch.position, leaf.d);
                                leafMesh.rotationQuaternion = leaf.quaternion;
                                leafMesh.scaling.scaleInPlace(leaf.scaling);
                                leaveDatas[leaf.index].applyToMesh(leafMesh);
                                meshes.push(leafMesh);
                            }
                        )
                    }
                    else if (branch.d === dLim + 1 && branch.parent) {
                        let p = BABYLON.Vector3.Lerp(branch.parent.position, branch.position, dt);
                        points.push(p);
                        branch.leaves.forEach(
                            leaf => {
                                let leafMesh = new BABYLON.Mesh("leaf");
                                leafMesh.position = BABYLON.Vector3.Lerp(branch.parent.position, branch.position, leaf.d * dt);
                                leafMesh.rotationQuaternion = leaf.quaternion;
                                leafMesh.scaling.scaleInPlace(leaf.scaling * dt);
                                leaveDatas[leaf.index].applyToMesh(leafMesh);
                                meshes.push(leafMesh);
                            }
                        )
                    }
                }
            );
            if (points.length >= 2) {
                let mesh = BABYLON.MeshBuilder.CreateTube(
                    "branch",
                    {
                        path: points,
                        radiusFunction: (i) => {
                            let branch = branchMesh.branches[i];
                            let genFactor = Math.pow(1.3, generation);
                            let factor = (1 - branch.d / this.size) * 0.8 + 0.2;
                            return factor * 0.5 / genFactor * t;
                        },
                        cap: 2,
                        updatable: true
                    },
                    Main.Scene
                );
                meshes.push(mesh);
                let data = BABYLON.VertexData.ExtractFromMesh(mesh);
                let colors = [];
                for (let v = 0; v < data.positions.length / 3; v++) {
                    colors.push(168 / 255, 113 / 255, 50 / 255, 1);
                }
                data.colors = colors;
                data.applyToMesh(mesh);
            }
        }
        if (meshes.length > 0) {
            let mergedMesh = BABYLON.Mesh.MergeMeshes(meshes, true);
            let data = BABYLON.VertexData.ExtractFromMesh(mergedMesh);
            mergedMesh.dispose();
            data.applyToMesh(this);
            this.material = Main.cellShadingMaterial;
        }
    }
}

var randoms = [0.7242700599, 0.0493068431, 0.5422877367, 0.1155181657, 0.2589516440, 0.9393757207, 0.1050213169, 0.2918769867, 0.9654547756, 0.6608105994, 0.0804853787, 0.6764936525, 0.4725352234, 0.4789722782, 0.7597937290, 0.7099366252, 0.6373429094, 0.6463509444, 0.7628570521, 0.6117278313, 0.6345756043, 0.3686689588, 0.4746355440, 0.1050554798, 0.2292831362, 0.0122525857, 0.2110570742, 0.6577345865, 0.2738793904, 0.9850751247, 0.7189840089, 0.2583777933, 0.3248560024, 0.4391433454, 0.0513389327, 0.2618335775, 0.5141906503, 0.0118307786, 0.4606407831, 0.3534065693, 0.1273363899, 0.4317617511, 0.1757455333, 0.2303439940, 0.1691254663, 0.0246304385, 0.9990007667, 0.2751558719, 0.2559454405, 0.8144072106, 0.4124306405, 0.7796093815, 0.1272457310, 0.9694824364, 0.3586842434, 0.5723316900, 0.4694900147, 0.6274267780, 0.7490841632, 0.9607010980, 0.0247781632, 0.8272898348, 0.8120756273, 0.4937788706, 0.8134985318, 0.7969832511, 0.8605236709, 0.6972437660, 0.1616883610, 0.2899764558, 0.0550764116, 0.6729259381, 0.8333863574, 0.7823799482, 0.6633547194, 0.0474525009, 0.7753385769, 0.8436966080, 0.4718841805, 0.3838246825, 0.6942509018, 0.7967364900, 0.9230281813, 0.3997794697, 0.4054416334, 0.9114997279, 0.1680495318, 0.2552886619, 0.3386279628, 0.2719746019, 0.6284024361, 0.4699365633, 0.5020716600, 0.8288275212, 0.1260017701, 0.8545485952, 0.0268598778, 0.3131287750, 0.5409139230, 0.4218396776, 0.2110576441, 0.5841654280, 0.0069623749, 0.3676826704, 0.4783344444, 0.6952728730, 0.1935424777, 0.8690971574, 0.7869382084, 0.5365594171, 0.4049723332, 0.1862909502, 0.8698437916, 0.9434257749, 0.0926046635, 0.5927811200, 0.8252708107, 0.7920356459, 0.7745536416, 0.2454967733, 0.5983826377, 0.0004461594, 0.7852858679, 0.6504476590, 0.0831056213, 0.0361474429, 0.3351674424, 0.4482753492, 0.7351609241, 0.9398288552, 0.4155562105, 0.9029766907, 0.4379223573, 0.3499556550, 0.9304110741, 0.3036975833, 0.0892269263, 0.4509153552, 0.0203847143, 0.8894592030, 0.9317293204, 0.6251866432, 0.1042043362, 0.3877613367, 0.5439226566, 0.3087234085, 0.5760028769, 0.2130198381, 0.0962961602, 0.5517591999, 0.1167301573, 0.4520639047, 0.0098701030, 0.4225291149, 0.7821020664, 0.6798952865, 0.6083060491, 0.7194023792, 0.5460400173, 0.7025148274, 0.7755279534, 0.6283414166, 0.7080025465, 0.8624036057, 0.6122573564, 0.3236481038, 0.7462935976, 0.1928970649, 0.4359210590, 0.2409878239, 0.7029757359, 0.7464879981, 0.4158457995, 0.8863452932, 0.2860072561, 0.6476758784, 0.6248748838, 0.6265892509, 0.0671532371, 0.3915217916, 0.9131664768, 0.0652272242, 0.0882384702, 0.1152783761, 0.9645111551, 0.4396360646, 0.7849090465, 0.9748901436, 0.9597332202, 0.4240333292, 0.5853662551, 0.0591033653, 0.0885885525, 0.3922866085, 0.4542205364, 0.3215328764, 0.2003332475, 0.8756006365, 0.8843277921, 0.4501462511, 0.3125754303, 0.8195215403, 0.9624757132, 0.4698564261, 0.1024654601, 0.9036904001, 0.0827528128, 0.4639685772, 0.4544798246, 0.9029108164, 0.0590481294, 0.0954582618, 0.3599908703, 0.0320718644, 0.8442975936, 0.9074342513, 0.5745667980, 0.7543980752, 0.7252522612, 0.5843540342, 0.4099296652, 0.1075638416, 0.2706947579, 0.1775494161, 0.5315456242, 0.6187001742, 0.0785214912, 0.0454971203, 0.2689649292, 0.0160659903, 0.2319657186, 0.3785473553, 0.4720611737, 0.8647573913, 0.2839007290, 0.9941299463, 0.3808066657, 0.6351589251, 0.8722220793, 0.9416734636, 0.7956589339, 0.0440075630, 0.3753263507, 0.8866323874, 0.2791323390, 0.7083749850, 0.9077391747, 0.6139200628, 0.0163262418, 0.4331295453, 0.5772057739, 0.4613739901, 0.5617081421, 0.3306423041, 0.8971317107, 0.5892410464, 0.6943365595, 0.6384280686, 0.8377175055, 0.0171168379, 0.0730566683, 0.4925365936, 0.7829017214, 0.6441249934, 0.7238788408, 0.1034354008, 0.3084766780, 0.2280655424, 0.1918914642, 0.9929759453, 0.9646530421, 0.1486785630, 0.6192536720, 0.5964290053, 0.1071561711, 0.1331322947, 0.6136940291, 0.9229802281, 0.4982749293, 0.8140446263, 0.6235184895, 0.6121024877, 0.9900876276, 0.3299750340, 0.8292967664, 0.2499477564, 0.7093055687, 0.9415518620, 0.5233943171, 0.4610735192, 0.1540224350, 0.3733147452, 0.5414278444, 0.0145062016, 0.6752233682, 0.7863680600, 0.1053181288, 0.1511605927, 0.3436139131, 0.2822695044, 0.0850694228, 0.6311106664, 0.7895092360, 0.3055335459, 0.0266564502, 0.7418065020, 0.5717429115, 0.1525647681, 0.8717105884, 0.3516006033, 0.3248899980, 0.3847826029, 0.9619904495, 0.6640942389, 0.1799009378, 0.6082680373, 0.1897113943, 0.6953407643, 0.3224327341, 0.9053061042, 0.1005653053, 0.6997991174, 0.5780051022, 0.3785862030, 0.4539759788, 0.0012537337, 0.2106805153, 0.6249807674, 0.3098250503, 0.9480142752, 0.5752148845, 0.9576217629, 0.3446185879, 0.9789061954, 0.9565093920, 0.9327901455, 0.1764110584, 0.3539711952, 0.1581804006, 0.3707084861, 0.4328390473, 0.8360334515, 0.2755712263, 0.9518532023, 0.8626766698, 0.0064201573, 0.5434304878, 0.0773955106, 0.8525197818, 0.5046323877, 0.2131218229, 0.7377617413, 0.1669677053, 0.9906101730, 0.6109655254, 0.1599562508, 0.9399006684, 0.7642581592, 0.3255356999, 0.7429558256, 0.8696550372, 0.9897098084, 0.7234799391, 0.1040380442, 0.4022594418, 0.5593281926, 0.4266466521, 0.7814338403, 0.1650412751, 0.9247418712, 0.1991958562, 0.8220697698, 0.4770719533, 0.4779802347, 0.8929487341, 0.6674516444, 0.7572695686, 0.0305798561, 0.3203678820, 0.8944742313, 0.3165600188, 0.6285656789, 0.3481055093, 0.8712954703, 0.9179803772, 0.1300864748, 0.9476540353, 0.9239366349, 0.9281898679, 0.0605899163, 0.5114434217, 0.1166775900, 0.5635161472, 0.8322400267, 0.5777929829, 0.6664148478, 0.2069780890, 0.6379790591, 0.2010510735, 0.2144044222, 0.9138874917, 0.0880099281, 0.1931881672, 0.5755539782, 0.1703985379, 0.8401477858, 0.0363213968, 0.0736225604, 0.4788747286, 0.4168127789, 0.0417379264, 0.1819225915, 0.3468983755, 0.4883995109, 0.2028467758, 0.4625718857, 0.2018054082, 0.5038428033, 0.5790877526, 0.5190273002, 0.9756712807, 0.1996946698, 0.1887465690, 0.7180341131, 0.3935661182, 0.9517568502, 0.1003021667, 0.4026021422, 0.0655911483, 0.7194643989, 0.7819022391, 0.8389647784, 0.1686014187, 0.3566954912, 0.1769990163, 0.0199771463, 0.7750562347, 0.0675238158, 0.1025482180, 0.3834718955, 0.5754452847, 0.3828602524, 0.9552030591, 0.4888887311, 0.5852257146, 0.9401637429, 0.1485991792, 0.8242239978, 0.8276330948, 0.9333590938, 0.7287074959, 0.7908470174, 0.5969027170, 0.8798085095, 0.2800575785, 0.7348325376, 0.7835277557, 0.4422669437, 0.4147665293, 0.0669014501, 0.7035491239, 0.0806318157, 0.3914370260, 0.6209230341, 0.9949791452, 0.6669788114, 0.7387263668, 0.3443991316, 0.0786236455, 0.0327835402, 0.0208224175, 0.8044662181, 0.9665148555, 0.5437099569, 0.9438406889, 0.8334965332, 0.6408899431, 0.6004960429, 0.9094606440, 0.4545623088, 0.5416014298, 0.5185310218, 0.2876935339, 0.9787282010, 0.4109265628, 0.7897397697, 0.6690263787, 0.7711525727, 0.3958383852, 0.1743711888, 0.1811211592, 0.9947046025, 0.6230898274, 0.5494245205, 0.2578150412, 0.1051019226, 0.6825386241, 0.6844593414, 0.3478449995, 0.3460278132, 0.6033225786, 0.2629854091, 0.1393437360, 0.7570739543, 0.2016361738, 0.5894335977, 0.4186086423, 0.2886165027, 0.5070499941, 0.7372869796, 0.8482298722, 0.7313670957, 0.5543738603, 0.6552679897, 0.7034867547, 0.4473726010, 0.1183425006, 0.4813962094, 0.0574677492, 0.6036604564, 0.7629301955, 0.5942371794, 0.4272393240, 0.3161286887, 0.1185665298, 0.6273876346, 0.2957832764, 0.6036353640, 0.6863712662, 0.6690338396, 0.1629004689, 0.7731658551, 0.4109630014, 0.4676929542, 0.4294323266, 0.8376912829, 0.7553402757, 0.3570785878, 0.0458421193, 0.1997259129, 0.3598863356, 0.5358072399, 0.3649016062, 0.7108706691, 0.3367744380, 0.5256662841, 0.5974763969, 0.8738525816, 0.5061275693, 0.5048239078, 0.4874456508, 0.5759687938, 0.4423145794, 0.1815517900, 0.0866558894, 0.2257759579, 0.2543508331, 0.5438101235, 0.1966876948, 0.9370037721, 0.7707698461, 0.5055027809, 0.2076097061, 0.6918017889, 0.3799813862, 0.7963112721, 0.3237059080, 0.3872077438, 0.4484776571, 0.4411365245, 0.0545198991, 0.4965492496, 0.9086043362, 0.4293899510, 0.9717660536, 0.6977726405, 0.9953251296, 0.1842726525, 0.8157435661, 0.9816793225, 0.4590247116, 0.7140027545, 0.6574292681, 0.7265972665, 0.4029564212, 0.7187616104, 0.6637664394, 0.8516865726, 0.9062964450, 0.8120468845, 0.3770243262, 0.3372623889, 0.3701231964, 0.8182719769, 0.8023526980, 0.3614009920, 0.0945888207, 0.7407996622, 0.1002062243, 0.2066907365, 0.7096173283, 0.9245362794, 0.9193271037, 0.5893148860, 0.7776287471, 0.6591243713, 0.1830842800, 0.4408506112, 0.1926844638, 0.0148201297, 0.5437490613, 0.7810157905, 0.9981941820, 0.2212992911, 0.7714958203, 0.8911554930, 0.8128932648, 0.3616850864, 0.2081259162, 0.4867771963, 0.6648050416, 0.6254082279, 0.9614145738, 0.9982457950, 0.3076433275, 0.7113963400, 0.1830239100, 0.4346326550, 0.0147995066, 0.2434031157, 0.6191448732, 0.4150566806, 0.2116296007, 0.0640168544, 0.6512485151, 0.2075248379, 0.4767852917, 0.2453957135, 0.0803823845, 0.4005574346, 0.1716000454, 0.3452395886, 0.8644328931, 0.3067756647, 0.4560416823, 0.9739858822, 0.6677710000, 0.9256537852, 0.9104970317, 0.4308814312, 0.1238320586, 0.8111159496, 0.3739132358, 0.0174815154, 0.8569335344, 0.6729540170, 0.9266056540, 0.6517561561, 0.3219967007, 0.5211270386, 0.3359621172, 0.6369315909, 0.5808091618, 0.2011359953, 0.6147151266, 0.6912483120, 0.0845924877, 0.5648851645, 0.7490772283, 0.3994773967, 0.9591359105, 0.4817541729, 0.3587105074, 0.4776497310, 0.2210426447, 0.1491077416, 0.9759423618, 0.2614206807, 0.5203813603, 0.8036516953, 0.6436417011, 0.3817707341, 0.3605820654, 0.2141530566, 0.6889066523, 0.0413795170, 0.5905508017, 0.3749438237, 0.8992870072, 0.7350622443, 0.6906559369, 0.3156713677, 0.8321190127, 0.8183336652, 0.9119546325, 0.3840133372, 0.8265941556, 0.7168369323, 0.9932810787, 0.0824861959, 0.1316771260, 0.5248158811, 0.4864885637, 0.8517346535, 0.9922336827, 0.7814991063, 0.4039137743, 0.8568281476, 0.7725111814, 0.8990166154, 0.4405614525, 0.4278781393, 0.9048678851, 0.8149336999, 0.3550270115, 0.9993628811, 0.4790769664, 0.8281622312, 0.8205501422, 0.2997732510, 0.4790797104, 0.0360771712, 0.5451067649, 0.4188647166, 0.6595943311, 0.5474661960, 0.8034773959, 0.9088917567, 0.0994198604, 0.4393934615, 0.6435395245, 0.9314730441, 0.1669751855, 0.6972210960, 0.8646594610, 0.6206810408, 0.3494463092, 0.5911595005, 0.7305150577, 0.5274720990, 0.3608072253, 0.3739056014, 0.8240302583, 0.8093947482, 0.2830850285, 0.8982751829, 0.0705978571, 0.1208311212, 0.3375047867, 0.5848364668, 0.9824035432, 0.8273516581, 0.9238173686, 0.7349447625, 0.5559300026, 0.9855984217, 0.3665797933, 0.2812392593, 0.0103364105, 0.3447246688, 0.0249127583, 0.5013726791, 0.0668634880, 0.9940454286, 0.7004167271, 0.1879393445, 0.2820476049, 0.8775177712, 0.6459385052, 0.7144977555, 0.3595636262, 0.0762262314, 0.4175779994, 0.3625217852, 0.6206054282, 0.0721474664, 0.9272464969, 0.5089201319, 0.3678173055, 0.9839281028, 0.9380474491, 0.7704951535, 0.0823085457, 0.5279481816, 0.2553816826, 0.1261776565, 0.5424213316, 0.7307648740, 0.6524229752, 0.7139727673, 0.2808533116, 0.4860174122, 0.8901169115, 0.8251365780, 0.4361213889, 0.9903281038, 0.5220581403, 0.7529180910, 0.3767807658, 0.6540117299, 0.3398082936, 0.1915120783, 0.0483394170, 0.5314662109, 0.5289851442, 0.2269031058, 0.9869964429, 0.7344832992, 0.6765234385, 0.4228584159, 0.1414953346, 0.4825023655, 0.1769820987, 0.9365497497, 0.3654644038, 0.1089106396, 0.6193485078, 0.2712745369, 0.6691275168, 0.2746523211, 0.9628977904, 0.0913388318, 0.5585104744, 0.9465911890, 0.8012934558, 0.7431091672, 0.8774299116, 0.4048360852, 0.2287810732, 0.3130717338, 0.0283188138, 0.5690451594, 0.9487421092, 0.0112612707, 0.5984484447, 0.1670231452, 0.3208097079, 0.3154187390, 0.4464264441, 0.2984804430, 0.6835090596, 0.7532906692, 0.8372468615, 0.1804386641, 0.2881406181, 0.3548981236, 0.9862165374, 0.5254544169, 0.2337670630, 0.2305122048, 0.3499720512, 0.1037841402, 0.4070929490, 0.2684014095, 0.0881662639, 0.8299891382, 0.3345257748, 0.6780060736, 0.9586809936, 0.3994630867, 0.6765117934, 0.4834768403, 0.6914101131, 0.6119240925, 0.0194356634, 0.4634791533, 0.4711018851, 0.5985505092, 0.6540403696, 0.1547801615, 0.2416340994, 0.6091429599, 0.5641116157, 0.3970097817, 0.0431418413, 0.1624580953, 0.8727724543, 0.5573944414, 0.7019240718, 0.2373427161, 0.6320177534, 0.8413323510, 0.2676511045, 0.1739817557, 0.9924947722, 0.0725140274, 0.9883033119, 0.2998545930, 0.2135089074, 0.3268373207, 0.6093808380, 0.1114221603, 0.9777823066, 0.3316591616, 0.7886764292, 0.5203446263, 0.8008522626, 0.0526976573, 0.4595948112, 0.1421890690, 0.6245773799, 0.0479492805, 0.7980149239, 0.7579457769, 0.4345499731, 0.6448086538, 0.9460194372, 0.2869939945, 0.8062114069, 0.7368628065, 0.4540553125, 0.2109252202, 0.6383435590, 0.7308604929, 0.8488876527, 0.7919969151, 0.5362662798, 0.8822105687, 0.9912453393, 0.3319019419, 0.2193287094, 0.6350240476, 0.2446239759, 0.8691996646, 0.0043214415, 0.5775778649, 0.4866951622, 0.5029004142, 0.8159517258, 0.3293561954, 0.7851142047, 0.5495315865, 0.8195157748, 0.0972854223, 0.2116187806, 0.2272285320, 0.6547600830, 0.0431959139, 0.5567732016, 0.0725161541, 0.6577055698, 0.2995409921, 0.9291052861, 0.3639760000, 0.2679724639, 0.0724978499, 0.8259188558, 0.0580923330, 0.9692715581, 0.7680634495, 0.5284981411, 0.6262385713, 0.6953433254, 0.1322043182, 0.3337001534, 0.7334780467, 0.5108243732, 0.9659628637, 0.7730966436, 0.5729263574, 0.5664871582, 0.9118440415, 0.1118118041, 0.8899543388, 0.3044219849, 0.7648354089, 0.4371592858, 0.3261678216, 0.2066050807, 0.7957998124, 0.0838956731, 0.9802235533, 0.3819044299, 0.3787963371, 0.0387293142, 0.4566537281, 0.6634002723, 0.8084787223, 0.3796131639, 0.5618096739, 0.6747628759, 0.6732670736, 0.8823342179, 0.2114956955, 0.7507445924, 0.5042911130, 0.6342335806, 0.4909884180, 0.6434017994, 0.2286114560, 0.5512288898, 0.7136266237, 0.9419148911, 0.4711444672, 0.5438793909, 0.0311638063, 0.8752503902, 0.0314147397, 0.7947786019, 0.5001851634];