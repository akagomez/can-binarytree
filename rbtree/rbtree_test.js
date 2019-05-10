var QUnit = require("steal-qunit");
var RBTree = require('can-redblacktree');

QUnit.module('can-redblacktree', {
    beforeEach: function(assert) {}
});

var comparator = function (a, b) {
    a = a.charCodeAt(0);
    b = b.charCodeAt(0);
    return a === b ? 0 : a < b ? -1 : 1; // ASC
};

QUnit.test('Return index on insert', function(assert) {

    var tree = new RBTree(comparator);
    var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

    alphabet.forEach(function (letter, index) {
        var value = tree.insert(letter);
        assert.deepEqual(value, index, 'Returned index of insert');
    });

    assert.deepEqual(tree.remove('404'), -1, 'Returned "not found" value');
});

QUnit.test('Return index on remove', function(assert) {

    var tree = new RBTree(comparator);
    var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

    alphabet.forEach(function (letter) {
        tree.insert(letter);
    });

    // Remove in reverse so that both left and right traversals
    // are tested
    for (var i = alphabet.length - 1; i >= 0; i--) {
        var value = tree.remove(alphabet[i]);
        assert.deepEqual(value, i, 'Returned index of remove');
    }

    assert.deepEqual(tree.remove('404'), -1, 'Returned "not found" value');
});

QUnit.test('Get index of item', function(assert) {

    var tree = new RBTree(comparator);
    var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

    alphabet.forEach(function (letter) {
        tree.insert(letter);
    });

    alphabet.forEach(function (letter, index) {
        var value = tree.indexOf(letter);
        assert.deepEqual(value, index, 'Found index of value');
    });

    assert.deepEqual(tree.indexOf('404'), -1, 'Returned "not found" value');
});

QUnit.test('Get item by index', function(assert) {

    var tree = new RBTree(comparator);
    var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

    alphabet.forEach(function (letter) {
        tree.insert(letter);
    });

    alphabet.forEach(function (letter, index) {
        var value = tree.getByIndex(index);
        assert.deepEqual(value, letter, 'Found value by index');
    });

    assert.deepEqual(tree.getByIndex(100), null, 'Returned "not found" value');
});

QUnit.test('leftCount is maintained on insert and remove', function(assert) {

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

            assert.deepEqual(count, storedCount, 'Count from "' + node.data + '"');
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
                assert.ok(match, 'Child count is correct after removing "' + letter + '"');
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
        assert.ok(match, 'Child count is correct after adding "' + letter + '"');
    });

    centerOutRemove(alphabet.length/2);

});
