-- Migration v2: system roles + project archiving
-- Run in phpMyAdmin > SQL tab

ALTER TABLE `User`
  ADD COLUMN `systemRole` ENUM('RANK1','RANK2','RANK3') NOT NULL DEFAULT 'RANK3'
  AFTER `updatedAt`;

ALTER TABLE `Project`
  ADD COLUMN `archivedAt` DATETIME(3) NULL DEFAULT NULL
  AFTER `updatedAt`;

-- Seed the admin account
UPDATE `User` SET `systemRole` = 'RANK1' WHERE `email` = 'manuel@punchteam.com';
