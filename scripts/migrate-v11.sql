-- v11: Add pin position columns to Task for embed click-to-pin feature
-- Run this script once against the production database.

ALTER TABLE `Task`
  ADD COLUMN `pinX` FLOAT DEFAULT NULL COMMENT 'Pin X page-coordinate in pixels at time of report',
  ADD COLUMN `pinY` FLOAT DEFAULT NULL COMMENT 'Pin Y page-coordinate in pixels at time of report';
