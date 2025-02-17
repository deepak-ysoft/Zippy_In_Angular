using System.ComponentModel.DataAnnotations;

namespace ZippyCRM_API.Models
{
    public class ChangePasswordVM
    {
        [Key]
        public int userId { get; set; }
        public string? CurrentPassword { get; set; } 
        public string? NewPassword { get; set; }
        public string? NewCPassword { get; set; }
    }
}
