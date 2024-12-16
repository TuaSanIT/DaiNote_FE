<template>
  <div>
    <div :class="['task-container']" @click="fetchTask">
      <div class="task">
        <div class="task-header">
          <span class="title-wrapper">
            <span class="title">{{ title }}</span>
          </span>
        </div>
        <div class="avatar-group" v-if="avatarImages.length > 0">
          <img v-for="(avatar, index) in avatarImages" :key="index" :src="avatar || defaultAvatar" alt="User Avatar"
            class="avatar-image" />
        </div>
        <div class="task-content">
          <p>{{ description }}</p>
        </div>
        <div class="task-footer" :class="statusClass">
          <span class="days-left">{{ daysLeftText }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  props: [
    "title",
    "description",
    "id",
    "status",
    "finished_at",
    "assignedUsers",
  ],
  emits: ["taskSelected"],
  data() {
    return {
      isDarkTheme: false,
      avatarImages: [],
      defaultAvatar: require("../../../public/default-avatar.png"),
    };
  },
  watch: {
    assignedUsers: {
      immediate: true,
      handler() {
        this.fetchUserAvatars(); // Fetch avatars when assignedUsers changes
      },
    },
  },
  mounted() {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      this.isDarkTheme = true;
      document.body.classList.add("dark-theme");
    }

    this.fetchUserAvatars();
  },
  computed: {
    statusClass() {
      return {
        "status-ongoing": this.status === "ongoing",
        "status-pending": this.status === "pending",
        "status-over": this.status === "over",
        "status-done": this.status === "done",
      };
    },
    daysLeftText() {
      if (this.status === "done") {
        return "Done"; 
      }

      if (this.status === "pending") {
        return "Pending";
      }

      if (!this.finished_at) {
        return "No deadline"; 
      }

      const now = new Date();
      const deadline = new Date(this.finished_at);
      const timeDiff = deadline - now;
      const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

      if (daysLeft < 0) {
        return "Overdue"; 
      }

      if (this.status === "ongoing") {
        return `${daysLeft} days left`; 
      }

      return this.status; 
    },

  },
  methods: {
    async fetchUserAvatars() {
      if (!this.assignedUsers || this.assignedUsers.length === 0) {
        this.avatarImages = [];
        return;
      }

      try {
        const avatarPromises = this.assignedUsers.map(async (userId) => {
          const response = await axios.get(
            `${process.env.VUE_APP_API_BASE_URL}/api/user/${userId}`
          );
          return response.data.avatarImage;
        });

        this.avatarImages = await Promise.all(avatarPromises);
      } catch (error) {
        console.error("Error fetching user avatars:", error);
        this.avatarImages = [];
      }
    },
    async fetchTask() {
      try {
        const response = await axios.get(
          `${process.env.VUE_APP_API_BASE_URL}/api/task/${this.id}`
        );
        this.$emit("taskSelected", response.data);
      } catch (error) {
        console.error("Error fetching task:", error);
      }
    },
    toggleTheme() {
      this.isDarkTheme = !this.isDarkTheme;
      document.body.classList.toggle("dark-theme", this.isDarkTheme);

      localStorage.setItem("theme", this.isDarkTheme ? "dark" : "light");
    },
  },
};
</script>

<style scoped>
.dark-theme {
  --color-background: var(--vt-c-black);
  --color-background-soft: var(--vt-c-black-soft);
  --color-background-mute: var(--vt-c-black-mute);

  --color-border: var(--vt-c-divider-dark-2);
  --color-border-hover: var(--vt-c-divider-dark-1);

  --color-heading: var(--vt-c-text-dark-1);
  --color-text: var(--vt-c-text-dark-2);
}

#icon {
  width: 30px;
  cursor: pointer;
}


.task-container {
  margin: 12px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.task-container:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}


.task {
  background-color: #ffffff;
  border-radius: 16px; 
  overflow: hidden;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0; 
  display: flex;
  flex-direction: column;
}


.task-header {
  background-color: #f8fafc; 
  padding: 16px;
  font-weight: bold;
  font-size: 18px;
  color: #1e293b; 
  text-align: left;
}


.avatar-group {
  display: flex;
  padding: 1px 16px;
  justify-content: flex-end;
  height: 40px;
}

.avatar-image {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  margin-left: -8px;
  border: 2px solid white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.avatar-image:hover {
  transform: scale(1.1);
}


.task-content {
  padding: 16px;
  font-size: 16px;
  color: #475569; 
  line-height: 1.6;
  background-color: #f8fafc; 
}


.task-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  font-size: 14px;
  font-weight: bold;
  border-top: 1px solid #e2e8f0;
  text-transform: uppercase;
  height: 10px;
}


.status-ongoing {
  background-color: #fcd34d; 
  color: #78350f; 
}

.status-pending {
  background-color: #e2e8f0; 
  color: #475569;
}

.status-over {
  background-color: #f87171; 
  color: #7f1d1d;
}

.status-done {
  background-color: #34d399; 
  color: #065f46;
}


.days-left {
  background-color: rgba(0, 0, 0, 0.05);
  color: #334155;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 12px;
  text-align: center;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
}
</style>