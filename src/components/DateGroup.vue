<script setup>
import { computed } from 'vue';
import MatchCard from './MatchCard.vue';

const props = defineProps({
  date: {
    type: String,
    required: true
  },
  matches: {
    type: Array,
    required: true
  },
  gameType: {
    type: String,
    default: 'bf1'
  }
});

// 格式化日期显示
const formattedDate = computed(() => {
  const date = new Date(props.date);
  
  // 判断是否为今天
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  
  // 判断是否为昨天
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();
  
  if (isToday) {
    return '今天';
  } else if (isYesterday) {
    return '昨天';
  } else {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
});
</script>

<template>
  <div class="date-group glass-panel">
    <div class="date-header">
      <div class="date-line"></div>
      <h2 class="date-title">{{ formattedDate }}</h2>
      <div class="date-line"></div>
    </div>
    
    <div class="match-cards">
      <MatchCard 
        v-for="match in matches" 
        :key="match.id" 
        :match="match"
        :game-type="gameType"
      />
    </div>
  </div>
</template>

<style scoped>
.date-group {
  margin-bottom: 40px;
  padding: 20px;
}

.date-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.date-title {
  font-size: 18px;
  color: var(--bf1-orange);
  margin: 0 15px;
  white-space: nowrap;
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}

.date-line {
  flex: 1;
  height: 1px;
  background-color: rgba(255, 255, 255, 0.15);
}

.match-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

@media (max-width: 768px) {
  .match-cards {
    grid-template-columns: 1fr;
  }
}
</style> 