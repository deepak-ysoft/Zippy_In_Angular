using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ZippyCRM_API.Migrations
{
    /// <inheritdoc />
    public partial class sssss : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "sendTime",
                table: "ContactUs",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.CreateTable(
                name: "messages",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    senderName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    receiverId = table.Column<int>(type: "int", nullable: true),
                    receiverMobileNo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    senderImagePath = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    message = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    isMarked = table.Column<bool>(type: "bit", nullable: false),
                    sendTime = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_messages", x => x.id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "messages");

            migrationBuilder.AlterColumn<DateTime>(
                name: "sendTime",
                table: "ContactUs",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);
        }
    }
}
