<template>
  <div class="application-container">
    <div class="flex-between" style="margin-bottom: 16px;">
      <div class="grid-4" style="flex: 1; margin-right: 16px;">
        <div class="stat-card">
          <div class="stat-value">{{ store.applications.length }}</div>
          <div class="stat-label">总申报数</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ store.pendingApplications.length }}</div>
          <div class="stat-label">待审批</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ store.approvedApplications.length }}</div>
          <div class="stat-label">已批准</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ (store.totalPendingWater / 1000).toFixed(1) }}</div>
          <div class="stat-label">待配水量 (千m³)</div>
        </div>
      </div>
      <button class="btn btn-primary" @click="showAddModal = true">
        + 新增申报
      </button>
    </div>

    <div class="card">
      <h3 class="card-title">用水申报列表</h3>
      <div class="filter-bar">
        <select v-model="statusFilter" class="form-input" style="width: 150px;">
          <option value="">全部状态</option>
          <option value="pending">待审批</option>
          <option value="approved">已批准</option>
          <option value="rejected">已拒绝</option>
          <option value="completed">已完成</option>
        </select>
      </div>
      <table>
        <thead>
          <tr>
            <th>村组名称</th>
            <th>联系人</th>
            <th>作物类型</th>
            <th>种植面积 (亩)</th>
            <th>优先级</th>
            <th>需水量 (m³)</th>
            <th>期望灌溉日期</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="app in filteredApplications" :key="app.id">
            <td><strong>{{ app.villageName }}</strong></td>
            <td>{{ app.contactPerson }}<br><span style="font-size: 12px; color: #78909c;">{{ app.contactPhone }}</span></td>
            <td>{{ app.cropType }}</td>
            <td>{{ app.cropArea }}</td>
            <td>
              <span v-if="app.priority === 1" class="badge badge-danger">高</span>
              <span v-else-if="app.priority === 2" class="badge badge-warning">中</span>
              <span v-else class="badge badge-info">低</span>
            </td>
            <td>{{ app.requiredWaterAmount.toLocaleString() }}</td>
            <td>{{ app.expectedStartDate }}</td>
            <td>
              <span v-if="app.status === 'pending'" class="badge badge-warning">待审批</span>
              <span v-else-if="app.status === 'approved'" class="badge badge-success">已批准</span>
              <span v-else-if="app.status === 'rejected'" class="badge badge-danger">已拒绝</span>
              <span v-else class="badge badge-info">已完成</span>
            </td>
            <td>
              <div class="flex gap-8">
                <button 
                  v-if="app.status === 'pending'" 
                  class="btn btn-success" 
                  style="padding: 4px 10px; font-size: 12px;"
                  @click="approveApplication(app.id)"
                >批准</button>
                <button 
                  v-if="app.status === 'pending'" 
                  class="btn btn-danger" 
                  style="padding: 4px 10px; font-size: 12px;"
                  @click="rejectApplication(app.id)"
                >拒绝</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
      <div class="modal">
        <h3 class="modal-title">新增用水申报</h3>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">村组名称</label>
            <input v-model="newApp.villageName" class="form-input" placeholder="请输入村组名称">
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">联系人</label>
              <input v-model="newApp.contactPerson" class="form-input" placeholder="请输入联系人">
            </div>
            <div class="form-group">
              <label class="form-label">联系电话</label>
              <input v-model="newApp.contactPhone" class="form-input" placeholder="请输入联系电话">
            </div>
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">作物类型</label>
              <select v-model="newApp.cropType" class="form-input">
                <option value="">请选择</option>
                <option value="水稻">水稻</option>
                <option value="玉米">玉米</option>
                <option value="小麦">小麦</option>
                <option value="棉花">棉花</option>
                <option value="蔬菜">蔬菜</option>
                <option value="其他">其他</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">种植面积 (亩)</label>
              <input v-model.number="newApp.cropArea" type="number" class="form-input" placeholder="请输入种植面积">
            </div>
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">优先级</label>
              <select v-model.number="newApp.priority" class="form-input">
                <option :value="1">高优先级</option>
                <option :value="2">中优先级</option>
                <option :value="3">低优先级</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">需水量 (m³)</label>
              <input v-model.number="newApp.requiredWaterAmount" type="number" class="form-input" placeholder="自动计算或手动输入">
            </div>
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">期望开始日期</label>
              <input v-model="newApp.expectedStartDate" type="date" class="form-input">
            </div>
            <div class="form-group">
              <label class="form-label">预计灌溉时长 (小时)</label>
              <input v-model.number="newApp.expectedDuration" type="number" class="form-input" placeholder="请输入预计时长">
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showAddModal = false">取消</button>
          <button class="btn btn-primary" @click="submitApplication">提交申报</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useIrrigationStore } from '@/stores/irrigation'
import type { WaterApplication } from '@/types'

const store = useIrrigationStore()
const showAddModal = ref(false)
const statusFilter = ref('')

const newApp = reactive({
  villageName: '',
  contactPerson: '',
  contactPhone: '',
  cropType: '',
  cropArea: 0,
  priority: 2 as 1 | 2 | 3,
  requiredWaterAmount: 0,
  expectedStartDate: '',
  expectedDuration: 8
})

const filteredApplications = computed(() => {
  if (!statusFilter.value) return store.applications
  return store.applications.filter(a => a.status === statusFilter.value)
})

const approveApplication = (id: string) => {
  store.updateApplicationStatus(id, 'approved')
}

const rejectApplication = (id: string) => {
  store.updateApplicationStatus(id, 'rejected')
}

const submitApplication = () => {
  if (!newApp.villageName || !newApp.cropType || !newApp.cropArea) {
    alert('请填写完整信息')
    return
  }
  
  if (!newApp.requiredWaterAmount) {
    newApp.requiredWaterAmount = newApp.cropArea * 30
  }
  
  const application: Omit<WaterApplication, 'id'> = {
    ...newApp,
    applicationDate: new Date().toISOString().split('T')[0],
    status: 'pending'
  }
  
  store.addApplication(application)
  
  newApp.villageName = ''
  newApp.contactPerson = ''
  newApp.contactPhone = ''
  newApp.cropType = ''
  newApp.cropArea = 0
  newApp.priority = 2
  newApp.requiredWaterAmount = 0
  newApp.expectedStartDate = ''
  newApp.expectedDuration = 8
  
  showAddModal.value = false
}
</script>

<style scoped>
.filter-bar {
  margin-bottom: 16px;
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
  width: 600px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
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
