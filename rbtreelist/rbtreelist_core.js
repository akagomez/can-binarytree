var TreeBase = require('../treebase/treebase');

var nodeId = 0;

// Identify if a value is a number that is whole
// (equally divisible by 1) and positive
var isWholePositiveNumber = function (value) {
    return (! isNaN(value) && // Isn't a NaN
        typeof value === 'number' && // Is a number
        value >= 0 && // Is greater than or equal to 0
        value / 1 === value); // Is whole
};

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
    this.isHead = isHead;
    this.next = null;
    this.prev = null;
}

Node.prototype.getChild = function (dir) {
    return dir ? this.right : this.left;
};

Node.prototype.debugCircularParents = function (encountered) {
    if (! encountered) {
        encountered = {};
    }

    if (encountered[this.id]) {
        throw new Error('A node cannot be a parent of itself');
    } else {
        encountered[this.id] = true;
    }

    if (this.parent) {
        this.parent.debugCircularParents(encountered);
    }
};


Node.prototype.setChild = function (dir, node) {

    var link = dir ? 'right' : 'left';

    if (node === this) {
        throw new Error('A node cannot be a child of itself');
    }

    // If the current old link references this node as the parent,
    // break the link
    if (this[link] && this[link].parent === this) {
        this[link].parent = null;
    }

    // Set the new left/right link
    this[link] = node;

    // Set the child's new parent
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

    // Update all parents' child count recursively
    if (this.parent && this.parent !== this) {
        this.parent.updateChildCount();
    }
};

Node.prototype.setSibling = function (dir, node, splice) {
    var link = dir ? 'next' : 'prev';
    var backLink = dir ? 'prev' : 'next';
    var saved;

    if (! this.isHead && node) {
        saved = this[link];
        if (splice && saved && saved !== node) {
            saved[backLink] = node;
            node[link] = saved;
            node[backLink] = this;
        } else {
            node[backLink] = this;
        }
    }

    this[link] = node;
};


function RBTreeList (initialItems, setCallback) {
    this._root = null;
    this.length = 0;
    this._indexOfNodeCache = {};
    this.batchSet.apply(this, arguments);
}

RBTreeList.prototype = new TreeBase();

RBTreeList.prototype.Node = Node;

RBTreeList.prototype._comparator = function (a, b) {
    a = a instanceof this.Node ? this.indexOfNode(a, false) : a;
    b = b instanceof this.Node ? this.indexOfNode(b, false) : b;
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
    var dir = true; // Add leftCount initially
    var c;

    searchIndex = +searchIndex;

    // A positive whole number is required to "get"
    if (! isWholePositiveNumber(searchIndex)) {
        return null;
    }

    while (node !== null) {

        c = this._comparator(searchIndex, node);

        if (c === 0) {
            return node;
        } else {
            dir = c > 0;
            node = node.getChild(dir);
        }
    }

    return null;
};

// TODO: Make DRY
RBTreeList.prototype.unshift = function (value) {
    var args = Array.prototype.slice.call(arguments);
    var self = this;

    args.forEach(function (value) {
        self.set(0, value, true);
    });

    return this.length;
};

// TODO: Make DRY
RBTreeList.prototype.push = function () {
    var args = Array.prototype.slice.call(arguments);
    var self = this;

    args.forEach(function (value) {
        self.set(self.length, value);
    });

    return this.length;
};

RBTreeList.prototype.splice = function (startIndex, deleteCount) {
    var removed = [];
    var listLength = this.length;
    var i, node;

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
        removed.push(this.unset(startIndex, true));
    }

    // Insert - as in between existing items, without overwriting
    for (i = 2; i < arguments.length; i++) {
        node = this.set(startIndex + (i - 2), arguments[i], true);
    }

    return removed;
};

RBTreeList.prototype.indexOf = function (value) {

    var index = -1;

    if (typeof value === 'undefined') {
        return index;
    }

    this.each(function (data, i) {
        if (data === value) {
            index = i;
            return false;
        }
    });

    return index;
};

RBTreeList.prototype._emptyIndexOfNodeCache = function () {
    // NOTE: This is faster than emptying the map with `delete`, but bad
    // for GC. To compensate we should call this method as infrequently as
    // possible. Also, internally we don't use the cache when calling
    // `indexOfNode` so that we don't have to empty the cache before/after
    // altering it.
    this._indexOfNodeCache = {};
};

