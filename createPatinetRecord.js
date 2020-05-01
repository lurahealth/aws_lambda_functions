const {Client} = require('pg'); //  Needs the nodePostgres Lambda Layer

exports.handler = async (event, context, callback) => {
    console.log('processing event: %j', event);
    const parameters = event.queryStringParameters;
    const patientName = parameters.patientName;
    const patientEmail = parameters.patientEmail;
    const patientReference = parameters.patientReference;
    const dentistEmail = parameters.dentistEmail;

    const client = new Client();
    try {
        await client.connect();
        const insertPatientQuery = getInsertPatientQuery(patientName, patientEmail, patientReference, dentistEmail);
        console.log(insertPatientQuery);
        const insertPatientResult = await client.query(insertPatientQuery);
        console.log(insertPatientResult);
        if(insertPatientResult.rowCount === 1){
            console.log("Patient inserted!");
            callback(null, getResponse(200,"Patient inserted!"));
        }else{
            console.log("Error inserting patient");
            callback(null, getResponse(500,"Error inserting patient"));
        }

    }catch (e) {
        console.log(e);
        callback(new Error(e.toString()), event);
    } finally {
        client.end();
    }

    callback(null, getResponse(200,patientEmail));
};

function getInsertPatientQuery(patientName, patientEmail, patientReference, dentistEmail) {
    return `INSERT INTO patients 
            (patient_name, patient_email, patient_reference, dentist_email) 
            VALUES 
            ('${patientName}','${patientEmail}','${patientReference}','${dentistEmail}')`;
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