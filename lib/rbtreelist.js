var TreeBase = require('./treebase');

function Node(data) {
    this.data = data;
    this.left = null;
    this.right = null;
    this.red = true;
    this.leftCount = 0;
    this.rightCount = 0;
}

Node.prototype.getChild = function (dir) {
    return dir ? this.right : this.left;
};

Node.prototype.setChild = function (dir, val) {
    if (dir) {
        this.right = val;
    } else {
        this.left = val;
    }

    if (val !== null) {
        val.parent = this;
    }

    this.updateChildCount();
};
Node.prototype.updateChildCount = function () {
    this.rightCount = this.right ?
        this.right.leftCount + this.right.rightCount + 1 : 0;
    this.leftCount = this.left ?
        this.left.leftCount + this.left.rightCount + 1 : 0;
};

function RBTreeList(comparator) {
    this._root = null;
    this.size = 0;
    this.minIndex = Number.POSITIVE_INFINITY;
}

RBTreeList.prototype = new TreeBase();

RBTreeList.prototype._comparator = function (a, b) {
    return a === b ? 0 : a < b ? -1 : 1; // ASC
};

RBTreeList.prototype.find = function () {
    return this.get.call(this, arguments[0]);
};

RBTreeList.prototype.insert = function () {
    return this.set.call(this, arguments[0], arguments[0]);
};

// Use the leftCount to find the node, not the comparator
RBTreeList.prototype.get = function (searchIndex) {
    var node = this._root;
    var index = this.minIndex - 1; // Offset because the first node's `leftCount` IS its index
    var comparator = function (a, b) { return a - b; };
    var dir = true; // Add leftCount initially
    var c;

    while (node !== null) {

        if (dir) {
            index += node.leftCount + 1;
        } else {
            index -= node.rightCount + 1;
        }

        c = comparator(searchIndex, index);

        if (c === 0) {
            return node.data;
        } else {
            dir = c > 0;
            node = node.getChild(dir);
        }
    }

    return null;
};

RBTreeList.prototype.insert = function () {
    this.set.call(this, arguments[0], arguments[0]);
};

// Return index of insertion, -1 if duplicate
RBTreeList.prototype.set = function (setIndex, data) {
    var index = this.minIndex - 1;
    var inserted = false;
    var node;
    var parents = [];

    if (this._root === null) {
        // Empty tree
        this._root = new Node(data);
        inserted = true;
        index = 0;
        this.size++;
    } else {
        var head = new Node(undefined); // Fake tree root

        var dir = 1;
        var lastDir = 0;

        // Setup
        var ggp = head; // Great-grand-parent
        var gp = null; // Grandparent
        var p = null; // Parent
        node = this._root;
        ggp.right = this._root;

        // Search down
        while (true) {
            if (node === null) {
                // Insert new node at the bottom
                node = new Node(data);
                p.setChild(dir, node);
                inserted = true;
                this.size++;
            } else if (this._isRed(node.left) && this._isRed(node.right)) {
                // Color flip
                node.red = true;
                node.left.red = false;
                node.right.red = false;
            }

            // Fix red violation
            if (this._isRed(node) && this._isRed(p)) {
                var dir2 = ggp.right === gp;

                if (node === p.getChild(lastDir)) {
                    ggp.setChild(dir2, this.singleRotate(gp, !lastDir));
                } else {
                    ggp.setChild(dir2, this.doubleRotate(gp, !lastDir));
                }
            }

            // Calculate index as traversing
            if (dir) {
                index += node.leftCount + 1;
            } else {
                index += -1;
            }

            var cmp = this._comparator(index, setIndex);

            // Stop if found
            if (cmp === 0 || inserted) {
                if (! inserted) {
                    index = -1;
                }

                break;
            }

            lastDir = dir;
            dir = cmp < 0;

            // Update helpers
            if (gp !== null) {
                ggp = gp;
            }

            gp = p;
            p = node;
            node = node.getChild(dir);
            parents.unshift(p);
        }

        // Update root
        this._root = head.right;
    }

    parents.forEach(function (node) {
        node.updateChildCount();
    });

    // Keep track of the range of indexes in the tree
    this.minIndex = Math.min(this.minIndex, setIndex);

    // Make root black
    this._root.red = false;

    return node;
};
// Returns index of removal, -1 if not found
RBTreeList.prototype.remove = function(removeIndex) {
    if (this._root === null) {
        return -1;
    }

    var head = new Node(undefined); // Fake tree root
    var node = head;
    node.right = this._root;
    var gp = null; // Grand parent
    var p = null; // Parent
    var found = null; // Found item
    var dir = 1;
    var index = this.minIndex - 1;
    var parents = [];
    var addParent = function (node) {
        if (node.data) {
            parents.push(node);
        }
    };

    var _setChild = Node.prototype.setChild;

    Node.prototype.setChild = function () {
        addParent(this);
        return _setChild.apply(this, arguments);
    };

    while (node.getChild(dir) !== null) {
        var lastDir = dir;

        // Update helpers
        gp = p;
        p = node;
        addParent(p);
        node = node.getChild(dir);

        if (dir) {
            index += node.leftCount + 1;
        } else {
            index += -1;
        }

        var cmp = this._comparator(removeIndex, index);

        dir = cmp > 0;

        if (cmp === 0) {
            found = node;
        }

        // Push the red node down
        if (!this._isRed(node) && !this._isRed(node.getChild(dir))) {
            if (this._isRed(node.getChild(!dir))) {
                var sr = this.singleRotate(node, dir);
                p.setChild(lastDir, sr);
                p = sr;
            } else if (!this._isRed(node.getChild(!dir))) {
                var sibling = p.getChild(!lastDir);
                if (sibling !== null) {
                    if (!this._isRed(sibling.getChild(!lastDir)) && !this._isRed(sibling.getChild(lastDir))) {
                        // Color flip
                        p.red = false;
                        sibling.red = true;
                        node.red = true;
                    } else {
                        var dir2 = gp.right === p;

                        if (this._isRed(sibling.getChild(lastDir))) {
                            gp.setChild(dir2, this.doubleRotate(p, lastDir));
                        } else if (this._isRed(sibling.getChild(!lastDir))) {
                            gp.setChild(dir2, this.singleRotate(p, lastDir));
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
    if (found !== null) {
        var foundData = found.data;

        found.data = node.data; // Move the child node's data to the found node
        p.setChild(p.right === node, node.getChild(node.left === null));

        // Re-create the node that was found so that it can be returned
        found = new Node(foundData);

        if (p.data) {
            var iter = this.findIter(p.data);
            var n;

            if (iter !== null) {
                parents = parents.concat(iter._ancestors);
            }

            for (var i = parents.length; i-- > 0;) {
                n = parents[i];
                n.updateChildCount();
            }
        }

        this.size--;
    } else {
        index = -1;
    }

    // Update root and make it black
    this._root = head.right;
    if (this._root !== null) {
        this._root.red = false;
    }

    Node.prototype.setChild = _setChild;

    return found;
};

RBTreeList.prototype._isRed = function (node) {
    return node !== null && node.red;
};

RBTreeList.prototype.singleRotate = function (root, dir) {
    var save = root.getChild(!dir);

    root.setChild(!dir, save.getChild(dir));
    save.setChild(dir, root);

    root.red = true;
    save.red = false;

    return save;
};

RBTreeList.prototype.doubleRotate = function (root, dir) {
    root.setChild(!dir, this.singleRotate(root.getChild(!dir), !dir));
    return this.singleRotate(root, dir);
};

module.exports = RBTreeList;
