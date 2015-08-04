var QUnit = require("steal-qunit");
var RBTreeList = window.RBTreeList = require('../lib/rbtreelist');

QUnit.module('can-rbtree-list', {
    setup: function () {}
});

var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
// var alphabet = "ABCDEF".split("");

window.printTree = function (tree, debug, start, count) {
    console.log(tree.print(function (node) {
        var index = tree.indexOfNode(node);
        var value = (node.data === undefined ? '_' : node.data);
        var out =  index;
        if (debug !== false) {
            out += '(' +node.leftCount + '|' + node.leftGapCount + '|' + node.rightCount + ')';
        }
        out += ':' + value;
        return out;
    }, start, count));
};

window.printLinks = function (tree) {
    var out = '';
    tree.each(function (node, index) {
        var left = (node.prev && node.prev.data);
        var right = (node.next && node.next.data);
        left = left ? left : '_';
        right = right ? right : '_';
        out +=  left + ' < ' + node.data + ' > ' + right + '\n';
    });
    console.log(out);
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

            equal(alphabet[j], l, 'Correct position');
        }

        ok(match, 'Order is correct after set of "' + letter + '"');
    });
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

            equal(alphabet[j], l, 'Correct position');
        }

        ok(match, 'Order is correct after set of "' + letter + '"');
    }
});

test('Set value by index (with gaps between indexes)', function () {
    var tree = new RBTreeList();

    tree.set(20, alphabet[20]);
    equal(tree.get(20).data, alphabet[20]);

    tree.set(5, alphabet[5]);
    equal(tree.get(5).data, alphabet[5]);

    tree.set(15, alphabet[15]);
    equal(tree.get(15).data, alphabet[15]);

    tree.set(10, alphabet[10]);
    equal(tree.get(10).data, alphabet[10]);

    tree.set(12, alphabet[12]);
    equal(tree.get(12).data, alphabet[12]);

    tree.set(11, alphabet[11]);
    equal(tree.get(11).data, alphabet[11]);
});

test('Gaps are calculated correctly', function () {
    var tree = new RBTreeList();
    var node;

    node = tree.set(5, alphabet[5]);
    equal(node.leftGapCount, 5);
    node = tree.set(10, alphabet[10]);
    equal(node.leftGapCount, 4);
    node = tree.set(15, alphabet[15]);
    equal(node.leftGapCount, 4);
    node = tree.set(20, alphabet[20]);
    equal(node.leftGapCount, 4);
});

test('Setting the value of gappped index doesn\'t effect subsequent indices' , function () {
    var tree = new RBTreeList();

    var node1 = tree.set(25, alphabet[25]);
    printTree(tree);
    var node2 = tree.set(20, alphabet[20]);
    printTree(tree);
    var node3 = tree.set(15, alphabet[15]);
    printTree(tree);
    var node4 = tree.set(10, alphabet[10]);
    printTree(tree);

    equal(tree.indexOfNode(node1), 25);
    equal(tree.indexOfNode(node2), 20);
    equal(tree.indexOfNode(node3), 15);
    equal(tree.indexOfNode(node4), 10);
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

            equal(alphabet[j], l, 'Correct position');
        }

        ok(match, 'Order is correct after splice of "' + letter + '"');
    });
});

test('Set multiple values via .splice()', function () {
    var tree = new RBTreeList();

    // Fill the tree with values
    tree.splice.apply(tree, [0, 0].concat(alphabet));

    alphabet.forEach(function (letter, i) {
        equal(tree.get(i).data, letter, 'Values match');
    });
});

test('Insert a value between two existing values via .splice()', function () {

    var tree = new RBTreeList();
    var splicedValue = '<- find me ->';

    // Fill the tree with values
    tree.splice.apply(tree, [0, 0].concat(alphabet));

    var middleIndex = Math.round(alphabet.length / 2);

    tree.splice(middleIndex, 0, splicedValue);

    equal(tree.get(middleIndex - 1).data, alphabet[middleIndex - 1]);
    equal(tree.get(middleIndex).data, splicedValue);
    equal(tree.get(middleIndex + 1).data, alphabet[middleIndex]);
});

test('Delete an item via .unset()', function () {
    var tree = new RBTreeList();

    // Fill the tree with values
    tree.splice.apply(tree, [0, 0].concat(alphabet));

    alphabet.forEach(function (letter, index) {
        tree.unset(index);
    });

    tree.each(function () {
        ok(false, 'There should be nothing to iterate');
    });

    equal(tree.length, alphabet.length, 'Tree length is correct');
});

