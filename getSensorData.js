const SEVEN_DAYS_OF_DATA = 4*24*7;// 4 data points per hour, 24 hrs in a day 7 days in a week

const {Client} = require('pg'); //  Needs the nodePostgres Lambda Layer

exports.handler = async (event, context, callback) => {
    console.log('processing event: %j', event);
    const parameters = event.queryStringParameters;
    const fromDate = parameters.from;
    const toDate = parameters.to;
    const userName = parameters.userName;

    let response = {};
    const client = new Client();

    let searchQuery = "";
    // let dataQuery = "";
    // if (fromDate && toDate) {
    //     searchQuery = getSearchQueryWithDate(userName, fromDate, toDate);
    //     dataQuery = getDataQueryWithDate(userName, fromDate, toDate);
    // } else {
    //     searchQuery = getLastNRows(userName, SEVEN_DAYS_OF_DATA);
    //     dataQuery = getDataFromNRows(userName, SEVEN_DAYS_OF_DATA);
    // }
    // console.log("Search query: " + searchQuery);
    // console.log("Data query: "+ dataQuery);

    if (fromDate && toDate) {
        searchQuery = getSearchQueryWithDate(userName, fromDate, toDate);
    } else {
        searchQuery = getAllDataForUser(userName);
    }

    console.log(searchQuery);

    try {
        await client.connect();

        const searchResult = await client.query(searchQuery);

        // const dataResult = await client.query(dataQuery);
        console.log(searchResult);

        response = getResponse(200, getReturnBody(searchResult));
    } catch (e) {
        response = {
            statusCode: 500,
            result: "Error: " + e
        };
    } finally {
        client.end();
    }


    return response;
};

function getResponse(statusCode, message) {
    return {
        statusCode: statusCode,
        body: JSON.stringify({message: message}),
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin':'*'
        }
    };
}

function getReturnBody(searchResult) {
    // const data = dataResult.rows[0];
    return {
        rowCount: searchResult.rowCount,
        rows: searchResult.rows,
        // average: Math.round(data.average),
        // min: Math.round(data.min),
        // max: Math.round(data.max),
    };
}

function getAllDataForUser(userName) {
    return `SELECT * FROM (
            SELECT * FROM sensor_data WHERE user_name = '${userName}') as rows
            ORDER BY rows.time_stamp ASC;`;
}

function getSearchQueryWithDate(userName, fromDate, toDate) {
    return `SELECT * 
            FROM sensor_data 
            WHERE user_name = '${userName}' and time_stamp between '${fromDate}' and '${toDate}';`;
}

function getDataQueryWithDate(userName, fromDate, toDate) {
    return `SELECT AVG(ph) as average, MIN(ph) as min, MAX(ph) as max FROM (
            SELECT ph, time_stamp, user_name 
            FROM sensor_data 
            WHERE user_name = '${userName}' and time_stamp between '${fromDate}' and '${toDate}') as rows`;
}

function getLastNRows(userName, N) {
    return `SELECT * FROM (
            SELECT * FROM sensor_data WHERE user_name = '${userName}' 
                                            ORDER BY time_stamp DESC LIMIT '${N}') as rows
                                            ORDER BY rows.time_stamp ASC;`;
}

function getDataFromNRows(userName, N) {
    return `SELECT AVG(ph) as average, MIN(ph) as min, MAX(ph) as max FROM (
            SELECT ph, time_stamp, user_name
            FROM sensor_data WHERE user_name = '${userName}' 
            ORDER BY time_stamp DESC LIMIT '${N}') as rows`;
}
