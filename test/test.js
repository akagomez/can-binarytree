var QUnit = require("steal-qunit");
var RBTree = require('can-redblacktree');

QUnit.module('can-redblacktree', {
    setup: function () {}
});

var comparator = function (a, b) {
    a = a.charCodeAt(0);
    b = b.charCodeAt(0);
    return a === b ? 0 : a < b ? -1 : 1; // ASC
};

test('Return index on insert (without rebalance)', 3, function () {

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

    deepEqual(tree.insert('B'), 0, 'Insert index reported correctly');
    deepEqual(tree.insert('A'), 0, 'Insert index reported correctly');
    deepEqual(tree.insert('C'), 2, 'Insert index reported correctly');
});

test('Return index on insert (with rebalance, singleRotate only)', 5, function () {

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

    deepEqual(tree.insert('A'), 0, 'Returned correct insert index');
    deepEqual(tree.insert('B'), 1, 'Returned correct insert index');
    deepEqual(tree.insert('C'), 2, 'Returned correct insert index');
    deepEqual(tree.insert('A'), -1, 'Returned "not inserted" value');
});

test('Return index on insert (with rebalance, single and doubleRotate)', 6, function () {

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

    deepEqual(tree.insert('A'), 0, 'Returned correct insert index');
    deepEqual(tree.insert('C'), 1, 'Returned correct insert index');
    deepEqual(tree.insert('B'), 1, 'Returned correct insert index');
    deepEqual(tree.insert('A'), -1, 'Returned "not inserted" value');
});

test('Return index on remove', function () {

    var tree = new RBTree(comparator);

    tree.insert('A');
    tree.insert('B');
    tree.insert('C');
    tree.insert('D');
    tree.insert('E');
    tree.insert('F');



    deepEqual(tree.remove('F'), 5, 'Returned correct remove index');
    deepEqual(tree.remove('A'), 0, 'Returned correct remove index');
    deepEqual(tree.remove('D'), 2, 'Returned correct remove index');
    deepEqual(tree.remove('E'), 2, 'Returned correct remove index');
    deepEqual(tree.remove('B'), 0, 'Returned correct remove index');
    deepEqual(tree.remove('C'), 0, 'Returned correct remove index');
    deepEqual(tree.remove('404'), -1, 'Returned "not found" value');
});

test('Get index of item', function () {

    var tree = new RBTree(comparator);

    tree.insert('A');
    tree.insert('B');
    tree.insert('C');

    deepEqual(tree.getIndex('A'), 0, 'Returned correct index');
    deepEqual(tree.getIndex('B'), 1, 'Returned correct index');
    deepEqual(tree.getIndex('C'), 2, 'Returned correct index');
    deepEqual(tree.getIndex('404'), -1, 'Returned "not found" value');

    tree.insert('D');
    deepEqual(tree.getIndex('D'), 3, 'Returned correct index');

    tree.insert('G');
    deepEqual(tree.getIndex('G'), 4, 'Returned correct index');

    tree.insert('F');
    deepEqual(tree.getIndex('F'), 4, 'Returned correct index');

    tree.insert('G');
    deepEqual(tree.getIndex('G'), 5, 'Returned correct index');
});

test('Get item by index', function () {

    var tree = new RBTree(comparator);
    var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

    alphabet.forEach(function (letter) {
        tree.insert(letter);
    });

    console.log(tree.print(function (node) {
        return node.data + ':' + node.leftCount + '|' + node.rightCount;
    }));

    alphabet.forEach(function (letter, index) {
        var value = tree.getByIndex(index);
        deepEqual(value, letter, 'Found value by index');
    });
});

test('leftCount is maintained on insert and remove', function () {

    var recursiveChildCountTest = function (node, isChild) {
        var match = true;
        var count = 0;
        var storedCount;

        if (node) {

            storedCount = node.leftCount + node.rightCount;

            if (node.left !== null) {
                count++;
                count += recursiveChildCountTest(node.left, true);
            }

            if (node.right !== null) {
                count++;
                count += recursiveChildCountTest(node.right, true);
            }

            if (storedCount !== count) {
                match = false;
            }

            deepEqual(count, storedCount, 'Count from "' + node.data + '"');
        }

        return (isChild ? count : match);
    };

    var centerOutRemove = function (start) {
        var i = 0;
        var offset = 0;
        var letter, index, match;

        while (i < alphabet.length) {

            index = start + offset;
            letter = alphabet.slice(index, index + 1);

            if (letter.length) {
                letter = letter.shift();
                tree.remove(letter);
                match = recursiveChildCountTest(tree._root);
                ok(match, 'Child count is correct after removing "' + letter + '"');
                i++;
            }

            offset = -(offset);

            if (offset >= 0) {
                offset++;
            }
        }
    };

    var tree = new RBTree(comparator);
    var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    // var alphabet = "ABCDEF".split("");
    var match;

    alphabet.forEach(function (letter) {
        tree.insert(letter);
        match = recursiveChildCountTest(tree._root);
        ok(match, 'Child count is correct after adding "' + letter + '"');
    });

    centerOutRemove(alphabet.length/2);

});