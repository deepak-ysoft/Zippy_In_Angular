namespace ZippyCRM_API.Models
{
    public class ResetPasswordVM
    {
        public string? Email { get; set; }
        public string? NewPassword { get; set; }
        public string? NewCPassword { get; set; }
    }
}
