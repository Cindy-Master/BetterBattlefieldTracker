import { createRouter, createWebHistory } from 'vue-router'
import App from '../App.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: App
  },
  {
    path: '/:gameType/matches/:playerId',
    name: 'PlayerMatches',
    component: App
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 