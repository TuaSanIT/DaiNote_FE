<template>
  <div class="chat-container" :class="{ 'collapsed-sidebar': !isSidebarOpen }">
    <div class="chat-sidebar">
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
        <li v-for="(user, index) in users" :key="index" class="user-item" @click="startPrivateChat(user.user_Id)">
          <img :src="user.avatarImage || defaultAvatar" alt="avatar" class="user-avatar" />
          <div class="user-info">
            <span class="user-fullname">{{ user.fullName }}</span>
            <span class="user-username">@{{ user.userName }}</span>
          </div>
          <!-- Hiển thị trạng thái Auto Load -->
          <button class="toggle-auto-load">
            {{ currentUserId === user.user_Id && isAutoLoading ? "Stop" : "Start" }}
          </button>
        </li>
      </ul>

    </div>

    <!-- Chat UI -->
    <div class="chat-main" v-if="currentRoomId || currentUserId">
      <div class="chat-header">
        <div class="header-left">
          <div v-if="currentUserId" class="header-user-info">
            <img :src="currentUserAvatar || defaultAvatar" alt="avatar" class="header-avatar" />
            <h2>Private Chat with {{ currentFullName }} (@{{ currentUserName }})</h2>
          </div>
          <h2 v-else-if="currentRoomId">Chat Room: {{ currentRoomName }}</h2>
        </div>

      </div>

      <div class="chat-messages">
        <ul>
          <li v-for="(msg, index) in messages" :key="index" :class="{
            'message': true,
            'theirs': msg.senderUserId === currentUserId,
            'mine': msg.senderUserId !== currentUserId
          }">
            <!-- Chỉ hiển thị ảnh đại diện khi tin nhắn không phải của người gửi -->
            <img v-if="msg.senderUserId == currentUserId" :src="msg.avatarImage || defaultAvatar" alt="avatar"
              class="message-avatar" />
            <div class="message-content">
              <!-- Hiển thị tên người nhận (người gửi luôn là "You") -->
              <span class="message-user">{{ msg.senderUserId === currentUserId ? msg.senderName : 'You' }}</span>
              <p v-if="msg.type === 'text'">{{ msg.content }}</p>
              <div v-if="msg.type === 'image'" class="image-preview">
                <img :src="msg.content" alt="sent image" class="sent-image" @click="openImagePreview(msg.content)" />
              </div>
              <div v-if="msg.type === 'file'" class="file-preview">
                <a :href="msg.content" target="_blank" class="file-link">
                  {{ msg.content.split('/').pop() }}
                </a>
              </div>
            </div>
          </li>
        </ul>
      </div>

      <div v-if="imagePreviewVisible" class="image-modal" @click="closeImagePreview">
        <img :src="imagePreview" alt="Large image preview" class="modal-image" />
        <button class="close-button" @click="closeImagePreview">✖</button>
      </div>

      <div class="preview-container" v-if="imagePreview || filePreview">
        <div v-if="imagePreview" class="image-preview">
          <img :src="imagePreview" alt="Image Preview" class="preview-image" />
          <button @click="clearImage">✖</button>
        </div>


        <div v-if="filePreview" class="preview-file">
          <a :href="filePreview" target="_blank">{{ attachedFile.name }}</a>
          <button @click="clearFile">✖</button>
        </div>
      </div>

      <div class="chat-input">
        <button class="icon-button" @click="triggerFileInput">
          <i class="fa fa-paperclip"></i>
        </button>
        <input type="file" ref="fileInput" @change="handleFileUpload" class="hidden-file-input" />

        <input v-model="message" placeholder="Type a message..." />
        <button @click="sendMessage">Send</button>
      </div>

    </div>

  </div>
</template>

<script>
import { signalRService } from '@/services/signalr';
import connection from '@/services/signalr';

