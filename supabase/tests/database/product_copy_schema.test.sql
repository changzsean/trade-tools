begin;

select plan(8);
select has_table('public', 'product_copy_runs', 'product_copy_runs table exists');
select has_table('public', 'product_copy_items', 'product_copy_items table exists');
select has_column('public', 'product_copy_runs', 'user_id', 'runs has owner column');
select has_column('public', 'product_copy_runs', 'source_store_url', 'runs has source URL');
select has_column('public', 'product_copy_items', 'run_id', 'items has run relation');
select has_column('public', 'product_copy_items', 'source_product_id', 'items has source product ID');
select has_index('public', 'product_copy_runs_user_created_idx', 'runs has owner/time index');
select has_index('public', 'product_copy_items_run_status_idx', 'items has run/status index');

select * from finish();
rollback;
