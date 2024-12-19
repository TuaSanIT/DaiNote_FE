import * as signalR from '@microsoft/signalr';

let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

// SignalR connection setup
const connection = new signalR.HubConnectionBuilder()
  .withUrl(`${process.env.VUE_APP_API_BASE_URL}/chatHub`, {
    withCredentials: true,
    skipNegotiation: true,
    transport: signalR.HttpTransportType.WebSockets,
  })
  .configureLogging(signalR.LogLevel.Information)
  .build();

// Event handlers
connection.on('ReceiveRoomMessage', (message) => {
  console.log('Room message received:', message);
});

connection.on('ReceivePrivateMessage', (message) => {
  console.log('Private message received:', message);
});

connection.on('ReceiveTypingNotification', (user, isTyping) => {
  console.log(`${user.fullName} is ${isTyping ? 'typing...' : 'not typing'}`);
});

connection.on('ReceiveEmoji', (emoji) => {
  console.log('Emoji received:', emoji);
});

// Start SignalR connection with retry logic
async function startSignalRConnection() {
  if (
    connection.state === signalR.HubConnectionState.Connected || 
    connection.state === signalR.HubConnectionState.Connecting
  ) {
    console.log('SignalR connection is already started or in the process of starting.');
    return Promise.resolve();
  }

  try {
    await connection.start();
    console.log('SignalR Connected.');
    reconnectAttempts = 0;
    return Promise.resolve();
  } catch (err) {
    reconnectAttempts++;
    console.error(`Error while starting SignalR connection: ${err.message}`);

    if (reconnectAttempts <= MAX_RECONNECT_ATTEMPTS) {
      console.log(`Reconnecting... Attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}`);
      setTimeout(startSignalRConnection, 5000); // Retry after 5 seconds
    } else {
      console.error('Maximum reconnect attempts reached. Connection aborted.');
    }
  }
}

// Handle disconnection
connection.onclose(async () => {
  console.warn('SignalR Disconnected. Attempting reconnection...');
  if (connection.state !== signalR.HubConnectionState.Connected) {
    await startSignalRConnection();
  }
});

export const signalRService = {
  startConnection: async () => {
    if (
      connection.state === signalR.HubConnectionState.Connected || 
      connection.state === signalR.HubConnectionState.Connecting
    ) {
      console.log('SignalR connection is already started or in the process of starting.');
      return Promise.resolve();
    }
    return startSignalRConnection();
  },

  sendRoomMessage: async (formData) => {
    const response = await fetch(`${process.env.VUE_APP_API_BASE_URL}/api/chat/room/send-message`, {
      method: "POST",
      body: formData,
    });
  
    if (!response.ok) {
      console.error("Error sending room message with file:", response.statusText);
      return;
    }
  
    console.log("Room message sent successfully");
  },  

  getRoomMessages: async (chatRoomId) => {
    const response = await fetch(`${process.env.VUE_APP_API_BASE_URL}/api/chat/room/messages/${chatRoomId}`);
    if (response.ok) {
      return await response.json();
    } else {
      console.error("Error fetching room messages:", response.statusText);
      return [];
    }
  },

  getPrivateMessages: async (senderId, receiverId) => {
    const response = await fetch(`${process.env.VUE_APP_API_BASE_URL}/api/chat/private/messages?senderId=${senderId}&receiverId=${receiverId}`);
    if (response.ok) {
      return await response.json();
    } else {
      console.error("Error fetching private messages:", response.statusText);
      return [];
    }
  },

  sendTypingNotification: async (isTyping, receiverConnectionId) => {
    await connection.invoke('NotifyTyping', isTyping, receiverConnectionId);
  },

  onReceiveMessage: (callback) => {
    connection.on("ReceiveRoomMessage", callback);
    connection.on("ReceivePrivateMessage", callback);
  },

  onReceiveEmoji: (callback) => {
    connection.on("ReceiveEmoji", callback);
  },
};

startSignalRConnection();

export default connection;
