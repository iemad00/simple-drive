import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1754945715737 implements MigrationInterface {
    name = 'Init1754945715737'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "storage_config" ("key" character varying NOT NULL, "value" character varying NOT NULL, CONSTRAINT "PK_8e3ee082222ba785cdf0143d5f0" PRIMARY KEY ("key"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "storage_config"`);
    }

}
