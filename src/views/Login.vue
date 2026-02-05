<template>
  <div class="login-page">
    <div class="login-background"></div>
    <div class="login-overlay"></div>

    <div class="login-card">
      <div class="login-header">
        <div class="logo-icon"></div>
        <h1 class="login-title">灵隐云管 · 系统登录</h1>
      </div>

      <div class="form-area">
        <el-input
          v-model="username"
          placeholder="请输入管理员账号"
          size="large"
          class="login-input"
        />
        <el-input
          v-model="password"
          type="password"
          placeholder="请输入登录密码"
          size="large"
          class="login-input"
          @keyup.enter="handleLogin"
        />
      </div>

      <el-button
        type="primary"
        size="large"
        class="login-button"
        :loading="loading"
        @click="handleLogin"
      >
        登 录
      </el-button>

      <!-- 测试账号提示 -->
      <div class="test-accounts">
        <div class="test-accounts-title">🔑 默认账号</div>
        <div class="test-accounts-list">
          <div class="account-item">
            <span class="account-label">账号：</span>
            <span class="account-value">admin / password</span>
          </div>
        </div>
      </div>

      <div class="login-footer">
        <span class="footer-link" @click="openForgotPassword">忘记密码？</span>
        <span class="footer-divider">|</span>
        <span class="footer-text">技术支持：0571-8888xxxx</span>
      </div>
    </div>

    <!-- 忘记密码弹窗 -->
    <el-dialog
      v-model="forgotPasswordVisible"
      title="重置密码"
      width="400px"
      append-to-body
      center
      class="zen-dialog"
    >
      <div class="reset-tips">验证码将发送至预留手机号及后台日志</div>
      <el-form :model="resetForm" label-width="0" style="margin-top: 20px">
        <el-form-item>
          <el-input v-model="resetForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item>
          <div style="display: flex; gap: 10px; width: 100%">
            <el-input v-model="resetForm.code" placeholder="请输入验证码" />
            <el-button
              type="primary"
              :disabled="timer > 0"
              :loading="codeSending"
              @click="handleSendCode"
              style="width: 120px"
            >
              {{ timer > 0 ? `${timer}s` : "获取验证码" }}
            </el-button>
          </div>
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="resetForm.newPassword"
            type="password"
            placeholder="请输入新密码"
            show-password
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="forgotPasswordVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="handleResetPassword"
            :loading="resetSubmitting"
          >
            确认重置
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { login, sendVerificationCode, resetPassword } from "../api";

const router = useRouter();
const username = ref("");
const password = ref("");
const loading = ref(false);

// 忘记密码相关
const forgotPasswordVisible = ref(false);
const resetSubmitting = ref(false);
const codeSending = ref(false);
const timer = ref(0);
let interval = null;

const resetForm = reactive({
  username: "",
  code: "",
  newPassword: "",
});

