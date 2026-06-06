<template>
  <div class="gate-container">
    <div class="grid-4">
      <div class="stat-card">
        <div class="stat-value">{{ store.gates.length }}</div>
        <div class="stat-label">闸门总数</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ openGatesCount }}</div>
        <div class="stat-label">开启闸门</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ store.gateOperations.length }}</div>
        <div class="stat-label">待执行操作</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ avgOpening }}%</div>
        <div class="stat-label">平均开度</div>
      </div>
    </div>

    <div class="card">
      <h3 class="card-title">闸门状态监控</h3>
      <div class="grid-3">
        <div v-for="gate in store.gates" :key="gate.id" class="gate-card">
          <div class="gate-header">
            <h4>{{ gate.name }}</h4>
            <span 
              class="badge"
              :class="{
                'badge-success': gate.status === 'open',
                'badge-danger': gate.status === 'closed',
                'badge-warning': gate.status === 'adjusting'
              }"
            >
              {{ gate.status === 'open' ? '开启' : gate.status === 'closed' ? '关闭' : '调节中' }}
            </span>
          </div>
          <div class="gate-info">
            <p><span class="label">所属渠道:</span> {{ gate.canalName }}</p>
            <p><span class="label">位置:</span> {{ gate.location }}</p>
            <p><span class="label">当前开度:</span> 
              <span class="opening-value">{{ gate.currentOpening }}%</span>
            </p>
          </div>
          <div class="opening-slider">
            <div class="slider-track">
              <div 
                class="slider-fill" 
                :style="{ width: gate.currentOpening + '%' }"
              ></div>
            </div>
          </div>
          <p class="last-op">上次操作: {{ gate.lastOperation }}</p>
          <button 
            class="btn btn-primary" 
            style="width: 100%; margin-top: 12px;"
            @click="openOperationModal(gate)"
          >
            下达操作指令
          </button>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="flex-between">
        <h3 class="card-title">闸门操作指令</h3>
      </div>
      <table>
        <thead>
          <tr>
            <th>闸门名称</th>
            <th>操作员</th>
            <th>目标开度</th>
            <th>开始时间</th>
            <th>结束时间</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="op in store.gateOperations" :key="op.id">
            <td><strong>{{ op.gateName }}</strong></td>
            <td>{{ op.operator }}</td>
            <td>{{ op.targetOpening }}%</td>
            <td>{{ op.startTime }}</td>
            <td>{{ op.endTime }}</td>
            <td>
              <span v-if="op.status === 'pending'" class="badge badge-warning">待执行</span>
              <span v-else-if="op.status === 'executing'" class="badge badge-info">执行中</span>
              <span v-else-if="op.status === 'completed'" class="badge badge-success">已完成</span>
              <span v-else class="badge badge-danger">已取消</span>
            </td>
            <td>
              <div class="flex gap-8">
                <button 
                  v-if="op.status === 'pending'"
                  class="btn btn-success" 
                  style="padding: 4px 10px; font-size: 12px;"
                  @click="executeOperation(op.id)"
                >执行</button>
                <button 
                  v-if="op.status === 'pending' || op.status === 'executing'"
                  class="btn btn-danger" 
                  style="padding: 4px 10px; font-size: 12px;"
                  @click="cancelOperation(op.id)"
                >取消</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showOperationModal" class="modal-overlay" @click.self="showOperationModal = false">
      <div class="modal">
        <h3 class="modal-title">下达闸门操作指令 - {{ selectedGate?.name }}</h3>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">操作员</label>
            <input v-model="operationForm.operator" class="form-input" placeholder="请输入操作员姓名">
          </div>
          <div class="form-group">
            <label class="form-label">目标开度: {{ operationForm.targetOpening }}%</label>
            <input 
              v-model.number="operationForm.targetOpening" 
              type="range" 
              min="0" 
              max="100" 
              class="form-input"
              style="width: 100%;"
            >
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">开始时间</label>
              <input v-model="operationForm.startTime" type="datetime-local" class="form-input">
            </div>
            <div class="form-group">
              <label class="form-label">结束时间</label>
              <input v-model="operationForm.endTime" type="datetime-local" class="form-input">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">备注</label>
            <textarea v-model="operationForm.remark" class="form-input" rows="3" placeholder="请输入备注信息"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showOperationModal = false">取消</button>
          <button class="btn btn-primary" @click="submitOperation">下达指令</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useIrrigationStore } from '@/stores/irrigation'
import type { Gate, GateOperation } from '@/types'

const store = useIrrigationStore()
const showOperationModal = ref(false)
const selectedGate = ref<Gate | null>(null)

const operationForm = reactive({
  operator: '',
  targetOpening: 50,
  startTime: '',
  endTime: '',
  remark: ''
})

const openGatesCount = computed(() => {
  return store.gates.filter(g => g.status === 'open').length
})

const avgOpening = computed(() => {
  const openGates = store.gates.filter(g => g.status === 'open')
  if (openGates.length === 0) return 0
  const total = openGates.reduce((sum, g) => sum + g.currentOpening, 0)
  return Math.round(total / openGates.length)
})

const openOperationModal = (gate: Gate) => {
  selectedGate.value = gate
  operationForm.targetOpening = gate.currentOpening
  showOperationModal.value = true
}

const submitOperation = () => {
  if (!selectedGate.value || !operationForm.operator) {
    alert('请填写完整信息')
    return
  }
  
  const operation: Omit<GateOperation, 'id'> = {
    gateId: selectedGate.value.id,
    gateName: selectedGate.value.name,
    operator: operationForm.operator,
    targetOpening: operationForm.targetOpening,
    startTime: operationForm.startTime || new Date().toISOString().slice(0, 16),
    endTime: operationForm.endTime || '',
    status: 'pending',
    remark: operationForm.remark
  }
  
  store.addGateOperation(operation)
  
  operationForm.operator = ''
  operationForm.targetOpening = 50
  operationForm.startTime = ''
  operationForm.endTime = ''
  operationForm.remark = ''
  
  showOperationModal.value = false
}

const executeOperation = (id: string) => {
  store.updateGateOperationStatus(id, 'executing')
  setTimeout(() => {
    store.updateGateOperationStatus(id, 'completed')
  }, 2000)
}

const cancelOperation = (id: string) => {
  store.updateGateOperationStatus(id, 'cancelled')
}
</script>

<style scoped>
.gate-card {
  background: #f8fafc;
  border-radius: 8px;
  padding: 20px;
}

.gate-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.gate-header h4 {
  margin: 0;
  font-size: 16px;
  color: #1a237e;
}

.gate-info {
  margin-bottom: 12px;
}

.gate-info p {
  margin: 4px 0;
  font-size: 13px;
}

.gate-info .label {
  color: #78909c;
}

.opening-value {
  font-size: 18px;
  font-weight: 700;
  color: #1e88e5;
}

.opening-slider {
  margin-bottom: 12px;
}

.slider-track {
  width: 100%;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.slider-fill {
  height: 100%;
  background: linear-gradient(to right, #43a047, #1e88e5);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.last-op {
  font-size: 12px;
  color: #90a4ae;
  margin: 0;
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
