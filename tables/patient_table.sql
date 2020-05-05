-- creating a patients data table
CREATE TABLE patients(
  patient_id            SERIAL  PRIMARY KEY,
  dentist_email         TEXT    NOT NULL,
  patient_name          TEXT    NULL,
  patient_email         TEXT    NOT NULL,
  patient_reference     TEXT    NOT NULL
);

Table "public.patients"
Column       |  Type   | Collation | Nullable |                   Default
-------------------+---------+-----------+----------+----------------------------------------------
patient_id        | integer |           | not null | nextval('patients_patient_id_seq'::regclass)
dentist_email     | text    |           | not null |
patient_name      | text    |           |          |
patient_email     | text    |           | not null | 
patient_reference | text    |           | not null |
confirmed         | boolean |           | not null | false
Indexes:
"patients_pkey" PRIMARY KEY, btree (patient_id)
"patients_patient_email_key" UNIQUE CONSTRAINT, btree (patient_email)

-- making patinet email a unique contraint
ALTER TABLE patients ADD UNIQUE (patient_email);

-- add a confirmed column to the patinets table
ALTER TABLE patients
  ADD COLUMN confirmed BOOLEAN DEFAULT FALSE;

-- making the confirmed column a required field
ALTER TABLE patients ALTER COLUMN confirmed SET NOT NULL;
