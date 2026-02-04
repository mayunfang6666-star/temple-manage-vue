<template>
  <div class="page-layout">
    <Sidebar />

    <div class="main-content">
      <div class="page-header">
        <h2 class="page-title">数据总览</h2>
        <el-breadcrumb separator="/">
          <el-breadcrumb-item>首页</el-breadcrumb-item>
          <el-breadcrumb-item>数据总览</el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <div class="stat-grid">
        <StatCard
          title="僧众人数"
          :value="stats.monkCount"
          icon-color="#409EFF"
        />
        <StatCard
          title="本月法会"
          :value="stats.monthlyRitualCount"
          icon-color="#67C23A"
        />
        <StatCard
          title="本月功德"
          :value="'¥ ' + stats.monthlyDonationAmount.toLocaleString()"
          icon-color="#E6A23C"
        />
        <StatCard
          title="待办事项"
          :value="stats.pendingTasks"
          icon-color="#F56C6C"
        />
      </div>

      <div class="middle-section">
        <div class="ritual-schedule">
          <div class="section-header">
            <h3 class="section-title">近期法会安排</h3>
          </div>
          <el-table :data="ritualData" style="width: 100%">
            <el-table-column prop="name" label="法会名称" />
            <el-table-column prop="master" label="主持法师" />
            <el-table-column prop="time" label="开始时间" />
            <el-table-column prop="participants" label="参与人数" />
          </el-table>
        </div>

        <div class="merit-ranking">
          <div class="section-header">
            <h3 class="section-title">功德排行榜</h3>
          </div>
          <div class="ranking-list">
            <div
              v-for="(item, index) in meritRanking"
              :key="index"
              class="ranking-item"
            >
              <span class="rank-number">{{ index + 1 }}</span>
              <span class="rank-name">{{ item.name }}</span>
              <span class="rank-amount"
                >¥ {{ item.amount.toLocaleString() }}</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Sidebar from "../components/Sidebar.vue";
import StatCard from "../components/StatCard.vue";
import { getDashboardStats, getUpcomingRituals, getMeritRanking } from "../api";

const stats = ref({
  monkCount: 0,
  monthlyRitualCount: 0,
  monthlyDonationAmount: 0,
  pendingTasks: 0,
});

const ritualData = ref([]);
const meritRanking = ref([]);

const fetchData = async () => {
  try {
    const statsData = await getDashboardStats();
    stats.value = statsData;

    const rituals = await getUpcomingRituals();
    ritualData.value = rituals.map((r) => ({
      name: r.name,
      master: r.master,
      time: r.startTime.replace("T", " ").substring(0, 16),
      participants: r.participants,
    }));

    const ranking = await getMeritRanking();
    meritRanking.value = ranking;
  } catch (error) {
    console.error("Failed to fetch dashboard data", error);
  }
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
/* 禅意仪表板 */
.page-layout {
  display: flex;
  min-height: 100vh;
  background: var(--zen-paper-white);
  position: relative;
}

/* 背景装饰 */
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
  padding: 3rem 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  position: relative;
  z-index: 1;
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

/* 统计卡片网格 */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-top: 1rem;
}

/* 中间区域 */
.middle-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-top: 1rem;
}

/* 卡片样式 */
.ritual-schedule,
.merit-ranking {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border: 1px solid var(--zen-mist-gray);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 20px var(--zen-shadow);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.ritual-schedule:hover,
.merit-ranking:hover {
  box-shadow: 0 8px 30px rgba(107, 68, 35, 0.15);
  transform: translateY(-2px);
}

/* 卡片顶部装饰 */
.ritual-schedule::before,
.merit-ranking::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(
    to right,
    var(--zen-sandalwood),
    var(--zen-bronze),
    var(--zen-sandalwood)
  );
  opacity: 0.6;
}

.section-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--zen-mist-gray);
}

.section-title {
  font-size: 1.2rem;
  font-weight: 500;
  color: var(--zen-ink-green);
  margin: 0;
  letter-spacing: 0.1em;
  position: relative;
  display: inline-block;
}

.section-title::before {
  content: "◆";
  margin-right: 0.5rem;
  color: var(--zen-bronze);
  font-size: 0.8rem;
}

/* 功德排行榜 */
.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.2rem;
  border-radius: 8px;
  background: linear-gradient(
    135deg,
    rgba(245, 245, 220, 0.3),
    rgba(255, 255, 255, 0.5)
  );
  border: 1px solid rgba(184, 134, 11, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.ranking-item::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(
    to bottom,
    var(--zen-bronze),
    var(--zen-light-bronze)
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.ranking-item:hover {
  background: linear-gradient(
    135deg,
    rgba(245, 245, 220, 0.5),
    rgba(255, 255, 255, 0.7)
  );
  border-color: var(--zen-bronze);
  transform: translateX(4px);
}

.ranking-item:hover::before {
  opacity: 1;
}

.rank-number {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    var(--zen-sandalwood),
    var(--zen-light-sandalwood)
  );
  color: var(--zen-moon-white);
  border-radius: 50%;
  font-size: 0.9rem;
  font-weight: 600;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(107, 68, 35, 0.3);
}

/* 前三名特殊样式 */
.ranking-item:nth-child(1) .rank-number {
  background: linear-gradient(
    135deg,
    var(--zen-bronze),
    var(--zen-light-bronze)
  );
  box-shadow: 0 2px 12px rgba(184, 134, 11, 0.4);
}

.ranking-item:nth-child(2) .rank-number {
  background: linear-gradient(135deg, #c0c0c0, #e8e8e8);
}

.ranking-item:nth-child(3) .rank-number {
  background: linear-gradient(135deg, #cd7f32, #e6a85c);
}

.rank-name {
  flex: 1;
  color: var(--zen-ink-black);
  font-size: 1rem;
  font-weight: 400;
}

.rank-amount {
  color: var(--zen-bronze);
  font-size: 1rem;
  font-weight: 600;
  font-family: "Noto Serif SC", serif;
}

/* 表格样式覆盖 */
:deep(.el-table) {
  background: transparent;
  font-family: "Noto Serif SC", serif;
}

:deep(.el-table th.el-table__cell) {
  background: linear-gradient(
    135deg,
    var(--zen-sandalwood),
    var(--zen-light-sandalwood)
  );
  color: var(--zen-moon-white);
  font-weight: 500;
  border: none;
}

:deep(.el-table tr) {
  background: transparent;
}

:deep(.el-table td.el-table__cell) {
  border-bottom: 1px solid var(--zen-mist-gray);
  color: var(--zen-ink-black);
}

:deep(.el-table tbody tr:hover > td) {
  background: rgba(245, 245, 220, 0.3) !important;
}

/* 面包屑样式 */
:deep(.el-breadcrumb) {
  font-family: "Noto Serif SC", serif;
}

:deep(.el-breadcrumb__item) {
  color: var(--zen-ink-green);
}

:deep(.el-breadcrumb__separator) {
  color: var(--zen-bronze);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .stat-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .middle-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    padding: 2rem 1rem;
  }

  .stat-grid {
    grid-template-columns: 1fr;
  }

  .page-title {
    font-size: 1.5rem;
  }
}
</style>
