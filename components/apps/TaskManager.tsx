
import React, { useState, useEffect } from 'react';
import { useOS } from '../../contexts/OSContext';
import { Activity, Disc, Cpu, AlertCircle, Play } from 'lucide-react';
import { AppID, AppProps } from '../../types';
import { APP_REGISTRY } from '../../constants';

interface Process {
  pid: number;
  name: string;
  user: string;
  cpu: number;
  mem: number;
  status: 'Running' | 'Sleeping' | 'Zombie';
  windowId?: string; // Optional, links to real window
  appId?: AppID;
}

const SYSTEM_PROCESSES: Process[] = [
  { pid: 1, name: 'systemd', user: 'root', cpu: 0.1, mem: 0.5, status: 'Sleeping' },
  { pid: 2, name: 'kthreadd', user: 'root', cpu: 0.0, mem: 0.0, status: 'Sleeping' },
  { pid: 1042, name: 'gnome-shell', user: 'yashika', cpu: 2.5, mem: 5.2, status: 'Running' },
  { pid: 1840, name: 'dbus-daemon', user: 'messagebus', cpu: 0.0, mem: 0.2, status: 'Sleeping' },
  { pid: 2109, name: 'Xorg', user: 'root', cpu: 1.2, mem: 3.4, status: 'Running' },
];

const TaskManager: React.FC<AppProps> = () => {
  const { windows, closeWindow } = useOS();
  const [processes, setProcesses] = useState<Process[]>([]);
  const [selectedPid, setSelectedPid] = useState<number | null>(null);
  const [cpuUsage, setCpuUsage] = useState(0);
  const [memUsage, setMemUsage] = useState(0);

  // Sync open windows with processes list and simulate stats
  useEffect(() => {
    const updateProcesses = () => {
      // 1. Map real windows to processes
      const windowProcesses: Process[] = windows.map((win, index) => ({
        pid: 3000 + index + parseInt(win.id.split('-').pop() || '0') % 1000,
        name: APP_REGISTRY[win.appId].name.toLowerCase(),
        user: 'yashika',
        cpu: Math.random() * 5 + 0.1, // Random CPU 0.1 - 5%
        mem: Math.random() * 10 + 2,   // Random Mem 2 - 12%
        status: win.isMinimized ? 'Sleeping' : 'Running',
        windowId: win.id,
        appId: win.appId
      }));

      // 2. Update system processes stats
      const systemProcs = SYSTEM_PROCESSES.map(proc => ({
        ...proc,
        cpu: proc.status === 'Running' ? Math.random() * 2 : 0,
        mem: proc.mem + (Math.random() * 0.1 - 0.05)
      }));

      const allProcesses = [...systemProcs, ...windowProcesses];
      
      // Calculate totals
      const totalCpu = allProcesses.reduce((acc, curr) => acc + curr.cpu, 0);
      const totalMem = allProcesses.reduce((acc, curr) => acc + curr.mem, 0);

      setProcesses(allProcesses);
      setCpuUsage(Math.min(100, totalCpu));
      setMemUsage(Math.min(100, totalMem));
    };

    updateProcesses();
    const interval = setInterval(updateProcesses, 1000);
    return () => clearInterval(interval);
  }, [windows]);

  const handleTerminate = () => {
    if (selectedPid === null) return;

    const process = processes.find(p => p.pid === selectedPid);
    if (!process) return;

    if (process.windowId) {
      // Kill app
      closeWindow(process.windowId);
      setSelectedPid(null);
    } else {
      // Simulate fake kill prevention
      alert(`Permission denied: Cannot terminate system process '${process.name}' (PID: ${process.pid})`);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] text-gray-300 font-mono text-xs select-none">
      
      {/* Header Stats */}
      <div className="flex gap-4 p-4 bg-[#252526] border-b border-black">
        <div className="flex-1 bg-black/40 rounded p-3 flex items-center gap-3 border border-gray-700 relative overflow-hidden group">
           <Cpu size={24} className="text-blue-500 z-10" />
           <div className="z-10">
             <div className="text-gray-400 font-bold">CPU Usage</div>
             <div className="text-2xl text-blue-400 font-mono">{cpuUsage.toFixed(1)}%</div>
           </div>
           {/* Mini Chart BG */}
           <div className="absolute right-0 bottom-0 opacity-20 text-blue-500 transform translate-x-2 translate-y-2">
              <Activity size={64} />
           </div>
        </div>

        <div className="flex-1 bg-black/40 rounded p-3 flex items-center gap-3 border border-gray-700 relative overflow-hidden">
           <Disc size={24} className="text-purple-500 z-10" />
           <div className="z-10">
             <div className="text-gray-400 font-bold">Memory Usage</div>
             <div className="text-2xl text-purple-400 font-mono">{memUsage.toFixed(1)}%</div>
           </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 bg-[#2d2d2d] border-b border-black">
        <button 
          onClick={handleTerminate}
          disabled={selectedPid === null}
          className={`
            px-3 py-1.5 rounded flex items-center gap-2 transition-all
            ${selectedPid !== null 
                ? 'bg-red-900/50 text-red-200 hover:bg-red-800 hover:text-white border border-red-700' 
                : 'bg-gray-800 text-gray-600 cursor-not-allowed border border-transparent'}
          `}
        >
          <AlertCircle size={14} />
          End Task
        </button>
      </div>

      {/* Process Table */}
      <div className="flex-1 overflow-auto bg-[#1e1e1e]">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-[#252526] text-gray-400 font-bold shadow-sm z-10">
            <tr>
              <th className="p-2 border-b border-gray-700 w-16">PID</th>
              <th className="p-2 border-b border-gray-700">Name</th>
              <th className="p-2 border-b border-gray-700 w-24">User</th>
              <th className="p-2 border-b border-gray-700 w-24">Status</th>
              <th className="p-2 border-b border-gray-700 w-20 text-right">CPU%</th>
              <th className="p-2 border-b border-gray-700 w-20 text-right">MEM%</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {processes.map((proc) => (
              <tr 
                key={proc.pid}
                onClick={() => setSelectedPid(proc.pid)}
                className={`
                  cursor-pointer transition-colors
                  ${selectedPid === proc.pid ? 'bg-blue-900/40 text-white' : 'hover:bg-white/5'}
                `}
              >
                <td className="p-2 text-yashika-terminal">{proc.pid}</td>
                <td className="p-2 font-bold flex items-center gap-2">
                   {proc.status === 'Running' ? <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"/> : <div className="w-1.5 h-1.5 rounded-full bg-gray-500"/>}
                   {proc.name}
                </td>
                <td className="p-2 text-gray-500">{proc.user}</td>
                <td className={`p-2 ${proc.status === 'Running' ? 'text-green-400' : 'text-gray-500'}`}>{proc.status}</td>
                <td className="p-2 text-right font-mono">{proc.cpu.toFixed(1)}</td>
                <td className="p-2 text-right font-mono">{proc.mem.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Footer */}
      <div className="bg-[#007fd4] text-white px-2 py-0.5 flex justify-between text-[10px]">
        <span>Processes: {processes.length}</span>
        <span>Uptime: 01:23:45</span>
      </div>
    </div>
  );
};

export default TaskManager;
