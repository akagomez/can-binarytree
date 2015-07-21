var QUnit = require("steal-qunit");
var RBTreeList = require('../lib/rbtreelist');

QUnit.module('can-rbtree-list', {
    setup: function () {}
});

var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
// var alphabet = "ABCDEF".split("");

window.printTree = function (tree) {
    console.log(tree.print(function (node) {
        return node.data + ':' + node.leftCount + '|' + node.rightCount;
    }));
};

test('Set item by index (forward)', function () {
    var tree = new RBTreeList();

    alphabet.forEach(function (letter, i) {
        var match = true;

        tree.set(i, letter);

        for (var j = 0; j <= i; j++) {
            var l = tree.get(j);

            if (alphabet[j] !== l) {
                match = false;
            }

            equal(alphabet[j], l, 'Correct position');
        }

        ok(match, 'Order is correct after insert of "' + letter + '"');
    });
});

test('Set item by index (backward)', function () {
    var tree = new RBTreeList();

    for (var i = alphabet.length - 1; i >= 0; i--) {
        var letter = alphabet[i];
        var match = true;

        tree.set(i, letter);
        printTree(tree);

        for (var j = i; j < alphabet.length; j++) {
            console.log(j)
            var l = tree.get(j);

            if (alphabet[j] !== l) {
                match = false;
            }

            equal(alphabet[j], l, 'Correct position');
        }

        ok(match, 'Order is correct after insert of "' + letter + '"');
    }
});

test('Remove item by index', function () {
    var tree = new RBTreeList();
    var n;

    alphabet.forEach(function (letter, i) {
        tree.set(i, letter);
        printTree(tree);
    });

    for (var i = alphabet.length - 1; i >= 0; i--) {
        n = tree.remove(i);
        equal(n.data, alphabet[i], 'Correct item removed');
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