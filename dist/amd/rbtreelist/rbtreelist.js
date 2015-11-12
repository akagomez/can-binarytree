/*can-binarytree@0.0.5#rbtreelist/rbtreelist*/
define(function (require, exports, module) {
    var List = require('can/list');
    var RBTreeCore = require('./rbtreelist_core');
    require('can/util');
    var RBTreeList;
    var rbTreeCoreProto = can.simpleExtend({}, RBTreeCore.prototype);
    RBTreeList = can.List.extend(can.simpleExtend(rbTreeCoreProto, {
        setup: function (instances, options) {
            var setupResult = List.prototype.setup.call(this, undefined, options);
            if (this.___get) {
                this.___get = this.____get;
            } else {
                this.__get = this.____get;
            }
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
        each: function () {
            this.attr('length');
            return RBTreeCore.prototype.each.apply(this, arguments);
        },
        __set: can.Map.prototype.__set,
        ___set: function () {
            return this.set.apply(this, arguments);
        },
        ____get: function (attr) {
            var node;
            if (attr) {
                if (attr === 'length') {
                    return this.length;
                }
                node = this.get.apply(this, arguments);
                return node && node.data;
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