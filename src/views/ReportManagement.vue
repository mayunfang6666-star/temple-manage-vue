<template>
  <div class="page-layout">
    <Sidebar />

    <div class="main-content">
      <div class="page-header">
        <h2 class="page-title">数据报表</h2>
        <el-breadcrumb separator="/">
          <el-breadcrumb-item>首页</el-breadcrumb-item>
          <el-breadcrumb-item>数据报表</el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <div class="charts-container">
        <!-- 善款趋势图 -->
        <div class="chart-card large">
          <div class="section-header">
            <h3 class="section-title">年度善款趋势</h3>
            <div class="chart-controls">
              <el-select
                v-model="years.selected"
                size="small"
                style="width: 100px"
              >
                <el-option label="2025" value="2025" />
                <el-option label="2024" value="2024" />
              </el-select>
            </div>
          </div>
          <div ref="donationChartRef" class="chart-instance"></div>
        </div>

        <!-- 法会类型分布 -->
        <div class="chart-card">
          <div class="section-header">
            <h3 class="section-title">法会类型分布</h3>
          </div>
          <div ref="ritualChartRef" class="chart-instance"></div>
        </div>

        <!-- 信徒增长统计 -->
        <div class="chart-card">
          <div class="section-header">
            <h3 class="section-title">信徒增长统计</h3>
          </div>
          <div ref="userChartRef" class="chart-instance"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";
import Sidebar from "../components/Sidebar.vue";
import * as echarts from "echarts";
import {
  getDonationReports,
  getRitualReports,
  getUserGrowthReports,
} from "../api";

// 图表引用
const donationChartRef = ref(null);
const ritualChartRef = ref(null);
const userChartRef = ref(null);

// 图表实例
let donationChart = null;
let ritualChart = null;
let userChart = null;

// 数据控制
const years = ref({ selected: "2026" });

// 禅意配色
const colors = {
  sandalwood: "#6B4423",
  bronze: "#B8860B",
  lightBronze: "#DAA520",
  green: "#2F4F4F",
  jade: "#7CB342",
  gray: "#A8A8A8",
};

// 颜色映射辅助函数
const getColorForType = (type) => {
  if (type.includes("祈福")) return colors.bronze;
  if (type.includes("超度")) return colors.sandalwood;
  if (type.includes("放生")) return colors.green;
  if (type.includes("讲经") || type.includes("禅修")) return colors.jade;
  return colors.gray; // Default
};

// 1. 渲染善款趋势图
const renderDonationChart = (xData, yData) => {
  if (donationChartRef.value) {
    if (!donationChart) donationChart = echarts.init(donationChartRef.value);

    // 如果没有数据，给一些默认空值防止报错
    if (!xData || xData.length === 0) {
      xData = ["无数据"];
      yData = [0];
    }

    donationChart.setOption({
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderColor: colors.bronze,
        textStyle: { fontFamily: "Noto Serif SC", color: colors.sandalwood },
      },
      grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: xData,
        axisLine: { lineStyle: { color: colors.sandalwood } },
        axisLabel: { fontFamily: "Noto Serif SC" },
      },
      yAxis: {
        type: "value",
        axisLine: { show: false },
        splitLine: { lineStyle: { type: "dashed", color: "#E0E0E0" } },
        axisLabel: { fontFamily: "Noto Serif SC", color: colors.sandalwood },
      },
      series: [
        {
          name: "善款金额",
          type: "line",
          smooth: true,
          symbol: "emptyCircle",
          symbolSize: 8,
          itemStyle: { color: colors.bronze, borderWidth: 2 },
          lineStyle: { width: 3, color: colors.bronze },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "rgba(184, 134, 11, 0.3)" },
              { offset: 1, color: "rgba(184, 134, 11, 0.05)" },
            ]),
          },
          data: yData,
        },
      ],
    });
  }
};

// 2. 渲染法会类型分布图
const renderRitualChart = (data) => {
  if (ritualChartRef.value) {
    if (!ritualChart) ritualChart = echarts.init(ritualChartRef.value);

    ritualChart.setOption({
      tooltip: {
        trigger: "item",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        textStyle: { fontFamily: "Noto Serif SC" },
      },
      legend: {
        bottom: "0%",
        itemWidth: 10,
        itemHeight: 10,
        textStyle: { fontFamily: "Noto Serif SC", color: colors.sandalwood },
      },
      series: [
        {
          name: "法会类型",
          type: "pie",
          radius: ["40%", "70%"],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 5,
            borderColor: "#fff",
            borderWidth: 2,
          },
          label: { show: false },
          labelLine: { show: false },
          data: data,
        },
      ],
    });
  }
};

