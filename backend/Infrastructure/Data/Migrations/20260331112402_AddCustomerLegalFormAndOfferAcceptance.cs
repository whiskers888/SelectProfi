using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SelectProfi.backend.Migrations
{
    /// <inheritdoc />
    public partial class AddCustomerLegalFormAndOfferAcceptance : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CustomerLegalForm",
                table: "Users",
                type: "character varying(16)",
                maxLength: 16,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "CustomerOfferAccepted",
                table: "Users",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "CustomerOfferAcceptedAtUtc",
                table: "Users",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CustomerOfferVersion",
                table: "Users",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CustomerLegalForm",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "CustomerOfferAccepted",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "CustomerOfferAcceptedAtUtc",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "CustomerOfferVersion",
                table: "Users");
        }
    }
}
