using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ZippyCRM_API.Models
{
    public class Contact
    {
        [Key]
        public int ContactId { get; set; }
        [RegularExpression("^[A-Za-z\\s]+(?: [A-Za-z0-9\\s]+)*$", ErrorMessage = "Please enter a valid Name!!")]
        [Required(ErrorMessage = "Please enter contact name.")]
        public string ContactName { get; set; }
        [RegularExpression("^[a-zA-Z0-9._%+-]+@[a-zA-Z.-]+\\.[a-zA-Z]{2,}$", ErrorMessage = "Please enter a valid email address.")]
        [Required(ErrorMessage = "Please enter Email.")]
        public string Email { get; set; }
        [Required(ErrorMessage = "Please enter Title.")]
        public string Title { get; set; }
        [Required(ErrorMessage = "Please enter Phone.")]
        public string Phone { get; set; }
        [Required(ErrorMessage = "Please enter Job Position.")]
        public string JobPosition { get; set; }
        [Required(ErrorMessage = "Please enter Mobile Number.")]
        public string Mobile { get; set; }
        [Required(ErrorMessage = "Please enter Internal Notes.")]
        public string InternalNotes { get; set; }
        [ForeignKey("Customer")]
        public int CId { get; set; }
    }
}