const handleLogin = async () => {
  if (!username.value || !password.value) {
    ElMessage.warning("请输入账号和密码");
    return;
  }

  loading.value = true;
  try {
    const data = await login({
      username: username.value,
      password: password.value,
    });

    // Store token
    localStorage.setItem("token", data.token);
    localStorage.setItem(
      "userInfo",
      JSON.stringify({
        username: data.username,
        name: data.name,
        role: data.role,
      }),
    );

    ElMessage.success("登录成功");
    router.push("/dashboard");
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// 发送验证码
const handleSendCode = async () => {
  if (!resetForm.username) {
    ElMessage.warning("请输入用户名");
    return;
  }
  codeSending.value = true;
  try {
    const res = await sendVerificationCode({ username: resetForm.username });
    ElMessage.success(res || "验证码发送成功"); // Backend API might mock the code in message
    // Start timer
    timer.value = 60;
    interval = setInterval(() => {
      timer.value--;
      if (timer.value <= 0) {
        clearInterval(interval);
      }
    }, 1000);
  } catch (error) {
    ElMessage.error("验证码发送失败");
  } finally {
    codeSending.value = false;
  }
};

// 重置密码
const handleResetPassword = async () => {
  if (!resetForm.username || !resetForm.code || !resetForm.newPassword) {
    ElMessage.warning("请填写完整信息");
    return;
  }
  resetSubmitting.value = true;
  try {
    await resetPassword({
      username: resetForm.username,
      code: resetForm.code,
      newPassword: resetForm.newPassword,
    });
    ElMessage.success("密码重置成功，请重新登录");
    forgotPasswordVisible.value = false;
  } catch (error) {
    ElMessage.error("重置失败，请检查验证码");
  } finally {
    resetSubmitting.value = false;
  }
};

const openForgotPassword = () => {
  resetForm.username = "";
  resetForm.code = "";
  resetForm.newPassword = "";
  forgotPasswordVisible.value = true;
};

onUnmounted(() => {
  if (interval) clearInterval(interval);
});
</script>

<style scoped>
/* 禅意登录页面 */
.login-page {
  width: 100vw;
  height: 100vh;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* 水墨山水背景 */
.login-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    180deg,
    var(--zen-paper-white) 0%,
    rgba(245, 245, 220, 0.95) 30%,
    rgba(232, 232, 232, 0.9) 70%,
    var(--zen-mist-gray) 100%
  );
  background-size: cover;
  background-position: center;
}

/* 雾气效果 */
.login-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(
    circle at 50% 50%,
    rgba(255, 255, 255, 0.3) 0%,
    rgba(245, 245, 220, 0.1) 100%
  );
  backdrop-filter: blur(2px);
}

/* 登录卡片 - 宣纸质感 */
.login-card {
  position: relative;
  z-index: 10;
  width: 480px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(20px);
  border: 2px solid var(--zen-bronze);
  border-radius: 16px;
  padding: 4rem 3rem;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  box-shadow:
    0 8px 32px rgba(107, 68, 35, 0.15),
    0 0 0 1px rgba(184, 134, 11, 0.1) inset;
  animation: cardFadeIn 0.8s ease-out;
}

@keyframes cardFadeIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 顶部装饰 - 祥云 */
.login-card::before {
  content: "";
  position: absolute;
  top: -1px;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 40px;
  background: linear-gradient(to bottom, var(--zen-bronze), transparent);
  opacity: 0.2;
  border-radius: 0 0 50% 50%;
}

/* 底部装饰 */
.login-card::after {
  content: "";
  position: absolute;
  bottom: -1px;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  height: 2px;
  background: linear-gradient(
    to right,
    transparent,
    var(--zen-bronze) 30%,
    var(--zen-bronze) 70%,
    transparent
  );
  opacity: 0.3;
}

.login-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding-bottom: 1rem;
  position: relative;
}

/* Logo - 莲花图标 */
.logo-icon {
  width: 80px;
  height: 80px;
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
    0 4px 20px rgba(107, 68, 35, 0.2),
    0 0 0 3px rgba(184, 134, 11, 0.1);
  position: relative;
  animation: logoFloat 3s ease-in-out infinite;
}

@keyframes logoFloat {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

/* 莲花图案 */
.logo-icon::before {
  content: "🪷";
  font-size: 2.5rem;
  filter: brightness(0) invert(1);
}

.login-title {
  font-size: 1.8rem;
  font-weight: 500;
  color: var(--zen-sandalwood);
  margin: 0;
  letter-spacing: 0.3em;
  text-align: center;
  position: relative;
  padding-bottom: 1rem;
}

/* 标题下划线 */
.login-title::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 2px;
  background: linear-gradient(
    to right,
    transparent,
    var(--zen-bronze),
    transparent
  );
}

.form-area {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 1rem;
}

/* 输入框样式 */
.login-input :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid var(--zen-mist-gray);
  border-radius: 8px;
  height: 50px;
  padding: 0 1.2rem;
  box-shadow: 0 2px 8px rgba(107, 68, 35, 0.05);
  transition: all 0.3s ease;
}

