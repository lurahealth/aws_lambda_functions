const {Client} = require('pg'); //  Needs the nodePostgres Lambda Layer

exports.handler = async (event, context, callback) => {
    console.log('processing event: %j', event);
    const parameters = event.queryStringParameters;
    const dentistEmail = parameters.dentistEmail;
    const patientsQuery = getPatients(dentistEmail);
    console.log(patientsQuery);
    const client = new Client();
    try {
        await client.connect();
        const patientsResult = await client.query(patientsQuery);
        console.log(patientsResult);
        callback(null, getResponse(200, patientsResult));
    }catch (e) {
        console.log(e);
        callback(new Error(e.toString()), null);
    } finally {
        client.end();
    }
};

function getPatients(dentistEmail) {
    return `SELECT * FROM patients WHERE dentist_email = '${dentistEmail}'`;
}

function getResponse(statusCode, queryResult) {
    return {
        statusCode : statusCode,
        body : JSON.stringify(getResponseBody(queryResult)),
        isBase64Encoded : false,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin':'*'
        }
    };
}

function getResponseBody(queryResult) {
    return{
        rowCount: queryResult.rowCount,
        patients: queryResult.rows
    }
}