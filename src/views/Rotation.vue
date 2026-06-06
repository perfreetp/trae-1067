<template>
  <div class="rotation-container">
    <div class="grid-4">
      <div class="stat-card">
        <div class="stat-value">{{ store.rotationSchedules.length }}</div>
        <div class="stat-label">已排班数</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ todaySchedules.length }}</div>
        <div class="stat-label">今日轮灌</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ scheduledVillages.length }}</div>
        <div class="stat-label">已排村组</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ totalAllocated.toLocaleString() }}</div>
        <div class="stat-label">总配水量 (m³)</div>
      </div>
    </div>

    <div class="card">
      <div class="flex-between">
        <h3 class="card-title">轮灌排班表 - {{ selectedDate }}</h3>
        <div class="flex gap-8">
          <input v-model="selectedDate" type="date" class="form-input" style="width: 150px;">
          <button class="btn btn-primary" @click="showAddModal = true">+ 添加排班</button>
        </div>
      </div>
      
      <div class="timeline">
        <div 
          v-for="schedule in sortedSchedules" 
          :key="schedule.id" 
          class="timeline-item"
          :class="{ 
            'status-scheduled': schedule.status === 'scheduled',
            'status-in-progress': schedule.status === 'in-progress',
            'status-completed': schedule.status === 'completed'
          }"
        >
          <div class="timeline-marker"></div>
          <div class="timeline-content">
            <div class="timeline-header">
              <span class="sequence">第{{ schedule.sequence }}轮</span>
              <strong>{{ schedule.villageName }}</strong>
              <span class="time">{{ schedule.startTime }} - {{ schedule.endTime }}</span>
              <span 
                class="badge"
                :class="{
                  'badge-warning': schedule.status === 'scheduled',
                  'badge-info': schedule.status === 'in-progress',
                  'badge-success': schedule.status === 'completed'
                }"
              >
                {{ schedule.status === 'scheduled' ? '待灌溉' : schedule.status === 'in-progress' ? '灌溉中' : '已完成' }}
              </span>
            </div>
            <div class="timeline-details">
              <span>渠道: {{ schedule.canalId }}</span>
              <span>配水量: {{ schedule.allocatedAmount }} m³</span>
            </div>
            <div class="timeline-actions">
              <button 
                v-if="schedule.status === 'scheduled'"
                class="btn btn-success" 
                style="padding: 2px 8px; font-size: 12px;"
                @click="startSchedule(schedule.id)"
              >开始</button>
              <button 
                v-if="schedule.status === 'in-progress'"
                class="btn btn-primary" 
                style="padding: 2px 8px; font-size: 12px;"
                @click="completeSchedule(schedule.id)"
              >完成</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <h3 class="card-title">轮灌排班总览</h3>
      <table>
        <thead>
          <tr>
            <th>日期</th>
            <th>轮次</th>
            <th>村组名称</th>
            <th>渠道</th>
            <th>开始时间</th>
            <th>结束时间</th>
            <th>配水量 (m³)</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="schedule in store.rotationSchedules" :key="schedule.id">
            <td>{{ schedule.date }}</td>
            <td>第{{ schedule.sequence }}轮</td>
            <td><strong>{{ schedule.villageName }}</strong></td>
            <td>{{ schedule.canalId }}</td>
            <td>{{ schedule.startTime }}</td>
            <td>{{ schedule.endTime }}</td>
            <td>{{ schedule.allocatedAmount.toLocaleString() }}</td>
            <td>
              <span v-if="schedule.status === 'scheduled'" class="badge badge-warning">待灌溉</span>
              <span v-else-if="schedule.status === 'in-progress'" class="badge badge-info">灌溉中</span>
              <span v-else class="badge badge-success">已完成</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
      <div class="modal">
        <h3 class="modal-title">添加轮灌排班</h3>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">日期</label>
            <input v-model="newSchedule.date" type="date" class="form-input">
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">轮次</label>
              <input v-model.number="newSchedule.sequence" type="number" class="form-input" min="1">
            </div>
            <div class="form-group">
              <label class="form-label">村组名称</label>
              <input v-model="newSchedule.villageName" class="form-input" placeholder="请输入村组名称">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">渠道</label>
            <select v-model="newSchedule.canalId" class="form-input">
              <option v-for="canal in store.canals" :key="canal.id" :value="canal.id">
                {{ canal.name }}
              </option>
            </select>
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">开始时间</label>
              <input v-model="newSchedule.startTime" type="time" class="form-input">
            </div>
            <div class="form-group">
              <label class="form-label">结束时间</label>
              <input v-model="newSchedule.endTime" type="time" class="form-input">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">配水量 (m³)</label>
            <input v-model.number="newSchedule.allocatedAmount" type="number" class="form-input" placeholder="请输入配水量">
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showAddModal = false">取消</button>
          <button class="btn btn-primary" @click="addSchedule">添加</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useIrrigationStore } from '@/stores/irrigation'
