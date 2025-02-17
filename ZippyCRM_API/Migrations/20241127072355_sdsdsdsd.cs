using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ZippyCRM_API.Migrations
{
    /// <inheritdoc />
    public partial class sdsdsdsd : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_messages",
                table: "messages");

            migrationBuilder.AlterColumn<string>(
                name: "ClientUniqueId",
                table: "messages",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.AddColumn<int>(
                name: "Id",
                table: "messages",
                type: "int",
                nullable: false,
                defaultValue: 0)
                .Annotation("SqlServer:Identity", "1, 1");

            migrationBuilder.AddPrimaryKey(
                name: "PK_messages",
                table: "messages",
                column: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_messages",
                table: "messages");

            migrationBuilder.DropColumn(
                name: "Id",
                table: "messages");

            migrationBuilder.AlterColumn<string>(
                name: "ClientUniqueId",
                table: "messages",
                type: "nvarchar(450)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddPrimaryKey(
                name: "PK_messages",
                table: "messages",
                column: "ClientUniqueId");
        }
    }
}
