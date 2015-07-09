var TreeBase = require('./treebase');

function Node(data) {
    this.data = data;
    this.left = null;
    this.right = null;
    this.red = true;
    this.leftCount = 0;
}

Node.prototype.getChild = function(dir) {
    return dir ? this.right : this.left;
};

Node.prototype.setChild = function(dir, val) {
    if(dir) {
        this.right = val;
    }
    else {
        this.left = val;
        this.leftCount = val ? val.leftCount + 1 : 0;
    }
};

function RBTree(comparator) {
    this._root = null;
    this._comparator = comparator;
    this.size = 0;
}

RBTree.prototype = new TreeBase();

// Return index of insertion, -1 if duplicate
RBTree.prototype.insert = function(data) {
    var index = 0;
    var inserted = false;

    if(this._root === null) {
        // Empty tree
        this._root = new Node(data);
        this.size++;
    }
    else {
        var head = new Node(undefined); // Fake tree root

        var dir = 0;
        var lastDir = 0;

        // Setup
        var ggp = head; // Great-grand-parent
        var gp = null; // Grandparent
        var p = null; // Parent
        var node = this._root;
        ggp.right = this._root;

        // Search down
        while(true) {
            if(node === null) {
                // Insert new node at the bottom
                node = new Node(data);
                p.setChild(dir, node);
                inserted = true;
                this.size++;
            }
            else if(this._isRed(node.left) && this._isRed(node.right)) {
                // Color flip
                node.red = true;
                node.left.red = false;
                node.right.red = false;
            }

            // Fix red violation
            if(this._isRed(node) && this._isRed(p)) {
                var dir2 = ggp.right === gp;

                if(node === p.getChild(lastDir)) {
                    ggp.setChild(dir2, this.singleRotate(gp, !lastDir));
                }
                else {
                    ggp.setChild(dir2, this.doubleRotate(gp, !lastDir));
                }
            }

            var cmp = this._comparator(node.data, data);

            // Stop if found
            if(cmp === 0) {
                if (! inserted) {
                    index = -1;
                }

                break;
            }

            lastDir = dir;
            dir = cmp < 0;

            // Calculate index as traversing
            if (! dir) { // Left
                index = index;
            } else { // Right
                index += node.leftCount + 1;
            }

            // Update helpers
            if(gp !== null) {
                ggp = gp;
            }
            gp = p;
            p = node;
            node = node.getChild(dir);
        }

        // Update root
        this._root = head.right;
    }

    // Make root black
    this._root.red = false;

    return index;
};

// Returns index of removal, -1 if not found
RBTree.prototype.remove = function(data) {
    if(this._root === null) {
        return -1;
    }

    var head = new Node(undefined); // Fake tree root
    var node = head;
    node.right = this._root;
    var p = null; // Parent
    var gp = null; // Grand parent
    var found = null; // Found item
    var dir = 1;
    var index = 0;

    while(node.getChild(dir) !== null) {
        var last = dir;

        // Update helpers
        gp = p;
        p = node;
        node = node.getChild(dir);

        var cmp = this._comparator(data, node.data);

        dir = cmp > 0;

        // Save found node
        if(cmp === 0) {
            found = node;
        }

        // Calculate index as traversing
        if (! dir) { // Left
            index = index;
        } else { // Right
            index += node.leftCount + 1;
        }

        // Push the red node down
        if(!this._isRed(node) && !this._isRed(node.getChild(dir))) {
            if(this._isRed(node.getChild(!dir))) {
                var sr = this.singleRotate(node, dir);
                p.setChild(last, sr);
                p = sr;
            }
            else if(!this._isRed(node.getChild(!dir))) {
                var sibling = p.getChild(!last);
                if(sibling !== null) {
                    if(!this._isRed(sibling.getChild(!last)) && !this._isRed(sibling.getChild(last))) {
                        // Color flip
                        p.red = false;
                        sibling.red = true;
                        node.red = true;
                    }
                    else {
                        var dir2 = gp.right === p;

                        if(this._isRed(sibling.getChild(last))) {
                            gp.setChild(dir2, this.doubleRotate(p, last));
                        }
                        else if(this._isRed(sibling.getChild(!last))) {
                            gp.setChild(dir2, this.singleRotate(p, last));
                        }

                        // Ensure correct coloring
                        var gpc = gp.getChild(dir2);
                        gpc.red = true;
                        node.red = true;
                        gpc.left.red = false;
                        gpc.right.red = false;
                    }
                }
            }
        }
    }

    // Replace and remove if found
    if(found !== null) {
        found.data = node.data;
        p.setChild(p.right === node, node.getChild(node.left === null));
        this.size--;
    } else {
        index = -1;
    }

    // Update root and make it black
    this._root = head.right;
    if(this._root !== null) {
        this._root.red = false;
    }

    return index;
};

RBTree.prototype._isRed = function (node) {
    return node !== null && node.red;
};

RBTree.prototype.singleRotate = function (root, dir) {
    var save = root.getChild(!dir);

    root.setChild(!dir, save.getChild(dir));
    save.setChild(dir, root);

    root.red = true;
    save.red = false;

    return save;
};

RBTree.prototype.doubleRotate = function (root, dir) {
    root.setChild(!dir, this.singleRotate(root.getChild(!dir), !dir));
    return this.singleRotate(root, dir);
};

module.exports = RBTree;
