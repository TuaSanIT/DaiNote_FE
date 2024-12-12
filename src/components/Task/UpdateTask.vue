<template>
  <div class="task-model" @click.stop="closeForm">
    <div class="task-container" @click.stop="">
      <header class="task-title">
        <h3>Update Task</h3>
      </header>
      <div class="task-body">
        <form>
          <div class="task-field">
            <label for="title">Title</label>
            <input type="text" id="title" v-model="taskData.title" required />
          </div>
          <div class="task-field">
            <label for="create-at">Created At</label>
            <input
              type="datetime-local"
              id="create-at"
              v-model="taskData.create_At"
              :max="taskData.finish_At || ''"
            />
          </div>
          <div class="task-field">
            <label for="finish-at">Finished At</label>
            <input
              type="datetime-local"
              id="finish-at"
              v-model="taskData.finish_At"
              :min="taskData.create_At || ''"
            />
          </div>
          <div class="task-field">
            <label for="description">Description</label>
            <textarea
              id="description"
              v-model="taskData.description"
              rows="3"
              required
            ></textarea>
          </div>
          <div class="task-field">
            <label for="status">Status</label>
            <select v-model="taskData.status" required>
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
              v-model="taskData.availableCheck"
            />
          </div>
          <!-- <div class="task-field">
            <label for="assigned-users">Assigned Users</label>
            <select
              id="assigned-users"
              multiple
              v-model="taskData.assignedUsers"
            >
              <option
                v-for="collaborator in collaborators"
                :key="collaborator.userId"
                :value="collaborator.userId"
              >
                {{ collaborator.userEmail }}
              </option>
            </select>
          </div> -->

          <div class="task-field" v-if="collaborators.length > 1">
            <label for="assigned-users">Assigned Users</label>
            <div id="assigned-users" class="tag-select">
              <!-- Dropdown aligned with other inputs -->
              <div class="dropdown-container">
                <select v-model="selectedUserToAdd" class="dropdown">
                  <option value="" disabled>
                    Select a collaborator to add
                  </option>
                  <option
                    v-for="collaborator in availableCollaborators"
                    :key="collaborator.userId"
                    :value="collaborator.userId"
                  >
                    {{ collaborator.userEmail }}
                  </option>
                </select>
                <button
                  type="button"
                  @click="addAssignedUser"
                  class="add-user-btn"
                >
                  Add User
                </button>
              </div>

              <!-- Display user tags below dropdown, one per row -->
              <div class="selected-tags">
                <div
                  v-for="userId in taskData.assignedUsers"
                  :key="userId"
                  class="user-tag-row"
                >
                  <span class="user-tag">
                    {{ getCollaboratorEmail(userId) }}
                    <button
                      type="button"
                      class="remove-tag"
                      @click="removeAssignedUser(userId)"
                    >
                      &times;
                    </button>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- upload file -->
          <div class="task-field">
            <label for="file-upload">Upload File</label>
            <input
              type="file"
              id="file-upload"
              @change="handleFileUpload"
              accept=".doc,.docx,.xls,.xlsx"
            />
          </div>
          <div v-if="taskData.fileLink" class="task-field">
            <label>Current File</label>
            <a :href="taskData.fileLink" target="_blank">{{
              getFileNameFromLink
            }}</a>
          </div>
        </form>
      </div>
      <div class="button-container">
        <button
          class="add"
          :class="{ loading: isUpdating }"
          @click.prevent="updateTask"
          :disabled="isUpdating"
        >
          {{ isUpdating ? "Updating..." : "Update Task" }}
        </button>
        <button class="delete" @click.prevent="deleteTask">Delete Task</button>
        <button class="add-cancel" @click.stop="closeForm">
          <i class="bi bi-x-square"></i>
        </button>
      </div>
    </div>
  </div>
</template>


<script>
import axios from "axios";
import { useToast } from "vue-toastification";

