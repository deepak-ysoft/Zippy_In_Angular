using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ZippyCRM_API.Migrations
{
    /// <inheritdoc />
    public partial class addis : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "isMarked",
                table: "ContactUs",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "isMarked",
                table: "ContactUs");
        }
    }
}
