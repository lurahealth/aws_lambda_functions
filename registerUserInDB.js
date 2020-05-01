const {Client} = require('pg'); //  Needs the nodePostgres Lambda Layer

exports.handler = async (event, context, callback) => {
    console.log(event);
    const isDentist = event.request.userAttributes["custom:isDentist"];
    console.log(isDentist);
    const email = event.request.userAttributes["email"];
    const client = new Client();
    try {
        await client.connect();
        if(isDentist == null || isDentist !== "false"){
            console.log("\nIs a dentist");
            // inset the dentist email in the DB
            const dentistInsertQuery = getInsertDentistQuery(email);
            console.log(dentistInsertQuery);
            const insertQueryResult = await client.query(dentistInsertQuery);
            if(insertQueryResult.rowCount === 1){
                console.log("\nDentist registered!");
                callback(null, event);
            } else {
                console.log("\nError registering dentist");
                callback (new Error("Error registering dentist"), event);
            }
        } else{
            console.log("\nIs a patient");
            const patientCountQuery = checkPatientQuery(email);
            console.log(patientCountQuery);
            const patientCheckResult = await client.query(patientCountQuery);
            console.log("\n");
            console.log(patientCheckResult);
            const rowCount = patientCheckResult.rowCount;
            if(rowCount === 1){
                console.log("Patient found!");
                callback(null, event);
            }else if(rowCount === 0){
                console.log("\nError patient not registered by dentist yet!");
                callback (new Error("Error patient not registered by dentist yet!"), event);
            }
        }

    } catch (e) {
        console.log(e);
        callback(new Error(e.toString()), event);
    } finally {
        client.end();
    }
};

function getInsertDentistQuery(patientName) {
    return `UPDATE patients SET patient_name = '${patientName}')`;
}

function checkPatientQuery(patientEmail) {
    return `SELECT * FROM patients WHERE patient_email = '${patientEmail}'`;
}