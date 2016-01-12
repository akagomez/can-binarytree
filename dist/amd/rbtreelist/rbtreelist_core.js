/*can-binarytree@0.0.8#rbtreelist/rbtreelist_core*/
define(function (require, exports, module) {
    var TreeBase = require('../treebase/treebase');
    var nodeId = 0;
    var isWholePositiveNumber = function (value) {
        return !isNaN(value) && typeof value === 'number' && value >= 0 && value / 1 === value;
    };
    function Node(data, isHead) {
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
        if (!encountered) {
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
        if (this[link] && this[link].parent === this) {
            this[link].parent = null;
        }
        this[link] = node;
        if (node !== null) {
            node.parent = this;
        }
        this.updateChildCount();
        return this;
    };
    Node.prototype.updateChildCount = function () {
        this.rightCount = !this.right ? 0 : this.right.leftCount + this.right.leftGapCount + this.right.rightCount + 1;
        this.leftCount = !this.left ? 0 : this.left.leftCount + this.left.leftGapCount + this.left.rightCount + 1;
        if (this.parent && this.parent !== this) {
            this.parent.updateChildCount();
        }
        return this;
    };
    Node.prototype.setSibling = function (dir, node, splice) {
        var link = dir ? 'next' : 'prev';
        var backLink = dir ? 'prev' : 'next';
        var saved;
        if (!this.isHead && node) {
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
        return this;
    };
    function RBTreeList(initialItems, setCallback) {
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
        return a === b ? 0 : a < b ? -1 : 1;
    };
    RBTreeList.prototype.find = function () {
        return this.get.call(this, arguments[0]);
    };
    RBTreeList.prototype.insert = function () {
        return this.set.call(this, arguments[0], arguments[0]);
    };
    RBTreeList.prototype.get = function (searchIndex) {
        var node = this._root;
        var dir = true;
        var c;
        searchIndex = +searchIndex;
        if (!isWholePositiveNumber(searchIndex)) {
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
    RBTreeList.prototype.unshift = function (value) {
        var args = Array.prototype.slice.call(arguments);
        var self = this;
        args.forEach(function (value) {
            self.set(0, value, true);
        });
        return this.length;
    };
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
        if (startIndex < 0) {
            startIndex = listLength + startIndex;
            startIndex = Math.max(startIndex, 0);
        } else {
            startIndex = Math.min(startIndex, listLength);
        }
        deleteCount = Math.max(deleteCount, 0);
        deleteCount = Math.min(listLength - startIndex, deleteCount);
        for (i = startIndex; i < startIndex + deleteCount; i++) {
            removed.push(this.unset(startIndex, true));
        }
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
        this._indexOfNodeCache = {};
    };
    RBTreeList.prototype.indexOfNode = function (node, useCache) {
        if (!node) {
            return -1;
        }
        useCache = typeof useCache !== 'undefined' ? useCache : true;
        var parentNode = node.parent;
        var index;
        if (useCache) {
            index = this._indexOfNodeCache[node.id];
            if (index !== undefined) {
                return index;
            }
        }
        if (parentNode && !parentNode.isHead) {
            index = this.indexOfNode(parentNode, useCache);
            if (parentNode.left === node) {
                index -= node.rightCount + parentNode.leftGapCount + 1;
            } else if (parentNode.right === node) {
                index += node.leftCount + node.leftGapCount + 1;
            }
        } else {
            index = node.leftCount + node.leftGapCount;
        }
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
        if (typeof length === 'undefined' || length <= 0 || typeof values.slice === 'undefined') {
            return;
        }
        var recursivelySet = function (parentNode, dir, lowerIndex, upperIndex) {
            var numberOfValues = upperIndex - lowerIndex + 1;
            var centerIndex = lowerIndex + Math.floor(numberOfValues / 2);
            var leftBlackHeight = 0;
            var rightBlackHeight = 0;
            var childNode, nextLeftUpper, nextRightLower, leftSibling, rightSibling;
            childNode = nodes[centerIndex];
            parentNode.setChild(dir, childNode);
            this._gapAndSize(centerIndex, childNode);
            if (setCallback) {
                setCallback(centerIndex, childNode);
            }
            nextLeftUpper = centerIndex - 1;
            nextRightLower = centerIndex + 1;
            if (nextLeftUpper >= lowerIndex) {
                leftBlackHeight = recursivelySet.call(this, childNode, false, lowerIndex, nextLeftUpper);
            }
            if (nextRightLower <= upperIndex) {
                rightBlackHeight = recursivelySet.call(this, childNode, true, nextRightLower, upperIndex);
            }
            leftSibling = childNode.getChild(false);
            rightSibling = childNode.getChild(true);
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
            if (childNode === head.getChild(true)) {
                childNode.red = false;
            } else if (!leftSibling && !rightSibling) {
                childNode.red = true;
            } else if (leftSibling || rightSibling) {
                if (leftSibling && !leftSibling.red || rightSibling && !rightSibling.red) {
                    childNode.red = true;
                } else {
                    childNode.red = false;
                }
            } else if (leftSibling && rightSibling) {
                if (!leftSibling.red && !rightSibling.red) {
                    childNode.red = true;
                } else {
                    childNode.red = false;
                }
            }
            return leftBlackHeight + (!childNode.red ? 1 : 0);
        };
        for (i = 0; i < values.length; i++) {
            nodes.push(new Node(values[i]));
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
        if (this.last() === insertedNode) {
            if (!insertedNode.prev) {
                insertedNode.leftGapCount = setIndex;
            } else {
                insertedNode.leftGapCount = setIndex - this.indexOfNode(insertedNode.prev, false) - 1;
            }
        } else if (insertedNode.next) {
            var nextNode = insertedNode.next;
            var nodeIndex = this.indexOfNode(nextNode, false) - 1;
            var gapStart = nodeIndex - nextNode.leftGapCount;
            if (setIndex >= gapStart && setIndex < nodeIndex) {
                insertedNode.leftGapCount = setIndex - gapStart;
                nextNode.leftGapCount = nodeIndex - setIndex + (splice ? 0 : -1);
                insertedNode.updateChildCount();
                nextNode.updateChildCount();
            }
        }
        if (setIndex >= this.length) {
            this.length = setIndex + 1;
        } else if (splice) {
            this.length++;
        }
    };
    RBTreeList.prototype.set = function (setIndex, data, splice) {
        var inserted = false;
        var node;
        var found = false;
        setIndex = +setIndex;
        if (!isWholePositiveNumber(setIndex)) {
            return null;
        }
        if (this._root === null) {
            node = new Node(data);
            this._root = node;
            this._gapAndSize(setIndex, node, splice);
            inserted = true;
        } else {
            var head = new Node(undefined, true);
            var dir = 1;
            var lastDir = 0;
            var ggp = head;
            var gp = null;
            var p = null;
            node = this._root;
            ggp.setChild(true, this._root);
            while (true) {
                if (node === null) {
                    node = new Node(data);
                    p.setSibling(dir, node, true);
                    p.setChild(dir, node, true);
                    this._gapAndSize(setIndex, node, splice);
                    inserted = true;
                } else if (this._isRed(node.left) && this._isRed(node.right)) {
                    node.red = true;
                    node.left.red = false;
                    node.right.red = false;
                }
                if (this._isRed(node) && this._isRed(p)) {
                    var dir2 = ggp.right === gp;
                    if (node === p.getChild(lastDir)) {
                        ggp.setChild(dir2, this.singleRotate(gp, !lastDir));
                    } else {
                        ggp.setChild(dir2, this.doubleRotate(gp, !lastDir));
                    }
                }
                var cmp = this._comparator(node, setIndex);
                if (cmp === 0 && !splice) {
                    if (!inserted) {
                        node.data = data;
                    }
                    break;
                } else if ((cmp === 0 || found) && splice) {
                    if (inserted) {
                        break;
                    }
                    if (!found) {
                        found = true;
                        cmp = 1;
                    }
                }
                lastDir = dir;
                dir = cmp < 0;
                if (gp !== null) {
                    ggp = gp;
                }
                gp = p;
                p = node;
                node = node.getChild(dir);
                this._root = head.right;
            }
            this._root = head.right;
        }
        this._root.red = false;
        this._root.parent = null;
        if (inserted) {
            this._emptyIndexOfNodeCache();
        }
        return node;
    };
    RBTreeList.prototype.unset = function (unsetIndex, remove) {
        if (this._root === null) {
            return -1;
        }
        var head = new Node(undefined, true);
        var node = head;
        node.setChild(true, this._root);
        var gp = null;
        var p = null;
        var found = null;
        var dir = 1;
        unsetIndex = +unsetIndex;
        if (!isWholePositiveNumber(unsetIndex)) {
            return null;
        }
        while (node.getChild(dir) !== null) {
            var lastDir = dir;
            gp = p;
            p = node;
            node = node.getChild(dir);
            var cmp = this._comparator(unsetIndex, node);
            dir = cmp > 0;
            if (cmp === 0) {
                found = node;
            }
            if (!this._isRed(node) && !this._isRed(node.getChild(dir))) {
                if (this._isRed(node.getChild(!dir))) {
                    var sr = this.singleRotate(node, dir);
                    p.setChild(lastDir, sr);
                    p = sr;
                } else if (!this._isRed(node.getChild(!dir))) {
                    var sibling = p.getChild(!lastDir);
                    if (sibling !== null) {
                        if (!this._isRed(sibling.getChild(!lastDir)) && !this._isRed(sibling.getChild(lastDir))) {
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
        if (found !== null) {
            this._removeNode(found, node, remove);
            this._emptyIndexOfNodeCache();
        }
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
        if (replacementParent) {
            replacementParent.setChild(replacementParent.right === replacement, node.getChild(replacement.left === null));
        }
        if (foundParent && found !== replacement) {
            foundParent.setChild(foundParent.right === found, replacement);
        }
        var foundLeft = found.left;
        var foundRight = found.right;
        found.setChild(false, null);
        found.setChild(true, null);
        replacement.setChild(false, foundLeft);
        replacement.setChild(true, foundRight);
        replacement.red = found.red;
        if (found.next) {
            found.next.leftGapCount += found.leftGapCount + (remove ? 0 : 1);
            found.next.updateChildCount();
        }
        if (found.next) {
            found.next.setSibling(false, found.prev);
        }
        if (found.prev) {
            found.prev.setSibling(true, found.next);
        }
        found.parent = null;
        found.next = null;
        found.prev = null;
        if (remove) {
            this.length--;
        }
    };
    RBTreeList.prototype.eachNode = function (cb, context) {
        var iterator = this.iterator();
        while (iterator.next() !== null) {
            var node = iterator.node();
            var index = this.indexOfNode(node);
            if (cb.apply(context, [
                    node,
                    index
                ]) === false) {
                break;
            }
        }
        return this;
    };
    RBTreeList.prototype.each = function (cb, context) {
        return this.eachNode(function (node, index) {
            return cb.apply(context, [
                node.data,
                index
            ]);
        }, context);
    };
    RBTreeList.prototype.first = function (node) {
        var res;
        if (!node) {
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
    RBTreeList.prototype.last = function (node) {
        var res;
        if (!node) {
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
                out += '(' + node.leftCount + '|' + node.leftGapCount + '|' + node.rightCount + ')';
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
            var left = node.prev && node.prev.data;
            var right = node.next && node.next.data;
            left = left ? left : '_';
            right = right ? right : '_';
            out += left + ' < ' + node.data + ' > ' + right + '\n';
        });
        console.log(out);
        return this;
    };
    RBTreeList.prototype._printIndexesValue = function (node) {
        var value = node.data === undefined ? '_' : node.data;
        value = typeof value === 'object' ? '{id:' + node.id + '}' : value;
        return value;
    };
    module.exports = RBTreeList;
});