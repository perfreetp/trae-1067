<template>
  <div class="statistics-container">
    <div class="grid-4">
      <div class="stat-card">
        <div class="stat-value">{{ totalPlanned.toLocaleString() }}</div>
        <div class="stat-label">计划配水量 (m³)</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ totalActual.toLocaleString() }}</div>
        <div class="stat-label">实际配水量 (m³)</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ avgArrivalRate }}%</div>
        <div class="stat-label">平均到水率</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ totalWaterSaving.toLocaleString() }}</div>
        <div class="stat-label">节水量 (m³)</div>
      </div>
    </div>

    <div class="card">
      <h3 class="card-title">计划 vs 实际流量对比</h3>
      <div class="chart-container">
        <div class="bar-chart">
          <div v-for="(item, index) in comparisonData" :key="index" class="bar-item">
            <div class="bar-label">{{ item.date }}</div>
            <div class="bar-group">
              <div class="bar-wrapper">
                <div 
                  class="bar bar-planned" 
                  :style="{ height: (item.planned / maxValue * 100) + '%' }"
                >
                  <span class="bar-value">{{ item.planned }}</span>
                </div>
                <span class="bar-name">计划</span>
              </div>
              <div class="bar-wrapper">
                <div 
                  class="bar bar-actual" 
                  :style="{ height: (item.actual / maxValue * 100) + '%' }"
                >
                  <span class="bar-value">{{ item.actual }}</span>
                </div>
                <span class="bar-name">实际</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="chart-legend">
        <span><span class="legend-color planned"></span> 计划配水量</span>
        <span><span class="legend-color actual"></span> 实际配水量</span>
      </div>
    </div>

    <div class="card">
      <h3 class="card-title">村组用水统计表</h3>
      <table>
        <thead>
          <tr>
            <th>村组名称</th>
            <th>种植面积 (亩)</th>
            <th>计划用水 (m³)</th>
            <th>实际用水 (m³)</th>
            <th>到水率</th>
            <th>超时放水 (分钟)</th>
            <th>节水量 (m³)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="report in waterUsageReports" :key="report.villageName">
            <td><strong>{{ report.villageName }}</strong></td>
            <td>{{ report.cropArea }}</td>
            <td>{{ report.plannedWater.toLocaleString() }}</td>
            <td>{{ report.actualWater.toLocaleString() }}</td>
            <td>
              <span 
                class="badge"
                :class="{
                  'badge-success': report.arrivalRate >= 90,
                  'badge-warning': report.arrivalRate >= 70 && report.arrivalRate < 90,
                  'badge-danger': report.arrivalRate < 70
                }"
              >
                {{ report.arrivalRate }}%
              </span>
            </td>
            <td>
              <span :class="{ 'text-danger': report.overTimeMinutes > 0 }">
                {{ report.overTimeMinutes }}
              </span>
            </td>
            <td>
              <span :class="{ 'text-success': report.waterSaving > 0 }">
                {{ report.waterSaving > 0 ? '+' : '' }}{{ report.waterSaving }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="grid-2">
      <div class="card">
        <h3 class="card-title">节水建议</h3>
        <div class="suggestion-list">
          <div v-for="(suggestion, index) in suggestions" :key="index" class="suggestion-item">
            <div class="suggestion-icon">{{ suggestion.icon }}</div>
            <div class="suggestion-content">
              <h4>{{ suggestion.title }}</h4>
              <p>{{ suggestion.content }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <h3 class="card-title">关键指标</h3>
        <div class="metrics-list">
          <div class="metric-item">
            <div class="metric-info">
              <span class="metric-label">总灌溉面积</span>
              <span class="metric-value">{{ totalCropArea }} 亩</span>
            </div>
            <div class="metric-bar">
              <div class="metric-fill" style="width: 85%; background: #43a047;"></div>
            </div>
          </div>
          <div class="metric-item">
            <div class="metric-info">
              <span class="metric-label">渠道利用率</span>
              <span class="metric-value">{{ canalUtilization }}%</span>
            </div>
            <div class="metric-bar">
              <div class="metric-fill" style="width: 72%; background: #1e88e5;"></div>
            </div>
          </div>
          <div class="metric-item">
            <div class="metric-info">
              <span class="metric-label">问题响应及时率</span>
              <span class="metric-value">{{ responseRate }}%</span>
            </div>
            <div class="metric-bar">
              <div class="metric-fill" style="width: 95%; background: #43a047;"></div>
            </div>
          </div>
          <div class="metric-item">
            <div class="metric-info">
              <span class="metric-label">轮灌完成率</span>
              <span class="metric-value">{{ rotationCompletion }}%</span>
            </div>
            <div class="metric-bar">
              <div class="metric-fill" style="width: 88%; background: #fb8c00;"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div style="text-align: center; margin-top: 24px;">
      <button class="btn btn-primary" @click="exportReport">📊 导出统计报表</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useIrrigationStore } from '@/stores/irrigation'

const store = useIrrigationStore()

const comparisonData = computed(() => {
  return [
    { date: '6/10', planned: 8500, actual: 8200 },
    { date: '6/11', planned: 9200, actual: 8800 },
    { date: '6/12', planned: 7800, actual: 7500 },
    { date: '6/13', planned: 10500, actual: 10200 },
    { date: '6/14', planned: 9800, actual: 9600 },
    { date: '6/15', planned: 11000, actual: 10500 },
    { date: '6/16', planned: 12000, actual: 0 }
  ]
})

const maxValue = computed(() => {
  return Math.max(...comparisonData.value.flatMap(d => [d.planned, d.actual]))
})

const totalPlanned = computed(() => {
  return store.allocations.reduce((sum, a) => sum + a.allocatedAmount, 0)
})

const totalActual = computed(() => {
  return Math.round(totalPlanned.value * 0.92)
})

const avgArrivalRate = computed(() => {
  return 92
})

const totalWaterSaving = computed(() => {
  return 1250
})

const waterUsageReports = computed(() => {
  return store.applications.map(app => ({
    villageName: app.villageName,
    cropArea: app.cropArea,
    plannedWater: app.requiredWaterAmount,
    actualWater: Math.round(app.requiredWaterAmount * (0.85 + Math.random() * 0.15)),
    arrivalRate: Math.round(85 + Math.random() * 15),
    overTimeMinutes: Math.floor(Math.random() * 60),
    waterSaving: Math.round(Math.random() * 500 - 100)
  }))
})

const suggestions = computed(() => [
  {
    icon: '💡',
    title: '优化配水时段',
    content: '建议和平村、团结村调整为夜间灌溉，利用低用电时段降低成本，预计可节水15%。'
  },
  {
    icon: '🔧',
    title: '渠道维护建议',
    content: '西干渠、南干渠渗漏率较高，建议优先进行渠道防渗处理，年可节水约8万m³。'
  },
  {
    icon: '📋',
    title: '轮灌周期优化',
    content: '根据作物生长周期，建议将水稻田轮灌周期从7天调整为5天，提高用水效率。'
  }
])

const totalCropArea = computed(() => {
  return store.applications.reduce((sum, a) => sum + a.cropArea, 0)
})

const canalUtilization = computed(() => 72)
const responseRate = computed(() => 95)
const rotationCompletion = computed(() => 88)

const exportReport = () => {
  alert('统计报表已导出！（模拟功能）')
}
</script>

<style scoped>
.text-danger {
  color: #e53935;
  font-weight: 600;
}

.text-success {
  color: #43a047;
  font-weight: 600;
}

.chart-container {
  padding: 20px 0;
  height: 300px;
}

.bar-chart {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 250px;
  padding: 0 20px;
}

.bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 80px;
}

