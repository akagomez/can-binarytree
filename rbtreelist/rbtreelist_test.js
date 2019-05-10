var QUnit = require("steal-qunit");
var RBTreeList = require('rbtreelist/rbtreelist');
window.can.RBTreeList = RBTreeList;
require('can/compute/compute');

QUnit.module('can.RBTreeList');

var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
// var alphabet = "ABCDEF".split("");

QUnit.test('Set value by index (natural order)', function(assert) {
    var tree = new RBTreeList();

    alphabet.forEach(function (letter, i) {
        var match = true;

        tree.set(i, letter);

        for (var j = 0; j <= i; j++) {
            var l = tree.get(j).data;

            if (alphabet[j] !== l) {
                match = false;
            }

            assert.equal(alphabet[j], l, 'Correct position');
        }

        assert.ok(match, 'Order is correct after set of "' + letter + '"');
    });
});

QUnit.test('Passing an array to the constructor builds a tree as a batch', function(assert) {
    var values = [];
    for (var i = 0; i < 1000; i++) {
        values[i] = i.toString(16);
    }

    var _set = RBTreeList.prototype.set;

    RBTreeList.prototype.set = function () {
        assert.ok(false, '.set() should not be called');
    };

    var tree = new RBTreeList(values);

    RBTreeList.prototype.set = _set;

    assert.ok(true, '.set() was not called');
    assert.equal(tree.attr('length'), values.length, 'Tree has the correct length');

    values.forEach(function (value, index) {
        assert.equal(tree.get(index).data, value, 'Tree has the correct value at the correct index');
    });
});

QUnit.test('Add node with .push()', function(assert) {
    var tree = new RBTreeList();

    alphabet.forEach(function (letter, i) {
        var match = true;

        tree.push(letter);

        for (var j = 0; j <= i; j++) {
            var l = tree.get(j).data;

            if (alphabet[j] !== l) {
                match = false;
            }

            assert.equal(alphabet[j], l, 'Correct position');
        }

        assert.ok(match, 'Order is correct after set of "' + letter + '"');
    });
});

QUnit.test('Set value by index (reverse order)', function(assert) {
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

            assert.equal(alphabet[j], l, 'Correct position');
        }

        assert.ok(match, 'Order is correct after set of "' + letter + '"');
    }
});

QUnit.test('Set value by index (with gaps between indexes)', function(assert) {
    var tree = new RBTreeList();

    tree.set(20, alphabet[20]);
    assert.equal(tree.get(20).data, alphabet[20]);

    tree.set(5, alphabet[5]);
    assert.equal(tree.get(5).data, alphabet[5]);

    tree.set(15, alphabet[15]);
    assert.equal(tree.get(15).data, alphabet[15]);

    tree.set(10, alphabet[10]);
    assert.equal(tree.get(10).data, alphabet[10]);

    tree.set(12, alphabet[12]);
    assert.equal(tree.get(12).data, alphabet[12]);

    tree.set(11, alphabet[11]);
    assert.equal(tree.get(11).data, alphabet[11]);
});

QUnit.test('Gaps are calculated correctly', function(assert) {
    var tree = new RBTreeList();
    var node;

    node = tree.set(5, alphabet[5]);
    assert.equal(node.leftGapCount, 5);
    node = tree.set(10, alphabet[10]);
    assert.equal(node.leftGapCount, 4);
    node = tree.set(15, alphabet[15]);
    assert.equal(node.leftGapCount, 4);
    node = tree.set(20, alphabet[20]);
    assert.equal(node.leftGapCount, 4);
});

QUnit.test('Gaps can be disabled (natural order)', function(assert) {
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

        assert.ok(items.length, 1, 'Only one item was added');

        items.forEach(function (node, index) {
            var value = node.data;
            assert.equal(offset + index, modelList.indexOf(value),
                'Add event reports correct index');
        });
    });

    for (var i = 0; i < alphabet.length; i += 2) {
        var letter = alphabet[i];
        modelList[index] = letter;
        var node = tree.set(i, letter);

        var treeIndex = tree.indexOfNode(node);
        var modelIndex = modelList.indexOf(letter);

        assert.equal(node.data, letter, 'Value matches');
        assert.equal(treeIndex, modelIndex, 'Index excludes gap');
        assert.equal(tree.length, modelList.length, 'Length matches modelList');

        index++;
    }

});

QUnit.test('Gaps can be disabled (reverse order)', function(assert) {
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

        assert.equal(node.data, letter, 'Value matches');
        assert.equal(tree.indexOfNode(node), 0, 'Index excludes gap');
        assert.equal(tree.length, length, 'Length matches gapless index + 1');

        length++;
    }
});


