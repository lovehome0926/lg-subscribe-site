
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Role, LanguageCode, Agent, TimetableEntry, DayInfo, AuthUser } from './types';
import { LANGUAGES } from './constants';
import { Layout } from './components/Layout';
import { Schedule } from './components/Schedule';
import { AICoach } from './components/AICoach';
import { SalesKit } from './components/SalesKit';
import { AgentManagement } from './components/AgentManagement';
import { Login } from './components/Login';

const SESSION_KEY = 'lg_subscribe_user_session';
const AGENTS_KEY = 'lg_subscribe_agents_data';
const TIMETABLE_KEY = 'lg_subscribe_timetable_data';

const DEFAULT_AGENTS: Agent[] = [
  { id: 'M1001', name: 'Alex Tan', type: 'FT', unavailable: { 2: [1, 2], 5: [1] } },
  { id: 'F1002', name: 'Siti Nor', type: 'PT', unavailable: { 1: [1, 2], 3: [1, 2] } },
  { id: 'M1003', name: 'Kumar V', type: 'FT', unavailable: { 7: [1, 2] } },
];

const App: React.FC = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [activeTab, setActiveTab] = useState('schedule');
  const [language, setLanguage] = useState<LanguageCode>('zh');
  const [selectedMonth] = useState('2026-01');

  const translations = LANGUAGES[language];

  // 1. 初始化代理数据 (从本地存储读取)
  const [agents, setAgents] = useState<Agent[]>(() => {
    const saved = localStorage.getItem(AGENTS_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_AGENTS;
  });

  // 2. 初始化排班表数据
  const [timetable, setTimetable] = useState<TimetableEntry[]>(() => {
    const saved = localStorage.getItem(TIMETABLE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  // 3. 登录状态持久化
  useEffect(() => {
    const saved = localStorage.getItem(SESSION_KEY);
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {
        localStorage.removeItem(SESSION_KEY);
      }
    }
  }, []);

  // 4. 当数据改变时，自动保存到本地存储
  useEffect(() => {
    localStorage.setItem(AGENTS_KEY, JSON.stringify(agents));
  }, [agents]);

  useEffect(() => {
    if (timetable.length > 0) {
      localStorage.setItem(TIMETABLE_KEY, JSON.stringify(timetable));
    }
  }, [timetable]);

  const monthInfo = useMemo<DayInfo[]>(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month, 0);
    const daysCount = date.getDate();
    return Array.from({ length: daysCount }, (_, i) => {
      const d = i + 1;
      const dow = new Date(year, month - 1, d).getDay();
      return { day: d, dow, isWeekend: dow === 0 || dow === 6 };
    });
  }, [selectedMonth]);

  // 如果没有初始排班表，则根据月份生成空的
  useEffect(() => {
    if (timetable.length === 0) {
      setTimetable(monthInfo.map(info => ({ ...info, slot1: [], slot2: [] })));
    }
  }, [monthInfo]);

  const handleGenerate = useCallback(() => {
    const firstDayDow = monthInfo[0].dow;
    const weeklyAssignments: Record<string, Record<number, { total: number; weekdays: number; weekends: number }>> = {};
    
    agents.forEach(a => {
      weeklyAssignments[a.name] = {};
    });

    const newTable = monthInfo.map(info => {
      const weekIdx = Math.floor((info.day + firstDayDow - 1) / 7);

      const canAssign = (agent: Agent, slot: number) => {
        if ((agent.unavailable[info.day] || []).includes(slot)) return false;
        if (agent.type === 'PT') {
          const stats = weeklyAssignments[agent.name][weekIdx] || { total: 0, weekdays: 0, weekends: 0 };
          if (stats.total >= 2) return false;
          if (info.isWeekend && stats.weekends === 1 && stats.weekdays === 0) return false;
        }
        return true;
      };

      const shuffledAgents = [...agents].sort(() => Math.random() - 0.5);

      const slot1Candidates = shuffledAgents.filter(a => canAssign(a, 1));
      const slot1 = slot1Candidates.slice(0, 2).map(a => {
        const stats = weeklyAssignments[a.name][weekIdx] || { total: 0, weekdays: 0, weekends: 0 };
        stats.total++;
        if (info.isWeekend) stats.weekends++;
        else stats.weekdays++;
        weeklyAssignments[a.name][weekIdx] = stats;
        return a.name;
      });

      const slot2Candidates = shuffledAgents.filter(a => !slot1.includes(a.name) && canAssign(a, 2));
      const slot2 = slot2Candidates.slice(0, 2).map(a => {
        const stats = weeklyAssignments[a.name][weekIdx] || { total: 0, weekdays: 0, weekends: 0 };
        stats.total++;
        if (info.isWeekend) stats.weekends++;
        else stats.weekdays++;
        weeklyAssignments[a.name][weekIdx] = stats;
        return a.name;
      });
      
      return { ...info, slot1, slot2 };
    });
    setTimetable(newTable);
  }, [monthInfo, agents]);

  const handleToggleSlot = useCallback((agentId: string, day: number, slot: number) => {
    setAgents(prev => prev.map(a => {
      if (a.id === agentId) {
        const current = a.unavailable[day] || [];
        const next = current.includes(slot) ? current.filter(s => s !== slot) : [...current, slot];
        const newUnavail = { ...a.unavailable };
        if (next.length === 0) delete newUnavail[day];
        else newUnavail[day] = next;
        return { ...a, unavailable: newUnavail };
      }
      return a;
    }));
  }, []);

  const handleAddAgent = (newAgentData: Omit<Agent, 'unavailable'>) => {
    setAgents(prev => [...prev, { ...newAgentData, unavailable: {} }]);
  };

  const handleDeleteAgent = (agentId: string) => {
    setAgents(prev => prev.filter(a => a.id !== agentId));
  };

  const handleLogin = (authUser: AuthUser) => {
    setUser(authUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify(authUser));
    setActiveTab('schedule');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  if (!user) {
    return (
      <Login 
        language={language} 
        setLanguage={setLanguage} 
        translations={translations} 
        onLogin={handleLogin}
        agents={agents}
      />
    );
  }

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      language={language} 
      setLanguage={setLanguage} 
      user={user}
      onLogout={handleLogout}
      translations={translations}
    >
      {activeTab === 'schedule' && (
        <Schedule 
          role={user.role} 
          translations={translations} 
          timetable={timetable} 
          selectedMonth={selectedMonth} 
          onGenerate={handleGenerate} 
        />
      )}
      {activeTab === 'ai' && <AICoach translations={translations} language={language} />}
      {activeTab === 'salesKit' && <SalesKit translations={translations} />}
      {activeTab === 'agents' && (
        <AgentManagement 
          role={user.role} 
          translations={translations} 
          agents={user.role === 'LM' ? agents.filter(a => a.id === user.agentId) : agents} 
          monthInfo={monthInfo} 
          onToggleSlot={handleToggleSlot} 
          onAddAgent={handleAddAgent}
          onDeleteAgent={handleDeleteAgent}
        />
      )}
    </Layout>
  );
};

export default App;
