var can = require('can/util/util');
var RBTree = require('./lib/rbtree');

// Add event utilities
can.extend(RBTree.prototype, can.event);

// Trigger a "add" event on successful insert
var _insert = RBTree.prototype.insert;
RBTree.prototype.insert = function (data) {
    var insertIndex = _insert.apply(this, arguments);

    if (insertIndex >= 0) {
        this.dispatch('add', [[data], insertIndex]);
    }

    return insertIndex;
};

// Trigger a "remove" event on successful insert
var _remove = RBTree.prototype.remove;
RBTree.prototype.remove = function (data) {

    // Get the node data before its removed from the tree
    var nodeData = this.find(data);

    // Remove, and get the index
    var removeIndex = _remove.apply(this, arguments);

    if (removeIndex >= 0) {
        this.dispatch('remove', [[nodeData], removeIndex]);
    }

    return removeIndex;

};

module.exports = RBTree;

