<template>
  <div class="sidebar">
    <div class="logo-container">
      <div class="logo-icon"></div>
      <span class="logo-text">灵隐云管</span>
    </div>

    <div class="menu-area">
      <router-link
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        class="menu-item"
        :class="{ active: isActive(item.path) }"
      >
        <span>{{ item.label }}</span>
      </router-link>
    </div>
    <div class="user-profile">
      <div class="user-info">
        <div class="user-avatar">{{ userInitial }}</div>
        <div class="user-details">
          <div class="user-name">{{ userInfo.name || "管理员" }}</div>
          <div class="user-role">
            {{ userInfo.role === "ADMIN" ? "超级管理员" : "普通用户" }}
          </div>
        </div>
      </div>
      <div class="logout-btn" @click="handleLogout">
        <el-icon><SwitchButton /></el-icon>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { computed, ref, onMounted } from "vue";
import { SwitchButton } from "@element-plus/icons-vue";

const route = useRoute();
const router = useRouter();

const userInfo = ref({});

onMounted(() => {
  const storedUser = localStorage.getItem("userInfo");
  if (storedUser) {
    try {
      userInfo.value = JSON.parse(storedUser);
    } catch (e) {
      console.error("Failed to parse user info", e);
    }
  }
});

const userInitial = computed(() => {
  return userInfo.value.name ? userInfo.value.name.charAt(0) : "A";
});

const menuItems = [
  { path: "/dashboard", label: "数据总览" },
  { path: "/monks", label: "僧众管理" },
  { path: "/rituals", label: "法会活动" },
  { path: "/donations", label: "功德管理" },
  { path: "/reports", label: "数据报表" },
  { path: "/users", label: "用户管理" },
];

const isActive = (path) => {
  return computed(() => route.path === path).value;
};

const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userInfo");
  router.push("/login");
};
</script>

<style scoped>
/* 禅意侧边栏 */
.sidebar {
  width: 240px;
  height: 100vh;
  background: linear-gradient(
    180deg,
    rgba(250, 250, 248, 0.98) 0%,
    rgba(245, 245, 220, 0.95) 50%,
    rgba(240, 240, 235, 0.98) 100%
  );
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 2rem 1.5rem;
  position: fixed;
  left: 0;
  top: 0;
  border-right: 2px solid transparent;
  border-image: linear-gradient(
      to bottom,
      transparent,
      var(--zen-bronze) 30%,
      var(--zen-bronze) 70%,
      transparent
    )
    1;
  box-shadow: 4px 0 20px rgba(107, 68, 35, 0.08);
  position: relative;
  overflow: hidden;
}

/* 顶部祥云装饰 */
.sidebar::before {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  width: 120px;
  height: 120px;
  background: url("../assets/cloud.png") center/contain no-repeat;
  opacity: 0.05;
  pointer-events: none;
}

/* 底部莲花装饰 */
.sidebar::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100px;
  height: 100px;
  background: url("../assets/lotus.png") center/contain no-repeat;
  opacity: 0.05;
  pointer-events: none;
}

/* Logo区域 */
.logo-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  height: 60px;
  padding: 0.5rem;
  position: relative;
  z-index: 1;
}

/* Logo图标 - 莲花 */
.logo-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(
    135deg,
    var(--zen-sandalwood),
    var(--zen-light-sandalwood)
  );
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 4px 12px rgba(107, 68, 35, 0.2),
    0 0 0 2px rgba(184, 134, 11, 0.1);
  position: relative;
  animation: logoGlow 3s ease-in-out infinite;
}

/* Logo莲花图案 */
.logo-icon::before {
  content: "🪷";
  font-size: 1.8rem;
  filter: brightness(0) invert(1);
}

@keyframes logoGlow {
  0%,
  100% {
    box-shadow:
      0 4px 12px rgba(107, 68, 35, 0.2),
      0 0 0 2px rgba(184, 134, 11, 0.1);
  }
  50% {
    box-shadow:
      0 4px 16px rgba(107, 68, 35, 0.3),
      0 0 0 3px rgba(184, 134, 11, 0.2);
  }
}

