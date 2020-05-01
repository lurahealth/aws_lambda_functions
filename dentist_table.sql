-- creating a dentist data table
CREATE TABLE dentists(
  dentist_id                 SERIAL  PRIMARY KEY,
  dentist_name               TEXT    NULL,
  dentist_email              TEXT    NOT NULL
);



Table "public.dentists"
Column     |  Type   | Collation | Nullable |                   Default
---------------+---------+-----------+----------+----------------------------------------------
dentist_id    | integer |           | not null | nextval('dentists_dentist_id_seq'::regclass)
dentist_name  | text    |           |          |
dentist_email | text    |           | not null |
-- Indexes:
--     "dentists_pkey" PRIMARY KEY, btree (dentist_id)
