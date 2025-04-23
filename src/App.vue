<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import MatchCard from './components/MatchCard.vue';
import DateGroup from './components/DateGroup.vue';
import ConfigPanel from './components/ConfigPanel.vue';
import PaginationControls from './components/PaginationControls.vue';
import BackgroundRotator from './components/BackgroundRotator.vue';
import { fetchMatchList } from './services/api';

// 路由
const route = useRoute();

// 读取全局路由参数（如果存在）
const routerParams = window.__ROUTER_PARAMS__ || {};
console.log('读取全局路由参数:', routerParams);

// 状态
const matches = ref([]);
const loading = ref(false);
const error = ref(null);
// 根据全局路由参数或路由参数初始化状态
const gameType = ref(
  routerParams.gameType || 
  (route.params.gameType && ['bf1', 'bfv'].includes(route.params.gameType) ? route.params.gameType : 'bf1')
);
const playerId = ref(routerParams.playerId || route.params.playerId || ''); // 改为空字符串
const currentTimestamp = ref(null); // 当前时间戳
const currentPage = ref(1); // 当前页码
const showMobileFilter = ref(false); // 移动端筛选器显示状态

// 用全局参数标记是否为直接访问
const isDirectAccess = ref(!!routerParams.directAccess);

// 清除全局参数，避免影响后续操作
if (window.__ROUTER_PARAMS__) {
  delete window.__ROUTER_PARAMS__;
}

console.log(`初始化状态: 玩家=${playerId.value}, 游戏=${gameType.value}, 直接访问=${isDirectAccess.value}`);

// 监听路由参数变化
watch(() => route.params, (params) => {
  console.log('路由参数变化:', params);
  
  let shouldLoadMatches = false;
  
  if (params.gameType && (params.gameType === 'bf1' || params.gameType === 'bfv')) {
    gameType.value = params.gameType;
    console.log('游戏类型已更新为:', gameType.value);
    shouldLoadMatches = true;
  }
  
  if (params.playerId) {
    playerId.value = params.playerId;
    console.log('玩家ID已更新为:', playerId.value);
    currentTimestamp.value = null;
    shouldLoadMatches = true;
  }
  
  // 如果参数变化，始终加载匹配的战报数据，无论是否直接访问
  if (shouldLoadMatches) {
    nextTick(() => {
      loadMatches(true);
      // 重置直接访问标记
      isDirectAccess.value = false;
    });
  }
}, { immediate: false }); // 改为false，避免初始重复触发

