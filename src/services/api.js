/**
 * 战地API服务
 */

// 获取战报列表
export const fetchMatchList = async (playerId, gameType = 'bf1', before = null) => {
  if (!playerId) {
    console.error('缺少playerId参数');
    throw new Error('缺少playerId参数');
  }
  
  // 确保gameType是有效值
  if (gameType !== 'bf1' && gameType !== 'bfv') {
    console.warn(`无效的游戏类型: ${gameType}，将使用默认值bf1`);
    gameType = 'bf1';
  }
  
  // 使用正确的API基础URL
  let url = `/api/${gameType}/matches/${playerId}`;
  
  if (before) {
    url += `?before=${before}`;
  }
  
  try {
    console.log(`正在获取玩家[${playerId}]的${gameType}战报，URL: ${url}`);
    
    // 添加随机参数避免缓存
    const nocacheUrl = `${url}${url.includes('?') ? '&' : '?'}_nocache=${Date.now()}`;
    
    const response = await fetch(nocacheUrl, {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`成功获取[${playerId}]的${gameType}战报数据，共${data.length}条`);
    return data;
  } catch (error) {
    console.error(`获取[${playerId}]的${gameType}战报失败:`, error);
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