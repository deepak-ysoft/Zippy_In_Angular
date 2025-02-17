using Microsoft.AspNetCore.Mvc.Rendering;

namespace ZippyCRM_API.Models
{
    public class CustomerVM
    {
        public List<Customer> Customers { get; set; }
        public Customer Customer { get; set; }
        public IEnumerable<SelectListItem> GenderList { get; set; }
        public IEnumerable<SelectListItem> LanguageList { get; set; }
        public IEnumerable<SelectListItem> TitleList { get; set; }
        public IEnumerable<SelectListItem> TypeList { get; set; }
    }
}
