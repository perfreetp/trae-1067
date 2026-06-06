<template>
  <div class="overview-container">
    <div class="grid-4">
      <div class="stat-card">
        <div class="stat-value">{{ store.totalStorage.toLocaleString() }}</div>
        <div class="stat-label">总蓄水量 (万m³)</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ store.totalCapacity.toLocaleString() }}</div>
        <div class="stat-label">总库容 (万m³)</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ totalInflowRate.toFixed(1) }}</div>
        <div class="stat-label">总入库流量 (m³/s)</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ totalOutflowRate.toFixed(1) }}</div>
        <div class="stat-label">总出库流量 (m³/s)</div>
      </div>
    </div>

    <div class="card">
      <h3 class="card-title">水库水位监测</h3>
      <div class="grid-2">
        <div v-for="source in store.waterSources" :key="source.id" class="reservoir-card">
          <div class="reservoir-header">
            <h4>{{ source.name }}</h4>
            <span class="badge badge-info">水库</span>
          </div>
          <div class="water-level-visual">
            <div class="level-bar">
              <div 
                class="level-fill" 
                :style="{ height: (source.currentLevel / source.maxLevel * 100) + '%' }"
              ></div>
            </div>
            <div class="level-info">
              <div class="level-item">
                <span class="label">当前水位</span>
                <span class="value">{{ source.currentLevel }} m</span>
              </div>
              <div class="level-item">
                <span class="label">最高水位</span>
                <span class="value">{{ source.maxLevel }} m</span>
              </div>
              <div class="level-item">
                <span class="label">蓄水率</span>
                <span class="value">{{ ((source.storage / source.capacity) * 100).toFixed(1) }}%</span>
              </div>
              <div class="level-item">
                <span class="label">入库流量</span>
                <span class="value">{{ source.inflowRate }} m³/s</span>
              </div>
              <div class="level-item">
                <span class="label">出库流量</span>
                <span class="value">{{ source.outflowRate }} m³/s</span>
              </div>
            </div>
          </div>
          <div class="update-time">更新时间: {{ source.lastUpdate }}</div>
        </div>
      </div>
    </div>

    <div class="card">
      <h3 class="card-title">干支渠水位流量</h3>
      <table>
        <thead>
          <tr>
            <th>渠道名称</th>
            <th>级别</th>
            <th>水位 (m)</th>
            <th>流量 (m³/s)</th>
            <th>最大流量 (m³/s)</th>
            <th>负载率</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="canal in store.canals" :key="canal.id">
            <td><strong>{{ canal.name }}</strong></td>
            <td>
              <span v-if="canal.level === 'main'" class="badge badge-info">干渠</span>
              <span v-else-if="canal.level === 'branch'" class="badge badge-warning">支渠</span>
              <span v-else class="badge">斗渠</span>
            </td>
            <td>{{ canal.waterLevel }}</td>
            <td>{{ canal.flowRate }}</td>
            <td>{{ canal.maxFlowRate }}</td>
            <td>
              <div class="progress-bar">
                <div 
                  class="progress-fill"
                  :class="{
                    'progress-normal': (canal.flowRate / canal.maxFlowRate) < 0.7,
                    'progress-warning': (canal.flowRate / canal.maxFlowRate) >= 0.7 && (canal.flowRate / canal.maxFlowRate) < 0.9,
                    'progress-danger': (canal.flowRate / canal.maxFlowRate) >= 0.9
                  }"
                  :style="{ width: (canal.flowRate / canal.maxFlowRate * 100) + '%' }"
                ></div>
              </div>
              <span class="progress-text">{{ ((canal.flowRate / canal.maxFlowRate) * 100).toFixed(1) }}%</span>
            </td>
            <td>
              <span v-if="canal.status === 'normal'" class="badge badge-success">正常</span>
              <span v-else-if="canal.status === 'warning'" class="badge badge-warning">预警</span>
              <span v-else class="badge badge-danger">危险</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useIrrigationStore } from '@/stores/irrigation'

const store = useIrrigationStore()

const totalInflowRate = computed(() => {
  return store.waterSources.reduce((sum, s) => sum + s.inflowRate, 0)
})

const totalOutflowRate = computed(() => {
  return store.waterSources.reduce((sum, s) => sum + s.outflowRate, 0)
})
</script>

<style scoped>
.reservoir-card {
  background: #f8fafc;
  border-radius: 8px;
  padding: 20px;
}

.reservoir-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.reservoir-header h4 {
  margin: 0;
  font-size: 18px;
  color: #1a237e;
}

.water-level-visual {
  display: flex;
  gap: 24px;
  align-items: stretch;
}

.level-bar {
  width: 40px;
  height: 160px;
  background: #e0e0e0;
  border-radius: 20px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
}

.level-fill {
  width: 100%;
  background: linear-gradient(to top, #1565c0, #42a5f5);
  border-radius: 20px;
  transition: height 0.5s ease;
}

.level-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.level-item {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
}

.level-item .label {
  color: #78909c;
  font-size: 13px;
}

.level-item .value {
  font-weight: 600;
  color: #37474f;
}

.update-time {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e0e0e0;
  font-size: 12px;
  color: #90a4ae;
}

.progress-bar {
  width: 100px;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  display: inline-block;
  vertical-align: middle;
  margin-right: 8px;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-normal {
  background: #43a047;
}

.progress-warning {
  background: #fb8c00;
}

.progress-danger {
  background: #e53935;
}

.progress-text {
  font-size: 13px;
  font-weight: 500;
  vertical-align: middle;
}
</style>
