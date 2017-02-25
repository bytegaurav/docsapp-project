//in memory queue


module.exports = function () {
    var Queue = {};
    return {
        get: function (key) { return Queue[key]; },
        set: function (key, val) { Queue[key] = val; },
        delete: function(key){ delete Queue[key]}
    }
}();


