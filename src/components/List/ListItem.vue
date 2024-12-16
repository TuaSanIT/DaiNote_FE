<template>
  <div class="list-item">
    <div v-if="showOptions" class="list-options-dropdown">
      <div class="options-item update" @click="showUpdateList">
        <i class="bi bi-screwdriver"></i>Update
      </div>
      <div class="options-item delete" @click="deleteList">
        <i class="bi bi-x"></i>Delete
      </div>
    </div>

    <teleport to="body">
      <div v-if="showOptions" class="list-background" @click="closeForm"></div>
    </teleport>

    <div class="list-header">
      <span class="title">{{ listData.title }}</span>
      <button class="list-setting" @click="showOptions = !showOptions">
        <i class="bi bi-three-dots-vertical"></i>
      </button>
    </div>

    <!-- <div class="list-task">
      <base-task
        class="task"
        v-for="task in tasksRef"
        :key="task.id"
        :title="task.title"
        :description="task.description"
        :id="task.id"
        @taskSelected="openTaskUpdateForm"

        data-id="task.id"
      />
    </div> -->

    <draggable
      v-model="tasksRef"
      @end="onTaskDragEnd"
      group="tasks"
      class="list-task"
      :data-id="listId"
    >
      <template #item="{ element }">
        <base-task
          class="task"
          :key="element.id"
          :title="element.title"
          :status="element.status"
          :finished_at="element.finish_At"
          :description="element.description"
          :userEmailId="element.userEmailId"
          :assignedUsers="element.assignedUsers"
          :id="element.id"
          @taskSelected="openTaskUpdateForm"
        />
      </template>
    </draggable>

    <button class="task-add" @click="showCreateTask">
      <i class="bi bi-plus-circle-fill"></i>
    </button>
  </div>

  <teleport to="div.main">
    <create-task
      id="create-task"
      class="task-creating"
      v-if="isDisplayCreateTask"
      @closeForm="changeTaskVisibility"
      @taskCreated="handleTaskCreated"
      :listId="listId"
    />
  </teleport>

  <teleport to="div.main">
    <update-task
      v-if="selectedTask"
      :task="selectedTask"
      :boardId="boardId"
      @closeForm="closeTaskForm"
      @taskDeleted="removeTaskFromList"
      @taskUpdated="updateTaskInList"
    />
  </teleport>

  <teleport to="div.main">
    <update-list
      v-if="showListUpdate"
      :list="listData"
      @closeForm="closeListForm"
      @listUpdated="updateListInItem"
    />
  </teleport>
</template>

<script>
import BaseTask from "../Task/BaseTask.vue";
import UpdateTask from "../Task/UpdateTask.vue";
import CreateTask from "../Task/CreateTask.vue";
import UpdateList from "./UpdateList.vue";
import axios from "axios";
import draggable from "vuedraggable";
import { useToast } from "vue-toastification";
import { DatetimeFormat } from "vue-i18n";

