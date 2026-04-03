-- Migration v8: Multi-assignee support
-- Run in phpMyAdmin > SQL tab

CREATE TABLE IF NOT EXISTS `TaskAssignee` (
  `taskId`     VARCHAR(191) NOT NULL,
  `userId`     VARCHAR(191) NOT NULL,
  `assignedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`taskId`, `userId`),
  KEY `TaskAssignee_userId_idx` (`userId`),
  CONSTRAINT `TaskAssignee_taskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `Task` (`id`) ON DELETE CASCADE,
  CONSTRAINT `TaskAssignee_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Migrate existing single assignees into the join table
INSERT IGNORE INTO `TaskAssignee` (`taskId`, `userId`)
SELECT `id`, `assigneeId` FROM `Task` WHERE `assigneeId` IS NOT NULL;
