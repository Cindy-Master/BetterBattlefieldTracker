import { createRouter, createWebHistory } from 'vue-router'
import App from '../App.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: App,
    props: false
  },
  {
    path: '/:gameType/matches/:playerId',
    name: 'PlayerMatches',
    component: App,
    meta: { directAccess: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  console.log('路由跳转:', { from: from.fullPath, to: to.fullPath, params: to.params });
  
  // 将路由参数存储到全局对象，确保App.vue可以在创建时访问到
  if (to.params.playerId) {
    window.__ROUTER_PARAMS__ = {
      playerId: to.params.playerId,
      gameType: to.params.gameType && ['bf1', 'bfv'].includes(to.params.gameType) ? to.params.gameType : 'bf1',
      directAccess: true
    };
    console.log('路由参数已保存到全局变量:', window.__ROUTER_PARAMS__);
  }
  
  next();
})

export default router 