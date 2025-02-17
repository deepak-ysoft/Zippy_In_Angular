using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ZippyCRM_API.Models
{
    public class ContactUs
    {
        [Key]
        public int? id { get; set; }
        [Required]
        [RegularExpression("^[A-Za-z\\s]+(?: [A-Za-z0-9\\s]+)*$", ErrorMessage = "Please enter a valid name!!")]
        public string Name { get; set; }
        [Required]
        [RegularExpression("^[a-zA-Z0-9._%+-]+@[a-zA-Z.-]+\\.[a-zA-Z]{2,}$", ErrorMessage = "Please enter a valid email address.")]
        public string Email { get; set; }
        [Required]
        public string Subject { get; set; }
        [Required]
        public string Message { get; set; }
        [ForeignKey("Users")]
        public int UserId { get; set; }
        public bool isMarked { get; set; }
        public DateTime? sendTime { get; set; }
    }
}
