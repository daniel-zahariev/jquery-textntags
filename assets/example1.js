$(function () {
    $('textarea.tagged_text_ex1').textntags({
        triggers: {'@': {uniqueTags: false}},
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
    })
    .bind('tagsAdded.textntags', function (e, addedTagsList) { console.log('tagsAdded:' + JSON.stringify(addedTagsList)); })
    .bind('tagsRemoved.textntags', function (e, removedTagsList) { console.log('tagsRemoved:' + JSON.stringify(removedTagsList)); });
    
    

    $('.get-syntax-text').click(function() {
        $('textarea.tagged_text_ex1').textntags('val', function(text) {
            alert(text);
        });
    });

    $('.get-tags').click(function() {
        $('textarea.tagged_text_ex1').textntags('getTags', function(data) {
            alert(JSON.stringify(data));
        });
    });

    $('.get-tags-map').click(function() {
        $('textarea.tagged_text_ex1').textntags('getTagsMap', function(data) {
            alert(JSON.stringify(data));
        });
    });

    $('.get-copy-tags').click(function() {
        $('textarea.tagged_text_ex1').textntags('val', function(text) {
            $('textarea.tagged_text_ex2').textntags('val', text);
        });
    });
});