import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAvatarToUser1778128740196 implements MigrationInterface {
    name = 'AddAvatarToUser1778128740196'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`avatar\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`avatar\``);
    }

}
