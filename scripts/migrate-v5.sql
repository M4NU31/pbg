-- Migration v5: Client invitations
-- Run in phpMyAdmin > SQL tab

CREATE TABLE IF NOT EXISTS `ClientInvitation` (
  `id` VARCHAR(191) NOT NULL,
  `projectId` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `invitedById` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ClientInvitation_projectId_email` (`projectId`, `email`),
  KEY `ClientInvitation_projectId_fkey` (`projectId`),
  CONSTRAINT `ClientInvitation_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
