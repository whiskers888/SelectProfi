using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SelectProfi.backend.Migrations
{
    /// <inheritdoc />
    public partial class AddCandidatesAndResumesMvp : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "SelectedCandidateId",
                table: "Vacancies",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Candidates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedByExecutorId = table.Column<Guid>(type: "uuid", nullable: true),
                    FullName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Email = table.Column<string>(type: "character varying(254)", maxLength: 254, nullable: true),
                    Phone = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: true),
                    Source = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Candidates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Candidates_Users_CreatedByExecutorId",
                        column: x => x.CreatedByExecutorId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Candidates_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CandidateResumes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CandidateId = table.Column<Guid>(type: "uuid", nullable: false),
                    OwnerUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ContentJson = table.Column<string>(type: "text", nullable: false),
                    AttachmentsJson = table.Column<string>(type: "text", nullable: true),
                    PdfExportAllowed = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CandidateResumes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CandidateResumes_Candidates_CandidateId",
                        column: x => x.CandidateId,
                        principalTable: "Candidates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CandidateResumes_Users_OwnerUserId",
                        column: x => x.OwnerUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "VacancyCandidates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    VacancyId = table.Column<Guid>(type: "uuid", nullable: false),
                    CandidateId = table.Column<Guid>(type: "uuid", nullable: false),
                    AddedByExecutorId = table.Column<Guid>(type: "uuid", nullable: false),
                    Stage = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    AddedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VacancyCandidates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VacancyCandidates_Candidates_CandidateId",
                        column: x => x.CandidateId,
                        principalTable: "Candidates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_VacancyCandidates_Users_AddedByExecutorId",
                        column: x => x.AddedByExecutorId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_VacancyCandidates_Vacancies_VacancyId",
                        column: x => x.VacancyId,
                        principalTable: "Vacancies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Vacancies_SelectedCandidateId",
                table: "Vacancies",
                column: "SelectedCandidateId");

            migrationBuilder.CreateIndex(
                name: "IX_CandidateResumes_CandidateId_DeletedAtUtc",
                table: "CandidateResumes",
                columns: new[] { "CandidateId", "DeletedAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_CandidateResumes_OwnerUserId_DeletedAtUtc",
                table: "CandidateResumes",
                columns: new[] { "OwnerUserId", "DeletedAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_Candidates_CreatedByExecutorId_DeletedAtUtc",
                table: "Candidates",
                columns: new[] { "CreatedByExecutorId", "DeletedAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_Candidates_UserId",
                table: "Candidates",
                column: "UserId",
                unique: true,
                filter: "\"DeletedAtUtc\" IS NULL AND \"UserId\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_VacancyCandidates_AddedByExecutorId",
                table: "VacancyCandidates",
                column: "AddedByExecutorId");

            migrationBuilder.CreateIndex(
                name: "IX_VacancyCandidates_CandidateId_DeletedAtUtc",
                table: "VacancyCandidates",
                columns: new[] { "CandidateId", "DeletedAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_VacancyCandidates_VacancyId_CandidateId",
                table: "VacancyCandidates",
                columns: new[] { "VacancyId", "CandidateId" },
                unique: true,
                filter: "\"DeletedAtUtc\" IS NULL");

            migrationBuilder.CreateIndex(
                name: "IX_VacancyCandidates_VacancyId_Stage_DeletedAtUtc",
                table: "VacancyCandidates",
                columns: new[] { "VacancyId", "Stage", "DeletedAtUtc" });

            migrationBuilder.AddForeignKey(
                name: "FK_Vacancies_Candidates_SelectedCandidateId",
                table: "Vacancies",
                column: "SelectedCandidateId",
                principalTable: "Candidates",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Vacancies_Candidates_SelectedCandidateId",
                table: "Vacancies");

            migrationBuilder.DropTable(
                name: "CandidateResumes");

            migrationBuilder.DropTable(
                name: "VacancyCandidates");

            migrationBuilder.DropTable(
                name: "Candidates");

            migrationBuilder.DropIndex(
                name: "IX_Vacancies_SelectedCandidateId",
                table: "Vacancies");

            migrationBuilder.DropColumn(
                name: "SelectedCandidateId",
                table: "Vacancies");
        }
    }
}
