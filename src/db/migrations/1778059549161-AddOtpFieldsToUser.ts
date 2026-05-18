import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOtpFieldsToUser1778059549161 implements MigrationInterface {
    name = 'AddOtpFieldsToUser1778059549161'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`isActive\` tinyint NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`otpCode\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`otpExpiresAt\` timestamp NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`otpExpiresAt\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`otpCode\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`isActive\``);
    }

}
