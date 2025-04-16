<script setup>
import { defineEmits } from 'vue';

const props = defineProps({
  hasNext: {
    type: Boolean,
    default: false
  },
  hasPrev: {
    type: Boolean,
    default: false
  },
  page: {
    type: Number,
    default: 1
  }
});

const emit = defineEmits(['prev', 'next']);

// 上一页
const prevPage = () => {
  emit('prev');
};

// 下一页
const nextPage = () => {
  emit('next');
};
</script>

<template>
  <div class="pagination-controls">
    <button 
      class="pagination-btn" 
      @click="prevPage" 
      :disabled="!hasPrev"
      :class="{ 'disabled': !hasPrev }"
    >
      <span class="arrow">←</span> 上一页
    </button>
    
    <div class="page-info">
      第 {{ page }} 页
    </div>
    
    <button 
      class="pagination-btn" 
      @click="nextPage" 
      :disabled="!hasNext"
      :class="{ 'disabled': !hasNext }"
    >
      下一页 <span class="arrow">→</span>
    </button>
  </div>
</template>

<style scoped>
.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin: 30px 0;
}

.pagination-btn {
  background-color: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--bf1-orange);
  color: var(--bf1-orange);
  padding: 8px 15px;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
}

.pagination-btn:hover:not(.disabled) {
  background-color: var(--bf1-orange);
  color: white;
}

.pagination-btn.disabled {
  border-color: #555;
  color: #555;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: #aaa;
  background-color: rgba(0, 0, 0, 0.2);
  padding: 5px 15px;
  border-radius: 20px;
}

.arrow {
  font-size: 18px;
  margin: 0 5px;
}
</style> 