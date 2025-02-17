using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;
using System.ComponentModel.DataAnnotations;

namespace ZippyCRM_API.Hub
{
    [Authorize]
    public class DirectMessageHub : Microsoft.AspNetCore.SignalR.Hub
    {

        private static readonly ConcurrentDictionary<string, UserConnection> _connections = new();
        private readonly IChatRepository _chatRepository;

        public DirectMessageHub(IChatRepository chatRepository)
        {
            _chatRepository = chatRepository;
        }

        // Method to send a message

        public async Task SendMessage(int senderId, int receiverId, string message)
        {
            var sender = Context.User.Identity?.Name; // The authenticated user's name

            if (string.IsNullOrEmpty(sender))
            {
                throw new HubException("User is not authenticated");
            }

            // Check if the receiver is connected
            string receiverConnectionId = _connections
                .Where(c => c.Value.User == receiverId.ToString()) // Match by receiver user ID
                .Select(c => c.Value.ConnectionId)
                .FirstOrDefault();
            var recipientConnection = _connections.FirstOrDefault(c => c.Value.User == receiverId.ToString()).Key;



            var timestamp = DateTime.Now;
            var chatMessage = new ChatMessage
            {
                SenderId = senderId,
                ReceiverId = receiverId,
                Message = message,
                Timestamp = timestamp
            };

            // Save the message in the database
            await _chatRepository.AddMessageAsync(chatMessage);
            // If receiver connection is found, send the message
            if (!string.IsNullOrEmpty(receiverConnectionId))
            {
                // Notify the receiver
                await Clients.Client(receiverConnectionId).SendAsync("ReceiveMessage", sender, chatMessage.ReceiverId.ToString(), message, timestamp);
            }
            else
            {
                // Handle case when the receiver is not connected (optional)
                Console.WriteLine($"Receiver {receiverId} not connected.");
            }
        }

        // Method to retrieve chat history between two users
        public async Task<List<ChatMessage>> GetChatHistory(int userId, int otherUserId)
        {
            if (!_connections.TryGetValue(Context.ConnectionId, out UserConnection? currentUserConnection))
            {
                throw new Exception("User is not connected.");
            }

            var currentUserId = userId;
            var data = await _chatRepository.GetChatHistoryAsync(currentUserId, otherUserId);
            return data;
        }
        // Override OnConnectedAsync to map the user to the connection
        public override async Task OnConnectedAsync ()
        {
            var userId = Context.User?.Identity?.Name; ;

            if (string.IsNullOrEmpty(userId))
            {
                throw new Exception("User is not authenticated.");
            }

            var userConnection = new UserConnection
            {
                User = userId,
                ConnectionId = Context.ConnectionId
            };

            _connections[Context.ConnectionId] = userConnection;

            await base.OnConnectedAsync();
        }

        // Override OnDisconnectedAsync to remove the connection
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            _connections.TryRemove(Context.ConnectionId, out _);
            await base.OnDisconnectedAsync(exception);
        }
    }

    // Supporting classes

    public class UserConnection
    {
        public string User { get; set; } = string.Empty;
        public string ConnectionId { get; set; } = string.Empty;
    }

    public class ChatMessage
    {
        [Key]
        public int id { get; set; }
        public int SenderId { get; set; }
        public int ReceiverId { get; set; }
        public string Message { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
    }

    // Repository Interface
    public interface IChatRepository
    {
        Task AddMessageAsync(ChatMessage chatMessage);
        Task<List<ChatMessage>> GetChatHistoryAsync(int user1, int user2);
    }

}