QUnit.test('Setting the value of gappped index doesn\'t effect subsequent indices' , function(assert) {
    var tree = new RBTreeList();

    var node1 = tree.set(25, alphabet[25]);
    var node2 = tree.set(20, alphabet[20]);
    var node3 = tree.set(15, alphabet[15]);
    var node4 = tree.set(10, alphabet[10]);

    assert.equal(tree.indexOfNode(node1), 25);
    assert.equal(tree.indexOfNode(node2), 20);
    assert.equal(tree.indexOfNode(node3), 15);
    assert.equal(tree.indexOfNode(node4), 10);
});

QUnit.test('Set single value via .splice()', function(assert) {
    var tree = new RBTreeList();

    alphabet.forEach(function (letter, i) {
        var match = true;

        tree.splice(i, 0, letter);

        for (var j = 0; j <= i; j++) {
            var l = tree.get(j).data;

            if (alphabet[j] !== l) {
                match = false;
            }

            assert.equal(alphabet[j], l, 'Correct position');
        }

        assert.ok(match, 'Order is correct after splice of "' + letter + '"');
    });
});

QUnit.test('Set multiple values via .splice()', function(assert) {
    var tree = new RBTreeList();

    // Fill the tree with values
    tree.splice.apply(tree, [0, 0].concat(alphabet));

    alphabet.forEach(function (letter, i) {
        assert.equal(tree.get(i).data, letter, 'Values match');
    });
});

QUnit.test('Insert a value between two existing values via .splice()', function(assert) {

    var tree = new RBTreeList();
    var splicedValue = '<- find me ->';

    // Fill the tree with values
    tree.splice.apply(tree, [0, 0].concat(alphabet));

    var middleIndex = Math.round(alphabet.length / 2);

    tree.splice(middleIndex, 0, splicedValue);

    assert.equal(tree.get(middleIndex - 1).data, alphabet[middleIndex - 1]);
    assert.equal(tree.get(middleIndex).data, splicedValue);
    assert.equal(tree.get(middleIndex + 1).data, alphabet[middleIndex]);
});

QUnit.test('Delete an item via .unset()', function(assert) {
    var tree = new RBTreeList();

    // Fill the tree with values
    tree.splice.apply(tree, [0, 0].concat(alphabet));

    alphabet.forEach(function (letter, index) {
        tree.unset(index);
    });

    tree.each(function () {
        assert.ok(false, 'There should be nothing to iterate');
    });

    assert.equal(tree.length, alphabet.length, 'Tree length is correct');
});

QUnit.test('Remove an item via .unset()', function(assert) {
    var tree = new RBTreeList();

    // Fill the tree with values
    tree.splice.apply(tree, [0, 0].concat(alphabet));

    for (var i = alphabet.length - 1; i >= 0; i--) {
        tree.unset(i, true);
    }

    tree.each(function () {
        assert.ok(false, 'There should be nothing to iterate');
    });

    assert.equal(tree.length, 0, 'Tree length is correct');
});

QUnit.test('Removing a gapped item yields correct length', function(assert) {
    var tree = new RBTreeList();
    var modelList = [];

    modelList[100] = 'abc';
    tree.set(100, 'abc');

    assert.equal(tree.length, modelList.length, 'Length is correct after insert');

    delete modelList[100];
    tree.unset(100);

    assert.equal(tree.length, modelList.length, 'Length is correct after remove');
});

QUnit.test('Removing a node links the prev/next nodes', function(assert) {
    var tree = new RBTreeList();

    // Fill the tree with values
    tree.splice.apply(tree, [0, 0].concat(alphabet));

    var root = tree._root;
    var rootIndex = tree.indexOfNode(root);
    var prev = root.prev;
    var next = root.next;

    tree.unset(rootIndex);

    // NOTE: Don't use .equal() to compare nodes, it causes endless recursion
    assert.ok(prev.next === next, '`prev` node was linked to `next` node');
    assert.ok(next.prev === prev, '`next` node was linked ot `prev` node');
});

QUnit.test('Removing a gapped item redistributes the gap', function(assert) {
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

    assert.equal(next.leftGapCount, 17,
        'Removed item\'s next sibling is gapped correctly');
});

