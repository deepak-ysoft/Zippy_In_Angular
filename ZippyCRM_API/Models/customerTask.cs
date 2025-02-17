using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ZippyCRM_API.Models
{
    public class customerTask
    {
        [Key]
        public int taskId { get; set; }
        [Required(ErrorMessage = "Activity Type is required.")]
        public string activityType { get; set; }
        [Required]
        public string summary { get; set; }
        [Required]
        public DateTime dueDate { get; set; }
        [Required]
        public string comments { get; set; }
        public int customerId { get; set; }
        public int UserId { get; set; }
        [NotMapped]
        public string? Username { get; set; }
        public DateTime? createDate { get; set; }
        public DateTime? updateDate { get; set; }
    }
}
