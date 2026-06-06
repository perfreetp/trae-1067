import { defineStore } from 'pinia'
import type {
  WaterSource,
  Canal,
  WaterApplication,
  WaterAllocation,
  Gate,
  GateOperation,
  RotationSchedule,
  FieldFeedback
} from '@/types'

export const useIrrigationStore = defineStore('irrigation', {
  state: () => ({
    waterSources: [
      {
        id: '1',
        name: '青峰水库',
        type: 'reservoir',
        currentLevel: 28.5,
        maxLevel: 35.0,
        inflowRate: 12.5,
        outflowRate: 8.3,
        capacity: 5000,
        storage: 3800,
        lastUpdate: '2024-06-15 08:30:00'
      },
      {
        id: '2',
        name: '东河水库',
        type: 'reservoir',
        currentLevel: 32.1,
        maxLevel: 38.0,
        inflowRate: 8.2,
        outflowRate: 6.5,
        capacity: 3200,
        storage: 2650,
        lastUpdate: '2024-06-15 08:30:00'
      }
    ] as WaterSource[],
    
    canals: [
      { id: 'c1', name: '总干渠', level: 'main', waterLevel: 2.8, flowRate: 15.2, maxFlowRate: 20.0, status: 'normal' },
      { id: 'c2', name: '东干渠', level: 'branch', waterLevel: 2.2, flowRate: 8.5, maxFlowRate: 12.0, status: 'normal' },
      { id: 'c3', name: '西干渠', level: 'branch', waterLevel: 2.0, flowRate: 6.8, maxFlowRate: 10.0, status: 'warning' },
      { id: 'c4', name: '南干渠', level: 'branch', waterLevel: 1.5, flowRate: 3.2, maxFlowRate: 8.0, status: 'warning' },
      { id: 'c5', name: '北干渠', level: 'branch', waterLevel: 2.5, flowRate: 9.5, maxFlowRate: 12.0, status: 'normal' }
    ] as Canal[],
    
    applications: [
      {
        id: 'a1',
        villageName: '和平村',
        contactPerson: '张三',
        contactPhone: '13800138001',
        cropType: '水稻',
        cropArea: 120,
        priority: 1,
        requiredWaterAmount: 3600,
        applicationDate: '2024-06-14',
        expectedStartDate: '2024-06-16',
        expectedDuration: 8,
        status: 'approved'
      },
      {
        id: 'a2',
        villageName: '建设村',
        contactPerson: '李四',
        contactPhone: '13800138002',
        cropType: '玉米',
        cropArea: 80,
        priority: 2,
        requiredWaterAmount: 1600,
        applicationDate: '2024-06-14',
        expectedStartDate: '2024-06-17',
        expectedDuration: 6,
        status: 'pending'
      },
      {
        id: 'a3',
        villageName: '团结村',
        contactPerson: '王五',
        contactPhone: '13800138003',
        cropType: '水稻',
        cropArea: 150,
        priority: 1,
        requiredWaterAmount: 4500,
        applicationDate: '2024-06-15',
        expectedStartDate: '2024-06-16',
        expectedDuration: 10,
        status: 'pending'
      },
      {
        id: 'a4',
        villageName: '胜利村',
        contactPerson: '赵六',
        contactPhone: '13800138004',
        cropType: '棉花',
        cropArea: 60,
        priority: 3,
        requiredWaterAmount: 900,
        applicationDate: '2024-06-13',
        expectedStartDate: '2024-06-18',
        expectedDuration: 4,
        status: 'completed'
      }
    ] as WaterApplication[],
    
    allocations: [
      {
        id: 'al1',
        date: '2024-06-16',
        timeSlot: '08:00-12:00',
        canalId: 'c2',
        canalName: '东干渠',
        targetArea: '和平村',
        allocatedAmount: 1800,
        gateId: 'g1',
        gateOpening: 60,
        status: 'scheduled'
      },
      {
        id: 'al2',
        date: '2024-06-16',
        timeSlot: '14:00-18:00',
        canalId: 'c2',
        canalName: '东干渠',
        targetArea: '和平村',
        allocatedAmount: 1800,
        gateId: 'g1',
        gateOpening: 60,
        status: 'scheduled'
      }
    ] as WaterAllocation[],
    
    gates: [
      { id: 'g1', name: '东干渠1号闸', canalId: 'c2', canalName: '东干渠', location: '和平村入口', currentOpening: 0, maxOpening: 100, status: 'closed', lastOperation: '2024-06-15 08:00:00' },
      { id: 'g2', name: '西干渠1号闸', canalId: 'c3', canalName: '西干渠', location: '建设村入口', currentOpening: 30, maxOpening: 100, status: 'open', lastOperation: '2024-06-15 07:30:00' },
      { id: 'g3', name: '南干渠1号闸', canalId: 'c4', canalName: '南干渠', location: '团结村入口', currentOpening: 0, maxOpening: 100, status: 'closed', lastOperation: '2024-06-14 18:00:00' },
      { id: 'g4', name: '北干渠1号闸', canalId: 'c5', canalName: '北干渠', location: '胜利村入口', currentOpening: 0, maxOpening: 100, status: 'closed', lastOperation: '2024-06-15 12:00:00' }
    ] as Gate[],
    
    gateOperations: [
      {
        id: 'op1',
        gateId: 'g1',
        gateName: '东干渠1号闸',
        operator: '管理员',
        targetOpening: 60,
        startTime: '2024-06-16 08:00:00',
        endTime: '2024-06-16 12:00:00',
        status: 'pending'
      }
    ] as GateOperation[],
    
    rotationSchedules: [
      {
        id: 'r1',
        date: '2024-06-16',
        sequence: 1,
        villageName: '和平村',
        canalId: 'c2',
        startTime: '08:00',
        endTime: '12:00',
        allocatedAmount: 1800,
        status: 'scheduled'
      },
      {
        id: 'r2',
        date: '2024-06-16',
        sequence: 2,
        villageName: '团结村',
        canalId: 'c2',
        startTime: '14:00',
        endTime: '18:00',
        allocatedAmount: 2250,
        status: 'scheduled'
      }
    ] as RotationSchedule[],
    
    feedbacks: [
      {
        id: 'f1',
        reporter: '巡渠员-王强',
        reportTime: '2024-06-15 09:30:00',
        type: 'leakage',
        location: '东干渠K3+200处',
        description: '渠堤有轻微渗漏，约每分钟5升',
        status: 'processing',
        handler: '李工'
      },
      {
        id: 'f2',
        reporter: '巡渠员-张伟',
        reportTime: '2024-06-15 10:15:00',
        type: 'blockage',
        location: '西干渠K1+500处',
        description: '渠道内有杂草和漂浮物堆积，影响过水',
        status: 'reported'
      },
      {
        id: 'f3',
        reporter: '村民-刘建国',
        reportTime: '2024-06-14 16:45:00',
        type: 'theft',
        location: '南干渠K2+100处',
        description: '发现有人私自接管取水',
        status: 'resolved',
        handler: '执法队',
        handleTime: '2024-06-15 08:00:00',
        handleResult: '已拆除私接管道，对当事人进行批评教育'
      }
    ] as FieldFeedback[]
  }),
  
  getters: {
    totalStorage: (state) => {
      return state.waterSources.reduce((sum, s) => sum + s.storage, 0)
    },
    
    totalCapacity: (state) => {
      return state.waterSources.reduce((sum, s) => sum + s.capacity, 0)
    },
    
    pendingApplications: (state) => {
      return state.applications.filter(a => a.status === 'pending')
    },
    
    approvedApplications: (state) => {
      return state.applications.filter(a => a.status === 'approved')
    },
    
    totalPendingWater: (state) => {
      return state.applications
        .filter(a => a.status === 'pending' || a.status === 'approved')
        .reduce((sum, a) => sum + a.requiredWaterAmount, 0)
    },
    
    availableWater: (state) => {
      const totalOutflow = state.waterSources.reduce((sum, s) => sum + s.outflowRate, 0)
      return totalOutflow * 24 * 60
    },
    
    waterGap: (state, getters) => {
      const totalOutflow = state.waterSources.reduce((sum, s) => sum + s.outflowRate, 0)
      const dailyAvailable = totalOutflow * 24 * 60
      const pending = state.applications
        .filter(a => a.status === 'pending' || a.status === 'approved')
        .reduce((sum, a) => sum + a.requiredWaterAmount, 0)
      return pending - dailyAvailable
    },
    
    unresolvedFeedbacks: (state) => {
      return state.feedbacks.filter(f => f.status !== 'resolved')
    }
  },
  
  actions: {
    addApplication(application: Omit<WaterApplication, 'id'>) {
      const id = 'a' + Date.now()
      this.applications.push({ ...application, id })
    },
    
    updateApplicationStatus(id: string, status: WaterApplication['status']) {
      const app = this.applications.find(a => a.id === id)
      if (app) {
        app.status = status
      }
    },
    
    addAllocation(allocation: Omit<WaterAllocation, 'id'>) {
      const id = 'al' + Date.now()
      this.allocations.push({ ...allocation, id })
    },
    
    removeAllocation(id: string) {
      const index = this.allocations.findIndex(a => a.id === id)
      if (index > -1) {
        this.allocations.splice(index, 1)
      }
    },
    
    addGateOperation(operation: Omit<GateOperation, 'id'>) {
      const id = 'op' + Date.now()
      this.gateOperations.push({ ...operation, id })
    },
    
    updateGateOperationStatus(id: string, status: GateOperation['status']) {
      const op = this.gateOperations.find(o => o.id === id)
      if (op) {
        op.status = status
      }
    },
    
    addRotationSchedule(schedule: Omit<RotationSchedule, 'id'>) {
      const id = 'r' + Date.now()
      this.rotationSchedules.push({ ...schedule, id })
    },
    
    updateRotationScheduleStatus(id: string, status: RotationSchedule['status']) {
      const schedule = this.rotationSchedules.find(s => s.id === id)
      if (schedule) {
        schedule.status = status
      }
    },
    
    addFeedback(feedback: Omit<FieldFeedback, 'id'>) {
      const id = 'f' + Date.now()
      this.feedbacks.unshift({ ...feedback, id })
    },
    
    updateFeedbackStatus(id: string, status: FieldFeedback['status'], handler?: string, handleResult?: string) {
      const feedback = this.feedbacks.find(f => f.id === id)
      if (feedback) {
        feedback.status = status
        if (handler) feedback.handler = handler
        if (handleResult) feedback.handleResult = handleResult
        if (status === 'resolved') {
          feedback.handleTime = new Date().toLocaleString('zh-CN')
        }
      }
    }
  }
})
