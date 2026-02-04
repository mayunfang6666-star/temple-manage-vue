<template>
  <div class="page-layout">
    <Sidebar />

    <div class="main-content">
      <div class="page-header">
        <h2 class="page-title">僧众管理</h2>
        <el-breadcrumb separator="/">
          <el-breadcrumb-item>首页</el-breadcrumb-item>
          <el-breadcrumb-item>僧众管理</el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <div class="filter-bar">
        <el-input
          v-model="searchText"
          placeholder="搜索法名、俗名..."
          style="width: 300px"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="handleCreate">添加僧众</el-button>
      </div>

      <div class="table-container">
        <el-table :data="monkData" style="width: 100%" v-loading="loading">
          <el-table-column prop="dharmaName" label="法名" min-width="120" />
          <el-table-column prop="secularName" label="俗名" min-width="120" />
          <el-table-column prop="position" label="职位" min-width="150" />
          <el-table-column prop="joinDate" label="入寺时间" width="150" />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button
                link
                type="primary"
                size="small"
                @click="handleEdit(row)"
                >编辑</el-button
              >
              <el-button
                link
                type="primary"
                size="small"
                @click="handleView(row)"
                >查看</el-button
              >
              <el-popconfirm
                title="确定删除该僧众吗?"
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

      <!-- Monk Dialog -->
      <el-dialog
        v-model="dialogVisible"
        :title="dialogTitle"
        width="500px"
        :close-on-click-modal="false"
      >
        <el-form
          :model="form"
          :rules="rules"
          ref="formRef"
          label-width="80px"
          :disabled="dialogType === 'view'"
        >
          <el-form-item label="法名" prop="dharmaName">
            <el-input v-model="form.dharmaName" placeholder="请输入法名" />
          </el-form-item>
          <el-form-item label="俗名" prop="secularName">
            <el-input v-model="form.secularName" placeholder="请输入俗名" />
          </el-form-item>
          <el-form-item label="职位" prop="position">
            <el-select v-model="form.position" placeholder="请选择职位">
              <el-option label="住持" value="住持" />
              <el-option label="监院" value="监院" />
              <el-option label="知客" value="知客" />
              <el-option label="维那" value="维那" />
              <el-option label="典座" value="典座" />
              <el-option label="清众" value="清众" />
            </el-select>
          </el-form-item>
          <el-form-item label="入寺时间" prop="joinDate">
            <el-date-picker
              v-model="form.joinDate"
              type="date"
              placeholder="选择日期"
              style="width: 100%"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="form.status" placeholder="请选择状态">
              <el-option label="在寺" value="在寺" />
              <el-option label="云游" value="云游" />
              <el-option label="闭关" value="闭关" />
              <el-option label="离寺" value="离寺" />
            </el-select>
          </el-form-item>
          <el-form-item label="联系电话" prop="phone">
            <el-input v-model="form.phone" placeholder="请输入联系电话" />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer" v-if="dialogType !== 'view'">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="submitForm" :loading="submitting">
              确定
            </el-button>
          </span>
          <span class="dialog-footer" v-else>
            <el-button type="primary" @click="dialogVisible = false"
              >关闭</el-button
            >
          </span>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, reactive, computed } from "vue";
import { Search } from "@element-plus/icons-vue";
import Sidebar from "../components/Sidebar.vue";
import { getMonks, createMonk, updateMonk, deleteMonk } from "../api";
import { ElMessage } from "element-plus";

const searchText = ref("");
const monkData = ref([]);
const loading = ref(false);

const dialogVisible = ref(false);
const dialogType = ref("create"); // 'create', 'edit', 'view'
const submitting = ref(false);
const formRef = ref(null);

const form = reactive({
  id: null,
  dharmaName: "",
  secularName: "",
  position: "",
  joinDate: "",
  status: "在寺",
  phone: "",
});

const rules = {
  dharmaName: [{ required: true, message: "请输入法名", trigger: "blur" }],
  position: [{ required: true, message: "请选择职位", trigger: "change" }],
  joinDate: [{ required: true, message: "请选择入寺时间", trigger: "change" }],
  status: [{ required: true, message: "请选择状态", trigger: "change" }],
};

const dialogTitle = computed(() => {
  if (dialogType.value === "create") return "添加僧众";
  if (dialogType.value === "edit") return "编辑僧众";
  return "查看僧众详情";
});

const fetchMonks = async () => {
  loading.value = true;
  try {
    const res = await getMonks({
      search: searchText.value,
      page: 0,
      size: 100, // Get more for now as pagination UI isn't implemented
    });
    monkData.value = res.content;
  } catch (error) {
    console.error("Failed to fetch monks", error);
    ElMessage.error("获取僧众列表失败");
  } finally {
    loading.value = false;
  }
};

const getStatusType = (status) => {
  switch (status) {
    case "在寺":
      return "success";
    case "云游":
      return "warning";
    case "闭关":
      return "primary";
    case "离寺":
      return "info";
    default:
      return "info";
  }
};

const resetForm = () => {
  if (formRef.value) formRef.value.resetFields();
  form.id = null;
  form.dharmaName = "";
  form.secularName = "";
  form.position = "";
  form.joinDate = "";
  form.status = "在寺";
  form.phone = "";
};

const handleCreate = () => {
  dialogType.value = "create";
  resetForm();
  dialogVisible.value = true;
};

const handleEdit = (row) => {
  dialogType.value = "edit";
  form.id = row.id;
  form.dharmaName = row.dharmaName;
  form.secularName = row.secularName;
  form.position = row.position;
  form.joinDate = row.joinDate;
  form.status = row.status;
  form.phone = row.phone;
  dialogVisible.value = true;
};

const handleView = (row) => {
  dialogType.value = "view";
  form.id = row.id;
  form.dharmaName = row.dharmaName;
  form.secularName = row.secularName;
  form.position = row.position;
  form.joinDate = row.joinDate;
  form.status = row.status;
  form.phone = row.phone;
  dialogVisible.value = true;
};

const handleDelete = async (row) => {
  try {
    await deleteMonk(row.id);
    ElMessage.success("删除成功");
    fetchMonks();
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
          await createMonk(form);
          ElMessage.success("添加成功");
        } else {
          await updateMonk(form.id, form);
          ElMessage.success("更新成功");
        }
        dialogVisible.value = false;
        fetchMonks();
      } catch (error) {
        ElMessage.error(
          dialogType.value === "create" ? "添加失败" : "更新失败",
        );
      } finally {
        submitting.value = false;
      }
    }
  });
};

// Debounce search or just watch
let timeout;
watch(searchText, () => {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    fetchMonks();
  }, 500);
});

onMounted(() => {
  fetchMonks();
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

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
