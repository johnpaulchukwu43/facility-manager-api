/*
 Created by Johnpaul Chukwu @ $
*/
function queryByPriceRange(param){
    return {
        'price': {
            $lte : parseInt(param.maxPrice),
            $gte : parseInt(param.minPrice)
        }
    };
}

function getProductInStock(){
    return {
        'quantity':{$gt:0}
    }
}

function getProductBeloningToActiveProviders(){
    return{
        'providerStatus':'ACTIVE'
    }
}

function byColorRange(colorRange){
    return {
        'colors':{
            $in:colorRange
        }
    };
}

function byBrandRange(brandRange){
    return {
        'brand':{
            $in:brandRange
        }
    };
}

const byStatusIn = (statuses) =>{
  return {'status':{$in:statuses}}
};


module.exports = {
    queryByPriceRange,
    byColorRange,
    byBrandRange,
    getProductInStock,
    byStatusIn,
    getProductBeloningToActiveProviders

};
