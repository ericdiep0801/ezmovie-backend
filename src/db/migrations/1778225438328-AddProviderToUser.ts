import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProviderToUser1778225438328 implements MigrationInterface {
    name = 'AddProviderToUser1778225438328'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`provider\` varchar(255) NOT NULL DEFAULT 'local'`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`password\` \`password\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`password\` \`password\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`provider\``);
    }

}
