<template>
  <div class="page-layout">
    <Sidebar />

    <div class="main-content">
      <div class="page-header">
        <h2 class="page-title">用户管理</h2>
        <el-breadcrumb separator="/">
          <el-breadcrumb-item>首页</el-breadcrumb-item>
          <el-breadcrumb-item>用户管理</el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <div class="filter-bar">
        <el-button type="primary" @click="handleCreate">添加用户</el-button>
      </div>

      <div class="table-container">
        <el-table :data="userData" style="width: 100%" v-loading="loading">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="username" label="用户名" min-width="150" />
          <el-table-column prop="name" label="姓名" min-width="150" />
          <el-table-column prop="role" label="角色" width="120">
            <template #default="{ row }">
              <el-tag :type="row.role === 'ADMIN' ? 'danger' : 'primary'">
                {{ row.role }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="180" />
          <el-table-column label="操作" width="180">
            <template #default="{ row }">
              <el-button
                link
                type="primary"
                size="small"
                @click="handleEdit(row)"
                >编辑</el-button
              >
              <el-popconfirm
                title="确定删除该用户吗?"
                @confirm="handleDelete(row)"
              >
                <template #reference>
                  <el-button link type="danger" size="small">删除</el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- Dialog -->
      <el-dialog
        v-model="dialogVisible"
        :title="dialogType === 'create' ? '添加用户' : '编辑用户'"
        width="500px"
      >
        <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
          <el-form-item
            label="用户名"
            prop="username"
            v-if="dialogType === 'create'"
          >
            <el-input v-model="form.username" placeholder="请输入用户名" />
          </el-form-item>
          <el-form-item label="姓名" prop="name">
            <el-input v-model="form.name" placeholder="请输入姓名" />
          </el-form-item>
          <el-form-item label="角色" prop="role">
            <el-select v-model="form.role" placeholder="请选择角色">
              <el-option label="管理员" value="ADMIN" />
              <el-option label="普通用户" value="USER" />
            </el-select>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="请输入密码"
              show-password
            />
            <div class="tips" v-if="dialogType === 'edit'">
              留空表示不修改密码
            </div>
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="submitForm" :loading="submitting">
              确定
            </el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from "vue";
import Sidebar from "../components/Sidebar.vue";
import { getUsers, createUser, updateUser, deleteUser } from "../api/user";
import { ElMessage } from "element-plus";

const userData = ref([]);
const loading = ref(false);
const dialogVisible = ref(false);
const dialogType = ref("create"); // 'create' or 'edit'
const submitting = ref(false);
const formRef = ref(null);

const form = reactive({
  id: null,
  username: "",
  name: "",
  role: "USER",
  password: "",
});

const rules = {
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  name: [{ required: true, message: "请输入姓名", trigger: "blur" }],
  role: [{ required: true, message: "请选择角色", trigger: "change" }],
  password: [
    {
      required: true,
      message: "请输入密码",
      trigger: "blur",
      validator: (rule, value, callback) => {
        if (dialogType.value === "create" && !value) {
          callback(new Error("请输入密码"));
        } else {
          callback();
        }
      },
    },
  ],
};

const fetchUsers = async () => {
  loading.value = true;
  try {
    const res = await getUsers({ page: 0, size: 100 });
    userData.value = res.content;
  } catch (error) {
    ElMessage.error("获取用户列表失败");
  } finally {
    loading.value = false;
  }
};

const handleCreate = () => {
  dialogType.value = "create";
  form.id = null;
  form.username = "";
  form.name = "";
  form.role = "USER";
  form.password = "";
  dialogVisible.value = true;
};

const handleEdit = (row) => {
  dialogType.value = "edit";
  form.id = row.id;
  form.username = row.username;
  form.name = row.name;
  form.role = row.role;
  form.password = "";
  dialogVisible.value = true;
};

const handleDelete = async (row) => {
  try {
    await deleteUser(row.id);
    ElMessage.success("删除成功");
    fetchUsers();
  } catch (error) {
    ElMessage.error("删除失败");
  }
};

const submitForm = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true;
      try {
        if (dialogType.value === "create") {
          await createUser(form);
          ElMessage.success("创建成功");
        } else {
          await updateUser(form.id, form);
          ElMessage.success("更新成功");
        }
        dialogVisible.value = false;
        fetchUsers();
      } catch (error) {
        ElMessage.error(
          dialogType.value === "create" ? "创建失败" : "更新失败",
        );
      } finally {
        submitting.value = false;
      }
    }
  });
};

onMounted(() => {
  fetchUsers();
});
</script>

<style scoped>
/* Zen theme background */
.page-layout {
  display: flex;
  min-height: 100vh;
  background: var(--zen-paper-white);
  position: relative;
}

/* Background decoration */
.page-layout::before {
  content: "";
  position: fixed;
  bottom: 0;
  right: 0;
  width: 300px;
  height: 300px;
  background: url("../assets/lotus.png") center/contain no-repeat;
  opacity: 0.03;
  pointer-events: none;
  z-index: 0;
}

.main-content {
  margin-left: 40px;
  flex: 1;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 16px;
}

.table-container {
  background: var(--color-bg-white);
  border-radius: var(--radius-md);
  padding: 24px;
}

.tips {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}
</style>
