<script setup>
import { computed } from 'vue';
import { bf1Map, bf1Mode, bfvMap, bfvMode } from '../data/mapData';
import { bf1MapImages, bfvMapImages } from '../data/mapImages';
import { formatTimestamp, getReportUrl } from '../services/api';

const props = defineProps({
  match: {
    type: Object,
    required: true
  },
  gameType: {
    type: String,
    default: 'bf1'
  }
});

// 获取地图名称
const mapName = computed(() => {
  const mapData = props.gameType === 'bf1' ? bf1Map : bfvMap;
  return mapData[props.match.map] || props.match.map;
});

// 获取模式名称
const modeName = computed(() => {
  const modeData = props.gameType === 'bf1' ? bf1Mode : bfvMode;
  return modeData[props.match.mode] || props.match.mode;
});

// 获取地图背景图片
const mapImage = computed(() => {
  const mapImages = props.gameType === 'bf1' ? bf1MapImages : bfvMapImages;
  return mapImages[props.match.map] || '';
});

// 格式化时间
const formattedTime = computed(() => {
  return formatTimestamp(props.match.timestamp);
});

// 获取战报详情页链接
const reportUrl = computed(() => {
  return getReportUrl(props.match.id, props.gameType);
});

// 打开战报详情页
const openReport = () => {
  window.open(reportUrl.value, '_blank');
};
</script>

<template>
  <div class="match-card" @click="openReport">
    <div class="match-card-bg" :style="{ backgroundImage: `url(${mapImage})` }">
      <div class="match-card-overlay"></div>
    </div>
    <div class="match-card-content">
      <div class="match-card-header">
        <h3 class="map-name">{{ mapName }}</h3>
        <span class="mode-name">{{ modeName }}</span>
      </div>
      <div class="match-card-body">
        <div class="server-name">{{ match.serverName }}</div>
        <div class="match-time">{{ formattedTime }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.match-card {
  position: relative;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 20px;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s, box-shadow 0.2s;
  height: 180px;
  color: #fff;
}

.match-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
}

.match-card-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
}

.match-card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.9) 90%);
}

.match-card-content {
  position: relative;
  z-index: 1;
  padding: 15px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.match-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.map-name {
  font-size: 18px;
  font-weight: bold;
  margin: 0;
  color: var(--bf1-orange);
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
}

.mode-name {
  background-color: rgba(0, 0, 0, 0.5);
  padding: 4px 8px;
  border-radius: 3px;
  font-size: 12px;
}

.match-card-body {
  margin-top: auto;
}

.server-name {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.match-time {
  font-size: 12px;
  opacity: 0.7;
}
</style> 