test('Remove an item via .unset()', function () {
    var tree = new RBTreeList();

    // Fill the tree with values
    tree.splice.apply(tree, [0, 0].concat(alphabet));

    for (var i = alphabet.length - 1; i >= 0; i--) {
        tree.unset(i, true);
        printTree(tree);
    };

    tree.each(function () {
        ok(false, 'There should be nothing to iterate');
    });

    equal(tree.length, 0, 'Tree length is correct');
});

test('Removing a gapped item yields correct length', function () {
    var tree = new RBTreeList();
    var modelList = [];

    modelList[100] = 'abc';
    tree.set(100, 'abc');

    equal(tree.length, modelList.length, 'Length is correct after insert');

    delete modelList[100];
    tree.unset(100);

    equal(tree.length, modelList.length, 'Length is correct after remove');
});

test('Removing a node links the prev/next nodes', function () {
    var tree = new RBTreeList();

    // Fill the tree with values
    tree.splice.apply(tree, [0, 0].concat(alphabet));

    var root = tree._root;
    var rootIndex = tree.indexOfNode(root);
    var prev = root.prev;
    var next = root.next;

    tree.unset(rootIndex);

    // NOTE: Don't use .equal() to compare nodes, it causes endless recursion
    ok(prev.next === next, '`prev` node was linked to `next` node');
    ok(next.prev === prev, '`next` node was linked ot `prev` node');
});

test('Removing a gapped item redistributes the gap', function () {
    var tree = new RBTreeList();
    var next;

    tree.set(0, 'A');
    tree.set(1, 'B');
    tree.set(2, 'C');

    tree.set(10, 'N');
    next = tree.set(20, 'O');
    tree.set(30, 'P');

    tree.set(33, 'Y');
    tree.set(33, 'Z');

    tree.unset(10);

    equal(next.leftGapCount, 17,
        'Removed item\'s next sibling is gapped correctly');
});

test('Remove a single value via .splice()', function () {
    var tree = new RBTreeList();
    var length = alphabet.length;

    // Fill the tree with values
    tree.splice.apply(tree, [0, 0].concat(alphabet));

    // Remove the last value, then get the node from the returned
    // "removed items" list
    var removedNode = tree.splice(length - 1, 1).shift();

    equal(removedNode.data, alphabet[length - 1], 'Removed node matches');

    var nodeAtRemovedIndex = tree.get(length - 1);

    ok(nodeAtRemovedIndex === null, 'Node removed from tree');

    // Remove the first value, then get the node from the returned
    // "removed items" list
    removedNode = tree.splice(0, 1).shift();

    equal(removedNode.data, alphabet[0], 'Removed node matches');

    // Should return the NEXT item in the list, after the removed item
    var dataAtRemovedIndex = tree.get(0).data;

    ok(dataAtRemovedIndex === alphabet[1], 'Node removed from tree');
});

test('Remove multiple values via .splice()', function () {
    var tree = new RBTreeList();
    var modelList = alphabet.slice(0);
    var length = alphabet.length;

    // Fill the tree with values
    tree.splice.apply(tree, [0, 0].concat(alphabet));

    var removedNodes = tree.splice(1, length - 2);
    var removedLetters = modelList.splice(1, length - 2);

    equal(removedNodes.length, removedLetters.length,
        'Correct number of nodes removed');

    removedNodes.forEach(function (node, i) {
        i = i+1;

        equal(node.data, alphabet[i], 'Removed values match');
    });

    equal(tree.get(0).data, modelList[0], 'Remaining values match');
    equal(tree.get(1).data, modelList[1], 'Remaining values match');
});

test('Replacing a value with .splice() creates a new Node', function () {
    var tree = new RBTreeList();

    // Fill the tree with values
    tree.splice.apply(tree, [0, 0].concat(alphabet));

    var removedNode = tree.splice(0, 1, alphabet[0]).shift();

    notDeepEqual(removedNode, tree.get(0).data, 'Nodes are not the same');
    equal(removedNode.data, tree.get(0).data, 'Node values are the same');
});

test('Negative removeCount works with .splice()', function () {
    var tree = new RBTreeList();

    // Fill the tree with values
    tree.splice.apply(tree, [0, 0].concat(alphabet));

    var removedNodes = tree.splice(-3, 3);

    removedNodes.forEach(function (node, i) {
        i = alphabet.length - 3 + i;

        equal(node.data, alphabet[i], 'Removed values match');
    });

    for (var i = 0; i < alphabet.length - 3; i++) {
        equal(tree.get(i).data, alphabet[i], 'Remaining values match');
    }
});

