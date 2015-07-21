var can = require('can/util/util');
var Map = require('can/map/map');
var Construct = require('can/construct/construct');
var TreeLib = require('./lib/rbtree');

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

    // Trigger a "add" event on successful insert
    insert: function (data) {
        var insertIndex = TreeLib.prototype.insert.apply(this, arguments);

        if (insertIndex >= 0) {
            this.dispatch('add', [[data], insertIndex]);
        }

        return insertIndex;
    },

    // Trigger a "remove" event on successful insert
    remove: function (data) {

        // Get the node data before its removed from the tree
        var nodeData = this.find(data);

        // Remove, and get the index
        var removeIndex = TreeLib.prototype.remove.apply(this, arguments);

        if (removeIndex >= 0) {
            this.dispatch('remove', [[nodeData], removeIndex]);
        }

        return removeIndex;
    },

    attr: function (index) {

        // Return a list all the nodes' data
        if (arguments.length === 0) {
            var items = [];

            this.each(function (item) {
                if (item instanceof can.Map) {
                    item = item.attr();
                }

                items.push(item);
            });

            return items;

        // Get the data of a node by index
        } else if (arguments.length === 1) {
            var data = this.getByIndex(index);

            // Node.data
            return data !== null  ? data : undefined;

        // Set the data of a node by index
        } else if (arguments.length === 2) {

            // TODO

        }
    },

    // Add an index to the `each` callback
    each: function (callback) {

        // Track the index manually rather than having the tree calculate it
        var i = 0;

        TreeLib.prototype.each.call(this, function (data) {
            var result = callback(data, i);
            i++;
            return result;
        });
    }

}));

// Add event utilities
can.extend(can.RedBlackTree.prototype, can.event);

module.exports = can.RedBlackTree;

