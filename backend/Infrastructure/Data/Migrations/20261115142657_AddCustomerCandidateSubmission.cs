using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddCustomerCandidateSubmission : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "CustomerSubmittedAtUtc",
                table: "VacancyCandidates",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CandidatePipelineRevision",
                table: "Vacancies",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ExperienceYears",
                table: "CandidateResumes",
                type: "integer",
                nullable: true);

            migrationBuilder.Sql(
                """
                UPDATE "VacancyCandidates" AS candidate
                SET "CustomerSubmittedAtUtc" = vacancy."ShortlistSentToCustomerAtUtc"
                FROM "Vacancies" AS vacancy
                WHERE candidate."VacancyId" = vacancy."Id"
                  AND candidate."Stage" = 'Shortlist'
                  AND candidate."DeletedAtUtc" IS NULL
                  AND vacancy."ShortlistSentToCustomerAtUtc" IS NOT NULL;
                """);

        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CustomerSubmittedAtUtc",
                table: "VacancyCandidates");

            migrationBuilder.DropColumn(
                name: "CandidatePipelineRevision",
                table: "Vacancies");

            migrationBuilder.DropColumn(
                name: "ExperienceYears",
                table: "CandidateResumes");
        }
    }
}
