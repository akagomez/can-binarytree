/*can-binarytree@0.0.7#can-binarytree*/
var RBTreeList = require('./rbtreelist/rbtreelist.js');
if (typeof window !== 'undefined' && !require.resolve && window.can) {
    window.can.RBTreeList = RBTreeList;
}
module.exports = { RBTreeList: RBTreeList };