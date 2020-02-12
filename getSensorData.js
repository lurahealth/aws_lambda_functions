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
    if (fromDate && toDate) {
        searchQuery = getSearchQueryWithDate(deviceId, fromDate, toDate);
    } else {
        //searchQuery = getLastNHrsData(deviceId, 4);
        searchQuery = getLastNRows(deviceId, SEVEN_DAYS_OF_DATA);
    }

    console.log("Search query: " + searchQuery);

    try {
        await client.connect();

        const searchResult = await client.query(searchQuery);

        response = getResponse(200, getReturnBody(searchResult))
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
        }
    };
}

function getReturnBody(searchResult) {
    return {
        rowCount: searchResult.rowCount,
        rows: searchResult.rows
    };
}

function getSearchQueryWithDate(deviceId, fromDate, toDate) {
    return `SELECT * FROM sensor_data WHERE device_id = '${deviceId}' and 
                                            time_stamp between '${fromDate}' and '${toDate}';`;
}

function getLastNHrsData(deviceId, N) {
    return `SELECT * FROM (
            SELECT * FROM sensor_data WHERE device_id = '${deviceId}' and 
                                            time_stamp BETWEEN NOW() - INTERVAL '${N} HOURS' AND NOW() 
                                            ORDER BY time_stamp DESC LIMIT 100 ) as rows
                                            ORDER BY rows.time_stamp ASC;`;
}

function getLastNRows(deviceId, N) {
    return `SELECT * FROM (
            SELECT * FROM sensor_data WHERE device_id = '${deviceId}' 
                                            ORDER BY time_stamp DESC LIMIT '${N}') as rows
                                            ORDER BY rows.time_stamp ASC;`;
}
