
var TreeBase = require('./treebase');

function Node(data) {
    this.data = data;
    this.left = null;
    this.right = null;
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
    }
};

function BinTree(comparator) {
    this._root = null;
    this._comparator = comparator;
    this.size = 0;
}

BinTree.prototype = new TreeBase();

// Returns true if inserted, false if duplicate
BinTree.prototype.insert = function(data) {
    if(this._root === null) {
        // Empty tree
        this._root = new Node(data);
        this.size++;
        return true;
    }

    var dir = 0;

    // Setup
    var p = null; // Parent
    var node = this._root;

    // Search down
    while(true) {
        if(node === null) {
            // Insert new node at the bottom
            node = new Node(data);
            p.setChild(dir, node);
            ret = true;
            this.size++;
            return true;
        }

        // Stop if found
        if(this._comparator(node.data, data) === 0) {
            return false;
        }

        dir = this._comparator(node.data, data) < 0;

        // Update helpers
        p = node;
        node = node.getChild(dir);
    }
};

// Returns true if removed, false if not found
BinTree.prototype.remove = function(data) {
    if(this._root === null) {
        return false;
    }

    var head = new Node(undefined); // Fake tree root
    var node = head;
    node.right = this._root;
    var p = null; // Parent
    var found = null; // Found item
    var dir = 1;

    while(node.getChild(dir) !== null) {
        p = node;
        node = node.getChild(dir);
        var cmp = this._comparator(data, node.data);
        dir = cmp > 0;

        if(cmp === 0) {
            found = node;
        }
    }

    if(found !== null) {
        found.data = node.data;
        p.setChild(p.right === node, node.getChild(node.left === null));

        this._root = head.right;
        this.size--;
        return true;
    }
    else {
        return false;
    }
};

module.exports = BinTree;

