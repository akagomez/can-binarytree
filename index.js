var List = require('can/list/list');
var Construct = require('can/construct/construct');
var TreeLib = require('./lib/rbtreelist');

// Copy
var treeLibProto = can.simpleExtend({}, TreeLib.prototype);

// Save to "can" namespace
can.TreeList = can.List.extend(can.simpleExtend(treeLibProto, {

    init: function () {

        // Call the original constructor
        return TreeLib.apply(this, arguments);
    },

    // Save a reference to the TreeLib prototype methods
    _parent: TreeLib.prototype,

    // Trigger a "add" event when length increases
    set: function (index) {
        var lastLength = this.length;
        var insertIndex;

        var node = TreeLib.prototype.set.apply(this, arguments);

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

                // If another TreeList is bound to this TreeList it needs an
                // opportunity to reference this TreeList to evaluate
                // "source indexes" before the remove so that it can apply the
                // same change on its end if necessary
                // WARNING: This event cannot be batched, which is why we
                // don't call `can.batch.trigger` or `this._triggerChange`.
                // If it was the remove would happen before the bound TreeList
                // recieved this event,
                can.trigger(this, 'pre-remove', [[node], index]);
            }

            TreeLib.prototype.unset.apply(this, arguments);
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

        // Don't use the "get" API to read the length (it won't work);
        // Instead read the statically maintained value from the TreeList
        // NOTE: At this point "length" will already be bound to by __get
        if (attr === 'length') {
            return this.length;
        }

        return this.get.apply(this, arguments)
    },

    // The default _triggerChange doesn't dispatch the "pre-remove" event
    // we added for the TreeList, so we handle it here. Unfortunately it's
    // almost entirely a copy/paste job
    _triggerChange: function (attr, how, newVal, oldVal) {

        // Let the default can.List _triggerChange handle add/remove/length
        can.List.prototype._triggerChange.apply(this, arguments);

        // `batchTrigger` direct add and remove events...
        var index = +attr;

        // Make sure this is not nested and not an expando
        if (!~(""+attr).indexOf('.') && !isNaN(index)) {

            // This whole method exists for this IF statement
            if (how === 'pre-remove') {
                can.batch.trigger(this, how, [oldVal, index]);
            }
        }
    }

}));

module.exports = can.TreeList;

