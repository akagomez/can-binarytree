var QUnit = require("steal-qunit");
var RBTreeList = require('rbtreelist/rbtreelist');
window.can.RBTreeList = RBTreeList;
require('can/compute/compute');

QUnit.module('can.RBTreeList');

var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
// var alphabet = "ABCDEF".split("");

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

test('Passing an array to the constructor builds a tree as a batch', function () {
    var values = [];
    for (var i = 0; i < 1000; i++) {
        values[i] = i.toString(16);
    }

    var _set = RBTreeList.prototype.set;

    RBTreeList.prototype.set = function () {
        ok(false, '.set() should not be called');
    };

    var tree = new RBTreeList(values);

    RBTreeList.prototype.set = _set;

    ok(true, '.set() was not called');
    equal(tree.attr('length'), values.length, 'Tree has the correct length');

    values.forEach(function (value, index) {
        equal(tree.get(index).data, value, 'Tree has the correct value at the correct index');
    });
});

test('Add node with .push()', function () {
    var tree = new RBTreeList();

    alphabet.forEach(function (letter, i) {
        var match = true;

        tree.push(letter);

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

test('Gaps can be disabled (natural order)', function () {
    var tree = new RBTreeList();
    var index = 0;
    var modelList = [];

    // Disable gap
    tree._gapAndSize = function () {
        this.length++;
    };

    // Replace default index logic
    tree._comparator = function (_a, _b) {
        var a = _a instanceof this.Node ? alphabet.indexOf(_a.data) : _a;
        var b = _b instanceof this.Node ? alphabet.indexOf(_b.data) : _b;
        return a === b ? 0 : a < b ? -1 : 1; // ASC
    };

    // Make sure index reported is of the filtered list, not the alphabet
    tree.bind('add', function (ev, items, offset) {

        ok(items.length, 1, 'Only one item was added');

        items.forEach(function (node, index) {
            var value = node.data;
            equal(offset + index, modelList.indexOf(value),
                'Add event reports correct index');
        });
    });

    for (var i = 0; i < alphabet.length; i += 2) {
        var letter = alphabet[i];
        modelList[index] = letter;
        var node = tree.set(i, letter);

        var treeIndex = tree.indexOfNode(node);
        var modelIndex = modelList.indexOf(letter);

        equal(node.data, letter, 'Value matches');
        equal(treeIndex, modelIndex, 'Index excludes gap');
        equal(tree.length, modelList.length, 'Length matches modelList');

        index++;
    }

});

test('Gaps can be disabled (reverse order)', function () {
    var tree = new RBTreeList();
    var length = 1;

    // Disable gap
    tree._gapAndSize = function () {
        this.length++;
    };

    // Replace default index logic
    tree._comparator = function (_a, _b) {
        var a = _a instanceof this.Node ? alphabet.indexOf(_a.data) : _a;
        var b = _b instanceof this.Node ? alphabet.indexOf(_b.data) : _b;
        return a === b ? 0 : a < b ? -1 : 1; // ASC
    };

    for (var i = alphabet.length - 1; i >= 0; i -= 2) {
        var letter = alphabet[i];
        var node = tree.set(i, letter);

        equal(node.data, letter, 'Value matches');
        equal(tree.indexOfNode(node), 0, 'Index excludes gap');
        equal(tree.length, length, 'Length matches gapless index + 1');

        length++;
    }
});


test('Setting the value of gappped index doesn\'t effect subsequent indices' , function () {
    var tree = new RBTreeList();

    var node1 = tree.set(25, alphabet[25]);
    var node2 = tree.set(20, alphabet[20]);
    var node3 = tree.set(15, alphabet[15]);
    var node4 = tree.set(10, alphabet[10]);

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
    }

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
    var modelList = [];
    var cursor, node, parent;

    alphabet.forEach(function (letter, i) {

        modelList[i] = letter;
        node = tree.set(i, letter);

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

        cursor = tree.last();
        i = modelList.length - 1;

        while (cursor) {

            equal(cursor.data, modelList[i], 'Prev node matches model');

            parent = cursor;

            // Crawl parents
            while (parent.parent) {
                parent = parent.parent;
            }

            ok(parent === tree._root, 'Reached root via linked parent');

            // Iterate nodes via link
            cursor = cursor.prev;
            i--;
        }
    });
});

test('Get the index of a node', function () {
    var tree = new RBTreeList();

    // Fill the tree with values
    tree.splice.apply(tree, [0, 0].concat(alphabet));

    tree.eachNode(function (node, i) {
        equal(tree.indexOfNode(node), i, 'Index is correct');
    });
});

test('Get the index of a value', function () {
    var tree = new RBTreeList();

    // Fill the tree with values
    tree.splice.apply(tree, [0, 0].concat(alphabet));

    alphabet.forEach(function (letter, i) {
        equal(tree.indexOf(letter), i, 'Index is correct');
    });
});

test('Uninintialized indexes are not enumerable', function () {
    var tree = new RBTreeList();
    var expected;

    tree.set(2, 'C');

    expected = [];
    expected[2] = 'C';

    expected.forEach(function (value, index) {
        equal(tree.get(index).data, value);
    });

    tree.set(0, undefined);

    expected = [undefined, 'C'];
    tree.each(function (value, i) {
        equal(value, expected.shift());
    });
});

test('Iterable with can.each()', function () {
    var tree = new RBTreeList();
    var expected = alphabet.slice();

    // Fill the tree with values
    tree.splice.apply(tree, [0, 0].concat(alphabet));

    // Iterate values, not nodes
    can.each(tree, function (letter, index) {
        equal(letter, expected[index], 'Value matches');
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

test('Passing a NaN to .set() will not throw an error', function () {
    var tree = new RBTreeList();
    tree.set('foo', 'bar');
    ok('No error was thrown');
});

test('Passing a NaN to set/get/or unset will not throw an error', function () {
    var tree = new RBTreeList();

    tree.set('foo', 'bar');
    tree.get('boo');
    tree.unset('goo');

    ok(true, 'No error was thrown');
    equal(tree.attr('length'), 0, 'Length is zero');
    equal(tree._root, null, 'The list contains no items');
});



test('leftCount is maintained on set and unset', function () {

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

test('Set/get/unset 10k items (by known index)', function () {
    var url = '../fixtures/10k';
    var req = new XMLHttpRequest();

    QUnit.stop();

    req.addEventListener('load', function () {
        QUnit.start();

        var operations = this.responseText.split('\n');
        var modelList = [];

        var tree = new RBTreeList();
        operations.forEach(function (operation, i) {

            var index = Math.abs(operation);
            var node;

            if (operation > 0) {
                modelList[index] = index;

                node = tree.set(index, index);
                ok(node instanceof RBTreeList.prototype.Node, '.set() returned a Node');
                equal(node.data, index, '.set()\'s returned node has correct data');

                node = tree.get(index);
                ok(node instanceof RBTreeList.prototype.Node, 'Get returned a Node');
                equal(node.data, index, '.get()\'s returned node has correct data');
            } else {
                delete modelList[index];

                node = tree.unset(index);
                ok(node instanceof RBTreeList.prototype.Node, 'Remove returned a Node');
                equal(node.data, index, 'Removed node has correct data');
            }

            equal(tree.length, modelList.length, 'Length is correct');
        });
    });

    req.open('get', url, true);
    req.send();
});

test('Add/remove 1k items (by indexOf)', function () {

    var iterations = 1000;
    var tree = new RBTreeList();
    var modelList = []; // TODO: Rename "modelList" to "expected"
    var i, j, index, method, modelIndex, modelRemoved, treeIndex, treeRemoved,
        value;

    for (i = 0; i < iterations * 2; i++) {

        // Generate a logical unique value (hex)
        value = parseInt(i, 16);

        if (i < iterations) {

            // Alternate push/unshift
            method = (i % 2 === 0 ? 'push' : 'unshift');
            modelList[method](value);
            tree[method](value);

            index = tree.indexOf(value);
            modelIndex = modelList.indexOf(value);

            equal(index, modelIndex, 'Value was saved at correct index');
        } else {
            modelIndex = modelList.indexOf(value);
            modelRemoved = modelList.splice(modelIndex, 1);

            treeIndex = tree.indexOf(value);
            treeRemoved = tree.splice(treeIndex, 1);

            equal(treeIndex, modelIndex, 'Indices match');

            for (j = 0; j <  modelRemoved.length; j++) {
                equal(treeRemoved[j].data, modelRemoved[j], 'Removed item matches model');
            }
        }

        equal(tree.length, modelList.length, 'Length is correct');
    }

});

test('Set the value at an index using attr([index], [value])', function () {
    var collection = new RBTreeList();
    collection.attr(0, 'a');
    collection.attr(1, 'b');
    collection.attr(2, 'c');
    equal(collection.attr(0), 'a', 'Got value using .attr()');
    equal(collection.attr(1), 'b', 'Got value using .attr()');
    equal(collection.attr(2), 'c', 'Got value using .attr()');
});

test('Get the value at an index using attr([index])', function () {
    var collection = new RBTreeList(['a', 'b', 'c']);
    equal(collection.attr(0), 'a', 'Got value using .attr()');
    equal(collection.attr(1), 'b', 'Got value using .attr()');
    equal(collection.attr(2), 'c', 'Got value using .attr()');
});

test('Calling .each in a compute will bind to length', function () {
    var source = new RBTreeList(['a', 'b', 'c']);

    // Copy the list
    var cloneCompute = can.compute(function () {
        var result = [];

        source.each(function (item) {
            result.push(item);
        });

        return result;
    });

    cloneCompute.bind('change', can.noop);

    var clone = cloneCompute();
    equal(clone[0], 'a', 'Cloned index matches source index');
    equal(clone[1], 'b', 'Cloned index matches source index');
    equal(clone[2], 'c', 'Cloned index matches source index');

    source.push('d');

    clone = cloneCompute();
    equal(clone[3], 'd', 'Cloned index matches source index');
});

test('batchSet\'s match their progressively inserted equivalents', function () {

    var constructorValues = [
        13,6,20,3,10,17,24,1,5,8,12,15,19,22,26,0,2,4,7,9,11,14,16,18,21,23,25];
    var insertValues = [
        23,24,29,30,31,32,33,34,35,36,36,36,36,36,36,36,36,36,36,36,24,26,32,
        34,36,38,40,42,44,56,55,54,53,52,51,50,49,48,47,46,25,28,35,38,41,44,
        47,50,53,76,74,72,70,68,66,64,62,60,58,56,26];
    var controlTree = new RBTreeList();
    var constructorArray = [];
    var testTree, insertValue;

    window.controlTree = testTree;

    constructorValues.forEach(function (insertIndex, index) {
        // [0, 1, 2, ... 26]
        // NOTE: "c-" indicates constructor insert
        constructorArray[index] = 'c-' + index;

        // [13, 6, 20, ... 25]
        // NOTE: "c-" indicates constructor insert
        controlTree.set(insertIndex, 'c-' + insertIndex);
    });


    window.testTree = testTree = new RBTreeList(constructorArray);

    insertValues.forEach(function (insertIndex, index) {
        // NOTE: "i-" indicates subsequent insert
        insertValue = 'i-' + (constructorArray.length + index);

        controlTree.set(insertIndex, insertValue, true);
        testTree.set(insertIndex, insertValue, true);
    });


    controlTree.each(function (node, index) {
        equal(testTree.get(index).value, node.value, 'Values match');
    });

    equal(testTree.length, controlTree.length, 'Length matches');
});

test('.removeAttr() removes a key/value', function () {
    var tree = new RBTreeList(['a', 'b', 'c']);
    var expected = new can.List(['a', 'b', 'c']);

    var returned = tree.removeAttr(1);
    expected.removeAttr(1);

    equal(tree.attr(1), expected.attr(1), 'Value at index was removed');
    deepEqual(returned, 'b', 'Returned an array of removed values');
});


test('.deleteAttr() creates a sparse array', function () {
    var tree = new RBTreeList(['a', 'b', 'c']);
    var expected = ['a', 'b', 'c'];
    var treeIterations = [];
    var expectedIterations = [];

    tree.deleteAttr(1);
    delete expected[1];

    equal(tree.attr(1), expected[1], 'Value at index was uninintialized');

    tree.each(function (value, index) {
        treeIterations.push(value);
    });

    expected.forEach(function (value, index) {
        expectedIterations.push(value);
    });

    equal(treeIterations.length, expectedIterations.length,
        'The correct number of indices where iterated');

    deepEqual(treeIterations, expectedIterations, 'Iterated values match');
});


test('.attr() returns all values', function () {
    var expected = ['a', 'b', 'c'];
    var tree = new RBTreeList(expected);
    var values = tree.attr();

    equal(values[0], expected[0], '1st value is correct');
    equal(values[1], expected[1], '2nd value is correct');
    equal(values[2], expected[2], '3rd value is correct');
    equal(values.length, expected.length, '"length" is correct');
});

test('.filter() returns subset of values', function () {
    var tree = new RBTreeList(['a', 'b', 'c']);

    var filtered = tree.filter(function (letter) {
        return letter === 'b';
    });

    ok(filtered instanceof can.RBTreeList, 'Is an RBTreeList');
    equal(filtered.length, 1, '"length" is correct');
    equal(filtered.attr(0), 'b', 'Contains the correct value');
});