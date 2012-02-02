$(function () {
    $('textarea.tagged_text_ex3').textntags({
        triggers: {'@': {
            uniqueTags   : false,
            syntax       : _.template('@[<%= title %>](<%= type %>:<%= id %>)'),
            parser       : /(@)\[([\w\s@\.,-\/#!$%\^&\*;:{}=\-_`~()]+)\]\(([\w\s\.\-]+):(\d+)\)/gi,
            parserGroups : {id: 4, type: 3, title: 2},
        }},
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
    
    

    $('.get-syntax-text3').click(function() {
        $('textarea.tagged_text_ex3').textntags('val', function(text) {
            alert(text);
        });
    });
});