RBTreeList.prototype.indexOfNode = function (node, useCache) {
    if (! node) {
        return -1;
    }

    // Default `useCache` to true
    useCache = typeof useCache !== 'undefined' ? useCache : true;

    var parentNode = node.parent;
    var index;

    if (useCache) {
        index = this._indexOfNodeCache[node.id];

        if (index !== undefined) {
            return index;
        }
    }

    if (parentNode && ! parentNode.isHead) {
        index = this.indexOfNode(parentNode, useCache);

        if (parentNode.left === node) {
            index -= node.rightCount + parentNode.leftGapCount + 1;
        } else if (parentNode.right === node) {
            index += node.leftCount + node.leftGapCount + 1;
        }
    } else {
        index = node.leftCount + node.leftGapCount;
    }

    // Cache
    if (useCache) {
        this._indexOfNodeCache[node.id] = index;
    }

    return index;
};

RBTreeList.prototype.values = function () {
    var outputArray = [];

    this.each(function (node) {
        outputArray.push(node.data);
    });

    return outputArray;
};

RBTreeList.prototype.batchSet = function (values, setCallback) {
    var length = values && values.length;
    var nodes = [];
    var head, root, i;

    if (typeof length === 'undefined' || length <= 0
        || typeof values.slice === 'undefined') {
        return;
    }

    var recursivelySet = function (parentNode, dir, lowerIndex, upperIndex) {

        // Find the center index of this range
        // NOTE: +1 to account for the value AT upperIndex
        var numberOfValues = upperIndex - lowerIndex + 1;
        var centerIndex = lowerIndex + Math.floor(numberOfValues / 2);
        var leftBlackHeight = 0;
        var rightBlackHeight = 0;
        var childNode, nextLeftUpper, nextRightLower, leftSibling,
            rightSibling;

        // Get the prepared/linked node
        childNode = nodes[centerIndex];

        // Add the node to the tree
        parentNode.setChild(dir, childNode);

        this._gapAndSize(centerIndex, childNode);

        // Do something with the created node
        if (setCallback) {
            setCallback(centerIndex, childNode);
        }

        // Redefine the bounds
        nextLeftUpper = centerIndex - 1;
        nextRightLower = centerIndex + 1;

        if (nextLeftUpper >= lowerIndex) {
            leftBlackHeight =
                recursivelySet.call(this, childNode, false, lowerIndex, nextLeftUpper);
        }

        if (nextRightLower <= upperIndex) {
            rightBlackHeight =
                recursivelySet.call(this, childNode, true, nextRightLower, upperIndex);
        }

        // Save a reference to each sibling
        leftSibling = childNode.getChild(false);
        rightSibling = childNode.getChild(true);

        // Balance the black-height
        // NOTE: This operation can be pretty naive because
        // we know the  tree is balanced
        if (leftBlackHeight < rightBlackHeight) {
            leftSibling.red = false;
            leftBlackHeight++;
        } else if (rightBlackHeight < leftBlackHeight) {
            rightSibling.red = false;
            rightBlackHeight++;
        }

        if (leftBlackHeight !== rightBlackHeight) {
            throw new Error('The black-height constraint is not met');
        }

        // If this is the root node, make it BLACK
        if (childNode === head.getChild(true)) {
            childNode.red = false;

        // If this node has no children, make it RED
        } else if (! leftSibling && ! rightSibling) {
            childNode.red = true;

        // If this node has at least one child...
        } else if (leftSibling || rightSibling) {

            // AND one of those two children is BLACK, make it RED
            if ((leftSibling && ! leftSibling.red) ||
                    (rightSibling && ! rightSibling.red)) {
                childNode.red = true;

            // OTHERWISE make it BLACK
            } else {
                childNode.red = false;
            }

        // If this node has two children...
        } else if (leftSibling && rightSibling) {

            // AND both of those two children are BLACK, make it RED
            if (! leftSibling.red && ! rightSibling.red) {
                childNode.red = true;

            // OTHERWISE make it BLACK
            } else {
                childNode.red = false;
            }

        }

        // Add one to the black-height if this node is also black
        // NOTE: We assume: leftBlackHeight === rightBlackHeight
        return leftBlackHeight + (! childNode.red ? 1 : 0);
    };

    // Prepare all the nodes
    for (i = 0; i < values.length; i++) {
        nodes.push(new Node(values[i]));

        // Link the nodes together now while it's easy because they're
        // all in order
        if (nodes[i - 1]) {
            nodes[i - 1].setSibling(true, nodes[i], true);
        }
    }

    head = new Node(undefined, true);
    recursivelySet.call(this, head, true, 0, length - 1);
    root = head.getChild(1);
    root.parent = undefined;
    this._root = root;

    return this;
};

