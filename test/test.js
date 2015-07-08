var QUnit = require("steal-qunit");
var RBTree = require('can-redblacktree').RBTree;

QUnit.module('can-redblacktree', {
    setup: function () {}
});

test('Sort by key', function () {
    var comparator = function (a, b) {
        a = a.sourceIndex;
        b = b.sourceIndex;
        return a === b ? 0 : a < b ? -1 : 1; // ASC
    };

    var tree = new RBTree(comparator);

    var sourceList = ['A', 'B', 'C'];

    var derivedList = [
        { value: 'B', sourceIndex: 1 },
        { value: 'A', sourceIndex: 0 },
        { value: 'C', sourceIndex: 2 }
    ];

    derivedList.forEach(function (item, index) {
        tree.insert(item);
    });

    tree.each(function (item) {
        equal(sourceList[item.sourceIndex], item.value,
            'Value is in the correct position');
    });
});

test('Calculate index on insert (without rebalance)', 3, function () {
    var comparator = function (a, b) {
        a = a.value.charCodeAt(0);
        b = b.value.charCodeAt(0);
        return a === b ? 0 : a < b ? -1 : 1; // ASC
    };

    var tree = new RBTree(comparator);

    var _singleRotate = tree.singleRotate;
    tree.singleRotate = function () {

        ok(false, 'Tree should not rebalance');

        // Prevent errors
        return _singleRotate.apply(tree, arguments);
    };

    var _doubleRotate = tree.doubleRotate;
    tree.doubleRotate = function () {

        ok(false, 'Tree should not be doubleRotated');

        // Prevent errors
        return _doubleRotate.apply(tree, arguments);
    };

    var items = [
        { value: 'B', insertIndex: 0 },
        { value: 'A', insertIndex: 0 },
        { value: 'C', insertIndex: 2 }
    ];

    items.forEach(function (item, index) {
        var insertIndex = tree.insert(item);

        equal(insertIndex, item.insertIndex, 'Insert index reported correctly');
    });
});

test('Calculate index on insert (with rebalance, singleRotate only)', 8, function () {
    var comparator = function (a, b) {
        a = a.value.charCodeAt(0);
        b = b.value.charCodeAt(0);
        return a === b ? 0 : a < b ? -1 : 1; // ASC
    };

    var tree = new RBTree(comparator);

    var _singleRotate = tree.singleRotate;
    tree.singleRotate = function () {

        ok(true, 'Tree should rebalance');

        var result = _singleRotate.apply(tree, arguments);

        // Put things back the way they were
        tree.singleRotate = _singleRotate;

        return result;
    };


    var _doubleRotate = tree.doubleRotate;
    tree.doubleRotate = function () {

        ok(false, 'Tree should not be double rotated');

        // Prevent errors
        return _doubleRotate.apply(tree, arguments);
    };

    var items = [
        { value: 'A', insertIndex: 0 },
        { value: 'B', insertIndex: 1 },
        { value: 'C', insertIndex: 2 },
        { value: 'D', insertIndex: 3 },
        { value: 'E', insertIndex: 4 },
        { value: 'F', insertIndex: 5 },
        { value: 'G', insertIndex: 6 }
    ];

    items.forEach(function (item, index) {
        var insertIndex = tree.insert(item);

        equal(insertIndex, item.insertIndex, 'Insert index reported correctly');
    });
});


test('Calculate index on insert (with rebalance, single and doubleRotate)', 5, function () {
    var comparator = function (a, b) {
        a = a.value.charCodeAt(0);
        b = b.value.charCodeAt(0);
        return a === b ? 0 : a < b ? -1 : 1; // ASC
    };

    var tree = new RBTree(comparator);

    var _singleRotate = tree.singleRotate;
    tree.singleRotate = function () {

        ok(true, 'Tree should rebalance with singleRotate');

        var result = _singleRotate.apply(tree, arguments);

        // Put things back the way they were
        tree.singleRotate = _singleRotate;

        return result;
    };


    var _doubleRotate = tree.doubleRotate;
    tree.doubleRotate = function () {

        ok(true, 'Tree should rebalance with doubleRotate');

        var result = _doubleRotate.apply(tree, arguments);

        // Put things back the way they were
        tree.doubleRotate = _doubleRotate;

        return result;
    };

    var items = [
        { value: 'A', insertIndex: 0 },
        { value: 'C', insertIndex: 1 },
        { value: 'B', insertIndex: 1 }
    ];

    items.forEach(function (item, index) {
        var insertIndex = tree.insert(item);

        equal(insertIndex, item.insertIndex, 'Insert index reported correctly');
    });
});