QUnit.test('Remove a single value via .splice()', function(assert) {
    var tree = new RBTreeList();
    var length = alphabet.length;

    // Fill the tree with values
    tree.splice.apply(tree, [0, 0].concat(alphabet));

    // Remove the last value, then get the node from the returned
    // "removed items" list
    var removedNode = tree.splice(length - 1, 1).shift();

    assert.equal(removedNode.data, alphabet[length - 1], 'Removed node matches');

    var nodeAtRemovedIndex = tree.get(length - 1);

    assert.ok(nodeAtRemovedIndex === null, 'Node removed from tree');

    // Remove the first value, then get the node from the returned
    // "removed items" list
    removedNode = tree.splice(0, 1).shift();

    assert.equal(removedNode.data, alphabet[0], 'Removed node matches');

    // Should return the NEXT item in the list, after the removed item
    var dataAtRemovedIndex = tree.get(0).data;

    assert.ok(dataAtRemovedIndex === alphabet[1], 'Node removed from tree');
});

QUnit.test('Remove multiple values via .splice()', function(assert) {
    var tree = new RBTreeList();
    var modelList = alphabet.slice(0);
    var length = alphabet.length;

    // Fill the tree with values
    tree.splice.apply(tree, [0, 0].concat(alphabet));

    var removedNodes = tree.splice(1, length - 2);
    var removedLetters = modelList.splice(1, length - 2);

    assert.equal(removedNodes.length, removedLetters.length,
        'Correct number of nodes removed');

    removedNodes.forEach(function (node, i) {
        i = i+1;

        assert.equal(node.data, alphabet[i], 'Removed values match');
    });

    assert.equal(tree.get(0).data, modelList[0], 'Remaining values match');
    assert.equal(tree.get(1).data, modelList[1], 'Remaining values match');
});

QUnit.test('Replacing a value with .splice() creates a new Node', function(assert) {
    var tree = new RBTreeList();

    // Fill the tree with values
    tree.splice.apply(tree, [0, 0].concat(alphabet));

    var removedNode = tree.splice(0, 1, alphabet[0]).shift();

    assert.notDeepEqual(removedNode, tree.get(0).data, 'Nodes are not the same');
    assert.equal(removedNode.data, tree.get(0).data, 'Node values are the same');
});

QUnit.test('Negative removeCount works with .splice()', function(assert) {
    var tree = new RBTreeList();

    // Fill the tree with values
    tree.splice.apply(tree, [0, 0].concat(alphabet));

    var removedNodes = tree.splice(-3, 3);

    removedNodes.forEach(function (node, i) {
        i = alphabet.length - 3 + i;

        assert.equal(node.data, alphabet[i], 'Removed values match');
    });

    for (var i = 0; i < alphabet.length - 3; i++) {
        assert.equal(tree.get(i).data, alphabet[i], 'Remaining values match');
    }
});

QUnit.test('Insert and remove simultaneously with .splice()', function(assert) {
    var tree = new RBTreeList();
    var replaceIndex = 3;
    var doubledValue = alphabet[replaceIndex] + alphabet[replaceIndex];

    // Fill the tree with values
    tree.splice.apply(tree, [0, 0].concat(alphabet));

    var removedNode = tree.splice(replaceIndex, 1, doubledValue).shift();

    assert.equal(removedNode.data, alphabet[replaceIndex],
        'Removed value matches');

    var node = tree.get(replaceIndex);

    assert.equal(node.data, doubledValue, 'Inserted value matches');
});

QUnit.test('Nodes are linked (parent, prev, next)', function(assert) {
    var tree = new RBTreeList();
    var modelList = [];
    var cursor, node, parent;

    alphabet.forEach(function (letter, i) {

        modelList[i] = letter;
        node = tree.set(i, letter);

        assert.equal(node.data, letter, '"' + letter + '" set');

        cursor = tree.first();
        i = 0;

        while (cursor) {

            assert.equal(cursor.data, alphabet[i], 'Next node matches model');

            parent = cursor;

            // Crawl parents
            while (parent.parent) {
                parent = parent.parent;
            }

            assert.ok(parent === tree._root, 'Reached root via linked parent');

            // Iterate nodes via link
            cursor = cursor.next;
            i++;
        }

        cursor = tree.last();
        i = modelList.length - 1;

        while (cursor) {

            assert.equal(cursor.data, modelList[i], 'Prev node matches model');

            parent = cursor;

            // Crawl parents
            while (parent.parent) {
                parent = parent.parent;
            }

            assert.ok(parent === tree._root, 'Reached root via linked parent');

            // Iterate nodes via link
            cursor = cursor.prev;
            i--;
        }
    });
});

QUnit.test('Get the index of a node', function(assert) {
    var tree = new RBTreeList();

    // Fill the tree with values
    tree.splice.apply(tree, [0, 0].concat(alphabet));

    tree.eachNode(function (node, i) {
        assert.equal(tree.indexOfNode(node), i, 'Index is correct');
    });
});

