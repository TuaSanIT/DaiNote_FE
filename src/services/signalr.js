import * as signalR from '@microsoft/signalr';

// SignalR connection setup
const connection = new signalR.HubConnectionBuilder()
  .withUrl(`${process.env.VUE_APP_API_BASE_URL}/chatHub`, {
    withCredentials: true,
    skipNegotiation: true,
    transport: signalR.HttpTransportType.WebSockets,
  })
  .configureLogging(signalR.LogLevel.Information)
  .build();

connection.on('ReceiveMessage2', (user, message) => {
  console.log(`${user} says: ${message}`);
});

connection.on('ReceivePrivateMessage', (message) => {
  console.log('Private message received:', message);
});

connection.on('ReceiveNotificationRealtime', (notification) => {
  console.log('Real-time Notification:', notification);
});

connection.on('UpdateUsersList', (users) => {
  console.log('Updated connected users list:', users);
});

connection.on('UpdateUsersOnlineList', (usersOnline) => {
  console.log('Users online:', usersOnline);
});

connection.on('UpdateUsersOfflineList', (usersOffline) => {
  console.log('Users offline:', usersOffline);
});

connection.on('ReceiveChatRoomSignalR', (chatRoom) => {
  console.log('Chat room updated:', chatRoom);
});

connection.on('ReceiveNewChatRoom', (chatRoom) => {
  console.log('New chat room created:', chatRoom);
});

connection.on('ReceiveUpdatedChatRoom', (chatRoom) => {
  console.log('Chat room updated:', chatRoom);
});

connection.on('ReceiveDeletedChatRoom', (chatRoomId) => {
  console.log('Chat room deleted:', chatRoomId);
});

connection.on('ReceiveTypingNotification', (user, isTyping) => {
  console.log(`${user.fullName} is ${isTyping ? 'typing...' : 'not typing'}`);
});

connection.on('ReceiveSystemMessage', (message) => {
  console.log('System message:', message);
  
});

async function startSignalRConnection() {
  try {
    await connection.start();
    console.log('SignalR Connected.');
  } catch (err) {
    console.error('Error while starting SignalR connection:', err);
    setTimeout(startSignalRConnection, 5000); 
  }
}

connection.onclose(() => {
  console.warn('SignalR Disconnected. Attempting reconnection...');
  startSignalRConnection();
});

export const signalRService = {
  startConnection: startSignalRConnection,

  sendMessage: async (user, message) => {
    await connection.invoke('SendMessage', { User: user, Content: message });
  },
  sendMessageWithFile: async (chatRoomId, message, file) => {
    const formData = new FormData();
    formData.append("ChatRoomId", chatRoomId);
    formData.append("Message", message || "");

    if (file) {
      formData.append("file", file);
    }
    const response = await fetch(`${process.env.VUE_APP_API_BASE_URL}/api/chat/send`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      console.error("Error uploading message with file:", response.statusText);
    }
  },

  onReceiveMessage: (callback) => {
    connection.on("ReceiveMessage", callback);
  },
  sendPrivateMessage: async (receiverUserId, message) => {
    await connection.invoke('SendPrivateMessage', {
      ReceiverUserId: receiverUserId,
      Message: message,
    });
  },

  joinRoom: async (roomName, userName) => {
    await connection.invoke('JoinRoom', { Room: roomName, User: userName });
  },

  sendTypingNotification: async (isTyping, receiverConnectionId) => {
    await connection.invoke('NotifyTyping', isTyping, receiverConnectionId);
  },

  loadChatRooms: async () => {
    await connection.invoke('CallLoadChatData');
  },

  getUserId: async () => {
    await connection.invoke('GetUserId');
  },

  sendNotificationToAll: async (message) => {
    await connection.invoke('SendNotificationToAll', message);
  },

  getConnectedUsers: async () => {
    await connection.invoke('UpdateConnectedUsersList');
  },
};

startSignalRConnection();

export default connection;
