<template>
  <div class="page-layout">
    <Sidebar />

    <div class="main-content">
      <div class="page-header">
        <h2 class="page-title">法会活动管理</h2>
        <el-breadcrumb separator="/">
          <el-breadcrumb-item>首页</el-breadcrumb-item>
          <el-breadcrumb-item>法会活动</el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <div class="filter-bar">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 360px"
        />
        <el-button type="primary" @click="handleCreate">新建法会</el-button>
      </div>

      <div class="table-container">
        <el-table :data="ritualData" style="width: 100%" v-loading="loading">
          <el-table-column prop="name" label="法会名称" min-width="180" />
          <el-table-column prop="master" label="主持法师" min-width="120" />
          <el-table-column prop="startTime" label="开始时间" width="180" />
          <el-table-column prop="participants" label="参与人数" width="120" />
          <el-table-column label="状态" width="120">
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
                v-if="row.status !== '已取消'"
                title="确定取消该法会吗?"
                @confirm="handleCancel(row)"
              >
                <template #reference>
                  <el-button link type="danger" size="small">取消</el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- Ritual Dialog -->
      <el-dialog
        v-model="dialogVisible"
        :title="dialogTitle"
        width="600px"
        :close-on-click-modal="false"
      >
        <el-form
          :model="form"
          :rules="rules"
          ref="formRef"
          label-width="100px"
          :disabled="dialogType === 'view'"
        >
          <el-form-item label="法会名称" prop="name">
            <el-input v-model="form.name" placeholder="请输入法会名称" />
          </el-form-item>
          <el-form-item label="主持法师" prop="master">
            <el-input v-model="form.master" placeholder="请输入主持法师" />
          </el-form-item>
          <el-form-item label="开始时间" prop="startTime">
            <el-date-picker
              v-model="form.startTime"
              type="datetime"
              placeholder="选择开始时间"
              style="width: 100%"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DDTHH:mm:ss"
            />
          </el-form-item>
          <el-form-item label="结束时间" prop="endTime">
            <el-date-picker
              v-model="form.endTime"
              type="datetime"
              placeholder="选择结束时间"
              style="width: 100%"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DDTHH:mm:ss"
            />
          </el-form-item>
          <el-form-item label="最大人数" prop="maxParticipants">
            <el-input-number v-model="form.maxParticipants" :min="0" />
          </el-form-item>
          <el-form-item label="地点" prop="location">
            <el-input v-model="form.location" placeholder="请输入地点" />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="form.status" placeholder="请选择状态">
              <el-option label="报名中" value="报名中" />
              <el-option label="即将开始" value="即将开始" />
              <el-option label="进行中" value="进行中" />
              <el-option label="已完成" value="已完成" />
              <el-option label="已取消" value="已取消" />
            </el-select>
          </el-form-item>
          <el-form-item label="描述" prop="description">
            <el-input
              v-model="form.description"
              type="textarea"
              rows="3"
              placeholder="请输入法会描述"
            />
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
import Sidebar from "../components/Sidebar.vue";
import { getRituals, createRitual, updateRitual } from "../api";
import { ElMessage } from "element-plus";

const dateRange = ref("");
const ritualData = ref([]);
const loading = ref(false);

const dialogVisible = ref(false);
const dialogType = ref("create"); // 'create', 'edit', 'view'
const submitting = ref(false);
const formRef = ref(null);

const form = reactive({
  id: null,
  name: "",
  master: "",
  startTime: "",
  endTime: "",
  maxParticipants: 100,
  location: "",
  status: "报名中",
  description: "",
});

const rules = {
  name: [{ required: true, message: "请输入法会名称", trigger: "blur" }],
  master: [{ required: true, message: "请输入主持法师", trigger: "blur" }],
  startTime: [{ required: true, message: "请选择开始时间", trigger: "change" }],
  status: [{ required: true, message: "请选择状态", trigger: "change" }],
};