.login-input :deep(.el-input__wrapper:hover) {
  border-color: var(--zen-bronze);
  box-shadow: 0 2px 12px rgba(184, 134, 11, 0.15);
}

.login-input :deep(.el-input__wrapper.is-focus) {
  border-color: var(--zen-bronze);
  box-shadow: 0 0 0 3px rgba(184, 134, 11, 0.1);
  background: rgba(255, 255, 255, 0.95);
}

.login-input :deep(.el-input__inner) {
  color: var(--zen-ink-black);
  font-family: "Noto Serif SC", serif;
  font-size: 0.95rem;
}

.login-input :deep(.el-input__inner::placeholder) {
  color: var(--zen-ink-green);
  opacity: 0.5;
  font-size: 0.9rem;
}

/* 登录按钮 */
.login-button {
  width: 100%;
  height: 52px;
  font-size: 1.1rem;
  font-weight: 500;
  border-radius: 8px;
  background: linear-gradient(
    135deg,
    var(--zen-sandalwood),
    var(--zen-light-sandalwood)
  );
  border: none;
  color: var(--zen-moon-white);
  letter-spacing: 0.5em;
  text-indent: 0.5em;
  font-family: "Noto Serif SC", serif;
  box-shadow: 0 4px 16px rgba(107, 68, 35, 0.3);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.login-button::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  transition: left 0.5s ease;
}

.login-button:hover::before {
  left: 100%;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(107, 68, 35, 0.4);
}

.login-button:active {
  transform: translateY(0);
}

/* 测试账号提示框 */
.test-accounts {
  margin-top: 1.5rem;
  padding: 1.2rem;
  background: linear-gradient(
    135deg,
    rgba(245, 245, 220, 0.4),
    rgba(255, 255, 255, 0.6)
  );
  border: 1px solid rgba(184, 134, 11, 0.2);
  border-radius: 8px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.test-accounts:hover {
  border-color: rgba(184, 134, 11, 0.4);
  box-shadow: 0 2px 12px rgba(107, 68, 35, 0.1);
}

.test-accounts-title {
  font-size: 0.9rem;
  color: var(--zen-sandalwood);
  font-weight: 500;
  text-align: center;
  margin-bottom: 0.8rem;
  letter-spacing: 0.1em;
  font-family: "Noto Serif SC", serif;
}

.test-accounts-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.account-item {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  color: var(--zen-ink-green);
  font-family: "Noto Sans SC", sans-serif;
}

.account-label {
  color: var(--zen-ink-green);
  opacity: 0.8;
  margin-right: 0.5rem;
}

.account-value {
  color: var(--zen-sandalwood);
  font-weight: 500;
  font-family: "Courier New", monospace;
  background: rgba(255, 255, 255, 0.6);
  padding: 0.2rem 0.8rem;
  border-radius: 4px;
  border: 1px solid rgba(184, 134, 11, 0.15);
}

/* 底部信息 */
.login-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  font-size: 0.85rem;
  color: var(--zen-ink-green);
  margin-top: 1rem;
  opacity: 0.8;
}

.footer-link {
  color: var(--zen-ink-green);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.footer-link::after {
  content: "";
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 1px;
  background: var(--zen-bronze);
  transition: width 0.3s ease;
}

.footer-link:hover {
  color: var(--zen-bronze);
}

.footer-link:hover::after {
  width: 100%;
}

.footer-divider {
  color: var(--zen-mist-gray);
  opacity: 0.5;
}

.footer-text {
  color: var(--zen-ink-green);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-card {
    width: 90%;
    padding: 3rem 2rem;
  }

  .login-title {
    font-size: 1.5rem;
  }

  .logo-icon {
    width: 60px;
    height: 60px;
  }

  .logo-icon::before {
    font-size: 2rem;
  }
}

.reset-tips {
  font-size: 12px;
  color: var(--zen-ink-green);
  opacity: 0.7;
  text-align: center;
}
</style>
