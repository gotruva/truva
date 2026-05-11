alter table staging.products
  drop constraint if exists staging_products_automation_phase_check;

alter table staging.products
  add constraint staging_products_automation_phase_check
  check (
    automation_phase in ('phase1_digital', 'phase2_neobanks', 'manual_seed', 'inactive')
  );