const dialogTitle = computed(() => {
  if (dialogType.value === "create") return "新建法会";
  if (dialogType.value === "edit") return "编辑法会";
  return "查看法会详情";
});

const fetchRituals = async () => {
  loading.value = true;
  try {
    const params = {
      page: 0,
      size: 100,
    };

    if (dateRange.value && dateRange.value.length === 2) {
      params.startDate = dateRange.value[0].toISOString();
      params.endDate = dateRange.value[1].toISOString();
    }

    const res = await getRituals(params);

    ritualData.value = res.content.map((r) => ({
      ...r,
      startTime: r.startTime
        ? r.startTime.replace("T", " ").substring(0, 16)
        : "",
    }));
  } catch (error) {
    console.error("Failed to fetch rituals", error);
    ElMessage.error("获取法会列表失败");
  } finally {
    loading.value = false;
  }
};

const getStatusType = (status) => {
  const typeMap = {
    即将开始: "warning",
    报名中: "success",
    已完成: "info",
    已取消: "danger",
    进行中: "primary",
  };
  return typeMap[status] || "info";
};

const resetForm = () => {
  if (formRef.value) formRef.value.resetFields();
  form.id = null;
  form.name = "";
  form.master = "";
  form.startTime = "";
  form.endTime = "";
  form.maxParticipants = 100;
  form.location = "大雄宝殿";
  form.status = "报名中";
  form.description = "";
};

const handleCreate = () => {
  dialogType.value = "create";
  resetForm();
  dialogVisible.value = true;
};

const handleEdit = (row) => {
  dialogType.value = "edit";
  // Copy properties to form
  form.id = row.id;
  form.name = row.name;
  form.master = row.master;
  // Ensure ISO format for datetime picker
  form.startTime = row.startTime.includes("T")
    ? row.startTime
    : row.startTime.replace(" ", "T") + ":00";
  form.endTime = row.endTime;
  form.maxParticipants = row.maxParticipants;
  form.location = row.location;
  form.status = row.status;
  form.description = row.description;

  dialogVisible.value = true;
};

const handleView = (row) => {
  dialogType.value = "view";
  form.id = row.id;
  form.name = row.name;
  form.master = row.master;
  form.startTime = row.startTime.includes("T")
    ? row.startTime
    : row.startTime.replace(" ", "T") + ":00";
  form.endTime = row.endTime;
  form.maxParticipants = row.maxParticipants;
  form.location = row.location;
  form.status = row.status;
  form.description = row.description;

  dialogVisible.value = true;
};

const handleCancel = async (row) => {
  try {
    // We need to fetch the full object first if row is missing fields, but row seems to map from API response.
    // The API update expects a Ritual object. Partial string date might be an issue if we send back '2023-01-01 10:00'.
    // Let's rely on the fact that we can send just the status if we used PATCH, but here we use PUT.
    // So we need valid object. Ideally we get it by ID first or use the row if it's complete.
    // Row has formatted 'startTime'. We need to Convert it back.
    const originalStartTime = row.startTime.replace(" ", "T") + ":00";
    await updateRitual(row.id, {
      ...row,
      startTime: originalStartTime,
      status: "已取消",
    });
    ElMessage.success("已取消法会");
    fetchRituals();
  } catch (error) {
    console.error(error);
    ElMessage.error("取消失败");
  }
};

const submitForm = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true;
      try {
        if (dialogType.value === "create") {
          await createRitual(form);
          ElMessage.success("新建成功");
        } else {
          await updateRitual(form.id, form);
          ElMessage.success("更新成功");
        }
        dialogVisible.value = false;
        fetchRituals();
      } catch (error) {
        console.error(error);
        ElMessage.error(
          dialogType.value === "create" ? "新建失败" : "更新失败",
        );
      } finally {
        submitting.value = false;
      }
    }
  });
};

watch(dateRange, () => {
  fetchRituals();
});

onMounted(() => {
  fetchRituals();
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
