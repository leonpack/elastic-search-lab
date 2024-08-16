const elasticsearch = require('elasticsearch')
const client = new elasticsearch.Client({
    host: 'localhost:9200'
})

client.ping({
    requestTimeout: 3000,
}, (err, res, sta) => {
    if(err) {
        return console.error(`Error connect:::`, err);
    }
    console.log(`isOkay::: connect`);
})

module.exports = client;