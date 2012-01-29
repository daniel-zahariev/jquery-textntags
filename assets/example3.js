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
                { id:1, name:'Daniel Zahariev', 'img':'http://profile.ak.fbcdn.net/hprofile-ak-snc4/174073_1704423938_6732585_q.jpg', 'type':'contact' },
                { id:2, name:'Petar Atanasov',  'img':'http://profile.ak.fbcdn.net/hprofile-ak-snc4/161443_100002096378713_348648_q.jpg', 'type':'contact' },
                { id:3, name:'Dinko Tanev',     'img':'http://profile.ak.fbcdn.net/hprofile-ak-snc4/211388_786209857_4725069_q.jpg', 'type':'contact' }
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