<template>
  <div class="feedback-container">
    <div class="grid-4">
      <div class="stat-card">
        <div class="stat-value">{{ store.feedbacks.length }}</div>
        <div class="stat-label">总反馈数</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ store.unresolvedFeedbacks.length }}</div>
        <div class="stat-label">待处理</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ todayFeedbacks.length }}</div>
        <div class="stat-label">今日新增</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ resolvedRate }}%</div>
        <div class="stat-label">处理率</div>
      </div>
    </div>

    <div class="flex-between" style="margin-bottom: 16px;">
      <div class="flex gap-8">
        <select v-model="typeFilter" class="form-input" style="width: 150px;">
          <option value="">全部类型</option>
          <option value="leakage">渗漏</option>
          <option value="blockage">淤堵</option>
          <option value="theft">偷水</option>
          <option value="other">其他</option>
        </select>
        <select v-model="statusFilter" class="form-input" style="width: 150px;">
          <option value="">全部状态</option>
          <option value="reported">已上报</option>
          <option value="processing">处理中</option>
          <option value="resolved">已解决</option>
        </select>
      </div>
      <button class="btn btn-primary" @click="showAddModal = true">+ 上报问题</button>
    </div>

    <div class="card">
      <h3 class="card-title">现场反馈列表</h3>
      <div class="feedback-list">
        <div 
          v-for="feedback in filteredFeedbacks" 
          :key="feedback.id" 
          class="feedback-card"
        >
          <div class="feedback-header">
            <div class="feedback-type">
              <span class="type-icon">{{ getTypeIcon(feedback.type) }}</span>
              <span class="type-label">{{ getTypeLabel(feedback.type) }}</span>
            </div>
            <span 
              class="badge"
              :class="{
                'badge-warning': feedback.status === 'reported',
                'badge-info': feedback.status === 'processing',
                'badge-success': feedback.status === 'resolved'
              }"
            >
              {{ feedback.status === 'reported' ? '已上报' : feedback.status === 'processing' ? '处理中' : '已解决' }}
            </span>
          </div>
          
          <h4 class="feedback-location">📍 {{ feedback.location }}</h4>
          <p class="feedback-desc">{{ feedback.description }}</p>
          
          <div class="feedback-meta">
            <span>👤 {{ feedback.reporter }}</span>
            <span>🕐 {{ feedback.reportTime }}</span>
          </div>
          
          <div v-if="feedback.handler" class="feedback-handle">
            <div class="handle-info">
              <span>处理人: {{ feedback.handler }}</span>
              <span v-if="feedback.handleTime">处理时间: {{ feedback.handleTime }}</span>
            </div>
            <div v-if="feedback.handleResult" class="handle-result">
              <strong>处理结果:</strong> {{ feedback.handleResult }}
            </div>
          </div>
          
          <div class="feedback-actions">
            <button 
              v-if="feedback.status === 'reported'"
              class="btn btn-warning" 
              style="padding: 4px 10px; font-size: 12px;"
              @click="startProcessing(feedback.id)"
            >开始处理</button>
            <button 
              v-if="feedback.status === 'processing'"
              class="btn btn-success" 
              style="padding: 4px 10px; font-size: 12px;"
              @click="openResolveModal(feedback.id)"
            >标记解决</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
      <div class="modal">
        <h3 class="modal-title">上报问题</h3>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">问题类型</label>
            <select v-model="newFeedback.type" class="form-input">
              <option value="leakage">渗漏</option>
              <option value="blockage">淤堵</option>
              <option value="theft">偷水</option>
              <option value="other">其他</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">位置</label>
            <input v-model="newFeedback.location" class="form-input" placeholder="请输入具体位置，如：东干渠K3+200处">
          </div>
          <div class="form-group">
            <label class="form-label">问题描述</label>
            <textarea v-model="newFeedback.description" class="form-input" rows="4" placeholder="请详细描述问题情况"></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">上报人</label>
            <input v-model="newFeedback.reporter" class="form-input" placeholder="请输入上报人姓名">
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showAddModal = false">取消</button>
          <button class="btn btn-primary" @click="submitFeedback">提交上报</button>
        </div>
      </div>
    </div>

    <div v-if="showResolveModal" class="modal-overlay" @click.self="showResolveModal = false">
      <div class="modal">
        <h3 class="modal-title">标记问题已解决</h3>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">处理人</label>
            <input v-model="resolveForm.handler" class="form-input" placeholder="请输入处理人姓名">
          </div>
          <div class="form-group">
            <label class="form-label">处理结果</label>
            <textarea v-model="resolveForm.handleResult" class="form-input" rows="4" placeholder="请描述处理结果"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showResolveModal = false">取消</button>
          <button class="btn btn-success" @click="resolveFeedback">确认解决</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useIrrigationStore } from '@/stores/irrigation'
