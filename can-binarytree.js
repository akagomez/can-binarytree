var RBTreeList = require('./rbtreelist/rbtreelist');

if (typeof window !== 'undefined' && !require.resolve && window.can) {
    window.can.RBTreeList = RBTreeList;
}

module.exports = {
    RBTreeList: RBTreeList
};

