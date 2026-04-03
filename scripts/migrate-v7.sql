-- Migration v7: Notifications
-- Run in phpMyAdmin > SQL tab

CREATE TABLE IF NOT EXISTS `Notification` (
  `id`        VARCHAR(191) NOT NULL,
  `userId`    VARCHAR(191) NOT NULL,
  `type`      ENUM('TASK_ASSIGNED','MENTION') NOT NULL,
  `read`      TINYINT(1) NOT NULL DEFAULT 0,
  `actorName` VARCHAR(255) NULL,
  `taskId`    VARCHAR(191) NULL,
  `projectId` VARCHAR(191) NULL,
  `commentId` VARCHAR(191) NULL,
  `taskTitle` VARCHAR(500) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `Notification_userId_idx` (`userId`),
  KEY `Notification_userId_read_idx` (`userId`, `read`),
  CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