export default {
  data() {
    return {
      chatRooms: [],
      users: [],
      newRoomName: '',
      currentRoomId: null,
      currentRoomName: '',
      currentUserId: localStorage?.getItem('userId') || '',
      currentUserName: '',
      currentFullName: '',
      currentUserAvatar: null,
      message: '',
      messages: [],
      defaultAvatar: require("../../../public/default-avatar.png"),
      attachedFile: null,
      attachedImage: null,
      filePreview: null,
      imagePreview: null,
      imagePreviewVisible: false,
      currentChatPrivateId: null,
      isAutoLoading: false,
    };
  },
  props: ['isSidebarOpen', "boardId"],
  methods: {

    async loadBoardUsers() {
      if (!this.boardId) {
        console.error("Board ID is missing!");
        return;
      }

      try {
        const response = await fetch(`${process.env.VUE_APP_API_BASE_URL}/api/Board/board/users?boardId=${this.boardId}`);
        if (response.ok) {
          const usersData = await response.json();

          const currentUserId = localStorage.getItem("userId");

          this.users = usersData
            .filter(user => user.id !== currentUserId)
            .map(user => ({
              user_Id: user.id,
              fullName: user.fullName,
              userName: user.userName,
              avatarImage: user.avatarImage || this.defaultAvatar,
            }));
        } else {
          console.error("Failed to load board users");
        }
      } catch (err) {
        console.error("Error loading board users:", err);
      }
    },

    async joinRoom(roomId) {
      this.currentRoomId = roomId;
      this.currentUserId = null;
      this.messages = [];

      const room = this.chatRooms.find((room) => room.id === roomId);
      if (room) {
        this.currentRoomName = room.name;
      }

      try {
        const response = await fetch(`${process.env.VUE_APP_API_BASE_URL}/api/chat/room/messages/${roomId}`);
        if (response.ok) {
          this.messages = await response.json();
        } else {
          console.error('Failed to load room messages');
        }
      } catch (err) {
        console.error('Error joining room:', err);
      }
    },

    async startPrivateChat(userId) {
      if (this.currentUserId === userId && this.isAutoLoading) {
        this.stopAutoLoadMessages();
        this.isAutoLoading = false;
        console.log("Auto load stopped");
        return;
      }

      const senderUserId = localStorage.getItem("userId");
      if (!senderUserId) {
        console.error("Sender ID is missing!");
        return;
      }

      this.currentUserId = userId;
      const selectedUser = this.users.find(user => user.user_Id === userId);
      if (!selectedUser) {
        console.error("Selected user not found!");
        return;
      }

      try {
        const response = await fetch(`http://localhost:5141/api/chat/private/start`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            senderUserId: senderUserId,
            receiverUserId: userId,
          }),
        });

        const data = await response.json();
        if (response.ok) {
          this.currentUserId = userId;
          this.currentUserName = selectedUser.userName;
          this.currentFullName = selectedUser.fullName;
          this.currentUserAvatar = selectedUser.avatarImage;

          console.log("Private chat started:", data);

          await signalRService.startConnection();
          await connection.invoke("JoinPrivateRoom", senderUserId, userId);

          this.startAutoLoadMessages(userId);
          this.isAutoLoading = true;
        } else {
          console.error("Error starting private chat:", data.message);
        }
      } catch (err) {
        console.error("Error in startPrivateChat:", err);
      }
    },

    startAutoLoadMessages(receiverUserId) {
      if (this.isAutoLoading) {
        this.stopAutoLoadMessages();
        this.isAutoLoading = false;
        console.log("Auto load stopped");
      } else {
        this.loadPrivateMessages(receiverUserId);

        this.autoLoadInterval = setInterval(() => {
          this.loadPrivateMessages(receiverUserId);
        }, 2000);

        this.isAutoLoading = true;
        console.log("Auto load started");
      }
    },

    stopAutoLoadMessages() {
      if (this.autoLoadInterval) {
        clearInterval(this.autoLoadInterval);
        this.autoLoadInterval = null;
      }
    },

    leavePrivateChat() {
      this.stopAutoLoadMessages();
      this.currentUserId = null;
      this.messages = [];
    },

    async loadPrivateMessages(receiverUserId) {
      const senderUserId = localStorage.getItem("userId");
      if (!senderUserId) {
        console.error("Sender ID is missing!");
        return;
      }

      try {
        const response = await fetch(`${process.env.VUE_APP_API_BASE_URL}/api/chat/private/messages?senderId=${senderUserId}&receiverId=${receiverUserId}`);
        if (response.ok) {
          const messagesData = await response.json();

          // Xử lý dữ liệu tin nhắn, chỉ sử dụng thông tin người gửi
          this.messages = messagesData.map((msg) => {
            const sender = msg.senderUser || {}; // Người gửi

            // Kiểm tra định dạng tệp (ảnh hoặc file)
            const isImage = msg.imageChat && /\.(jpg|jpeg|png|gif)$/i.test(msg.imageChat);
            const isFile = msg.imageChat && !isImage;

            return {
              avatarImage: sender.avatarImage || this.defaultAvatar, // Ảnh đại diện người gửi
              content: msg.imageChat || msg.message, // Nội dung (file URL, ảnh URL, hoặc text)
              type: isImage ? "image" : isFile ? "file" : "text", // Phân loại
              senderName: sender.fullName || "You", // Tên người gửi
              senderUserId: msg.senderUserId, // ID người gửi
              notificationDateTime: new Date(msg.notificationDateTime).toLocaleString(), // Thời gian gửi
            };
          });

          console.log("Loaded private messages:", this.messages);

          // Cuộn xuống cuối danh sách tin nhắn sau khi load xong
          this.$nextTick(() => {
            this.scrollToBottom();
          });
        } else {
          console.error("Failed to load private messages:", response.statusText);
        }
      } catch (err) {
        console.error("Error loading private messages:", err);
      }
    },

    async sendMessage() {
      const senderId = localStorage.getItem("userId");
      if (!senderId) {
        console.error("Sender ID is missing!");
        return;
      }

      const messageContent = this.message || (this.attachedFile ? 'send' : '');
      const messageType = this.attachedFile && this.attachedFile.type.startsWith('image/')
        ? "image"
        : (this.attachedFile ? "file" : "text");

      try {
        let attachmentUrl = null;

        // Prepare FormData to send both message and file (if any)
        const formData = new FormData();
        formData.append("SenderId", senderId);
        formData.append("ReceiverId", this.currentUserId);
        formData.append("Message", messageContent);

        if (this.attachedFile) {
          formData.append("File", this.attachedFile);
        }

        const response = await fetch(`${process.env.VUE_APP_API_BASE_URL}/api/chat/private/send-message`, {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (data.ImageChat) {
          attachmentUrl = data.ImageChat;
        }

        // Start SignalR connection
        await signalRService.startConnection();

        // Send the private message via SignalR
        await connection.invoke("SendPrivateMessage", senderId, this.currentUserId, messageContent, attachmentUrl, messageType);

        console.log("Private message sent via SignalR");

        // Prepare a temporary message for immediate display
        const tempMessage = {
          avatarImage: this.defaultAvatar, // Use default avatar (no sender info needed)
          content: this.attachedFile && this.attachedFile.type.startsWith('image/') ? this.imagePreview : messageContent,
          type: messageType,
          senderName: "You",  // No sender name, just "You"
          senderUserId: senderId,
          receiverUserId: this.currentUserId,
          notificationDateTime: new Date().toLocaleString(),
        };

        // Add the message to the UI
        this.messages.push(tempMessage);

      } catch (err) {
        console.error("Error sending message:", err);
      }

      // Clear the message input field and file preview after sending the message
      this.message = "";
      this.clearFile();
    },

    scrollToBottom() {
      const messagesContainer = this.$el.querySelector(".chat-messages");
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    },

    handleFileUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.attachedFile = file;

        if (file.type.startsWith('image/')) {
          this.imagePreview = URL.createObjectURL(file);
        } else {
          this.imagePreview = null;
        }

        this.filePreview = URL.createObjectURL(file);
      }
    },

    clearFile() {
      this.attachedFile = null;
      this.filePreview = null;
      this.imagePreview = null;
    },

    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    openImagePreview(imageUrl) {
      this.imagePreview = imageUrl;
      this.imagePreviewVisible = true;
    },
    closeImagePreview() {
      this.imagePreviewVisible = false;
      this.imagePreview = null;
      this.attachedFile = null;
    },
  },

  mounted() {
    this.loadBoardUsers();
    signalRService.startConnection().then(() => {
      console.log("SignalR connection established");

      // Đăng ký sự kiện nhận tin nhắn
      connection.on('ReceivePrivateMessage', (message) => {
        console.log('Private message received:', message);

        const tempMessage = {
          avatarImage: message.SenderAvatar || this.defaultAvatar,
          content: message.ImageChat || message.Message,
          type: message.ImageChat ? "image" : message.Message ? "text" : "file",
          senderName: message.SenderName || "Unknown",
          senderUserId: message.SenderUserId,
          receiverUserId: message.ReceiverUserId,
          notificationDateTime: new Date(message.NotificationDateTime).toLocaleString(),
        };

        this.messages.push(tempMessage);
      });

    }).catch((err) => {
      console.error("Error starting SignalR connection:", err);
    });
  },

};
</script>

