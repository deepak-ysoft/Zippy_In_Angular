using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ZippyCRM_API.Models
{
    public class Appointment
    {
        [Key]
        public int? AppointmentId { get; set; }
        [Required]
        public string Subject { get; set; }
        [Required]
        public string Description { get; set; }
        [Required]
        public DateTime StartDate { get; set; }
        [Required]
        public DateTime EndDate { get; set; }
        [ForeignKey("Customer")]
        public int CId { get; set; }

    }
}
