<template>
  <filter-bar
    :boardId="boardId"
    @filter="applyFilters"
    @refresh="getListAndTaskData"
  />
  <div class="main" :class="{ 'collapsed-sidebar': !isSidebarOpen }">
    <div class="list-container">
      <ul class="list">
        <!-- display task -->
        <!-- <list-item 
          v-for="list in lists"
          :key="list.id"
          :title="list.title" 
          :status="list.status"
          :tasks="list.taskInside" 
          :listId="list.id"
          
          :data-id="list.id"
          @listDeleted="removeListFromUI"/> -->

        <draggable
          v-model="filteredLists"
          group="lists"
          item-key="id"
          class="list"
          draggable=".drag-item"
          @end="onListDragEnd"
        >
          <template #item="{ element }">
            <div class="drag-item">
              <list-item
                :key="element.id"
                :title="element.title"
                :status="element.status"
                :tasks="element.taskInside"
                :listId="element.id"
                :lists="filteredLists"
                :boardId="boardId"
                @listDeleted="removeListFromUI"
                @taskCreated="handleTaskCreated"
                @taskUpdated="handleTaskUpdated"
                @taskDeleted="removeTaskFromList"
              />
            </div>
          </template>
        </draggable>

        <li class="add-list" v-if="isDisplay">
          <keep-alive>
            <form>
              <div class="add-list-title">
                <input
                  type="text"
                  v-model="newListTitle"
                  placeholder="Enter list title"
                  required
                />
              </div>
              <div class="add-list-status">
                <select v-model="newListStatus" required>
                  <option value="" disabled selected>Select status</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="pending">Pending</option>
                  <option value="done">Done</option>
                  <option value="over">Over</option>
                </select>
              </div>
              <div class="add-button">
                <button class="add" @click.prevent="AddList">Add List</button>
                <button class="cancel" @click="changeVisibility">
                  <i class="bi bi-x-square"></i>
                </button>
              </div>
            </form>
          </keep-alive>
        </li>

        <li class="add-confirm" v-if="!isDisplay">
          <button @click="changeVisibility">
            <i class="bi bi-plus"></i>
            <span>Add List</span>
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import ListItem from "./ListItem.vue";
import axios from "axios";
import draggable from "vuedraggable";
import FilterBar from "../UI/FilterBar.vue";
import { useToast } from "vue-toastification";

