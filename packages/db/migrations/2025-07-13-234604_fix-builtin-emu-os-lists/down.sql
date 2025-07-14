-- Nothing to down here, this migration is only to fix a regression
-- that led to mutation of data that should be static. The following
-- should be a no-op.
update emulators set operating_systems = array[3]
where built_in = true;
