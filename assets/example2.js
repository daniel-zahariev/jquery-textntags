$(function () {
    $('textarea.tagged_text_ex2').textntags({
        onDataRequest:function (mode, query, triggerChar, callback) {
            $.getJSON('assets/data.json', function(responseData) {
                responseData = _.filter(responseData, function(item) { return item.name.toLowerCase().indexOf(query.toLowerCase()) > -1 });
                callback.call(this, responseData);
            });
        }
    });
});