<template>
  <div>
    <img :src="iconSrc" id="icon" @click="toggleTheme" />

    <div class="task-model" @click.stop="closeForm">
      <div class="task-container">
        <header class="task-title">
          <h3>Add New Task</h3>
        </header>
        <div class="task-body">
          <form @submit.prevent="createTask">
            <div class="task-field">
              <label for="title">Title</label>
              <input
                type="text"
                id="title"
                v-model="task.title"
                required
                placeholder="Enter a title"
              />
            </div>
            <div class="task-field">
              <label for="create-at">Created At</label>
              <input
                type="datetime-local"
                id="create-at"
                v-model="task.create_At"
                :max="task.finish_At || ''"
              />
            </div>
            <div class="task-field">
              <label for="finish-at">Finished At</label>
              <input
                type="datetime-local"
                id="finish-at"
                v-model="task.finish_At"
                :min="task.create_At || ''"
              />
            </div>
            <div class="task-field">
              <label for="description">Description</label>
              <textarea
                id="description"
                v-model="task.description"
                rows="3"
                required
              ></textarea>
            </div>
            <div class="task-field">
              <label for="status">Status</label>
              <select v-model="task.status" required>
                <option value="" disabled selected>Select status</option>
                <option value="ongoing">Ongoing</option>
                <option value="pending">Pending</option>
                <option value="done">Done</option>
                <option value="over">Over</option>
              </select>
            </div>
            <div class="task-field">
              <label for="available-check">Available Check</label>
              <input
                type="checkbox"
                id="available-check"
                v-model="task.availableCheck"
              />
            </div>
          </form>
        </div>
        <div class="button-container">
          <button class="add" @click="createTask">Create Task</button>
          <button class="add-cancel" @click.stop="closeForm">
            <i class="bi bi-x-square"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useToast } from "vue-toastification";
import axios from "axios";

export default {
  props: ["listId"],
  emits: ["closeForm", "taskCreated"],
  data() {
    return {
      task: {
        title: "",
        create_At: "",
        finish_At: "",
        description: "",
        status: "",
        availableCheck: false,
        listId: this.$props.listId,
      },
      isDarkTheme: false, // Track the current theme state
    };
  },

  methods: {
    closeForm(event) {
      if (
        event.target.classList.contains("task-model") ||
        event.currentTarget.classList.contains("add-cancel")
      ) {
        this.$emit("closeForm");
      }
    },
    async createTask() {
      const toast = useToast();
      if (
        !this.task.title ||
        !this.task.description ||
        !this.task.status ||
        !this.task.create_At||
        !this.task.finish_At
      ) {
        toast.error("Please fill in all fields");
        return;
      }

      const createDate = new Date(this.task.create_At);
      const finishDate = new Date(this.task.finish_At);

      if (finishDate <= createDate) {
        toast.error("The finish date must be after the creation date");
        return;
      }
      try {
        const response = await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/api/Task?listId=${this.listId}`,
          this.task
        );
        const task = { ...response.data, description: this.task.description };
        task.listId = this.listId;

        this.$emit("taskCreated", task);
        this.$emit("closeForm");
      } catch (error) {
        console.error("Error creating task:", error);
      }
    },
    toggleTheme() {
      this.isDarkTheme = !this.isDarkTheme; // Toggle theme state
      document.body.classList.toggle("dark-theme", this.isDarkTheme); // Toggle dark theme class on body

      // Save the theme preference to local storage
      localStorage.setItem("theme", this.isDarkTheme ? "dark" : "light");
    },
  },
  mounted() {
    // Check local storage for theme preference on mount
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      this.isDarkTheme = true;
      document.body.classList.add("dark-theme");
    }
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

.task-model {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 10;
  background-color: rgba(0, 0, 0, 0.4);

  display: flex;
  align-items: center;
  justify-content: center;
}

.task-container {
  background-color: var(--list-item-color);
  width: 900px;
  min-height: 200px;
  max-width: calc(100% - 32px);
  z-index: 1000;
}

.task-title {
  width: 100%;
  height: 50px;
  background-color: #1391d8;

  display: flex;
  align-items: center;

  padding: 2px 2px 2px 18px;
  color: var(--vt-c-white);
}

.task-body {
  padding: 18px;
  margin-bottom: 20px;
}

.task-field {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.task-field label {
  width: 150px;
}

.task-field input {
  background: transparent;
}

.task-field input,
.task-field textarea,
.task-field select {
  width: 70%;
  background-color: var(--vt-c-white) !important;
  border-style: solid !important;
  border-width: 1px !important;
  border-color: var(--vt-c-black) !important;
  padding: 5px;
}

.task-field textarea {
  resize: vertical;
  padding: 5px;
}

.task-field input[type="checkbox"] {
  margin-right: 420px;
  align-self: flex-start;
}

.button-container {
  display: flex;
  justify-content: end;
  align-items: end;
  margin-bottom: 10px;
  margin-right: 10px;
}

.button-container .add {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 6px;
  border-radius: 5px;
  cursor: pointer;
}

.button-container .add:hover {
  background-color: #0056b3;
}

.button-container i {
  font-size: 27px;
  color: #ff0000;
  cursor: pointer;
}

.add-cancel {
  margin-left: 20px;
  margin-top: 5px;
  background: none;
  border: none;
}
</style>
