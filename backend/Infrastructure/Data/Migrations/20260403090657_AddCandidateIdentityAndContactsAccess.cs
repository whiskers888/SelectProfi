using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SelectProfi.backend.Migrations
{
    /// <inheritdoc />
    public partial class AddCandidateIdentityAndContactsAccess : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateOnly>(
                name: "BirthDate",
                table: "Candidates",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ContactsAccessExpiresAtUtc",
                table: "Candidates",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ContactsOwnerExecutorId",
                table: "Candidates",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NormalizedEmail",
                table: "Candidates",
                type: "character varying(254)",
                maxLength: 254,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NormalizedFullName",
                table: "Candidates",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "NormalizedPhone",
                table: "Candidates",
                type: "character varying(32)",
                maxLength: 32,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PublicAlias",
                table: "Candidates",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Candidates_ContactsOwnerExecutorId_ContactsAccessExpiresAtU~",
                table: "Candidates",
                columns: new[] { "ContactsOwnerExecutorId", "ContactsAccessExpiresAtUtc", "DeletedAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_Candidates_NormalizedEmail",
                table: "Candidates",
                column: "NormalizedEmail",
                filter: "\"DeletedAtUtc\" IS NULL AND \"NormalizedEmail\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Candidates_NormalizedFullName_BirthDate_DeletedAtUtc",
                table: "Candidates",
                columns: new[] { "NormalizedFullName", "BirthDate", "DeletedAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_Candidates_NormalizedPhone",
                table: "Candidates",
                column: "NormalizedPhone",
                filter: "\"DeletedAtUtc\" IS NULL AND \"NormalizedPhone\" IS NOT NULL");

            migrationBuilder.AddForeignKey(
                name: "FK_Candidates_Users_ContactsOwnerExecutorId",
                table: "Candidates",
                column: "ContactsOwnerExecutorId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Candidates_Users_ContactsOwnerExecutorId",
                table: "Candidates");

            migrationBuilder.DropIndex(
                name: "IX_Candidates_ContactsOwnerExecutorId_ContactsAccessExpiresAtU~",
                table: "Candidates");

            migrationBuilder.DropIndex(
                name: "IX_Candidates_NormalizedEmail",
                table: "Candidates");

            migrationBuilder.DropIndex(
                name: "IX_Candidates_NormalizedFullName_BirthDate_DeletedAtUtc",
                table: "Candidates");

            migrationBuilder.DropIndex(
                name: "IX_Candidates_NormalizedPhone",
                table: "Candidates");

            migrationBuilder.DropColumn(
                name: "BirthDate",
                table: "Candidates");

            migrationBuilder.DropColumn(
                name: "ContactsAccessExpiresAtUtc",
                table: "Candidates");

            migrationBuilder.DropColumn(
                name: "ContactsOwnerExecutorId",
                table: "Candidates");

            migrationBuilder.DropColumn(
                name: "NormalizedEmail",
                table: "Candidates");

            migrationBuilder.DropColumn(
                name: "NormalizedFullName",
                table: "Candidates");

            migrationBuilder.DropColumn(
                name: "NormalizedPhone",
                table: "Candidates");

            migrationBuilder.DropColumn(
                name: "PublicAlias",
                table: "Candidates");
        }
    }
}
