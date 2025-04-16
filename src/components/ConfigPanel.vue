<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  playerId: {
    type: String,
    required: true
  },
  timestamp: {
    type: Number,
    default: null
  },
  gameType: {
    type: String,
    default: 'bf1'
  }
});

const emit = defineEmits(['search', 'setTimestamp', 'changeGameType']);

const localPlayerId = ref(props.playerId);
const dateTime = ref('');
const selectedGameType = ref(props.gameType);

const router = useRouter();

// 监听timestamp属性变化
watch(() => props.timestamp, (newVal) => {
  if (newVal) {
    // 将时间戳转换为本地日期时间字符串格式
    const date = new Date(newVal * 1000);
    dateTime.value = formatDateTimeForInput(date);
  } else {
    dateTime.value = '';
  }
}, { immediate: true });

// 监听gameType变化
watch(() => props.gameType, (newVal) => {
  selectedGameType.value = newVal;
}, { immediate: true });

// 格式化日期时间为input元素的值
function formatDateTimeForInput(date) {
  // 格式化为 YYYY-MM-DDThh:mm 格式
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// 初始化日期时间值
onMounted(() => {
  if (props.timestamp) {
    const date = new Date(props.timestamp * 1000);
    dateTime.value = formatDateTimeForInput(date);
  }
});

// 搜索玩家
const searchPlayer = () => {
  if (!localPlayerId.value.trim()) return;
  // 导航到对应的URL
  router.push(`/${selectedGameType.value}/matches/${localPlayerId.value}`);
  // 触发搜索事件
  emit('search', localPlayerId.value);
};

// 设置时间戳
const setTimestamp = () => {
  if (dateTime.value) {
    // 将日期时间字符串转换为时间戳
    const date = new Date(dateTime.value);
    const timestamp = Math.floor(date.getTime() / 1000); // 转换为秒
    emit('setTimestamp', timestamp);
  } else {
    emit('setTimestamp', null);
  }
};

// 重置时间
const resetDateTime = () => {
  dateTime.value = '';
  emit('setTimestamp', null);
};

// 获取当前可选择的最大日期时间
const maxDateTime = () => {
  const now = new Date();
  return formatDateTimeForInput(now);
};

// 切换游戏类型
const changeGameType = (type) => {
  selectedGameType.value = type;
  // 如果已经有玩家ID，则更新URL
  if (localPlayerId.value) {
    router.push(`/${type}/matches/${localPlayerId.value}`);
  }
  emit('changeGameType', type);
};
</script>

<template>
  <div class="config-panel">
    <h2 class="panel-title">查询配置</h2>
    
    <div class="config-section">
      <h3>游戏选择</h3>
      <div class="game-selector">
        <button 
          class="game-option" 
          :class="{ 'active': selectedGameType === 'bf1' }"
          @click="changeGameType('bf1')"
        >
          战地一
        </button>
        <button 
          class="game-option" 
          :class="{ 'active': selectedGameType === 'bfv' }"
          @click="changeGameType('bfv')"
        >
          战地五
        </button>
      </div>
    </div>
    
    <div class="config-section">
      <h3>玩家ID</h3>
      <div class="input-group">
        <input 
          type="text" 
          v-model="localPlayerId" 
          placeholder="输入玩家ID" 
          @keyup.enter="searchPlayer"
        >
        <button @click="searchPlayer">搜索</button>
      </div>
    </div>
    
    <div class="config-section">
      <h3>时间选择</h3>
      <div class="timestamp-info">
        <p>选择日期时间，查看该时间点之前的战报</p>
      </div>
      <div class="date-time-input">
        <input 
          type="datetime-local" 
          v-model="dateTime" 
          :max="maxDateTime()"
          class="date-time-field"
        >
      </div>
      <div class="date-actions">
        <button class="apply-btn" @click="setTimestamp">应用时间</button>
        <button class="reset-btn" @click="resetDateTime">重置时间</button>
      </div>
    </div>
    
    <div class="config-section">
      <h3>说明</h3>
      <div class="info-text">
        <p>- 选择游戏：战地一或战地五</p>
        <p>- 输入玩家ID后点击搜索</p>
        <p>- 选择日期时间获取特定时间之前的战报</p>
        <p>- 不选择时间则获取最新战报</p>
        <p>- 点击战报卡片可跳转到详情页</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.config-panel {
  background-color: rgba(30, 30, 30, 0.7);
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  height: 100%;
}

.panel-title {
  font-size: 22px;
  margin-bottom: 20px;
  color: var(--bf1-orange);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 10px;
}

.config-section {
  margin-bottom: 25px;
}

.config-section h3 {
  font-size: 16px;
  margin-bottom: 10px;
  color: #ffffff;
}

.game-selector {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 15px;
}

.game-option {
  background-color: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  padding: 10px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
  border-radius: 4px;
}

.game-option.active {
  background-color: var(--bf1-orange);
  border-color: var(--bf1-orange);
}

.game-option:hover:not(.active) {
  background-color: rgba(255, 255, 255, 0.1);
}

.input-group {
  display: flex;
  margin-bottom: 10px;
}

.input-group input {
  flex: 1;
  padding: 10px;
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  border-radius: 4px 0 0 4px;
}

.input-group button {
  background-color: var(--bf1-orange);
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.input-group button:hover {
  background-color: #e67e00;
}

.date-time-input {
  margin-bottom: 10px;
}

.date-time-field {
  width: 100%;
  padding: 10px;
  background-color: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  border-radius: 4px;
  font-family: inherit;
}

.date-time-field:focus {
  border-color: var(--bf1-orange);
  outline: none;
}

.date-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.apply-btn {
  background-color: var(--bf1-orange);
  color: white;
  border: none;
  padding: 8px 0;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-weight: 600;
}

.apply-btn:hover {
  background-color: #e67e00;
}

.reset-btn {
  background-color: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ccc;
  padding: 8px 0;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.reset-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
}

.timestamp-info {
  margin-bottom: 10px;
  font-size: 12px;
  color: #aaa;
}

.info-text {
  font-size: 13px;
  color: #bbb;
  line-height: 1.6;
}

.info-text p {
  margin-bottom: 5px;
}

/* 修改datetime-local样式使其与主题匹配 */
input[type="datetime-local"]::-webkit-calendar-picker-indicator {
  filter: invert(1);
  opacity: 0.6;
  cursor: pointer;
}

input[type="datetime-local"]::-webkit-calendar-picker-indicator:hover {
  opacity: 0.8;
}
</style> 