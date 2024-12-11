<template>
  <div
    :class="[{ 'popup-active': popupActive }, { 'collapsed-sidebar': !isSidebarOpen }]"
    class="main"
    @click.self="closeFormOnClickOutside"
  >
    <!-- <header class="d-flex justify-content-start align-items-center py-2 px-3"></header> -->
    <main role="main" class="container">
      <!-- Buttons for Note and Label Creation -->
      <div class="d-flex justify-content-between mb-4">
        <button class="btn btn-primary" @click="showNoteForm">
          Add New Note
        </button>
        <button class="btn btn-secondary" @click="openLabelForm">
          Create New Label
        </button>
        <input
          type="text"
          class="form-control w-25"
          placeholder="Search..."
          v-model="searchQuery"
        />
      </div>

      <!-- Bookmark and Non-Bookmark Headers -->
      <div v-if="hasBookmarkedNotes">
        <h4>Bookmarked</h4>
      </div>
      <div class="row" v-if="hasBookmarkedNotes">
        <div
          v-for="note in bookmarkedNotes"
          :key="note.id"
          class="col-md-4"
          @click="editNote(note)"
          style="cursor: pointer"
        >
          <div class="note-card" :style="{ borderColor: note.color }">
            <div class="note-header">
              <h5 :style="{ color: note.color }">{{ note.title }}</h5>
              <div v-if="note.labels && note.labels.length" class="note-labels">
                <span
                  v-for="(label, index) in note.labels"
                  :key="index"
                  class="badge bg-info me-2"
                >
                  {{ label.name }}
                </span>
              </div>
              <p class="note-description">{{ note.description }}</p>
            </div>
            <div
              v-if="note.images && note.images.length"
              class="image-container"
            >
              <img
                v-for="(image, index) in note.images"
                :key="index"
                :src="`data:image/jpeg;base64,${image}`"
                alt="Note image"
                class="img-thumbnail note-image"
                @click.stop="openImageModal(image)"
              />
            </div>
            <div class="d-flex justify-content-end">
              <button
                class="btn btn-outline-info me-2"
                @click.stop="toggleLabelForm(note)"
              >
                <i class="bi bi-tags"></i>
              </button>
              <button
                class="btn btn-outline-warning"
                @click.stop="toggleBookmark(note)"
              >
                <i
                  :class="note.bookmark ? 'bi bi-star-fill' : 'bi bi-star'"
                ></i>
              </button>
              <button
                class="btn btn-outline-secondary me-2"
                @click.stop="editNote(note)"
              >
                <i class="bi bi-pencil-square"></i>
              </button>
              <button
                class="btn btn-outline-danger"
                @click.stop="deleteNote(note.id)"
              >
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Non-Bookmarked Notes Section -->
      <div v-if="hasNonBookmarkedNotes">
        <h4>Other Notes</h4>
      </div>
      <div class="row" v-if="hasNonBookmarkedNotes">
        <div
          v-for="note in nonBookmarkedNotes"
          :key="note.id"
          class="col-md-4"
          @click="editNote(note)"
          style="cursor: pointer"
        >
          <div class="note-card" :style="{ borderColor: note.color }">
            <div class="note-header">
              <h5 :style="{ color: note.color }">{{ note.title }}</h5>
              <div v-if="note.labels && note.labels.length" class="note-labels">
                <span
                  v-for="(label, index) in note.labels"
                  :key="index"
                  class="badge bg-info me-2"
                >
                  {{ label.name }}
                </span>
              </div>
              <p class="note-description">{{ note.description }}</p>
            </div>
            <div
              v-if="note.images && note.images.length"
              class="image-container"
            >
              <img
                v-for="(image, index) in note.images"
                :key="index"
                :src="`data:image/jpeg;base64,${image}`"
                alt="Note image"
                class="img-thumbnail note-image"
                @click.stop="openImageModal(image)"
              />
            </div>
            <div class="d-flex justify-content-end">
              <button
                class="btn btn-outline-info me-2"
                @click.stop="toggleLabelForm(note)"
              >
                <i class="bi bi-tags"></i>
              </button>
              <button
                class="btn btn-outline-warning"
                @click.stop="toggleBookmark(note)"
              >
                <i
                  :class="note.bookmark ? 'bi bi-star-fill' : 'bi bi-star'"
                ></i>
              </button>
              <button
                class="btn btn-outline-secondary me-2"
                @click.stop="editNote(note)"
              >
                <i class="bi bi-pencil-square"></i>
              </button>
              <button
                class="btn btn-outline-danger"
                @click.stop="deleteNote(note.id)"
              >
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Image Modal -->
      <div v-if="showImageModal" class="image-modal" @click="closeImageModal">
        <img :src="currentImage" alt="Viewing image" class="modal-image" />
      </div>

      <!-- Label Form -->
      <div v-if="showLabelFormInNote" class="label-form show">
        <form @submit.prevent="saveLabelsToNote" class="form-container">
          <h3>Manage Labels for Note: {{ currentNote?.title }}</h3>
          <div class="form-group">
            <label>Select Labels:</label>
            <div
              v-for="label in labels"
              :key="label.labelId"
              class="form-check"
            >
              <input
                type="checkbox"
                class="form-check-input"
                :id="'label-' + label.labelId"
                :value="label.labelId"
                :checked="selectedLabels.includes(label.labelId)"
                @change="toggleLabel(label.labelId)"
              />
              <label class="form-check-label" :for="'label-' + label.labelId">{{
                label.name
              }}</label>
            </div>
          </div>
          <div class="d-flex justify-content-between mt-3">
            <button
              type="button"
              @click="closeLabelNoteForm"
              class="btn btn-secondary"
            >
              Close
            </button>
            <button type="submit" class="btn btn-primary">Save Labels</button>
          </div>
        </form>
      </div>

      <!-- Add/Edit Note Form -->
      <div v-if="showForm" id="noteForm" class="note-form show">
        <form @submit.prevent="saveNote" class="form-container">
          <h3>{{ isEditing ? "Edit Note" : "Add New Note" }}</h3>
          <div class="form-group">
            <label for="noteTitle" class="form-label">Title:</label>
            <input
              type="text"
              class="form-control"
              v-model="newNote.title"
              required
            />
          </div>
          <div class="form-group">
            <label for="noteContent" class="form-label">Content:</label>
            <textarea
              class="form-control"
              v-model="newNote.description"
              rows="4"
            ></textarea>
          </div>
          <div class="form-group">
            <label for="noteColor" class="form-label">Select Color:</label>
            <input type="color" class="form-control" v-model="newNote.color" />
          </div>
          <div class="form-group">
            <label for="noteImages" class="form-label">Upload Images:</label>
            <input
              type="file"
              class="form-control"
              multiple
              @change="handleImageUpload"
            />
          </div>
          <div class="mt-2">
            <h5>Uploaded Images:</h5>
            <div class="image-preview-container">
              <div
                v-for="(image, index) in newNote.images"
                :key="index"
                class="image-preview-wrapper"
              >
                <div class="remove-icon" @click="removeImage(index)">×</div>
                <img
                  :src="'data:image/jpeg;base64,' + image"
                  alt="Uploaded image"
                  class="img-thumbnail"
                  @click="openImageModal(image)"
                />
              </div>
            </div>
          </div>
          <div class="d-flex justify-content-between mt-3">
            <button type="button" @click="closeForm" class="btn btn-secondary">
              Close
            </button>
            <button type="submit" class="btn btn-primary">
              {{ isEditing ? "Update Note" : "Save Note" }}
            </button>
          </div>
        </form>
      </div>

      <!-- Create New Label Form -->
      <div
        v-if="showLabelForm"
        id="labelForm"
        class="label-form show"
        @click.self="closeFormOnClickOutside"
      >
        <form @submit.prevent="createLabel" class="form-container">
          <h3>Create New Label</h3>
          <div class="form-group">
            <label for="labelName" class="form-label">Label Name:</label>
            <input
              type="text"
              class="form-control"
              v-model="newLabel.name"
              required
            />
          </div>
          <div class="d-flex justify-content-between">
            <button
              type="button"
              @click="closeLabelForm"
              class="btn btn-secondary"
            >
              Close
            </button>
            <button type="submit" class="btn btn-primary">Save Label</button>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>
  
  <script>
