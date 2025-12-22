
import { Agent, DayInfo } from "../types";
import { AGENT_COLORS } from "../constants";

/**
 * 本地智能排班算法 (Local Smart Optimizer)
 * 完全在瀏覽器運行，不需 API Key。
 */
export const optimizeScheduleWithAI = async (
  agents: Agent[],
  monthDays: any[]
): Promise<DayInfo[]> => {
  // 模擬運算延遲，讓使用者感受到「運算中」的過程
  await new Promise(resolve => setTimeout(resolve, 800));

  const newSchedule: DayInfo[] = monthDays.map(d => ({
    ...d,
    slot1: [],
    slot2: []
  }));

  // 追蹤每個人的總班次，用於公平性分配
  const agentStats = new Map<string, number>();
  agents.forEach(a => agentStats.set(a.name, 0));

  // 獲取代理資訊的輔助函數
  const getAgentColor = (name: string) => {
    const ag = agents.find(a => a.name === name);
    return ag ? AGENT_COLORS[ag.colorIdx] : AGENT_COLORS[0];
  };

  // 檢查 PT 限制：滾動 7 天內不超過 2 班
  const checkPTLimit = (agent: Agent, currentDay: number, schedule: DayInfo[]) => {
    if (agent.type === 'FT') return true;
    
    let totalInLast7Days = 0;
    const startDay = Math.max(1, currentDay - 6);
    
    for (let d = startDay; d < currentDay; d++) {
      const dayData = schedule.find(s => s.day === d);
      if (!dayData) continue;
      if (dayData.slot1.some(s => s.name === agent.name)) totalInLast7Days++;
      if (dayData.slot2.some(s => s.name === agent.name)) totalInLast7Days++;
    }
    
    return totalInLast7Days < 2;
  };

  // 開始排班 (逐日、逐時段)
  newSchedule.forEach((day, index) => {
    [1, 2].map(slotNum => {
      const slotKey = `slot${slotNum}` as 'slot1' | 'slot2';
      
      // 1. 篩選目前時段可用的代理 (避開不可用、且符合 PT 限制)
      const eligible = agents.filter(a => {
        const isUnavail = (a.unavailable[day.day] || []).includes(slotNum);
        const alreadyWorkingThisDay = day.slot1.some(s => s.name === a.name) || day.slot2.some(s => s.name === a.name);
        return !isUnavail && !alreadyWorkingThisDay && checkPTLimit(a, day.day, newSchedule);
      });

      // 2. 排序：目前班次最少的優先 (確保公平性)
      eligible.sort((a, b) => (agentStats.get(a.name) || 0) - (agentStats.get(b.name) || 0));

      // 3. 分配人手 (至少 1 人，最多 2 人)
      const countToAssign = eligible.length >= 2 ? 2 : (eligible.length === 1 ? 1 : 0);
      
      for (let i = 0; i < countToAssign; i++) {
        const selected = eligible[i];
        day[slotKey].push({
          name: selected.name,
          color: AGENT_COLORS[selected.colorIdx]
        });
        // 更新統計
        agentStats.set(selected.name, (agentStats.get(selected.name) || 0) + 1);
      }
    });
  });

  return newSchedule;
};
