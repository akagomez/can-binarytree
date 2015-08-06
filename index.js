var can = require('can/util/util');
var Map = require('can/map/map');
var Construct = require('can/construct/construct');
var TreeLib = require('./lib/rbtreelist');

// Copy
var treeLibProto = can.simpleExtend({}, TreeLib.prototype);

// Save to "can" namespace
can.RedBlackTree = can.Construct.extend(can.simpleExtend(treeLibProto, {

    init: function () {

        // Call the original constructor
        TreeLib.apply(this, arguments);
    },

    // Save a reference to the TreeLib prototype methods
    _parent: TreeLib.prototype,

    // Trigger a "add" event when length increases
    set: function (index) {
        var lastLength = this.length;
        var node = TreeLib.prototype.set.apply(this, arguments);

        if (this.length > lastLength) {
            this.dispatch('add', [[node.data], index]);
        }

        return node;
    },

    // Trigger a "remove" event when length decreases
    unset: function (index) {

        var lastLength = this.length;

        // Unset or remove
        var node = TreeLib.prototype.unset.apply(this, arguments);

        if (this.length < lastLength) {
            this.dispatch('remove', [[node.data], index]);
        }

        return node;
    },

    attr: function (index, value) {

        var items, node;

        // Return a list all the nodes' data
        if (arguments.length === 0) {
            items = [];

            this.each(function (item) {

                // Convert can.Map's/can.List's to objects/arrays
                if (item instanceof can.Map || item instanceof can.List) {
                    item = item.attr();
                }

                items.push(item);
            });

            return items;

        // Get the data of a node by index
        } else if (arguments.length === 1) {

            node = this.get(index);
            return node ? node.data : undefined;

        // Set the data of a node by index
        } else if (arguments.length === 2) {

            node = this.set(index, value);
            return node;
        }
    },

    // Pass the node data to the callback instead of the node
    each: function (callback) {
        TreeLib.prototype.each.call(this, function (node, i) {
            var result = callback(node.data, i);
            return result;
        });
    }

}));

// Add event utilities
can.extend(can.RedBlackTree.prototype, can.event);

module.exports = can.RedBlackTree;

