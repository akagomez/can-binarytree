var TreeBase = require('./treebase');

var nodeId = 0;

function Node (data, isHead) {
    this.id = nodeId++;
    this.parent = null;
    this.data = data;
    this.left = null;
    this.right = null;
    this.red = true;
    this.leftCount = 0;
    this.rightCount = 0;
    this.leftGapCount = 0;
    this.isEnumerable = true;
    this.isHead = isHead;
}

Node.prototype.getChild = function (dir) {
    return dir ? this.right : this.left;
};

Node.prototype.setChild = function (dir, node, link) {
    var saved;

    if (dir) {
        this.right = node;

        if (link) {
            if (! this.isHead && node) {
                saved = this.next;
                if (saved && saved !== node) {
                    saved.prev = node;
                    node.next = saved;
                    node.prev = this;
                } else {
                    node.prev = this;
                }
            }
            this.next = node;
        }


    } else {
        this.left = node;

        if (link) {
            if (! this.isHead && node) {
                saved = this.prev;
                if (saved && saved !== node) {
                    saved.next = node;
                    node.prev = saved;
                    node.next = this;
                } else {
                    node.next = this;
                }
            }
            this.prev = node;
        }

    }

    if (node !== null) {
        node.parent = this;
    }

    this.updateChildCount();
};
Node.prototype.updateChildCount = function () {
    this.rightCount = ! this.right ? 0 :
        this.right.leftCount +
        this.right.leftGapCount +
        this.right.rightCount + 1;
    this.leftCount = ! this.left ? 0 :
        this.left.leftCount +
        this.left.leftGapCount +
        this.left.rightCount + 1;
};

function RBTreeList(comparator) {
    this._root = null;
    this.size = 0;
    this.gappedNodes = [];
    this.indexOfCache = {};
}

RBTreeList.prototype = new TreeBase();

RBTreeList.prototype.Node = Node;

RBTreeList.prototype._comparator = function (a, b) {
    return a === b ? 0 : a < b ? -1 : 1; // ASC
};

// Make compatible with old tests
RBTreeList.prototype.find = function () {
    return this.get.call(this, arguments[0]);
};

// Make compatible with old tests
RBTreeList.prototype.insert = function () {
    return this.set.call(this, arguments[0], arguments[0]);
};

// Use the leftCount to find the node, not the comparator
RBTreeList.prototype.get = function (searchIndex) {
    var node = this._root;
    var comparator = function (a, b) { return a - b; };
    var dir = true; // Add leftCount initially
    var index, c;

    while (node !== null) {

        index = this.indexOfNode(node);
        c = comparator(searchIndex, index);

        if (c === 0) {
            return node;
        } else {
            dir = c > 0;
            node = node.getChild(dir);
        }
    }

    return null;
};

RBTreeList.prototype.splice = function (startIndex, deleteCount) {
    var removed = [];
    var listLength = this.size;
    var i, node, value;

    startIndex = parseInt(startIndex, 10);
    deleteCount = parseInt(deleteCount, 10);

    // Deal with negative `startIndex`
    if (startIndex < 0) {
        // Subtract the negative `startIndex` from the length
        startIndex = listLength + startIndex;

        // If `startIndex` becomes negative again, default to zero
        startIndex = Math.max(startIndex, 0);
    } else {
        startIndex = Math.min(startIndex, listLength);
    }

    // Deal with `deleteCount`
    deleteCount = Math.max(deleteCount, 0);

    // `startIndex` and `deleteCount` combined cannot be greater
    // than what's left to be deleted after `startIndex`
    deleteCount = Math.min(listLength - startIndex, deleteCount);

    // Remove
    for (i = startIndex; i < startIndex + deleteCount; i++) {
        removed.push(this.remove(startIndex));
    }

    // Insert - as in between existing items, without overwriting
    for (i = 2; i < arguments.length; i++) {
        node = this.set(startIndex + (i - 2), arguments[i], true);
    }

    return removed;
};

RBTreeList.prototype.indexOfNode = function (node) {
    if (! node) {
        return -1;
    }

    var parentNode = node.parent;
    var index = 0;

    // if (node.id in this.indexOfCache) {
    //     return this.indexOfCache[node.id];
    // }

    if (parentNode && ! parentNode.isHead) {
        index = this.indexOfNode(parentNode, index);

        if (parentNode.left === node) {
            index -= node.rightCount + parentNode.leftGapCount + 1;
        } else if (parentNode.right === node) {
            index += node.leftCount + node.leftGapCount + 1;
        }
    } else {
        index = node.leftCount + node.leftGapCount;
    }

    // this.indexOfCache[node.id] = index;

    return index;
};

