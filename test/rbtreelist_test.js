var QUnit = require("steal-qunit");
var RBTreeList = require('../lib/rbtreelist');

QUnit.module('can-rbtree-list', {
    setup: function () {}
});

var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
// var alphabet = "ABCDEF".split("");

window.printTree = function (tree) {
    console.log(tree.print(function (node) {
        return (node.data === undefined ? '_' : node.data) + ':^' +
            node.parent.data + '|' + node.leftCount + '|' + node.rightCount;
    }));
};

test('Set value by index (natural order)', function () {
    var tree = new RBTreeList();

    alphabet.forEach(function (letter, i) {
        var match = true;

        tree.set(i, letter);

        for (var j = 0; j <= i; j++) {
            var l = tree.get(j).data;

            if (alphabet[j] !== l) {
                match = false;
            }

            deepEqual(alphabet[j], l, 'Correct position');
        }

        ok(match, 'Order is correct after set of "' + letter + '"');
    });
    printTree(tree);
});

test('Set value by index (reverse order)', function () {
    var tree = new RBTreeList();

    for (var i = alphabet.length - 1; i >= 0; i--) {
        var letter = alphabet[i];
        var match = true;

        tree.set(i, letter);

        for (var j = i; j < alphabet.length; j++) {

            var l = tree.get(j).data;

            if (alphabet[j] !== l) {
                match = false;
            }

            deepEqual(alphabet[j], l, 'Correct position');
        }

        ok(match, 'Order is correct after set of "' + letter + '"');
    }
});

test('Set value by index (with gaps between indexes)', function () {
    var tree = new RBTreeList();

    tree.set(26, 'Z');
    tree.set(0, 'A');
    tree.set(7, 'G');

    deepEqual(tree.get(26).data, 'Z');
    deepEqual(tree.get(0).data, 'A');
    deepEqual(tree.get(7).data, 'G');
});

test('Set single value via .splice()', function () {
    var tree = new RBTreeList();

    alphabet.forEach(function (letter, i) {
        var match = true;

        tree.splice(i, 0, letter);

        for (var j = 0; j <= i; j++) {
            var l = tree.get(j).data;

            if (alphabet[j] !== l) {
                match = false;
            }

            deepEqual(alphabet[j], l, 'Correct position');
        }

        ok(match, 'Order is correct after splice of "' + letter + '"');
    });
});

test('Set multiple values via .splice()', function () {
    var tree = new RBTreeList();

    // Fill the tree with values
    tree.splice.apply(tree, [0, 0].concat(alphabet));

    alphabet.forEach(function (letter, i) {
        deepEqual(tree.get(i).data, letter, 'Values match');
    });
});

test('Insert a value between two existing values via .splice()', function () {

    var tree = new RBTreeList();
    var splicedValue = '<- find me ->';

    // Fill the tree with values
    tree.splice.apply(tree, [0, 0].concat(alphabet));

    var middleIndex = Math.round(alphabet.length / 2);

    tree.splice(middleIndex, 0, splicedValue);

    deepEqual(tree.get(middleIndex - 1).data, alphabet[middleIndex - 1]);
    deepEqual(tree.get(middleIndex).data, splicedValue);
    deepEqual(tree.get(middleIndex + 1).data, alphabet[middleIndex]);
});

test('Remove a single value via .splice()', function () {
    var tree = new RBTreeList();
    var length = alphabet.length;

    // Fill the tree with values
    tree.splice.apply(tree, [0, 0].concat(alphabet));

    // Remove the last value, then get the node from the returned
    // "removed items" list
    var removedNode = tree.splice(length - 1, 1).shift();

    deepEqual(removedNode.data, alphabet[length - 1], 'Removed node matches');

    var nodeAtRemovedIndex = tree.get(length - 1);

    deepEqual(nodeAtRemovedIndex, null, 'Node removed from tree');

    // Remove the first value, then get the node from the returned
    // "removed items" list
    removedNode = tree.splice(0, 1).shift();

    deepEqual(removedNode.data, alphabet[0], 'Removed node matches');

    // Should return the NEXT item in the list, after the removed item
    var dataAtRemovedIndex = tree.get(0).data;

    deepEqual(dataAtRemovedIndex, alphabet[1], 'Node removed from tree');
});

