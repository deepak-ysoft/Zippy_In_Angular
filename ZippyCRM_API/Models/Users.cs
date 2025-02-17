using Microsoft.AspNetCore.Mvc.Rendering;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ZippyCRM_API.Models
{
    public class Users
    {
        [Key]
        public int UserId { get; set; }

        [Required(ErrorMessage = "User name is required.")]
        [RegularExpression("^[A-Za-z\\s]+(?: [A-Za-z0-9\\s]+)*$", ErrorMessage = "Please enter a valid name!!")]
        public string Username { get; set; }
        [Required(ErrorMessage = "Please enter company Name.")]
        public string Company { get; set; }
        [Required(ErrorMessage = "Please enter Country.")]
        public string Country { get; set; }

        [Required(ErrorMessage = "Please enter Address.")]
        public string Address { get; set; }

        [Required(ErrorMessage = "Please enter Phone Number.")]
        public string Phone { get; set; }

        [Required(ErrorMessage = "Please enter Discription.")]
        public string Discription { get; set; }

        [Required(ErrorMessage = "Please enter Job name.")]
        public int JobId { get; set; }

        public Job? Job { get; set; }

        [NotMapped]
        public List<SelectListItem>? JobList { get; set; } = new List<SelectListItem>();

        public string? ImagePath { get; set; }

        [NotMapped]
        public IFormFile? Photo { get; set; }

        [Required(ErrorMessage = "Email is required.")]
        [RegularExpression("^[a-zA-Z0-9._%+-]+@[a-zA-Z.-]+\\.[a-zA-Z]{2,}$", ErrorMessage = "Please enter a valid email address.")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Password is required.")]
        [DataType(DataType.Password)]
        [RegularExpression("^(?=.*[a-zA-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*#?&]{8,}$", ErrorMessage = "Must Enter At Least 8 characters and must include Uppercase, Lowercase, digit and Special character")]
        public string? Password { get; set; }

        [Required(ErrorMessage = "Confirm Password is required.")]
        [DataType(DataType.Password)]
        [NotMapped]
        [Compare("Password", ErrorMessage = "Your password is not maching with privious password!!")]
        public string? CPassword { get; set; }

        public bool? AccountSetup { get; set; } = false; // Assuming default to false

        public bool? IsActive { get; set; } = false; // Assuming default to false

        public AccountStatus AccountStatus { get; set; } = AccountStatus.Inactive; // Default to Inactive
    }

    public enum AccountStatus
    {
        Active = 0,
        Inactive = 1,
        Deleted = 2
    }
}