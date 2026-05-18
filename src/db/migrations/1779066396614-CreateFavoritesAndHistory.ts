import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateFavoritesAndHistory1779066396614 implements MigrationInterface {
    name = 'CreateFavoritesAndHistory1779066396614'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`favorites\` (\`id\` int NOT NULL AUTO_INCREMENT, \`userId\` int NOT NULL, \`movieSlug\` varchar(255) NOT NULL, \`movieName\` varchar(255) NOT NULL, \`moviePoster\` varchar(255) NULL, \`movieType\` varchar(255) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`watch_history\` (\`id\` int NOT NULL AUTO_INCREMENT, \`userId\` int NOT NULL, \`movieSlug\` varchar(255) NOT NULL, \`movieName\` varchar(255) NOT NULL, \`moviePoster\` varchar(255) NULL, \`episodeName\` varchar(255) NOT NULL, \`episodeSlug\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`favorites\` ADD CONSTRAINT \`FK_e747534006c6e3c2f09939da60f\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`watch_history\` ADD CONSTRAINT \`FK_f287ef6180d95d3bdae3916c968\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`watch_history\` DROP FOREIGN KEY \`FK_f287ef6180d95d3bdae3916c968\``);
        await queryRunner.query(`ALTER TABLE \`favorites\` DROP FOREIGN KEY \`FK_e747534006c6e3c2f09939da60f\``);
        await queryRunner.query(`DROP TABLE \`watch_history\``);
        await queryRunner.query(`DROP TABLE \`favorites\``);
    }

}
