-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `role` ENUM('ADOPTER', 'VOLUNTEER', 'ONG_ADMIN', 'ADMIN') NOT NULL DEFAULT 'ADOPTER',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Organization` (
    `id` VARCHAR(191) NOT NULL,
    `legalName` VARCHAR(191) NOT NULL,
    `tradeName` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `cnpj` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `state` VARCHAR(191) NULL,
    `isVerified` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Organization_email_key`(`email`),
    UNIQUE INDEX `Organization_cnpj_key`(`cnpj`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pet` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `species` ENUM('DOG', 'CAT', 'OTHER') NOT NULL,
    `breed` VARCHAR(191) NULL,
    `sex` ENUM('MALE', 'FEMALE') NOT NULL,
    `ageInMonths` INTEGER NULL,
    `size` ENUM('SMALL', 'MEDIUM', 'LARGE') NULL,
    `color` VARCHAR(191) NULL,
    `vaccinated` BOOLEAN NOT NULL DEFAULT false,
    `neutered` BOOLEAN NOT NULL DEFAULT false,
    `specialNeeds` BOOLEAN NOT NULL DEFAULT false,
    `specialNeedsDetails` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `status` ENUM('AVAILABLE', 'PENDING_ADOPTION', 'ADOPTED', 'IN_TREATMENT') NOT NULL DEFAULT 'AVAILABLE',
    `city` VARCHAR(191) NULL,
    `state` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `registeredById` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AdoptionRequest` (
    `id` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `reviewedAt` DATETIME(3) NULL,
    `petId` VARCHAR(191) NOT NULL,
    `requesterId` VARCHAR(191) NOT NULL,

    INDEX `AdoptionRequest_petId_status_idx`(`petId`, `status`),
    INDEX `AdoptionRequest_requesterId_status_idx`(`requesterId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RescueHelpRequest` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `state` VARCHAR(191) NULL,
    `latitude` DECIMAL(10, 7) NULL,
    `longitude` DECIMAL(10, 7) NULL,
    `status` ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CANCELED') NOT NULL DEFAULT 'OPEN',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `requestedById` VARCHAR(191) NOT NULL,
    `petId` VARCHAR(191) NULL,

    INDEX `RescueHelpRequest_status_createdAt_idx`(`status`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Report` (
    `id` VARCHAR(191) NOT NULL,
    `targetType` ENUM('USER', 'PET', 'ORGANIZATION', 'OTHER') NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `status` ENUM('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED') NOT NULL DEFAULT 'OPEN',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `reportedById` VARCHAR(191) NOT NULL,
    `targetUserId` VARCHAR(191) NULL,
    `targetPetId` VARCHAR(191) NULL,
    `targetOrganizationId` VARCHAR(191) NULL,

    INDEX `Report_status_createdAt_idx`(`status`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ResponsibilityTermSignature` (
    `id` VARCHAR(191) NOT NULL,
    `acceptedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `termVersion` VARCHAR(191) NOT NULL,
    `signerIp` VARCHAR(191) NULL,
    `signerUserAgent` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NOT NULL,
    `petId` VARCHAR(191) NOT NULL,
    `adoptionRequestId` VARCHAR(191) NULL,

    INDEX `ResponsibilityTermSignature_userId_acceptedAt_idx`(`userId`, `acceptedAt`),
    INDEX `ResponsibilityTermSignature_petId_acceptedAt_idx`(`petId`, `acceptedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Pet` ADD CONSTRAINT `Pet_registeredById_fkey` FOREIGN KEY (`registeredById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pet` ADD CONSTRAINT `Pet_organizationId_fkey` FOREIGN KEY (`organizationId`) REFERENCES `Organization`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdoptionRequest` ADD CONSTRAINT `AdoptionRequest_petId_fkey` FOREIGN KEY (`petId`) REFERENCES `Pet`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdoptionRequest` ADD CONSTRAINT `AdoptionRequest_requesterId_fkey` FOREIGN KEY (`requesterId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RescueHelpRequest` ADD CONSTRAINT `RescueHelpRequest_requestedById_fkey` FOREIGN KEY (`requestedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RescueHelpRequest` ADD CONSTRAINT `RescueHelpRequest_petId_fkey` FOREIGN KEY (`petId`) REFERENCES `Pet`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Report` ADD CONSTRAINT `Report_reportedById_fkey` FOREIGN KEY (`reportedById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Report` ADD CONSTRAINT `Report_targetUserId_fkey` FOREIGN KEY (`targetUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Report` ADD CONSTRAINT `Report_targetPetId_fkey` FOREIGN KEY (`targetPetId`) REFERENCES `Pet`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Report` ADD CONSTRAINT `Report_targetOrganizationId_fkey` FOREIGN KEY (`targetOrganizationId`) REFERENCES `Organization`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ResponsibilityTermSignature` ADD CONSTRAINT `ResponsibilityTermSignature_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ResponsibilityTermSignature` ADD CONSTRAINT `ResponsibilityTermSignature_petId_fkey` FOREIGN KEY (`petId`) REFERENCES `Pet`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ResponsibilityTermSignature` ADD CONSTRAINT `ResponsibilityTermSignature_adoptionRequestId_fkey` FOREIGN KEY (`adoptionRequestId`) REFERENCES `AdoptionRequest`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
