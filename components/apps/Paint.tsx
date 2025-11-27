import React, { useRef, useState, useEffect } from 'react';
import { AppProps } from '../../types';
import { Pencil, Eraser, Square, Circle, Minus, PaintBucket, Download, Trash2, Undo, Redo, Type, Triangle, Star, MousePointer } from 'lucide-react';
import { useOS } from '../../contexts/OSContext';

type ToolType = 'pencil' | 'eraser' | 'rect' | 'circle' | 'line' | 'fill' | 'text' | 'triangle' | 'star';

const Paint: React.FC<AppProps> = () => {
  const { fs } = useOS();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [color, setColor] = useState('#000000');
  const [tool, setTool] = useState<ToolType>('pencil');
  const [lineWidth, setLineWidth] = useState(2);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [snapshot, setSnapshot] = useState<ImageData | null>(null);

  // History Stack
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

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
        saveState(context); // Initial state
      }
    }
  }, []);

  const saveState = (context: CanvasRenderingContext2D = ctx!) => {
    if (!canvasRef.current) return;
    const imageData = context.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(imageData);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0 && ctx) {
      const newIndex = historyIndex - 1;
      ctx.putImageData(history[newIndex], 0, 0);
      setHistoryIndex(newIndex);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1 && ctx) {
      const newIndex = historyIndex + 1;
      ctx.putImageData(history[newIndex], 0, 0);
      setHistoryIndex(newIndex);
    }
  };

  const startDrawing = (e: React.MouseEvent) => {
    if (!ctx || !canvasRef.current) return;

    if (tool === 'fill') {
      floodFill(e.nativeEvent.offsetX, e.nativeEvent.offsetY, color);
      saveState();
      return;
    }

    if (tool === 'text') {
      const text = prompt('Enter text:');
      if (text) {
        ctx.fillStyle = color;
        ctx.font = `${lineWidth * 10}px Arial`;
        ctx.fillText(text, e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        saveState();
      }
      return;
    }

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
      ctx.fillStyle = color;

      const currentX = e.nativeEvent.offsetX;
      const currentY = e.nativeEvent.offsetY;
      const width = currentX - startPos.x;
      const height = currentY - startPos.y;

      ctx.beginPath();
      if (tool === 'rect') {
        ctx.strokeRect(startPos.x, startPos.y, width, height);
      } else if (tool === 'circle') {
        const radius = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2));
        ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (tool === 'line') {
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
      } else if (tool === 'triangle') {
        ctx.moveTo(startPos.x + width / 2, startPos.y);
        ctx.lineTo(startPos.x, startPos.y + height);
        ctx.lineTo(startPos.x + width, startPos.y + height);
        ctx.closePath();
        ctx.stroke();
      } else if (tool === 'star') {
        drawStar(ctx, startPos.x + width / 2, startPos.y + height / 2, 5, Math.abs(width) / 2, Math.abs(width) / 4);
        ctx.stroke();
      }
    }
  };

  const drawStar = (ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) => {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    let step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
  }

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveState();
    }
  };

  const clearCanvas = () => {
    if (ctx && canvasRef.current) {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      saveState();
    }
  };

  const handleSave = () => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      const timestamp = Date.now();
      // In a real app we would convert base64 to blob, but for simulation we'll just save a placeholder
      // or ideally, if fs supports it, save the dataUrl string.
      // Since our simulated FS is string based, we can save the dataURL.
      fs.writeFile(`/home/yashika/Downloads/drawing-${timestamp}.png`, dataUrl);
      alert('Image saved to Downloads!');
    }
  };

  // Flood Fill Algorithm
  const floodFill = (startX: number, startY: number, fillColor: string) => {
    if (!ctx || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const startPos = (startY * canvas.width + startX) * 4;
    const startR = data[startPos];
    const startG = data[startPos + 1];
    const startB = data[startPos + 2];
    const startA = data[startPos + 3];

    // Parse hex color
    const r = parseInt(fillColor.slice(1, 3), 16);
    const g = parseInt(fillColor.slice(3, 5), 16);
    const b = parseInt(fillColor.slice(5, 7), 16);

    if (startR === r && startG === g && startB === b) return;

    const stack = [[startX, startY]];

    while (stack.length) {
      const [x, y] = stack.pop()!;
      const pos = (y * canvas.width + x) * 4;

      if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) continue;

      if (data[pos] === startR && data[pos + 1] === startG && data[pos + 2] === startB && data[pos + 3] === startA) {
        data[pos] = r;
        data[pos + 1] = g;
        data[pos + 2] = b;
        data[pos + 3] = 255;

        stack.push([x + 1, y]);
        stack.push([x - 1, y]);
        stack.push([x, y + 1]);
        stack.push([x, y - 1]);
      }
    }

    ctx.putImageData(imageData, 0, 0);
  };

  return (
    <div className="h-full flex flex-col bg-gray-200 text-black">
      {/* Toolbar */}
      <div className="h-16 bg-[#f0f0f0] border-b border-gray-300 flex items-center px-4 gap-4 select-none shadow-sm">
        <div className="flex bg-white p-1 rounded-lg border border-gray-300 shadow-sm gap-1">
          {[
            { id: 'pencil', icon: <Pencil size={18} /> },
            { id: 'eraser', icon: <Eraser size={18} /> },
            { id: 'fill', icon: <PaintBucket size={18} /> },
            { id: 'text', icon: <Type size={18} /> },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTool(t.id as ToolType)}
              className={`p-2 rounded transition-colors ${tool === t.id ? 'bg-blue-100 text-blue-600 shadow-inner' : 'hover:bg-gray-100 text-gray-700'}`}
              title={t.id}
            >
              {t.icon}
            </button>
          ))}
        </div>

        <div className="w-[1px] h-8 bg-gray-300"></div>

        <div className="flex bg-white p-1 rounded-lg border border-gray-300 shadow-sm gap-1">
          {[
            { id: 'rect', icon: <Square size={18} /> },
            { id: 'circle', icon: <Circle size={18} /> },
            { id: 'triangle', icon: <Triangle size={18} /> },
            { id: 'star', icon: <Star size={18} /> },
            { id: 'line', icon: <Minus size={18} /> }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTool(t.id as ToolType)}
              className={`p-2 rounded transition-colors ${tool === t.id ? 'bg-blue-100 text-blue-600 shadow-inner' : 'hover:bg-gray-100 text-gray-700'}`}
              title={t.id}
            >
              {t.icon}
            </button>
          ))}
        </div>

        <div className="w-[1px] h-8 bg-gray-300"></div>

        <div className="flex flex-col gap-1 w-32">
          <span className="text-[10px] text-gray-500 uppercase font-bold flex justify-between">
            <span>Size</span>
            <span>{lineWidth}px</span>
          </span>
          <input
            type="range" min="1" max="50"
            value={lineWidth}
            onChange={(e) => setLineWidth(Number(e.target.value))}
            className="h-2 w-full accent-blue-500"
          />
        </div>

        <div className="w-[1px] h-8 bg-gray-300"></div>

        <div className="flex gap-1 flex-wrap w-40 bg-white p-1 rounded-lg border border-gray-300 shadow-inner">
          {['#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffffff', '#f97316', '#8b5cf6'].map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-6 h-6 rounded-sm border border-gray-200 transition-transform hover:scale-110 ${color === c ? 'ring-2 ring-blue-500 z-10 scale-110' : ''}`}
              style={{ backgroundColor: c }}
            />
          ))}
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-6 h-6 p-0 border-0 rounded overflow-hidden" />
        </div>

        <div className="ml-auto flex gap-2">
          <div className="flex bg-white p-1 rounded-lg border border-gray-300 shadow-sm gap-1 mr-2">
            <button onClick={undo} disabled={historyIndex <= 0} className="p-2 hover:bg-gray-100 rounded disabled:opacity-30 transition-colors" title="Undo">
              <Undo size={18} />
            </button>
            <button onClick={redo} disabled={historyIndex >= history.length - 1} className="p-2 hover:bg-gray-100 rounded disabled:opacity-30 transition-colors" title="Redo">
              <Redo size={18} />
            </button>
          </div>

          <button onClick={clearCanvas} className="p-2 hover:bg-red-100 text-red-500 rounded transition-colors" title="Clear Canvas">
            <Trash2 size={18} />
          </button>
          <button onClick={handleSave} className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded shadow-md transition-colors" title="Save Image">
            <Download size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 p-8 bg-gray-300 overflow-hidden flex items-center justify-center">
        <div className="bg-white shadow-2xl relative w-full h-full max-w-[1200px] max-h-[800px] cursor-crosshair rounded-lg overflow-hidden">
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

      <div className="h-6 bg-[#f0f0f0] border-t border-gray-300 flex items-center px-4 text-xs text-gray-500 justify-between">
        <span>{startPos.x}, {startPos.y}px</span>
        <span>{canvasRef.current?.width} x {canvasRef.current?.height}px</span>
      </div>
    </div>
  );
};

export default Paint;
