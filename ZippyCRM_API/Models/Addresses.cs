using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ZippyCRM_API.Models
{
    public class Addresses
    {
        [Key]
        public int addressId { get; set; }
        [Required(ErrorMessage ="Please enter address name.")]
        public string addressName { get; set; }
        [Required(ErrorMessage = "Please enter address.")]
        public string address { get; set; }
        [Required(ErrorMessage = "Please enter email.")]
        [StringLength(100)]
        public string email { get; set; }
        [Required(ErrorMessage = "Please enter phone number.")]
        [MaxLength(20)]
        public string phone { get; set; }
        [Required(ErrorMessage = "Please enter mobile number.")]
        [MaxLength(20)]
        public string mobile { get; set; }
        [Required(ErrorMessage = "Please enter Internal Notes.")]
        [StringLength(1000)]
        public string internalNotes { get; set; }
        public int customerId { get; set; }
        //public Customer customer { get; set; }
    }
}
