using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Web.Mvc;
using ZippyCRM_API.Models;
using SelectListItem = Microsoft.AspNetCore.Mvc.Rendering.SelectListItem;

namespace ZippyCRM_API.Services
{
    public class CustomerServices
    {
        private readonly UserDbContext _db;
        private readonly IWebHostEnvironment _env;
        public CustomerServices(UserDbContext db, IWebHostEnvironment env)
        {
            _db = db;
            _env = env;
        }

        /// <summary>
        /// Get customer by it for details
        /// </summary>
        /// <param name="id">Customer id</param>
        /// <returns>Customer Data</returns>
        public async Task<Customer> GetCustomerByIdAsync(int id)
        {
            var customer = await _db.Customer.FirstOrDefaultAsync(x => x.CId == id);
            return customer;
        }

        /// <summary>
        /// Delete customer by ID
        /// </summary>
        /// <param name="id">Customer ID</param>
        /// <returns>true or false</returns>
        public async Task<bool> DeleteCustomerAsync(int id) // Marked as async
        {
            var cus = await _db.Customer.FirstOrDefaultAsync(x => x.CId == id); // Use async version of FirstOrDefault
            if (cus != null) // Check if the customer exists
            {
                // First delete all data from other content like Customer Contacts, Address etc. becouse of customer foreign key used in these tables
                var contact = _db.Contact.Where(a => a.CId == id);
                if (!contact.IsNullOrEmpty())
                    _db.Contact.RemoveRange(contact);
                await _db.SaveChangesAsync();
                var address = _db.Addresses.Where(a => a.customerId == id);
                if (!address.IsNullOrEmpty())
                    _db.Addresses.RemoveRange(address);
                await _db.SaveChangesAsync();
                var task = _db.Task.Where(a => a.customerId == id);
                if (!task.IsNullOrEmpty())
                    _db.Task.RemoveRange(task);
                await _db.SaveChangesAsync();
                var notes = _db.Notes.Where(a => a.customerId == id);
                if (!notes.IsNullOrEmpty())
                    _db.Notes.RemoveRange(notes);
                await _db.SaveChangesAsync();
                var appointments = _db.Appointment.Where(a => a.CId == id);
                if (!appointments.IsNullOrEmpty())
                    _db.Appointment.RemoveRange(appointments);
                await _db.SaveChangesAsync();
                _db.Customer.Remove(cus);
                await DeleteUserImageAsync(id);
                int n = await _db.SaveChangesAsync(); // Use async version of SaveChanges

                return n > 0; // Return true if the deletion was successful
            }
            return false; // Return false if customer was not found
        }

        //To delete Customer Image
        public async Task DeleteUserImageAsync(int customerId) // Marked as async
        {
            var customer = await _db.Customer.FirstOrDefaultAsync(x => x.CId == customerId); // Use async version
            var defaultPath = "Default.jpg";
            var filePath = Path.Combine(_env.ContentRootPath + "\\uploads\\images\\customer\\", customer?.Imagepath ?? string.Empty); // Combine paths

            // Check if the customer exists and the file path is not the default image
            if (customer != null && filePath != defaultPath && File.Exists(filePath))
            {
                File.Delete(filePath); // Delete the file

                // Optionally, remove the Imagepath from the customer record and save changes
                customer.Imagepath = null; // or set to a default path if needed
                await _db.SaveChangesAsync(); // Use async version of SaveChanges
            }
        }

        /// <summary>
        /// Returns Contact List from database table.
        /// </summary>
        /// <returns></returns>
        public async Task<List<Contact>> ContactListAsync(int customerId) // Marked as async
        {
            var contacts = await _db.Contact
                .Where(x => x.CId == customerId)
                .ToListAsync(); // Use async method to retrieve contacts
            return contacts;
        }

        /// <summary>
        /// Creates or updates a contact based on whether the contact ID is provided.
        /// </summary>
        /// <param name="contact">The contact object containing details.</param>
        /// <param name="Cid">The customer ID associated with the contact.</param>
        /// <returns>Returns true if the operation is successful; otherwise, false.</returns>
        public async Task<bool> CreateEditContactAsync(Contact contact) // Marked as async
        {
            if (contact == null)
            {
                return false; // Return false if the contact object is null
            }

            if (contact.ContactId == 0) // Create a new contact if ContactId is 0
            {
                var model = new Contact()
                {
                    CId = contact.CId,
                    ContactName = contact.ContactName,
                    Email = contact.Email,
                    Title = contact.Title,
                    Phone = contact.Phone,
                    JobPosition = contact.JobPosition,
                    Mobile = contact.Mobile,
                    InternalNotes = contact.InternalNotes
                };
                await _db.Contact.AddAsync(model); // Use async method to add a new contact
            }
            else // Update an existing contact
            {
                var model = new Contact()
                {
                    CId = contact.CId,
                    ContactId = contact.ContactId,
                    ContactName = contact.ContactName,
                    Email = contact.Email,
                    Title = contact.Title,
                    Phone = contact.Phone,
                    JobPosition = contact.JobPosition,
                    Mobile = contact.Mobile,
                    InternalNotes = contact.InternalNotes
                };
                _db.Contact.Update(model); // Update the existing contact
            }

            // Save changes asynchronously and return the result
            int n = await _db.SaveChangesAsync(); // Use async method to save changes
            return n > 0; // Return true if changes were saved successfully
        }

