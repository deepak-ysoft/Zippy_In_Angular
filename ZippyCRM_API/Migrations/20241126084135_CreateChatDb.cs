using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ZippyCRM_API.Migrations
{
    /// <inheritdoc />
    public partial class CreateChatDb : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "isMarked",
                table: "messages");

            migrationBuilder.DropColumn(
                name: "message",
                table: "messages");

            migrationBuilder.DropColumn(
                name: "receiverId",
                table: "messages");

            migrationBuilder.DropColumn(
                name: "receiverMobileNo",
                table: "messages");

            migrationBuilder.DropColumn(
                name: "sendTime",
                table: "messages");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "messages",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "senderName",
                table: "messages",
                newName: "Username");

            migrationBuilder.RenameColumn(
                name: "senderImagePath",
                table: "messages",
                newName: "Content");

            migrationBuilder.AddColumn<DateTime>(
                name: "Timestamp",
                table: "messages",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Timestamp",
                table: "messages");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "messages",
                newName: "id");

            migrationBuilder.RenameColumn(
                name: "Username",
                table: "messages",
                newName: "senderName");

            migrationBuilder.RenameColumn(
                name: "Content",
                table: "messages",
                newName: "senderImagePath");

            migrationBuilder.AddColumn<bool>(
                name: "isMarked",
                table: "messages",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "message",
                table: "messages",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "receiverId",
                table: "messages",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "receiverMobileNo",
                table: "messages",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "sendTime",
                table: "messages",
                type: "datetime2",
                nullable: true);
        }
    }
}
