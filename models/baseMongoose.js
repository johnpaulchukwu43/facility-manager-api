/*
 Created by Johnpaul Chukwu @ $
*/
const mongoose = require('mongoose');
const elasticSearchUrl = require('../config/secret').elasticSearchUrl;
const mongoosastic = require('mongoosastic');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
const mongoosePaginate = require('mongoose-paginate');

mongoose.plugin(mongoosePaginate);
mongoose.plugin(mongooseAggregatePaginate);
mongoose.plugin(mongoosastic,{
    hosts:[elasticSearchUrl]
});

module.exports = mongoose;
