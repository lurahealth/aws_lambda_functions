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
            console.log(insertQueryResult);
            if(insertQueryResult.rowCount === 1){
                console.log("\nDentist registered!");
                callback(null, event);
            } else {
                console.log("\nError registering dentist");
                callback (new Error("Error registering dentist"), event);
            }
        } else{
            console.log("\nIs a patient");
            const patientCountQuery = checkPatinetQuery(email);
            console.log(patientCountQuery);
            const patientCheckResult = await client.query(patientCountQuery);
            console.log("\n");
            console.log(patientCheckResult);
        }

    } catch (e) {
        console.log(e);
        callback(new Error(e.toString()), event);
    } finally {
        client.end();
    }
};

function getInsertDentistQuery(dentistEmail) {
    return `INSERT INTO dentists (dentist_email) VALUES ('${dentistEmail}')`;
}

function checkPatinetQuery(patientEmail) {
    return `SELECT COUNT(*) FROM patients WHERE patient_email = '${patientEmail}'`;
}