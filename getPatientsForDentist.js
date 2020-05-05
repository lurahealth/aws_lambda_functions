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
        callback(null, getResponse(200, patientsResult.rows));
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

function getResponse(statusCode, body) {
    return {
        status : statusCode,
        body : JSON.stringify(body),
        isBase64Encoded : false,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin':'*'
        }
    };
}