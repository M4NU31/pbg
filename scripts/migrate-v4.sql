-- Migration v4: Task archive support
-- Run in phpMyAdmin > SQL tab

ALTER TABLE `Task` ADD COLUMN `archivedAt` DATETIME(3) NULL DEFAULT NULL AFTER `updatedAt`;
