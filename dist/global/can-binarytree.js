/*[global-shim-start]*/
(function (exports, global){
	var origDefine = global.define;

	var get = function(name){
		var parts = name.split("."),
			cur = global,
			i;
		for(i = 0 ; i < parts.length; i++){
			if(!cur) {
				break;
			}
			cur = cur[parts[i]];
		}
		return cur;
	};
	var modules = (global.define && global.define.modules) ||
		(global._define && global._define.modules) || {};
	var ourDefine = global.define = function(moduleName, deps, callback){
		var module;
		if(typeof deps === "function") {
			callback = deps;
			deps = [];
		}
		var args = [],
			i;
		for(i =0; i < deps.length; i++) {
			args.push( exports[deps[i]] ? get(exports[deps[i]]) : ( modules[deps[i]] || get(deps[i]) )  );
		}
		// CJS has no dependencies but 3 callback arguments
		if(!deps.length && callback.length) {
			module = { exports: {} };
			var require = function(name) {
				return exports[name] ? get(exports[name]) : modules[name];
			};
			args.push(require, module.exports, module);
		}
		// Babel uses the exports and module object.
		else if(!args[0] && deps[0] === "exports") {
			module = { exports: {} };
			args[0] = module.exports;
			if(deps[1] === "module") {
				args[1] = module;
			}
		} else if(!args[0] && deps[0] === "module") {
			args[0] = { id: moduleName };
		}

		global.define = origDefine;
		var result = callback ? callback.apply(null, args) : undefined;
		global.define = ourDefine;

		// Favor CJS module.exports over the return value
		modules[moduleName] = module && module.exports ? module.exports : result;
	};
	global.define.orig = origDefine;
	global.define.modules = modules;
	global.define.amd = true;
	ourDefine("@loader", [], function(){
		// shim for @@global-helpers
		var noop = function(){};
		return {
			get: function(){
				return { prepareGlobal: noop, retrieveGlobal: noop };
			},
			global: global,
			__exec: function(__load){
				eval("(function() { " + __load.source + " \n }).call(global);");
			}
		};
	});
})({},window)
/*can-binarytree@0.0.4#treebase/treebase*/
define('can-binarytree/treebase/treebase', function (require, exports, module) {
    function TreeBase() {
    }
    TreeBase.prototype.clear = function () {
        this._root = null;
        this.size = 0;
    };
    TreeBase.prototype.find = function (data) {
        var res = this._root;
        while (res !== null) {
            var c = this._comparator(data, res.data);
            if (c === 0) {
                return res.data;
            } else {
                res = res.getChild(c > 0);
            }
        }
        return null;
    };
    TreeBase.prototype.findIter = function (data) {
        var res = this._root;
        var iter = this.iterator();
        while (res !== null) {
            var c = this._comparator(data, res.data);
            if (c === 0) {
                iter._cursor = res;
                return iter;
            } else {
                iter._ancestors.push(res);
                res = res.getChild(c > 0);
            }
        }
        return null;
    };
    TreeBase.prototype.getByIndex = function (searchIndex) {
        var node = this._root;
        var index = -1;
        var comparator = function (a, b) {
            return a - b;
        };
        var dir = true;
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
    TreeBase.prototype.indexOf = function (data) {
        var node = this._root;
        var index = 0;
        var c, dir;
        while (node !== null) {
            c = this._comparator(data, node.data);
            dir = c > 0;
            if (c === 0) {
                index += node.leftCount;
                return index;
            } else if (c > 0) {
                index += node.leftCount + 1;
            }
            node = node.getChild(dir);
        }
        return -1;
    };
    TreeBase.prototype.lowerBound = function (item) {
        var cur = this._root;
        var iter = this.iterator();
        var cmp = this._comparator;
        while (cur !== null) {
            var c = cmp(item, cur.data);
            if (c === 0) {
                iter._cursor = cur;
                return iter;
            }
            iter._ancestors.push(cur);
            cur = cur.getChild(c > 0);
        }
        for (var i = iter._ancestors.length - 1; i >= 0; --i) {
            cur = iter._ancestors[i];
            if (cmp(item, cur.data) < 0) {
                iter._cursor = cur;
                iter._ancestors.length = i;
                return iter;
            }
        }
        iter._ancestors.length = 0;
        return iter;
    };
    TreeBase.prototype.upperBound = function (item) {
        var iter = this.lowerBound(item);
        var cmp = this._comparator;
        while (cmp(iter.data(), item) === 0) {
            iter.next();
        }
        return iter;
    };
    TreeBase.prototype.min = function () {
        var res = this._root;
        if (res === null) {
            return null;
        }
        while (res.left !== null) {
            res = res.left;
        }
        return res.data;
    };
    TreeBase.prototype.max = function () {
        var res = this._root;
        if (res === null) {
            return null;
        }
        while (res.right !== null) {
            res = res.right;
        }
        return res.data;
    };
    TreeBase.prototype.print = function (valueFn, start, count) {
        var coords = {};
        var lengths = {};
        var graph = '';
        var it = this.iterator();
        var index = 0;
        var maxDepth = 0;
        var maxIndex = 0;
        var depth, key, node, value;
        start = start || 0;
        valueFn = valueFn || function (node) {
            return node.data;
        };
        while (it.next() !== null) {
            if (index >= start && (count >= 0 ? index <= start + count - 1 : true)) {
                depth = it._ancestors.length;
                node = it.node();
                value = String(valueFn.call(this, node));
                coords[index + ',' + depth] = value;
                lengths[index] = value.length;
                maxIndex = Math.max(maxIndex, index);
                maxDepth = Math.max(maxDepth, depth);
            }
            index++;
        }
        for (var y = 0; y <= maxDepth; y++) {
            for (var x = 0; x <= maxIndex; x++) {
                key = x + ',' + y;
                value = coords[key];
                if (value !== undefined) {
                    graph += value;
                } else {
                    for (var i = 0; i < lengths[x]; i++) {
                        graph += '-';
                    }
                }
            }
            graph += '\n';
        }
        console.log(graph);
    };
    TreeBase.prototype.iterator = function () {
        return new Iterator(this);
    };
    TreeBase.prototype.each = function (cb) {
        var i = 0;
        var it = this.iterator(), data;
        while ((data = it.next()) !== null) {
            if (cb(data, i) === false) {
                break;
            }
            i++;
        }
    };
    TreeBase.prototype.reach = function (cb) {
        var i = this.size - 1;
        var it = this.iterator(), data;
        while ((data = it.prev()) !== null) {
            cb(data, i);
            i--;
        }
    };
    function Iterator(tree) {
        this._tree = tree;
        this._ancestors = [];
        this._cursor = null;
    }
    Iterator.prototype.data = function () {
        return this._cursor !== null ? this._cursor.data : null;
    };
    Iterator.prototype.node = function () {
        return this._cursor !== null ? this._cursor : null;
    };
    Iterator.prototype.rest = function (func) {
        var data;
        do {
            data = this.data();
            if (data !== null) {
                func(data);
            }
        } while (this.next() !== null);
    };
    Iterator.prototype.next = function () {
        if (this._cursor === null) {
            var root = this._tree._root;
            if (root !== null) {
                this._minNode(root);
            }
        } else {
            if (this._cursor.right === null) {
                var save;
                do {
                    save = this._cursor;
                    if (this._ancestors.length) {
                        this._cursor = this._ancestors.pop();
                    } else {
                        this._cursor = null;
                        break;
                    }
                } while (this._cursor.right === save);
            } else {
                this._ancestors.push(this._cursor);
                this._minNode(this._cursor.right);
            }
        }
        return this._cursor !== null ? this._cursor.data : null;
    };
    Iterator.prototype.prev = function () {
        if (this._cursor === null) {
            var root = this._tree._root;
            if (root !== null) {
                this._maxNode(root);
            }
        } else {
            if (this._cursor.left === null) {
                var save;
                do {
                    save = this._cursor;
                    if (this._ancestors.length) {
                        this._cursor = this._ancestors.pop();
                    } else {
                        this._cursor = null;
                        break;
                    }
                } while (this._cursor.left === save);
            } else {
                this._ancestors.push(this._cursor);
                this._maxNode(this._cursor.left);
            }
        }
        return this._cursor !== null ? this._cursor.data : null;
    };
    Iterator.prototype._minNode = function (start) {
        while (start.left !== null) {
            this._ancestors.push(start);
            start = start.left;
        }
        this._cursor = start;
    };
    Iterator.prototype._maxNode = function (start) {
        while (start.right !== null) {
            this._ancestors.push(start);
            start = start.right;
        }
        this._cursor = start;
    };
    module.exports = TreeBase;
});
/*can-binarytree@0.0.4#rbtreelist/rbtreelist_core*/
define('can-binarytree/rbtreelist/rbtreelist_core', function (require, exports, module) {
    var TreeBase = require('can-binarytree/treebase/treebase');
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
    Node.prototype.setChild = function (dir, node) {
        var link = dir ? 'right' : 'left';
        if (this[link] && this[link].parent === this) {
            this[link].parent = null;
        }
        this[link] = node;
        if (node !== null) {
            node.parent = this;
        }
        this.updateChildCount();
    };
    Node.prototype.updateChildCount = function () {
        this.rightCount = !this.right ? 0 : this.right.leftCount + this.right.leftGapCount + this.right.rightCount + 1;
        this.leftCount = !this.left ? 0 : this.left.leftCount + this.left.leftGapCount + this.left.rightCount + 1;
        if (this.parent) {
            this.parent.updateChildCount();
        }
    };
    Node.prototype.setSibling = function (dir, node, splice) {
        var link = dir ? 'next' : 'prev';
        var backLink = dir ? 'prev' : 'next';
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
        a = a instanceof this.Node ? this.indexOfNode(a) : a;
        b = b instanceof this.Node ? this.indexOfNode(b) : b;
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
        var index, c;
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
        var i, node, value;
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
        this.each(function (node, i) {
            if (node.data === value) {
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
        var head, i;
        if (typeof length === 'undefined' || length <= 0 || typeof values.slice === 'undefined') {
            return;
        }
        var recursivelySet = function (parentNode, dir, lowerIndex, upperIndex) {
            var numberOfValues = upperIndex - lowerIndex + 1;
            var centerIndex = lowerIndex + Math.floor(numberOfValues / 2);
            var leftBlackHeight = rightBlackHeight = 0;
            var childNode, nextLeftUpper, nextRightLower, leftSibling, rightSibling, totalBlackHeight;
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
        this._root = head.getChild(1);
        return this;
    };
    RBTreeList.prototype._gapAndSize = function (setIndex, insertedNode, splice) {
        var lastNodeIndex = this.indexOfNode(this.last(), false);
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
        var index;
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
                    } else {
                        cmp = -1;
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
    RBTreeList.prototype.each = function (cb, context) {
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
    RBTreeList.prototype.printIndexes = function (debug, startIndex, count) {
        this.print(function (node) {
            var index = this.indexOfNode(node);
            var value = this._printIndexesValue(node);
            var out = index;
            if (debug !== false) {
                out += '(' + node.leftCount + '|' + node.leftGapCount + '|' + node.rightCount + ')';
            }
            out += ':' + value;
            return out;
        }, startIndex, count);
    };
    RBTreeList.prototype.printColors = function (startIndex, count) {
        this.print(function (node) {
            var index = this.indexOfNode(node);
            var out = index;
            out += '(' + (node.red ? 'R' : 'B') + ')';
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
    };
    RBTreeList.prototype._printIndexesValue = function (node) {
        var value = node.data === undefined ? '_' : node.data;
        value = typeof value === 'object' ? '{id:' + node.id + '}' : value;
        return value;
    };
    module.exports = RBTreeList;
});
/*can-binarytree@0.0.4#rbtreelist/rbtreelist*/
define('can-binarytree/rbtreelist/rbtreelist', function (require, exports, module) {
    var List = require('can/list/list');
    var RBTreeCore = require('can-binarytree/rbtreelist/rbtreelist_core');
    var RBTreeList;
    var rbTreeCoreProto = can.simpleExtend({}, RBTreeCore.prototype);
    RBTreeList = can.List.extend(can.simpleExtend(rbTreeCoreProto, {
        setup: function (instances, options) {
            var setupResult = List.prototype.setup.call(this, undefined, options);
            return setupResult;
        },
        init: function () {
            return RBTreeCore.apply(this, arguments);
        },
        _parent: RBTreeCore.prototype,
        set: function (index) {
            var lastLength = this.length;
            var insertIndex;
            var node = RBTreeCore.prototype.set.apply(this, arguments);
            if (this.length > lastLength) {
                insertIndex = this.indexOfNode(node);
                this._triggerChange(insertIndex, 'add', [node], undefined);
            }
            return node;
        },
        unset: function (index, remove) {
            var lastLength = this.length;
            var removeIndex;
            var node = this.get(index);
            if (node) {
                removeIndex = this.indexOfNode(node);
                if (remove) {
                    can.trigger(this, 'pre-remove', [
                        [node],
                        index
                    ]);
                }
                RBTreeCore.prototype.unset.apply(this, arguments);
            }
            if (this.length < lastLength) {
                this._triggerChange(removeIndex, 'remove', undefined, [node]);
            }
            return node;
        },
        __set: can.Map.prototype.__set,
        ___set: function () {
            return this.set.apply(this, arguments);
        },
        ___get: function (attr) {
            if (attr) {
                if (attr === 'length') {
                    return this.length;
                }
                return this.get.apply(this, arguments);
            }
            return this._getAttrs();
        }
    }));
    var _each = can.each;
    can.each = function (elements, callback, context) {
        if (elements instanceof RBTreeList) {
            return elements.each(callback, context);
        }
        return _each.apply(this, arguments);
    };
    module.exports = RBTreeList;
});
/*can-binarytree@0.0.4#can-binarytree*/
define('can-binarytree', function (require, exports, module) {
    var RBTreeList = require('can-binarytree/rbtreelist/rbtreelist');
    if (typeof window !== 'undefined' && !require.resolve && window.can) {
        window.can.RBTreeList = RBTreeList;
    }
    module.exports = { RBTreeList: RBTreeList };
});
/*[global-shim-end]*/
(function (){
	window._define = window.define;
	window.define = window.define.orig;
})();