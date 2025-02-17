using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ZippyCRM_API.Models;
using ZippyCRM_API.Services;

namespace ZippyCRM_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly UserDbContext _db;
        private readonly AccountService _ser;
        private readonly AuthService _authService;
        public AccountController(UserDbContext db, AccountService ser, AuthService authService)
        {
            _db = db; // Database DI
            _ser = ser; // Services DI
            _authService = authService; // Generate Token DI
        }

        [HttpGet] // Add this attribute to specify that this method responds to GET requests
        [Route("GetUsersList")]
        public async Task<IActionResult> GetUsersList()
        {
            var users = await _db.Users.ToListAsync(); // To get user list.
            return Ok(users);
        }

        [HttpGet] // Add this attribute to specify that this method responds to GET requests
        [Route("GetJobList")]
        public async Task<IActionResult> GetJobsList()
        {
            var job = await _db.Job.ToListAsync(); // To get job list
            return Ok(job);
        }

        /// <summary>
        /// To register a user
        /// </summary>
        /// <param name="users"> user model</param>
        /// <returns>true if regiter is success.</returns>
        [HttpPost]
        [Route("Register")]
        public async Task<IActionResult> Register([FromForm] Users users)
        {
            // If model validation fails, this block won't be reached due to [ApiController]
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                var emailExists = await _db.Users.AnyAsync(u => u.Email.ToLower() == users.Email.ToLower()); // To check duplicate emails.
                var mobileNumberExists = await _db.Users.AnyAsync(u => u.Phone == users.Phone); // To check duplicate mobile number.
                if (emailExists)
                {
                    return Ok(new { success = false , exists = "EmailExists" });
                }
                if (mobileNumberExists)
                {
                    return Ok(new { success = false, exists = "MobileNumberExists" });
                }

                // Handle file upload and user creation logic...
                string fileName = users.Photo.FileName.ToString() != "Default.jpg" ? _ser.UploadUserPhoto(users.Photo) : "Default.jpg"; //If User Photo field is null then make it "Default.jpg".
                fileName = "https://localhost:7269/uploads/images/users/" + fileName; // File name with url.

                var hasher = new PasswordHasher<Users>();
                var newUser = new Users()
                {
                    Username = users.Username,
                    Email = users.Email,
                    Password = hasher.HashPassword(users, users.Password),// Hashed password.
                    Company = users.Company,
                    Country = users.Country,
                    Address = users.Address,
                    Phone = users.Phone,
                    Discription = users.Discription,
                    ImagePath = fileName,
                    JobId = users.JobId,
                    AccountSetup = false,
                    IsActive = false,
                    AccountStatus = AccountStatus.Inactive // Default
                };

                await _db.Users.AddAsync(newUser);
                await _db.SaveChangesAsync();

                return Ok(new { success = true });
            }
            catch (DbUpdateException dbEx)
            {
                // Log the database exception
                Console.WriteLine($"Database error: {dbEx.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while saving the data.");
            }
            catch (Exception ex)
            {
                // Log the general exception
                Console.WriteLine($"Error: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "An unexpected error occurred.");
            }
        }


        /// <summary>
        /// To login user
        /// </summary>
        /// <param name="model">login model</param>
        /// <returns>if login success then return logged user data,User job and login token.</returns>
        [HttpPost("login")] // Specify the route for the API method
        public async Task<IActionResult> Login([FromBody] login model) // Expect the request body to contain the Users object
        {
            try
            {
                if (await _ser.UserLoginAsync(model)) // Check user is exist or not 
                {
                    var userData = _db.Users.FirstOrDefault(x => x.Email.ToLower() == model.email.ToLower()); // Get UserData by email
                    if (userData == null)
                    {
                        return NotFound("User not found.");
                    }
                    // Instead of using session, you might return a token or user info as needed
                    HttpContext.Session.SetInt32("UserId", userData.UserId);

                    var jobName = (from user in _db.Users
                                   join job in _db.Job on user.JobId equals job.JobId
                                   where user.UserId == userData.UserId && user.JobId == userData.JobId
                                   select job.JobName).FirstOrDefault();
                    var token = _authService.GenerateJwtToken(userData.UserId.ToString()); // Call AuthService
                    return Ok(new
                    {
                        User = userData,
                        UserJob = jobName,
                        Token = token
                    });
                }
                else
                {
                    return Ok(false);
                }
            }
            catch (Exception ex)
            {
                // Log the exception here if needed
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while processing your request.");
            }
        }

        /// <summary>
        /// Here we enter email to reset the user password.
        /// </summary>
        /// <param name="model">Model</param>
        /// <returns>true if email successfully recieved to user.</returns>
        [HttpPost]
        [Route("forgotpassword")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            string token = "sampleToken";
            string resetLink = $"http://localhost:4200/user-reset-password?token={token}";  

            // Call the ForgotPasswordAsync method in your AccountService
            var (isSuccess, errorMessage) = await _ser.ForgotPasswordAsync(model.Email, resetLink);

            if (!isSuccess)
            {
                return Ok(false);
            }

            return Ok(true);
        }
        
        /// <summary>
         /// To Reset the user password
         /// </summary>
         /// <param name="model">Reset password model</param>
         /// <returns>true if password reset is successfully done.</returns>
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordVM model)
        {
            try
            {
                // Generate the reset link
                var resetLink = $"http://localhost:4200/login";

                // Validate password and confirm password fields
                if (ModelState.IsValid)
                {
                    // Call the asynchronous ResetPassword method in the service
                    var (isSuccess, errorMessage) = await _ser.ResetPasswordAsync(model, resetLink);

                    if (isSuccess)
                    {
                        return Ok(true);
                    }
                }
                return Ok(false);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred", error = ex.Message });
            }
        }
    }
}
