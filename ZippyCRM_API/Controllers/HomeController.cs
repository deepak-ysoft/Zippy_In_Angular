using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using SendGrid.Helpers.Mail;
using ZippyCRM_API.Models;

namespace ZippyCRM_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HomeController : ControllerBase
    {

        private readonly UserDbContext _db;
        private readonly Services.HomeServices _ser;
        public HomeController(UserDbContext db, Services.HomeServices ser)
        {
            _db = db; // Database DI
            _ser = ser; // DI for service
        }


        [HttpGet]
        [Route("Index")]
        public async Task<IActionResult> Index()
        {
            return await Task.FromResult(Ok(new { message = "API Index action" }));
        }

        /// <summary>
        /// Returns user profile details as JSON.
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        [Route("UsersProfile")]
        public async Task<IActionResult> UsersProfile()
        {
            try
            {
                var id = HttpContext.Session.GetInt32("UserId"); // Get session value 
                if (id == 0)
                {
                    return BadRequest(new { message = "User ID is not found in session." });
                }

                var user = await _db.Users
                    .Include(e => e.Job) // Eager load the Job if necessary
                    .FirstOrDefaultAsync(e => e.UserId == id);

                if (user == null)
                {
                    return NotFound(new { message = "User not found." });
                }

                user.JobList = await _ser.GetJobListAsync(); // This method can remain synchronous if it doesn't involve database access
                return Ok(user); // Return user profile details as JSON
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error.", details = ex.Message });
            }
        }

        /// <summary>
        /// Update user in Database table.
        /// </summary>
        /// <param name="user">User class object with properties value.</param>
        /// <returns></returns>
        [HttpPost("EditUser")]
        public async Task<IActionResult> Edit([FromForm] Users user)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var hasher = new PasswordHasher<Users>();
            var toCheckPassword = await _db.Users.FirstOrDefaultAsync(us => us.UserId == user.UserId);
            var passwordVerificationResult = hasher.VerifyHashedPassword(toCheckPassword, toCheckPassword.Password, user.Password); // To verify password
            if (passwordVerificationResult != PasswordVerificationResult.Success)
            {
                return Ok(new { success = false, message = "Password Not Match" });
            }

            var res = await _ser.UpdateUserAsync(user);// Update the user

            var jobName = (from user1 in _db.Users
                           join job in _db.Job on user1.JobId equals job.JobId
                           where user1.UserId == user.UserId && user1.JobId == user.JobId
                           select job.JobName).FirstOrDefault();

            if (res != null)
            {
                return Ok(new
                {
                    success = true,
                    User = res,
                    UserJob = jobName
                });
            }
            return Ok(new { success = false, message = "" });
        }

        /// <summary>
        /// Deletes the user's image asynchronously.
        /// </summary>
        /// <returns></returns>
        // NOT USEING
        [HttpDelete] // Specify the HTTP method for this API action
        [Route("DeleteImage/{userId}")]
        public async Task<IActionResult> DeleteImage(int userId)
        {

            // Ensure userId is valid
            if (userId == 0)
            {
                return Ok(false);
            }

            // Call the service method asynchronously
            var result = await _ser.DeleteUserImageAsync(userId);

            // Return appropriate response based on the result
            if (result != null)
            {
                return Ok(new { success = true, rst = result });
            }
            return Ok(new { success = false, rst = result });
        }

        /// <summary>
        /// ChangePassword in Database Table.
        /// </summary>
        /// <param name="userObj">Users class object with properties value.</param>
        /// <returns></returns>
        [HttpPost("ChangePassword")]
        public async Task<IActionResult> ChangePassword([FromForm] ChangePasswordVM model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var result = await _ser.ChangePasswordAsync(model); // Assuming ChangePassword is now async
            if (result.Success) // Assuming ChangePassword returns a result with IsSuccess property
            {
                return Ok(true); // or return the updated user object
            }
            else
            {
                return Ok(false);
            }

        }

        //============================== ContactUs =======================

        /// <summary>
        /// To add coontact us 
        /// </summary>
        /// <param name="contactUs">model</param>
        /// <returns>boolean value</returns>
        [HttpPost("ContactUs")]
        public async Task<ActionResult> ContactUsCreate(ContactUs contactUs)
        {
            if (!ModelState.IsValid) { return BadRequest(ModelState); }

            bool res = await _ser.addContactUs(contactUs); // call service to add
            return Ok(res);
        }

        /// <summary>
        /// To get contactUs list according to user 
        /// </summary>
        /// <param name="UserId">user id</param>
        /// <returns>list of contactUs</returns>
        [HttpGet("ContactUsList/{UserId}")]
        public async Task<ActionResult> GetContactUsList(int UserId)
        {
            var list = _ser.getContactUsList(UserId); // call service to get list
            return Ok(new { success = true, res = list });
        }

        /// <summary>
        /// Update contact us when user click message to read
        /// </summary>
        /// <param name="id">Contact us id</param>
        /// <returns>boolean</returns>
        [HttpPut("UpdateContactUs/{id}")]
        public async Task<ActionResult> UpdateContactUs(int id)
        {
            bool res = await _ser.updateContactUs(id); // call service to update
            return Ok(res);
        }

        /// <summary>
        /// Get ContactUs List according to pageSize like 10, 20, 50 and 100
        /// </summary>
        /// <param name="page">default page number</param>
        /// <param name="pageSize">default page size</param>
        /// <param name="searchTerm">To search cutomer by first name or email</param>
        /// <returns>list and total pages</returns>
        [HttpGet("GetContactUsList/{id}")]
        public async Task<IActionResult> GetContactUsList(int id, int page = 1, int pageSize = 10, string searchTerm = "")
        {
            try
            {
                var query = _db.ContactUs.AsQueryable(); // Make it Queryable

                if (!string.IsNullOrEmpty(searchTerm)) // If user want to search something
                {
                    query = query.Where(c => c.Name.Contains(searchTerm) ||
                                             c.Email.Contains(searchTerm));
                }

                var totalCount = await query.Where(c => c.UserId == id).CountAsync(); // Count pages for example if 1000 customer in list then according pageSize=10 here totalCount of page is 100

                var Data = await query.Where(c => c.UserId == id)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync(); // When user click on another page 

                return Ok(new { data = Data, totalCount });
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// To delete the notification
        /// </summary>
        /// <param name="id">notification id</param>
        /// <returns>boolean</returns>
        [HttpDelete("DeleteNotification/{id}")]
        public async Task<IActionResult> DeleteNotification(int id)
        {
            var data = await _db.ContactUs.FirstOrDefaultAsync(x => x.id == id);// Find data
            if (data == null)
            {
                return Ok(false);
            }
            _db.ContactUs.Remove(data); // Remove the data
            int n = await _db.SaveChangesAsync();
            if (n == 1)
                return Ok(true);
            return Ok(false);
        }


        //============================== Messages =======================

        /// <summary>
        /// To Get All Messages list according to user id
        /// </summary>
        /// <param name="userId">User Id</param>
        /// <returns>List of messages</returns>
        //[HttpGet("GetAllMessages")]
        //public async Task<IActionResult> GetAllMessages(int userId, int myId)
        //{
        //    var list = await _ser.getMessages(userId, myId); // called the function to get list
        //    if (list == null)
        //        return Ok(new { success = false, res = "Null" });

        //    var data = await _db.Users.FirstOrDefaultAsync(x => x.UserId == userId);

        //    return Ok(new { success = true, res = list, user = data });
        //}

        ///// <summary>
        ///// To create messages from another user
        ///// </summary>
        ///// <param name="message">Messages model</param>
        ///// <returns>boolean</returns>
        //[HttpPost("CreateMessage")]
        //public async Task<IActionResult> CreateMessage(Messages message)
        //{
        //    if (!ModelState.IsValid) // Check is valid or not
        //    {
        //        return BadRequest(ModelState);
        //    }

        //    var res = await _ser.addMessage(message); // Add the message
        //    return Ok(new { success = res, message = "Done!" });
        //}

        /// <summary>
        /// To delete message using message id
        /// </summary>
        /// <param name="messId"></param>
        /// <returns></returns>
        //[HttpDelete("DeleteMessage/{messId}")]
        //public async Task<IActionResult> DeleteMessage(int messId)
        //{
        //    var data = await _db.messages.FirstOrDefaultAsync(x => x.id == messId); // Get Message data using id

        //    if (data == null)
        //        return Ok(new { success = false });
        //    _db.messages.Remove(data); // Remove data
        //    int n = await _db.SaveChangesAsync(); // Save changes 
        //    if (n == 0)
        //        return Ok(new { success = false });
        //    return Ok(new { success = true });
        //}
    }
}