-- Migration v6: Add siteUrl to Project
-- Run in phpMyAdmin > SQL tab

ALTER TABLE `Project`
  ADD COLUMN `siteUrl` VARCHAR(2000) NULL DEFAULT NULL AFTER `description`;
