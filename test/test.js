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

test('Return index on insert (without rebalance)', 3, function () {
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

test('Return index on insert (with rebalance, singleRotate only)', 9, function () {
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
        equal(insertIndex, item.insertIndex, 'Returned correct insert index');
    });

    var insertIndex = tree.insert(items[0]);
    equal(insertIndex, -1, 'Returned "not inserted" value');
});

test('Return index on insert (with rebalance, single and doubleRotate)', 6, function () {
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
        equal(insertIndex, item.insertIndex, 'Returned correct insert index');
    });

    var insertIndex = tree.insert(items[0]);
    equal(insertIndex, -1, 'Returned "not inserted" value');
});

test('Return index on remove', function () {
    var comparator = function (a, b) {
        a = a.value.charCodeAt(0);
        b = b.value.charCodeAt(0);
        return a === b ? 0 : a < b ? -1 : 1; // ASC
    };

    var tree = new RBTree(comparator);

    var items = [
        { value: 'A', removedIndex: 0 },
        { value: 'B', removedIndex: 1 },
        { value: 'C', removedIndex: 2 },
        { value: 'D', removedIndex: 3 },
        { value: 'E', removedIndex: 3 },
        { value: 'F', removedIndex: 3 },
        { value: 'G', removedIndex: 3 }
    ];

    items.forEach(function (item, index) {
        tree.insert(item);
    });

    [3, 4, 5, 6, 2, 1, 0].forEach(function (itemIndex) {
        var item = items[itemIndex];
        var removedIndex = tree.remove(item);
        equal(removedIndex, item.removedIndex, 'Returned correct removal index')
        tree.print();
    });

    equal(tree.remove(items[0]), -1, 'Returned correct "not found" value');
});