export default {
  components: {
    "list-item": ListItem,
    draggable,
    "filter-bar": FilterBar,
  },
  props: ["boardId", "isSidebarOpen"],
  provide() {
    return {
      getListAndTaskData: this.getListAndTaskData,
    };
  },

  data() {
    return {
      isDisplay: false,
      lists: [],
      filteredLists: [], 
      newListTitle: "",
      newListStatus: "",
      isDisplayCreateTask: false,

      currentListId: null,
      selectedTask: null,
    };
  },
  mounted() {
    this.getListAndTaskData(); 
    this.filteredLists = this.lists;
  },
  watch: {
    boardId: {
      immediate: true, 
      handler(newBoardId, oldBoardId) {
        if (newBoardId !== oldBoardId) {
          this.getListAndTaskData();
        }
      },
    },
  },
  methods: {
    changeVisibility() {
      this.isDisplay = !this.isDisplay;
    },
    changeTaskVisibility() {
      this.isDisplayCreateTask = !this.isDisplayCreateTask;
    },
    showCreateTask(listId) {
      this.currentListId = listId;
      this.changeTaskVisibility();
    },
    async getListAndTaskData() {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId || !this.boardId) {
          console.error("Missing userId or boardId.");
          this.lists = [];
          this.filteredLists = [];
          return;
        }

        const response = await axios.get(
          `${process.env.VUE_APP_API_BASE_URL}/api/list/board/${this.boardId}`,
          {
            headers: {
              UserId: userId,
            },
          }
        );

        this.lists = response.data || [];
        this.filteredLists = [...this.lists];

        console.log("Lists and tasks fetched successfully:", this.lists);
      } catch (error) {
        console.error("Error fetching list and task data:", error);
        if (error.response && error.response.status === 404) {
          console.error(
            "Board not found or no lists available for this board."
          );
        } else {
          console.error("An unexpected error occurred:", error.message);
        }
        this.lists = [];
        this.filteredLists = [];
      }
    },

    async AddList() {
      const toast = useToast();

      try {
        const body = {
          title: this.newListTitle,
          status: this.newListStatus,
        };
        const response = await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/api/List?boardId=${this.boardId}`,
          body
        );

        this.lists.push(response.data);

        this.newListTitle = "";
        this.newListStatus = "";
        this.isDisplay = false;
        toast.success("list created successfully!");
        this.getListAndTaskData();
      } catch (error) {
        console.error("Error adding list:", error);
      }
    },

    handleTaskCreated(task) {

      const list = this.lists.find((list) => list.id === task.listId);
      if (list) {
        const existingTask = list.taskInside.find((t) => t.id === task.id);
        if (!existingTask) {
          list.taskInside.push(task);
        }
      } else {
        console.error("List not found for task:", task);
      }

      this.filteredLists = [...this.lists];
    },
    handleTaskUpdated(updatedTask) {

      this.lists.forEach((list) => {
        const taskIndex = list.taskInside.findIndex(
          (task) => task.id === updatedTask.id
        );
        if (taskIndex !== -1) {
          list.taskInside[taskIndex] = {
            ...list.taskInside[taskIndex],
            ...updatedTask,
          };
        }
      });
      this.filteredLists = [...this.lists];
      this.getListAndTaskData();
    },
    openTaskUpdateForm(task) {
      this.selectedTask = task;
    },

    closeTaskForm() {
      this.selectedTask = null;
    },

    removeTaskFromList(taskId) {
      const list = this.lists.find((list) =>
        list.taskInside.some((task) => task.id === taskId)
      );

      if (list) {
        const taskIndex = list.taskInside.findIndex(
          (task) => task.id === taskId
        );

        if (taskIndex !== -1) {
          list.taskInside.splice(taskIndex, 1);
          this.filteredLists = [...this.lists];
        }
      }
      this.selectedTask = null;
    },
    removeListFromUI(listId) {
      this.lists = this.lists.filter((list) => list.id !== listId);
    },

    async onListDragEnd(evt) {
      const { oldIndex, newIndex } = evt;

      if (oldIndex !== newIndex) {
        const draggedList = this.lists.find(
          (list) => list.position === oldIndex + 1
        );
        const targetList = this.lists.find(
          (list) => list.position === newIndex + 1
        );

        if (draggedList && targetList) {
          this.lists.forEach((list, index) => {
            list.position = index + 1;
          });

          draggedList.position = newIndex + 1;

          if (targetList.position > newIndex + 1) {
            targetList.position -= 1;
          }

          this.lists = [...this.lists];

          try {
            await axios.put(`${process.env.VUE_APP_API_BASE_URL}/api/list/move`, {
              DraggedListId: draggedList.id,
              TargetListId: targetList.id,
            });
            this.getListAndTaskData();
          } catch (error) {
            console.error("Error updating list position:", error);
          }
        }
      }
    },
    applyFilters(filters) {
      this.filteredLists = this.lists.map((list) => {
        const filteredTasks = list.taskInside.filter((task) => {
          const matchesStatus = filters.status
            ? task.status === filters.status
            : true;
          const matchesAvailableCheck =
            filters.availableCheck !== ""
              ? task.availableCheck === filters.availableCheck
              : true;
          const matchesEmailFilter = filters.emailFilter
            ? task.userEmail === null
            : true;

          return matchesStatus && matchesAvailableCheck && matchesEmailFilter;
        });

        return {
          ...list,
          taskInside: filteredTasks,
        };
      });
    },
  },
};
</script>


<style scoped>
.main {
  margin-left: 300px;
  margin-top: 10px;
  width: calc(100% - 300px);
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  transition: all 0.3s ease; 
}

.main.collapsed-sidebar {
  margin-left: 50px; 
  width: calc(100% - 50px); 
}

.list-container {
  overflow-x: auto;
  overflow-y: hidden;
  width: 100%;
  height: 82vh;
  margin-right: 15px;
}

.list {
  list-style: none;
  padding: 0;
  margin: 0;
  margin: 10px 17px 0 15px;
  margin-bottom: 20px;

  display: flex;
  flex-wrap: nowrap;
  align-items: flex-start;
}

.list .list-item {
  flex-direction: row-reverse;

  overflow-y: auto;
  min-height: 150px;

  flex: 0 0 auto;
  width: 320px;
  display: inline-block;
  margin: 0 20px;
  margin-top: 20px;
  background-color: #f1f2f4;
  padding: 0;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);

  position: relative;

  scrollbar-color: var(--ds-background-neutral-hovered, #091e4224)
    var(--ds-background-neutral, #091e420f);
}

.list-header {
  margin-top: 10px;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  flex-shrink: 0;
}

.list-header .title {
  text-align: center;
  font-weight: bold;
  flex-grow: 1;
  color: var(--vt-c-text-light-1);
  word-wrap: break-word;
  word-break: break-word;
  white-space: normal;
}

.list-header .list-setting {
  position: absolute;
  right: 0;
  background: none;
  border: none;
  cursor: pointer;
}

.list-setting i {
  font-size: 20px;
}

.list-item .task-add {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: none;
  border: none;
  cursor: pointer;
}

.list-item .task-add i {
  font-size: 20px;
}

.list-item .task {
  margin: 0 auto;
  margin-bottom: 10px;
}

.list-item .task:hover {
  cursor: pointer;
  border: 1.2px solid blue;
}

.list-task {
  flex-grow: 1;
  overflow-y: auto;
  max-height: 490px;
  padding: 15px 10px;
  padding-bottom: 10px;
  margin-bottom: 30px;
}


.add-list {
  margin-top: 30px;
  min-width: 200px;
  display: inline-block;
  margin-left: 20px;
  background-color: #f1f2f4;
  padding: 10px;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  height: fit-content;
}

.add-list-title input {
  width: 100%;
  padding: 5px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.add-list-status select {
  width: 100%;
  padding: 5px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.add-button {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.add-button .add {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
}

.add-button .add:hover {
  background-color: #0056b3;
}

.add-button i {
  font-size: 20px;
  color: #ff0000;
  cursor: pointer;
}

.cancel {
  background: none;
  border: none;
}


.add-confirm {
  min-width: 200px;
  display: inline-block;
  margin-left: 20px;
  margin-top: 30px;

  padding: 10px;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  height: fit-content;

  background-color: transparent;
}

.add-confirm:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.add-confirm button {
  width: 100%;
  height: 100%;
  display: flex;

  background: none;
  border: none;
  padding: 4px;

  font-size: 16px;
}

.add-confirm i {
  margin-right: 10px;
  font-size: 20px;
}

.main::-webkit-scrollbar {
  height: 10px;
}

.main::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 10px;
}

.main::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>