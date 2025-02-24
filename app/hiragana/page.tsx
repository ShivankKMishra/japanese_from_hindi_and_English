"use client";
import { useEffect, useRef, useState } from "react";
import characterMapping from "../../public/characterMapping.json"; // Import the JSON file

const hiragana = [
  "あ",
  "い",
  "う",
  "え",
  "お",
  "か",
  "き",
  "く",
  "け",
  "こ",
  "さ",
  "し",
  "す",
  "せ",
  "そ",
  "た",
  "ち",
  "つ",
  "て",
  "と",
  "な",
  "に",
  "ぬ",
  "ね",
  "の",
  "は",
  "ひ",
  "ふ",
  "へ",
  "ほ",
  "ま",
  "み",
  "む",
  "め",
  "も",
  "や",
  "ゆ",
  "よ",
  "ら",
  "り",
  "る",
  "れ",
  "ろ",
  "わ",
  "を",
  "ん",
];

const katakana = [
  "ア",
  "イ",
  "ウ",
  "エ",
  "オ",
  "カ",
  "キ",
  "ク",
  "ケ",
  "コ",
  "サ",
  "シ",
  "ス",
  "セ",
  "ソ",
  "タ",
  "チ",
  "ツ",
  "テ",
  "ト",
  "ナ",
  "ニ",
  "ヌ",
  "ネ",
  "ノ",
  "ハ",
  "ヒ",
  "フ",
  "ヘ",
  "ホ",
  "マ",
  "ミ",
  "ム",
  "メ",
  "モ",
  "ヤ",
  "ユ",
  "ヨ",
  "ラ",
  "リ",
  "ル",
  "レ",
  "ロ",
  "ワ",
  "ヲ",
  "ン",
];

interface CharacterMapping {
  [key: string]: {
    hindi: string;
    english: string;
  };
}

export default function HiraganaPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<string>("");
  const [soundPlaying, setSoundPlaying] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [selectedSet, setSelectedSet] = useState<"hiragana" | "katakana">(
    "hiragana"
  );

  useEffect(() => {
    if (!canvasRef.current || !selectedCharacter) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas and draw character
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "80px Arial";
    ctx.fillStyle = "black";
    ctx.fillText(selectedCharacter, 20, 120);

    // Reset history when a new character is selected
    setHistory([]);
    setHistoryIndex(-1);
  }, [selectedCharacter]);

  const startDrawing = (clientX: number, clientY: number) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (clientX: number, clientY: number) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.strokeStyle = "black";
    ctx.stroke();
  };

  const endDrawing = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(false);

    // Save the current canvas state to history
    const imageData = canvas.toDataURL();
    setHistory((prevHistory) => [
      ...prevHistory.slice(0, historyIndex + 1),
      imageData,
    ]);
    setHistoryIndex((prevIndex) => prevIndex + 1);
  };

  const undo = () => {
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    loadCanvasState(history[newIndex]);
  };

  const redo = () => {
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    loadCanvasState(history[newIndex]);
  };

  const loadCanvasState = (imageData: string) => {
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

  const playSound = async () => {
    if (!selectedCharacter) return;

    setSoundPlaying(true);

    try {
      // Check if the sound file exists
      const audio = new Audio(`/sounds/${selectedCharacter}.mp3`);

      // Increase volume (set to maximum)
      audio.volume = 1; // 1 is the maximum volume

      // Play the audio
      await audio.play();

      // Artificially extend the play time by adding a delay
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second after the sound finishes
    } catch (error) {
      // Fallback to Web Speech API if audio fails
      if (window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(selectedCharacter);
        utterance.lang = "ja-JP"; // Set language to Japanese
        utterance.rate = 1; // Normal rate
        utterance.volume = 1; // Maximum volume

        window.speechSynthesis.speak(utterance);
        utterance.onend = () => setSoundPlaying(false);
      } else {
        alert("Your browser does not support text-to-speech.");
        setSoundPlaying(false);
      }
    }

    setSoundPlaying(false);
  };

  return (
    <div className="min-h-screen w-full bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-black">
          Hiragana/Katakana Stroke Order Practice
        </h1>

        {/* Dropdown to Select Hiragana or Katakana */}
        <div className="mb-8 flex justify-center">
          <select
            value={selectedSet}
            onChange={(e) =>
              setSelectedSet(e.target.value as "hiragana" | "katakana")
            }
            className="px-4 py-2 border border-gray-300 text-black rounded-lg"
          >
            <option value="hiragana">Hiragana</option>
            <option value="katakana">Katakana</option>
          </select>
        </div>

        {/* Stroke Order Practice Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-black">
            Stroke Order Practice
          </h2>
          <div className="flex items-start gap-8">
            {/* Hindi and English Characters */}
            {selectedCharacter && (
              <div className="flex flex-col items-center gap-2">
                <p className="text-lg text-gray-700">
                  {
                    (characterMapping as CharacterMapping)[selectedCharacter]
                      ?.hindi
                  }
                </p>
                <p className="text-lg text-gray-700">
                  {
                    (characterMapping as CharacterMapping)[selectedCharacter]
                      ?.english
                  }
                </p>
              </div>
            )}

            {/* Canvas */}
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={600}
                height={300}
                className="border border-gray-200 rounded-lg bg-white shadow-sm cursor-crosshair"
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
              {/* Undo and Redo Buttons */}
              <div className="absolute bottom-4 right-4 flex gap-2">
                <button
                  onClick={undo}
                  disabled={historyIndex <= 0}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-300"
                  aria-label="Undo last stroke"
                >
                  Undo
                </button>
                <button
                  onClick={redo}
                  disabled={historyIndex >= history.length - 1}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-300"
                  aria-label="Redo last stroke"
                >
                  Redo
                </button>
              </div>
            </div>
          </div>

          {/* Play Sound Button */}
          {selectedCharacter && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={playSound}
                disabled={soundPlaying}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
                aria-label={`Play sound for ${selectedCharacter}`}
              >
                {soundPlaying ? "Playing..." : "Play Sound"}
              </button>
            </div>
          )}
        </div>

        {/* Character Display Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-black">
            All {selectedSet.charAt(0).toUpperCase() + selectedSet.slice(1)}{" "}
            Characters
          </h2>
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
            }}
          >
            {(selectedSet === "hiragana" ? hiragana : katakana).map(
              (char, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedCharacter(char)}
                  className="border border-gray-200 rounded-lg p-4 text-center text-2xl cursor-pointer transition-transform hover:scale-105 text-black"
                  aria-label={`Select character ${char}`}
                >
                  {char}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
