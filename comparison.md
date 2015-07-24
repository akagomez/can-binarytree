### can.List.filter():

Operation | Best | Worst | Avg | Comments
---|---|---|---|---
Insert | O(n) | O(n) | O(n)
Remove | O(n) | O(n) | O(n)
Splice | O(n) | O(n) | O(n)

### can.RedBlackTree.filter():

Operation | Best | Worst | Avg | Comments
---|---|---|---|---
Insert | O(log(n)) | O(log(n)) | O(log(n))
Remove | O(log(n)) | O(log(n)) | O(log(n))
Splice | O(n) | O(n) | O(n) | O(n) due to 1) Avoiding duplicate values in tree, 2) Predicate function's dependency on the source index <br/> `s.filter(function (item, index) { ... })`

**Notes:**

This implementation handles holey arrays naturally.

### can.RedBlackTreeList.filter():

Operation | Best | Worst | Avg | Comments
---|---|---|---|---
Insert | O(log^2(n)) | O(n) | O(log^2(n)) | O(n) due to "holey" arrays: <br/>`var a = []; a[2] = 'C'; // a => [undefined, undefined, C]`
Remove | O(log^2(n)) | O(log^2(n)) | O(log^2(n))
Splice | O(log^2(n)) | O(n) | O(log^2(n)) | O(n) due to predicate function's dependency on the source index <br/> `s.filter(function (item, index) { ... })`

**Notes:**

Holey arrays make this implementation highly space inneficient. For each "gap" index a new node is being created to represent that index for future comparisons. A more efficient way to represent the gap would be to include an `offset` on the node with the `leftCount`. For instance:

```
tree.set(2, 'C'); // -> [C - lc: 0, offset: 2]
```

The trick would then be to update the `offset` if an add/remove occurs at a position less than that `leftCount` + `offset` (index). It wouldn't be as fast as O(log^2(n)), but it would be better than O(n).