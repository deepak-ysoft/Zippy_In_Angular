using Microsoft.EntityFrameworkCore;
using ZippyCRM_API.Models;

namespace ZippyCRM_API.Hub
{
    public class DirectMessageRepository:IChatRepository
    {
        private readonly UserDbContext _context;

        public DirectMessageRepository(UserDbContext context)
        {
            _context = context;
        }

        // Save a message to the database
        public async Task AddMessageAsync(ChatMessage chatMessage)
        {
            _context.ChatMessages.Add(chatMessage);
            await _context.SaveChangesAsync();
        }

        // Retrieve chat history between two users
        public async Task<List<ChatMessage>> GetChatHistoryAsync(int user1, int user2)
        {
            return await _context.ChatMessages
                .Where(m =>
                    (m.SenderId == user1 && m.ReceiverId == user2) ||
                    (m.SenderId == user2 && m.ReceiverId == user1))
                .OrderBy(m => m.Timestamp)
                .ToListAsync();
        }
    }
}
