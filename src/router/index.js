import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/User_page/HomeView.vue";
import LoginView from "@/views/User_page/LoginView.vue";
import BoardList from "../views/User_page/BoardList.vue";
import WorkspaceView from "../views/User_page/WorkspaceView.vue";
import CalenderView from "../views/User_page/CalenderView.vue";
import NoteView from '@/views/User_page/NoteView.vue';
import HomePage from "../views/User_page/HomePage.vue";
import AcceptInvitation from "@/components/Collaborator/AcceptInvitation.vue";
import ErrorView from "@/views/User_page/ErrorView.vue";
import BoardCollabList from "@/views/User_page/BoardCollabList.vue";
import AdminDashboard from "../views/Admin_page/AdminDashboard.vue";
import PaymentSuccess from "@/components/User/PaymentSuccess.vue";
import PaymentCancel from "@/components/User/PaymentCancel.vue";
import PaymentError from "@/components/User/PaymentError.vue";
import ChatView from "@/views/User_page/ChatView.vue";

import axios from "axios";

const routes = [
  {
    path: "/error",
    name: "Error",
    component: ErrorView,
  },
  {
    path: "/homepage",
    name: "homepage",
    component: HomePage,
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: "/board-list/:boardId",
    name: "Board-list",
    component: BoardList,
    props: true,
    meta: { requiresAuth: true, requiresOwnership: true},
  },
  {
    path: '/accept-invitation',
    name: 'AcceptInvitation',
    component: AcceptInvitation,
    props: (route) => ({ code: route.query.code }),
  },
  {
    path: "/workspace-list/:workspaceId",
    name: "Workspace-view",
    component: WorkspaceView,
    props: true,
    meta: { requiresAuth: true, requiresOwnership: true},
  },
  {
    path: "/calender-view",
    name: "calender-view",
    component: CalenderView,
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: "/take-note",
    name: "take-note",
    component: NoteView,
    props: true,
    meta: { requiresAuth: true, requiresOwnership: true},
  },
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/login",
    name: "Login",
    component: LoginView,
  },
  {
    path: "/collaborator-boards",
    name: "BoardCollabList",
    component: BoardCollabList,
  },  
  {
    name: 'admin',
    path: '/admin',
    component: AdminDashboard,
    redirect: { name: 'dashboard' },
    children: [
      {
        name: 'dashboard',
        path: 'dashboard',
        component: () => import('../views/Admin_page/AdminDashboard.vue'),
      },
    ],
    meta: { requiresAuth: true },
  },
  {
    path: '/payment-success',
    name: 'PaymentSuccess',
    component: PaymentSuccess,
  },
  {
    path: '/payment-cancel',
    name: 'PaymentCancel',
    component: PaymentCancel,
  },
  {
    path: '/payment-error',
    name: 'PaymentError',
    component: PaymentError,
  },
  {
    path: '/chatview/:boardId',
    name: 'ChatView',
    component: ChatView,
    props: true,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

// Global navigation guard
router.beforeEach(async (to, from, next) => {
  const userId = localStorage.getItem("userId");

  if (!userId) {
    if (to.meta.requiresAuth) {
      return next({
        path: "/login",
        query: { redirect: to.fullPath },
      });
    } else {
      return next();
    }
  }
  let role = localStorage.getItem("userRoles");
  if (role === "Admin" && !to.path.startsWith("/admin")) {
    return next({ path: "/admin" });
  }
  if (to.path.startsWith("/admin") && role !== "Admin") {
    console.error("Access denied: Only Admins can access this route.");
    return next("/error");
  }
  const validateOwnership = async (url, resourceId) => {
    try {
      const response = await axios.get(`${url}/${resourceId}`, {
        headers: {
          UserId: userId,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error validating ownership:", error);
      if (error.response?.status === 403) {
        console.error("Permission denied:", error.response?.data?.message);
      } else if (error.response?.status === 404) {
        console.error("Resource not found:", error.response?.data?.message);
      }
      return null;
    }
  };

  if (to.meta.requiresOwnership && to.params.workspaceId) {
    const workspace = await validateOwnership(
      `${process.env.VUE_APP_API_BASE_URL}/api/workspace`,
      to.params.workspaceId
    );
    if (!workspace || workspace.userId !== userId) {
      return next("/error");
    }
  }

  if (to.meta.requiresOwnership && to.params.boardId) {
    try {
      const response = await axios.get(
        `${process.env.VUE_APP_API_BASE_URL}/api/board/${to.params.boardId}`,
        {
          headers: {
            UserId: localStorage.getItem("userId"),
          },
        }
      );
  
      const ownershipData = response.data;

      // console.log(ownershipData);

      if (!ownershipData.isOwner && !ownershipData.isEditor) {
        console.error("Permission denied for the board.");
        return next("/error");
      }
    } catch (error) {
      console.error("Error validating board ownership:", error);
      return next("/error");
    }
  }  
  next();
});

export default router;
