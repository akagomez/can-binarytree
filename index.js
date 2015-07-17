var can = require('can/util/util');
var Construct = require('can/construct/construct');
var TreeLib = require('./lib/rbtree');

// Save to "can" namespace
can.RedBlackTree = can.Construct.extend(TreeLib.prototype).extend({

    // Call the original constructor
    init: TreeLib,

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

});

// Add event utilities
can.extend(can.RedBlackTree.prototype, can.event);

module.exports = can.RedBlackTree;

