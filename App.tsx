import React, { useState, useCallback, useEffect } from 'react';
import { generateSpeech } from './services/geminiService';
import { decode, pcmToWavBlob } from './utils/audioUtils';
import { VOICES } from './constants';

const Loader: React.FC = () => (
  <div className="flex items-center space-x-3">
    <div className="w-3 h-3 rounded-full bg-blue-600 animate-pulse"></div>
    <div className="w-3 h-3 rounded-full bg-blue-600 animate-pulse [animation-delay:0.2s]"></div>
    <div className="w-3 h-3 rounded-full bg-blue-600 animate-pulse [animation-delay:0.4s]"></div>
    <span className="text-slate-600 font-medium">Menghasilkan...</span>
  </div>
);

const App: React.FC = () => {
  const [text, setText] = useState<string>('Halo! Selamat datang di Generator Suara. Tulis sesuatu di sini, pilih suara, lalu klik hasilkan.');
  const [selectedVoice, setSelectedVoice] = useState<string>('Zephyr');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [audioData, setAudioData] = useState<{ url: string; blob: Blob } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (audioData?.url) {
        URL.revokeObjectURL(audioData.url);
      }
    };
  }, [audioData]);

  const handleGenerate = useCallback(async () => {
    if (!text.trim()) {
      setError('Silakan masukkan teks untuk menghasilkan audio.');
      return;
    }
    setIsLoading(true);
    setError(null);
    if (audioData?.url) {
      URL.revokeObjectURL(audioData.url);
    }
    setAudioData(null);

    try {
      const base64Audio = await generateSpeech(text, selectedVoice);
      const pcmData = decode(base64Audio);
      const wavBlob = pcmToWavBlob(pcmData, 1, 24000);
      const url = URL.createObjectURL(wavBlob);
      setAudioData({ url, blob: wavBlob });
    } catch (e) {
      console.error(e);
      setError('Gagal menghasilkan audio. Silakan periksa kunci API Anda dan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  }, [text, selectedVoice, audioData]);

  const handleDownload = () => {
    if (!audioData) return;
    const link = document.createElement('a');
    link.href = audioData.url;
    link.download = `${selectedVoice}-suara.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-200 flex items-center justify-center p-4 sm:p-6 transition-colors duration-300">
      <div className="w-full max-w-2xl bg-slate-200 rounded-3xl p-8 sm:p-12 space-y-8 shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff]">
        <header className="text-center">
          <h1 className="text-4xl font-bold text-slate-800">Kuttab Al Fatih Kediri</h1>
          <p className="text-slate-500 mt-2 text-lg">Inovasi dalam dakwah dan karya</p>
        </header>
        
        <div className="space-y-6">
          <div>
            <label htmlFor="text-input" className="block text-sm font-semibold text-slate-600 mb-2 ml-2">
              Teks Anda
            </label>
            <textarea
              id="text-input"
              rows={5}
              className="w-full p-4 border-transparent bg-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 shadow-[inset_5px_5px_10px_#d1d9e6,inset_-5px_-5px_10px_#ffffff] text-slate-700 placeholder:text-slate-400"
              placeholder="Masukkan teks untuk diubah menjadi suara..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label htmlFor="voice-select" className="block text-sm font-semibold text-slate-600 mb-2 ml-2">
              Pilih Suara
            </label>
            <select
              id="voice-select"
              className="w-full p-4 border-transparent bg-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 shadow-[inset_5px_5px_10px_#d1d9e6,inset_-5px_-5px_10px_#ffffff] text-slate-700 appearance-none"
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              disabled={isLoading}
            >
              {VOICES.map((voice) => (
                <option key={voice.name} value={voice.name}>
                  {voice.name} — {voice.description}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          <button
            onClick={handleGenerate}
            disabled={isLoading || !text.trim()}
            className="w-full sm:w-auto px-10 py-4 bg-slate-200 text-blue-600 font-bold rounded-2xl shadow-[5px_5px_10px_#d1d9e6,-5px_-5px_10px_#ffffff] hover:text-blue-700 active:shadow-[inset_5px_5px_10px_#d1d9e6,inset_-5px_-5px_10px_#ffffff] focus:outline-none focus:ring-2 focus:ring-offset-4 focus:ring-offset-slate-200 focus:ring-blue-500 disabled:shadow-none disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-200 ease-in-out transform hover:-translate-y-1 active:scale-95"
          >
            Hasilkan Suara
          </button>
          
          {isLoading && <Loader />}
        </div>
        
        {error && <div className="text-red-700 bg-red-200 p-4 rounded-xl text-center font-medium shadow-[inset_3px_3px_6px_#d4b6b6,inset_-3px_-3px_6px_#ffeaea]">{error}</div>}

        {audioData && (
          <div className="space-y-6 pt-6 border-t border-slate-300/60">
            <h2 className="text-xl font-semibold text-slate-700 text-center">Hasil Audio</h2>
            <div className="p-2 bg-slate-200 rounded-full shadow-[inset_5px_5px_10px_#d1d9e6,inset_-5px_-5px_10px_#ffffff]">
              <audio controls src={audioData.url} className="w-full rounded-full">
                Browser Anda tidak mendukung elemen audio.
              </audio>
            </div>
            <button
              onClick={handleDownload}
              className="w-full px-8 py-4 bg-slate-200 text-green-600 font-bold rounded-2xl shadow-[5px_5px_10px_#d1d9e6,-5px_-5px_10px_#ffffff] hover:text-green-700 active:shadow-[inset_5px_5px_10px_#d1d9e6,inset_-5px_-5px_10px_#ffffff] focus:outline-none focus:ring-2 focus:ring-offset-4 focus:ring-offset-slate-200 focus:ring-green-500 transition-all duration-200 ease-in-out transform hover:-translate-y-1 active:scale-95"
            >
              Unduh WAV
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