// 获取战报列表
const loadMatches = async (reset = false) => {
  if (loading.value) return;
  
  try {
    loading.value = true;
    error.value = null;
    
    if (reset) {
      matches.value = [];
      currentPage.value = 1;
    }
    
    console.log(`正在加载战报: 玩家=${playerId.value}, 游戏=${gameType.value}, 时间戳=${currentTimestamp.value}`);
    const data = await fetchMatchList(playerId.value, gameType.value, currentTimestamp.value);
    
    if (data && data.length > 0) {
      matches.value = data;
      // 保存最后一条记录的时间戳，用于下一页
      currentTimestamp.value = data[data.length - 1].timestamp;
    } else {
      matches.value = [];
    }
  } catch (err) {
    error.value = '加载战报失败，请稍后重试';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

// 按日期分组战报
const groupedMatches = computed(() => {
  const groups = {};
  
  matches.value.forEach(match => {
    const date = new Date(match.timestamp * 1000);
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    
    if (!groups[dateStr]) {
      groups[dateStr] = [];
    }
    
    groups[dateStr].push(match);
  });
  
  // 转换为数组并按日期排序
  return Object.entries(groups)
    .map(([date, matches]) => ({ date, matches }))
    .sort((a, b) => new Date(b.date) - new Date(a.date));
});

// 搜索特定玩家的战报
const searchPlayer = (id) => {
  if (!id.trim()) return;
  playerId.value = id;
  currentTimestamp.value = null;
  loadMatches(true);
  // 在移动端搜索后自动关闭筛选面板
  if (window.innerWidth <= 768) {
    showMobileFilter.value = false;
  }
};

// 设置时间戳
const setTimestamp = (timestamp) => {
  currentTimestamp.value = timestamp;
  currentPage.value = 1;
  loadMatches(true);
  // 在移动端设置时间后自动关闭筛选面板
  if (window.innerWidth <= 768) {
    showMobileFilter.value = false;
  }
};

// 下一页
const nextPage = () => {
  currentPage.value++;
  loadMatches();
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// 更改游戏类型
const changeGameType = (type) => {
  if (gameType.value !== type) {
    gameType.value = type;
    currentTimestamp.value = null;
    loadMatches(true);
  }
};

// 切换移动端筛选器显示状态
const toggleMobileFilter = () => {
  showMobileFilter.value = !showMobileFilter.value;
};

// 检查是否有下一页
const hasNextPage = computed(() => matches.value.length > 0);

// 在组件挂载时立即加载战报
onMounted(() => {
  console.log('组件挂载，当前路由参数:', route.params);
  // 只有当playerId有初始值时才加载战报
  if (playerId.value) {
    console.log(`初始化加载战报: 玩家=${playerId.value}, 游戏=${gameType.value}`);
    loadMatches(true);
  } else {
    console.log('组件挂载，无初始玩家ID，等待用户输入或路由导航');
    // 可选：在这里可以设置一个状态，提示用户进行搜索
  }
});
</script>

<template>
  <div class="app-container">
    <!-- 背景轮换 -->
    <BackgroundRotator :game-type="gameType" />
    
    <div class="app-header">
      <div class="logo">
        <h1>战地{{ gameType === 'bf1' ? '一' : '五' }}战报查询</h1>
      </div>
    </div>
    
    <div class="app-content">
      <!-- 错误提示 -->
      <div v-if="error" class="error-message">{{ error }}</div>
      
      <div class="content-layout">
        <!-- 左侧战报列表 -->
        <div class="match-list-container">
          <div v-if="matches.length === 0 && !loading && !error" class="empty-state">
            <p>无战报数据，请尝试搜索其他玩家</p>
          </div>
          
          <div v-if="loading" class="loading">
            <div class="loading-spinner"></div>
            <p>正在加载战报...</p>
          </div>
          
          <div v-if="!loading && matches.length > 0" class="match-groups">
            <DateGroup 
              v-for="group in groupedMatches" 
              :key="group.date" 
              :date="group.date" 
              :matches="group.matches"
              :game-type="gameType"
            />
          </div>
          
          <PaginationControls 
            v-if="matches.length > 0" 
            :page="currentPage"
            :has-next="hasNextPage"
            @next="nextPage"
          />
        </div>
        
        <!-- 右侧配置面板 - 桌面版 -->
        <div class="config-container desktop-only">
          <ConfigPanel 
            :player-id="playerId"
            :timestamp="currentTimestamp"
            :game-type="gameType"
            @search="searchPlayer"
            @set-timestamp="setTimestamp"
            @change-game-type="changeGameType"
          />
        </div>
        
        <!-- 移动端筛选按钮 -->
        <div class="mobile-filter-btn mobile-only" @click="toggleMobileFilter">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
          </svg>
        </div>
        
        <!-- 移动端筛选面板 -->
        <div class="mobile-filter-panel mobile-only" :class="{ 'active': showMobileFilter }">
          <div class="mobile-filter-header">
            <h2>筛选选项</h2>
            <button class="close-btn" @click="toggleMobileFilter">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="mobile-filter-content">
            <ConfigPanel 
              :player-id="playerId"
              :timestamp="currentTimestamp"
              :game-type="gameType"
              @search="searchPlayer"
              @set-timestamp="setTimestamp"
              @change-game-type="changeGameType"
            />
          </div>
        </div>
      </div>
    </div>
    
    <footer class="app-footer">
      <p>战地{{ gameType === 'bf1' ? '一' : '五' }}战报查询 © {{ new Date().getFullYear() }}</p>
      <a href="https://github.com/Cindy-Master" target="_blank" class="github-link">
        <svg height="24" width="24" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
        </svg>
        By:Cindy-Master
      </a>
    </footer>
    
    <!-- 移动端筛选器背景遮罩 -->
    <div class="mobile-filter-overlay mobile-only" v-if="showMobileFilter" @click="showMobileFilter = false"></div>
  </div>
</template>

<style>
/* 全局样式 */
:root {
  --bf1-orange: #fb8c00;
  --bf1-dark: #1e1e1e;
  --bf1-light: #f5f5f5;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Segoe UI', 'Microsoft YaHei', sans-serif;
  color: var(--bf1-light);
  line-height: 1.6;
  /* 移除原来的背景设置，现在使用BackgroundRotator组件 */
}

button {
  cursor: pointer;
}

/* 应用容器 */
.app-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
}

/* 头部 */
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.logo {
  display: flex;
  align-items: center;
}

.logo img {
  height: 40px;
  margin-right: 15px;
}

.logo h1 {
  font-size: 24px;
  font-weight: 600;
  color: var(--bf1-orange);
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}

/* 内容布局 */
.app-content {
  flex: 1;
}

.content-layout {
  display: flex;
  gap: 20px;
  position: relative;
}

/* 移动端和桌面端显示控制 */
.mobile-only {
  display: none !important;
}

.desktop-only {
  display: block;
}

/* 移动端筛选按钮 */
.mobile-filter-btn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: var(--bf1-orange);
  color: white;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  display: none;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  z-index: 100;
  cursor: pointer;
  transition: transform 0.2s, background-color 0.2s;
}

.mobile-filter-btn:hover, .mobile-filter-btn:active {
  background-color: #e67e00;
  transform: scale(1.05);
}

.mobile-filter-btn svg {
  height: 48px;
  width: 20px;
}

/* 移动端筛选面板 */
.mobile-filter-panel {
  position: fixed;
  top: 0;
  right: -100%;
  width: 85%;
  max-width: 350px;
  height: 100vh;
  background-color: var(--bf1-dark);
  z-index: 1000;
  transition: right 0.3s ease-in-out;
  box-shadow: -5px 0 15px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.mobile-filter-panel.active {
  right: 0;
}

.mobile-filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.mobile-filter-header h2 {
  font-size: 20px;
  color: var(--bf1-orange);
}

.close-btn {
  background: none;
  border: none;
  color: white;
  padding: 5px;
  cursor: pointer;
}

.mobile-filter-content {
  flex: 1;
  padding: 0;
  overflow-y: auto;
}

/* 移动端遮罩层 */
.mobile-filter-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  backdrop-filter: blur(2px);
}

/* 错误提示 */
.error-message {
  background-color: rgba(255, 0, 0, 0.1);
  border: 1px solid rgba(255, 0, 0, 0.3);
  color: #ff6b6b;
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 4px;
  text-align: center;
}

/* 战报列表 */
.match-list-container {
  flex: 1;
}

/* 配置面板 */
.config-container {
  width: 300px;
  min-width: 300px;
}

/* 加载动画 */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-left-color: var(--bf1-orange);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 空状态 */
.empty-state {
  padding: 40px 0;
  text-align: center;
  color: #aaa;
}

/* 页脚 */
.app-footer {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #aaa;
}

.github-link {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #aaa;
  transition: color 0.2s;
}

.github-link:hover {
  color: var(--bf1-orange);
}

/* 响应式布局 */
@media (max-width: 768px) {
  .content-layout {
    flex-direction: column;
  }
  
  .config-container {
    width: 100%;
    margin-bottom: 20px;
  }
  
  .mobile-only {
    display: block !important;
  }
  
  .desktop-only {
    display: none !important;
  }
  
  /* 移动端筛选按钮在手机端显示 */
  .mobile-filter-btn {
    display: flex !important;
  }
  
  .app-footer {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
  
  .app-container {
    padding: 15px;
  }
  
  .logo h1 {
    font-size: 20px;
  }
}
</style>
