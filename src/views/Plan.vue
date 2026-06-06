<template>
  <div class="plan-container">
    <div class="grid-4">
      <div class="stat-card">
        <div class="stat-value">{{ (dailyAvailable / 1000).toFixed(1) }}</div>
        <div class="stat-label">日可供水量 (千m³)</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ (store.totalPendingWater / 1000).toFixed(1) }}</div>
        <div class="stat-label">待配水量 (千m³)</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" :class="{ 'text-danger': waterGap > 0 }">
          {{ waterGap > 0 ? '+' : '' }}{{ (waterGap / 1000).toFixed(1) }}
        </div>
        <div class="stat-label">供需缺口 (千m³)</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ store.allocations.length }}</div>
        <div class="stat-label">已安排配水次数</div>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <h3 class="card-title">待配水申请 (优先级排序)</h3>
        <div class="application-list">
          <div 
            v-for="app in sortedApplications" 
            :key="app.id" 
            class="application-item"
            draggable="true"
            @dragstart="onDragStart($event, app)"
          >
            <div class="app-header">
              <span class="badge" :class="getPriorityClass(app.priority)">{{ getPriorityLabel(app.priority) }}</span>
              <strong>{{ app.villageName }}</strong>
            </div>
            <div class="app-info">
              <span>{{ app.cropType }} · {{ app.cropArea }}亩</span>
              <span class="water-amount">需水: {{ app.requiredWaterAmount }} m³</span>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex-between">
          <h3 class="card-title">{{ selectedDate }} 配水表</h3>
          <input v-model="selectedDate" type="date" class="form-input" style="width: 150px;">
        </div>
        <div 
          class="allocation-area"
          @dragover.prevent
          @drop="onDrop"
        >
          <div v-if="dayAllocations.length === 0" class="empty-hint">
            将左侧申请拖拽到此处进行配水安排
          </div>
          <div 
            v-for="alloc in dayAllocations" 
            :key="alloc.id" 
            class="allocation-item"
          >
            <div class="alloc-header">
              <strong>{{ alloc.targetArea }}</strong>
              <span class="badge badge-info">{{ alloc.timeSlot }}</span>
            </div>
            <div class="alloc-info">
              <span>{{ alloc.canalName }}</span>
              <span>{{ alloc.allocatedAmount }} m³</span>
              <span>闸门开度: {{ alloc.gateOpening }}%</span>
            </div>
            <div class="alloc-actions">
              <button class="btn btn-danger" style="padding: 2px 8px; font-size: 12px;" @click="removeAllocation(alloc.id)">
                删除
              </button>
            </div>
          </div>
        </div>
        <div style="margin-top: 16px;">
          <button class="btn btn-primary" @click="generatePlan">自动生成配水计划</button>
        </div>
      </div>
    </div>

    <div class="card">
      <h3 class="card-title">配水计划表</h3>
      <table>
        <thead>
          <tr>
            <th>日期</th>
            <th>时段</th>
            <th>渠道</th>
            <th>目标区域</th>
            <th>配水量 (m³)</th>
            <th>闸门</th>
            <th>开度</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="alloc in store.allocations" :key="alloc.id">
            <td>{{ alloc.date }}</td>
            <td>{{ alloc.timeSlot }}</td>
            <td>{{ alloc.canalName }}</td>
            <td>{{ alloc.targetArea }}</td>
            <td>{{ alloc.allocatedAmount.toLocaleString() }}</td>
            <td>{{ alloc.gateId }}</td>
            <td>{{ alloc.gateOpening }}%</td>
            <td>
              <span v-if="alloc.status === 'scheduled'" class="badge badge-warning">已排程</span>
              <span v-else-if="alloc.status === 'in-progress'" class="badge badge-info">进行中</span>
              <span v-else class="badge badge-success">已完成</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useIrrigationStore } from '@/stores/irrigation'
import type { WaterApplication } from '@/types'

const store = useIrrigationStore()
const selectedDate = ref(new Date().toISOString().split('T')[0])
const draggedApp = ref<WaterApplication | null>(null)

