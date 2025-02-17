using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ZippyCRM_API.Models
{
    public class Customer
    {
        [Key]
        public int? CId { get; set; }
        [NotMapped]
        public Types? Type { get; set; }
        public string? PAN { get; set; }
        public string? GST { get; set; }
        [Required(ErrorMessage = "Must select your title.")]
        public Title? Title { get; set; }
        [Required(ErrorMessage = "Please enter your first name.")]
        [RegularExpression("^[A-Za-z]*$", ErrorMessage = "Please enter a valid name!!")]
        public string? FirstName { get; set; }
        public string? MiddleName { get; set; }
        [Required(ErrorMessage = "Please enter your Last name.")]
        public string? LastName { get; set; }
        [Required(ErrorMessage = "Please enter your position.")]
        public string? Position { get; set; }
        [Required(ErrorMessage = "Please select your gender.")]
        public Gender? Gender { get; set; }
        [Required(ErrorMessage = "Please enter your DOB.")]
        [AgeLimit(18, 100)] // Example: Age must be between 18 to 100 years.
        public DateTime? DayOfBirth { get; set; }
        [Required(ErrorMessage = "Please enter your phone number.")]
        public string? Phone { get; set; }
        [Required(ErrorMessage = "Please enter your second phone number.")]
        public string? PhoneOther { get; set; }
        [Required(ErrorMessage = "Please enter your cell number.")]
        public string? Cell { get; set; }
        [Required(ErrorMessage = "Please enter your fax.")]
        public string? Fax { get; set; }
        [Required(ErrorMessage = "Please enter your email.")]
        [RegularExpression("^[a-zA-Z0-9._%+-]+@[a-zA-Z.-]+\\.[a-zA-Z]{2,}$", ErrorMessage = "Please enter a valid email address.")]
        public string? Email { get; set; }
        [Required(ErrorMessage = "Please enter your second email.")]
        [RegularExpression("^[a-zA-Z0-9._%+-]+@[a-zA-Z.-]+\\.[a-zA-Z]{2,}$", ErrorMessage = "Please enter a valid email address.")]
        public string? Email2 { get; set; }
        [Required(ErrorMessage = "Please enter your website.")]
        public string? Website { get; set; }
        [Required(ErrorMessage = "Please select your language.")]
        public Language? Language { get; set; }
        public string? Comments { get; set; }
        public string? Imagepath { get; set; }
        [NotMapped]
        public IFormFile? Photo { get; set; }
        public string? FullName
        {
            get
            {
                // Combine the parts and trim any extra spaces
                return $"{Title.ToString() ?? string.Empty} {FirstName ?? string.Empty} {MiddleName ?? string.Empty} {LastName ?? string.Empty}".Trim();
            }
        }
    }
    public enum Types
    {
        Individual = 1,
        Commercial = 2
    }
    public enum Gender
    {
        Male = 1,
        Female = 2,
        Other = 3
    }
    public enum Language
    {
        Hindi = 1,
        English = 2,
        Rajasthani = 3,
        Gujrati = 4,
        Tamil = 5,
    }
    public enum Title
    {
        Mr = 1,
        Miss = 2,
        Ms = 3,
        Mrs = 4
    }
    public class AgeLimitAttribute : ValidationAttribute
    {
        private readonly int _minimumAge;
        private readonly int _maximumAge;
        public AgeLimitAttribute(int minimumAge, int maximumAge)
        {
            _minimumAge = minimumAge;
            _maximumAge = maximumAge;
        }
        protected override ValidationResult IsValid(object value, ValidationContext validationContext)
        {
            if (value is DateTime birthDate)
            {
                var age = DateTime.Today.Year - birthDate.Year;

                // Adjust if the birthday hasn't occurred yet this year
                if (birthDate.Date > DateTime.Today.AddYears(-age)) age--;

                if (age < _minimumAge || age > _maximumAge)
                {
                    return new ValidationResult($"Age must be between {_minimumAge} to {_maximumAge} years.");
                }
            }
            return ValidationResult.Success;
        }
    }
}