.bar-label {
  font-size: 12px;
  color: #78909c;
  margin-bottom: 8px;
}

.bar-group {
  display: flex;
  gap: 4px;
  align-items: flex-end;
  height: 200px;
}

.bar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 32px;
}

.bar {
  width: 100%;
  border-radius: 4px 4px 0 0;
  position: relative;
  transition: height 0.5s ease;
  min-height: 4px;
}

.bar-planned {
  background: linear-gradient(to top, #1565c0, #42a5f5);
}

.bar-actual {
  background: linear-gradient(to top, #2e7d32, #66bb6a);
}

.bar-value {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
  font-weight: 600;
  color: #37474f;
  white-space: nowrap;
}

.bar-name {
  font-size: 11px;
  color: #90a4ae;
  margin-top: 4px;
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 16px;
  font-size: 13px;
  color: #546e7a;
}

.legend-color {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 2px;
  margin-right: 6px;
  vertical-align: middle;
}

.legend-color.planned {
  background: #42a5f5;
}

.legend-color.actual {
  background: #66bb6a;
}

.suggestion-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.suggestion-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
}

.suggestion-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.suggestion-content h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #1a237e;
}

.suggestion-content p {
  margin: 0;
  font-size: 13px;
  color: #546e7a;
  line-height: 1.5;
}

.metrics-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.metric-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.metric-info {
  display: flex;
  justify-content: space-between;
}

.metric-label {
  font-size: 14px;
  color: #546e7a;
}

.metric-value {
  font-size: 14px;
  font-weight: 600;
  color: #1a237e;
}

.metric-bar {
  width: 100%;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.metric-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}
</style>