RBTreeList.prototype._gapAndSize = function (setIndex, insertedNode, splice) {

    // If the setIndex is greater than the last node's index, use it's index
    // to determine the gap length
    // NOTE: It may seem like it would make more sense to use the length for
    // this, but length is unreliable; Consider this example:
    //     var a = []; a[100] = 'foo'; a.length //-> 101
    //     a.splice(100, 1); a.length //-> 100
    // In this case there would be no Nodes to represent this gap
    if (this.last() === insertedNode) {
        if (! insertedNode.prev) {
            // There is no last node; The setIndex is the gap
            insertedNode.leftGapCount = setIndex;
        } else {
            // Don't include the last node in the length of this node's gap
            insertedNode.leftGapCount =
                setIndex - this.indexOfNode(insertedNode.prev, false) - 1;
        }
    } else if (insertedNode.next) {
        var nextNode = insertedNode.next;
        // Minus 1 to offset the gapless `insertedNode` that's already in the
        // tree
        var nodeIndex = this.indexOfNode(nextNode, false) - 1;
        var gapStart = nodeIndex - nextNode.leftGapCount;

        if (setIndex >= gapStart && setIndex < nodeIndex) {
            insertedNode.leftGapCount = setIndex - gapStart;
            nextNode.leftGapCount = nodeIndex - setIndex + (splice ? 0 : -1);
            insertedNode.updateChildCount();
            nextNode.updateChildCount();
        }

    }

    // Only increase the length if the item was spliced, or
    // set at an index greater than the existing items; Otherwise
    // this item was placed in a gap
    if (setIndex >= this.length) {
        this.length = setIndex + 1;
    } else if (splice) {
        this.length++;
    }
};

