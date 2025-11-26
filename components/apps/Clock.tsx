
import React, { useState, useEffect, useRef } from 'react';
import { AppProps } from '../../types';
import { Clock as ClockIcon, Timer, Hourglass, Bell, Plus, Trash2, Play, Pause, RotateCcw } from 'lucide-react';

const Clock: React.FC<AppProps> = () => {
  const [activeTab, setActiveTab] = useState<'clock' | 'alarm' | 'stopwatch' | 'timer'>('clock');

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] text-white font-sans">
      {/* Navigation */}
      <div className="flex justify-around p-4 border-b border-gray-700 bg-[#252526]">
        <button onClick={() => setActiveTab('alarm')} className={`flex flex-col items-center gap-1 ${activeTab === 'alarm' ? 'text-blue-400' : 'text-gray-400'}`}>
          <Bell size={20} /> <span className="text-xs">Alarm</span>
        </button>
        <button onClick={() => setActiveTab('clock')} className={`flex flex-col items-center gap-1 ${activeTab === 'clock' ? 'text-blue-400' : 'text-gray-400'}`}>
          <ClockIcon size={20} /> <span className="text-xs">Clock</span>
        </button>
        <button onClick={() => setActiveTab('stopwatch')} className={`flex flex-col items-center gap-1 ${activeTab === 'stopwatch' ? 'text-blue-400' : 'text-gray-400'}`}>
          <Timer size={20} /> <span className="text-xs">Stopwatch</span>
        </button>
        <button onClick={() => setActiveTab('timer')} className={`flex flex-col items-center gap-1 ${activeTab === 'timer' ? 'text-blue-400' : 'text-gray-400'}`}>
          <Hourglass size={20} /> <span className="text-xs">Timer</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-hidden relative">
        {activeTab === 'clock' && <WorldClock />}
        {activeTab === 'alarm' && <Alarm />}
        {activeTab === 'stopwatch' && <Stopwatch />}
        {activeTab === 'timer' && <CountdownTimer />}
      </div>
    </div>
  );
};

const WorldClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col items-center justify-center animate-in fade-in duration-500">
      <div className="text-gray-400 text-xl mb-2">Local Time</div>
      <div className="text-6xl font-light tracking-wider tabular-nums">
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
      <div className="text-xl text-gray-500 mt-2">
        {time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
      </div>
    </div>
  );
};

const Alarm = () => {
  const [alarms, setAlarms] = useState([{ id: 1, time: '07:00', label: 'Wake Up', active: true }]);

  const toggleAlarm = (id: number) => {
    setAlarms(alarms.map(a => a.id === id ? { ...a, active: !a.active } : a));
  };

  const deleteAlarm = (id: number) => {
    setAlarms(alarms.filter(a => a.id !== id));
  };

  const addAlarm = () => {
    const id = Date.now();
    setAlarms([...alarms, { id, time: '08:00', label: 'New Alarm', active: true }]);
  };

  return (
    <div className="h-full flex flex-col animate-in slide-in-from-right-4 duration-300">
      <div className="flex-1 overflow-y-auto space-y-2">
        {alarms.map(alarm => (
          <div key={alarm.id} className="bg-[#2d2d2d] p-4 rounded-lg flex items-center justify-between group">
            <div>
              <div className={`text-3xl font-light ${alarm.active ? 'text-white' : 'text-gray-500'}`}>{alarm.time}</div>
              <div className="text-xs text-gray-400">{alarm.label}</div>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => deleteAlarm(alarm.id)} className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 size={18} />
              </button>
              <div 
                onClick={() => toggleAlarm(alarm.id)}
                className={`w-10 h-6 rounded-full relative cursor-pointer transition-colors ${alarm.active ? 'bg-blue-500' : 'bg-gray-600'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${alarm.active ? 'left-5' : 'left-1'}`} />
              </div>
            </div>
          </div>
        ))}
      </div>
      <button onClick={addAlarm} className="absolute bottom-4 right-4 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-500 transition-colors">
        <Plus size={24} />
      </button>
    </div>
  );
};

const Stopwatch = () => {
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      const startTime = Date.now() - time;
      intervalRef.current = setInterval(() => {
        setTime(Date.now() - startTime);
      }, 10);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  };

  const handleLap = () => {
    setLaps([time, ...laps]);
  };

  const handleReset = () => {
    setRunning(false);
    setTime(0);
    setLaps([]);
  };

  return (
    <div className="h-full flex flex-col items-center pt-10 animate-in fade-in">
      <div className="text-6xl font-light font-mono tabular-nums mb-10 select-none">
        {formatTime(time)}
      </div>
      
      <div className="flex gap-4 mb-8">
        <button 
          onClick={() => setRunning(!running)}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${running ? 'bg-red-900/50 text-red-400 border border-red-700' : 'bg-green-900/50 text-green-400 border border-green-700'}`}
        >
          {running ? <Pause size={24} /> : <Play size={24} />}
        </button>
        {running ? (
           <button onClick={handleLap} className="w-16 h-16 rounded-full bg-gray-800 border border-gray-600 flex items-center justify-center hover:bg-gray-700">
             <span className="text-xs font-bold">Lap</span>
           </button>
        ) : (
           <button onClick={handleReset} className="w-16 h-16 rounded-full bg-gray-800 border border-gray-600 flex items-center justify-center hover:bg-gray-700">
             <RotateCcw size={20} />
           </button>
        )}
      </div>

      <div className="flex-1 w-full overflow-y-auto border-t border-gray-700">
        {laps.map((lap, i) => (
          <div key={i} className="flex justify-between px-8 py-3 border-b border-gray-800 text-sm">
            <span className="text-gray-400">Lap {laps.length - i}</span>
            <span className="font-mono">{formatTime(lap)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes default
  const [isActive, setIsActive] = useState(false);
  const [initialTime, setInitialTime] = useState(300);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const format = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const adjustTime = (amount: number) => {
      if (!isActive) {
          const newTime = Math.max(0, timeLeft + amount);
          setTimeLeft(newTime);
          setInitialTime(newTime);
      }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center animate-in fade-in">
      <div className="relative mb-12">
          {/* Circular Progress Placeholder */}
          <div className="w-64 h-64 rounded-full border-4 border-gray-800 flex items-center justify-center relative">
              <div className="text-6xl font-light font-mono">{format(timeLeft)}</div>
              {/* Simple visual indicator of progress */}
              <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                  <circle 
                    cx="128" cy="128" r="124" 
                    fill="none" stroke="#3b82f6" strokeWidth="4"
                    strokeDasharray={779} // 2 * pi * 124
                    strokeDashoffset={779 * (1 - timeLeft/initialTime)}
                    className="transition-all duration-1000 ease-linear"
                  />
              </svg>
          </div>
      </div>

      <div className="flex gap-6 items-center">
          <button onClick={() => adjustTime(-60)} className="p-2 hover:bg-white/10 rounded">-1m</button>
          <button 
            onClick={() => setIsActive(!isActive)}
            className={`w-16 h-16 rounded-full flex items-center justify-center ${isActive ? 'bg-yellow-600 text-white' : 'bg-blue-600 text-white'}`}
          >
            {isActive ? <Pause size={24} /> : <Play size={24} />}
          </button>
          <button 
            onClick={() => { setIsActive(false); setTimeLeft(300); setInitialTime(300); }}
            className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center"
          >
              <RotateCcw size={18} />
          </button>
          <button onClick={() => adjustTime(60)} className="p-2 hover:bg-white/10 rounded">+1m</button>
      </div>
    </div>
  );
};

export default Clock;
