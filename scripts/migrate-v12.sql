-- v12: track when a project screenshot was successfully captured
ALTER TABLE Project ADD COLUMN screenshotAt DATETIME NULL DEFAULT NULL;
