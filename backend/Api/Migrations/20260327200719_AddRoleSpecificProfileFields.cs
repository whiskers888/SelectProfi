using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SelectProfi.backend.Migrations
{
    /// <inheritdoc />
    public partial class AddRoleSpecificProfileFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ApplicantAbout",
                table: "Users",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ApplicantAchievements",
                table: "Users",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ApplicantCertificates",
                table: "Users",
                type: "character varying(4000)",
                maxLength: 4000,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "ApplicantDesiredSalary",
                table: "Users",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ApplicantEducation",
                table: "Users",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ApplicantExperienceSummary",
                table: "Users",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ApplicantPortfolioUrl",
                table: "Users",
                type: "character varying(512)",
                maxLength: 512,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ApplicantPreviousCompanyName",
                table: "Users",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ApplicantResumeTitle",
                table: "Users",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ApplicantSkills",
                table: "Users",
                type: "character varying(4000)",
                maxLength: 4000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ApplicantWorkPeriod",
                table: "Users",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CustomerCompanyLogoUrl",
                table: "Users",
                type: "character varying(512)",
                maxLength: 512,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CustomerCompanyName",
                table: "Users",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CustomerEgrn",
                table: "Users",
                type: "character varying(13)",
                maxLength: 13,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CustomerEgrnip",
                table: "Users",
                type: "character varying(15)",
                maxLength: 15,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CustomerInn",
                table: "Users",
                type: "character varying(12)",
                maxLength: 12,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ExecutorAchievements",
                table: "Users",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ExecutorCertificates",
                table: "Users",
                type: "character varying(4000)",
                maxLength: 4000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ExecutorEmploymentType",
                table: "Users",
                type: "character varying(16)",
                maxLength: 16,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ExecutorExperienceSummary",
                table: "Users",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ExecutorExtraInfo",
                table: "Users",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ExecutorGrade",
                table: "Users",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ExecutorProjectCompanyName",
                table: "Users",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ExecutorProjectTitle",
                table: "Users",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ApplicantAbout",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "ApplicantAchievements",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "ApplicantCertificates",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "ApplicantDesiredSalary",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "ApplicantEducation",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "ApplicantExperienceSummary",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "ApplicantPortfolioUrl",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "ApplicantPreviousCompanyName",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "ApplicantResumeTitle",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "ApplicantSkills",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "ApplicantWorkPeriod",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "CustomerCompanyLogoUrl",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "CustomerCompanyName",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "CustomerEgrn",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "CustomerEgrnip",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "CustomerInn",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "ExecutorAchievements",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "ExecutorCertificates",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "ExecutorEmploymentType",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "ExecutorExperienceSummary",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "ExecutorExtraInfo",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "ExecutorGrade",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "ExecutorProjectCompanyName",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "ExecutorProjectTitle",
                table: "Users");
        }
    }
}
