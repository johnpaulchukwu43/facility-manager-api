const order_fields = ['ASC', 'DESC'];
const CREATED_AT_DESC = "-createdAt";

function sortByAndOrderMapping(sortBy,order){
    //if there is a sortby specified
    if(sortBy){
        //if it is order in ascending order
        if(order === order_fields[0]){
            return sortBy;
        }
        //then it must be descending order
        return "-"+sortBy;
    }
    //if there is no sortby specified then set a default
    else{
        return CREATED_AT_DESC;
    }

}

module.exports = {sortByAndOrderMapping};
