can-binarytree
===

This package extends the very well written Javascript binary tree 
implementations provided by [@vadimg](https://github.com/vadimg/js_bintrees) 
and and mixes in features of CanJS that make the data structures observable. 

NOTE: Currently, the only data structure in the package that is observable is 
the RBTreeList, which was forked from the RBTree for use in
CanJS' [derive plugin](https://github.com/canjs/can-derive).

Data Structures
---

- RBTreeList - A red-black tree implementation that meets the specifications of 
  a can.List
- RBTree - A self-balancing binary tree that serves as a key-value store 
- BinTree - A binary tree that is not balanced

Example
---

```javascript
var RBTreeList = require('can-binarytree/rbtreelist');

var tree = new RBTreeList(function (a, b) { return a - b; });

tree.bind('add', function (ev, addedItems) {
  console.log('Inserted:', addedItems);
});

tree.bind('remove', function (ev, removedItems) {
  console.log('Removed:', removedItems);
});

// Set
tree.attr(0, 'A'); // "Inserted: [A]"
tree.attr(2, 'C');  // "Inserted: [C]"

// Get
tree.attr(0); //-> "A"
tree.attr(1); //-> undefined
tree.attr(2); //-> "C"

// Remove value (creates a gap like `delete myArray[index]` would)
tree.removeNode(0); //-> 'A'

// Serialize
tree.attr() //-> [undefined, undefined, 'C']

// Get index of value
tree.indexOf('C') //-> 2

// Remove index (decrements the index of subsequent items by 1)
tree.removeAttr(1);
tree.removeAttr(2);

// Get index
tree.indexOf('C') //-> 0

```

Methods
---

#### insert(item)
> Inserts the item into the tree. Returns true if inserted, false if duplicate.

#### remove(item)
> Removes the item from the tree. Returns true if removed, false if not found.

#### size
> Number of nodes in the tree.

#### clear()
> Removes all nodes from the tree.

#### find(item)
> Returns node data if found, null otherwise.

#### findIter(item)
> Returns an iterator to the node if found, null otherwise.

#### lowerBound(item)
> Returns an interator to the tree node at or immediately after the item. Returns null-iterator if tree is empty.
>> __NOTE: Changed in version 1.0.0 to match C++ lower_bound__

#### upperBound(item)
> Returns an interator to the tree node immediately after the item. Returns null-iterator if tree is empty.
>> __NOTE: Changed in version 1.0.0 to match C++ upper_bound__

#### min()
> Returns the min node data in the tree, or null if the tree is empty.

#### max()
> Returns the max node data in the tree, or null if the tree is empty.

#### each(f)
> Calls f on each node's data, in order.

#### reach(f)
> Calls f on each node's data, in reverse order.

#### iterator()
> Returns a null-iterator. See __Iterators__ section below.

Iterators
---

tree.iterator() will return a null-iterator. On a null iterator,
* next() will return the first element in the tree
* prev() will return the last element in the tree

Otherwise,
* next() will return the next element
* prev() will return the previous element
* data() will return the node the iterator is pointing to

When iteration reaches the end, the iterator becomes a null-iterator again.

Forward iteration example:

```javascript
var it=tree.iterator(), item;
while((item = it.next()) !== null) {
    // do stuff with item
}
```

If you are iterating forward through the tree, you can always call prev() to go back, and vice versa.

__NOTE:__ iterators become invalid when you add or remove elements from the tree.
