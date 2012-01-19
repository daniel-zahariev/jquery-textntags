/*
 * Text'N'Tags (textntags)
 * Version 1.0
 * Written by: Daniel Zahariev
 * Credit: 
 *      Most of the code structure is taken from Podio's
 *      Mentions Input jQuery plugin (http://podio.github.com/jquery-mentions-input/).
 *      However some of the core concepts are different.
 *
 * Using underscore.js
 *
 * License: MIT License - http://www.opensource.org/licenses/mit-license.php
 */

(function ($, _, undefined) {

    // Keys "enum"
    var KEY = { BACKSPACE : 8, TAB : 9, RETURN : 13, ESC : 27, LEFT : 37, UP : 38, RIGHT : 39, DOWN : 40, COMMA : 188, SPACE : 32, HOME : 36, END : 35, 'DELETE': 46 };
    var defaultSettings = {
        onDataRequest   : $.noop,
        realValOnSubmit : true,
        triggers        : {'@' : {}},
        templates       : {
            wrapper           : _.template('<div class="textntags-wrapper"></div>'),
            beautifier        : _.template('<div class="textntags-beautifier"><div></div></div>'),
            tagHighlight      : _.template('<strong class="<%= class_name %>"><span>$<%= idx %></span></strong>'),
            tagList           : _.template('<div class="textntags-tag-list"></div>'),
            tagsListItem      : _.template('<li><%= title %></li>'),
            tagsListItemImage : _.template('<img src="<%= img %>" />'),
            tagsListItemIcon  : _.template('<div class="icon <%= no_img_class %>"></div>')
        }
    };
    var trigger_defaults = {
        minChars        : 2,
        uniqueTags      : true,
        showImageOrIcon : true,
        keys_map        : {id: 'id', title: 'name', description: '', img: 'avatar', no_img_class: 'icon', type: 'type'},
        syntax          : _.template('@[[<%= id %>:<%= type %>:<%= title %>]]'),
        parser          : /(@)\[\[(\d+):([\w\s\.\-]+):([\w\s@\.,-\/#!$%\^&\*;:{}=\-_`~()]+)\]\]/gi,
        parserGroups    : {id: 2, type: 3, title: 4},
        // syntax          : _.template('@[<%= title %>](<%= type %>:<%= id %>)'),
        // parser          : /(@)\[([\w\s]+)\]\(([\w\s]+):(\d+)\)/gi,
        // parserGroups    : {id: 4, type: 3, title: 2},
        classes         : {
            tagsDropDown      : '',
            tagActiveDropDown : 'active',
            tagHighlight      : ''
        }
    };
    
    function transformObjectPropertiesFn(keys_map) {
        return function (obj, localToPublic) {
            var new_obj = {};
            if (localToPublic) {
                _.each(keys_map, function (v, k) { new_obj[v] = obj[k]; });
            } else {
                _.each(keys_map, function (v, k) { new_obj[k] = obj[v]; });
            }
            return new_obj;
        };
    }
    var transformObjectProperties = _.memoize(transformObjectPropertiesFn);
    
    var utils = {
        htmlEncode: function (str) {
            return _.escape(str);
        },
        highlightTerm: function (value, term) {
            if (!term && !term.length) {
                return value;
            }
            return value.replace(new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + term + ")(?![^<>]*>)(?![^&;]+;)", "gi"), "<b>$1</b>");
        },
        setCaratPosition: function (domNode, caretPos) {
            if (domNode.createTextRange) {
                var range = domNode.createTextRange();
                range.move('character', caretPos);
                range.select();
            } else {
                if (domNode.selectionStart) {
                    domNode.focus();
                    domNode.setSelectionRange(caretPos, caretPos);
                } else {
                    domNode.focus();
                }
            }
        }
    };
    
    var TextNTags = function (editor) {
        var settings = null, templates;
        var elContainer, elEditor, elBeautifier, elTagList, elTagListItemActive;
        var tagsCollection;
        var currentTriggerChar, currentDataQuery;
        var editorSelectionLength = 0, editorTextLength = 0, editorKeyCode = 0;
        
        function setSettings (options) {
            if (settings != null) {
                return false;
            }
            
            settings = $.extend(true, {}, defaultSettings, options);
            _.each(settings.triggers, function (val, key) {
                settings.triggers[key] = $.extend(true, {}, trigger_defaults, val);
            });
            
            templates = settings.templates;
            
            return true;
        }
        
        function initTextarea () {
            elEditor = $(editor).bind({
                keydown:  onEditorKeyDown,
                keypress: onEditorKeyPress,
                input:    onEditorInput,
                blur:     onEditorBlur
            });

            elContainer = elEditor.wrapAll($(templates.wrapper())).parent();
            
            if (settings.realValOnSubmit) {
                elEditor.closest('form').bind('submit.textntags', function (event) {
                    elContainer.css('visibility', 'hidden');
                    elEditor.val(getTaggedText());
                });
            }
        }
        
        function initTagList () {
            elTagList = $(templates.tagList());
            elTagList.appendTo(elContainer);
            elTagList.delegate('li', 'click', onTagListItemClick);
        }
        
        function initBeautifier () {
            elBeautifier = $(templates.beautifier());
            elBeautifier.prependTo(elContainer);
        }
        
        function initState () {
            var text_with_tags = getEditorValue(), initialState = parseTaggedText(text_with_tags);
            tagsCollection = initialState.tagsCollection;
            elEditor.val(initialState.plain_text);
            updateBeautifier();
        }
        
        function getEditorValue () {
            return elEditor.val();
        }
        
        function getBeautifiedText (tagged_text) {
            var beautified_text = tagged_text || getTaggedText();

            _.each(settings.triggers, function (trigger) {
                var markup = templates.tagHighlight({idx: trigger.parserGroups.title, class_name: trigger.classes.tagHighlight});
                beautified_text = beautified_text.replace(trigger.parser, markup);
            });
            
            beautified_text = beautified_text.replace(/\n/g, '<br />&shy;');
            beautified_text = beautified_text.replace(/ {2}/g, '&nbsp; ');
            
            return beautified_text + '&shy;';
        }
        
        function getTaggedText() {
            var plain_text = getEditorValue(),
                position = 0, tagged_text, triggers = settings.triggers;

            tagged_text = _.map(tagsCollection, function (tagPos) {
                var diff_pos = tagPos[0] - position,
                    diff_text = diff_pos > 0 ? plain_text.substr(position, diff_pos) : '',
                    objPropTransformer = transformObjectProperties(triggers[tagPos[2]].keys_map),
                    tagText = triggers[tagPos[2]].syntax(objPropTransformer(tagPos[3], false));
                
                position = tagPos[0] + tagPos[1];
                return diff_text + tagText;
            });
            
            return tagged_text.join('') + plain_text.substr(position);
        }
        
        // it's ready for export
        function parseTaggedText (tagged_text) {
            if (_.isString(tagged_text) == false) {
                return null;
            } 
            var plain_text = '' + tagged_text, tagsColl = [], triggers = settings.triggers;
            
            _.each(triggers, function (opts, tchar) {
                var parts = tagged_text.split(opts.parser),
                    idx = 0, pos = 0, len = parts.length,
                    found_tag, found_len, part_len,
                    max_group = _.max(opts.parserGroups);

                while (idx < len) {
                    if (parts[idx] == tchar) {
                        found_tag = {};
                        _.each(opts.parserGroups, function (v, k) {
                            found_tag[opts.keys_map[k]] = parts[idx + v - 1];
                            if (k == 'title') {
                                found_len = parts[idx + v - 1].length;
                            }
                        });
                        tagsColl.push([pos, found_len, tchar, found_tag]);
                        part_len = found_len;
                        idx += max_group;
                    } else {
                        part_len = parts[idx].length;
                        idx += 1;
                    }
                    pos += part_len;
                }
            });
            
            tagsColl = _.sortBy(tagsColl, function (tagPos) { return tagPos[0]; });
            
            _.each(triggers, function (opts, tchar) {
                plain_text = plain_text.replace(opts.parser, '$' + opts.parserGroups.title);
            });
            
            return {
                plain_text: plain_text,
                tagged_text: tagged_text,
                tagsCollection: tagsColl
            };
        }
        
        function updateBeautifier (shadow) {
            elBeautifier.find('div').html(getBeautifiedText());
            elEditor.css('height', elBeautifier.outerHeight() + 'px');
        }
        
        function onEditorKeyPress (e) {
            if (e.keyCode == KEY.RETURN) {
                updateBeautifier(elEditor.val());
            }
        }
        
        function onEditorInput (e) {
            if (editorSelectionLength > 0) {
                // delete of selection occured
                var sStart = elEditor[0].selectionStart,
                    selectionLength = editorSelectionLength,
                    sEnd = sStart + selectionLength,
                    tags_shift_positions = elEditor.val().length - editorTextLength;
                
                removeTagsInRange(sStart, sEnd);
                shiftTagsPosition(sEnd, tags_shift_positions);
            } else if (editorKeyCode != KEY.BACKSPACE && editorKeyCode != KEY['DELETE']) {
                // char input - shift with 1
                var sStart = elEditor[0].selectionStart;
                shiftTagsPosition(sStart, 1);
                removeTagsInRange(sStart, sStart + 1);
            }
            
            updateBeautifier();
            
            checkForTrigger(1);
        }
        
        function checkForTrigger(look_ahead) {
            var sStart = elEditor[0].selectionStart,
                look_ahead = look_ahead ? look_ahead : 0,
                left_text = elEditor.val().substr(0, sStart + look_ahead),
                found_trigger, found_trigger_char = null, query;
            
            if (!left_text || !left_text.length) {
                return;
            }
            
            found_trigger = _.find(settings.triggers, function (trigger, tchar) {
                var tester = new RegExp(tchar + '\\w+(\\s+\\w+)?\\s?$', 'gi'),
                    matches = left_text.match(tester);
                if (matches) {
                    found_trigger_char = tchar;
                    query = matches[0].substr(1);
                    return true;
                }
                return false;
            });
            
            if (!found_trigger_char || query.length < found_trigger.minChars) {
                hideTagList();
            } else {
                currentDataQuery = query;
                currentTriggerChar = found_trigger_char;
                _.defer(_.bind(searchTags, this, currentDataQuery, found_trigger_char));
            }
        }
        
        function onEditorKeyDown (e) {
            var keys = KEY, // store in local var for faster lookup
                sStart = elEditor[0].selectionStart,
                sEnd = elEditor[0].selectionEnd,
                plain_text = elEditor.val();
            
            editorSelectionLength = sEnd - sStart;
            editorTextLength = plain_text.length;
            editorKeyCode = e.keyCode;

            switch (e.keyCode) {
                case keys.UP:
                case keys.DOWN:
                    if (!elTagList.is(':visible')) {
                        return true;
                    }
                    
                    var elCurrentTagListItem = null;
                    if (e.keyCode == keys.DOWN) {
                        if (elTagListItemActive && elTagListItemActive.length) {
                            elCurrentTagListItem = elTagListItemActive.next();
                        } else {
                            elCurrentTagListItem = elTagList.find('li').first();
                        }
                    } else {
                        if (elTagListItemActive && elTagListItemActive.length) {
                            elCurrentTagListItem = elTagListItemActive.prev();
                        } else {
                            elCurrentTagListItem = elTagList.find('li').last();
                        }
                    }

                    selectTagListItem(elCurrentTagListItem, settings.triggers[currentTriggerChar].classes.tagActiveDropDown);
                    return false;

                case keys.RETURN:
                case keys.TAB:
                    if (elTagListItemActive && elTagListItemActive.length) {
                        elTagListItemActive.click();
                        return false;
                    }
                    return true;

                case keys.BACKSPACE:
                case keys['DELETE']:
                    if (e.keyCode == keys.BACKSPACE && sStart == sEnd && sStart > 0) {
                        sStart -= 1;
                    }
                    if(sEnd > sStart) {
                        removeTagsInRange(sStart, sEnd);
                        shiftTagsPosition(sEnd, sStart - sEnd);
                    }
                    return true;

                case keys.LEFT:
                case keys.RIGHT:
                case keys.HOME:
                case keys.END:
                    _.defer(function () { checkForTrigger.call(this) });
                    break;
            }

            return true;
        }
        
        function onEditorBlur (e) {
            hideTagList();
        }
        
        function hideTagList () {
            elTagListItemActive = null;
            elTagList.hide().empty();
        }
        
        function onTagListItemClick (e) {
            addTag($(this).data('tag'));
            return false;
        }
        
        function removeTagsInRange (start, end) {
            var removedTags = [];
            tagsCollection = _.filter(tagsCollection, function (tagPos) {
                var s = tagPos[0], e = s + tagPos[1],
                    inRange = ((s >= start && s < end) || (e > start && e <= end) || (s < start && e > end));
                if (inRange) {
                    removedTags.push(tagPos[3]);
                }
                return !inRange;
            });
            
            if (removedTags.length > 0) {
                elEditor.trigger('tagsRemoved.textntags', [removedTags]);
            }
        }
        
        function shiftTagsPosition (afterPosition, position_shift) {
            tagsCollection = _.map(tagsCollection, function (tagPos) {
                if (tagPos[0] >= afterPosition) {
                    tagPos[0] += position_shift;
                }
                return tagPos;
            });
        }
        
        function addTag (tag) {
            var trigger = settings.triggers[currentTriggerChar],
                objPropTransformer = transformObjectProperties(trigger.keys_map),
                localTag = objPropTransformer(tag, false),
                plain_text = getEditorValue(),
                sStart = elEditor[0].selectionStart,
                tagStart = sStart - currentTriggerChar.length - currentDataQuery.length,
                newCaretPosition = tagStart + localTag.title.length,
                left_text = plain_text.substr(0, tagStart),
                right_text = plain_text.substr(sStart),
                new_text = left_text + localTag.title + right_text;
            
            // explicitly convert to string for comparisons later
            tag[trigger.keys_map.id] = '' + tag[trigger.keys_map.id];
            
            tagsCollection.push([tagStart, localTag.title.length, currentTriggerChar, tag]);
            
            currentTriggerChar = '';
            currentDataQuery = '';
            hideTagList();
            
            elEditor.val(new_text);
            updateBeautifier();

            elEditor.focus();
            utils.setCaratPosition(elEditor[0], newCaretPosition);
            
            elEditor.trigger('tagsAdded.textntags', [[tag]]);
        }
        
        function selectTagListItem (tagItem, class_name) {
            if (tagItem && tagItem.length) {
                tagItem.addClass(class_name);
                tagItem.siblings().removeClass(class_name);
                elTagListItemActive = tagItem;
            } else {
                elTagListItemActive.removeClass(class_name);
                elTagListItemActive = null;
            }
        }
        
        function populateTagList (query, triggerChar, results) {
            var trigger = settings.triggers[triggerChar];
            
            if (trigger.uniqueTags) {
                // Filter items that has already been mentioned
                var id_key = trigger.keys_map.id, tagIds = _.map(tagsCollection, function (tagPos) { return tagPos[3][id_key]; });
                results = _.reject(results, function (item) {
                    // converting to string ids
                    return _.include(tagIds, '' + item[id_key]);
                });
            }

            if (!results.length) {
                return;
            }

            var tagsDropDown = $("<ul />").addClass(trigger.classes.tagsDropDown).appendTo(elTagList),
                imgOrIconTpl = trigger.showImageOrIcon ? templates.tagsListItemImage : templates.tagsListItemIcon,
                objPropTransformer = transformObjectProperties(trigger.keys_map);

            _.each(results, function (tag, index) {
                var tagItem, localTag = objPropTransformer(tag, false);
                localTag.title = utils.highlightTerm(utils.htmlEncode((localTag.title)), query);
                tagItem = $(templates.tagsListItem(localTag)).data('tag', tag);
                tagItem = tagItem.prepend(imgOrIconTpl(localTag)).appendTo(tagsDropDown);

                if (index === 0) { 
                    selectTagListItem(tagItem, trigger.classes.tagActiveDropDown);
                }
            });

            elTagList.show();
        }
        
        function searchTags (query, triggerChar) {
            hideTagList();
            settings.onDataRequest.call(this, 'search', query, triggerChar, function (responseData) {
                populateTagList(query, triggerChar, responseData);
            });
        }
        
        // Public methods
        return {
            init : function (options) {
                if (setSettings(options)) {
                    initTextarea();
                    initTagList();
                    initBeautifier();
                    initState();
                }
            },
            val : function (callback) {
                if (!_.isFunction(callback)) {
                    return;
                }

                var value = tagsCollection.length ? getTaggedText() : getEditorValue();
                callback.call(this, value);
            },
            reset : function () {
                elEditor.val('');
                tagsCollection = [];
                updateValues();
            },
            getTags : function (callback) {
                if (!_.isFunction(callback)) {
                    return;
                }
                var tags = _.map(tagsCollection, function (tagPos) { return tagPos[3]; });

                callback.call(this, _.uniq(tags));
            },
            getTagsMap : function (callback) {
                if (!_.isFunction(callback)) {
                    return;
                }

                callback.call(this, tagsCollection);
            },
            parseTaggedText: function (tagged_text, callback) {
                if (!_.isFunction(callback)) {
                    return;
                }
                
                callback.call(this, parseTaggedText(tagged_text));
            }
        };
    };
    
    $.fn.textntags = function (methodOrSettings) {
        var outerArguments = arguments;

        return this.each(function () {
            var ms = methodOrSettings, instance = $.data(this, 'textntags') || $.data(this, 'textntags', new TextNTags(this));

            if (_.isFunction(instance[ms])) {
                return instance[method].apply(this, Array.prototype.slice.call(outerArguments, 1));
            } else if (typeof ms === 'object' || !ms) {
                return instance.init.call(this, ms);
            } else {
                $.error('Method ' + ms + ' does not exist');
            }
        });
    };

})(jQuery, _);