var List = require('can/list/list');
var RBTreeCore = require('./rbtreelist_core');
var RBTreeList;

// Copy proto methods
var rbTreeCoreProto = can.simpleExtend({}, RBTreeCore.prototype);

RBTreeList = can.List.extend(can.simpleExtend(rbTreeCoreProto, {

    setup: function (instances, options) {

        // Call the default can.List setup method without the instances
        var setupResult = List.prototype.setup.call(this, undefined, options);

        return setupResult;
    },

    init: function () {

        // Call the original constructor
        return RBTreeCore.apply(this, arguments);
    },

    // Save a reference to the RBTreeCore prototype methods
    _parent: RBTreeCore.prototype,

    // Trigger a "add" event when length increases
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

    // Trigger a "remove" event when length decreases
    unset: function (index, remove) {

        var lastLength = this.length;
        var removeIndex;

        // Unset or remove
        var node = this.get(index);


        if (node) {
            // Get the actual index not taking into consideration the
            // consideration the comparator
            removeIndex = this.indexOfNode(node);

            // Notify interested parties that we are going
            // to remove a node from the tree
            if (remove) {

                // If another RBTreeList is bound to this RBTreeList it needs an
                // opportunity to reference this RBTreeList to evaluate
                // "source indexes" before the remove so that it can apply the
                // same change on its end if necessary
                // WARNING: This event cannot be batched, which is why we
                // don't call `can.batch.trigger` or `this._triggerChange`.
                // If it was the remove would happen before the bound RBTreeList
                // recieved this event,
                can.trigger(this, 'pre-remove', [[node], index]);
            }

            RBTreeCore.prototype.unset.apply(this, arguments);
        }

        // Only fire a remove event if the length has changed
        if (this.length < lastLength) {
            this._triggerChange(removeIndex, 'remove', undefined, [node]);
        }

        return node;
    },

    // Prevent calling can.List.prototype.__set becuase it attempts to handle
    // holey array values, which the RBTreeList already handles
    __set: can.Map.prototype.__set,

    // Use our public "set" method internally to commit values
    ___set: function () {
        return this.set.apply(this, arguments);
    },

    // Use our public "get" method internally to get values
    ___get: function (attr) {

        if (attr) {
            // Don't use the "get" API to read the length (it won't work);
            // Instead read the statically maintained value from the RBTreeList
            // NOTE: At this point "length" will already be bound to by __get
            if (attr === 'length') {
                return this.length;
            }

            return this.get.apply(this, arguments);
        }

        return this._getAttrs();
    }

}));

// Make RBTreeList instances iterable with `can.each`
var _each = can.each;
can.each = function (elements, callback, context) {
    if (elements instanceof RBTreeList) {

        // Iterate using the tree's `each` method
        return elements.each(callback, context);
    }

    return _each.apply(this, arguments);
};

module.exports = RBTreeList;