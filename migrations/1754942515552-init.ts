import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1754942515552 implements MigrationInterface {
    name = 'Init1754942515552'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "roles" ADD "permissions" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "permissions"`);
    }

}
