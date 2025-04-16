<script setup>
import { ref, onMounted, watch } from 'vue';
import { bf1MapImages, bfvMapImages } from '../data/mapImages';

const props = defineProps({
  gameType: {
    type: String,
    default: 'bf1'
  }
});

const backgroundImage = ref('');

// 获取当前游戏的地图图片列表
const getMapImages = () => {
  const images = props.gameType === 'bf1' ? bf1MapImages : bfvMapImages;
  return Object.values(images);
};

// 随机选择一张背景图片
const selectRandomBackground = () => {
  const images = getMapImages();
  const randomIndex = Math.floor(Math.random() * images.length);
  backgroundImage.value = images[randomIndex];
};

// 监听游戏类型变化
watch(() => props.gameType, () => {
  // 当游戏类型变化时，随机选择一张新背景
  selectRandomBackground();
}, { immediate: true });

// 组件挂载时选择一个随机背景
onMounted(() => {
  selectRandomBackground();
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
}

.background-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
}

.background-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
}
</style> 