"use client";

import React, { useEffect, useRef, useState } from "react";
import characterMapping from "../../public/characterMapping.json"; // Adjust path as needed

// Define the shape for character mapping
interface CharacterMapping {
  [key: string]: {
    hindi: string;
    english: string;
  };
}

const hiragana: string[] = [
  "あ", "い", "う", "え", "お",
  "か", "き", "く", "け", "こ",
  "さ", "し", "す", "せ", "そ",
  "た", "ち", "つ", "て", "と",
  "な", "に", "ぬ", "ね", "の",
  "は", "ひ", "ふ", "へ", "ほ",
  "ま", "み", "む", "め", "も",
  "や", "ゆ", "よ",
  "ら", "り", "る", "れ", "ろ",
  "わ", "を", "ん",
];

const katakana: string[] = [
  "ア", "イ", "ウ", "エ", "オ",
  "カ", "キ", "ク", "ケ", "コ",
  "サ", "シ", "ス", "セ", "ソ",
  "タ", "チ", "ツ", "テ", "ト",
  "ナ", "ニ", "ヌ", "ネ", "ノ",
  "ハ", "ヒ", "フ", "ヘ", "ホ",
  "マ", "ミ", "ム", "メ", "モ",
  "ヤ", "ユ", "ヨ",
  "ラ", "リ", "ル", "レ", "ロ",
  "ワ", "ヲ", "ン",
];

type CharacterSet = "hiragana" | "katakana";

const LOCAL_HISTORY_KEY = "strokeHistory";
const LOCAL_HISTORY_INDEX_KEY = "historyIndex";