import type { FieldFeedback } from '@/types'

const store = useIrrigationStore()
const showAddModal = ref(false)
const showResolveModal = ref(false)
const resolvingId = ref<string | null>(null)
const typeFilter = ref('')
const statusFilter = ref('')

const newFeedback = reactive({
  reporter: '',
  type: 'leakage' as FieldFeedback['type'],
  location: '',
  description: ''
})

const resolveForm = reactive({
  handler: '',
  handleResult: ''
})

const todayFeedbacks = computed(() => {
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const todayStrAlt = `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`
  return store.feedbacks.filter(f => {
    return f.reportTime.startsWith(todayStr) || f.reportTime.startsWith(todayStrAlt)
  })
})

const resolvedRate = computed(() => {
  if (store.feedbacks.length === 0) return 0
  const resolved = store.feedbacks.filter(f => f.status === 'resolved').length
  return Math.round((resolved / store.feedbacks.length) * 100)
})

const filteredFeedbacks = computed(() => {
  return store.feedbacks.filter(f => {
    if (typeFilter.value && f.type !== typeFilter.value) return false
    if (statusFilter.value && f.status !== statusFilter.value) return false
    return true
  })
})

const getTypeIcon = (type: string) => {
  const icons: Record<string, string> = {
    leakage: '💧',
    blockage: '🌿',
    theft: '⚠️',
    other: '📋'
  }
  return icons[type] || '📋'
}

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    leakage: '渗漏',
    blockage: '淤堵',
    theft: '偷水',
    other: '其他'
  }
  return labels[type] || '其他'
}

const submitFeedback = () => {
  if (!newFeedback.location || !newFeedback.description || !newFeedback.reporter) {
    alert('请填写完整信息')
    return
  }
  
  const now = new Date()
  const formattedTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
  const feedback: Omit<FieldFeedback, 'id'> = {
    ...newFeedback,
    reportTime: formattedTime,
    status: 'reported'
  }
  
  store.addFeedback(feedback)
  
  newFeedback.reporter = ''
  newFeedback.type = 'leakage'
  newFeedback.location = ''
  newFeedback.description = ''
  
  showAddModal.value = false
}

const startProcessing = (id: string) => {
  store.updateFeedbackStatus(id, 'processing')
}

const openResolveModal = (id: string) => {
  resolvingId.value = id
  showResolveModal.value = true
}

const resolveFeedback = () => {
  if (!resolvingId.value || !resolveForm.handler || !resolveForm.handleResult) {
    alert('请填写处理信息')
    return
  }
  
  store.updateFeedbackStatus(
    resolvingId.value, 
    'resolved', 
    resolveForm.handler, 
    resolveForm.handleResult
  )
  
  resolveForm.handler = ''
  resolveForm.handleResult = ''
  resolvingId.value = null
  showResolveModal.value = false
}
</script>

<style scoped>
.feedback-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.feedback-card {
  background: #f8fafc;
  border-radius: 8px;
  padding: 16px;
  border-left: 4px solid #1e88e5;
}

.feedback-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.feedback-type {
  display: flex;
  align-items: center;
  gap: 6px;
}

.type-icon {
  font-size: 18px;
}

.type-label {
  font-weight: 600;
  color: #37474f;
}

.feedback-location {
  margin: 0 0 8px 0;
  font-size: 15px;
  color: #1a237e;
}

.feedback-desc {
  margin: 0 0 12px 0;
  color: #546e7a;
  font-size: 13px;
  line-height: 1.6;
}

.feedback-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #90a4ae;
  margin-bottom: 12px;
}

.feedback-handle {
  background: white;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 12px;
}

.handle-info {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #78909c;
  margin-bottom: 6px;
}

.handle-result {
  font-size: 13px;
  color: #37474f;
}

.feedback-actions {
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

@media (max-width: 900px) {
  .feedback-list {
    grid-template-columns: 1fr;
  }
}
</style>
