using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SelectProfi.backend.Migrations
{
    /// <inheritdoc />
    public partial class AddVacancyLifecycleStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "Vacancies",
                type: "character varying(32)",
                maxLength: 32,
                nullable: false,
                defaultValue: "Draft");

            migrationBuilder.CreateIndex(
                name: "IX_Vacancies_Status_DeletedAtUtc",
                table: "Vacancies",
                columns: new[] { "Status", "DeletedAtUtc" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Vacancies_Status_DeletedAtUtc",
                table: "Vacancies");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Vacancies");
        }
    }
}