.logo-text {
  font-size: 1.3rem;
  font-weight: 500;
  color: var(--zen-sandalwood);
  letter-spacing: 0.2em;
  font-family: "Noto Serif SC", serif;
  position: relative;
}

/* Logo文字下划线 */
.logo-text::after {
  content: "";
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(to right, var(--zen-bronze), transparent);
  opacity: 0.4;
}

/* 菜单区域 */
.menu-area {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
  position: relative;
  z-index: 1;
}

/* 菜单项 */
.menu-item {
  padding: 0.9rem 1.2rem;
  border-radius: 8px;
  color: var(--zen-ink-green);
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 400;
  font-family: "Noto Serif SC", serif;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  letter-spacing: 0.05em;
}

/* 菜单项左侧装饰 */
.menu-item::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 0;
  background: linear-gradient(
    to bottom,
    var(--zen-bronze),
    var(--zen-light-bronze)
  );
  transition: height 0.3s ease;
  border-radius: 0 2px 2px 0;
}

/* 菜单项前缀符号 */
.menu-item span::before {
  content: "◆ ";
  color: var(--zen-bronze);
  opacity: 0;
  margin-right: 0.5rem;
  font-size: 0.7rem;
  transition: opacity 0.3s ease;
}

.menu-item:hover {
  background: linear-gradient(
    135deg,
    rgba(184, 134, 11, 0.08),
    rgba(245, 245, 220, 0.3)
  );
  color: var(--zen-sandalwood);
  transform: translateX(4px);
}

.menu-item:hover::before {
  height: 60%;
}

.menu-item:hover span::before {
  opacity: 1;
}

/* 激活状态的菜单项 */
.menu-item.active {
  background: linear-gradient(
    135deg,
    rgba(107, 68, 35, 0.12),
    rgba(184, 134, 11, 0.08)
  );
  color: var(--zen-sandalwood);
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(107, 68, 35, 0.1);
}

.menu-item.active::before {
  height: 80%;
}

.menu-item.active span::before {
  opacity: 1;
  color: var(--zen-sandalwood);
}

/* 用户信息区域 */
.user-profile {
  border-top: 1px solid transparent;
  border-image: linear-gradient(
      to right,
      transparent,
      var(--zen-bronze) 20%,
      var(--zen-bronze) 80%,
      transparent
    )
    1;
  padding-top: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 1;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

/* 用户头像 */
.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    var(--zen-sandalwood),
    var(--zen-light-sandalwood)
  );
  color: var(--zen-moon-white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1rem;
  font-family: "Noto Serif SC", serif;
  box-shadow: 0 2px 8px rgba(107, 68, 35, 0.2);
  border: 2px solid rgba(184, 134, 11, 0.2);
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.user-name {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--zen-sandalwood);
  font-family: "Noto Serif SC", serif;
  letter-spacing: 0.05em;
}

.user-role {
  font-size: 0.75rem;
  color: var(--zen-ink-green);
  opacity: 0.8;
}

/* 退出按钮 */
.logout-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
  color: var(--zen-ink-green);
  transition: all 0.3s ease;
  background: transparent;
  border: 1px solid transparent;
}

.logout-btn:hover {
  background: linear-gradient(
    135deg,
    rgba(198, 40, 40, 0.08),
    rgba(245, 108, 108, 0.05)
  );
  color: var(--zen-danger);
  border-color: rgba(198, 40, 40, 0.2);
  transform: rotate(180deg);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    width: 200px;
    padding: 1.5rem 1rem;
  }

  .logo-icon {
    width: 40px;
    height: 40px;
  }

  .logo-icon::before {
    font-size: 1.5rem;
  }

  .logo-text {
    font-size: 1.1rem;
  }

  .menu-item {
    padding: 0.8rem 1rem;
    font-size: 0.9rem;
  }
}
</style>
