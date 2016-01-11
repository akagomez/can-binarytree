# can-binarytree

**can-binarytree** extends the very well written Javascript binary tree
implementations provided by [@vadimg](https://github.com/vadimg/js_bintrees)
and and mixes in features of CanJS that make the data structures observable.

Note: Currently, the only data structure in the package that is observable is
the `can.RBTreeList`, which was adapted from the `can.RBTree` data structure
for use in CanJS' [can-derive plugin](https://github.com/canjs/can-derive).

> - [Install](#install)
> - [Use](#use)
> - [Data Structures](#data-structures)
> - [API](#api)
>   - [can.RBTreeList](#canrbtreelist)
>     - [`.attr()`](#attr)
>     - [`.batchSet()`](#batchset)
>     - [`.deleteAttr()`](#deleteattr)
>     - [`.each()`](#each)
>     - [`.eachNode()`](#each)
>     - [`.filter()`](#filter)
>     - [`.indexOf()`](#indexof)
>     - [`.indexOfNode()`](#indexofnode)
>     - [`.map()`](#map)
>     - [`.push()`](#push)
>     - [`.print()`](#print)
>     - [`.printIndexes()`](#printindexes)
>     - [`.printColors()`](#printcolors)
>     - [`.printParents()`](#printparents)
>     - [`.printLinks()`](#printlinks)
>     - [`.removeAttr()`](#removeattr)
>     - [`.replace()`](#replace)
>     - [`.splice()`](#splice)
>     - [`.unshift()`](#unshift)
>   - [can.RBTree](#canrbtree)
>   - [can.BinTree](#canbintree)
> - [Contributing](#contributing)




## Install

Use npm to install `can-binarytree`:

```
npm install can-binarytree --save
```


## Use

Use `require` in Node/Browserify workflows to import `can-binarytree` like:

```
var set = require('can-binarytree');
```

Use `define`, `require` or `import` in [StealJS](http://stealjs.com)
workflows to import `can-binarytree` like:

```
import set from 'can-binarytree'
```

Once you've imported `can-binarytree` into your project, use it to
create observable binary tree data structures. The following example
formats and `console.log`'s the current list of values as they are
added to a Red-Black Tree List:

```js
var tree = new can.RBTreeList();

tree.bind('add', function () {
    tree.print(function (node) {
        return '<' + node.data + '>';
    });
})

tree.push('Hop');
// <Hop>

tree.push('Skip');
// <Hop>------
// -----<Skip>

tree.push('Jump');
// -----<Skip>------
// <Hop>------<Jump>

```


## Data Structures

- RBTreeList - A red-black tree implementation that meets the specifications of
  a can.List
- RBTree - A self-balancing binary tree that serves as a key-value store
- BinTree - A binary tree that is not balanced


## API


### can.RBTreeList


#### .attr()

`rbTreeList.attr() -> Array`

Returns an array of all the nodes' `data` property value in the
`can.RBTreeList`.

`rbTreeList.attr(index) -> Object`

Returns the `data` stored on the node in the `can.RBTreeList` at
the specified index.

`rbTreeList.attr(index, value) -> can.RBTreeList`

Creates a node, sets its `data` property, and inserts it into the
`can.RBTreeList` at the specified index. If a node already exists at
the specified index its `data` property is overwritten with the
specified value.

Returns the `can.RBTreeList`.


#### .removeAttr()

`rbTreeList.removeAttr(index) -> Object`

Removes the node at the specified `index` while decrementing the indices of
of all subsequent items in the `RBTreeList` by 1.

Returns the value of the node's `data` property that was removed.


#### .deleteAttr()

`rbTreeList.removeAttr(index) -> Object`

Removes the node at the specified `index` without decrementing the indices of
of all subsequent items in the `RBTreeList` by 1.

Returns the value of the node's `data` property that was removed.


#### .each()

`rbTreeList.each(callbackFn) -> can.RBTreeList`

Iterates over the nodes in the `can.RBTreeList` invoking `callbackFn` for each
node's `data` property. The `callbackFn` is invoked with two arguments:
(node, index). If the callback returns `false`, the iteration will stop.


#### .eachNode()

`rbTreeList.each(callbackFn) -> can.RBTreeList`

Iterates over the nodes in the `can.RBTreeList` invoking `callbackFn` for each
node. The `callbackFn` is invoked with two arguments: (node, index).
If the callback returns `false`, the iteration will stop.


#### .unshift()

`rbTreeList.unshift(value) -> Number`

Inserts the specified value at the beginning of the `can.RBTreeList`.

Returns the `length` of the `can.RBTreeList`.


#### .push()

`rbTreeList.push(value) -> Number`

Inserts the specified value at the end of the `can.RBTreeList`.

Returns the `length` of the `can.RBTreeList`.


#### .splice()

`rbTreeList.splice(startIndex, removeCount, nodes...) -> Array`

Changes the content of a `can.RBTreeList` by removing existing nodes
and/or adding new nodes.

Returns an array of nodes removed from the `can.RBTreeList`.


#### .replace()

`rbTreeList.replace(newValues) -> can.RBTreeList`

Changes the content of a `can.RBTreeList` by removing all of the existing nodes
and inserting new nodes with the values supplied in the `newValues` array.

Returns the `can.RBTreeList`.


#### .filter()

`rbTreeList.filter(predicateFn, context) -> can.RBTreeList`

Iterates the elements in the `can.RBTreeList` returning a new
`can.RBTreeList` instance of all elements `prediateFn` returns truthy for.
The `predicateFn` is invoked in the specified `context` with the arguments:
(value, index, rbTreeList).

Returns a new `can.RBTreeList` instance.


#### .map()

`rbTreeList.map(mapFn, context) -> can.RBTreeList`

Creates an `can.RBTreeList` of values by running each element in the
`can.RBTreeList` through `mapFn`. The iteratee is invoked in the specified
`context` with three arguments: (value, index, rbTreeList).

Returns a new `can.RBTreeList` instance.


#### .indexOf()

`rbTreeList.indexOf(value) -> Number`

Returns the first index at which the specified `value` can be found in
the `can.RBTreeList`, or -1 if it is not present.


#### .indexOfNode()

`rbTreeList.indexOfNode(node, useCache) -> Number`

Returns the first index at which the specified `node` can be found in
the `can.RBTreeList`, or -1 if it is not present.


#### .batchSet()

`rbTreeList.batchSet(array, setFn) -> can.RBTreeList`

Populates an empty `can.RBTreeList` in `O(n)` time - compared
to `O(mlogn)` time - from an array of values.

The `setFn` is invoked for each insert with two arguments:
(insertIndex, createdNode)

Returns the `can.RBTreeList`.


#### .print()

`rbTreeList.print(valueFn, startIndex, printCount) -> can.RBTreeList`

Iterates over the nodes in the `can.RBTreeList` invoking `valueFn` with
a reference to each node. If no `valueFn` is provided the node's
`value` property is used.

The value returned from the `valueFn` is concatenated into an ASCII formatted
string that emulates the parent/child relationships of each node in the
`can.RBTreeList`. The resulting string is passed to `console.log`.

An example of the formatted string:

```
---------Apr------------------------
---Feb---------------Aug------------
Jan---Mar------Jun---------Oct------
------------May---Jul---Sep---Nov---
---------------------------------Dec
```

A `startIndex` and `printCount` can also be provided in order to display only
a subset of the overall nodes in the `can.RBTreeList`.

Returns the `can.RBTreeList`.


#### .printIndexes()

`rbTreeList.printIndexes(showCounts, startIndex, printCount) -> can.RBTreeList`

Similar to [`.print()`](#print) except that node `data` value is printed
alongside the calculated index.

`showCounts` is a `boolean` that defaults to `true` and configures
whether or not the  `leftCount`, `leftGapCount` and `rightCount` are
displayed alongside the `data` property.


An example of the formatted string (`showCounts` === `false`):

```
---------------3:Apr------------------------------------------
-----1:Feb-------------------------7:Aug----------------------
0:Jan-----2:Mar----------5:Jun---------------9:Oct------------
--------------------4:May-----6:Jul-----8:Sep-----10:Nov------
--------------------------------------------------------11:Dec
```

An example of the formatted string (`showCounts` === `true`):

```
----------1(1|0|1):B----------
0(0|0|0):A----------2(0|0|0):C
```

#### .printColors()

`rbTreeList.printColors() -> can.RBTreeList`

An example of the formatted string:

```
------------3(B)----------------------------------
----1(B)--------------------7(B)------------------
0(B)----2(B)--------5(R)------------9(R)----------
----------------4(B)----6(B)----8(B)----10(B)-----
---------------------------------------------11(R)
```


#### .printParents()

```
-----------(2062^_)-----------
(2060^2062)--------(2064^2062)
```

Returns the `can.RBTreeList`.


#### .printLinks()

`rbTreeList.printLinks() -> can.RBTreeList`

An example of the formatted string:

```
_ < Jan > Feb
Jan < Feb > Mar
Feb < Mar > Apr
Mar < Apr > May
Apr < May > Jun
May < Jun > Jul
Jun < Jul > Aug
Jul < Aug > Sep
Aug < Sep > Oct
Sep < Oct > Nov
Oct < Nov > Dec
Nov < Dec > _
```

Returns the `can.RBTreeList`.

#### can.RBTreeList.Node

A reference to the `Node` contstructor used internally by `can.RBTreeList` to
create nodes.



### can.RBTree

*Coming soon*

### can.BinTree

*Coming soon*

### can.Tree

*Coming soon*