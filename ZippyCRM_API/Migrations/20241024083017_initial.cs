using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ZippyCRM_API.Migrations
{
    /// <inheritdoc />
    public partial class initial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Addresses",
                columns: table => new
                {
                    addressId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    addressName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    address = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    phone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    mobile = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    internalNotes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    customerId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Addresses", x => x.addressId);
                });

            migrationBuilder.CreateTable(
                name: "Appointment",
                columns: table => new
                {
                    AppointmentId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Subject = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Appointment", x => x.AppointmentId);
                });

            migrationBuilder.CreateTable(
                name: "Contact",
                columns: table => new
                {
                    ContactId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ContactName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    JobPosition = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Mobile = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    InternalNotes = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Contact", x => x.ContactId);
                });

            migrationBuilder.CreateTable(
                name: "Customer",
                columns: table => new
                {
                    CId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PAN = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    GST = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Title = table.Column<int>(type: "int", nullable: true),
                    FirstName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MiddleName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LastName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Position = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Gender = table.Column<int>(type: "int", nullable: true),
                    DayOfBirth = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Phone = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhoneOther = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Cell = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Fax = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Email2 = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Website = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Language = table.Column<int>(type: "int", nullable: true),
                    Comments = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Imagepath = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Customer", x => x.CId);
                });

            migrationBuilder.CreateTable(
                name: "Job",
                columns: table => new
                {
                    JobId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    JobName = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Job", x => x.JobId);
                });

            migrationBuilder.CreateTable(
                name: "Notes",
                columns: table => new
                {
                    notesId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    customerId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    createDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    updateDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notes", x => x.notesId);
                });

            migrationBuilder.CreateTable(
                name: "Task",
                columns: table => new
                {
                    taskId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    activityType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    summary = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    dueDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    comments = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    customerId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    createDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    updateDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Task", x => x.taskId);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    UserId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Username = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Company = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Country = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Address = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Phone = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Discription = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    JobId = table.Column<int>(type: "int", nullable: false),
                    ImagePath = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Password = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AccountSetup = table.Column<bool>(type: "bit", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    AccountStatus = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.UserId);
                    table.ForeignKey(
                        name: "FK_Users_Job_JobId",
                        column: x => x.JobId,
                        principalTable: "Job",
                        principalColumn: "JobId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserInfo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Firstname = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Middlename = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Lastname = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ContactNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Address = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UserId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserInfo", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserInfo_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "UserId");
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserInfo_UserId",
                table: "UserInfo",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_JobId",
                table: "Users",
                column: "JobId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Addresses");

            migrationBuilder.DropTable(
                name: "Appointment");

            migrationBuilder.DropTable(
                name: "Contact");

            migrationBuilder.DropTable(
                name: "Customer");

            migrationBuilder.DropTable(
                name: "Notes");

            migrationBuilder.DropTable(
                name: "Task");

            migrationBuilder.DropTable(
                name: "UserInfo");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Job");
        }
    }
}
