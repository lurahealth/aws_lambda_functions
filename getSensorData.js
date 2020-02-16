const SEVEN_DAYS_OF_DATA = 4*24*7;// 4 data points per hour, 24 hrs in a day 7 days in a week

const {Client} = require('pg'); //  Needs the nodePostgres Lambda Layer

exports.handler = async (event) => {
    console.log('processing event: %j', event.queryStringParameters);
    let response = {};
    const parameters = event.queryStringParameters;
    const fromDate = parameters.from;
    const toDate = parameters.to;
    const deviceId = parameters.deviceId;

    const client = new Client();

    let searchQuery = "";
    let dataQuery = "";
    if (fromDate && toDate) {
        searchQuery = getSearchQueryWithDate(deviceId, fromDate, toDate);
        dataQuery = getDataQueryWithDate(deviceId, fromDate, toDate);
    } else {
        searchQuery = getLastNRows(deviceId, SEVEN_DAYS_OF_DATA);
        dataQuery = getDataFromNRows(deviceId, SEVEN_DAYS_OF_DATA);
    }

    console.log("Search query: " + searchQuery);

    try {
        await client.connect();

        const searchResult = await client.query(searchQuery);

        const dataResult = await client.query(dataQuery);
        console.log(dataResult);

        response = getResponse(200, getReturnBody(searchResult, dataResult));
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

function getReturnBody(searchResult, dataResult) {
    const data = dataResult.rows[0];
    return {
        rowCount: searchResult.rowCount,
        rows: searchResult.rows,
        average: Math.round(data.average),
        min: Math.round(data.min),
        max: Math.round(data.max),
    };
}

function getSearchQueryWithDate(deviceId, fromDate, toDate) {
    return `SELECT * 
            FROM sensor_data 
            WHERE device_id = '${deviceId}' and time_stamp between '${fromDate}' and '${toDate}';`;
}

function getDataQueryWithDate(deviceId, fromDate, toDate) {
    return `SELECT AVG(ph) as average, MIN(ph) as min, MAX(ph) as max, time_stamp, device_id 
            FROM sensor_data 
            WHERE device_id = '${deviceId}' and time_stamp between '${fromDate}' and '${toDate}';`;
}

function getLastNRows(deviceId, N) {
    return `SELECT * FROM (
            SELECT * FROM sensor_data WHERE device_id = '${deviceId}' 
                                            ORDER BY time_stamp DESC LIMIT '${N}') as rows
                                            ORDER BY rows.time_stamp ASC;`;
}

function getDataFromNRows(deviceId, N) {
    return `SELECT AVG(ph) as average, MIN(ph) as min, MAX(ph) as max FROM (
            SELECT ph, time_stamp, device_id
            FROM sensor_data WHERE device_id = '${deviceId}' 
            ORDER BY time_stamp DESC LIMIT '${N}') as rows`;
}