QUnit.test('Get the index of a value', function(assert) {
    var tree = new RBTreeList();

    // Fill the tree with values
    tree.splice.apply(tree, [0, 0].concat(alphabet));

    alphabet.forEach(function (letter, i) {
        assert.equal(tree.indexOf(letter), i, 'Index is correct');
    });
});

QUnit.test('Uninintialized indexes are not enumerable', function(assert) {
    var tree = new RBTreeList();
    var expected;

    tree.set(2, 'C');

    expected = [];
    expected[2] = 'C';

    expected.forEach(function (value, index) {
        assert.equal(tree.get(index).data, value);
    });

    tree.set(0, undefined);

    expected = [undefined, 'C'];
    tree.each(function (value, i) {
        assert.equal(value, expected.shift());
    });
});

QUnit.test('Iterable with can.each()', function(assert) {
    var tree = new RBTreeList();
    var expected = alphabet.slice();

    // Fill the tree with values
    tree.splice.apply(tree, [0, 0].concat(alphabet));

    // Iterate values, not nodes
    can.each(tree, function (letter, index) {
        assert.equal(letter, expected[index], 'Value matches');
    });
});

QUnit.test('Remove value by index', function(assert) {
    var tree = new RBTreeList();
    var n;

    alphabet.forEach(function (letter, i) {
        tree.set(i, letter);
    });

    for (var i = alphabet.length - 1; i >= 0; i--) {
        n = tree.unset(i);
        assert.equal(n.data, alphabet[i], 'Correct item removed');
    }
});

QUnit.test('Passing a NaN to .set() will not throw an error', function(assert) {
    var tree = new RBTreeList();
    tree.set('foo', 'bar');
    assert.ok('No error was thrown');
});

QUnit.test('Passing a NaN to set/get/or unset will not throw an error', function(assert) {
    var tree = new RBTreeList();

    tree.set('foo', 'bar');
    tree.get('boo');
    tree.unset('goo');

    assert.ok(true, 'No error was thrown');
    assert.equal(tree.attr('length'), 0, 'Length is zero');
    assert.equal(tree._root, null, 'The list contains no items');
});



QUnit.test('leftCount is maintained on set and unset', function(assert) {

    var tree = new RBTreeList();
    var match;

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

            assert.equal(count, storedCount, 'Count from "' + node.data + '"');
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
                assert.ok(match, 'Child count is correct after removing "' + letter + '"');
                i++;
            }

            offset = -(offset);

            if (offset >= 0) {
                offset++;
            }
        }
    };

    alphabet.forEach(function (letter, i) {
        tree.set(i, letter);
        match = recursiveChildCountTest(tree._root);
        assert.ok(match, 'Child count is correct after adding "' + letter + '"');
    });

    centerOutRemove(alphabet.length/2);

});

QUnit.test('Set/get/unset 10k items (by known index)', function(assert) {
    var url = '../fixtures/10k';
    var req = new XMLHttpRequest();

    var done = assert.async();

    req.addEventListener('load', function () {
        done();

        var operations = this.responseText.split('\n');
        var modelList = [];

        var tree = new RBTreeList();
        operations.forEach(function (operation, i) {

            var index = Math.abs(operation);
            var node;

            if (operation > 0) {
                modelList[index] = index;

                node = tree.set(index, index);
                assert.ok(node instanceof RBTreeList.prototype.Node, '.set() returned a Node');
                assert.equal(node.data, index, '.set()\'s returned node has correct data');

                node = tree.get(index);
                assert.ok(node instanceof RBTreeList.prototype.Node, 'Get returned a Node');
                assert.equal(node.data, index, '.get()\'s returned node has correct data');
            } else {
                delete modelList[index];

                node = tree.unset(index);
                assert.ok(node instanceof RBTreeList.prototype.Node, 'Remove returned a Node');
                assert.equal(node.data, index, 'Removed node has correct data');
            }

            assert.equal(tree.length, modelList.length, 'Length is correct');
        });
    });

    req.open('get', url, true);
    req.send();
});

QUnit.test('Add/remove 1k items (by indexOf)', function(assert) {

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

            assert.equal(index, modelIndex, 'Value was saved at correct index');
        } else {
            modelIndex = modelList.indexOf(value);
            modelRemoved = modelList.splice(modelIndex, 1);

            treeIndex = tree.indexOf(value);
            treeRemoved = tree.splice(treeIndex, 1);

            assert.equal(treeIndex, modelIndex, 'Indices match');

            for (j = 0; j <  modelRemoved.length; j++) {
                assert.equal(treeRemoved[j].data, modelRemoved[j], 'Removed item matches model');
            }
        }

        assert.equal(tree.length, modelList.length, 'Length is correct');
    }

});

