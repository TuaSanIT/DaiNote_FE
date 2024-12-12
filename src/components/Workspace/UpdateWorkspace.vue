<template>
    <div id="workspaceForm" class="workspace-form" @click="closeForm">
        <div class="form-container">
            <h3>Update Workspace</h3>
            <div class="form-group">
                <label for="workspaceTitle" class="form-label">Title:</label>
                <input type="text" class="form-control" id="workspaceTitle" v-model="workspaceData.name" required>
            </div>
            <div class="form-group">
                <label for="workspaceStatus" class="form-label">Status:</label>
                <select class="form-control" id="workspaceStatus" v-model="workspaceData.status" required>
                    <option value="" disabled>Select status</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="pending">Pending</option>
                    <option value="done">Done</option>
                    <option value="over">Over</option>
                </select>
            </div>
            <div class="button-container">
                <button id="closeFormWorkspaceBtn" class="btn btn-secondary">Close</button>
                <button class="btn btn-primary" @click="updateWorkspace">Update Workspace</button>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import { useToast } from "vue-toastification";

export default {
    props: {
        workspace: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            workspaceData: { ...this.workspace }
        };
    },
    watch: {
        workspace: {
            handler(newWorkspace) {
                this.workspaceData = { ...newWorkspace };
            },
            immediate: true,
            deep: true
        }
    },
    methods: {
        closeForm(event) {
            if (event && (event.target.classList.contains('workspace-form') || event.target.id === 'closeFormWorkspaceBtn')) {
                this.$emit('closeForm');
            }
        },
        async updateWorkspace() {
            const toast = useToast();
            if (!this.workspaceData.name || !this.workspaceData.status) {
                toast.error('Please fill in all fields');
                return;
            }
            try {
                console.log('Updating workspace:', this.workspaceData);
                // Assuming your API expects the `Status` field as part of the request body
                const body = {
                    name: this.workspaceData.name,
                    status: this.workspaceData.status,
                };
                await axios.put(`${process.env.VUE_APP_API_BASE_URL}/api/workspace/${this.workspaceData.id}`, body);
                this.$emit('workspaceUpdated', { id: this.workspaceData.id, ...body });
                this.$emit('closeForm');
            } catch (error) {
                console.error('Error updating workspace:', error);
            }
        }
    }
};
</script>


<style scoped>
.workspace-form {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 2000;
}

.workspace-form.show .form-container {
    display: block; /* Show the form container when the form is shown */
}

.form-container {
    background: #212528;
    padding: 20px;
    margin: 100px auto;
    width: 50%;
    border-radius: 5px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    position: relative;
    color: white;
    transition: transform 0.5s ease; /* Slide down effect */
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
    background-color: #F7F8FA;
    color: black;
}

.button-container {
  display: flex;
  justify-content: end;
  align-items: end;
  margin-bottom: 10px;
}

button {
    color: white;
    border: none;
    padding: 8px 12px;
    border-radius: 5px;
    cursor: pointer;
    margin-left: 20px;
}

button.btn-primary {
    background-color: #17a2b8;
    border-color: #17a2b8;
}

button.btn-secondary {
    background-color: #6c757d;
    border-color: #6c757d;
}
</style>