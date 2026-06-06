import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'overview',
    component: () => import('@/views/Overview.vue')
  },
  {
    path: '/application',
    name: 'application',
    component: () => import('@/views/Application.vue')
  },
  {
    path: '/plan',
    name: 'plan',
    component: () => import('@/views/Plan.vue')
  },
  {
    path: '/gate',
    name: 'gate',
    component: () => import('@/views/Gate.vue')
  },
  {
    path: '/rotation',
    name: 'rotation',
    component: () => import('@/views/Rotation.vue')
  },
  {
    path: '/feedback',
    name: 'feedback',
    component: () => import('@/views/Feedback.vue')
  },
  {
    path: '/statistics',
    name: 'statistics',
    component: () => import('@/views/Statistics.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
