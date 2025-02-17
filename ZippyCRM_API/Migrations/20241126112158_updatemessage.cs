using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ZippyCRM_API.Migrations
{
    /// <inheritdoc />
    public partial class updatemessage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Content",
                table: "messages");

            migrationBuilder.RenameColumn(
                name: "Username",
                table: "messages",
                newName: "Message");

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "messages",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UserId",
                table: "messages");

            migrationBuilder.RenameColumn(
                name: "Message",
                table: "messages",
                newName: "Username");

            migrationBuilder.AddColumn<string>(
                name: "Content",
                table: "messages",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }
    }
}
