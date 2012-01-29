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
                    { id:1, name:'Daniel Zahariev (via !)', 'img':'http://profile.ak.fbcdn.net/hprofile-ak-snc4/174073_1704423938_6732585_q.jpg', 'type':'contact1' },
                    { id:2, name:'Petar Atanasov (via !)',  'img':'http://profile.ak.fbcdn.net/hprofile-ak-snc4/161443_100002096378713_348648_q.jpg', 'type':'contact1' },
                    { id:3, name:'Dinko Tanev (via !)',     'img':'http://profile.ak.fbcdn.net/hprofile-ak-snc4/211388_786209857_4725069_q.jpg', 'type':'contact1' }
                ],
                '#': [
                    { id:4, name:'Daniel Zahariev (via #)', 'img':'http://profile.ak.fbcdn.net/hprofile-ak-snc4/174073_1704423938_6732585_q.jpg', 'type':'contact2' },
                    { id:5, name:'Petar Atanasov (via #)',  'img':'http://profile.ak.fbcdn.net/hprofile-ak-snc4/161443_100002096378713_348648_q.jpg', 'type':'contact2' },
                    { id:6, name:'Dinko Tanev (via #)',     'img':'http://profile.ak.fbcdn.net/hprofile-ak-snc4/211388_786209857_4725069_q.jpg', 'type':'contact2' }
                ],
                'PP:': [
                    { id:7, name:'Daniel Zahariev (via PP:)', 'img':'http://profile.ak.fbcdn.net/hprofile-ak-snc4/174073_1704423938_6732585_q.jpg', 'type':'contact3' },
                    { id:8, name:'Petar Atanasov (via PP:)',  'img':'http://profile.ak.fbcdn.net/hprofile-ak-snc4/161443_100002096378713_348648_q.jpg', 'type':'contact3' },
                    { id:9, name:'Dinko Tanev (via PP:)',     'img':'http://profile.ak.fbcdn.net/hprofile-ak-snc4/211388_786209857_4725069_q.jpg', 'type':'contact3' }
                ]
            };

            query = query.toLowerCase();
            var found = _.filter(data[triggerChar], function(item) { return item.name.toLowerCase().indexOf(query) > -1; });

            callback.call(this, found);
        }
    });
});