        // Generic method for enum list of title, gender, landuage
        public async Task<List<SelectListItem>> GetSelectListItemsAsync<T>() where T : Enum
        {
            return await Task.FromResult(
                Enum.GetValues(typeof(T))
                    .Cast<T>()
                    .Select(e => new SelectListItem
                    {
                        Value = ((int)(object)e).ToString(),
                        Text = e.ToString()
                    }).ToList()
            );
        }

        /// <summary>
        /// Contact details by id
        /// </summary>
        /// <param name="id">Contact id</param>
        /// <returns>Contact Data</returns>
        public async Task<Contact> ContactDetailsAsync(int id)
        {
            // Use asynchronous method to retrieve the contact from the database
            var contact = await _db.Contact.FirstOrDefaultAsync(x => x.ContactId == id);
            return contact;
        }

        //To delete contact by contact id return true or false
        public async Task<bool> ContactDeleteAsync(int id)
        {
            // Use FindAsync to locate the contact in an asynchronous manner
            var contact = await _db.Contact.FindAsync(id);

            // If contact is found, remove it
            if (contact != null)
            {
                _db.Contact.Remove(contact); // Remove the contact
                int n = await _db.SaveChangesAsync(); // Save changes asynchronously
                return n > 0; // Return true if any changes were made
            }

            return false; // Return false if the contact was not found
        }

        /// <summary>
        /// Get Customer Address list by customer id
        /// </summary>
        /// <param name="id">customer id</param>
        /// <returns>Liat of customer</returns>
        public async Task<List<Addresses>> getCustomerAddressesAsync(int id)
        {
            var addresses = await _db.Addresses.Where(a => a.customerId == id).ToListAsync();
            return addresses;
        }

        /// <summary>
        /// Get Address by id
        /// </summary>
        /// <param name="id">Address Id</param>
        /// <returns>Address Id</returns>
        public async Task<Addresses> GetAddressByIdAsync(int id)
        {
            var addresses = await _db.Addresses.FirstOrDefaultAsync(x => x.addressId == id);
            return addresses;
        }

        /// <summary>
        /// Delete address by address id
        /// </summary>
        /// <param name="id">address id</param>
        /// <returns>true or false</returns>
        public async Task<bool> DeleteAddressByIdAsync(int id)
        {

            var addresses = await _db.Addresses.FirstOrDefaultAsync(x => x.addressId == id); // get address by address id
            _db.Addresses.Remove(addresses); // remove address
            int n = await _db.SaveChangesAsync();
            if (n == 1)
                return true;
            return false;
        }

        /// <summary>
        /// Get customer task by customer id
        /// </summary>
        /// <param name="id">customer Id</param>
        /// <returns>List of tasks</returns>
        public async Task<List<customerTask>> getCustomerTasksAsync(int id)
        {
            var result = await (from ct in _db.Task
                                join u in _db.Users on ct.UserId equals u.UserId
                                where ct.customerId == id
                                select new customerTask
                                {
                                    UserId = ct.UserId,
                                    taskId = ct.taskId,
                                    customerId = ct.customerId,
                                    activityType = ct.activityType,
                                    comments = ct.comments,
                                    createDate = ct.createDate,
                                    updateDate = ct.updateDate,
                                    dueDate = ct.dueDate,
                                    summary = ct.summary,
                                    Username = u.Username
                                }).ToListAsync();
            return result;
        }

        /// <summary>
        /// Delete task by task id
        /// </summary>
        /// <param name="id">task id</param>
        /// <returns>true or false</returns>
        public async Task<bool> DeleteTaskByIdAsync(int id)
        {

            var task = await _db.Task.FirstOrDefaultAsync(x => x.taskId == id);
            if (task != null)
            {
                _db.Task.Remove(task);//remove task
                int n = await _db.SaveChangesAsync();
                if (n == 1)
                    return true;
            }
            return false;
        }

