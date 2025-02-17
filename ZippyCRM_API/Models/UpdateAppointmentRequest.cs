namespace ZippyCRM_API.Models
{
    public class UpdateAppointmentRequest
    {
        public int Id { get; set; }
        public DateTime NewStart { get; set; }
        public DateTime NewEnd { get; set; }
    }
}
