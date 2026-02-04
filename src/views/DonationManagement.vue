<template>
  <div class="page-layout">
    <Sidebar />

    <div class="main-content">
      <div class="page-header">
        <h2 class="page-title">功德管理</h2>
        <el-breadcrumb separator="/">
          <el-breadcrumb-item>首页</el-breadcrumb-item>
          <el-breadcrumb-item>功德管理</el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <div class="stat-grid">
        <StatCard
          title="累计功德总额"
          :value="'¥ ' + (stats.monthlyDonationAmount * 12).toLocaleString()"
          icon-color="#409EFF"
        />
        <StatCard
          title="本月功德总额"
          :value="'¥ ' + stats.monthlyDonationAmount.toLocaleString()"
          icon-color="#E6A23C"
        />
        <StatCard
          title="本月捐赠人次"
          :value="stats.monthlyCount"
          icon-color="#67C23A"
        />
        <StatCard
          title="待处理登记"
          :value="stats.pendingCount"
          icon-color="#F56C6C"
        />
      </div>

      <div class="table-container">
        <div class="table-header">
          <h3 class="table-title">功德登记记录</h3>
          <el-button type="primary" @click="handleCreate">新增登记</el-button>
        </div>

        <el-table :data="donationData" style="width: 100%" v-loading="loading">
          <el-table-column prop="donor" label="捐赠人" min-width="150" />
          <el-table-column prop="project" label="功德项目" min-width="200" />
          <el-table-column label="金额" width="150">
            <template #default="{ row }">
              <span class="amount-text"
                >¥ {{ row.amount ? row.amount.toLocaleString() : "0" }}</span
              >
            </template>
          </el-table-column>
          <el-table-column
            prop="registrationTime"
            label="登记时间"
            width="180"
          />
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
                title="确定删除该记录吗?"
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

      <!-- Donation Dialog -->
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
          label-width="100px"
          :disabled="dialogType === 'view'"
        >
          <el-form-item label="捐赠人" prop="donor">
            <el-input v-model="form.donor" placeholder="请输入捐赠人姓名" />
          </el-form-item>
          <el-form-item label="功德项目" prop="project">
            <el-select v-model="form.project" placeholder="请选择项目">
              <el-option label="供斋" value="供斋" />
              <el-option label="供灯" value="供灯" />
              <el-option label="香火" value="香火" />
              <el-option label="建寺" value="建寺" />
              <el-option label="放生" value="放生" />
            </el-select>
          </el-form-item>
          <el-form-item label="金额" prop="amount">
            <el-input-number
              v-model="form.amount"
              :min="0"
              :precision="2"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="支付方式" prop="paymentMethod">
            <el-select
              v-model="form.paymentMethod"
              placeholder="请选择支付方式"
            >
              <el-option label="微信支付" value="微信支付" />
              <el-option label="支付宝" value="支付宝" />
              <el-option label="现金" value="现金" />
              <el-option label="银行转账" value="银行转账" />
            </el-select>
          </el-form-item>
          <el-form-item label="登记时间" prop="registrationTime">
            <el-date-picker
              v-model="form.registrationTime"
              type="datetime"
              placeholder="选择登记时间"
              style="width: 100%"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DDTHH:mm:ss"
            />
          </el-form-item>
          <el-form-item label="联系电话" prop="phone">
            <el-input v-model="form.phone" placeholder="请输入联系电话" />
          </el-form-item>
          <el-form-item label="备注" prop="notes">
            <el-input
              v-model="form.notes"
              type="textarea"
              placeholder="备注信息"
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
import { ref, onMounted, reactive, computed } from "vue";
import Sidebar from "../components/Sidebar.vue";
import StatCard from "../components/StatCard.vue";
import {
  getDonations,
  getDashboardStats,
  createDonation,
  updateDonation,
  deleteDonation,
} from "../api";
import { ElMessage } from "element-plus";

const donationData = ref([]);
const loading = ref(false);
const stats = ref({
  monthlyDonationAmount: 0,
  monthlyCount: 0,
  pendingCount: 0,
});