import axios from "axios";

export default {
  props: ["boardId", "popupActive","isSidebarOpen"],
  data() {
    return {
      localNotes: [], // Local notes loaded or passed via props
      showForm: false,
      newNote: {
        title: "",
        description: "",
        color: "#000000",
        images: [],
        labels: [],
      },
      isEditing: false,
      editingNoteId: null,
      userId: null,
      showLabelForm: false,
      newLabel: { name: "" },
      labels: [], // All available labels
      selectedLabels: [], // Selected labels for the note
      showLabelFormInNote: false,
      currentNote: null,
      showImageModal: false,
      currentImage: "",
      labelsToAdd: [],
      labelsToRemove: [],
      searchQuery: "", // Holds the search input
    };
  },
  watch: {
    popupActive(newValue) {
      if (newValue) {
        this.$el.style.zIndex = "-1"; // Lower z-index when popup is active
      } else {
        this.$el.style.zIndex = "1"; // Restore default z-index
      }
    },
  },
  computed: {
    filteredNotes() {
      const query = this.searchQuery.toLowerCase();
      return this.localNotes.filter(
        (note) =>
          note.title.toLowerCase().includes(query) ||
          note.description.toLowerCase().includes(query)
      );
    },
    bookmarkedNotes() {
      return this.filteredNotes.filter((note) => note.bookmark);
    },
    nonBookmarkedNotes() {
      return this.filteredNotes.filter((note) => !note.bookmark);
    },
    hasBookmarkedNotes() {
      return this.bookmarkedNotes.length > 0;
    },
    hasNonBookmarkedNotes() {
      return this.nonBookmarkedNotes.length > 0;
    },
  },
  methods: {
    // Fetch notes with labels
    async fetchNotes() {
      const userId = this.userId || this.getUserIdFromLocalStorage();
      if (!userId) {
        console.error("User ID not available. Cannot fetch notes.");
        return;
      }
      try {
        const response = await axios.get(
          `http://localhost:5141/api/note/${userId}`
        );
        this.localNotes = await Promise.all(
          response.data.map(async (note) => {
            try {
              const labelsResponse = await axios.get(
                `http://localhost:5141/api/note/${note.id}/labels`
              );
              const labels = labelsResponse.data || [];
              return { ...note, labels };
            } catch (labelError) {
              console.error("Error fetching labels for note:", labelError);
              return { ...note, labels: [] };
            }
          })
        );
        this.$emit("notes-loaded", this.localNotes);
      } catch (error) {
        console.error("Error fetching notes:", error);
      }
    },

    // Handle Image
    closeImageModal() {
      this.showImageModal = false;
    },
    openImageModal(image) {
      this.currentImage = `data:image/jpeg;base64,${image}`;
      this.showImageModal = true;
    },
    handleImageUpload(event) {
      const files = event.target.files;
      if (files.length) {
        Array.from(files).forEach((file) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const base64Data = e.target.result.split(",")[1]; // Extract only the base64 part
            if (base64Data) {
              this.newNote.images.push(base64Data);
            } else {
              console.error("Invalid Base64 data:", e.target.result);
            }
          };
          reader.readAsDataURL(file);
        });
      }
    },
    removeImage(index) {
      if (index >= 0 && index < this.newNote.images.length) {
        this.newNote.images.splice(index, 1);
        this.newNote.images = [...this.newNote.images]; // Ensure reactivity
      }
    },

    // Fetch all available labels
    async fetchLabels() {
      const userId = this.userId || this.getUserIdFromLocalStorage();
      if (!userId) {
        console.error("User ID not available. Cannot fetch labels.");
        return;
      }
      try {
        const response = await axios.get(
          `http://localhost:5141/api/Label/user/${userId}`
        );
        if (Array.isArray(response.data)) {
          this.labels = response.data.map((label) => ({
            id: label.labelId, // Normalize to use `id`
            name: label.name,
            showOptions: false,
          }));
          console.log("Normalized labels:", this.labels); // Log normalized labels
        } else {
          console.error("Invalid data format:", response.data);
          alert("Failed to load labels.");
        }
      } catch (error) {
        console.error(
          "Error fetching labels:",
          error.response?.data || error.message
        );
        alert("Failed to load labels.");
      }
    },
    // Save or update a note
    async toggleBookmark(note) {
      try {
        const updatedNote = { ...note, bookmark: !note.bookmark };
        await axios.put(
          `http://localhost:5141/api/note/${note.id}/bookmarked`,
          updatedNote
        );
        const index = this.localNotes.findIndex((n) => n.id === note.id);
        if (index !== -1) {
          this.localNotes[index].bookmark = updatedNote.bookmark;
        }
      } catch (error) {
        console.error(
          "Error toggling bookmark:",
          error.response?.data || error.message
        );
      }
    },
    async saveNote() {
      try {
        if (this.isEditing) {
          await axios.put(
            `http://localhost:5141/api/note/${this.editingNoteId}`,
            this.newNote
          );
          const index = this.localNotes.findIndex(
            (note) => note.id === this.editingNoteId
          );
          if (index !== -1) {
            this.localNotes.splice(index, 1, {
              ...this.newNote,
              id: this.editingNoteId,
            });
          }
        } else {
          const response = await axios.post(
            `http://localhost:5141/api/note/${this.userId}`,
            this.newNote
          );
          this.localNotes.push(response.data);
        }
        this.closeForm();
      } catch (error) {
        console.error(
          "Error saving note:",
          error.response?.data || error.message
        );
      }
    },
    async deleteNote(noteId) {
      try {
        await axios.delete(`http://localhost:5141/api/note/${noteId}`);
        this.localNotes = this.localNotes.filter((note) => note.id !== noteId);
      } catch (error) {
        console.error(
          "Error deleting note:",
          error.response?.data || error.message
        );
      }
    },
    editNote(note) {
      if (this.showForm) return;
      this.isEditing = true;
      this.editingNoteId = note.id;
      this.newNote = { ...note };
      this.showForm = true;
    },
    showNoteForm() {
      this.isEditing = false;
      this.newNote = {
        title: "",
        description: "",
        color: "#000000",
        images: [],
        labels: [],
      };
      this.showForm = true;
    },
    closeForm() {
      this.showForm = false;
      this.newNote = {
        title: "",
        description: "",
        color: "#000000",
        images: [],
        labels: [],
      };
      this.isEditing = false;
    },

    // Open and manage label form for a specific note
    // Open Label Form
    // Add or Remove Labels from Note
    async toggleLabelForm(note) {
      try {
        if (!note || !note.id) {
          console.error("Invalid note data:", note);
          return;
        }

        this.currentNote = note;

        // Fetch assigned labels for the note
        const assignedLabelsResponse = await axios.get(
          `http://localhost:5141/api/note/${note.id}/labels`
        );

        if (!Array.isArray(assignedLabelsResponse.data)) {
          console.error(
            "Invalid response for assigned labels:",
            assignedLabelsResponse.data
          );
          this.selectedLabels = [];
          return;
        }

        // Map only assigned label IDs
        this.selectedLabels = assignedLabelsResponse.data.map(
          (label) => label.labelId
        );

        // Fetch all available labels
        const labelsResponse = await axios.get(
          `http://localhost:5141/api/Label/user/${this.userId}`
        );
        if (!Array.isArray(labelsResponse.data)) {
          console.error(
            "Invalid response for available labels:",
            labelsResponse.data
          );
          this.labels = [];
          return;
        }

        this.labels = labelsResponse.data.map((label) => ({
          labelId: label.labelId,
          name: label.name,
        }));

        console.log("Selected labels for note:", this.selectedLabels);
        console.log("Available labels:", this.labels);

        this.showLabelFormInNote = true;
      } catch (error) {
        console.error("Error in toggleLabelForm:", error);
      }
    },

    toggleLabel(labelId) {
      if (!labelId) {
        console.error("Invalid label ID:", labelId);
        return;
      }

      if (this.selectedLabels.includes(labelId)) {
        // Remove the label
        this.selectedLabels = this.selectedLabels.filter(
          (id) => id !== labelId
        );
      } else {
        // Add the label
        this.selectedLabels.push(labelId);
      }

      console.log("Updated selectedLabels:", this.selectedLabels);
    },

    async saveLabelsToNote() {
      try {
        const noteId = this.currentNote?.id;
        if (!noteId) {
          console.error("Invalid note ID:", noteId);
          return;
        }

        // Fetch currently assigned labels
        const assignedLabelsResponse = await axios.get(
          `http://localhost:5141/api/note/${noteId}/labels`
        );
        const assignedLabels = assignedLabelsResponse.data.map(
          (label) => label.labelId
        );

        console.log("Assigned labels before saving:", assignedLabels);
        console.log("Selected labels before saving:", this.selectedLabels);

        // Calculate labels to add and remove
        const labelsToAdd = this.selectedLabels.filter(
          (labelId) => !assignedLabels.includes(labelId)
        );
        const labelsToRemove = assignedLabels.filter(
          (labelId) => !this.selectedLabels.includes(labelId)
        );

        console.log("Labels to add:", labelsToAdd);
        console.log("Labels to remove:", labelsToRemove);

        // Add labels
        if (labelsToAdd.length > 0) {
          await axios.post(
            `http://localhost:5141/api/note/${noteId}/labels/batch`,
            labelsToAdd
          );
        }

        // Remove labels
        if (labelsToRemove.length > 0) {
          await axios.delete(
            `http://localhost:5141/api/note/${noteId}/labels/batch`,
            { data: labelsToRemove }
          );
        }

        alert("Labels updated successfully.");
        this.showLabelFormInNote = false;
        this.fetchNotes(); // Refresh notes to reflect changes
      } catch (error) {
        console.error(
          "Error saving labels:",
          error.response?.data || error.message
        );
      }
    },

    closeLabelNoteForm() {
      this.showLabelFormInNote = false;
      this.selectedLabels = [];
    },

    // Label creation
    openLabelForm() {
      this.showLabelForm = true;
      this.newLabel.name = "";
    },
    async createLabel() {
      const userId = this.userId || this.getUserIdFromLocalStorage();
      if (!userId) {
        console.error("User ID not available. Cannot create label.");
        return;
      }
      try {
        await axios.post(
          `http://localhost:5141/api/label/${userId}`,
          this.newLabel
        );
        this.fetchLabels();
        this.closeLabelForm();
      } catch (error) {
        console.error(
          "Error creating label:",
          error.response?.data || error.message
        );
      }
    },
    closeLabelForm() {
      this.showLabelForm = false;
    },

    // Fetch user ID from localStorage
    getUserIdFromLocalStorage() {
      return localStorage.getItem("userId");
    },

    // Initialize userId on component mount
    initializeUserId() {
      const userId = this.getUserIdFromLocalStorage();
      if (!userId) {
        console.error("User ID not found. Redirecting to login.");
        this.$router.push("/login");
        return;
      }
      this.userId = userId;
    },
  },
  mounted() {
    this.initializeUserId(); // Set userId on component mount
    this.fetchNotes();
    this.fetchLabels();
  },
};
</script>
  
  <style scoped>
