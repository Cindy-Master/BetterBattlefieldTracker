<script setup>
import { ref, onMounted } from 'vue';
import mapImages from '../data/mapImages';

// 从mapImages对象中提取所有图片URL数组
const imageUrls = Object.values(mapImages);

// 当前显示的图片URL
const backgroundImage = ref('');

// 在组件挂载后随机选择一张背景图片
onMounted(() => {
  // 随机选择一张图片作为背景
  const randomIndex = Math.floor(Math.random() * imageUrls.length);
  backgroundImage.value = imageUrls[randomIndex];
});
</script>

<template>
  <div class="background-container">
    <div 
      class="background-image" 
      :style="{ backgroundImage: `url(${backgroundImage})` }"
    ></div>
    <div class="background-overlay"></div>
  </div>
</template>

<style scoped>
.background-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  overflow: hidden;
}

.background-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.background-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(20, 20, 20, 0.7);
  backdrop-filter: blur(2px);
}
</style> 