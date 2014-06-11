CREATE OR REPLACE FUNCTION update_job_dates_func()
RETURNS interval AS $$
DECLARE
tdiff interval;
begin
select now()-(select max(updated_at) into tdiff from jobs);
update jobs set updated_at = updated_at + tdiff, created_at = created_at + tdiff;
return tdiff;
end;
$$ LANGUAGE plpgsql VOLATILE
