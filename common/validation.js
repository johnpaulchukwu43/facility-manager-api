/*
 Created by Johnpaul Chukwu @ $


*/

const isArray = require("./util").isArray;
const isString = require("./util").isString;
import {SYSTEM_STATUS} from "../common/constants";


const order_fields = ['ASC', 'DESC'];
const sortable_fields = ['name', 'createdAt', 'productCode', 'price'];
const MAX_PRICE_MISSING = "Min price specified but no max price";
const MIN_PRICE_MISSING = "Max price specified but no min price";
const MAX_PAGE_SIZE_LIMIT = 'Invalid Page Size: size must not be greater than 60';
const INVALID_PRICE_RANGE = "Min price must be less than or equal to max price";
const UNKNOWN_SORT_OPTION ='Unknown SortBy option ';
const UNKNOWN_ORDER_OPTION ='Unknown Order option ';



var thereIsNoError =true;

function checkBaseServerRequest(req, res) {
    if (!req.body.name) {
        res.status(400).json({success: false, message: 'Product Name is required'});
    }
    else {
        if (!req.body.price) {
            res.status(400).json({success: false, message: 'Price of the product is required'});
        } else {
            if (!req.body.description) {
                res.status(400).json({success: false, message: 'Description of the product is required'});
            } else {
                if (!req.body.quantity) {
                    res.status(400).json({success: false, message: 'Quantity of available product is required'});
                } else {
                        if (!req.body.colors) {
                            res.status(400).json({success: false, message: 'Color is required'});
                        } else {
                            if (!req.body.imageUrls) {
                                res.status(400).json({
                                    success: false,
                                    message: 'Image URL is required'
                                });
                            } else {
                                return true;
                            }

                        }
                }
            }
        }

    }
}

function validQueryParameters(req, res) {
        /*
        gymnastics done to catch all possible invalid query paarmeters that might be passed
        and halt the operation immediately :)
        */
        thereIsNoError =true;
        var pageNum = validatePageNum(req.query.pageNum,res);
        var pageSize = validatePageSize(parseInt(req.query.pageSize),res);
        var sortBy = validateSortBy(req.query.sortBy,res);
        var order = validateOrder(req.query.order,res);
        var priceRange = validatePriceRange(parseInt(req.query.minPrice),parseInt(req.query.maxPrice),res);
        if(thereIsNoError){
            return {
                pageNum,pageSize,sortBy,order,priceRange
            };
        }else{
            return false;
        }
}

function validatePageNum(pageNum) {
    var num;
    if (!pageNum) {
        num = 1;
    } else {
        num = pageNum;
    }
    return parseInt(num);
}

function validatePageSize(pageSize,res) {
    if(thereIsNoError){
        var size;
        if (!pageSize) {
            size = 50;
        } else if (pageSize > 60) {
            console.log("i became false on validatePageSize ");
            res.status(400).json({status: SYSTEM_STATUS.FAILED, message:MAX_PAGE_SIZE_LIMIT });
            //page size request limit is set to 60; for safety reasons :)
            thereIsNoError = false;
        } else {
            size = pageSize
        }
        return size;
    }
}

function validateSortBy(sortBy,res) {
    if(thereIsNoError){
        if(sortBy){
            var isEqual = false;
            sortable_fields.forEach(function (field) {
                if (field === sortBy) {
                    isEqual =  true;
                }
            });
            if(isEqual){
                return sortBy;
            }
            else{
                thereIsNoError = false;
                console.log("i became false on validateSortBy ");
                res.status(400).json({status: SYSTEM_STATUS.FAILED, message: UNKNOWN_SORT_OPTION});

            }
        }
    }
}

function validateOrder(order,res) {
    if (thereIsNoError){
        if(order){
            if (!(order === order_fields[0]) && !(order === order_fields[1])) {
                console.log("i became false on validateOrder ");
                thereIsNoError = false;
                res.status(400).json({status: SYSTEM_STATUS.FAILED, message: UNKNOWN_ORDER_OPTION});
            }
            return order;
        }
    }
}

function validatePriceRange(minPrice,maxPrice,res){
    if(thereIsNoError){
        if(!minPrice && !maxPrice){
            return;
        }else if(minPrice && !maxPrice){
            thereIsNoError = false;
            console.log("i became false on MAX_PRICE_MISSING ");
            res.status(400).json({status: SYSTEM_STATUS.FAILED, message: MAX_PRICE_MISSING});
        }
        else if(!minPrice && maxPrice){
            thereIsNoError = false;
            console.log("i became false on MIN_PRICE_MISSING ");
            res.status(400).json({status: SYSTEM_STATUS.FAILED, message: MIN_PRICE_MISSING});
        }
        else{
            if(minPrice > maxPrice){
                console.log(minPrice,maxPrice);
                thereIsNoError = false;
                console.log("i became false on INVALID_PRICE_RANGE ");
                res.status(400).json({status: SYSTEM_STATUS.FAILED, message: INVALID_PRICE_RANGE});
            }
            return {minPrice,maxPrice};
        }
    }
}

function validateIsStringOrArray(item, res) {
    if(isArray(item)) {
        return item
    }
    if(isString(item)){
        return item.split(',');
    }
    // return res.status(400).json({status: SYSTEM_STATUS.FAILED, message: item+" is expected to be either an array or string."});
}

module.exports = {
    checkBaseServerRequest,
    validQueryParameters,
    validateIsStringOrArray
};
