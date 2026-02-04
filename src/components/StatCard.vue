<template>
  <div class="stat-card">
    <div class="stat-icon" :style="{ background: iconColor }"></div>
    <div class="stat-content">
      <div class="stat-title">{{ title }}</div>
      <div class="stat-value">{{ value }}</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  value: {
    type: [String, Number],
    required: true,
  },
  iconColor: {
    type: String,
    default: "#409EFF",
  },
});
</script>

<style scoped>
/* 禅意统计卡片 */
.stat-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  border: 1px solid var(--zen-mist-gray);
  border-radius: 12px;
  padding: 1.8rem;
  display: flex;
  align-items: center;
  gap: 1.2rem;
  box-shadow: 0 4px 20px var(--zen-shadow);
  flex: 1;
  min-width: 0;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

/* 顶部装饰线 */
.stat-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(
    to right,
    transparent,
    var(--zen-bronze) 30%,
    var(--zen-bronze) 70%,
    transparent
  );
  opacity: 0.4;
  transition: opacity 0.3s ease;
}

.stat-card:hover {
  box-shadow: 0 8px 30px rgba(107, 68, 35, 0.15);
  transform: translateY(-4px);
  border-color: var(--zen-bronze);
}

.stat-card:hover::before {
  opacity: 0.8;
}

/* 图标样式 */
.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  flex-shrink: 0;
  position: relative;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.stat-card:hover .stat-icon {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

/* 图标装饰 */
.stat-icon::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 0;
  flex: 1;
}

.stat-title {
  font-size: 0.9rem;
  color: var(--zen-ink-green);
  font-weight: 400;
  letter-spacing: 0.05em;
  opacity: 0.9;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--zen-sandalwood);
  font-family: "Noto Serif SC", serif;
  letter-spacing: 0.02em;
}

/* 响应式 */
@media (max-width: 768px) {
  .stat-card {
    padding: 1.5rem;
  }

  .stat-icon {
    width: 48px;
    height: 48px;
  }

  .stat-value {
    font-size: 1.5rem;
  }
}
</style>