export default {
  props: ["task", "boardId"],
  emits: ["closeForm", "taskUpdated", "taskDeleted"],
  data() {
    return {
      taskData: {
        ...this.task,
        assignedUsers: this.task.assignedUsers || [],
      },
      collaborators: [], // List of collaborators fetched from the API
      file: null,
      selectedUserToAdd: null,
      isUpdating: false,
    };
  },
  computed: {
    getFileNameFromLink() {
      return this.taskData.fileLink?.split("/").pop();
    },
    availableCollaborators() {
      return this.collaborators.filter(
        (collaborator) =>
          !this.taskData.assignedUsers.includes(collaborator.userId)
      );
    },
  },
  methods: {
    addAssignedUser() {
      if (this.selectedUserToAdd) {
        this.taskData.assignedUsers.push(this.selectedUserToAdd);
        this.selectedUserToAdd = null; // Clear selection
      }
    },
    removeAssignedUser(userId) {
      this.taskData.assignedUsers = this.taskData.assignedUsers.filter(
        (id) => id !== userId
      );
    },
    getCollaboratorEmail(userId) {
      const collaborator = this.collaborators.find((c) => c.userId === userId);
      return collaborator ? collaborator.userEmail : "Unknown User";
    },
    closeForm(event) {
      if (
        event &&
        (event.target.classList.contains("task-model") ||
          event.currentTarget.classList.contains("add-cancel"))
      ) {
        this.$emit("closeForm");
      }
    },
    handleFileUpload(event) {
      this.file = event.target.files[0];
      this.taskData.fileName = this.file ? this.file.name : null;
    },
    async fetchCollaborators() {
      try {
        const response = await axios.get(
          `${process.env.VUE_APP_API_BASE_URL}/api/Collaborator/${this.boardId}`
        );
        this.collaborators = response.data;

        // Ensure taskData.assignedUsers contains only valid collaborators
        this.taskData.assignedUsers = this.taskData.assignedUsers.filter(
          (userId) =>
            this.collaborators.some(
              (collaborator) => collaborator.userId === userId
            )
        );
      } catch (error) {
        console.error("Error fetching collaborators:", error);
      }
    },
    async updateTask() {
      const toast = useToast();

      if (
        !this.taskData.title ||
        !this.taskData.description ||
        !this.taskData.status ||
        !this.taskData.create_At ||
        !this.taskData.finish_At
      ) {
        alert("Please fill in all fields");
        return;
      }

      const createDate = new Date(this.taskData.create_At);
      const finishDate = new Date(this.taskData.finish_At);

      if (finishDate <= createDate) {
        toast.error("The finish date must be after the creation date");
        return;
      }

      try {
        this.isUpdating = true;

        const formData = new FormData();
        formData.append("title", this.taskData.title);
        formData.append("create_At", this.taskData.create_At);
        formData.append("finish_At", this.taskData.finish_At);
        formData.append("description", this.taskData.description);
        formData.append("status", this.taskData.status);
        formData.append("availableCheck", this.taskData.availableCheck);

        // Log the JSON string for AssignedUsers
        const assignedUsersJson = JSON.stringify(this.taskData.assignedUsers);
        // console.log("AssignedUsers JSON:", assignedUsersJson);

        formData.append("assignedUsers", assignedUsersJson);

        if (this.file) {
          formData.append("file", this.file);
        } else if (this.taskData.fileLink) {
          formData.append("fileLink", this.taskData.fileLink);
        }

        await axios.put(
          `${process.env.VUE_APP_API_BASE_URL}/api/task/${this.taskData.id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        this.$emit("taskUpdated", this.taskData);
        this.$emit("closeForm");
        toast.success("Task updated successfully!");
      } catch (error) {
        console.error("Error updating task:", error.response?.data || error);
        toast.error("Failed to update the task.");
      } finally {
        this.isUpdating = false;
      }
    },
    async deleteTask() {
      if (confirm("Do you want to delete this task?")) {
        try {
          await axios.delete(
            `${process.env.VUE_APP_API_BASE_URL}/api/task/${this.taskData.id}`
          );
          this.$emit("taskDeleted", this.taskData.id);
          this.$emit("closeForm");
        } catch (error) {
          console.error("Error deleting task:", error);
        }
      }
    },
  },
  watch: {
    task(newTask) {
      this.taskData = { ...newTask };
    },
  },
  mounted() {
    this.fetchCollaborators();
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

select {
  padding: 4px;
  margin-left: 8px;
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
  background-color: #f7f8fa;
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
  width: 150px; /* adjust the width as needed */
}

.task-field input,
.task-field textarea,
.task-field select {
  width: 70%; /* adjust the width as needed */
  background-color: var(--vt-c-white) !important;
  border-style: solid !important;
  border-width: 1px !important;
  border-color: var(--vt-c-black) !important; /* Set a default border color */
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
  margin-right: 10px;
  margin-bottom: 20px;
}

.button-container .add {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 4px;
  border-radius: 5px;
  cursor: pointer;
}

.button-container .delete {
  margin-left: 5px;
  background-color: #f9281a;
  color: white;
  border: none;
  padding: 4px;
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
  margin-left: 10px;
  background: none;
  border: none;
}

.button-container .add {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 4px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.button-container .add.loading {
  background-color: #d3d3d3; /* Grey background */
  color: #808080; /* Grey text */
  cursor: not-allowed;
}

.button-container .add:hover:not(.loading) {
  background-color: #0056b3;
}

.task-field {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  align-items: flex-start; /* Align items at the top */
}

.dropdown-container {
  display: flex;
  width: 100%;
  align-items: center;
}

.dropdown {
  width: 70%; /* Match other inputs */
  padding: 5px;
  margin-right: 8px;
}

.add-user-btn {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 5px;
  cursor: pointer;
}

.add-user-btn:hover {
  background-color: #218838;
}

.tag-select {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 70.9%;
}

.selected-tags {
  margin-top: 10px; /* Space between dropdown and user tags */
  width: 100%;
}

.user-tag-row {
  width: 100%;
  display: flex;
  margin-bottom: 8px;
}

.user-tag {
  background-color: #007bff;
  color: white;
  padding: 6px 12px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  /* flex: 1; */
}

.user-tag .remove-tag {
  background: none;
  border: none;
  color: white;
  font-size: 16px;
  margin-left: 8px;
  cursor: pointer;
}
</style>