import type { RotationSchedule } from '@/types'

const store = useIrrigationStore()
const showAddModal = ref(false)
const selectedDate = ref(new Date().toISOString().split('T')[0])

const newSchedule = reactive({
  date: new Date().toISOString().split('T')[0],
  sequence: 1,
  villageName: '',
  canalId: 'c2',
  startTime: '08:00',
  endTime: '12:00',
  allocatedAmount: 0
})

const todaySchedules = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return store.rotationSchedules.filter(s => s.date === today)
})

const sortedSchedules = computed(() => {
  return store.rotationSchedules
    .filter(s => s.date === selectedDate.value)
    .sort((a, b) => a.sequence - b.sequence)
})

const scheduledVillages = computed(() => {
  const villages = new Set(store.rotationSchedules.map(s => s.villageName))
  return Array.from(villages)
})

const totalAllocated = computed(() => {
  return store.rotationSchedules.reduce((sum, s) => sum + s.allocatedAmount, 0)
})

const startSchedule = (id: string) => {
  store.updateRotationScheduleStatus(id, 'in-progress')
}

const completeSchedule = (id: string) => {
  store.updateRotationScheduleStatus(id, 'completed')
}

const addSchedule = () => {
  if (!newSchedule.villageName || !newSchedule.allocatedAmount) {
    alert('请填写完整信息')
    return
  }
  
  const schedule: Omit<RotationSchedule, 'id'> = {
    ...newSchedule,
    status: 'scheduled'
  }
  
  store.addRotationSchedule(schedule)
  
  newSchedule.sequence = 1
  newSchedule.villageName = ''
  newSchedule.canalId = 'c2'
  newSchedule.startTime = '08:00'
  newSchedule.endTime = '12:00'
  newSchedule.allocatedAmount = 0
  
  showAddModal.value = false
}
</script>

<style scoped>
.timeline {
  padding: 20px 0;
}

.timeline-item {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  position: relative;
}

.timeline-item::before {
  content: '';
  position: absolute;
  left: 11px;
  top: 24px;
  bottom: -20px;
  width: 2px;
  background: #e0e0e0;
}

.timeline-item:last-child::before {
  display: none;
}

.timeline-marker {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #1e88e5;
  flex-shrink: 0;
  z-index: 1;
}

.status-in-progress .timeline-marker {
  background: #fb8c00;
  animation: pulse 2s infinite;
}

.status-completed .timeline-marker {
  background: #43a047;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.timeline-content {
  flex: 1;
  background: #f8fafc;
  border-radius: 8px;
  padding: 16px;
}

.timeline-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.timeline-header .sequence {
  background: #1e88e5;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.timeline-header .time {
  color: #78909c;
  font-size: 13px;
}

.timeline-details {
  display: flex;
  gap: 24px;
  font-size: 13px;
  color: #546e7a;
  margin-bottom: 12px;
}

.timeline-actions {
  text-align: right;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
}

.modal-title {
  padding: 20px 24px;
  margin: 0;
  border-bottom: 1px solid #e0e0e0;
  font-size: 18px;
  color: #1a237e;
}

.modal-body {
  padding: 24px;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
