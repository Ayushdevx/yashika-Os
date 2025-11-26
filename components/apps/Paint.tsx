
import React, { useRef, useState, useEffect } from 'react';
import { AppProps } from '../../types';
import { Pencil, Eraser, Square, Circle, Minus, PaintBucket, Download, Trash2, Undo } from 'lucide-react';

const Paint: React.FC<AppProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [color, setColor] = useState('#000000');
  const [tool, setTool] = useState<'pencil' | 'eraser' | 'rect' | 'circle' | 'line'>('pencil');
  const [lineWidth, setLineWidth] = useState(2);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [snapshot, setSnapshot] = useState<ImageData | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.fillStyle = 'white';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.lineCap = 'round';
        context.lineJoin = 'round';
        setCtx(context);
      }
    }
  }, []);

  const startDrawing = (e: React.MouseEvent) => {
    if (!ctx || !canvasRef.current) return;
    setIsDrawing(true);
    setStartPos({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
    setSnapshot(ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height));
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing || !ctx || !canvasRef.current || !snapshot) return;

    if (tool === 'pencil' || tool === 'eraser') {
      ctx.strokeStyle = tool === 'eraser' ? 'white' : color;
      ctx.lineWidth = lineWidth;
      ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
      ctx.stroke();
    } else {
      ctx.putImageData(snapshot, 0, 0);
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      
      const currentX = e.nativeEvent.offsetX;
      const currentY = e.nativeEvent.offsetY;
      
      ctx.beginPath();
      if (tool === 'rect') {
          ctx.strokeRect(startPos.x, startPos.y, currentX - startPos.x, currentY - startPos.y);
      } else if (tool === 'circle') {
          const radius = Math.sqrt(Math.pow(currentX - startPos.x, 2) + Math.pow(currentY - startPos.y, 2));
          ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
          ctx.stroke();
      } else if (tool === 'line') {
          ctx.moveTo(startPos.x, startPos.y);
          ctx.lineTo(currentX, currentY);
          ctx.stroke();
      }
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
      if (ctx && canvasRef.current) {
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
  };

  return (
    <div className="h-full flex flex-col bg-gray-200 text-black">
      {/* Toolbar */}
      <div className="h-14 bg-[#f0f0f0] border-b border-gray-300 flex items-center px-4 gap-4 select-none">
          <div className="flex bg-white p-1 rounded border border-gray-300 shadow-sm">
              {[
                { id: 'pencil', icon: <Pencil size={18} /> },
                { id: 'eraser', icon: <Eraser size={18} /> },
                { id: 'rect', icon: <Square size={18} /> },
                { id: 'circle', icon: <Circle size={18} /> },
                { id: 'line', icon: <Minus size={18} /> }
              ].map(t => (
                  <button 
                    key={t.id}
                    onClick={() => setTool(t.id as any)}
                    className={`p-2 rounded ${tool === t.id ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                  >
                      {t.icon}
                  </button>
              ))}
          </div>

          <div className="flex flex-col gap-1 w-24">
              <span className="text-[10px] text-gray-500 uppercase font-bold">Size: {lineWidth}px</span>
              <input 
                type="range" min="1" max="20" 
                value={lineWidth} 
                onChange={(e) => setLineWidth(Number(e.target.value))}
                className="h-2 w-full"
              />
          </div>

          <div className="flex gap-1 flex-wrap w-32">
              {['#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffffff'].map(c => (
                  <button 
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-6 h-6 rounded border border-gray-400 ${color === c ? 'ring-2 ring-blue-500' : ''}`}
                    style={{ backgroundColor: c }}
                  />
              ))}
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-6 h-6 p-0 border-0" />
          </div>
          
          <div className="ml-auto flex gap-2">
               <button onClick={clearCanvas} className="p-2 hover:bg-red-100 text-red-500 rounded" title="Clear">
                   <Trash2 size={18} />
               </button>
               <button className="p-2 hover:bg-gray-200 rounded" title="Save">
                   <Download size={18} />
               </button>
          </div>
      </div>

      <div className="flex-1 p-4 bg-gray-300 overflow-hidden flex items-center justify-center">
          <div className="bg-white shadow-xl relative w-full h-full max-w-[1200px] max-h-[800px] cursor-crosshair">
             <canvas 
                ref={canvasRef}
                className="w-full h-full"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
             />
          </div>
      </div>
    </div>
  );
};

export default Paint;
