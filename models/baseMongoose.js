/*
 Created by Johnpaul Chukwu @ $
*/
const mongoose = require('mongoose');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
const mongoosePaginate = require('mongoose-paginate');

mongoose.plugin(mongoosePaginate);
mongoose.plugin(mongooseAggregatePaginate);

module.exports = mongoose;