<style scoped>
.chat-container {
  margin-left: 300px;
  width: calc(100% - 300px);
  display: flex;
  height: 100vh;
  font-family: Arial, sans-serif;
  transition: all 0.3s ease;
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
  height: 100vh;
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: linear-gradient(90deg, #0078ff, #0056cc);
  color: white;
  font-size: 18px;
  font-weight: bold;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.header-left h2 {
  margin: 0;
}

.header-user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.header-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 2px solid #ddd;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
}

.header-right {
  display: flex;
  gap: 15px;
}

.icon-button {
  background: white;
  border: none;
  border-radius: 50%;
  padding: 10px;
  font-size: 20px;
  color: #0078ff;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.icon-button:hover {
  background: #0078ff;
  color: white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.hidden-file-input {
  display: none;
}

.chat-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #f9f9f9;
}

.chat-messages ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.sent-image {
  max-width: 200px;
  max-height: 200px;
  border-radius: 10px;
  margin-top: 5px;
}

.image-preview {
  margin-top: 10px;
  background-color: #f9f9f9;
  padding: 10px;
  border-radius: 8px;
}

.image-preview img {
  cursor: pointer;
  max-width: 100%;
  max-height: 200px;
  border-radius: 8px;
}

.image-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-image {
  max-width: 90%;
  max-height: 90%;
  border-radius: 10px;
}

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(255, 255, 255, 0.7);
  border: none;
  padding: 10px;
  font-size: 20px;
  cursor: pointer;
  color: #333;
  border-radius: 50%;
}