export default {
  props: {
    boardId: {
      type: String,
      required: true,
    },
    listId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    finished_at: {
      type: DatetimeFormat,
      required: true,
    },
    userEmailId: {
      type: String,
      required: true,
    },
    tasks: {
      type: Array,
      required: true,
    },
    lists: {
      type: Object,
      required: true,
    },
  },
  inject: ["getListAndTaskData"],
  watch: {
    tasks: {
      deep: true,
      immediate: true,
      handler(newTasks) {
        this.tasksRef = [...newTasks]; 
      },
    },
  },

  data() {
    return {
      selectedTask: null,
      isDisplayCreateTask: false,
      tasksRef: [],
      showOptions: false,
      showListUpdate: false,
      listData: {},
    };
  },
  components: {
    "base-task": BaseTask,
    "update-task": UpdateTask,
    "create-task": CreateTask,
    "update-list": UpdateList,
    draggable,
  },
  mounted() {
    this.tasksRef = this.tasks;
    this.listData = {
      id: this.listId,
      title: this.title,
      status: this.status,
      userEmailId: this.userEmailId,
    };
  },
  methods: {
    closeForm(event) {
      if (event.target.classList.contains("list-setting")) {
        this.showOptions = !this.showOptions;
      } else if (!event.target.closest(".list-options-dropdown")) {
        this.showOptions = false;
      }
    },
    openTaskUpdateForm(task) {
      this.selectedTask = task;
      console.log("task data is: ", task);
    },
    updateTaskInList(updatedTask) {
      const taskIndex = this.tasksRef.findIndex(
        (task) => task.id === updatedTask.id
      );
      if (taskIndex !== -1) {
        this.tasksRef[taskIndex] = {
          ...this.tasksRef[taskIndex],
          ...updatedTask,
        };
        this.$emit("taskUpdated", updatedTask);
      }
    },
    removeTaskFromList(taskId) {
      const taskIndex = this.tasksRef.findIndex((task) => task.id === taskId);
      if (taskIndex !== -1) {
        this.tasksRef.splice(taskIndex, 1);
        this.$emit("taskDeleted", taskId);
      }
      this.selectedTask = null;
    },
    showCreateTask() {
      this.changeTaskVisibility();
    },
    changeTaskVisibility() {
      this.isDisplayCreateTask = !this.isDisplayCreateTask;
    },
    handleTaskCreated(task) {
      if (!this.tasksRef) {
        this.tasksRef = [];
      }
      this.tasksRef.push(task);
      this.$emit("taskCreated", task);
    },
    closeTaskForm() {
      this.selectedTask = null;
    },
    showUpdateList() {
      this.showListUpdate = true;
    },
    closeListForm() {
      this.showListUpdate = false;
    },
    updateListInItem(updatedList) {
      this.listData = updatedList;
      this.showListUpdate = false;
    },
    async deleteList() {
      const toast = useToast();
      if (confirm("Do you want to delete this List?")) {
        try {
          await axios.delete(`${process.env.VUE_APP_API_BASE_URL}/api/list/${this.listId}`);
          this.$emit("listDeleted", this.listId);
          toast.success("List deleted successfully!");
          this.getListAndTaskData();
        } catch (error) {
          console.error("Error deleting list:", error);
        }
      }
    },

    async onTaskDragEnd(evt) {
      const { newIndex, oldIndex, from, to } = evt;
      const isDifferentList = from.dataset.id !== to.dataset.id;

      const sourceListId = from.dataset.id;
      const sourceList = this.lists.find((list) => list.id === sourceListId);

      if (
        !sourceList ||
        !sourceList.taskInside ||
        sourceList.taskInside.length === 0
      ) {
        console.error("Source list or tasks not found");
        return;
      }

      const draggedTask = sourceList.taskInside[oldIndex];
      if (isDifferentList) {
        const targetListId = to.dataset.id;
        const targetList = this.lists.find((list) => list.id === targetListId);
        if (!targetList) {
          console.error(`Target list with ID ${targetListId} not found.`);
          return;
        }

        const targetTasks = targetList.taskInside;

        if (targetTasks.length === 0 || newIndex === targetTasks.length) {
          const body = {
            taskId: draggedTask.id, 
            TargetListId: targetListId,
          };
          try {
            await axios.put(
              `${process.env.VUE_APP_API_BASE_URL}/api/Task/moveTaskToListAtLastPosition`,
              body
            );
            this.getListAndTaskData();
          } catch (error) {
            console.error(
              "Error moving task to the list at last position:",
              error
            );
          }
        } else {
          const targetTask = targetTasks[newIndex];
          const body = {
            DraggedTaskId: draggedTask.id, 
            TargetTaskId: targetTask.id,
          };
          try {
            await axios.put(
              `${process.env.VUE_APP_API_BASE_URL}/api/Task/moveTaskToListWithTaskId`,
              body
            );
            this.getListAndTaskData();
          } catch (error) {
            console.error(
              "Error moving task to the list with specific task id:",
              error
            );
          }
        }
      } else {
        if (newIndex !== oldIndex) {
          const draggedTask = this.tasksRef[newIndex];
          const targetTask =
            this.tasksRef[newIndex > oldIndex ? newIndex - 1 : newIndex + 1];
          const body = {
            DraggedTaskId: draggedTask.id,
            TargetTaskId: targetTask.id,
            TargetListId: this.listId,
          };
          try {
            await axios.put(`${process.env.VUE_APP_API_BASE_URL}/api/Task/moveTask`, body);
            this.getListAndTaskData();
          } catch (error) {
            console.error("Error moving task:", error);
          }
        }
      }
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

.list-background {
  background: none;
  position: absolute;
  z-index: 1000;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.list .list-item {
  cursor: pointer;
  flex-direction: row-reverse;

  overflow-y: auto;
  min-height: 120px;

  flex: 0 0 auto;
  width: 320px;
  display: inline-block;
  margin: 0 20px;
  
  background-color: #f1f2f4;
  padding: 0;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);

  position: relative;

  scrollbar-color: var(--ds-background-neutral-hovered, #091e4224)
    var(--ds-background-neutral, #091e420f);
  overflow: auto;
}

.list-item .list-options-dropdown {
  position: absolute;
  z-index: 2000;
  top: 0;
  right: 0;
  margin-top: 36px;
  background-color: rgb(152, 149, 149) !important;
  color: aliceblue;
  border: none;
  cursor: pointer;
}

.list-options-dropdown .options-item {
  padding: 4px 8px;
}

.list-options-dropdown .options-item.update i {
  margin-right: 5px;
  font-size: 18px;
}

.list-options-dropdown .options-item.delete i {
  margin-right: 5px;
  font-size: 24px;
}

.list-options-dropdown .options-item.update {
  background-color: #4caf50;
  color: #fff;
  padding: 4px 8px;
  border: none;
  cursor: pointer;
}

.list-options-dropdown .options-item.delete {
  background-color: #e74c3c;
  color: #fff;
  padding: 4px 8px;
  border: none;
  cursor: pointer;
}

.list-options-dropdown .options-item:hover {
  cursor: pointer;
  background-color: rgb(70, 70, 70);
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

.list-task {
  flex-grow: 1;
  overflow-y: auto; 
  max-height: 650px; 
  padding: 15px 10px; 
  padding-bottom: 10px;
  margin-bottom: 30px;
}
</style>