test('Remove multiple values via .splice()', function () {
    var tree = new RBTreeList();
    var length = alphabet.length;

    // Fill the tree with values
    tree.splice.apply(tree, [0, 0].concat(alphabet));

    var removedNodes = tree.splice(1, length - 2);

    removedNodes.forEach(function (node, i) {
        i = i+1;

        deepEqual(node.data, alphabet[i], 'Removed values match');
    });

    deepEqual(tree.get(0).data, alphabet[0], 'Remaining values match');
    deepEqual(tree.get(1).data, alphabet[length - 1], 'Remaining values match');
});

test('Replacing a value with .splice() creates a new Node', function () {
    var tree = new RBTreeList();

    // Fill the tree with values
    tree.splice.apply(tree, [0, 0].concat(alphabet));

    var removedNode = tree.splice(0, 1, alphabet[0]).shift();

    notDeepEqual(removedNode, tree.get(0).data, 'Nodes are not the same');
    deepEqual(removedNode.data, tree.get(0).data, 'Node values are the same');
});

test('Negative removeCount works with .splice()', function () {
    var tree = new RBTreeList();

    // Fill the tree with values
    tree.splice.apply(tree, [0, 0].concat(alphabet));

    var removedNodes = tree.splice(-3, 3);

    removedNodes.forEach(function (node, i) {
        i = alphabet.length - 3 + i;

        deepEqual(node.data, alphabet[i], 'Removed values match');
    });

    for (var i = 0; i < alphabet.length - 3; i++) {
        deepEqual(tree.get(i).data, alphabet[i], 'Remaining values match');
    }
});

test('Insert and remove simultaneously with .splice()', function () {
    var tree = new RBTreeList();
    var replaceIndex = 3;
    var doubledValue = alphabet[replaceIndex] + alphabet[replaceIndex];

    // Fill the tree with values
    tree.splice.apply(tree, [0, 0].concat(alphabet));

    var removedNode = tree.splice(replaceIndex, 1, doubledValue).shift();

    deepEqual(removedNode.data, alphabet[replaceIndex],
        'Removed value matches');

    var node = tree.get(replaceIndex);

    deepEqual(node.data, doubledValue, 'Inserted value matches');
});

test('Get index of each node', function () {
    var tree = new RBTreeList();

    // Fill the tree with values
    tree.splice.apply(tree, [0, 0].concat(alphabet));

    tree.each(function (node, i) {
        deepEqual(tree.indexOf(node), i, 'Index is correct');
    });
});

test('"Holey" indexes are not enumerable', function () {
    var tree = new RBTreeList();
    var expected;

    tree.set(2, 'C');

    expected = ['C'];
    tree.each(function (node, i) {
        deepEqual(node.data, expected.shift());
    });

    tree.set(0, undefined);

    expected = [undefined, 'C'];
    tree.each(function (node, i) {
        deepEqual(node.data, expected.shift());
    });
});

test('Remove value by index', function () {
    var tree = new RBTreeList();
    var n;

    alphabet.forEach(function (letter, i) {
        tree.set(i, letter);
    });

    for (var i = alphabet.length - 1; i >= 0; i--) {
        n = tree.remove(i);
        deepEqual(n.data, alphabet[i], 'Correct item removed');
    }
});

test('leftCount is maintained on add and remove', function () {

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
                tree.remove(index, letter);
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

    var tree = new RBTreeList();
    // var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    var alphabet = "ABCDEF".split("");
    var match;

    alphabet.forEach(function (letter, i) {
        tree.set(i, letter);
        match = recursiveChildCountTest(tree._root);
        ok(match, 'Child count is correct after adding "' + letter + '"');
    });

    centerOutRemove(alphabet.length/2);

});