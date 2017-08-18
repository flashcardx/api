const xssFilters = require('xss-filters');

function purify(input){
    return xssFilters.inHTMLData(input);
}

module.exports = {
    purify: purify
}