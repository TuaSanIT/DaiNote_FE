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
          <img
            v-for="(avatar, index) in avatarImages"
            :key="index"
            :src="avatar"
            alt="User Avatar"
            class="avatar-image"
          />
        </div>
        <div class="task-content">
          <p>{{ description }}</p>
        </div>
        <div class="task-footer" :class="statusClass"></div>
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
  },
  methods: {
    async fetchUserAvatars() {
      if (!this.assignedUsers || this.assignedUsers.length === 0) {
        this.avatarImages = []; // No assigned users
        return;
      }

      try {
        const avatarPromises = this.assignedUsers.map(async (userId) => {
          const response = await axios.get(
            `${process.env.VUE_APP_API_BASE_URL}/api/user/${userId}`
          );
          return response.data.avatarImage || defaultAvatar;
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

.task {
  background-color: var(--vt-c-white);
  width: 250px;
  min-height: 50px;
  border-radius: 8px;
  position: relative;
  display: flex;
  flex-direction: column;
}
.task:hover {
  cursor: pointer;
  border: 1.5px solid blue;
}
.task-header {
  display: flex;
  align-items: center;
  padding: 10px;
}

.title-wrapper {
  flex-grow: 1;
  text-align: center;
}

.task-header .title {
  font-weight: 800;
  color: var(--vt-c-text-light-1);
}

.avatar-image {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
  align-self: flex-end;
  margin: 0 10px;
}

.task-content {
  word-wrap: break-word;
  word-break: break-word;
  white-space: normal;
  padding: 0px 4px;
  padding-bottom: 14px;
  text-align: left;
  margin: 0px 5px 0px 2px;
  color: var(--vt-c-text-light-1);
}

.task-footer {
  height: 5px;
  border-radius: 0 0 8px 8px;
}

.status-ongoing.task-footer {
  background-color: yellow;
}

.status-pending.task-footer {
  background-color: gray;
}

.status-over.task-footer {
  background-color: red;
}

.status-done.task-footer {
  background-color: #4caf50;
}
</style>