/* Main Layout */
.main {
  min-height: 100vh;
  padding: 20px;
  position: relative;
  margin-left: 300px;
  margin-top: 60px;
  width: calc(100% - 300px);
  display: flex;
  flex-direction: row;
  align-items: flex-start;
}

.popup-active {
  z-index: -1; /* Lower z-index when popup is active */
}

.container {
  z-index: 1;
}

/* Note Card Styles */
.note-card {
  background-color: #d9d9d9;
  border: 2px solid #ddd;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  min-height: 220px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  z-index: 1;
  transition: margin-left 0.3s ease;
}

.note-description {
  color: #555;
}

.note-card .note-header {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  max-height: 150px;
  position: relative;
}

.note-card h5 {
  font-size: 1.25rem;
  margin: 0 0 10px;
}

.note-card p {
  margin: 0;
  font-size: 0.9rem;
  flex-shrink: 1;
  overflow: hidden;
  max-height: 60px;
  text-overflow: ellipsis;
  white-space: pre-wrap;
  line-height: 1.4;
  position: relative;
}

.note-card .note-images {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.note-card .note-images img {
  max-height: 100px;
  max-width: 100%;
  border-radius: 5px;
  object-fit: contain;
}

/* Note Form Styles */
.note-form {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999; /* Lower z-index for the form */
  display: none;
}

.note-form.show {
  display: block;
}

.form-container {
  background-color: #212528;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  max-height: 80vh;
  color: white;
  position: relative;
  margin: 100px auto;
  width: 50%;
  transform: translateY(-100%);
  transition: transform 0.5s ease;
}

.note-form.show .form-container {
  transform: translateY(0);
}
.collapsed-sidebar{
  margin-left: 50px;
}
.form-container h3 {
  text-align: center;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.form-group label {
  flex: 1;
  margin-right: 10px;
}

.form-group input,
.form-group textarea {
  flex: 3;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
  background-color: #3a3f44;
  color: white;
}

.form-group textarea {
  resize: none;
}

.label-form {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5); /* Gray background outside the form */
  z-index: 9999;
  display: none;
  justify-content: center;
  align-items: center;
}

.label-form.show {
  display: flex;
}

.label-form .form-container {
  background-color: #212528;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  width: 60%;
  max-width: 500px;
  color: white;
  overflow-y: auto;
  max-height: 80vh;
}

.label-form .form-group {
  margin-bottom: 15px;
}

.label-form .form-control {
  width: 100%;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
  background-color: #3a3f44;
  color: white;
}

button {
  margin: 5px;
}

button.btn-primary {
  background-color: #17a2b8;
  border-color: #17a2b8;
}

button.btn-secondary {
  background-color: #6c757d;
  border-color: #6c757d;
}

.img-thumbnail {
  width: 100px;
  height: auto;
  margin-top: 10px;
  object-fit: cover;
}

/* Image Preview Styles */
.image-preview-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.image-preview-wrapper {
  position: relative;
  display: inline-block;
  margin-right: 5px;
  max-width: 100px;
}

.image-preview-wrapper img {
  width: 100px;
  height: 100px;
}

.remove-icon {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: #f00;
  color: #fff;
  border-radius: 50%;
  padding: 2px 5px;
  cursor: pointer;
  font-size: 14px;
}

.remove-icon:hover {
  background-color: darkred;
}

/* Image Modal Styles */
.image-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; /* Ensure modal is above the form */
}

.modal-image {
  max-width: 90%;
  max-height: 90%;
}

.note-image {
  cursor: pointer;
  transition: transform 0.2s;
}

.note-image:hover {
  transform: scale(1.05);
}
</style>