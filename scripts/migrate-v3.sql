-- Migration v3: Dynamic board columns
-- Run in phpMyAdmin > SQL tab BEFORE deploying

-- 1. Create BoardColumn table
CREATE TABLE IF NOT EXISTS `BoardColumn` (
  `id` VARCHAR(191) NOT NULL,
  `projectId` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `position` INT NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `BoardColumn_projectId_fkey` (`projectId`),
  CONSTRAINT `BoardColumn_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Add columnId to Task (nullable during migration)
ALTER TABLE `Task` ADD COLUMN `columnId` VARCHAR(191) NULL AFTER `status`;
ALTER TABLE `Task` ADD KEY `Task_columnId_fkey` (`columnId`);
ALTER TABLE `Task` ADD CONSTRAINT `Task_columnId_fkey` FOREIGN KEY (`columnId`) REFERENCES `BoardColumn` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- 3. For each existing project, create 5 default columns and map old status values
-- (Run this block — it uses a stored procedure to iterate projects)
DROP PROCEDURE IF EXISTS migrate_columns;
DELIMITER $$
CREATE PROCEDURE migrate_columns()
BEGIN
  DECLARE done INT DEFAULT FALSE;
  DECLARE pid VARCHAR(191);
  DECLARE cur CURSOR FOR SELECT id FROM Project;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

  OPEN cur;
  read_loop: LOOP
    FETCH cur INTO pid;
    IF done THEN LEAVE read_loop; END IF;

    SET @c0 = UUID(); SET @c1 = UUID(); SET @c2 = UUID(); SET @c3 = UUID(); SET @c4 = UUID();
    INSERT INTO BoardColumn (id, projectId, name, position) VALUES
      (@c0, pid, 'Backlog',  0),
      (@c1, pid, 'Dev',      1),
      (@c2, pid, 'Prod',     2),
      (@c3, pid, 'Review',   3),
      (@c4, pid, 'Done',     4);

    -- Map old ENUM status → new column
    UPDATE Task SET columnId = @c0 WHERE projectId = pid AND status = 'BACKLOG';
    UPDATE Task SET columnId = @c1 WHERE projectId = pid AND status = 'TODO';
    UPDATE Task SET columnId = @c2 WHERE projectId = pid AND status = 'DOING';
    UPDATE Task SET columnId = @c3 WHERE projectId = pid AND status = 'DONE';
    UPDATE Task SET columnId = @c4 WHERE projectId = pid AND status = 'CLOSED';
    -- Any unmapped tasks go to Backlog
    UPDATE Task SET columnId = @c0 WHERE projectId = pid AND columnId IS NULL;
  END LOOP;
  CLOSE cur;
END$$
DELIMITER ;
CALL migrate_columns();
DROP PROCEDURE IF EXISTS migrate_columns;
