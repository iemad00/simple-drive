import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRolePermissions1754943103578 implements MigrationInterface {
    name = 'AddRolePermissions1754943103578'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "roles" ADD "permissions" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "permissions"`);
    }

}
