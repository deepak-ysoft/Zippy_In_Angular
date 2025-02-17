using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using ZippyCRM_API.Models;

namespace ZippyCRM_API.Services
{

    public class HomeServices
    {
        private readonly IWebHostEnvironment _env;
        private readonly UserDbContext _db;
        public HomeServices(UserDbContext db, IWebHostEnvironment env)
        {
            _db = db;
            _env = env;
        }

        /// <summary>
        /// Get user job list
        /// </summary>
        /// <returns>Job list</returns>
        public async Task<List<SelectListItem>> GetJobListAsync()
        {
            return await _db.Job.Select(c => new SelectListItem // To find Job list in the Database table.
            {
                Value = c.JobId.ToString(),// Job id
                Text = c.JobName // Job name
            }).ToListAsync();
        }

        /// <summary>
        /// Update user in database table.
        /// </summary>
        /// <param name="user">Users class object properties with value.</param>
        /// <returns></returns>
        public async Task<Users?> UpdateUserAsync(Users user)
        {
            var existingUser = await _db.Users.FirstOrDefaultAsync(x => x.UserId == user.UserId);
            if (existingUser == null)
                return null;

            string imgcheck = user.Photo != null ? user.Photo.FileName : user.ImagePath;
            string fileName = existingUser.ImagePath == imgcheck ? existingUser.ImagePath : await UploadImageAsync(user);

            existingUser.Username = user.Username;
            existingUser.Email = user.Email;
            existingUser.Company = user.Company;
            existingUser.Country = user.Country;
            existingUser.Address = user.Address;
            existingUser.Phone = user.Phone;
            existingUser.Discription = user.Discription;
            existingUser.ImagePath = fileName;
            existingUser.JobId = user.JobId;
            existingUser.AccountSetup = false; // Assuming default to false
            existingUser.IsActive = false; // Assuming default to false
            existingUser.AccountStatus = AccountStatus.Inactive; // Default to Inactive

            var u = _db.Users.Update(existingUser);

            // Save changes asynchronously
            int n = await _db.SaveChangesAsync();
            return existingUser; // Return true if one record was updated
        }

        /// <summary>
        /// Update image in img folder and Database table.
        /// </summary>
        /// <param name="userObj">Users class object properties with value.</param>
        /// <returns></returns>
        public async Task<string> UploadImageAsync(Users userObj)
        {
            var user = await _db.Users.FirstOrDefaultAsync(e => e.UserId == userObj.UserId);
            if (user == null)
            {
                throw new Exception("User not found.");
            }
            var basePath = "https://localhost:7269/uploads/images/users/";
            var result = user.ImagePath.Replace(basePath, "");
            string folder = Path.Combine(_env.ContentRootPath, "uploads\\images\\users");
            var file1 = Path.Combine(folder, result);

            if (result != "Default.jpg")
            {
                if (System.IO.File.Exists(file1)) // To check if the file exists in the file system.
                {
                    System.IO.File.Delete(file1); // Delete the old image.
                }
            }

            string newFolder = Path.Combine(_env.ContentRootPath, "uploads\\images\\users"); // Combine wwwroot and img folder.
            // To generate sort and unique name of image
            string shortGuid = Guid.NewGuid().ToString().Substring(0, 8);
            string timestamp = DateTime.UtcNow.ToString("yyyyMMddHHmmss");
            string originalName = Path.GetFileNameWithoutExtension(userObj.Photo.FileName);

            // Shorten the original name if it’s longer than 10 characters
            string shortenedName = originalName.Length > 10 ? originalName.Substring(0, 10) : originalName;

            string fileName = $"{shortGuid}_{timestamp}_{shortenedName}{Path.GetExtension(userObj.Photo.FileName)}";

            // Concatenate Guid id with FileName.
            string filePath = Path.Combine(newFolder, fileName);

            // Copy File in File System asynchronously.
            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await userObj.Photo.CopyToAsync(fileStream);
            }

            user.ImagePath = Path.Combine("https://localhost:7269/uploads/images/users/", fileName);
            _db.Users.Update(user);
            await _db.SaveChangesAsync(); // Save changes asynchronously.

