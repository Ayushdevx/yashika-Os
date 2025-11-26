
import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid } from 'recharts';
import { Activity, Search, Play, RotateCw, Server, Shield, Monitor, Wifi, Lock, AlertCircle, Printer, Smartphone, HelpCircle, Terminal, Globe, ArrowRight, StopCircle, Globe2, List, FileText } from 'lucide-react';
import { AppProps } from '../../types';

// --- Types ---
interface TrafficData {
  time: number;
  inbound: number;
  outbound: number;
  cpu: number;
}

interface PortInfo {
  port: number;
  service: string;
  state: 'open' | 'filtered' | 'closed';
  version?: string;
}

interface ScanResult {
  ip: string;
  mac: string;
  hostname: string;
  os: string;
  status: 'Up' | 'Down';
  latency: string;
  ports: PortInfo[];
}

// --- Traffic Monitor Sub-Component ---
const TrafficMonitor: React.FC = () => {
  const [data, setData] = useState<TrafficData[]>([]);

  useEffect(() => {
    // Init data
    const initData = [];
    for (let i = 0; i < 20; i++) {
      initData.push({
        time: i,
        inbound: Math.floor(Math.random() * 500) + 50,
        outbound: Math.floor(Math.random() * 300) + 20,
        cpu: Math.floor(Math.random() * 60) + 10,
      });
    }
    setData(initData);

    const interval = setInterval(() => {
      setData(currentData => {
        const newData = [...currentData.slice(1)];
        newData.push({
          time: currentData[currentData.length - 1].time + 1,
          inbound: Math.floor(Math.random() * 800) + 100,
          outbound: Math.floor(Math.random() * 500) + 50,
          cpu: Math.floor(Math.random() * 80) + 10,
        });
        return newData;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-4 h-full animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-1/2 min-h-[200px]">
        <div className="bg-yashika-panel border border-gray-800 rounded p-2 flex flex-col">
          <h3 className="text-xs font-bold text-yashika-terminal mb-2 uppercase flex items-center gap-2">
            <Wifi size={14} /> Network Traffic (eth0)
          </h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="time" hide />
                <YAxis stroke="#666" fontSize={10} />
                <Tooltip contentStyle={{backgroundColor: '#111', border: '1px solid #333'}} />
                <Area type="monotone" dataKey="inbound" stroke="#10b981" fillOpacity={1} fill="url(#colorIn)" />
                <Area type="monotone" dataKey="outbound" stroke="#ef4444" fillOpacity={1} fill="url(#colorOut)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-yashika-panel border border-gray-800 rounded p-2 flex flex-col">
          <h3 className="text-xs font-bold text-yashika-accent mb-2 uppercase flex items-center gap-2">
            <Activity size={14} /> CPU Usage (%)
          </h3>
          <div className="flex-1 min-h-0">
             <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="time" hide />
                <YAxis domain={[0, 100]} stroke="#666" fontSize={10} />
                <Tooltip contentStyle={{backgroundColor: '#111', border: '1px solid #333'}} />
                <Line type="stepAfter" dataKey="cpu" stroke="#0ea5e9" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-yashika-panel border border-gray-800 rounded p-2 overflow-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-500 border-b border-gray-700">
                <th className="py-2 pl-2">PID</th>
                <th>Process</th>
                <th>User</th>
                <th>CPU%</th>
                <th>MEM%</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody className="font-mono text-gray-300">
              <tr className="border-b border-gray-800/50 hover:bg-white/5 transition-colors">
                <td className="py-1 pl-2 text-yashika-accent">1337</td>
                <td>nmap</td>
                <td>root</td>
                <td>12.5</td>
                <td>4.2</td>
                <td className="text-green-500">RUNNING</td>
              </tr>
               <tr className="border-b border-gray-800/50 hover:bg-white/5 transition-colors">
                <td className="py-1 pl-2 text-yashika-accent">402</td>
                <td>chrome</td>
                <td>yashika</td>
                <td>8.1</td>
                <td>15.4</td>
                <td className="text-green-500">RUNNING</td>
              </tr>
               <tr className="border-b border-gray-800/50 hover:bg-white/5 transition-colors">
                <td className="py-1 pl-2 text-yashika-accent">8821</td>
                <td>hydra</td>
                <td>root</td>
                <td>45.2</td>
                <td>2.1</td>
                <td className="text-green-500">RUNNING</td>
              </tr>
               <tr className="border-b border-gray-800/50 hover:bg-white/5 transition-colors">
                <td className="py-1 pl-2 text-yashika-accent">1</td>
                <td>systemd</td>
                <td>root</td>
                <td>0.1</td>
                <td>0.5</td>
                <td className="text-gray-500">SLEEPING</td>
              </tr>
            </tbody>
          </table>
      </div>
    </div>
  );
};

// --- Nmap GUI / Network Scanner Sub-Component ---
const NetworkScanner: React.FC = () => {
  const [target, setTarget] = useState('10.10.11.1');
  const [profile, setProfile] = useState('Intense Scan');
  const [command, setCommand] = useState('nmap -T4 -A -v 10.10.11.1');
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ScanResult[]>([]);
  const [scanOutput, setScanOutput] = useState<string[]>([]);
  const [activeView, setActiveView] = useState<'hosts' | 'output'>('hosts');
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  // Update command when target or profile changes
  useEffect(() => {
    let flags = '';
    switch (profile) {
        case 'Intense Scan': flags = '-T4 -A -v'; break;
        case 'Intense Scan plus UDP': flags = '-sS -sU -T4 -A -v'; break;
        case 'Quick Scan': flags = '-T4 -F'; break;
        case 'Ping Scan': flags = '-sn'; break;
        case 'Regular Scan': flags = ''; break;
        case 'Stealth SYN Scan': flags = '-sS'; break;
        default: flags = '-T4 -A -v';
    }
    setCommand(`nmap ${flags} ${target}`);
  }, [target, profile]);

  // Auto-scroll output
  useEffect(() => {
    if (outputRef.current) {
        outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [scanOutput, activeView]);

  // Define host profiles for realistic simulation
  const MOCK_HOSTS = [
    { 
        ip: '10.10.11.1', mac: '00:50:56:C0:00:01', hostname: 'gateway.local', os: 'Cisco IOS', 
        ports: [
            { port: 22, service: 'ssh', state: 'open', version: 'OpenSSH 7.6p1' },
            { port: 53, service: 'domain', state: 'open', version: 'dnsmasq 2.78' },
            { port: 80, service: 'http', state: 'open', version: 'uhttpd' }
        ] as PortInfo[]
    },
    { 
        ip: '10.10.11.5', mac: '00:0C:29:4F:8E:34', hostname: 'dc01.corp.local', os: 'Windows Server 2019', 
        ports: [
            { port: 53, service: 'domain', state: 'open', version: 'Microsoft DNS' },
            { port: 88, service: 'kerberos', state: 'open', version: 'Microsoft Windows Kerberos' },
            { port: 445, service: 'microsoft-ds', state: 'open', version: 'Windows Server 2019 Standard 17763' },
            { port: 3389, service: 'ms-wbt-server', state: 'open', version: 'Microsoft Terminal Services' }
        ]
    },
    { 
        ip: '10.10.11.24', mac: '00:0C:29:1A:2B:3C', hostname: 'web-prod-01', os: 'Ubuntu Linux 20.04', 
        ports: [
            { port: 22, service: 'ssh', state: 'open', version: 'OpenSSH 8.2p1' },
            { port: 80, service: 'http', state: 'open', version: 'Apache httpd 2.4.41' },
            { port: 443, service: 'https', state: 'open', version: 'Apache httpd 2.4.41' }
        ]
    }
  ];

  const startScan = () => {
    if (isScanning) return;
    
    setIsScanning(true);
    setProgress(0);
    setResults([]);
    setScanOutput([`Starting Nmap 7.94 at ${new Date().toLocaleTimeString()}`]);
    setActiveView('output'); // Switch to output view automatically

    let currentProgress = 0;
    const steps = 20;
    let stepCount = 0;

    const interval = setInterval(() => {
        stepCount++;
        currentProgress += 5;
        setProgress(currentProgress);

        // Simulation Logs
        if (stepCount === 1) {
            setScanOutput(prev => [...prev, `NSE: Loaded 156 scripts for scanning.`]);
            setScanOutput(prev => [...prev, `Initiating Ping Scan at ${new Date().toLocaleTimeString()}`]);
        }
        if (stepCount === 3) {
            setScanOutput(prev => [...prev, `Scanning ${target} [4 ports]`]);
            setScanOutput(prev => [...prev, `Completed Ping Scan at ${new Date().toLocaleTimeString()}, 0.01s elapsed (1 total hosts)`]);
        }
        if (stepCount === 6) {
            setScanOutput(prev => [...prev, `Initiating Parallel DNS resolution of 1 host.`]);
            setScanOutput(prev => [...prev, `Completed Parallel DNS resolution of 1 host.`]);
        }
        if (stepCount === 8) {
            setScanOutput(prev => [...prev, `Initiating SYN Stealth Scan at ${new Date().toLocaleTimeString()}`]);
        }
        if (stepCount === 15) {
             setScanOutput(prev => [...prev, `Discovered open port 80/tcp on ${target}`]);
             setScanOutput(prev => [...prev, `Discovered open port 22/tcp on ${target}`]);
        }
        
        if (currentProgress >= 100) {
            clearInterval(interval);
            setIsScanning(false);
            setScanOutput(prev => [...prev, `Nmap done: 1 IP address (1 host up) scanned in 2.45 seconds`]);
            
            // Determine result based on target input (simple matching)
            const matchedHost = MOCK_HOSTS.find(h => h.ip === target) || {
                 ip: target,
                 mac: '00:00:00:00:00:00',
                 hostname: 'unknown',
                 os: 'Unknown',
                 status: 'Up',
                 latency: '0.5ms',
                 ports: [{ port: 80, service: 'http', state: 'filtered' }]
            } as ScanResult;

            setResults([matchedHost]);
        }
    }, 150);
  };

  const getOsIcon = (os: string) => {
      if (os.includes('Windows')) return <Monitor size={12} className="text-blue-400" />;
      if (os.includes('Linux') || os.includes('Ubuntu')) return <Server size={12} className="text-orange-400" />;
      return <HelpCircle size={12} className="text-gray-500" />;
  };

  return (
    <div className="flex flex-col h-full gap-4 animate-in fade-in duration-300">
      {/* Nmap Controls */}
      <div className="flex flex-col gap-3 bg-yashika-panel p-3 rounded border border-gray-800">
          <div className="flex gap-4 items-end">
              <div className="flex-1">
                  <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Target</label>
                  <input 
                    type="text" 
                    value={target} 
                    onChange={(e) => setTarget(e.target.value)}
                    className="w-full bg-black/50 border border-gray-700 focus:border-yashika-accent rounded px-3 py-1.5 text-sm text-yashika-accent font-mono outline-none"
                    placeholder="10.10.11.1"
                  />
              </div>
              <div className="w-48">
                  <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Profile</label>
                  <select 
                    value={profile}
                    onChange={(e) => setProfile(e.target.value)}
                    className="w-full bg-black/50 border border-gray-700 rounded px-2 py-1.5 text-sm text-gray-200 outline-none"
                  >
                      <option>Intense Scan</option>
                      <option>Intense Scan plus UDP</option>
                      <option>Quick Scan</option>
                      <option>Ping Scan</option>
                      <option>Regular Scan</option>
                      <option>Stealth SYN Scan</option>
                  </select>
              </div>
              <button 
                onClick={startScan}
                disabled={isScanning}
                className={`
                    px-6 py-1.5 rounded text-sm font-bold transition-all flex items-center gap-2 h-[34px]
                    ${isScanning ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-yashika-accent text-black hover:bg-blue-400'}
                `}
              >
                {isScanning ? <RotateCw size={14} className="animate-spin" /> : <Play size={14} />}
                Scan
              </button>
          </div>
          
          <div>
               <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Command</label>
               <div className="flex items-center gap-2 bg-black/30 border border-gray-800 rounded px-2 py-1">
                   <Terminal size={12} className="text-green-500" />
                   <input 
                      readOnly 
                      value={command} 
                      className="bg-transparent border-none outline-none text-xs font-mono text-green-400 w-full opacity-80"
                   />
               </div>
          </div>
      </div>

      {/* Progress Bar */}
      {isScanning && (
        <div className="w-full bg-gray-800 h-1 rounded overflow-hidden">
          <div 
            className="bg-yashika-terminal h-full transition-all duration-100 ease-out shadow-[0_0_10px_rgba(16,185,129,0.5)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Output / Results Area */}
      <div className="flex-1 bg-yashika-panel border border-gray-800 rounded overflow-hidden flex flex-col">
        {/* Tabs */}
        <div className="flex border-b border-gray-800">
             <button 
                onClick={() => setActiveView('hosts')} 
                className={`px-4 py-2 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors ${activeView === 'hosts' ? 'border-yashika-accent text-white bg-white/5' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
             >
                 <List size={14} /> Hosts / Ports
             </button>
             <button 
                onClick={() => setActiveView('output')} 
                className={`px-4 py-2 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors ${activeView === 'output' ? 'border-yashika-accent text-white bg-white/5' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
             >
                 <FileText size={14} /> Nmap Output
             </button>
        </div>
        
        {/* View Content */}
        <div className="flex-1 overflow-auto bg-[#1a1b26]" ref={scrollRef}>
             {activeView === 'output' ? (
                 <div ref={outputRef} className="p-4 font-mono text-xs text-gray-300 space-y-1 h-full overflow-auto">
                     {scanOutput.length === 0 ? (
                         <span className="text-gray-600 italic">No scan output yet. Start a scan to see results.</span>
                     ) : (
                         scanOutput.map((line, i) => <div key={i}>{line}</div>)
                     )}
                 </div>
             ) : (
                <div className="p-0">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead className="sticky top-0 bg-[#161b22] text-gray-500 text-xs uppercase font-bold z-10 shadow-md">
                      <tr>
                        <th className="py-2 pl-4 w-32">IP Address</th>
                        <th className="py-2 w-24">Status</th>
                        <th className="py-2 w-32">Hostname</th>
                        <th className="py-2 w-32">OS</th>
                        <th className="py-2">Ports & Services</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800 font-mono text-gray-300">
                      {results.length === 0 ? (
                         <tr>
                            <td colSpan={5} className="py-12 text-center text-gray-600">
                                <div className="flex flex-col items-center gap-2">
                                    <List size={32} strokeWidth={1.5} />
                                    <span>No structured results available.</span>
                                </div>
                            </td>
                         </tr>
                      ) : (
                        results.map((host, idx) => (
                          <tr key={idx} className="hover:bg-white/5 transition-colors group animate-in slide-in-from-left-2 duration-300">
                            <td className="py-3 pl-4 text-yashika-accent font-bold group-hover:text-blue-300 align-top">
                                {host.ip}
                            </td>
                            <td className="py-3 align-top">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.6)]"></div>
                                    <span className="text-xs text-green-500">{host.status}</span>
                                    <span className="text-[10px] text-gray-600 ml-1">({host.latency})</span>
                                </div>
                            </td>
                            <td className="py-3 align-top text-xs">{host.hostname}</td>
                            <td className="py-3 align-top">
                                <div className="flex items-center gap-2 text-xs">
                                     {getOsIcon(host.os)}
                                     {host.os}
                                </div>
                            </td>
                            <td className="py-3 align-top">
                                <div className="flex flex-col gap-1">
                                    {host.ports.length === 0 ? (
                                        <span className="text-gray-600 text-xs italic">No open ports</span>
                                    ) : (
                                        host.ports.map((p, i) => (
                                            <div key={i} className="flex items-center gap-2 text-xs">
                                                <span className={`font-bold ${p.state === 'open' ? 'text-green-400' : 'text-yellow-500'}`}>
                                                    {p.port}/{p.service}
                                                </span>
                                                <span className={`text-[10px] uppercase px-1 rounded ${p.state === 'open' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                                    {p.state}
                                                </span>
                                                {p.version && <span className="text-gray-500 text-[10px] truncate max-w-[150px]">{p.version}</span>}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
             )}
        </div>
      </div>
    </div>
  );
};

// --- Ping Tool ---
const PingTool: React.FC = () => {
    const [target, setTarget] = useState('8.8.8.8');
    const [isRunning, setIsRunning] = useState(false);
    const [output, setOutput] = useState<string[]>([]);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll output
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [output]);

    const stopPing = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        setIsRunning(false);
    };

    const startPing = () => {
        if (isRunning) return;
        setOutput([]);
        setIsRunning(true);

        const ip = target.match(/^[\d.]+$/) ? target : `172.217.16.${Math.floor(Math.random()*255)}`;
        
        setOutput(prev => [...prev, `PING ${target} (${ip}) 56(84) bytes of data.`]);

        let seq = 1;
        intervalRef.current = setInterval(() => {
            const time = (Math.random() * 20 + 10).toFixed(1);
            setOutput(prev => [...prev, `64 bytes from ${ip}: icmp_seq=${seq} ttl=117 time=${time} ms`]);
            seq++;
            
            // Auto-stop after 4 pings for convenience in simulator
            if (seq > 4) {
                 stopPing();
                 setOutput(prev => [
                     ...prev, 
                     `\n--- ${target} ping statistics ---`, 
                     `4 packets transmitted, 4 received, 0% packet loss, time 3004ms`,
                     `rtt min/avg/max/mdev = 10.2/15.4/24.1/4.2 ms`
                 ]);
            }
        }, 1000);
    };

    useEffect(() => {
        return () => stopPing();
    }, []);

    return (
        <div className="flex flex-col h-full gap-4 animate-in fade-in duration-300">
             <div className="bg-yashika-panel p-3 rounded border border-gray-800 flex items-center gap-3">
                <div className="flex items-center gap-2 flex-1">
                    <span className="text-gray-400 font-bold text-xs uppercase">Target Host:</span>
                    <input 
                        type="text" 
                        value={target} 
                        onChange={(e) => setTarget(e.target.value)}
                        className="flex-1 bg-black/50 border border-gray-700 focus:border-yashika-accent rounded px-3 py-1.5 text-sm text-yashika-accent font-mono outline-none"
                        placeholder="google.com"
                    />
                </div>
                {isRunning ? (
                    <button onClick={stopPing} className="px-4 py-1.5 bg-red-600 hover:bg-red-500 rounded text-sm font-bold text-white flex items-center gap-2">
                         <StopCircle size={14} /> Stop
                    </button>
                ) : (
                    <button onClick={startPing} className="px-4 py-1.5 bg-yashika-accent hover:bg-blue-400 rounded text-sm font-bold text-black flex items-center gap-2">
                         <Play size={14} /> Ping
                    </button>
                )}
             </div>

             <div className="flex-1 bg-[#1e1e1e] border border-gray-800 rounded p-4 font-mono text-sm overflow-auto text-gray-300" ref={scrollRef}>
                 {output.length === 0 ? (
                     <div className="text-gray-600 flex flex-col items-center justify-center h-full gap-2">
                         <Terminal size={32} />
                         <span>Ready to ping. Enter a host and click start.</span>
                     </div>
                 ) : (
                     output.map((line, i) => (
                         <div key={i} className="whitespace-pre-wrap">{line}</div>
                     ))
                 )}
             </div>
        </div>
    );
};

// --- DNS Lookup Tool ---
const DnsTool: React.FC = () => {
    const [domain, setDomain] = useState('google.com');
    const [recordType, setRecordType] = useState('A');
    const [isLoading, setIsLoading] = useState(false);
    const [output, setOutput] = useState<string[]>([]);

    const lookup = () => {
        setIsLoading(true);
        // If PTR requested, modify the question section to show reverse IP
        const displayQuestion = recordType === 'PTR' && /^\d+\.\d+\.\d+\.\d+$/.test(domain) 
            ? `${domain.split('.').reverse().join('.')}.in-addr.arpa` 
            : domain;
            
        setOutput([`;; <<>> DiG 9.18.1 <<>> ${recordType} ${domain}`, `;; global options: +cmd`, `;; Got answer:`, `;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: ${Math.floor(Math.random()*65535)}`, `;; flags: qr rd ra; QUERY: 1, ANSWER: 0, AUTHORITY: 0, ADDITIONAL: 1`, ``, `;; QUESTION SECTION:`, `;${displayQuestion}.\t\t\tIN\t${recordType}`, ``]);

        setTimeout(() => {
            const answers = [];
            
            if (recordType === 'A') {
                answers.push(`${domain}.\t\t299\tIN\tA\t142.250.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`);
                answers.push(`${domain}.\t\t299\tIN\tA\t142.250.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`);
            } else if (recordType === 'MX') {
                answers.push(`${domain}.\t\t300\tIN\tMX\t10 smtp.${domain}.`);
            } else if (recordType === 'NS') {
                 answers.push(`${domain}.\t\t86400\tIN\tNS\tns1.${domain}.`);
                 answers.push(`${domain}.\t\t86400\tIN\tNS\tns2.${domain}.`);
            } else if (recordType === 'TXT') {
                answers.push(`${domain}.\t\t300\tIN\tTXT\t"v=spf1 include:_spf.${domain} ~all"`);
            } else if (recordType === 'AAAA') {
                 answers.push(`${domain}.\t\t299\tIN\tAAAA\t2607:f8b0:4005:804::200e`);
            } else if (recordType === 'PTR') {
                // Simulated reverse lookup
                const isIp = /^\d+\.\d+\.\d+\.\d+$/.test(domain);
                if (isIp) {
                    const reversed = domain.split('.').reverse().join('.') + '.in-addr.arpa';
                    // Generate a fake hostname based on the IP or a generic Google/AWS one
                    const fakeHost = domain.startsWith('8.8') ? 'dns.google.' : `host-${domain.replace(/\./g, '-')}.isp.com.`;
                    answers.push(`${reversed}.\t\t300\tIN\tPTR\t${fakeHost}`);
                } else {
                    // Invalid PTR request (domain instead of IP) - effectively empty answer or error in real world
                    // We'll simulate empty answer
                }
            }

            setOutput(prev => [
                ...prev, 
                `;; ANSWER SECTION:`, 
                ...answers, 
                ``, 
                `;; Query time: ${Math.floor(Math.random()*50 + 10)} msec`, 
                `;; SERVER: 8.8.8.8#53(8.8.8.8) (UDP)`, 
                `;; WHEN: ${new Date().toUTCString()}`, 
                `;; MSG SIZE  rcvd: ${Math.floor(Math.random()*100 + 50)}`
            ]);
            setIsLoading(false);
        }, 800);
    };

    return (
        <div className="flex flex-col h-full gap-4 animate-in fade-in duration-300">
             <div className="bg-yashika-panel p-3 rounded border border-gray-800 flex items-center gap-3">
                 <div className="flex items-center gap-2 flex-1">
                     <span className="text-gray-400 font-bold text-xs uppercase">Domain/IP:</span>
                     <input 
                         type="text" 
                         value={domain} 
                         onChange={(e) => setDomain(e.target.value)}
                         className="flex-1 bg-black/50 border border-gray-700 focus:border-yashika-accent rounded px-3 py-1.5 text-sm text-yashika-accent font-mono outline-none"
                     />
                 </div>
                 <select 
                    value={recordType}
                    onChange={(e) => setRecordType(e.target.value)}
                    className="bg-black/50 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-200 outline-none"
                 >
                     <option value="A">A (IPv4)</option>
                     <option value="AAAA">AAAA (IPv6)</option>
                     <option value="MX">MX (Mail)</option>
                     <option value="NS">NS (Nameserver)</option>
                     <option value="TXT">TXT</option>
                     <option value="PTR">PTR (Reverse)</option>
                 </select>
                 <button 
                    onClick={lookup} 
                    disabled={isLoading}
                    className="px-4 py-1.5 bg-yashika-accent hover:bg-blue-400 rounded text-sm font-bold text-black flex items-center gap-2 disabled:opacity-50"
                 >
                      {isLoading ? <RotateCw size={14} className="animate-spin" /> : <Search size={14} />} 
                      Lookup
                 </button>
             </div>

             <div className="flex-1 bg-[#1e1e1e] border border-gray-800 rounded p-4 font-mono text-sm overflow-auto text-gray-300">
                 {output.length === 0 ? (
                     <div className="text-gray-600 flex flex-col items-center justify-center h-full gap-2">
                         <Globe size={32} />
                         <span>Enter domain/IP and record type to query DNS.</span>
                     </div>
                 ) : (
                     output.map((line, i) => (
                         <div key={i} className={`whitespace-pre-wrap ${line.startsWith(';;') ? 'text-gray-500' : 'text-green-400'}`}>{line}</div>
                     ))
                 )}
             </div>
        </div>
    );
};

// --- Main Network Component ---
const NetworkMonitor: React.FC<AppProps> = () => {
  const [activeTab, setActiveTab] = useState<'monitor' | 'scanner' | 'ping' | 'dns'>('monitor');

  const TabButton = ({ id, label, icon }: { id: typeof activeTab, label: string, icon: React.ReactNode }) => (
      <button 
          onClick={() => setActiveTab(id)}
          className={`
            px-4 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-2
            ${activeTab === id ? 'bg-yashika-panel text-yashika-accent shadow-sm' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}
          `}
      >
          {icon} {label}
      </button>
  );

  return (
    <div className="h-full bg-[#0a0a0a] text-gray-200 p-2 flex flex-col font-mono">
      {/* Tabs */}
      <div className="flex items-center gap-1 mb-2 bg-[#1a1b26] p-1 rounded-lg border border-gray-800 w-fit">
        <TabButton id="monitor" label="Monitor" icon={<Activity size={14} />} />
        <TabButton id="scanner" label="Scanner" icon={<Search size={14} />} />
        <TabButton id="ping" label="Ping" icon={<Activity size={14} />} />
        <TabButton id="dns" label="DNS Lookup" icon={<Globe2 size={14} />} />
      </div>

      <div className="flex-1 min-h-0 bg-[#0f111a] border border-gray-800 rounded-lg p-3 relative overflow-hidden">
        {activeTab === 'monitor' && <TrafficMonitor />}
        {activeTab === 'scanner' && <NetworkScanner />}
        {activeTab === 'ping' && <PingTool />}
        {activeTab === 'dns' && <DnsTool />}
      </div>
    </div>
  );
};

export default NetworkMonitor;
