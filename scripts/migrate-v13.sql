-- v13: add slug to Project for human-readable permalinks
ALTER TABLE Project ADD COLUMN slug VARCHAR(255) NULL;

-- Generate slugs for existing projects: lowercase name, non-alphanumeric → dash,
-- append first 8 chars of UUID to guarantee uniqueness
UPDATE Project
SET slug = CONCAT(
  REGEXP_REPLACE(LOWER(TRIM(SUBSTRING(name, 1, 40))), '[^a-z0-9]+', '-'),
  '-',
  SUBSTRING(REPLACE(id, '-', ''), 1, 6)
);

ALTER TABLE Project ADD UNIQUE INDEX idx_project_slug (slug);
