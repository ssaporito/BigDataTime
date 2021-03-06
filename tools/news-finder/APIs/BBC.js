var jsdom = require("jsdom");
// var runAPI = require('../Util/runAPI');

/**
* Get the all the news urls
* @param {string} query - The query to be searched
* @param {number} page - The page number of the news website to search (min value = 1)
* @param {function} callback - The function to be called when it has finished
*/
var getAllNewsUrls = function(query, page, callback) {
    var url = 'http://www.bbc.co.uk/search?q=' + query + '&page=' + page + '&filter=news';

    jsdom.env(
        url, ["http://code.jquery.com/jquery.js"],
        function(err, window) {
            if (!err && typeof(window.$) === 'function') {
                var urls = [];
                var link_tags = window.$(".results h1 a").each(function() {
                    if (this.href.lastIndexOf('/technology-') > -1 ||
                        this.href.lastIndexOf('/magazine-') > -1) {
                        urls.push(this.href);
                    }
                });
                if (window) window.close();
                callback(err, urls);
            } else {
                callback(err, []);
            }
        }
    );
};

/**
* Get the content and the data of a url
* @param {string} url - The news url
* @param {function} callback - The function to be called when it has finished
*/
var getContent = function(url, callback) {
	/**
	* Callback
	* @param {Error} err - The error
	* @param {content_obj} content - The content object
	*/
    jsdom.env(
        url, ["http://code.jquery.com/jquery.js"],
        function(err, window) {
        	/**
        	* Content object
        	* @typedef {object} content_obj
        	* @property {string} text - The news text
        	* @property {string} date - The date (YYYY-MM-DD)
        	*/
            if (!err && typeof(window.$) === 'function') {
                try {
                    var content = {};
                    content.text = '';
                    content.date = '';
                    content.text = window.$(".story-body .story-body__inner p").text();

                    var date_str = window.$(".mini-info-list__item .date").text();

                    try {
                        content.date = new Date(date_str).toISOString().substring(0, 10);
                    } catch (e) {
                        err = 'Could not get the Date';
                    }

                    if (window) window.close();
                    callback(err, content);
                } catch (err) {
                    if (window) window.close();
                    callback('Could not get the content', {});
                }
            } else {
                callback(err, {});
            }
        }
    );
};

// getAllNewsUrls('bitcoin', 1, function(err, urls){
//     console.log(urls);
// });

// getContent('http://www.bbc.com/news/technology-22110345', function(err, content) {
//     console.log(content.date);
// });

// runAPI(getAllNewsUrls, getContent, 'BBC');

module.exports = {
    getAllNewsUrls: getAllNewsUrls,
    getContent: getContent
};
