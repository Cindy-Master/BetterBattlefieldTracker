<script setup>
import { computed } from 'vue';
import { mapData, modeData } from '../data/mapData';
import mapImages from '../data/mapImages';
import { formatTimestamp, getReportUrl } from '../services/api';

const props = defineProps({
  match: {
    type: Object,
    required: true
  }
});

// 获取地图名称
const mapName = computed(() => {
  return mapData[props.match.map] || props.match.map;
});

// 获取模式名称
const modeName = computed(() => {
  return modeData[props.match.mode] || props.match.mode;
});

// 获取地图背景图片
const mapImage = computed(() => {
  return mapImages[props.match.map] || '';
});

// 格式化时间
const formattedTime = computed(() => {
  return formatTimestamp(props.match.timestamp);
});

// 获取战报详情页链接
const reportUrl = computed(() => {
  return getReportUrl(props.match.id);
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
  z-index: 1;
}

.match-card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.8));
  z-index: 2;
}

.match-card-content {
  position: relative;
  padding: 20px;
  z-index: 3;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.match-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.map-name {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
}

.mode-name {
  font-size: 16px;
  padding: 5px 10px;
  background-color: rgba(255, 160, 0, 0.8);
  border-radius: 4px;
  font-weight: 600;
}

.match-card-body {
  margin-top: auto;
}

.server-name {
  margin-bottom: 10px;
  font-size: 14px;
  opacity: 0.9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.match-time {
  font-size: 14px;
  opacity: 0.8;
}
</style> 