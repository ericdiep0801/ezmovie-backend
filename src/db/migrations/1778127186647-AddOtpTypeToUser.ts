import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOtpTypeToUser1778127186647 implements MigrationInterface {
    name = 'AddOtpTypeToUser1778127186647'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`otpType\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`otpType\``);
    }

}
