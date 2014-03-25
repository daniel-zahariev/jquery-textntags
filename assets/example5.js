$(function () {
    if(!console) {
        var console = {log: function (data) {
            alert(data);
        }};
    }

    $('textarea.tagged_text_ex5').textntags({
        triggers: {'@': {uniqueTags: false}},
        onDataRequest:function (mode, query, triggerChar, callback) {
            var data = [
                { id:1, name:'Daniel Zahariev',  'img':'http://example.com/img1.jpg', 'type':'contact' },
                { id:2, name:'Daniel Radcliffe', 'img':'http://example.com/img2.jpg', 'type':'contact' },
                { id:3, name:'Daniel Nathans',   'img':'http://example.com/img3.jpg', 'type':'contact' }
            ];

            query = query.toLowerCase();
            var found = _.filter(data, function(item) { return item.name.toLowerCase().indexOf(query) > -1; });

            callback.call(this, found);
        }
    });
});