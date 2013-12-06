module.exports = {
    'onBeforeExit': function (api) {
        var result = api.getResultObject();

        function getScripts() {
            function filterOutGardr(v) {
                return !!v && !!v.trim() && v.indexOf("banner.start();") !== 0;
            }

            function mapContent(tag) {
                return tag.innerHTML;
            }

            var tags = Array.prototype.slice.call(document.body.querySelectorAll('script'));

            return tags.map(mapContent).filter(filterOutGardr);
        }


        function getCodeAttributes(){
            var all = Array.prototype.slice.call(document.body.getElementsByTagName('*'));

            var result = [];

            var attributesToCheckFor = [
                'onload', 'onreadystatechange',
                'onclick',
                'onblur', 'onchange', 'onfocus',
                'onmouseover', 'onmouseout', 'onmouseenter', 'onmouseleave', 'onmouseup', 'onmousewheel',
                'onresize', 'onscroll',
                'onsubmit',
                'onunload'
            ];

            all.forEach(function(el){
                
                var matches = attributesToCheckFor.filter(function(key){
                    return el.hasAttribute(key);
                });

                if (matches.length > 0){
                    result.push({
                        tag: el.tagName,
                        matches: matches.map(function(key){
                            var attr = el.getAttribute(key);
                            return {
                                key: key,
                                value: attr && attr.toString()
                            };
                        })
                    });
                }
                
            });

            return result;
        }

        api.switchToIframe();
        result.frameScriptTags = api.evaluate(getScripts);
        result.frameScriptAttributes = api.evaluate(getCodeAttributes);
    }
};
