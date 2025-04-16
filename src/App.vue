<script setup>
import { ref, onMounted, computed } from 'vue';
import MatchCard from './components/MatchCard.vue';
import DateGroup from './components/DateGroup.vue';
import ConfigPanel from './components/ConfigPanel.vue';
import PaginationControls from './components/PaginationControls.vue';
import BackgroundRotator from './components/BackgroundRotator.vue';
import { fetchMatchList } from './services/api';

// 状态
const matches = ref([]);
const loading = ref(false);
const error = ref(null);
const playerId = ref('bilibili22'); // 默认玩家ID
const currentTimestamp = ref(null); // 当前时间戳
const previousTimestamps = ref([]); // 保存之前的时间戳，用于上一页操作
const currentPage = ref(1); // 当前页码

// 获取战报列表
const loadMatches = async (reset = false) => {
  if (loading.value) return;
  
  try {
    loading.value = true;
    error.value = null;
    
    if (reset) {
      matches.value = [];
      previousTimestamps.value = [];
      currentPage.value = 1;
    }
    
    const data = await fetchMatchList(playerId.value, currentTimestamp.value);
    
    if (data && data.length > 0) {
      matches.value = data;
      // 如果不是重置操作，更新previousTimestamps用于上一页操作
      if (!reset && currentTimestamp.value) {
        previousTimestamps.value.push(currentTimestamp.value);
      }
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
};

// 设置时间戳
const setTimestamp = (timestamp) => {
  currentTimestamp.value = timestamp;
  previousTimestamps.value = [];
  currentPage.value = 1;
  loadMatches(true);
};

// 下一页
const nextPage = () => {
  currentPage.value++;
  loadMatches();
};

// 上一页
const prevPage = () => {
  if (currentPage.value <= 1 || previousTimestamps.value.length === 0) return;
  
  currentPage.value--;
  // 获取上一页的时间戳
  currentTimestamp.value = previousTimestamps.value.pop();
  loadMatches();
};

// 检查是否有下一页和上一页
const hasNextPage = computed(() => matches.value.length > 0);
const hasPrevPage = computed(() => currentPage.value > 1);

// 页面加载时获取战报
onMounted(() => {
  loadMatches(true);
});
</script>

<template>
  <div class="app-container">
    <!-- 背景轮换 -->
    <BackgroundRotator />
    
    <div class="app-header">
      <div class="logo">
        <h1>战地1战报查询</h1>
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
            />
          </div>
          
          <PaginationControls 
            v-if="matches.length > 0" 
            :page="currentPage"
            :has-next="hasNextPage"
            :has-prev="hasPrevPage"
            @next="nextPage"
            @prev="prevPage"
          />
        </div>
        
        <!-- 右侧配置面板 -->
        <div class="config-container">
          <ConfigPanel 
            :player-id="playerId"
            :timestamp="currentTimestamp"
            @search="searchPlayer"
            @set-timestamp="setTimestamp"
          />
        </div>
      </div>
    </div>
    
    <footer class="app-footer">
      <p>战地1战报查询 © {{ new Date().getFullYear() }}</p>
    </footer>
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
}

.match-list-container {
  flex: 3;
}

.config-container {
  flex: 1;
  position: sticky;
  top: 20px;
  align-self: flex-start;
}

.empty-state {
  text-align: center;
  padding: 50px 0;
  font-size: 18px;
  color: #aaa;
  background-color: rgba(0, 0, 0, 0.4);
  border-radius: 8px;
  backdrop-filter: blur(5px);
}

.error-message {
  background-color: rgba(255, 0, 0, 0.2);
  color: #ff6b6b;
  padding: 15px;
  border-radius: 4px;
  text-align: center;
  margin-bottom: 20px;
  backdrop-filter: blur(5px);
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 0;
  background-color: rgba(0, 0, 0, 0.4);
  border-radius: 8px;
  backdrop-filter: blur(5px);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: var(--bf1-orange);
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 页脚 */
.app-footer {
  margin-top: 40px;
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  color: #aaa;
  font-size: 14px;
}

/* 响应式布局 */
@media (max-width: 992px) {
  .content-layout {
    flex-direction: column-reverse;
  }
  
  .config-container {
    position: static;
    margin-bottom: 20px;
  }
}

@media (max-width: 768px) {
  .app-header {
    flex-direction: column;
  }
  
  .logo {
    margin-bottom: 20px;
  }
}
</style>
