'use strict';

module.exports.response = function(res, data, statusCode) {
    res.header("Access-Control-Allow-Origin", "*");
    res.status(statusCode || 500)
    res.json(data)
    res.end()
};