export default function StrokeOrderPracticePage(): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [selectedCharacter, setSelectedCharacter] = useState<string>("");
  const [soundPlaying, setSoundPlaying] = useState<boolean>(false);
  const [selectedSet, setSelectedSet] = useState<CharacterSet>("hiragana");

  // Helper functions for localStorage
  const getHistory = (): string[] =>
    JSON.parse(localStorage.getItem(LOCAL_HISTORY_KEY) || "[]");

  const getHistoryIndex = (): number =>
    parseInt(localStorage.getItem(LOCAL_HISTORY_INDEX_KEY) || "-1", 10);

  const setHistoryLocal = (history: string[]): void => {
    localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(history));
  };

  const setHistoryIndexLocal = (index: number): void => {
    localStorage.setItem(LOCAL_HISTORY_INDEX_KEY, index.toString());
  };

  // On new character selection, clear the history from localStorage
  useEffect(() => {
    if (!canvasRef.current || !selectedCharacter) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = "80px Arial";
      ctx.fillStyle = "black";
      ctx.fillText(selectedCharacter, 20, 120);
    }
    setHistoryLocal([]);
    setHistoryIndexLocal(-1);
  }, [selectedCharacter]);

  // Resize the canvas: use parent's width (max 600px) and fixed height of 300px.
  const resizeCanvas = (): void => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const parent = canvas.parentElement;
    if (!parent) return;

    const newWidth = Math.min(parent.clientWidth, 600);
    const newHeight = 300;
    canvas.width = newWidth;
    canvas.height = newHeight;
    canvas.style.width = `${newWidth}px`;
    canvas.style.height = `${newHeight}px`;

    // If a character is selected, redraw it.
    if (selectedCharacter) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, newWidth, newHeight);
        ctx.font = "80px Arial";
        ctx.fillStyle = "black";
        ctx.fillText(selectedCharacter, 20, 120);
      }
    }
  };

  useEffect(() => {
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [selectedCharacter]);

  // Start drawing
  const startDrawing = (clientX: number, clientY: number): void => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  // Continue drawing
  const draw = (clientX: number, clientY: number): void => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    ctx.lineTo(x, y);
    ctx.strokeStyle = "black";
    ctx.stroke();
  };

  // End drawing and update the history in localStorage
  const endDrawing = (): void => {
    if (!canvasRef.current) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    const imageData = canvas.toDataURL();
    let historyArray: string[] = getHistory();
    let historyIndex = getHistoryIndex();

    // Remove any "redo" strokes if they exist.
    historyArray = historyArray.slice(0, historyIndex + 1);
    historyArray.push(imageData);
    historyIndex = historyArray.length - 1;

    setHistoryLocal(historyArray);
    setHistoryIndexLocal(historyIndex);
  };

  // Undo: Retrieve previous stroke from localStorage and draw it.
  const undo = (): void => {
    let historyIndex = getHistoryIndex();
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    setHistoryIndexLocal(newIndex);
    const historyArray = getHistory();
    loadCanvasState(historyArray[newIndex]);
  };

  // Redo: Retrieve the next stroke from localStorage and draw it.
  const redo = (): void => {
    const historyArray = getHistory();
    const historyIndex = getHistoryIndex();
    if (historyIndex >= historyArray.length - 1) return;
    const newIndex = historyIndex + 1;
    setHistoryIndexLocal(newIndex);
    loadCanvasState(historyArray[newIndex]);
  };

  // Load a saved canvas state from a data URL.
  const loadCanvasState = (imageData: string): void => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = new Image();
    img.src = imageData;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  };

  // Play sound for the selected character.
  const playSound = async (): Promise<void> => {
    if (!selectedCharacter) return;
    setSoundPlaying(true);
    try {
      const audio = new Audio(`/sounds/${selectedCharacter}.mp3`);
      audio.volume = 1;
      await audio.play();
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      if (window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(selectedCharacter);
        utterance.lang = "ja-JP";
        utterance.rate = 1;
        utterance.volume = 1;
        window.speechSynthesis.speak(utterance);
        utterance.onend = () => setSoundPlaying(false);
      } else {
        alert("Your browser does not support text-to-speech.");
      }
    }
    setSoundPlaying(false);
  };

  const characters = selectedSet === "hiragana" ? hiragana : katakana;

  return (
    <main className="min-h-screen w-full bg-gradient-to-r from-blue-50 to-purple-50 p-8">
      <div className="mx-auto max-w-7xl">
        {/* Title */}
        <h1 className="text-center text-4xl font-extrabold text-slate-800 mb-8">
          Japanese Stroke Order Practice
        </h1>

        {/* Set Selector */}
        <div className="flex justify-center mb-8">
          <select
            value={selectedSet}
            onChange={(e) => setSelectedSet(e.target.value as CharacterSet)}
            className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-800"
          >
            <option value="hiragana">Hiragana</option>
            <option value="katakana">Katakana</option>
          </select>
        </div>

        {/* Stroke Order Practice Section */}
        <section className="mb-12 rounded-xl bg-white shadow-lg p-6">
          <h2 className="text-3xl font-semibold text-purple-700 mb-6">
            Stroke Order Practice
          </h2>

          <div className="flex flex-wrap items-start gap-6">
            {/* Display Hindi/English translations */}
            {selectedCharacter && (
              <div className="flex flex-col items-center gap-2">
                <p className="text-lg text-gray-700">
                  {(characterMapping as CharacterMapping)[selectedCharacter]?.hindi}
                </p>
                <p className="text-lg text-gray-700">
                  {(characterMapping as CharacterMapping)[selectedCharacter]?.english}
                </p>
              </div>
            )}

            {/* Canvas container */}
            <div className="flex-1 min-w-[300px] relative">
              <div className="w-full border-2 border-dashed border-gray-300 rounded-lg bg-white p-2">
                <canvas
                  ref={canvasRef}
                  className="cursor-crosshair block"
                  onMouseDown={(e) => startDrawing(e.clientX, e.clientY)}
                  onMouseMove={(e) => draw(e.clientX, e.clientY)}
                  onMouseUp={endDrawing}
                  onMouseLeave={endDrawing}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    startDrawing(e.touches[0].clientX, e.touches[0].clientY);
                  }}
                  onTouchMove={(e) => {
                    e.preventDefault();
                    draw(e.touches[0].clientX, e.touches[0].clientY);
                  }}
                  onTouchEnd={endDrawing}
                />
              </div>

              {/* Undo/Redo Buttons using symbols */}
              <div className="absolute bottom-4 right-4 flex gap-2">
                <button
                  onClick={undo}
                  className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
                  aria-label="Undo"
                >
                  ↺
                </button>
                <button
                  onClick={redo}
                  className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
                  aria-label="Redo"
                >
                  ↻
                </button>
              </div>
            </div>

            {/* Play Sound Button */}
            {selectedCharacter && (
              <div className="flex flex-col justify-center items-center">
                <button
                  onClick={playSound}
                  disabled={soundPlaying}
                  className="px-4 py-2 mt-4 bg-purple-600 text-white font-medium rounded-md hover:bg-purple-700 disabled:opacity-50"
                  aria-label={`Play sound for ${selectedCharacter}`}
                >
                  {soundPlaying ? "Playing..." : "Play Sound"}
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Character Grid */}
        <section className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-3xl font-semibold text-purple-700 mb-6">
            All {selectedSet.charAt(0).toUpperCase() + selectedSet.slice(1)} Characters
          </h2>
          <div className="grid gap-4 grid-cols-5 sm:grid-cols-8 md:grid-cols-10">
            {characters.map((char) => (
              <button
                key={char}
                onClick={() => setSelectedCharacter(char)}
                className="border border-gray-300 rounded-lg py-4 text-2xl font-bold text-gray-800 bg-white hover:bg-purple-50 transition-colors"
                aria-label={`Select character ${char}`}
              >
                {char}
              </button>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
