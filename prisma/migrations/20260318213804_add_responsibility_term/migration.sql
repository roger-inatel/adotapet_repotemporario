-- CreateTable
CREATE TABLE `ResponsibilityTerm` (
    `id` VARCHAR(191) NOT NULL,
    `adoptionRequestId` VARCHAR(191) NOT NULL,
    `adopterIp` VARCHAR(191) NOT NULL,
    `userAgent` VARCHAR(191) NOT NULL,
    `acceptedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ResponsibilityTerm_adoptionRequestId_key`(`adoptionRequestId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ResponsibilityTerm` ADD CONSTRAINT `ResponsibilityTerm_adoptionRequestId_fkey` FOREIGN KEY (`adoptionRequestId`) REFERENCES `AdoptionRequest`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