QUnit.test('Set the value at an index using attr([index], [value])', function(assert) {
    var collection = new RBTreeList();
    collection.attr(0, 'a');
    collection.attr(1, 'b');
    collection.attr(2, 'c');
    assert.equal(collection.attr(0), 'a', 'Got value using .attr()');
    assert.equal(collection.attr(1), 'b', 'Got value using .attr()');
    assert.equal(collection.attr(2), 'c', 'Got value using .attr()');
});

QUnit.test('Get the value at an index using attr([index])', function(assert) {
    var collection = new RBTreeList(['a', 'b', 'c']);
    assert.equal(collection.attr(0), 'a', 'Got value using .attr()');
    assert.equal(collection.attr(1), 'b', 'Got value using .attr()');
    assert.equal(collection.attr(2), 'c', 'Got value using .attr()');
});

QUnit.test('Calling .each in a compute will bind to length', function(assert) {
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
    assert.equal(clone[0], 'a', 'Cloned index matches source index');
    assert.equal(clone[1], 'b', 'Cloned index matches source index');
    assert.equal(clone[2], 'c', 'Cloned index matches source index');

    source.push('d');

    clone = cloneCompute();
    assert.equal(clone[3], 'd', 'Cloned index matches source index');
});

QUnit.test('batchSet\'s match their progressively inserted equivalents', function(assert) {

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
        assert.equal(testTree.get(index).value, node.value, 'Values match');
    });

    assert.equal(testTree.length, controlTree.length, 'Length matches');
});

QUnit.test('.removeAttr() removes a key/value', function(assert) {
    var tree = new RBTreeList(['a', 'b', 'c']);
    var expected = new can.List(['a', 'b', 'c']);

    var returned = tree.removeAttr(1);
    expected.removeAttr(1);

    assert.equal(tree.attr(1), expected.attr(1), 'Value at index was removed');
    assert.deepEqual(returned, 'b', 'Returned an array of removed values');
});


QUnit.test('.deleteAttr() creates a sparse array', function(assert) {
    var tree = new RBTreeList(['a', 'b', 'c']);
    var expected = ['a', 'b', 'c'];
    var treeIterations = [];
    var expectedIterations = [];

    tree.deleteAttr(1);
    delete expected[1];

    assert.equal(tree.attr(1), expected[1], 'Value at index was uninintialized');

    tree.each(function (value, index) {
        treeIterations.push(value);
    });

    expected.forEach(function (value, index) {
        expectedIterations.push(value);
    });

    assert.equal(treeIterations.length, expectedIterations.length,
        'The correct number of indices where iterated');

    assert.deepEqual(treeIterations, expectedIterations, 'Iterated values match');
});


QUnit.test('.attr() returns all values', function(assert) {
    var expected = ['a', 'b', 'c'];
    var tree = new RBTreeList(expected);
    var values = tree.attr();

    assert.equal(values[0], expected[0], '1st value is correct');
    assert.equal(values[1], expected[1], '2nd value is correct');
    assert.equal(values[2], expected[2], '3rd value is correct');
    assert.equal(values.length, expected.length, '"length" is correct');
});

QUnit.test('.filter() returns subset of values', function(assert) {
    var tree = new RBTreeList(['a', 'b', 'c']);

    var filtered = tree.filter(function (letter) {
        return letter === 'b';
    });

    assert.ok(filtered instanceof can.RBTreeList, 'Is an RBTreeList');
    assert.equal(filtered.length, 1, '"length" is correct');
    assert.equal(filtered.attr(0), 'b', 'Contains the correct value');
});

QUnit.test('Uninintialized values can be removed', function(assert) {
    var tree = new RBTreeList();
    tree.attr(0, 'a');
    tree.attr(2, 'b');
    tree.removeAttr(1);

    assert.equal(tree.attr(1), 'b', 'Uninintialized index removed');
    assert.equal(tree.attr()[1], 'b', 'Cache updated');
});

QUnit.test('Trees allow up to 1M nodes', function(assert) {
    var tree = new RBTreeList();
    var length = 1000 * 1000; // 1M

    for (var i = 0; i < length; i++) {
        tree.push(i.toString(16));
    }

    assert.equal(tree.attr('length'), length, 'Tree contains 1M nodes');
});
