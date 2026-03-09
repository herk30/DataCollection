'use client';
import React, { useEffect, useState, useRef} from "react";

export default function App(){
  const [count,setCount] = useState(1);
  const [writerName, setWriterName] = useState("writer_1");
  const [digitClass, setDigitClass] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [isLoaded,setIsLoaded] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  const canvasRef = useRef(null);

  useEffect(() => {
    clearCanvas();
    
    const savedCount = localStorage.getItem('dataCollect_count');
    const savedClass = localStorage.getItem('dataCollect_class');
    const savedWriter = localStorage.getItem('dataCollect_writer');
    const savedIsDone = localStorage.getItem('dataCollect_isDone');

    if (savedCount) setCount(parseInt(savedCount, 10));
    if (savedClass) setDigitClass(parseInt(savedClass, 10));
    if (savedWriter) setWriterName(savedWriter);
    if (savedIsDone) setIsDone(savedIsDone === 'true');

    setIsLoaded(true); 
  }, []);

  useEffect(() => {
    if (!isLoaded) return; 
    
    localStorage.setItem('dataCollect_count', count.toString());
    localStorage.setItem('dataCollect_class', digitClass.toString());
    localStorage.setItem('dataCollect_writer', writerName);
    localStorage.setItem('dataCollect_isDone', isDone.toString());
  }, [count, digitClass, writerName, isDone, isLoaded]);


  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  useEffect(()=>{
    clearCanvas();
  },[]);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return {x:0 , y:0};
    const rect = canvas.getBoundingClientRect();
        if (e.touches && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  const startDrawing = (e) => {
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    
    ctx.lineWidth = 5; // stroke
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'black';
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y);
    ctx.stroke();
  };
  
  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const {x,y} = getCoordinates(e);
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.stroke();
  }

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleSaveAndNext = () =>{
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataURL = canvas.toDataURL("image/png");
    const formattedCount = count.toString().padStart(3, '0'); 
    const filename = `${writerName || 'writer'}_${digitClass}_${formattedCount}.png`;

    const link = document.createElement('a');
    link.download = filename;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    clearCanvas();
    if (count >= 200) {
      if (digitClass < 9) {
        setDigitClass((prev) => prev + 1); 
        setCount(1); 
      } else {
      setIsDone(true); 
      }
    } else {
      setCount((prevCount) => prevCount + 1);
    }
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
    
      if (e.code === 'Space' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        handleSaveAndNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [count, writerName]); 

  return(
    <div className="flex flex-col justify-center items-center bg-blue-950 w-full min-h-screen">
      <div className = "bg-white p-6 w-full max-w-md text-center rounded-xl shadow-lg">
        <h2 className = "text-2xl font-bold text-gray-800 mb-2 ">
          DATA COLLECTION
        </h2>
        <p className = "text-gray-400 mb-4 text-sm ">
          Write in the box below and press "Save and Continue" to automatically save image 
        </p>
        <div className = "mb-4 items-center justify-center gap-2 flex">
          <label className = "text-sm font-semibold text-gray-800"> Writer:</label>
          <input
            type="text" 
            id="writerName" 
            placeholder="Name" 
            value={writerName}
            onChange={(e) => setWriterName(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 w-24 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
          /> 
          <label className = "text-sm font-semibold text-gray-800"> Picture number: </label>
                    <input 
            type="number" 
            id="imageCounter" 
            value={count} 
            onChange={(e) => setCount(Number(e.target.value))} 
            className="border border-gray-300 rounded px-2 py-1 w-16 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <p1 className = "text-sm text-gray-600">/200</p1>
        </div>
        <p className = "font-semibold text-sm"> Number: {digitClass}</p>
        <div className="flex justify-center mb-6">
          <canvas 
            ref={canvasRef}
            width={256} 
            height={256}
            className="border-2 border-blue-500 rounded-lg cursor-crosshair bg-white shadow-sm touch-none"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>
        <div className="flex gap-4 justify-center">
            <button 
              onClick={clearCanvas}
              className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
            >
                Clear
            </button>
            <button 
              onClick={handleSaveAndNext}
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md flex items-center gap-2"
            >
                <span>Save & Continue</span>
                <span className="text-xs bg-blue-800 px-1.5 py-0.5 rounded text-blue-100 hidden sm:inline-block">Space</span>
            </button>
        </div>
      </div>
    </div>
  );
}