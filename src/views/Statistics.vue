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

const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

const comparisonData = computed(() => {
  const data = []
  const baseDate = new Date()
  baseDate.setDate(baseDate.getDate() - 6)
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(baseDate)
    date.setDate(date.getDate() + i)
    const dateStr = `${date.getMonth() + 1}/${date.getDate()}`
    
    const seed = date.getTime()
    const planned = 8000 + Math.round(seededRandom(seed) * 4000)
    const actual = i < 6 ? Math.round(planned * (0.88 + seededRandom(seed + 1) * 0.08)) : 0
    
    data.push({ date: dateStr, planned, actual })
  }
  return data
})

const maxValue = computed(() => {
  return Math.max(...comparisonData.value.flatMap(d => [d.planned, d.actual]))
})

const totalPlanned = computed(() => {
  if (store.allocations.length > 0) {
    return store.allocations.reduce((sum, a) => sum + a.allocatedAmount, 0)
  }
  return store.applications.reduce((sum, a) => sum + a.requiredWaterAmount, 0)
})

const totalActual = computed(() => {
  const completedCount = store.allocations.filter(a => a.status === 'completed').length
  if (completedCount > 0) {
    const completed = store.allocations.filter(a => a.status === 'completed')
    return completed.reduce((sum, a) => sum + (a.actualAmount || Math.round(a.allocatedAmount * 0.92)), 0)
  }
  return Math.round(totalPlanned.value * 0.85)
})

const avgArrivalRate = computed(() => {
  if (totalPlanned.value === 0) return 0
  return Math.round((totalActual.value / totalPlanned.value) * 100)
})

const totalWaterSaving = computed(() => {
  return Math.round(totalPlanned.value * 0.08)
})

const waterUsageReports = computed(() => {
  const reports = []
  
  if (store.allocations.length > 0) {
    const villageMap = new Map<string, { planned: number; area: number; cropType: string }>()
    
    for (const alloc of store.allocations) {
      const app = store.applications.find(a => a.villageName === alloc.targetArea)
      const existing = villageMap.get(alloc.targetArea) || { planned: 0, area: app?.cropArea || 0, cropType: app?.cropType || '' }
      existing.planned += alloc.allocatedAmount
      villageMap.set(alloc.targetArea, existing)
    }
    
    villageMap.forEach((data, villageName) => {
      const seed = villageName.charCodeAt(0) + villageName.charCodeAt(villageName.length - 1)
      const actualWater = Math.round(data.planned * (0.82 + seededRandom(seed) * 0.15))
      const arrivalRate = Math.round((actualWater / data.planned) * 100)
      const overTimeMinutes = Math.floor(seededRandom(seed + 2) * 45)
      const waterSaving = data.planned - actualWater
      
      reports.push({
        villageName,
        cropArea: data.area,
        plannedWater: data.planned,
        actualWater,
        arrivalRate,
        overTimeMinutes,
        waterSaving
      })
    })
  }
  
  if (reports.length === 0) {
    for (const app of store.applications) {
      const seed = app.villageName.charCodeAt(0) + app.villageName.charCodeAt(app.villageName.length - 1)
      const actualWater = Math.round(app.requiredWaterAmount * (0.82 + seededRandom(seed) * 0.15))
      const arrivalRate = Math.round((actualWater / app.requiredWaterAmount) * 100)
      const overTimeMinutes = Math.floor(seededRandom(seed + 2) * 45)
      const waterSaving = app.requiredWaterAmount - actualWater
      
      reports.push({
        villageName: app.villageName,
        cropArea: app.cropArea,
        plannedWater: app.requiredWaterAmount,
        actualWater,
        arrivalRate,
        overTimeMinutes,
        waterSaving
      })
    }
  }
  
  return reports
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

const canalUtilization = computed(() => {
  if (store.canals.length === 0) return 0
  const totalFlow = store.canals.reduce((sum, c) => sum + c.flowRate, 0)
  const maxFlow = store.canals.reduce((sum, c) => sum + c.maxFlowRate, 0)
  return Math.round((totalFlow / maxFlow) * 100)
})

const responseRate = computed(() => {
  if (store.feedbacks.length === 0) return 100
  const resolved = store.feedbacks.filter(f => f.status === 'resolved').length
  const processing = store.feedbacks.filter(f => f.status === 'processing').length
  return Math.round(((resolved + processing) / store.feedbacks.length) * 100)
})

const rotationCompletion = computed(() => {
  if (store.rotationSchedules.length === 0) return 0
  const completed = store.rotationSchedules.filter(s => s.status === 'completed').length
  return Math.round((completed / store.rotationSchedules.length) * 100)
})

const exportReport = () => {
  alert('统计报表已导出！（模拟功能）\n\n报表包含：\n- 计划与实际流量对比\n- 各村组用水明细\n- 到水率统计\n- 超时放水记录\n- 节水建议方案')
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
