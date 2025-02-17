using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ZippyCRM_API.Models
{
    public class customerNotes
    {
        [Key]
        public int notesId { get; set; }
        [Required]
        public string title { get; set; }
        [Required]
        public string description { get; set; }
        public int customerId { get; set; }
        public int UserId { get; set; }
        [NotMapped]
        public string? Username { get; set; }
        public DateTime? createDate { get; set; }
        public DateTime? updateDate { get; set; }
    }
}
