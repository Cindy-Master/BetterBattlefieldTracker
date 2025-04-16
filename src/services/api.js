/**
 * 战地API服务
 */

// 获取战报列表
export const fetchMatchList = async (playerId, gameType = 'bf1', before = null) => {
  let url = `/api/${gameType}/matches/${playerId}`;
  
  if (before) {
    url += `?before=${before}`;
  }
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('获取战报列表失败:', error);
    throw error;
  }
};

// 格式化时间戳为可读格式
export const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 构建战报详情页URL
export const getReportUrl = (matchId, gameType = 'bf1') => {
  return `https://battlefieldtracker.com/${gameType}/gamereport/origin/${matchId}`;
}; 