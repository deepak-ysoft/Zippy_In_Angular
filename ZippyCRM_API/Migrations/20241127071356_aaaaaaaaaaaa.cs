using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ZippyCRM_API.Migrations
{
    /// <inheritdoc />
    public partial class aaaaaaaaaaaa : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_messages",
                table: "messages");

            migrationBuilder.DropColumn(
                name: "Id",
                table: "messages");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "messages");

            migrationBuilder.DropColumn(
                name: "senderId",
                table: "messages");

            migrationBuilder.RenameColumn(
                name: "Timestamp",
                table: "messages",
                newName: "Date");

            migrationBuilder.RenameColumn(
                name: "Message",
                table: "messages",
                newName: "Type");

            migrationBuilder.AddColumn<string>(
                name: "ClientUniqueId",
                table: "messages",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Content",
                table: "messages",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddPrimaryKey(
                name: "PK_messages",
                table: "messages",
                column: "ClientUniqueId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_messages",
                table: "messages");

            migrationBuilder.DropColumn(
                name: "ClientUniqueId",
                table: "messages");

            migrationBuilder.DropColumn(
                name: "Content",
                table: "messages");

            migrationBuilder.RenameColumn(
                name: "Type",
                table: "messages",
                newName: "Message");

            migrationBuilder.RenameColumn(
                name: "Date",
                table: "messages",
                newName: "Timestamp");

            migrationBuilder.AddColumn<int>(
                name: "Id",
                table: "messages",
                type: "int",
                nullable: false,
                defaultValue: 0)
                .Annotation("SqlServer:Identity", "1, 1");

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "messages",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "senderId",
                table: "messages",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddPrimaryKey(
                name: "PK_messages",
                table: "messages",
                column: "Id");
        }
    }
}
