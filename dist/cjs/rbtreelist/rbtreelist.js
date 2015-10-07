/*can-binarytree@0.0.3#rbtreelist/rbtreelist*/
var List = require('can/list/list');
var RBTreeCore = require('./rbtreelist_core.js');
var RBTreeList;
var rbTreeCoreProto = can.simpleExtend({}, RBTreeCore.prototype);
RBTreeList = can.List.extend(can.simpleExtend(rbTreeCoreProto, {
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
        if (attr === 'length') {
            return this.length;
        }
        return this.get.apply(this, arguments);
    },
    _triggerChange: function (attr, how, newVal, oldVal) {
        can.List.prototype._triggerChange.apply(this, arguments);
        var index = +attr;
        if (!~('' + attr).indexOf('.') && !isNaN(index)) {
            if (how === 'pre-remove') {
                can.batch.trigger(this, how, [
                    oldVal,
                    index
                ]);
            }
        }
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