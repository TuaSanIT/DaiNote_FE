import * as signalR from '@microsoft/signalr';

// SignalR connection setup
const connection = new signalR.HubConnectionBuilder()
  .withUrl(`${process.env.VUE_APP_API_BASE_URL}/chatHub`, {
    withCredentials: true,
    skipNegotiation: false,
    transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
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

// Function to start SignalR connection
async function startSignalRConnection() {
  if (connection.state === signalR.HubConnectionState.Connected) {
    console.log('SignalR connection is already started.');
    return;
  }

  try {
    await connection.start();
    console.log('SignalR Connected.');
  } catch (err) {
    console.error('Error while starting SignalR connection:', err);
    setTimeout(startSignalRConnection, 5000); // Retry after 5 seconds
  }
}

// Handle connection close
connection.onclose(async () => {
  console.warn('SignalR Disconnected. Attempting reconnection...');
  await startSignalRConnection();
});

// Export SignalR service
export const signalRService = {
  startConnection: startSignalRConnection,

  sendMessage: async (user, message) => {
    if (connection.state === signalR.HubConnectionState.Connected) {
      await connection.invoke('SendMessage', { User: user, Content: message });
    } else {
      console.error('Connection is not active. Cannot send message.');
    }
  },

  sendMessageWithFile: async (chatRoomId, message, file) => {
    const formData = new FormData();
    formData.append('ChatRoomId', chatRoomId);
    formData.append('Message', message || '');

    if (file) {
      formData.append('file', file);
    }

    try {
      const response = await fetch(`${process.env.VUE_APP_API_BASE_URL}/api/chat/send`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        console.error('Error uploading message with file:', response.statusText);
      }
    } catch (error) {
      console.error('Error in sendMessageWithFile:', error);
    }
  },

  onReceiveMessage: (callback) => {
    connection.on('ReceiveMessage', callback);
  },

  sendPrivateMessage: async (receiverUserId, message) => {
    if (connection.state === signalR.HubConnectionState.Connected) {
      await connection.invoke('SendPrivateMessage', {
        ReceiverUserId: receiverUserId,
        Message: message,
      });
    } else {
      console.error('Connection is not active. Cannot send private message.');
    }
  },

  joinRoom: async (roomName, userName) => {
    if (connection.state === signalR.HubConnectionState.Connected) {
      await connection.invoke('JoinRoom', { Room: roomName, User: userName });
    } else {
      console.error('Connection is not active. Cannot join room.');
    }
  },

  sendTypingNotification: async (isTyping, receiverConnectionId) => {
    if (connection.state === signalR.HubConnectionState.Connected) {
      await connection.invoke('NotifyTyping', isTyping, receiverConnectionId);
    } else {
      console.error('Connection is not active. Cannot send typing notification.');
    }
  },

  loadChatRooms: async () => {
    if (connection.state === signalR.HubConnectionState.Connected) {
      await connection.invoke('CallLoadChatData');
    } else {
      console.error('Connection is not active. Cannot load chat rooms.');
    }
  },

  getUserId: async () => {
    if (connection.state === signalR.HubConnectionState.Connected) {
      await connection.invoke('GetUserId');
    } else {
      console.error('Connection is not active. Cannot get user ID.');
    }
  },

  sendNotificationToAll: async (message) => {
    if (connection.state === signalR.HubConnectionState.Connected) {
      await connection.invoke('SendNotificationToAll', message);
    } else {
      console.error('Connection is not active. Cannot send notification.');
    }
  },

  getConnectedUsers: async () => {
    if (connection.state === signalR.HubConnectionState.Connected) {
      await connection.invoke('UpdateConnectedUsersList');
    } else {
      console.error('Connection is not active. Cannot get connected users.');
    }
  },
};

// Start the connection
startSignalRConnection();

export default connection;