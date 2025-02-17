using System.ComponentModel.DataAnnotations;

namespace ZippyCRM_API.Models
{
    public class UserInfo
    {
        [Key]
        public int Id { get; set; }
        public string? Firstname { get; set; }
        public string? Middlename { get; set; }
        public string? Lastname { get; set; }
        public string? ContactNo { get; set; }
        public string? Address { get; set; }
        public Users? User { get; set; }
    }
}