// 3. 渲染信徒增长图
const renderUserChart = (xData, yData) => {
  if (userChartRef.value) {
    if (!userChart) userChart = echarts.init(userChartRef.value);

    userChart.setOption({
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        textStyle: { fontFamily: "Noto Serif SC" },
      },
      grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
      xAxis: {
        type: "category",
        data: xData,
        axisLine: { lineStyle: { color: colors.sandalwood } },
        axisLabel: { fontFamily: "Noto Serif SC" },
      },
      yAxis: {
        type: "value",
        splitLine: { lineStyle: { type: "dashed", color: "#E0E0E0" } },
        axisLabel: { fontFamily: "Noto Serif SC" },
      },
      series: [
        {
          name: "新增信徒",
          type: "bar",
          barWidth: "40%",
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: colors.green },
              { offset: 1, color: "rgba(47, 79, 79, 0.5)" },
            ]),
            borderRadius: [4, 4, 0, 0],
          },
          data: yData,
        },
      ],
    });
  }
};

// 获取所有数据
const fetchData = async () => {
  try {
    // 1. 善款统计
    const donationRes = await getDonationReports(years.value.selected);
    const monthMap = {
      "01": "一月",
      "02": "二月",
      "03": "三月",
      "04": "四月",
      "05": "五月",
      "06": "六月",
      "07": "七月",
      "08": "八月",
      "09": "九月",
      10: "十月",
      11: "十一月",
      12: "十二月",
    };
    const donationX = [];
    const donationY = [];
    if (donationRes && Array.isArray(donationRes)) {
      donationRes.forEach((item) => {
        const m = item.month.split("-")[1]; // "2026-01" -> "01"
        donationX.push(monthMap[m] || m);
        donationY.push(item.amount);
      });
    }
    renderDonationChart(donationX, donationY);

    // 2. 法会统计
    const ritualRes = await getRitualReports();
    const pieData = ritualRes.map((item) => ({
      value: item.count,
      name: item.type,
      itemStyle: { color: getColorForType(item.type) },
    }));
    renderRitualChart(pieData);

    // 3. 用户增长
    const userRes = await getUserGrowthReports();
    const userX = userRes.map((d) => d.period);
    const userY = userRes.map((d) => d.count);
    renderUserChart(userX, userY);
  } catch (error) {
    console.error("Failed to fetch report data:", error);
  }
};

// 监听年份变化
watch(
  () => years.value.selected,
  () => {
    fetchData();
  },
);

const handleResize = () => {
  donationChart?.resize();
  ritualChart?.resize();
  userChart?.resize();
};

onMounted(() => {
  fetchData();
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  donationChart?.dispose();
  ritualChart?.dispose();
  userChart?.dispose();
});
</script>

<style scoped>
/* 禅意布局 */
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
  margin-left: 40px; /* 修正margin与Sidebar保持一致 */
  flex: 1;
  padding: 3rem 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  position: relative;
  z-index: 1;
}

/* 头部样式 */
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

/* 报表容器 */
.charts-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
}

.chart-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border: 1px solid var(--zen-mist-gray);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px var(--zen-shadow);
  transition: all 0.3s ease;
  min-height: 400px;
  display: flex;
  flex-direction: column;
}

.chart-card.large {
  grid-column: span 2;
}

.chart-card:hover {
  box-shadow: 0 8px 30px rgba(107, 68, 35, 0.15);
  transform: translateY(-2px);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 0.8rem;
  border-bottom: 1px solid rgba(184, 134, 11, 0.2);
}

.section-title {
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--zen-ink-green);
  margin: 0;
  display: flex;
  align-items: center;
}

.section-title::before {
  content: "◆";
  margin-right: 0.6rem;
  color: var(--zen-bronze);
  font-size: 0.8rem;
}

.chart-instance {
  flex: 1;
  width: 100%;
  min-height: 300px;
}

/* 面包屑复用样式 */
:deep(.el-breadcrumb) {
  font-family: "Noto Serif SC", serif;
}

:deep(.el-breadcrumb__item) {
  color: var(--zen-ink-green);
}

:deep(.el-breadcrumb__separator) {
  color: var(--zen-bronze);
}

/* 响应式 */
@media (max-width: 1024px) {
  .charts-container {
    grid-template-columns: 1fr;
  }

  .chart-card.large {
    grid-column: span 1;
  }
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0; /* 移动端适配 */
    padding: 2rem 1rem;
  }
}
</style>
