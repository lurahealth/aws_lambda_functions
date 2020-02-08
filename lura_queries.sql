-- creating the database
CREATE database sensor_data;

-- creating a sensor data table
CREATE TABLE sensor_data(
  time_stamp        TIMESTAMP WITH TIME ZONE  NOT NULL,
  device_Id         TEXT                      NOT NULL,
  ph                DOUBLE PRECISION          NULL,
  temperature       DOUBLE PRECISION          NULL,
  battery           DOUBLE PRECISION          NULL,
  connection_time   DOUBLE PRECISION          NULL,
  notes             TEXT                      NULL
);

-- sensor data table description
Column      |           Type           | Collation | Nullable | Default
-----------------+--------------------------+-----------+----------+---------
time_stamp      | timestamp with time zone |           | not null |
device_id       | text                     |           | not null |
ph              | double precision         |           |          |
temperature     | double precision         |           |          |
connection_time | double precision         |           |          |
notes           | text                     |           |          |
battery         | double precision         |           |          |
Indexes:
"sensor_data_time_stamp_idx" btree (time_stamp DESC)
Triggers:
ts_insert_blocker BEFORE INSERT ON sensor_data FOR EACH ROW EXECUTE PROCEDURE _timescaledb_internal.insert_blocker()



ALTER TABLE sensor_data
  ADD COLUMN battery DOUBLE PRECISION NULL;

-- converting to hypertable (making it a time series table)
SELECT create_hypertable('"sensor_data"', 'time_stamp');

-- checking DB status
select  * from
(select count(*) used from pg_stat_activity) active_connectinos,
(select setting::int res_for_super from pg_settings where name=$$superuser_reserved_connections$$) superuser_reserved_connections,
(select setting::int max_conn from pg_settings where name=$$max_connections$$) max_connections;
