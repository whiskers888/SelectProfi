using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddOrderSpecializationsDictionary : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "SpecializationId",
                table: "Orders",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "OrderSpecializations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    SortOrder = table.Column<int>(type: "integer", nullable: false, defaultValue: 0),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrderSpecializations", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Orders_SpecializationId",
                table: "Orders",
                column: "SpecializationId");

            migrationBuilder.CreateIndex(
                name: "IX_OrderSpecializations_IsActive_SortOrder_Name",
                table: "OrderSpecializations",
                columns: new[] { "IsActive", "SortOrder", "Name" });

            migrationBuilder.CreateIndex(
                name: "IX_OrderSpecializations_Name",
                table: "OrderSpecializations",
                column: "Name",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_OrderSpecializations_SpecializationId",
                table: "Orders",
                column: "SpecializationId",
                principalTable: "OrderSpecializations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Orders_OrderSpecializations_SpecializationId",
                table: "Orders");

            migrationBuilder.DropTable(
                name: "OrderSpecializations");

            migrationBuilder.DropIndex(
                name: "IX_Orders_SpecializationId",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "SpecializationId",
                table: "Orders");
        }
    }
}
