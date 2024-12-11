<template>
    <div class="chat-container">
      <div class="chat-sidebar">
        <h2>Chat Rooms</h2>
        <!-- Form tạo phòng chat -->
        <div class="create-room">
          <input v-model="newRoomName" placeholder="Enter room name" />
          <button @click="createChatRoom">Create Room</button>
        </div>
  
        <!-- Danh sách phòng chat -->
        <ul class="chat-room-list">
          <li v-for="(room, index) in chatRooms" :key="index" class="chat-room-item">
            <span>{{ room.name }}</span>
            <div class="room-actions">
              <button @click="joinRoom(room.id)">Join Room</button>
            </div>
          </li>
        </ul>
  
        <h2>Private Chats</h2>
        <!-- Danh sách người dùng -->
        <ul class="user-list">
          <li v-for="(user, index) in users" :key="index" class="user-item">
            <span>{{ user.fullName }}</span>
            <button @click="startPrivateChat(user.id)">Chat</button>
          </li>
        </ul>
      </div>
  
      <!-- Chat UI -->
      <div class="chat-main" v-if="currentRoomId || currentUserId">
        <div class="chat-header">
          <h2 v-if="currentRoomId">Chat Room: {{ currentRoomName }}</h2>
          <h2 v-if="currentUserId">Private Chat with {{ currentUserName }}</h2>
        </div>
        <div class="chat-messages">
          <ul>
            <li v-for="(msg, index) in messages" :key="index" class="message">
              <span class="message-user">{{ msg.sender }}</span>: <span class="message-content">{{ msg.content }}</span>
            </li>
          </ul>
        </div>
        <div class="chat-input">
          <input v-model="message" placeholder="Type a message..." />
          <button @click="sendMessage">Send</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import connection from '@/services/signalr';
  
  export default {
    data() {
      return {
        chatRooms: [], // Danh sách phòng chat
        users: [], // Danh sách người dùng
        newRoomName: '', // Tên phòng chat mới
        currentRoomId: null, // ID phòng chat hiện tại
        currentRoomName: '', // Tên phòng chat hiện tại
        currentUserId: null, // ID người dùng đang chat 1-1
        currentUserName: '', // Tên người dùng đang chat 1-1
        message: '', // Nội dung tin nhắn
        messages: [], // Danh sách tin nhắn
      };
    },
    methods: {
      // Load danh sách phòng chat
      async loadChatRooms() {
        try {
          const response = await fetch('http://localhost:5141/api/chatroom/get-chat-rooms');
          if (response.ok) {
            this.chatRooms = await response.json();
          } else {
            console.error('Failed to load chat rooms');
          }
        } catch (err) {
          console.error('Error loading chat rooms:', err);
        }
      },
  
      // Load danh sách người dùng
      async loadUsers() {
        try {
          const response = await fetch('http://localhost:5141/api/user');
          if (response.ok) {
            this.users = await response.json();
          } else {
            console.error('Failed to load users');
          }
        } catch (err) {
          console.error('Error loading users:', err);
        }
      },
  
      // Tạo phòng chat mới
      async createChatRoom() {
        if (!this.newRoomName) return;
  
        try {
          const response = await fetch('http://localhost:5141/api/chatroom/create-chat-room', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: this.newRoomName }),
          });
  
          if (response.ok) {
            const data = await response.json();
            this.chatRooms.push(data.chatRoom);
            this.newRoomName = '';
          } else {
            console.error('Failed to create chat room');
          }
        } catch (err) {
          console.error('Error creating chat room:', err);
        }
      },
  
      // Tham gia phòng chat
      async joinRoom(roomId) {
        this.currentRoomId = roomId;
        this.currentUserId = null; // Reset private chat
        this.messages = [];
  
        try {
          const response = await fetch(`http://localhost:5141/api/chat/messages?roomId=${roomId}`);
          if (response.ok) {
            this.messages = await response.json();
          } else {
            console.error('Failed to load room messages');
          }
        } catch (err) {
          console.error('Error joining room:', err);
        }
      },
  
      // Bắt đầu chat riêng tư
      async startPrivateChat(userId) {
        this.currentRoomId = null; // Reset group chat
        this.currentUserId = userId;
        this.messages = [];
  
        try {
          const response = await fetch(
            `http://localhost:5141/api/chatprivate/messages?senderUserId=YOUR_USER_ID&receiverUserId=${userId}`
          );
          if (response.ok) {
            this.messages = await response.json();
          } else {
            console.error('Failed to load private messages');
          }
        } catch (err) {
          console.error('Error starting private chat:', err);
        }
      },
  
      // Gửi tin nhắn
      async sendMessage() {
        if (!this.message) return;
  
        const payload = {
          message: this.message,
        };
  
        if (this.currentRoomId) {
          payload.roomId = this.currentRoomId;
          await this.sendGroupMessage(payload);
        } else if (this.currentUserId) {
          payload.receiverUserId = this.currentUserId;
          await this.sendPrivateMessage(payload);
        }
  
        this.message = ''; // Reset message input
      },
  
      // Gửi tin nhắn nhóm
      async sendGroupMessage(payload) {
        try {
          await connection.invoke('SendMessage', payload);
          this.messages.push({ sender: 'You', content: payload.message });
        } catch (err) {
          console.error('Error sending group message:', err);
        }
      },
  
      // Gửi tin nhắn riêng tư
      async sendPrivateMessage(payload) {
        try {
          await connection.invoke('SendPrivateMessage', payload);
          this.messages.push({ sender: 'You', content: payload.message });
        } catch (err) {
          console.error('Error sending private message:', err);
        }
      },
    },
    mounted() {
      this.loadChatRooms();
      this.loadUsers();
  
      connection.on('ReceiveMessage2', (sender, content) => {
        this.messages.push({ sender, content });
      });
  
      connection.on('ReceiveChatPrivateRealtime', (privateMessage) => {
        if (
          privateMessage.senderUserId === this.currentUserId ||
          privateMessage.receiverUserId === this.currentUserId
        ) {
          this.messages.push({ sender: privateMessage.senderUserId, content: privateMessage.message });
        }
      });
    },
  };
  </script>
  
  <style scoped>
  .chat-container {
    display: flex;
    height: 100vh;
    font-family: Arial, sans-serif;
  }
  
  .chat-sidebar {
    width: 25%;
    background-color: #f5f5f5;
    padding: 15px;
    border-right: 1px solid #ddd;
    overflow-y: auto;
  }
  
  .chat-sidebar h2 {
    font-size: 1.5em;
    margin-bottom: 10px;
  }
  
  .create-room {
    margin-bottom: 20px;
  }
  
  .create-room input {
    width: 70%;
    padding: 10px;
    margin-right: 5px;
    border: 1px solid #ccc;
    border-radius: 5px;
  }
  
  .create-room button {
    padding: 10px 15px;
    background-color: #0078ff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  
  .create-room button:hover {
    background-color: #0056cc;
  }
  
  .chat-room-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .chat-room-item {
    display: flex;
    justify-content: space-between;
    padding: 10px;
    border-bottom: 1px solid #ddd;
  }
  
  .room-actions button {
    margin-left: 5px;
    padding: 5px 10px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  
  .room-actions button:nth-child(1) {
    background-color: #e74c3c;
    color: white;
  }
  
  .room-actions button:nth-child(1):hover {
    background-color: #c0392b;
  }
  
  .room-actions button:nth-child(2) {
    background-color: #2ecc71;
    color: white;
  }
  
  .room-actions button:nth-child(2):hover {
    background-color: #27ae60;
  }
  
  .chat-main {
    width: 75%;
    display: flex;
    flex-direction: column;
  }
  
  .chat-header {
    padding: 15px;
    background-color: #0078ff;
    color: white;
    font-size: 1.2em;
  }
  
  .chat-messages {
    flex: 1;
    padding: 15px;
    overflow-y: auto;
    background-color: #f5f5f5;
  }
  
  .message {
    padding: 10px;
    margin-bottom: 10px;
    background-color: white;
    border-radius: 10px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }
  
  .message-user {
    font-weight: bold;
  }
  
  .chat-input {
    display: flex;
    padding: 15px;
    border-top: 1px solid #ddd;
    background-color: #f9f9f9;
  }
  
  .chat-input input {
    flex: 1;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
  }
  
  .chat-input button {
    margin-left: 10px;
    padding: 10px 15px;
    background-color: #0078ff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  
  .chat-input button:hover {
    background-color: #0056cc;
  }
  </style>
  