const mongoose = require('./baseMongoose');
mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const reviewSchema = new Schema ({
    userEmail: { type: String, required: true } ,
    category: { type: String, required: true },
    productID: { type: String, required: true },
    review: { type: String, required: true },
    numberOfStars: {type: String, required: true},
    createdAt: { type: Date, default: Date.now }
});



module.exports = mongoose.model('review', reviewSchema);
