using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SendGrid;
using SendGrid.Helpers.Mail;
using ZippyCRM_API.Models;

namespace ZippyCRM_API.Services
{
    public class AccountService
    {

        private readonly IWebHostEnvironment _env;
        private readonly string _uploadsFolder;
        private readonly UserDbContext _db;
        private readonly IConfiguration _configuration;
        public AccountService(IWebHostEnvironment env, IConfiguration configuration, UserDbContext db, IConfiguration configuration1)
        {
            _env = env; // Web Host Environment like project files path
            _uploadsFolder = Path.Combine(_env.ContentRootPath, configuration["FileUpload:UploadFolder"]);
            Directory.CreateDirectory(_uploadsFolder); // Create the directory if it doesn't exist
            _db = db;
            _configuration = configuration1;
        }

        // To upload user image when user select image
        public string UploadUserPhoto(IFormFile photo)
        {
            if (photo == null || photo.Length == 0)
            { return null; }
            string shortGuid = Guid.NewGuid().ToString().Substring(0, 8);
            string timestamp = DateTime.UtcNow.ToString("yyyyMMddHHmmss");
            string originalName = Path.GetFileNameWithoutExtension(photo.FileName);

            // Shorten the original name if it’s longer than 10 characters
            string shortenedName = originalName.Length > 10 ? originalName.Substring(0, 10) : originalName;

            string folder = Path.Combine(_env.ContentRootPath, "uploads/images/users");
            string fileName = $"{shortGuid}_{timestamp}_{shortenedName}{Path.GetExtension(photo.FileName)}";
            string filePath = Path.Combine(folder, fileName);
            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                photo.CopyTo(fileStream);
            }
            return fileName;
        }

        // Check user is valid or not
        public async Task<bool> UserLoginAsync(login model)
        {
            var hasher = new PasswordHasher<Users>();
            var user1 = await _db.Users.SingleOrDefaultAsync(u => u.Email == model.email);
            if (user1 != null)
            {
                var passwordVerificationResult = hasher.VerifyHashedPassword(user1, user1.Password, model.password); // To verify password
                if (passwordVerificationResult == PasswordVerificationResult.Success)
                    return true;
            }
            return false;
        }

        /// <summary>
        /// For forgot password send a email to the user
        /// </summary>
        /// <param name="email">user email</param>
        /// <param name="resetLink">reset link</param>
        /// <returns>true or false</returns>
        public async Task<(bool isSuccess, string errorMessage)> ForgotPasswordAsync(string email, string resetLink)
        {
            string errorMessage = string.Empty;

            // Fetch user from the database asynchronously
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);

            if (user == null)
            {
                errorMessage = "User not found!";
                return (false, errorMessage);
            }

            var subject = "Password Reset Request";
            var message = $"Click <a href='{resetLink}'>here</a> to reset your password.";

            try
            {
                // Send email with reset link using SendGrid asynchronously
                await SendEmailAsync(user.Email, subject, message);
                return (true, string.Empty); // Success
            }
            catch (Exception ex)
            {
                errorMessage = $"An error occurred while sending the email: {ex.Message}";
                return (false, errorMessage); // Failure
            }
        }

        /// <summary>
        /// To sent email to user 
        /// </summary>
        /// <param name="email">user email</param>
        /// <param name="subject">Email subject</param>
        /// <param name="message">Email message</param>
        /// <returns></returns>
        public async Task SendEmailAsync(string email, string subject, string message)
        {
            try
            {
                var apiKey = _configuration["SendGrid:ApiKey"]; // SendGrid key
                var client = new SendGridClient(apiKey);
                var from = new EmailAddress(_configuration["SendGrid:FromEmail"], "Deepak Saini"); // Varified email by sendGrid
                var to = new EmailAddress(email); // User email witch user you want to send email
                var plainTextContent = message;
                var htmlContent = message;
                var msg = MailHelper.CreateSingleEmail(from, to, subject, plainTextContent, htmlContent);
                var response = await client.SendEmailAsync(msg);
                // Check if the email was successfully sent
                if (response.StatusCode != System.Net.HttpStatusCode.OK &&
                    response.StatusCode != System.Net.HttpStatusCode.Accepted)
                {
                    throw new Exception($"Failed to send email. StatusCode: {response.StatusCode}");
                }
            }
            catch (Exception ex)
            {
                // Log the exception or rethrow
                Console.WriteLine($"Error sending email: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// To reset password 
        /// </summary>
        /// <param name="model">Reset Password model</param>
        /// <param name="resetLink">Reset Link</param>
        /// <returns></returns>
        public async Task<(bool isSuccess, string errorMessage)> ResetPasswordAsync(ResetPasswordVM model, string resetLink)
        {
            string errorMessage = string.Empty;
            // Check if user exists
            var user = await _db.Users.SingleOrDefaultAsync(u => u.Email == model.Email);
            if (user == null)
            {
                errorMessage = "User not found.";
                return (false, errorMessage);
            }

            // Hash the password
            var hasher = new PasswordHasher<Users>();
            user.Password = hasher.HashPassword(user, model.NewPassword);

            // Update user and save changes asynchronously
            _db.Users.Update(user);
            int result = await _db.SaveChangesAsync();
            if (result > 0)
            {
                // Send email with reset link using SendGrid asynchronously
                var subject = "Password Changed";
                var message = $"Your password was successfully changed. Click <a href='{resetLink}'>here</a> to login ZippyCRM.";
                await SendEmailAsync(user.Email, subject, message);

                return (true, string.Empty); // Success with no error message
            }

            errorMessage = "Failed to update the password.";
            return (false, errorMessage);
        }

    }
}
