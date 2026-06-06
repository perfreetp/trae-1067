<template>
  <div class="app-container">
    <header class="app-header">
      <h1>灌区配水管理系统</h1>
      <div class="header-info">
        <span class="current-date">{{ currentDate }}</span>
        <span class="season-badge">{{ currentSeason }}</span>
      </div>
    </header>
    
    <nav class="app-nav">
      <router-link 
        v-for="tab in tabs" 
        :key="tab.id"
        :to="tab.path"
        class="nav-tab"
        active-class="active"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-label">{{ tab.label }}</span>
      </router-link>
    </nav>
    
    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const tabs = [
  { id: 'overview', path: '/', label: '水源总览', icon: '💧' },
  { id: 'application', path: '/application', label: '用水申报', icon: '📝' },
  { id: 'plan', path: '/plan', label: '配水计划', icon: '📋' },
  { id: 'gate', path: '/gate', label: '闸门操作', icon: '🚪' },
  { id: 'rotation', path: '/rotation', label: '轮灌排班', icon: '🔄' },
  { id: 'feedback', path: '/feedback', label: '现场反馈', icon: '📢' },
  { id: 'statistics', path: '/statistics', label: '统计复盘', icon: '📊' }
]

const currentDate = computed(() => {
  return new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
})

const currentSeason = computed(() => {
  const month = new Date().getMonth() + 1
  if (month >= 3 && month <= 5) return '春灌期'
  if (month >= 6 && month <= 8) return '夏灌期'
  return '非灌溉期'
})
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f0f4f8;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 32px;
  background: linear-gradient(135deg, #1e88e5 0%, #1565c0 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.app-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.current-date {
  font-size: 14px;
  opacity: 0.9;
}

.season-badge {
  padding: 4px 12px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
}

.app-nav {
  display: flex;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 0 16px;
  overflow-x: auto;
}

.nav-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 20px;
  text-decoration: none;
  color: #546e7a;
  font-size: 14px;
  font-weight: 500;
  border-bottom: 3px solid transparent;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.nav-tab:hover {
  color: #1e88e5;
  background: #e3f2fd;
}

.nav-tab.active {
  color: #1e88e5;
  border-bottom-color: #1e88e5;
  background: #f5fafd;
}

.tab-icon {
  font-size: 18px;
}

.app-main {
  flex: 1;
  overflow: auto;
  padding: 24px;
}
</style>
