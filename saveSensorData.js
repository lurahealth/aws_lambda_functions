// Using pg-promise here because we have the potential to insert several rows at once
// https://github.com/vitaly-t/pg-promise/wiki/Data-Imports
//https://stackoverflow.com/questions/44895787/pg-promise-in-aws-lambda
const pgp = require('pg-promise')({
    capSQL: true // generate capitalized SQL
});

// DB connection details
const connectionParams = {
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    poolSize: 0,
    poolIdleTimeout: 10,
};

// creating the DB object
const db = pgp(connectionParams);

exports.handler = async (event) => {
    let response = {};
    // console.log('processing event: %j', event.body);
    const body = JSON.parse(event.body);

    // getting the data to be inserted from the API gateway event
    const data = body.data;
    console.log(data);

    // getting column headers
    const cs = getColumnSet();

    // generating insert query
    const insertQuery = pgp.helpers.insert(data, cs);
    console.log(insertQuery);

    db.task('inserting-sensor-data', t => {
        const insert = pgp.helpers.insert(data, cs);
        return t.none(insert);
    }).then(
        response = getResponse(200, "Data inserted")
    )
        .catch(error => {
            response = getResponse(500, "Error inserting data " + error)
        });


    console.log(response);

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

function getColumnSet() {
    return new pgp.helpers.ColumnSet([
        {
            name: 'time_stamp',
            mod: ':raw',
            init: c => pgp.as.format(`to_timestamp(${c.value}) AT TIME ZONE 'UTC'`, c)
        },
        'user_name','ph','temperature',
        'connection_time','notes','battery'
    ], {table: 'sensor_data'});
}


