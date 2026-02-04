import { createRouter, createWebHistory } from "vue-router";
import Login from "../views/Login.vue";
import Dashboard from "../views/Dashboard.vue";
import MonkManagement from "../views/MonkManagement.vue";
import RitualManagement from "../views/RitualManagement.vue";
import DonationManagement from "../views/DonationManagement.vue";
import UserManagement from "../views/UserManagement.vue";

const routes = [
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: Dashboard,
  },
  {
    path: "/users",
    name: "UserManagement",
    component: UserManagement,
  },
  {
    path: "/monks",
    name: "MonkManagement",
    component: MonkManagement,
  },
  {
    path: "/rituals",
    name: "RitualManagement",
    component: RitualManagement,
  },
  {
    path: "/donations",
    name: "DonationManagement",
    component: DonationManagement,
  },
  {
    path: "/reports",
    name: "ReportManagement",
    component: () => import("../views/ReportManagement.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
