using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddCandidateResumeSpecializationAndAttachments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "SpecializationId",
                table: "CandidateResumes",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateTable(
                name: "CandidateResumeAttachments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CandidateResumeId = table.Column<Guid>(type: "uuid", nullable: false),
                    OriginalFileName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    StoredFileName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    ContentType = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    Length = table.Column<long>(type: "bigint", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CandidateResumeAttachments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CandidateResumeAttachments_CandidateResumes_CandidateResume~",
                        column: x => x.CandidateResumeId,
                        principalTable: "CandidateResumes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CandidateResumes_SpecializationId",
                table: "CandidateResumes",
                column: "SpecializationId");

            migrationBuilder.CreateIndex(
                name: "IX_CandidateResumeAttachments_CandidateResumeId",
                table: "CandidateResumeAttachments",
                column: "CandidateResumeId");

            migrationBuilder.CreateIndex(
                name: "IX_CandidateResumeAttachments_StoredFileName",
                table: "CandidateResumeAttachments",
                column: "StoredFileName",
                unique: true);

            migrationBuilder.Sql("""
                INSERT INTO "OrderSpecializations" ("Id", "Name", "IsActive", "SortOrder", "CreatedAtUtc", "UpdatedAtUtc")
                VALUES ('00000000-0000-0000-0000-000000000000', 'Не указана', FALSE, 0, NOW(), NOW())
                ON CONFLICT ("Id") DO NOTHING;
                """);

            migrationBuilder.AddForeignKey(
                name: "FK_CandidateResumes_OrderSpecializations_SpecializationId",
                table: "CandidateResumes",
                column: "SpecializationId",
                principalTable: "OrderSpecializations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CandidateResumes_OrderSpecializations_SpecializationId",
                table: "CandidateResumes");

            migrationBuilder.DropTable(
                name: "CandidateResumeAttachments");

            migrationBuilder.DropIndex(
                name: "IX_CandidateResumes_SpecializationId",
                table: "CandidateResumes");

            migrationBuilder.DropColumn(
                name: "SpecializationId",
                table: "CandidateResumes");
        }
    }
}