// Return index of insertion, -1 if duplicate
RBTreeList.prototype.set = function (setIndex, data, splice) {
    var inserted = false;
    var node;
    var found = false;

    // Cast as number
    setIndex = +setIndex;

    // A positive whole number is required to "set"
    if (! isWholePositiveNumber(setIndex)) {
        return null;
    }

    if (this._root === null) {
        // Empty tree
        node = new Node(data);
        this._root = node;
        this._gapAndSize(setIndex, node, splice);
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
        // ggp.right = this._root;
        ggp.setChild(true, this._root);

        // Search down
        while (true) {
            if (node === null) {
                // Insert new node at the bottom
                node = new Node(data);

                // Setting the gap depends on `next`/`prev` links
                p.setSibling(dir, node, true);

                // Use `leftGapCount` to calculate `leftCount`
                p.setChild(dir, node, true);

                // Use `next`/`prev` links to calculate `leftGapCount`
                this._gapAndSize(setIndex, node, splice);

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

            var cmp = this._comparator(node, setIndex);

            // Stop if found
            if (cmp === 0 && ! splice) {

                // If we got here without inserting, a node already
                // exists at this position
                if (! inserted) {

                    // Overwrite the existing value
                    node.data = data;
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

            // `indexOfNode()` - which is used in `gapAndSet` -  depends on
            // `this._root`, so we can't wait until the loop finishes to
            // update the root
            this._root = head.right;
        }

        // Update root
        this._root = head.right;
    }

    // Make root black
    this._root.red = false;
    this._root.parent = null;

    // Empty the cache if the set altered the tree
    if (inserted) {
        this._emptyIndexOfNodeCache();
    }

    return node;
};

// Returns index of removal, -1 if not found
RBTreeList.prototype.unset = function (unsetIndex, remove) {
    if (this._root === null) {
        return -1;
    }

    var head = new Node(undefined, true); // Fake tree root
    var node = head;
    // node.right = this._root;
    node.setChild(true, this._root);
    var gp = null; // Grand parent
    var p = null; // Parent
    var found = null; // Found item
    var dir = 1;

    // Cast as number
    unsetIndex = +unsetIndex;

    // A positive whole number is required to "unset"
    if (! isWholePositiveNumber(unsetIndex)) {
        return null;
    }

    while (node.getChild(dir) !== null) {
        var lastDir = dir;

        // Update helpers
        gp = p;
        p = node;
        node = node.getChild(dir);

        var cmp = this._comparator(unsetIndex, node);

        // Keep going to find the node left of the found node
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
                    if (!this._isRed(sibling.getChild(!lastDir)) &&
                            !this._isRed(sibling.getChild(lastDir))) {
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

    // Replace the found node with its previous sibling
    if (found !== null) {
        this._removeNode(found, node, remove);
        this._emptyIndexOfNodeCache();
    }

    // Update root and make it black
    this._root = head.right;

    if (this._root !== null) {
        this._root.parent = null;
        this._root.red = false;
    }

    return found;
};

RBTreeList.prototype._removeNode = function (found, node, remove) {
    var foundParent = found.parent;
    var replacement = node;
    var replacementParent = node.parent;

    // Remove the replacement node from its current parent
    if (replacementParent) {
        replacementParent.setChild(replacementParent.right === replacement,
            node.getChild(replacement.left === null));
    }

    // Set the replacement as the same child as the found nodes parent
    if (foundParent && found !== replacement) {
        foundParent.setChild(foundParent.right === found, replacement);
    } /*else if (head.right === found) {
        head.right = replacement;
    }*/

    // Save references to the found node's children
    var foundLeft = found.left;
    var foundRight = found.right;

    // Isolate the found node
    found.setChild(false, null);
    found.setChild(true, null);

    // Move the found node's children to the replacement node
    replacement.setChild(false, foundLeft);
    replacement.setChild(true, foundRight);

    // Maintain red/black order
    replacement.red = found.red;

    // Redistribute gap
    if (found.next) {
        // When `remove` is true, an "index" is eliminated, otherwise
        // it's just like creating a gap
        found.next.leftGapCount += found.leftGapCount + (remove ? 0 : 1);
        found.next.updateChildCount(); // Re-index
    }

    if (found.next) {
        found.next.setSibling(false, found.prev);
    }
    if (found.prev) {
        found.prev.setSibling(true, found.next);
    }

    // Remove the found node's next/prev links
    found.parent = null;
    found.next = null;
    found.prev = null;

    if (remove) {
        this.length--;
    }
};

// Calls cb on each node, in order
RBTreeList.prototype.eachNode = function (cb, context) {
    var iterator = this.iterator();

    while (iterator.next() !== null) {
        var node = iterator.node();
        // TODO: This would be faster if it was calculated
        var index = this.indexOfNode(node);

        // Stop iterating if callback returns false
        if (cb.apply(context, [node, index]) === false) {
            break;
        }
    }

    return this;
};

// Calls cb on each node value, in order
RBTreeList.prototype.each = function (cb, context) {
    return this.eachNode(function (node, index) {
        return cb.apply(context, [node.data, index]);
    }, context);
};

// Returns null if tree is empty
RBTreeList.prototype.first = function (node) {
    var res;
    if (! node) {
        res = this._root;
    } else {
        res = node;
    }
    if (res === null) {
        return null;
    }

    while (res.left !== null) {
        res = res.left;
    }

    return res;
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

RBTreeList.prototype.printIndexes = function (showCounts, startIndex, count) {
    return this.print(function (node) {
        var index = this.indexOfNode(node);
        var value = this._printIndexesValue(node);
        var out = index;

        if (showCounts !== false) {
            out += '(' + node.leftCount + '|' +
                node.leftGapCount + '|' +
                node.rightCount + ')';
        }
        out += ':' + value;

        return out;
    }, startIndex, count);
};

RBTreeList.prototype.printColors = function (startIndex, count) {
    return this.print(function (node) {
        var index = this.indexOfNode(node);
        var out = index;

        out += '(' + (node.red ? 'R' : 'B') + ')';

        return out;
    }, startIndex, count);
};

RBTreeList.prototype.printParents = function (startIndex, count) {
    return this.print(function (node) {
        var out = '(' + node.id + '^' + (node.parent ? node.parent.id : '_') + ')';
        return out;
    }, startIndex, count);
};

RBTreeList.prototype.printLinks = function () {
    var out = '';
    this.each(function (node, index) {
        var left = (node.prev && node.prev.data);
        var right = (node.next && node.next.data);
        left = left ? left : '_';
        right = right ? right : '_';
        out +=  left + ' < ' + node.data + ' > ' + right + '\n';
    });
    console.log(out);
    return this;
};

RBTreeList.prototype._printIndexesValue = function (node) {
    var value = (node.data === undefined ? '_' : node.data);
    value = (typeof value === 'object' ? '{id:'+ node.id + '}' : value);
    return value;
};

module.exports = RBTreeList;