const dailyAvailable = computed(() => {
  const totalOutflow = store.waterSources.reduce((sum, s) => sum + s.outflowRate, 0)
  return totalOutflow * 24 * 60
})

const waterGap = computed(() => {
  return store.totalPendingWater - dailyAvailable.value
})

const sortedApplications = computed(() => {
  return store.applications
    .filter(a => a.status === 'approved' || a.status === 'pending')
    .sort((a, b) => a.priority - b.priority)
})

const dayAllocations = computed(() => {
  return store.allocations.filter(a => a.date === selectedDate.value)
})

const getPriorityClass = (priority: number) => {
  if (priority === 1) return 'badge-danger'
  if (priority === 2) return 'badge-warning'
  return 'badge-info'
}

const getPriorityLabel = (priority: number) => {
  if (priority === 1) return '高'
  if (priority === 2) return '中'
  return '低'
}

const onDragStart = (event: DragEvent, app: WaterApplication) => {
  draggedApp.value = app
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'copy'
  }
}

const onDrop = () => {
  if (!draggedApp.value) return
  
  const timeSlots = ['08:00-12:00', '14:00-18:00']
  const usedSlots = dayAllocations.value.map(a => a.timeSlot)
  const availableSlot = timeSlots.find(s => !usedSlots.includes(s)) || timeSlots[0]
  
  const gate = store.gates[0]
  const canal = store.canals.find(c => c.id === gate.canalId)
  
  store.addAllocation({
    date: selectedDate.value,
    timeSlot: availableSlot,
    canalId: canal?.id || 'c2',
    canalName: canal?.name || '东干渠',
    targetArea: draggedApp.value.villageName,
    allocatedAmount: draggedApp.value.requiredWaterAmount,
    gateId: gate.id,
    gateOpening: 60,
    status: 'scheduled'
  })
  
  draggedApp.value = null
}

const removeAllocation = (id: string) => {
  store.removeAllocation(id)
}

const generatePlan = () => {
  const pending = sortedApplications.value
  let remainingWater = dailyAvailable.value
  const timeSlots = ['08:00-12:00', '14:00-18:00', '20:00-24:00']
  
  let slotIndex = 0
  
  for (const app of pending) {
    if (remainingWater <= 0) break
    if (slotIndex >= timeSlots.length) break
    
    const amount = Math.min(app.requiredWaterAmount, remainingWater)
    const gate = store.gates[0]
    const canal = store.canals.find(c => c.id === gate.canalId)
    
    store.addAllocation({
      date: selectedDate.value,
      timeSlot: timeSlots[slotIndex],
      canalId: canal?.id || 'c2',
      canalName: canal?.name || '东干渠',
      targetArea: app.villageName,
      allocatedAmount: amount,
      gateId: gate.id,
      gateOpening: Math.round((amount / app.requiredWaterAmount) * 100),
      status: 'scheduled'
    })
    
    remainingWater -= amount
    slotIndex++
  }
}
</script>

<style scoped>
.text-danger {
  color: #e53935;
}

.application-list {
  max-height: 400px;
  overflow-y: auto;
}

.application-item {
  padding: 12px;
  background: #f8fafc;
  border-radius: 6px;
  margin-bottom: 8px;
  cursor: grab;
  border: 2px solid transparent;
  transition: all 0.2s ease;
}

.application-item:hover {
  border-color: #1e88e5;
  background: #e3f2fd;
}

.application-item:active {
  cursor: grabbing;
}

.app-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.app-info {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #546e7a;
}

.water-amount {
  font-weight: 600;
  color: #1e88e5;
}

.allocation-area {
  min-height: 300px;
  border: 2px dashed #90caf9;
  border-radius: 8px;
  padding: 16px;
  background: #f5fafd;
}

.empty-hint {
  text-align: center;
  color: #90a4ae;
  padding: 60px 20px;
  font-size: 14px;
}

.allocation-item {
  padding: 12px;
  background: white;
  border-radius: 6px;
  margin-bottom: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.alloc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.alloc-info {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #546e7a;
  margin-bottom: 8px;
}

.alloc-actions {
  text-align: right;
}
</style>