            return user.ImagePath;
        }

        /// <summary>
        /// Delete image from Img folder and update ImagePath in the database.
        /// </summary>
        /// <param name="userId">UserId to find user from database.</param>
        /// <returns></returns>
        public async Task<string> DeleteUserImageAsync(int? userId)
        {
            var user = await _db.Users.FirstOrDefaultAsync(x => x.UserId == userId);
            if (user == null)
                return null;

            var defaultPath = "Default.jpg";
            string imgPath = Path.GetFileName(user.ImagePath);
            var filePath = Path.Combine(_env.ContentRootPath, "uploads\\images\\users", imgPath); // Combine wwwroot/Img Folder and database ImagePath.

            if (imgPath != defaultPath && System.IO.File.Exists(filePath)) // Check if the image exists in the file system.
            {
                System.IO.File.Delete(filePath); // Delete image if it not default image or exist 
            }

            user.ImagePath = "https://localhost:7269/uploads/images/users/Default.jpg";
            _db.Users.Update(user);
            int n = await _db.SaveChangesAsync(); // Use SaveChangesAsync for async save.

            return user.ImagePath;
        }

        /// <summary>
        /// To ChangePassword in database table.
        /// </summary>
        /// <param name="userId">UserId find user from database table.</param>
        /// <param name="changePasswordVM">ChangePasswordVM class object with properties value.</param>
        /// <returns>A tuple containing a boolean indicating success and a message.</returns>
        public async Task<(bool Success, string Message)> ChangePasswordAsync(ChangePasswordVM changePasswordVM)
        {
            var user = await _db.Users.FirstOrDefaultAsync(x => x.UserId == changePasswordVM.userId);
            if (user == null)
            {
                return (false, "User not found.");
            }

            var hasher = new PasswordHasher<Users>();
            var passwordVerificationResult = hasher.VerifyHashedPassword(user, user.Password, changePasswordVM.CurrentPassword); // To varify user password is correct or not

            if (passwordVerificationResult == PasswordVerificationResult.Success) // If result us success
            {
                user.Password = hasher.HashPassword(user, changePasswordVM.NewPassword); // To convert to encrypted password.
                _db.Users.Update(user);
                await _db.SaveChangesAsync();
                return (true, "Password changed successfully.");
            }
            else
            {
                return (false, "Incorrect current password.");
            }
        }
        public async Task<bool> addContactUs(ContactUs contactUs)
        {
            var newContact = new ContactUs()
            {
                Name = contactUs.Name,
                Email = contactUs.Email,
                Subject = contactUs.Subject,
                Message = contactUs.Message,
                UserId = contactUs.UserId,
                isMarked = contactUs.isMarked,
                sendTime = DateTime.Now
            };
            await _db.ContactUs.AddAsync(newContact);
            int n = await _db.SaveChangesAsync();
            if (n == 0)
                return false;

            return true;
        }

        public async Task<List<ContactUs>> getContactUsList(int userId)
        {
            var list = await _db.ContactUs.Where(c => c.UserId == userId).ToListAsync();
            return list;
        }

        public async Task<bool> updateContactUs(int id)
        {
            var contact = await _db.ContactUs.FirstOrDefaultAsync(c => c.id == id);

            contact.isMarked = true;

            _db.ContactUs.Update(contact);
            int n = await _db.SaveChangesAsync();
            if (n == 0)
                return false;

            return true;
        }
        //public async Task<bool> addMessage(Messages message)
        //{
        //    var newMessage = new Messages()
        //    {
        //        UserId = message.UserId,
        //        senderId = message.senderId,
        //        Message = message.Message,
        //        Timestamp = DateTime.Now
        //    };
        //    await _db.messages.AddAsync(newMessage);
        //    int n = await _db.SaveChangesAsync();
        //    if (n == 0)
        //        return false;
        //    return true;
        //}
        //public async Task<List<Messages>> getMessages(int userId, int myId)
        //{
        //    var list = await _db.messages.Where(x => x.UserId == userId && x.senderId == myId || x.senderId == userId && x.UserId == myId).OrderBy(m => m.Timestamp).ToListAsync();
        //    return list;
        //}
    }
}
