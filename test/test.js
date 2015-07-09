var QUnit = require("steal-qunit");
var RBTree = require('can-redblacktree').RBTree;

QUnit.module('can-redblacktree', {
    setup: function () {}
});

test('Return index on insert (without rebalance)', 3, function () {
    var comparator = function (a, b) {
        a = a.charCodeAt(0);
        b = b.charCodeAt(0);
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

    var items = ['B','A','C'];

    equal(tree.insert(items[0]), 0, 'Insert index reported correctly');
    equal(tree.insert(items[1]), 0, 'Insert index reported correctly');
    equal(tree.insert(items[2]), 2, 'Insert index reported correctly');
});

test('Return index on insert (with rebalance, singleRotate only)', 5, function () {
    var comparator = function (a, b) {
        a = a.charCodeAt(0);
        b = b.charCodeAt(0);
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

    var items = ['A','B','C'];

    equal(tree.insert(items[0]), 0, 'Returned correct insert index');
    equal(tree.insert(items[1]), 1, 'Returned correct insert index');
    equal(tree.insert(items[2]), 2, 'Returned correct insert index');
    equal(tree.insert(items[0]), -1, 'Returned "not inserted" value');
});

test('Return index on insert (with rebalance, single and doubleRotate)', 6, function () {
    var comparator = function (a, b) {
        a = a.charCodeAt(0);
        b = b.charCodeAt(0);
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

    var items = ['A','C','B'];

    equal(tree.insert(items[0]), 0, 'Returned correct insert index');
    equal(tree.insert(items[1]), 1, 'Returned correct insert index');
    equal(tree.insert(items[2]), 1, 'Returned correct insert index');
    equal(tree.insert(items[0]), -1, 'Returned "not inserted" value');
});

test('Return index on remove', function () {
    var comparator = function (a, b) {
        a = a.charCodeAt(0);
        b = b.charCodeAt(0);
        return a === b ? 0 : a < b ? -1 : 1; // ASC
    };

    var tree = new RBTree(comparator);

    var items = ['A','B','C'];

    tree.insert(items[0]);
    tree.insert(items[1]);
    tree.insert(items[2]);

    equal(tree.remove(items[1]), 1, 'Returned correct remove index');
    equal(tree.remove(items[0]), 0, 'Returned correct remove index');
    equal(tree.remove(items[2]), 0, 'Returned correct remove index');
    equal(tree.remove(items[0]), -1, 'Returned "not found" value');
});

test('Get index', function () {
    var comparator = function (a, b) {
        a = a.charCodeAt(0);
        b = b.charCodeAt(0);
        return a === b ? 0 : a < b ? -1 : 1; // ASC
    };

    var tree = new RBTree(comparator);

    tree.insert('A');
    tree.insert('B');
    tree.insert('C');

    equal(tree.index('A'), 0, 'Returned correct index');
    equal(tree.index('B'), 1, 'Returned correct index');
    equal(tree.index('C'), 2, 'Returned correct index');
    equal(tree.index('404'), -1, 'Returned "not found" value');

    tree.insert('D')
    equal(tree.index('D'), 3, 'Returned correct index');

    tree.insert('G')
    equal(tree.index('G'), 4, 'Returned correct index');

    tree.insert('F')
    equal(tree.index('F'), 4, 'Returned correct index');

    tree.insert('G')
    equal(tree.index('G'), 5, 'Returned correct index');
});