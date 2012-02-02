$(function () {
    $('textarea.tagged_text_ex4').textntags({
        triggers: {'!': {
            uniqueTags   : false,
            syntax       : _.template('![<%= id %>:<%= type %>:<%= title %>]'),
            parser       : /(!)\[(\d+):([\w\s\.\-]+):([\w\s@\.,-\/#!$%\^&\*;:{}=\-_`~()]+)\]/gi,
            parserGroups : {id: 2, type: 3, title: 4},
        }, '#': {
            uniqueTags   : false,
            syntax       : _.template('#[<%= id %>:<%= type %>:<%= title %>]'),
            parser       : /(#)\[(\d+):([\w\s\.\-]+):([\w\s@\.,-\/#!$%\^&\*;:{}=\-_`~()]+)\]/gi,
            parserGroups : {id: 2, type: 3, title: 4},
        }, 'PP:': {
            uniqueTags   : false,
            syntax       : _.template('PP:[<%= id %>:<%= type %>:<%= title %>]'),
            parser       : /(PP:)\[(\d+):([\w\s\.\-]+):([\w\s@\.,-\/#!$%\^&\*;:{}=\-_`~()]+)\]/gi,
            parserGroups : {id: 2, type: 3, title: 4},
        }},
        onDataRequest:function (mode, query, triggerChar, callback) {
            var data = {
                '!': [
                    { id:1, name:'Daniel Zahariev (via !)',   'img':'http://example.com/img1.jpg', 'type':'contact1' },
                    { id:2, name:'Daniel Radcliffe (via !)',  'img':'http://example.com/img2.jpg', 'type':'contact1' },
                    { id:3, name:'Daniel Nathans (via !)',    'img':'http://example.com/img3.jpg', 'type':'contact1' }
                ],
                '#': [
                    { id:4, name:'Daniel Zahariev (via #)',  'img':'http://example.com/img1.jpg', 'type':'contact2' },
                    { id:5, name:'Daniel Radcliffe (via #)', 'img':'http://example.com/img2.jpg', 'type':'contact2' },
                    { id:6, name:'Daniel Nathans (via #)',   'img':'http://example.com/img3.jpg', 'type':'contact2' }
                ],
                'PP:': [
                    { id:7, name:'Daniel Zahariev (via PP:)',  'img':'http://example.com/img1.jpg', 'type':'contact3' },
                    { id:8, name:'Daniel Radcliffe (via PP:)', 'img':'http://example.com/img2.jpg', 'type':'contact3' },
                    { id:9, name:'Daniel Nathans (via PP:)',   'img':'http://example.com/img3.jpg', 'type':'contact3' }
                ]
            };

            query = query.toLowerCase();
            var found = _.filter(data[triggerChar], function(item) { return item.name.toLowerCase().indexOf(query) > -1; });

            callback.call(this, found);
        }
    });
    
    

    $('.get-syntax-text4').click(function() {
        $('textarea.tagged_text_ex4').textntags('val', function(text) {
            alert(text);
            console.log(text);
        });
    });
});