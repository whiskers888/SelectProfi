using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class LockOrderServiceCommission : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "ServiceCommissionRate",
                table: "Orders",
                type: "numeric(6,5)",
                precision: 6,
                scale: 5,
                nullable: true);

            migrationBuilder.Sql(
                """
                UPDATE "Orders"
                SET "ServiceCommissionRate" = 0.15
                WHERE "ExecutorId" IS NOT NULL
                  AND "ServiceCommissionRate" IS NULL;
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ServiceCommissionRate",
                table: "Orders");
        }
    }
}
