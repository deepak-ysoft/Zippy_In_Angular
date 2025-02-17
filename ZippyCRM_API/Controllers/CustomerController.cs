using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ZippyCRM_API.Models;
using ZippyCRM_API.Services;
using System.Linq.Dynamic.Core;
namespace ZippyCRM_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CustomerController : ControllerBase
    {
        private readonly UserDbContext _db;
        private readonly CustomerServices _ser;
        private readonly string _rootPath;
        public CustomerController(UserDbContext db, CustomerServices ser, IWebHostEnvironment env)
        {
            _db = db;  // DI for Database
            _ser = ser; // Service DI
            _rootPath = Path.Combine(env.ContentRootPath, "Files"); // Root path to retrive all files and folders.
        }

        /// <summary>
        /// Get customer according to pageSize like 10, 20, 50 and 100
        /// </summary>
        /// <param name="page">default page number</param>
        /// <param name="pageSize">default page size</param>
        /// <param name="searchTerm">To search cutomer by first,last name or email</param>
        /// <returns></returns>
        [HttpGet("GetCustomers")]
        public async Task<IActionResult> GetCustomers(int page = 1, int pageSize = 10, string searchTerm = "")
        {
            try
            {
                var query = _db.Customer.AsQueryable(); // Make it Queryable

                if (!string.IsNullOrEmpty(searchTerm)) // If user want to search something
                {
                    query = query.Where(c => c.FirstName.Contains(searchTerm) ||
                                             c.LastName.Contains(searchTerm) ||
                                             c.Email.Contains(searchTerm));
                }

                var totalCount = await query.CountAsync(); // Count pages for example if 1000 customer in list then according pageSize=10 here totalCount of page is 100

                var customers = await query
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync(); // When user click on another page 

                return Ok(new { data = customers, totalCount = totalCount });
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// To create and edit the customer
        /// </summary>
        /// <param name="customer">customer model</param>
        /// <returns>success true and message email if saveChanges return 1</returns>
        [HttpPost("CreateEditCustomer")]
        public async Task<IActionResult> CreateEditCustomer([FromForm] Customer customer)
        {
            // If model validation fails, this block won't be reached due to [ApiController]
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                var customerExists1 = false;
                var customerExists2 = false;
                if (customer.CId == null) // To check duplicate email on create customer.
                {
                    customerExists1 = await _db.Customer.AnyAsync(cus => cus.Email.ToLower() == customer.Email.ToLower());
                    customerExists2 = await _db.Customer.AnyAsync(cus => cus.Email2.ToLower() == customer.Email2.ToLower());
                }
                else // To check duplicate email on edit customer.
                {

                    customerExists1 = await _db.Customer.AnyAsync(cus => cus.Email.ToLower() == customer.Email.ToLower() && cus.CId != customer.CId);
                    customerExists2 = await _db.Customer.AnyAsync(cus => cus.Email2.ToLower() == customer.Email2.ToLower() && cus.CId != customer.CId);
                }
                if (customerExists1) //return if duplicate email on create customer
                {
                    return Ok(new { success = false, message = "emai1" });
                }
                if (customerExists2) //return if duplicate email on edit customer
                {
                    return Ok(new { success = false, message = "emai2" });
                }
                if (!ModelState.IsValid)
                {
                    var errors = ModelState
                        .Where(e => e.Value.Errors.Count > 0)
                        .Select(e => new { e.Key, e.Value.Errors })
                        .ToArray();
                    return Ok(false);
                }
                if (customer.CId.HasValue && customer.CId > 0)
                {
                    // Edit Operation
                    var existingCustomer = await _db.Customer.FindAsync(customer.CId);

                    if (existingCustomer == null)
                    {
                        return NotFound($"Customer with ID {customer.CId} not found.");
                    }

                    // Update existing customer's properties

                    existingCustomer.CId = customer.CId;
                    existingCustomer.FirstName = customer.FirstName;
                    existingCustomer.LastName = customer.LastName;
                    existingCustomer.MiddleName = customer.MiddleName;
                    existingCustomer.Email = customer.Email;
                    existingCustomer.Email2 = customer.Email2;
                    existingCustomer.Phone = customer.Phone;
                    existingCustomer.PhoneOther = customer.PhoneOther;
                    existingCustomer.Cell = customer.Cell;
                    existingCustomer.Fax = customer.Fax;
                    existingCustomer.Website = customer.Website;
                    existingCustomer.Gender = customer.Gender;
                    existingCustomer.Language = customer.Language;
                    existingCustomer.PAN = customer.PAN;
                    existingCustomer.GST = customer.GST;
                    existingCustomer.DayOfBirth = customer.DayOfBirth;
                    existingCustomer.Title = customer.Title;
                    existingCustomer.Type = customer.Type;
                    existingCustomer.Comments = customer.Comments;
                    await _ser.DeleteUserImageAsync((int)customer.CId);

                    if (customer.Photo != null)
                    {
                        // Update the Image if provided
                        var imagePath = await SaveImageAsync(customer.Photo);
                        existingCustomer.Imagepath = "https://localhost:7269/uploads/images/customers/" + imagePath;
                    }

                    _db.Entry(existingCustomer).State = EntityState.Modified;
                    int res = await _db.SaveChangesAsync();
                    if (res == 1)
                        return Ok(new { success = true, message = "emai" });
                    return Ok(false);
                }
                else
                {
                    // Create Operation
                    if (customer.Photo != null)
                    {
                        // Save Image
                        var imagePath = await SaveImageAsync(customer.Photo);
                        customer.Imagepath = "https://localhost:7269/uploads/images/customers/" + imagePath;
                    }

                    await _db.Customer.AddAsync(customer);
                    int res = await _db.SaveChangesAsync();
                    if (res == 1)
                        return Ok(new { success = true, message = "emai" });
                    return Ok(false);
                }
            }
            catch (Exception ex)
            {
                // Log the exception (you can replace Console with actual logging mechanism)
                Console.WriteLine(ex);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Save image if customer photo in not null
        /// </summary>
        /// <param name="photo">customer image</param>
        /// <returns>customer image unique file name.</returns>
        private async Task<string> SaveImageAsync(IFormFile photo)
        {
            // Define the path to the images folder within your project
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "uploads\\images\\customers");

            // Create the directory if it doesn't exist
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            // Generate a unique file name for the image
            var uniqueFileName = Guid.NewGuid().ToString() + Path.GetExtension(photo.FileName);

            // Full path to save the image
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            // Save the image to the specified path
            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await photo.CopyToAsync(fileStream);
            }

            // Return the relative path that will be accessible through the web server
            return $"{uniqueFileName}";
        }


        /// <summary>
        /// To retrive customer details 
        /// </summary>
        /// <param name="id">Id of customer for details</param>
        /// <returns>Customer data</returns>
        [HttpGet("CustomerDetails/{id}")]
        public async Task<ActionResult<Customer>> CustomerDetails(int id)
        {
            try
            {
                var cus = await _ser.GetCustomerByIdAsync(id); // Use async version of the service method
                if (cus == null)
                {
                    return NotFound(); // Return 404 if the customer is not found
                }
                return Ok(cus); // Return 200 with the customer details
            }
            catch (Exception ex)
            {
                // Log the exception (consider using a logging framework)
                Console.WriteLine(ex.Message);
                return StatusCode(500, "Internal server error"); // Return 500 for internal server error
            }
        }

        /// <summary>
        /// For customer profile 
        /// </summary>
        /// <param name="id">Id of customer for retrieving data of customer</param>
        /// <returns>Customer data</returns>
        [HttpGet("CustomerProfile/{id}")]
        public async Task<IActionResult> CustomerProfile(int id) // Marked as async
        {
            try
            {
                if (id <= 0)
                {
                    return BadRequest("Invalid customer ID."); // Return 400 Bad Request for invalid ID
                }

                var customer = await _ser.GetCustomerByIdAsync(id); // Call async method to retrieve customer
                if (customer == null)
                {
                    return NotFound(); // Return 404 Not Found if customer does not exist
                }
                return Ok(customer); // Return 200 OK with customer data
            }
            catch (Exception ex)
            {
                // Log the exception (optional)
                Console.WriteLine(ex);
                return Ok(false);
            }
        }

        /// <summary>
        /// Delete customer
        /// </summary>
        /// <param name="id">Id of customer for delete</param>
        /// <returns>json</returns>
        [HttpDelete("DeleteCustomer/{id}")]
        public async Task<IActionResult> DeleteCustomerAsync(int id)
        {
            try
            {
                await _ser.DeleteCustomerAsync(id); // Delete customer service
                return Ok(true);
            }
            catch (Exception ex)
            {
                // Log the exception (optional)
                Console.WriteLine(ex);
                return Ok(false);
            }
        }


        ///////////  CustomerContect ==============================

        // To return a list of contacts.
        [HttpGet("ContactList")]
        public async Task<IActionResult> ContactList(int customerId) // Marked as async
        {
            try
            {
                if (customerId <= 0)
                {
                    return BadRequest("Invalid customer ID."); // Return 400 Bad Request for invalid ID
                }
                // Retrieve the contact list from the service asynchronously
                var contacts = await _ser.ContactListAsync(customerId); // Call async method to retrieve contacts
                if (contacts == null || !contacts.Any())
                {
                    return Ok(false); // Return false if no contacts exist
                }
                return Ok(contacts); // Return contacts
            }
            catch (Exception ex)
            {
                // Log the exception (optional)
                Console.WriteLine(ex);
                return Ok(false);
            }
        }


        /// <summary>
        /// Creates or updates a contact for a customer.
        /// </summary>
        /// <param name="contact">The contact object to create or update.</param>
        /// <param name="Cid">The ID of the customer associated with the contact.</param>
        /// <returns>A response indicating the result of the operation.</returns>
        [HttpPost("CreateEditContact")]
        public async Task<IActionResult> CreateEditContact([FromBody] Contact contact) // API method
        {
            try
            {
                if (!ModelState.IsValid) // Validate the model state
                {
                    return Ok(ModelState); // Return 400 Bad Request if the model is invalid
                }

                var result = await _ser.CreateEditContactAsync(contact); // Call the async service method

                if (result)
                {
                    return Ok(true); // Return 200 OK if successful
                }

                return StatusCode(500, "An error occurred while saving the contact."); // Return 500 Internal Server Error if failed
            }
            catch (Exception ex)
            {
                // Log the exception (optional)
                Console.WriteLine(ex);
                return Ok(false);
            }
        }


        /// <summary>
        /// Retrieves the details of a specific contact by ID.
        /// </summary>
        /// <param name="id">The ID of the contact.</param>
        /// <returns>The contact details as a JSON object.</returns>
        [HttpGet("ContactDetails/{id}")] // API method to get contact details
        public async Task<IActionResult> ContactDetails(int id)
        {
            try
            {
                var contact = await _ser.ContactDetailsAsync(id); // Call the async method

                if (contact == null) // Check if contact was found
                {
                    return NotFound(); // Return 404 Not Found if the contact does not exist
                }

                return Ok(contact); // Return the contact details as a JSON object
            }
            catch (Exception ex)
            {
                // Log the exception (optional)
                Console.WriteLine(ex);
                return Ok(false);
            }
        }

        /// <summary>
        /// Deletes a contact by ID.
        /// </summary>
        /// <param name="id">The ID of the contact to delete.</param>
        /// <returns>A response indicating the result of the operation.</returns>
        [HttpDelete("ContactDelete/{id}")] // API method to delete a contact
        public async Task<IActionResult> ContactDelete(int id)
        {
            try
            {
                var result = await _ser.ContactDeleteAsync(id); // Call the async delete method
                if (result)
                {
                    return Ok(); // Return Ok if successful
                }

                return NotFound(); // Return 404 Not Found if the contact was not found
            }
            catch (Exception ex)
            {
                // Log the exception (optional)
                Console.WriteLine(ex);
                return Ok(false);
            }
        }

        ///////////  CustomerAddresses ==============================

        /// <summary>
        ///  Get list of addresses according to cid.
        /// </summary>
        /// <param name="CId">customer id</param>
        /// <returns>list of customer address</returns>
        [HttpGet("GetAddreses/{CId}")]
        public async Task<IActionResult> GetAddreses(int CId)
        {
            try
            {
                var address = await _ser.getCustomerAddressesAsync(CId); 
                if (address.Count == 0)
                    return Ok(false);
                return Ok(address);
            }
            catch (Exception ex)
            {
                // Log the exception (optional)
                Console.WriteLine(ex);
                return Ok(false);
            }
        }

        /// <summary>
        /// Create edit customer address
        /// </summary>
        /// <param name="addresses">model of address</param>
        /// <returns>true or false</returns>
        [HttpPost("CreateEditAddresses")]
        public async Task<ActionResult<bool>> CreateEditAddresses([FromBody] Addresses addresses)
        {

            if (!ModelState.IsValid) // addresses data is valid or not
            {
                return Ok(ModelState);
            }
            try
            {

                if (addresses.addressId == 0) 
                {
                    var model = new Addresses()
                    {
                        addressName = addresses.addressName,
                        address = addresses.address,
                        email = addresses.email,
                        phone = addresses.phone,
                        mobile = addresses.mobile,
                        internalNotes = addresses.internalNotes,
                        customerId = addresses.customerId
                    };
                    await _db.Addresses.AddAsync(model); // Asynchronous addition of the new address
                }
                else
                {
                    var adrs = await _db.Addresses.FirstOrDefaultAsync(x => x.addressId == addresses.addressId); // Asynchronous fetching

                    if (adrs == null)
                    {
                        return NotFound("Address not found.");
                    }

                    adrs.addressName = addresses.addressName;
                    adrs.address = addresses.address;
                    adrs.email = addresses.email;
                    adrs.phone = addresses.phone;
                    adrs.mobile = addresses.mobile;
                    adrs.internalNotes = addresses.internalNotes;

                    _db.Addresses.Update(adrs);
                }

                int n = await _db.SaveChangesAsync(); // Asynchronous save

                if (n == 1)
                    return Ok(true); // Return true if save was successful
                return StatusCode(500, "An error occurred while saving the address."); // Return an error response if save fails
            }
            catch (Exception ex)
            {
                // Log the exception (optional)
                Console.WriteLine(ex);
                return Ok(false);
            }
        }

        // Return details of address
        [HttpGet("GetAddressDetails/{id}")]
        public async Task<ActionResult<Addresses>> GetAddressDetails(int id)
        {
            try
            {
                var address = await _ser.GetAddressByIdAsync(id); // Assuming your service method is asynchronous
                if (address != null)
                {
                    return Ok(address); // Return address details in JSON format
                }
                return NotFound("Address not found."); // Return 404 if address is not found
            }
            catch (Exception ex)
            {
                // Log the exception (optional)
                Console.WriteLine(ex);
                return Ok(false);
            }
        }

        // To delete an address
        [HttpDelete("DeleteAddress/{id}")]
        public async Task<ActionResult> DeleteAddress(int id)
        {
            try
            {
                var isDeleted = await _ser.DeleteAddressByIdAsync(id); // Assuming your service method is asynchronous

                if (isDeleted)
                {
                    return Ok(new { success = true }); // Return success response
                }
                return NotFound("Address not found."); // Return 404 if address was not found
            }
            catch (Exception ex)
            {
                // Log the exception (optional)
                Console.WriteLine(ex);
                return Ok(false);
            }
        }

        ///////////  CustomerTasks ==============================


        // List of Tasks
        [HttpGet("GetTasks/{CId}")]
        public async Task<IActionResult> GetTasks(int CId)
        {
            try
            {
                var task = await _ser.getCustomerTasksAsync(CId);
                return Ok(task);
            }
            catch (Exception ex)
            {
                // Log the exception (optional)
                Console.WriteLine(ex);
                return Ok(false);
            }
        }


        // Create or edit a task
        [HttpPost("CreateEditTask")]
        public async Task<ActionResult<bool>> CreateEditTask([FromBody] customerTask task)
        {
            try
            {
                if (task == null)
                {
                    return BadRequest("Task cannot be null."); // Return a 400 Bad Request if the task is null
                }

                if (task.taskId == 0) // Create new task
                {
                    var model = new customerTask
                    {
                        activityType = task.activityType,
                        summary = task.summary,
                        dueDate = task.dueDate,
                        comments = task.comments,
                        customerId = task.customerId,
                        UserId = task.UserId,
                        createDate = DateTime.Now
                    };

                    await _db.Task.AddAsync(model); // Use AddAsync for async operation
                    int n = await _db.SaveChangesAsync(); // Save changes asynchronously
                    return n > 0; // Return true if one or more records were affected
                }
                else // Update existing task
                {
                    var tsk = await _db.Task.FirstOrDefaultAsync(x => x.taskId == task.taskId); // Use await to retrieve the task

                    if (tsk == null)
                    {
                        return NotFound("Task not found."); // Return 404 if the task does not exist
                    }

                    tsk.activityType = task.activityType;
                    tsk.summary = task.summary;
                    tsk.dueDate = task.dueDate;
                    tsk.comments = task.comments;
                    tsk.customerId = task.customerId;
                    tsk.UserId = task.UserId;
                    tsk.updateDate = DateTime.Now;

                    _db.Task.Update(tsk); // Update the task
                    int n = await _db.SaveChangesAsync(); // Save changes asynchronously
                    return n > 0; // Return true if one or more records were affected
                }
            }
            catch (Exception ex)
            {
                // Log the exception (optional)
                Console.WriteLine(ex);
                return Ok(false);
            }
        }

        //return details of task
        [HttpGet("TaskDetails/{id}")]
        public async Task<IActionResult> TaskDetails(int id)
        {
            try
            {
                var task = await _ser.getTaskById1Async(id); // Get Customer tasks by customer id
                if (task != null)
                {
                    return Ok(task);
                }
                return Ok();
            }
            catch (Exception ex)
            {
                // Log the exception (optional)
                Console.WriteLine(ex);
                return Ok(false);
            }
        }

        //To delete a task
        [HttpDelete("DeleteTask/{id}")]
        public async Task<IActionResult> DeleteTask(int id)
        {
            try
            {
                var task = await _ser.DeleteTaskByIdAsync(id); //delete task by task ID
                if (task)
                {
                    return Ok();
                }
                return Ok();
            }
            catch (Exception ex)
            {
                // Log the exception (optional)
                Console.WriteLine(ex);
                return Ok(false);
            }
        }

        ///////////  Customer Notes ==============================

        // Return list of notes
        [HttpGet("GetNotes/{CId}")]
        public async Task<IActionResult> GetNotes(int CId)
        {
            try
            {
                var notes = await _ser.getCustomerNotesAsync(CId); // Get Notes list
                return Ok(notes);
            }
            catch (Exception ex)
            {
                // Log the exception (optional)
                Console.WriteLine(ex);
                return Ok(false);
            }
        }

        // Create or edit notes
        [HttpPost("CreateEditNotes")]
        public async Task<ActionResult<bool>> CreateEditNotes([FromBody] customerNotes notes)
        {
            try
            {
                if (notes == null)
                {
                    return BadRequest("Notes cannot be null."); // Return a 400 Bad Request if notes are null
                }

                if (notes.notesId == 0) // Create new note
                {
                    var model = new customerNotes
                    {
                        title = notes.title,
                        description = notes.description,
                        customerId = notes.customerId,
                        UserId = notes.UserId,
                        createDate = DateTime.Now
                    };

                    await _db.Notes.AddAsync(model); // Use AddAsync for async operation
                    int n = await _db.SaveChangesAsync(); // Save changes asynchronously
                    return n > 0; // Return true if one or more records were affected
                }
                else // Update existing note
                {
                    var nts = await _db.Notes.FirstOrDefaultAsync(x => x.notesId == notes.notesId); // Use await to retrieve the note

                    if (nts == null)
                    {
                        return NotFound("Note not found."); // Return 404 if the note does not exist
                    }

                    nts.title = notes.title;
                    nts.description = notes.description;
                    nts.UserId = notes.UserId;
                    nts.updateDate = DateTime.Now;

                    _db.Notes.Update(nts); // Update the note
                    int n = await _db.SaveChangesAsync(); // Save changes asynchronously
                    return n > 0; // Return true if one or more records were affected
                }
            }
            catch (Exception ex)
            {
                // Log the exception (optional)
                Console.WriteLine(ex);
                return Ok(false);
            }
        }

        //For return notes details
        [HttpGet("NotesDetails/{id}")]
        public async Task<IActionResult> NotesDetails(int id)
        {
            try
            {
                var notes = await _ser.getNotesById1Async(id); // Get notes list by customer ID
                if (notes != null)
                {
                    return Ok(notes);
                }
                return NotFound(); // Return 404 Not Found if the contact was not found
            }
            catch (Exception ex)
            {
                // Log the exception (optional)
                Console.WriteLine(ex);
                return Ok(false);
            }
        }

        //For delete Notes
        [HttpDelete("DeleteNotes/{id}")]
        public async Task<IActionResult> DeleteNotes(int id)
        {
            try
            {
                var notes = await _ser.DeleteNotesByIdAsync(id); // Delete Notes by notes ID
                if (notes)
                {
                    return Ok();
                }
                return NotFound(); // Return 404 Not Found if the contact was not found
            }
            catch (Exception ex)
            {
                // Log the exception (optional)
                Console.WriteLine(ex);
                return Ok(false);
            }
        }

        ///////////  Customer Documents ==============================
        
        /// <summary>
        /// To get all files and folder of a customer
        /// </summary>
        /// <param name="customerId">customer ID</param>
        /// <returns>List of files and folder</returns>
        [HttpGet("GetAllFiles")]
        public async Task<IActionResult> GetAllFilesAsync(int customerId)
        {
            try
            {
                // Define the folder path specific to the customer
                string specificFolder = Path.Combine("DocumentManager", "Customer", customerId.ToString());
                string fullPath = Path.Combine(_rootPath, specificFolder);

                // Check if the folder exists
                if (!Directory.Exists(fullPath))
                {
                    return Ok(false);
                }

                // Add a custom header to the response
                Response.Headers.Add("path", fullPath);

                // Fetch the directory contents asynchronously
                var model = await Task.Run(() => _ser.GetDirectoryContentsAsync(fullPath));

                // Return the list of files and folders as JSON (API response)
                return Ok(model);
            }
            catch (Exception ex)
            {
                // Log the exception
                Console.WriteLine(ex);
                return StatusCode(500, "Internal server error.");
            }
        }

        // For search the file or folder
        [HttpGet("GetAllFilesBySearching")]
        public async Task<IActionResult> GetAllFilesBySearching(int customerId, string searchQuery)
        {
            string fullPath = $"C:\\Users\\YSOFT_9\\Desktop\\Deepak Saini\\ZippyCRM_UsingAngular_API\\ZippyCRM_API\\Files\\DocumentManager\\Customer\\{customerId}\\";


            // Assume GetDirectoryContentsAsync is an asynchronous method
            var model = await _ser.GetDirectoryContentsAsync(fullPath);

            // If a search query is provided, filter the results
            if (!string.IsNullOrWhiteSpace(searchQuery))
            {
                model = model.Where(item => item.Name.Contains(searchQuery, StringComparison.OrdinalIgnoreCase)).ToList();
            }

            // Return the result as JSON
            return Ok(model);
        }

        /// <summary>
        /// To get Directory of a folder or file
        /// </summary>
        /// <param name="path">File or folder path</param>
        /// <returns>Directory</returns>
        [HttpGet("GetDirectory")]
        public async Task<IActionResult> GetDirectory(string path)
        {
            var res = Path.GetDirectoryName(path);
            return Ok(res);
        }

        /// <summary>
        /// To get folder contents 
        /// </summary>
        /// <param name="path">Folder path witch you want to get content</param>
        /// <returns>folder content</returns>
        [HttpGet("GetFolderContents")]
        public async Task<IActionResult> GetFolderContents(string path)
        {
            // Assume GetDirectoryContentsAsync is an asynchronous method
            var model = await _ser.GetDirectoryContentsAsync(path);

            var msg = Request.Headers["path"].ToString();
            if (msg == "Back")
            {
                _directoryItem = Path.GetDirectoryName(model.FirstOrDefault()?.Path);
            }
            else
            {
                _directoryItem = model.FirstOrDefault()?.Path;
            }
            // Return the result as JSON
            return Ok(model);
        }

        private static string? _directoryItem = "";// globel variable to store directory path

        /// <summary>
        /// To create the folder
        /// </summary>
        /// <param name="folderName">Folder name witch you want to create</param>
        /// <param name="currentPath">Path where you want to create the folder</param>
        /// <param name="customerId">Customer Id </param>
        /// <returns>true or false and if success then current path also</returns>
        [HttpPost("CreateDirectory")]
        public async Task<IActionResult> CreateDirectory(string folderName, string currentPath, int customerId)
        {
            if (string.IsNullOrEmpty(folderName))
            {
                ModelState.AddModelError("", "Please provide a folder name.");
                return Ok(false);
            }

            // Use the currentPath directly for folder creation
            var fullPath = Path.Combine(currentPath, folderName);

            // Check if the folder already exists
            if (await Task.Run(() => Directory.Exists(fullPath)))
            {
                ModelState.AddModelError("", "A folder with this name already exists.");
                return StatusCode(StatusCodes.Status500InternalServerError, new { success = false });
            }

            // Create the directory asynchronously
            await Task.Run(() => Directory.CreateDirectory(fullPath));

            return Ok(new { success = true, path = currentPath }); // Return current path
        }

        /// <summary>
        /// To rename a folder
        /// </summary>
        /// <param name="folderN">Folder name witch you want to rename</param>
        /// <param name="currentFolder">Folder path</param>
        /// <param name="newFolderName">new folder name</param>
        /// <returns>true or false and message</returns>
        [HttpPost("RenameFolder")]
        public async Task<IActionResult> RenameFolder(string folderN, string currentFolder, string newFolderName)
        {
            // Validate inputs
            if (string.IsNullOrWhiteSpace(currentFolder) || string.IsNullOrWhiteSpace(newFolderName))
            {
                return BadRequest(new { success = false, message = "Invalid folder name or new folder name." });
            }

            folderN = Path.GetDirectoryName(folderN);
            string extension = Path.GetExtension(currentFolder);
            var currentFolderPath = Path.Combine(folderN, currentFolder);
            string newFolderPath = Path.Combine(folderN, newFolderName);

            // Check if the target name already exists
            if (System.IO.File.Exists(newFolderPath) || Directory.Exists(newFolderPath))
            {
                return Conflict(new { success = false, message = "A file or folder with the new name already exists." });
            }

            try
            {
                if (!string.IsNullOrEmpty(extension) && System.IO.File.Exists(currentFolderPath))
                {
                    // Rename the file asynchronously
                    await Task.Run(() => System.IO.File.Move(currentFolderPath, newFolderPath));
                }
                else if (string.IsNullOrEmpty(extension) && Directory.Exists(currentFolderPath))
                {
                    // Rename the folder asynchronously
                    await Task.Run(() => Directory.Move(currentFolderPath, newFolderPath));
                }
                else
                {
                    return NotFound(new { success = false, message = "The specified folder or file does not exist." });
                }

                return Ok(new { success = true, path = newFolderPath });
            }
            catch (UnauthorizedAccessException)
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { success = false, message = "Access denied. Check folder permissions." });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { success = false, message = $"An unexpected error occurred: {ex.Message}" });
            }
        }
       
        private static List<string[]> _filePaths = new List<string[]>(); // globel variables for fatch file path from copy and past it
        private static string? _type; // when we move folder or file then type == move

        [HttpPost("CopyFolder")]
        public async Task<IActionResult> CopyFolder(string CurrentFolderName, int customerId, string Type, string filePath)
        {
            try
            {
                _type = Type; // Type is "Copy" if you copy a content or "Move" if you move a content
                var basePath = Path.GetDirectoryName(filePath);
                string sourceFolderPath = Path.Combine(basePath, CurrentFolderName);

                // Initialize the list to store file paths
                List<string[]> filePaths = new List<string[]>();

                // Check if the source folder or file exists
                if (System.IO.File.Exists(sourceFolderPath) || Directory.Exists(sourceFolderPath))
                {
                    filePaths.Add(new string[] { sourceFolderPath });
                }

                // Get directories in the source folder
                if (Directory.Exists(sourceFolderPath))
                {

                    string[] directories = await Task.Run(() => Directory.GetDirectories(sourceFolderPath, "*", SearchOption.AllDirectories)); // Retrieve all folders (inner folders also)
                    string[] newArray = new string[directories.Length + 1];

                    // Copy the old elements to the new array
                    directories.CopyTo(newArray, 0);
                    newArray[newArray.Length - 1] = sourceFolderPath;

                    // Add file paths for each directory
                    foreach (string directory in newArray)
                    {
                        // Get all files in the current directory asynchronously
                        string[] files = await Task.Run(() => Directory.GetFiles(directory));

                        if (files.Length > 0)
                        {
                            filePaths.Add(files);
                        }
                    }

                    filePaths.Add(directories);

                }

                // Store the source path to use for pasting
                _filePaths = filePaths;

                return Ok(true);
            }
            catch (Exception ex)
            {
                // Log exception and return an error response
                return StatusCode(StatusCodes.Status500InternalServerError, "Internal server error: " + ex.Message);
            }
        }

        private static int count = 0; // Count folder or file parts
        /// <summary>
        /// To paste the content (Copyed or Moved content)
        /// </summary>
        /// <param name="destinationFoldername">destination Folder name</param>
        /// <param name="customerId">customer id</param>
        /// <param name="sourceFolderPath">Folder pathe where you want to paste it</param>
        /// <returns>true or false</returns>
        [HttpPost("PasteFolder")]
        public async Task<IActionResult> PasteFolder(string destinationFoldername, int customerId, string sourceFolderPath)
        {
            if (_filePaths == null || !_filePaths.Any())
            {
                return BadRequest("No folder has been copied.");
            }
            string baseDestinationPath = Path.Combine(Path.GetDirectoryName(sourceFolderPath), destinationFoldername); // The base path where we paste the copied content.
            string deletePath = ""; // Here we store whitch folder need to delete if type is "Move"
            bool isDelete = true; // We used this variable for user can enter any condition at one time.

            foreach (string[] item in _filePaths)  
            {
                int i = 0;
                foreach (string val in item)
                {
                    if (count == 0)
                    {
                        // Count path parts
                        string[] countPath = item[i].Split(new string[] { "\\" }, StringSplitOptions.None);
                        count = countPath.Length - 1;
                    }

                    string[] pathParts = item[i].Split(new string[] { "\\" }, StringSplitOptions.None); // It used to diffrentiate the path with '\\'.

                    string pathAfterCustomerId = string.Join(Path.DirectorySeparatorChar.ToString(), pathParts, count, pathParts.Length - count);

                    // Combine the destination folder path with the relative path of the copied content
                    string destinationPath = baseDestinationPath + "\\" + pathAfterCustomerId;

                    try
                    {
                        if (System.IO.File.Exists(val))
                        {
                            // Ensure the parent directory exists
                            Directory.CreateDirectory(Path.GetDirectoryName(destinationPath)); // Create parent folder of the file

                            // Copy the file asynchronously
                            using (var sourceStream = System.IO.File.OpenRead(val))
                            using (var destinationStream = System.IO.File.Create(destinationPath))
                            {
                                await sourceStream.CopyToAsync(destinationStream);
                            }
                            //Path.GetFileName()
                            if (_type == "Move")
                            {
                                System.IO.File.Delete(val); // Delete the original file if it's a move
                            }
                        }
                        else if (Directory.Exists(val))
                        {
                            // Create the directory asynchronously
                            Directory.CreateDirectory(destinationPath); // Create the directory in the destination

                            if (_type == "Move" && isDelete == true)
                            {
                                deletePath = item[0]; // Delete the original folder if it's a move
                                isDelete = false;
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        // Log exception and return an error response
                        return StatusCode(StatusCodes.Status500InternalServerError, $"Error while pasting: {ex.Message}");
                    }
                    i++;
                }
            }
            Directory.Delete(deletePath, true);
            count = 0;
            return Ok(true);
        }


        /// <summary>
        /// Delete the folder
        /// </summary>
        /// <param name="folderName">Folder name witch you want to delete</param>
        /// <param name="filePath">Folder or file path</param>
        /// <returns>reue or false and if true then folder path</returns>
        [HttpDelete("DeleteFolder")]
        public async Task<IActionResult> DeleteFolder(string folderName, string filePath)
        {
            var basePath = Path.GetDirectoryName(filePath);

            // Validate the input
            if (string.IsNullOrWhiteSpace(folderName))
            {
                return BadRequest("Invalid folder name.");
            }

            // Get the file extension
            string extension = Path.GetExtension(folderName);
            var fullPath = Path.Combine(basePath, folderName);

            try
            {
                if (!string.IsNullOrEmpty(extension) && System.IO.File.Exists(fullPath))
                {
                    // Delete the file asynchronously
                    await Task.Run(() => System.IO.File.Delete(fullPath));
                }
                // Check if the folder exists
                else if (string.IsNullOrEmpty(extension) && Directory.Exists(fullPath))
                {
                    // Delete the folder and its contents asynchronously
                    await Task.Run(() => Directory.Delete(fullPath, true));
                }
                return Ok(new { success = true, path = basePath });
            }
            catch (Exception ex)
            {
                // Log the exception (optional)
                Console.WriteLine(ex);
                return StatusCode(StatusCodes.Status500InternalServerError, new { success = false, message = ex.Message });
            }
        }

        ///////////  Customer Appointments ==============================

        /// <summary>
        /// Get Appointment List according to customer ID
        /// </summary>
        /// <param name="CId">customer id</param>
        /// <returns>List of appoinments</returns>
        [HttpGet("GetAppointments/{CId}")]
        public async Task<IActionResult> GetAppointments(int CId)
        {
            // Retrieve the appointments from the database
            var appointments = await _db.Appointment.Where(x => x.CId == CId).Select(a => new
            {
                appointmentid = a.AppointmentId, // Assuming Id is the primary key
                subject = a.Subject,   // Assuming Subject is a property of the Appointment model
                description = a.Description, // Assuming Description is a property of the Appointment model
                start = a.StartDate.ToString("o"), // Use ISO8601 format for FullCalendar
                end = a.EndDate.ToString("o") // Handle nullable EndDate
            }).ToListAsync();

            // Return the appointments as JSON
            return Ok(appointments);
        }

        /// <summary>
        /// Create edit customer appointment
        /// </summary>
        /// <param name="model">appointment model</param>
        /// <returns>true or false</returns>
        [HttpPost("CreateEditAppointment")] // Use the appropriate HTTP method for creating a resource
        public async Task<IActionResult> CreateEditAppointment([FromBody] Appointment model)
        {
            if (model == null)
            {
                return BadRequest("Appointment model is null");
            }

            if (model.AppointmentId == 0) //Create appointment if appointment id is 0
            {
                var appointment = new Appointment
                {
                    Subject = model.Subject,
                    Description = model.Description,
                    StartDate = model.StartDate,
                    EndDate = model.EndDate,
                    CId = model.CId
                };
                await _db.Appointment.AddAsync(appointment); // Use AddAsync for asynchronous operation
            }
            else //Edit appointment if appointment id is not 0
            {
                var appointment = await _db.Appointment.FirstOrDefaultAsync(x => x.AppointmentId == model.AppointmentId);
                if (appointment == null)
                {
                    return NotFound("Appointment not found");
                }

                appointment.Subject = model.Subject;
                appointment.Description = model.Description;
                appointment.StartDate = model.StartDate;
                appointment.EndDate = model.EndDate;
                appointment.CId = appointment.CId; // This line is redundant, you can remove it
                _db.Appointment.Update(appointment);
            }

            int n = await _db.SaveChangesAsync(); // Use SaveChangesAsync for asynchronous operation
            if (n > 0)
            {
                return Ok(true);
            }

            return StatusCode(500, "An error occurred while saving the appointment");
        }

        /// <summary>
        /// Get appointment details by appointment ID
        /// </summary>
        /// <param name="id">Appointment ID</param>
        /// <returns>Appointment</returns>
        [HttpGet("GetAppointmentDetails/{id}")]
        public async Task<IActionResult> GetAppointmentDetails(int id)
        {
            var appointment = await _ser.getAppointmentByIdAsync(id);
            if (appointment == null)
            {
                return NotFound(); // Handle the case when the appointment doesn't exist
            }
            return Ok(appointment);
        }

        /// <summary>
        /// Update a appointment
        /// </summary>
        /// <param name="request">Update Appointment Request model</param>
        /// <returns>true or false</returns>
        [HttpPost("UpdateAppointment")]
        public async Task<IActionResult> UpdateAppointment([FromBody] UpdateAppointmentRequest request)
        {
            var appointment = await _db.Appointment.FirstOrDefaultAsync(a => a.AppointmentId == request.Id);
            if (appointment != null)
            {
                appointment.StartDate = request.NewStart;
                appointment.EndDate = request.NewEnd;
                await _db.SaveChangesAsync();
                return Ok(); // Return a success response
            }

            return NotFound(); // Return a not found response if the appointment doesn't exist
        }

        //To delete a Appointment
        [HttpDelete("DeleteAppointment/{id}")]
        public async Task<IActionResult> DeleteAppointment(int id)
        {
            var appointment = await _ser.DeleteAppointmentByIdAsync(id);
            if (appointment)
            {
                return Ok(true);
            }
            return Ok(false);
        }

    }
}
