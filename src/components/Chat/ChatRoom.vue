<template>
  <div class="chat-container" :class="{ 'collapsed-sidebar': !isSidebarOpen }">
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
        <li v-for="(user, index) in users" :key="index" class="user-item" @click="startPrivateChat(user.user_Id)">
          <img :src="user.avatarImage || defaultAvatar" alt="avatar" class="user-avatar" />
          <div class="user-info">
            <span class="user-fullname">{{ user.fullName }}</span>
            <span class="user-username">@{{ user.userName }}</span>
          </div>
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
        <div class="header-right">
          <button class="icon-button" @click="startVoiceCall">
            <i class="fa fa-phone"></i>
          </button>
          <button class="icon-button" @click="startVideoCall">
            <i class="fa fa-video"></i>
          </button>
        </div>
      </div>

      <div class="chat-messages">
        <ul>
          <li v-for="(msg, index) in messages" :key="index" class="message">
            <img :src="msg.avatarImage || defaultAvatar" alt="avatar" class="message-avatar" />
            <div class="message-content">
              <span class="message-user" v-if="currentRoomId">{{ msg.sender }}</span>
              <span class="message-user" v-else>You</span>

              <p v-if="msg.type === 'text'">{{ msg.content }}</p>

              <a v-if="msg.type === 'file'" :href="msg.content" target="_blank" class="file-link">
                {{ msg.fileName || 'Download File' }}
              </a>

              <img v-if="msg.type === 'image'" :src="msg.content" alt="sent image" class="sent-image" />
            </div>
          </li>
        </ul>
      </div>

      <div class="preview-container" v-if="imagePreview || filePreview">
        <div v-if="imagePreview" class="preview-image">
          <img :src="imagePreview" alt="Image Preview" />
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

        <button class="icon-button" @click="triggerImageInput">
          <i class="fa fa-image"></i>
        </button>
        <input type="file" ref="imageInput" accept="image/*" @change="handleImageUpload" class="hidden-file-input" />

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
      chatRooms: [],
      users: [],
      newRoomName: '',
      currentRoomId: null,
      currentRoomName: '',
      currentUserId: null,
      currentUserName: '',
      currentFullName: '',
      message: '',
      messages: [],
      defaultAvatar: require("../../../public/default-avatar.png"),
      attachedFile: null,
      attachedImage: null,
      filePreview: null,
      imagePreview: null,
      currentChatPrivateId: null,
    };
  },
  props: ['isSidebarOpen', "boardId"],
  methods: {

    async loadChatRooms() {
      try {
        const response = await fetch(`${process.env.VUE_APP_API_BASE_URL}/api/chatroom/get-chat-rooms`);
        if (response.ok) {
          this.chatRooms = await response.json();
        } else {
          console.error('Failed to load chat rooms');
        }
      } catch (err) {
        console.error('Error loading chat rooms:', err);
      }
    },

    async loadUsers() {
      if (!this.boardId) {
        console.error("Board ID is missing!");
        return;
      }
      try {
        const response = await fetch(`${process.env.VUE_APP_API_BASE_URL}/api/board/${this.boardId}/users`);
        if (response.ok) {
          const usersData = await response.json();

          const currentUserId = localStorage.getItem("userId");

          this.users = usersData
            .filter(user => user.userId !== currentUserId)
            .map((user) => ({
              user_Id: user.userId,
              fullName: user.fullName,
              userName: user.userName,
              avatarImage: user.avatarImage,
            }));
        } else {
          console.error("Failed to load board users");
        }
      } catch (err) {
        console.error("Error loading users:", err);
      }
    },

    async createChatRoom() {
      if (!this.newRoomName) return;

      try {
        const response = await fetch(`${process.env.VUE_APP_API_BASE_URL}/api/chatroom/create-chat-room`, {
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

    async joinRoom(roomId) {
      this.currentRoomId = roomId;
      this.currentUserId = null;
      this.messages = [];

      const room = this.chatRooms.find((room) => room.id === roomId);
      if (room) {
        this.currentRoomName = room.name;
      }

      try {
        const response = await fetch(`${process.env.VUE_APP_API_BASE_URL}/api/chat/messages?roomId=${roomId}`);
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
      const senderUserId = localStorage.getItem("userId");

      if (!senderUserId || !this.boardId) {
        console.error("Missing sender ID or board ID.");
        return;
      }

      try {
        const response = await fetch(`${process.env.VUE_APP_API_BASE_URL}/api/chatprivate/start`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            senderUserId: senderUserId,
            receiverUserId: userId,
            boardId: this.boardId,
          }),
        });

        const data = await response.json();
        if (response.ok && data.success) {
          this.currentChatPrivateId = data.chatPrivateId;
          this.currentUserId = userId;

          const user = this.users.find((u) => u.user_Id === userId);
          if (user) {
            this.currentUserName = user.userName;
            this.currentFullName = user.fullName;
            this.currentUserAvatar = user.avatarImage;
          }

          await this.loadPrivateMessages(userId);
        } else {
          console.error("Error starting private chat:", data.message);
        }
      } catch (err) {
        console.error("Error in startPrivateChat:", err);
      }
    },

    async loadPrivateMessages(receiverUserId) {
      const senderUserId = localStorage.getItem("userId");

      if (!senderUserId || !this.boardId) {
        console.error("Missing sender ID or board ID.");
        return;
      }

      try {
        const response = await fetch(
          `${process.env.VUE_APP_API_BASE_URL}/api/chatprivate/messages?senderUserId=${senderUserId}&receiverUserId=${receiverUserId}&boardId=${this.boardId}`
        );

        if (response.ok) {
          const messagesData = await response.json();
          this.messages = messagesData.map((msg) => ({
            avatarImage:
              msg.senderUserId === senderUserId
                ? msg.senderUser.avatarImage || this.defaultAvatar
                : msg.receiverUser.avatarImage || this.defaultAvatar,
            content: msg.imageChat || msg.message,
            type: msg.imageChat ? "image" : "text",
            senderName: msg.senderUserId === senderUserId ? "You" : msg.senderUser.fullName,
            notificationDateTime: msg.notificationDateTime,
          }));
          console.log(senderUserId + 'and' + receiverUserId)
        } else {
          console.error("Failed to load private messages");
        }
      } catch (err) {
        console.error("Error loading private messages:", err);
      }
    },

    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.attachedFile = file;
        this.filePreview = URL.createObjectURL(file);
        console.log('Attached file:', file.name);
      }
    },
    triggerImageInput() {
      this.$refs.imageInput.click();
    },
    handleImageUpload(event) {
      const image = event.target.files[0];
      if (image) {
        this.attachedImage = image;
        this.imagePreview = URL.createObjectURL(image);
        console.log('Attached image:', image.name);
      }
    },
    // Send message
    async sendMessage() {
      if (!this.message && !this.attachedFile && !this.attachedImage) return;

      const formData = new FormData();

      if (this.currentUserId) {
        formData.append("receiverUserId", this.currentUserId);
      } else {
        console.error("No valid chat context.");
        return;
      }

      // Kiểm tra BoardId
      if (!this.boardId) {
        console.error("BoardId is missing!");
        return;
      }
      formData.append("boardId", this.boardId);

      formData.append("message", this.message || "");
      if (this.attachedFile) formData.append("file", this.attachedFile);
      if (this.attachedImage) formData.append("file", this.attachedImage);

      try {
        const endpoint = `${process.env.VUE_APP_API_BASE_URL}/api/chatprivate/send`;

        const userId = localStorage.getItem("userId");
        if (!userId) {
          console.error("UserId is missing from localStorage!");
          return;
        }

        console.log("UserId being sent:", userId);
        console.log("BoardId being sent:", this.boardId);

        // Thêm tin nhắn tạm thời vào giao diện
        const tempMessage = {
          avatarImage: this.defaultAvatar,
          content: this.message,
          type: "text",
          senderName: "You",
          notificationDateTime: new Date().toLocaleString(),
        };
        this.messages.push(tempMessage);

        // Gửi tin nhắn qua SignalR
        await connection.invoke("SendPrivateMessage", this.currentUserId, this.message, userId);

        // Gửi tin nhắn qua API để lưu vào cơ sở dữ liệu
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "UserId": userId,
          },
          body: formData,
        });

        if (response.ok) {
          const { privateChat } = await response.json();

          // Cập nhật tin nhắn trong giao diện (thay thế tin nhắn tạm thời)
          this.messages = this.messages.map((msg) =>
            msg === tempMessage
              ? {
                avatarImage: privateChat.senderUser.avatarImage || this.defaultAvatar,
                content: privateChat.imageChat || privateChat.message,
                type: privateChat.imageChat ? "image" : "text",
                senderName: "You",
                senderUserId: privateChat.senderUserId,
                notificationDateTime: privateChat.notificationDateTime,
              }
              : msg
          );

          // Reset input message và file
          this.message = "";
          this.clearImage();
          this.clearFile();
        } else {
          console.error("Error sending message via API.");
        }
      } catch (err) {
        console.error("Error sending message:", err);
      }
    },

    async uploadMedia(formData, endpoint, type) {
      try {
        const response = await fetch(`${process.env.VUE_APP_API_BASE_URL}/api/chat/${endpoint}`, {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          this.messages.push({
            sender: 'You',
            content: data.fileUrl || data.imageUrl,
            type: type,
            fileName: this.attachedFile?.name || null,
          });
        } else {
          console.error(`Failed to upload ${type}`);
        }
      } catch (err) {
        console.error(`Error uploading ${type}:`, err);
      }
    },

    async sendTextMessage() {
      const payload = { message: this.message, chatRoomId: this.currentRoomId };
      try {
        await connection.invoke('SendMessage', payload);
        this.messages.push({ sender: 'You', content: this.message, type: 'text' });
        this.message = '';
      } catch (err) {
        console.error('Error sending message:', err);
      }
    },

    async sendGroupMessage(payload) {
      try {
        await connection.invoke('SendMessage', payload);
        this.messages.push({ sender: 'You', content: payload.message });
      } catch (err) {
        console.error('Error sending group message:', err);
      }
    },


    async sendPrivateMessage(payload) {
      try {
        await connection.invoke('SendPrivateMessage', payload);
        this.messages.push({ sender: 'You', content: payload.message });
      } catch (err) {
        console.error('Error sending private message:', err);
      }
    },

    clearImage() {
      this.attachedImage = null;
      this.imagePreview = null;
    },
    clearFile() {
      this.attachedFile = null;
      this.filePreview = null;
    },

  },
  mounted() {
    this.loadChatRooms();
    this.loadUsers();

    connection.on('ReceiveMessage', (message) => {
      console.log('New Message:', message);

      this.messages.push({
        sender: message.UserId === localStorage.getItem('userId') ? 'You' : message.UserId,
        content: message.MessageType === 'text' ? message.Message : message.ImageChatRoom,
        type: message.MessageType,
        fileName: message.MessageType === 'file' ? message.ImageChatRoom.split('/').pop() : null,
      });
    });


    connection.on("ReceivePrivateMessage", (privateMessage) => {
      const currentUserId = localStorage.getItem("userId");

      this.messages.push({
        avatarImage: privateMessage.senderUser.avatarImage || this.defaultAvatar,
        content: privateMessage.imageChat || privateMessage.message,
        type: privateMessage.imageChat ? "image" : "text",
        senderName:
          privateMessage.senderUserId === currentUserId
            ? "You"
            : privateMessage.senderUser.fullName,
        senderUserId: privateMessage.senderUserId,
        notificationDateTime: privateMessage.notificationDateTime,
      });
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

.file-link {
  display: inline-block;
  color: #0078ff;
  text-decoration: none;
  margin-top: 5px;
}

.file-link:hover {
  text-decoration: underline;
}

.message {
  display: flex;
  align-items: flex-start;
  margin-bottom: 15px;
  padding: 10px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.message:hover {
  transform: scale(1.02);
}

.message-user {
  font-weight: bold;
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
  background: #f1f1f1;
  border-radius: 10px;
  padding: 10px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  flex: 1;
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