        // Get Task by task id
        public async Task<customerTask> getTaskById1Async(int id)
        {
            var result = await (from task in _db.Task
                                join user in _db.Users on task.UserId equals user.UserId
                                where task.taskId == id
                                select new
                                {
                                    ActivityType = task.activityType,
                                    Comments = task.comments,
                                    CreateDate = task.createDate,
                                    updateDate = task.updateDate,
                                    DueDate = task.dueDate,
                                    Summary = task.summary,
                                    Username = user.Username
                                }).FirstOrDefaultAsync();

            if (result != null)
            {
                // Map the anonymous type to customerTask object
                return new customerTask
                {
                    activityType = result.ActivityType,
                    comments = result.Comments,
                    createDate = result.CreateDate,
                    updateDate = result.updateDate,
                    dueDate = result.DueDate,
                    summary = result.Summary,
                    Username = result.Username
                };
            }

            return null;
        }

        /// <summary>
        /// Get notes list by customer Id
        /// </summary>
        /// <param name="id">customer id</param>
        /// <returns>notes list</returns>
        public async Task<List<customerNotes>> getCustomerNotesAsync(int id)
        {
            var result = await (from ct in _db.Notes
                                join u in _db.Users on ct.UserId equals u.UserId
                                where ct.customerId == id
                                select new customerNotes
                                {
                                    UserId = ct.UserId,
                                    notesId = ct.notesId,
                                    customerId = ct.customerId,
                                    title = ct.title,
                                    description = ct.description,
                                    updateDate = ct.updateDate,
                                    createDate = ct.createDate,
                                    Username = u.Username
                                }).ToListAsync();
            return result;
        }

        // Get notes by notes id
        public async Task<customerNotes> getNotesById1Async(int id)
        {
            var result = await (from notes in _db.Notes
                                join user in _db.Users on notes.UserId equals user.UserId
                                where notes.notesId == id
                                select new
                                {
                                    title = notes.title,
                                    description = notes.description,
                                    Username = user.Username,
                                    createDate = notes.createDate,
                                    updateDate = notes.updateDate

                                }).FirstOrDefaultAsync();

            if (result != null)
            {
                // Map the anonymous type to customerNotes object
                return new customerNotes
                {
                    title = result.title,
                    description = result.description,
                    Username = result.Username,
                    createDate = result.createDate,
                    updateDate = result.updateDate
                };
            }

            return null;
        }

        //Delete notes by notes id
        public async Task<bool> DeleteNotesByIdAsync(int id)
        {

            var notes = await _db.Notes.FirstOrDefaultAsync(x => x.notesId == id); //get notes by notes id
            if (notes != null)
            {
                _db.Notes.Remove(notes);//Delete notes
                int n = _db.SaveChanges();
                if (n == 1)
                    return true;
            }
            return false;
        }

        /// <summary>
        /// Get folder content 
        /// </summary>
        /// <param name="path">path of base folder</param>
        /// <returns>folder content</returns>
        public async Task<IEnumerable<DirectoryItem>> GetDirectoryContentsAsync(string path)
        {
            return await Task.Run(() =>
            {
                if (!Directory.Exists(path)) { 
                    Directory.CreateDirectory(path);//Create directory if dont exist
                }
                var files = Directory.GetFiles(path).Select(f => new DirectoryItem
                {
                    Name = Path.GetFileName(f),
                    Path = f,
                    IsDirectory = false,
                    SizeInBytes = new FileInfo(f).Length, // Get file size in bytes
                    CreatedDateTime = System.IO.File.GetCreationTime(f) // Get file creation date
                });

                var directories = Directory.GetDirectories(path).Select(d => new DirectoryItem
                {
                    Name = Path.GetFileName(d),
                    Path = d,
                    IsDirectory = true,
                    SizeInBytes = 0, // Directories don't have a size
                    CreatedDateTime = Directory.GetCreationTime(d) // Get directory creation date
                });

                return directories.Concat(files);
            });
        }

        // Get appointment by appointment id
        public async Task<Appointment> getAppointmentByIdAsync(int id)
        {
            var appointment = await _db.Appointment.FirstOrDefaultAsync(x => x.AppointmentId == id);
            return appointment;
        }

        // Delete appointment
        public async Task<bool> DeleteAppointmentByIdAsync(int id)
        {
            var appointment = await _db.Appointment.FirstOrDefaultAsync(x => x.AppointmentId == id); // Get appointment
            if (appointment != null)
                _db.Appointment.Remove(appointment); // remove appointment
            int n = await _db.SaveChangesAsync();
            if (n > 0)
                return true;
            return false;
        }
    }
}