RBTreeList.prototype._gapAndSize = function (setIndex, insertedNode, splice) {
    // Get the last node in the tree, then get its index
    var lastNodeIndex = this.indexOfNode(this.last());


    // If the setIndex is greater than the last node's index, use it's index
    // to determine the gap size
    // NOTE: It may seem like it would make more sense to use the size for
    // this, but size is unreliable; Consider this example:
    //     var a = []; a[100] = 'foo'; a.length //-> 101
    //     a.splice(100, 1); a.length //-> 100
    if (setIndex > lastNodeIndex) {
        if (lastNodeIndex < 0) {
            // There is no last node; The setIndex is the gap
            insertedNode.leftGapCount = setIndex;
        } else {
            // Don't include the last node in the size of this node's gap
            insertedNode.leftGapCount = setIndex - lastNodeIndex - 1;
        }

        this.gappedNodes.push(insertedNode);
    } else {

        for (var i = this.gappedNodes.length - 1; i >= 0; i--) {
            var node = this.gappedNodes[i];
            var nodeIndex = this.indexOfNode(node);
            var gapStart;

            if (node.parent && ! node.parent.isHead && node.parent.right === node) {
                gapStart = this.indexOfNode(node.parent);
            } else {
                gapStart = nodeIndex - node.leftGapCount;
            }

            if (setIndex > gapStart && setIndex < nodeIndex) {
                if (setIndex === 1665) { debugger; }
                insertedNode.leftGapCount = setIndex - gapStart;
                node.leftGapCount = nodeIndex - setIndex + (splice ? 0 : -1);
                node.leftCount = node.leftCount + insertedNode.leftGapCount + (splice ? 2 : 1);

                if (insertedNode.leftGapCount > 0) {
                    this.gappedNodes.push(insertedNode);
                }

                if (node.leftGapCount === 0) {
                    this.gappedNodes.splice(i, 1);
                }
            }
        };
    }

    // Only increase the size if the item was spliced, or
    // set at an index greater than the existing items; Otherwise
    // this item was placed in a gap
    if (setIndex >= this.size) {
        this.size = setIndex + 1;
    } else if (splice) {
        this.size++;
    }
};

// Return index of insertion, -1 if duplicate
RBTreeList.prototype.set = function (setIndex, data, splice) {
    var index;
    var inserted = false;
    var node;
    var parents = [];
    var found = false;

    // Don't allow negative values
    if (setIndex < 0) {
        return null;
    }

    // If the size of the list is increasing by more than one as
    // a result of this `set` a hole/gap will be created and we
    // should handle that here.
    // if (setIndex >= this.size + 1) {
    //     return this._setHoley(setIndex, data);
    // }

    if (this._root === null) {
        // Empty tree
        node = new Node(data);
        this._gapAndSize(setIndex, node, splice);
        this._root = node;
        inserted = true;
    } else {

        var head = new Node(undefined, true); // Fake tree root

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
                this._gapAndSize(setIndex, node, splice);
                p.setChild(dir, node, true);
                parents.forEach(function (node) {
                    node.updateChildCount();
                });
                inserted = true;
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

            index = this.indexOfNode(node);

            var cmp = this._comparator(index, setIndex);

            // Stop if found
            if (cmp === 0 && ! splice) {

                // If we got here without inserting, a node already
                // exists at this position
                if (! inserted) {

                    // Overwrite the existing value
                    node.data = data;

                    // Make it enumerable
                    node.isEnumerable = true;
                }

                break;

            // Handle splice
            } else if ((cmp === 0 || found) && splice) {

                // Bottom was reached and node created; Finished
                if (inserted) {
                    break;
                }

                // Step #1: Go left
                if (! found) {
                    found = true;
                    cmp = 1;

                // Step #2: Go right, repeat
                } else {
                    cmp = -1;
                }
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

            // `indexOfNode()` - which is used in `gapAndSet` -  depends on
            // `this._root`, so we can't wait until the loop finishes to
            // update the root
            this._root = head.right;
        }

        // Update root
        this._root = head.right;
    }

    parents.forEach(function (node) {
        node.updateChildCount();
    });

    // Make root black
    this._root.red = false;

    return node;
};

// Returns index of removal, -1 if not found
RBTreeList.prototype.remove = function(removeIndex) {
    if (this._root === null) {
        return -1;
    }

    var head = new Node(undefined, true); // Fake tree root
    var node = head;
    node.right = this._root;
    var gp = null; // Grand parent
    var p = null; // Parent
    var found = null; // Found item
    var dir = 1;
    var index = -1;
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

        index = this.indexOfNode(node);

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

        // Remove the node from the gappedNodes while it's still intact
        var gappedNodeRemoveIndex;
        this.gappedNodes.forEach(function (node, i) {
            if (node === found) {
                gappedNodeRemoveIndex = i;
            }
        });
        if (gappedNodeRemoveIndex >= 0) {
            this.gappedNodes.splice(gappedNodeRemoveIndex, 1);
        }

        // Move the child node's data to the found node
        found.data = node.data;

        // Re-assemble
        p.setChild(p.right === node, node.getChild(node.left === null));

        // Re-create the node that was found so that it can be returned
        // TODO: Find a way to return the ACTUAL node
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

// Calls cb on each node, in order
RBTreeList.prototype.each = function (cb) {
    var i = 0;
    var it = this.iterator();
    while (it.next() !== null) {

        // Don't call cb on "holey" indexes
        if (! it.node().isEnumerable) {
            continue;
        }

        // Stop iterating if callback returns false
        if (cb(it.node(), i) === false) {
            break;
        }

        i++;
    }
};

// Returns null if tree is empty
RBTreeList.prototype.last = function (node) {
    var res;
    if (! node) {
        res = this._root;
    } else {
        res = node;
    }
    if (res === null) {
        return null;
    }

    while (res.right !== null) {
        res = res.right;
    }

    return res;
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
