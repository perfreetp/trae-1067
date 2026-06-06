export interface WaterSource {
  id: string
  name: string
  type: 'reservoir' | 'canal'
  currentLevel: number
  maxLevel: number
  inflowRate: number
  outflowRate: number
  capacity: number
  storage: number
  lastUpdate: string
}

export interface Canal {
  id: string
  name: string
  level: 'main' | 'branch' | 'sub-branch'
  waterLevel: number
  flowRate: number
  maxFlowRate: number
  status: 'normal' | 'warning' | 'danger'
}

export interface WaterApplication {
  id: string
  villageName: string
  contactPerson: string
  contactPhone: string
  cropType: string
  cropArea: number
  priority: 1 | 2 | 3
  requiredWaterAmount: number
  applicationDate: string
  expectedStartDate: string
  expectedDuration: number
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  remark?: string
}

export interface WaterAllocation {
  id: string
  date: string
  timeSlot: string
  canalId: string
  canalName: string
  targetArea: string
  allocatedAmount: number
  actualAmount?: number
  gateId: string
  gateOpening: number
  status: 'scheduled' | 'in-progress' | 'completed'
}

export interface Gate {
  id: string
  name: string
  canalId: string
  canalName: string
  location: string
  currentOpening: number
  maxOpening: number
  status: 'open' | 'closed' | 'adjusting'
  lastOperation: string
}

export interface GateOperation {
  id: string
  gateId: string
  gateName: string
  operator: string
  targetOpening: number
  startTime: string
  endTime: string
  status: 'pending' | 'executing' | 'completed' | 'cancelled'
  remark?: string
}

export interface RotationSchedule {
  id: string
  date: string
  sequence: number
  villageName: string
  canalId: string
  startTime: string
  endTime: string
  allocatedAmount: number
  status: 'scheduled' | 'in-progress' | 'completed'
}

export interface FieldFeedback {
  id: string
  reporter: string
  reportTime: string
  type: 'leakage' | 'blockage' | 'theft' | 'other'
  location: string
  description: string
  imageUrl?: string
  status: 'reported' | 'processing' | 'resolved'
  handler?: string
  handleTime?: string
  handleResult?: string
}

export interface DailyStatistics {
  date: string
  plannedAmount: number
  actualAmount: number
  applicationCount: number
  completedCount: number
  feedbackCount: number
  resolvedFeedbackCount: number
}

export interface WaterUsageReport {
  villageName: string
  cropArea: number
  plannedWater: number
  actualWater: number
  arrivalRate: number
  overTimeMinutes: number
  waterSaving: number
}