test('Insert and remove simultaneously with .splice()', function () {
    var tree = new RBTreeList();
    var replaceIndex = 3;
    var doubledValue = alphabet[replaceIndex] + alphabet[replaceIndex];

    // Fill the tree with values
    tree.splice.apply(tree, [0, 0].concat(alphabet));

    var removedNode = tree.splice(replaceIndex, 1, doubledValue).shift();

    equal(removedNode.data, alphabet[replaceIndex],
        'Removed value matches');

    var node = tree.get(replaceIndex);

    equal(node.data, doubledValue, 'Inserted value matches');
});

test('Nodes are linked (parent, prev, next)', function () {
    var tree = new RBTreeList();
    var cursor, node, parent;

    alphabet.forEach(function (letter, i) {

        node = tree.set(i, letter);
        printTree(tree, false);

        equal(node.data, letter, '"' + letter + '" set');

        cursor = tree.first();
        i = 0;

        while (cursor) {

            equal(cursor.data, alphabet[i], 'Next node matches model');

            parent = cursor;

            // Crawl parents
            while (parent.parent) {
                parent = parent.parent;
            }

            ok(parent === tree._root, 'Reached root via linked parent');

            // Iterate nodes via link
            cursor = cursor.next;
            i++;
        }
    });
});

test('Get index of each node', function () {
    var tree = new RBTreeList();

    // Fill the tree with values
    tree.splice.apply(tree, [0, 0].concat(alphabet));

    tree.each(function (node, i) {
        equal(tree.indexOfNode(node), i, 'Index is correct');
    });
});

test('"Holey" indexes are not enumerable', function () {
    var tree = new RBTreeList();
    var expected;

    tree.set(2, 'C');

    expected = ['C'];
    tree.each(function (node, i) {
        equal(node.data, expected.shift());
    });

    tree.set(0, undefined);

    expected = [undefined, 'C'];
    tree.each(function (node, i) {
        equal(node.data, expected.shift());
    });
});

test('Remove value by index', function () {
    var tree = new RBTreeList();
    var n;

    alphabet.forEach(function (letter, i) {
        tree.set(i, letter);
    });

    for (var i = alphabet.length - 1; i >= 0; i--) {
        n = tree.unset(i);
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

            equal(count, storedCount, 'Count from "' + node.data + '"');
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
                tree.unset(index, true);
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
    var match;

    alphabet.forEach(function (letter, i) {
        tree.set(i, letter);
        match = recursiveChildCountTest(tree._root);
        ok(match, 'Child count is correct after adding "' + letter + '"');
    });

    centerOutRemove(alphabet.length/2);

});

test('Set/get/unset 10k items', function () {
    var url = 'samples/10k';
    var req = new XMLHttpRequest();

    QUnit.stop();

    req.addEventListener('load', function () {
        QUnit.start();

        var operations = this.responseText.split('\n');
        var modelList = [];

        var tree = window.tree = new RBTreeList();
        operations.forEach(function (operation, i) {
            operation = Math.round(operation / 100000);
            var index = Math.abs(operation);
            var node;

            console.log('Operation:', operation);

            if (operation > 0) {
                modelList[index] = index;

                node = tree.set(index, index);
                ok(node instanceof RBTreeList.prototype.Node, 'Set returned a Node');
                equal(node.data, index, 'Set node has correct data');

                node = tree.get(index);
                ok(node instanceof RBTreeList.prototype.Node, 'Get returned a Node');
                equal(node.data, index, 'Get\'s returned node has correct data');
            } else {
                delete modelList[index];
                node = tree.unset(index);
                ok(node instanceof RBTreeList.prototype.Node, 'Remove returned a Node');
                equal(node.data, index, 'Removed node has correct data');
            }

            // Check node.next
            var cursor = tree.first();

            while (cursor) {
                index = tree.indexOfNode(cursor)
                equal(cursor.data, modelList[index], 'Next node matches model');

                parent = cursor;

                // Crawl parents
                while (parent.parent) {
                    parent = parent.parent;
                }

                ok(parent === tree._root, 'Reached root via linked parent');

                // Iterate nodes via link
                cursor = cursor.next;
            }

            // Check node.prev
            cursor = tree.last();

            while (cursor) {
                index = tree.indexOfNode(cursor)
                equal(cursor.data, modelList[index], 'Prev node matches model');

                parent = cursor;

                // Crawl parents
                while (parent.parent) {
                    parent = parent.parent;
                }

                ok(parent === tree._root, 'Reached root via linked parent');

                // Iterate nodes via link
                cursor = cursor.prev;
            }

            equal(tree.length, modelList.length, 'Length is correct');

            printTree(tree, false);
        });
    });

    req.open("get", url, true);
    req.send();
});