const dialogVisible = ref(false);
const dialogType = ref("create"); // 'create', 'edit', 'view'
const submitting = ref(false);
const formRef = ref(null);

const form = reactive({
  id: null,
  donor: "",
  project: "",
  amount: 0,
  paymentMethod: "微信支付",
  registrationTime: "",
  phone: "",
  notes: "",
});

const rules = {
  donor: [{ required: true, message: "请输入捐赠人", trigger: "blur" }],
  project: [{ required: true, message: "请选择项目", trigger: "change" }],
  amount: [{ required: true, message: "请输入金额", trigger: "blur" }],
  registrationTime: [
    { required: true, message: "请选择时间", trigger: "change" },
  ],
};

const dialogTitle = computed(() => {
  if (dialogType.value === "create") return "新增登记";
  if (dialogType.value === "edit") return "编辑登记";
  return "查看登记详情";
});

const fetchDonations = async () => {
  loading.value = true;
  try {
    const res = await getDonations({
      page: 0,
      size: 100,
    });

    donationData.value = res.content.map((d) => ({
      ...d,
      registrationTime: d.registrationTime
        ? d.registrationTime.replace("T", " ").substring(0, 16)
        : "",
    }));

    // Update stats (reusing dashboard stats logic partially or separate endpoint)
    // For now we can fetch dashboard stats to get monthly total
    const dashStats = await getDashboardStats();
    stats.value = {
      monthlyDonationAmount: dashStats.monthlyDonationAmount,
      monthlyCount: 156, // Mocked in backend for dashboard
      pendingCount: 3,
    };
  } catch (error) {
    console.error("Failed to fetch donations", error);
    ElMessage.error("获取功德记录失败");
  } finally {
    loading.value = false;
  }
};

const resetForm = () => {
  if (formRef.value) formRef.value.resetFields();
  form.id = null;
  form.donor = "";
  form.project = "供斋";
  form.amount = 100;
  form.paymentMethod = "微信支付";
  // Default to now
  const now = new Date();
  // format YYYY-MM-DDTHH:mm:ss for backend
  form.registrationTime = now.toISOString().slice(0, 19);
  form.phone = "";
  form.notes = "";
};

const handleCreate = () => {
  dialogType.value = "create";
  resetForm();
  dialogVisible.value = true;
};

const handleEdit = (row) => {
  dialogType.value = "edit";
  form.id = row.id;
  form.donor = row.donor;
  form.project = row.project;
  form.amount = row.amount;
  form.paymentMethod = row.paymentMethod;
  form.registrationTime = row.registrationTime.includes("T")
    ? row.registrationTime
    : row.registrationTime.replace(" ", "T") + ":00";
  form.phone = row.phone;
  form.notes = row.notes;
  dialogVisible.value = true;
};

const handleView = (row) => {
  dialogType.value = "view";
  form.id = row.id;
  form.donor = row.donor;
  form.project = row.project;
  form.amount = row.amount;
  form.paymentMethod = row.paymentMethod;
  form.registrationTime = row.registrationTime.includes("T")
    ? row.registrationTime
    : row.registrationTime.replace(" ", "T") + ":00";
  form.phone = row.phone;
  form.notes = row.notes;
  dialogVisible.value = true;
};

const handleDelete = async (row) => {
  try {
    await deleteDonation(row.id);
    ElMessage.success("删除成功");
    fetchDonations();
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
          await createDonation(form);
          ElMessage.success("登记成功");
        } else {
          await updateDonation(form.id, form);
          ElMessage.success("更新成功");
        }
        dialogVisible.value = false;
        fetchDonations();
      } catch (error) {
        console.error(error);
        ElMessage.error(
          dialogType.value === "create" ? "登记失败" : "更新失败",
        );
      } finally {
        submitting.value = false;
      }
    }
  });
};

onMounted(() => {
  fetchDonations();
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

.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 24px;
}

.table-container {
  background: var(--color-bg-white);
  border-radius: var(--radius-md);
  padding: 24px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.table-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.amount-text {
  color: var(--color-warning);
  font-weight: 600;
  font-size: 14px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
