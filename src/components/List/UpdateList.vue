<template>

    <div id="listForm" class="list-form" @click="closeForm">
        <div class="form-container">
            <h3>Update List</h3>
            <div class="form-group">
                <label for="listTitle" class="form-label">Title:</label>
                <input type="text" class="form-control" id="listTitle" v-model="listData.title">
            </div>
            <div class="form-group">
                <label for="status">Status</label>

                  <select class="add-list-status" v-model="listData.status">
                    <option value="" disabled selected>Select status</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="pending">Pending</option>
                    <option value="done">Done</option>
                    <option value="over">Over</option>
                  </select>
                </div>
            <div class="button-container">
                <button id="closeFormListBtn" class="btn btn-secondary">Close</button>
                <button class="btn btn-primary" @click="updateList">Update List</button>
            </div>
        </div>
    </div>

</template>

<script>
import axios from 'axios';
import { useToast } from "vue-toastification";

export default {
    props:{
        list:{
            type: Object,
            required: true
        }
    },
    // mounted() {
    // this.listData = this.list;
    // },
    data() {
        return {
            // listData: {
            //     title: '',
            //     status: ''
            // }
            listData :{...this.list}
        }
    },
    watch: {
        list: {
            handler(newList) {
                this.listData = { ...newList };
            },
                immediate: true,
                deep: true
            }
    },
    methods:{
        closeForm(event) {
            if (event && (event.target.classList.contains('list-form') || event.target.id === 'closeFormListBtn')) {
            this.$emit('closeForm');
            }
        },
        async updateList() {
            const toast = useToast();
            if (!this.listData.title || !this.listData.status ) {
                toast.error('Please fill in all fields');
                return;
            }
            try {
                console.log('Updating list:', this.listData);
                await axios.put(`${process.env.VUE_APP_API_BASE_URL}/api/list/${this.listData.id}`, this.listData);
                this.$emit('listUpdated', this.listData);
                this.$emit('closeForm');
                toast.success("List updated successfully!");
            } catch (error) {
                console.error('Error updating task:', error);
            }
        },
        
    }
}
</script>

<style scoped>

#icon {
  width: 30px;
  cursor: pointer;
}

.list-form {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 2000;
}

.list-form.show .form-container {
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
.form-group select{
    color: white;
}
.form-group input,
.form-group select {
    flex: 3;
    padding: 10px;
    border-radius: 5px;
    border: 1px solid #ccc;
    background-color: #F7F8FA;
    color: black;
}

.form-group textarea {
    resize: none;
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