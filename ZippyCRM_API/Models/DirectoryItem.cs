using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ZippyCRM_API.Models
{
  public  class DirectoryItem
    {
        public string Name { get; set; }
        public string Path { get; set; }
        public bool IsDirectory { get; set; }
        public long SizeInBytes { get; set; } // Size in bytes
        public double SizeInKilobytes => SizeInBytes / 1024.0; // Size in kilobytes
        public DateTime CreatedDateTime { get; set; } // File creation date

    }
}
