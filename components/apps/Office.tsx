
import React, { useState } from 'react';
import { AppProps } from '../../types';
import { FileText, Save, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Table, Layout, Plus, Play } from 'lucide-react';

export const Word: React.FC<AppProps> = () => {
    return (
        <div className="h-full flex flex-col bg-[#f3f2f1] text-black">
             {/* Ribbon */}
             <div className="bg-[#2b579a] text-white p-2 text-xs font-bold">Word Document</div>
             <div className="bg-[#f3f2f1] border-b border-gray-300 p-2 flex gap-4 shadow-sm">
                 <div className="flex gap-1">
                     <button className="p-1.5 hover:bg-gray-300 rounded"><Save size={16} /></button>
                 </div>
                 <div className="w-[1px] bg-gray-300 h-6 my-auto"></div>
                 <div className="flex gap-1">
                     <button className="p-1.5 hover:bg-gray-300 rounded"><Bold size={16} /></button>
                     <button className="p-1.5 hover:bg-gray-300 rounded"><Italic size={16} /></button>
                     <button className="p-1.5 hover:bg-gray-300 rounded"><Underline size={16} /></button>
                 </div>
                 <div className="w-[1px] bg-gray-300 h-6 my-auto"></div>
                 <div className="flex gap-1">
                     <button className="p-1.5 hover:bg-gray-300 rounded"><AlignLeft size={16} /></button>
                     <button className="p-1.5 hover:bg-gray-300 rounded"><AlignCenter size={16} /></button>
                     <button className="p-1.5 hover:bg-gray-300 rounded"><AlignRight size={16} /></button>
                 </div>
             </div>
             
             {/* Page */}
             <div className="flex-1 overflow-auto bg-[#e1e1e1] p-8 flex justify-center">
                 <div className="bg-white w-[800px] min-h-[1000px] shadow-lg p-12 outline-none" contentEditable>
                     <h1 className="text-3xl font-bold mb-4">Document Title</h1>
                     <p>Start typing your document here...</p>
                 </div>
             </div>
        </div>
    );
}

export const Excel: React.FC<AppProps> = () => {
    const cols = ['A','B','C','D','E','F','G','H'];
    const rows = Array.from({length: 20}, (_, i) => i + 1);

    return (
        <div className="h-full flex flex-col bg-white text-black">
             <div className="bg-[#217346] text-white p-2 text-xs font-bold">Excel Workbook</div>
             <div className="bg-[#f3f2f1] border-b border-gray-300 p-2 flex gap-4">
                 <button className="p-1 hover:bg-gray-300 rounded flex items-center gap-1 text-xs"><Save size={14} /> Save</button>
                 <button className="p-1 hover:bg-gray-300 rounded flex items-center gap-1 text-xs"><Table size={14} /> Format</button>
             </div>
             
             <div className="flex-1 overflow-auto">
                 <table className="w-full border-collapse">
                     <thead>
                         <tr>
                             <th className="bg-gray-100 border border-gray-300 w-10"></th>
                             {cols.map(c => (
                                 <th key={c} className="bg-gray-100 border border-gray-300 px-2 py-1 text-xs font-normal">{c}</th>
                             ))}
                         </tr>
                     </thead>
                     <tbody>
                         {rows.map(r => (
                             <tr key={r}>
                                 <td className="bg-gray-100 border border-gray-300 text-center text-xs text-gray-500">{r}</td>
                                 {cols.map(c => (
                                     <td key={`${r}-${c}`} className="border border-gray-300 p-0">
                                         <input className="w-full h-full border-none outline-none px-1 text-sm focus:ring-2 ring-green-500 z-10 relative" />
                                     </td>
                                 ))}
                             </tr>
                         ))}
                     </tbody>
                 </table>
             </div>
             <div className="bg-gray-100 border-t border-gray-300 px-2 py-1 flex gap-2 text-xs">
                 <button className="px-3 py-1 bg-white border-b-2 border-green-600 font-bold">Sheet1</button>
                 <button className="px-3 py-1 text-gray-500 hover:bg-gray-200 rounded-full"><Plus size={12}/></button>
             </div>
        </div>
    );
}

export const PowerPoint: React.FC<AppProps> = () => {
    return (
        <div className="h-full flex flex-col bg-[#f3f2f1] text-black">
             <div className="bg-[#b7472a] text-white p-2 text-xs font-bold">PowerPoint Presentation</div>
             <div className="bg-[#f3f2f1] border-b border-gray-300 p-2 flex gap-4">
                 <button className="p-1 hover:bg-gray-300 rounded flex items-center gap-1 text-xs"><Save size={14} /> Save</button>
                 <button className="p-1 hover:bg-gray-300 rounded flex items-center gap-1 text-xs"><Play size={14} /> Present</button>
                 <button className="p-1 hover:bg-gray-300 rounded flex items-center gap-1 text-xs"><Layout size={14} /> New Slide</button>
             </div>
             
             <div className="flex-1 flex overflow-hidden">
                 {/* Sidebar */}
                 <div className="w-48 bg-gray-100 border-r border-gray-300 p-4 flex flex-col gap-4 overflow-y-auto">
                     {[1, 2, 3].map(i => (
                         <div key={i} className={`aspect-video bg-white shadow border-2 ${i === 1 ? 'border-[#b7472a]' : 'border-transparent'} p-2 transform scale-100`}>
                             <div className="w-full h-full bg-gray-50 flex items-center justify-center text-[8px] text-gray-400">Slide {i}</div>
                         </div>
                     ))}
                 </div>
                 
                 {/* Main Stage */}
                 <div className="flex-1 bg-[#d0d0d0] p-8 flex items-center justify-center">
                      <div className="aspect-video w-full max-w-[800px] bg-white shadow-2xl p-12 flex flex-col justify-center items-center text-center">
                          <h1 className="text-5xl font-bold mb-4 outline-none" contentEditable>Click to add title</h1>
                          <p className="text-xl text-gray-500 outline-none" contentEditable>Click to add subtitle</p>
                      </div>
                 </div>
             </div>
        </div>
    );
}