.close-button:hover {
  background-color: rgba(255, 255, 255, 1);
}

.file-preview {
  margin-top: 10px;
  background-color: #f1f1f1;
  padding: 10px;
  border-radius: 8px;
}

.file-link {
  color: #2600ff;
  text-decoration: none;
  font-weight: bold;
  margin-top: 5px;
  display: inline-block;
}

.file-link:hover {
  text-decoration: underline;
}

.message {
  display: flex;
  align-items: flex-start;
  margin-bottom: 15px;
  padding: 10px;
  border-radius: 10px;
  background-color: #f1f1f1;
  transition: all 0.2s ease-in-out;
}

.message.mine {
  align-self: flex-end;
  background-color: #f5f5f5;
  flex-direction: row-reverse;
}

.message.mine .message-avatar {
  margin-left: 10px;
  margin-right: 0;
  border: 2px solid #ddd;
}

.message.mine .message-content {
  background: white;
  color: black;
}

.message.theirs {
  align-self: flex-start;
  background-color: white;
  flex-direction: row;
}

.message.theirs .message-avatar {
  margin-right: 10px;
  border: 2px solid #0066ff;
}

.message.theirs .message-content {
  background: #4c9cf8;
  color: white;
}

.message:hover {
  transform: scale(1.02);
}

.message-user {
  font-weight: bold;
  margin-bottom: 5px;
}

.chat-input {
  display: flex;
  padding: 20px;
  border-top: 1px solid #ddd;
  background-color: white;
  align-items: center;
  gap: 10px;
}

.chat-input input {
  flex: 1;
  padding: 12px 15px;
  border: 1px solid #ccc;
  border-radius: 20px;
  font-size: 16px;
  outline: none;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: border-color 0.3s ease;
}

.chat-input input:focus {
  border-color: #0078ff;
}

.chat-input button {
  margin-left: 15px;
  padding: 10px 20px;
  background-color: #0078ff;
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.chat-input button:hover {
  background-color: #0056cc;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.collapsed-sidebar {
  margin-left: 50px;
  width: calc(100% - 50px);
}

.user-list .user-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease-in-out;
  cursor: pointer;
  margin-bottom: 12px;
  overflow: hidden;
  position: relative;
}

.user-list .user-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 100%;
  background: linear-gradient(90deg, #d7dce2, #b4dde9);
  transition: width 0.3s ease-in-out;
  z-index: 0;
}

.user-list .user-item:hover::before {
  width: 100%;
}

.user-list .user-item:hover {
  transform: scale(1.03);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.user-item:hover .user-avatar {
  transform: scale(1.1);
  border-color: #0078ff;
}

.user-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 15px;
  border: 2px solid #ddd;
  transition: transform 0.3s ease-in-out, border-color 0.3s ease-in-out;
  z-index: 1;
}

.user-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.user-fullname {
  font-weight: bold;
  font-size: 14px;
}

.user-username {
  font-size: 12px;
  color: #888;
}

.chat-messages .message {
  display: flex;
  align-items: flex-start;
  margin-bottom: 15px;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
  border: 2px solid #ddd;
}

.message-content {
  border-radius: 10px;
  padding: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.message-user {
  font-weight: bold;
  margin-bottom: 5px;
}

.preview-container {
  display: flex;
  gap: 10px;
  margin: 10px 0;
}

.preview-image img {
  max-width: 150px;
  max-height: 150px;
  border-radius: 8px;
}

.preview-file a {
  color: #0078ff;
  text-decoration: none;
  font-weight: bold;
}

.preview-container button {
  background: transparent;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: red;
  margin-left: 5px;
}
</style>