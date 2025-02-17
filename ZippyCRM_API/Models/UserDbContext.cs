using Microsoft.EntityFrameworkCore;
using ZippyCRM_API.Hub;

namespace ZippyCRM_API.Models
{
    public class UserDbContext : DbContext
    {
        public UserDbContext(DbContextOptions<UserDbContext> options) : base(options){}
        public DbSet<Users> Users { get; set; }
        public DbSet<UserInfo> UserInfo { get; set; }
        public DbSet<Job> Job { get; set; }
        public DbSet<Customer> Customer { get; set; }
        public DbSet<Contact> Contact { get; set; }
        public DbSet<Addresses> Addresses { get; set; }
        public DbSet<customerTask> Task { get; set; }
        public DbSet<customerNotes> Notes { get; set; }
        public DbSet<Appointment> Appointment { get; set; } 
        public DbSet<ContactUs> ContactUs { get; set; }
        public DbSet<ChatMessage> ChatMessages { get; set; }
    }
}
