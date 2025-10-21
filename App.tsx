import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { generateSpeech } from './services/geminiService';
import { decode, pcmToMp3Blob } from './utils/audioUtils';
import { VOICES } from './constants';
import { PROMPT_STYLES } from './promptStyles';

// Type definitions for clarity
interface AudioResult {
  url: string;
  blob: Blob;
  size: string;
}

interface CompressionOption extends AudioResult {
  level: string;
  bitrate: number;
}

interface HistoryEntry {
  id: number;
  text: string;
  voice: string; // "Multi-Speaker" or single voice name
}

interface Speaker {
    id: number;
    name: string;
    voice: string; // The user-facing name like 'Gita'
}

const Loader: React.FC = () => (
    <div className="flex flex-col items-center justify-center gap-3">
        <div className="flex items-end justify-center h-10 space-x-1.5">
            <span className="w-2 h-4 bg-blue-600 rounded-full animate-wave"></span>
            <span className="w-2 h-6 bg-blue-600 rounded-full animate-wave" style={{ animationDelay: '0.1s' }}></span>
            <span className="w-2 h-8 bg-blue-600 rounded-full animate-wave" style={{ animationDelay: '0.2s' }}></span>
            <span className="w-2 h-6 bg-blue-600 rounded-full animate-wave" style={{ animationDelay: '0.3s' }}></span>
            <span className="w-2 h-4 bg-blue-600 rounded-full animate-wave" style={{ animationDelay: '0.4s' }}></span>
        </div>
        <p className="text-slate-600 font-medium text-sm tracking-wider">MENGHASILKAN SUARA</p>
    </div>
);

const ApiKeyModal: React.FC<{ onSave: (key: string) => void }> = ({ onSave }) => {
  const [localApiKey, setLocalApiKey] = useState('');

  const handleSave = () => {
    if (localApiKey.trim()) {
      onSave(localApiKey.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
      <div className="bg-slate-200 p-8 rounded-3xl shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff] space-y-4 w-full max-w-md transform transition-transform duration-300 scale-95 animate-scale-in">
        <h2 className="text-2xl font-bold text-slate-800">Masukkan API Key Gemini</h2>
        <p className="text-slate-600 text-sm">
          Kunci Anda disimpan dengan aman di browser Anda dan tidak pernah dibagikan. Ini diperlukan untuk menghasilkan audio.
        </p>
        <input
          type="password"
          value={localApiKey}
          onChange={(e) => setLocalApiKey(e.target.value)}
          className="w-full p-4 border-transparent bg-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 shadow-[inset_5px_5px_10px_#d1d9e6,inset_-5px_-5px_10px_#ffffff] text-slate-700 placeholder:text-slate-400"
          placeholder="Masukkan kunci API Anda di sini..."
        />
        <button
          onClick={handleSave}
          className="w-full px-10 py-4 bg-slate-200 text-blue-600 font-bold rounded-2xl shadow-[5px_5px_10px_#d1d9e6,-5px_-5px_10px_#ffffff] hover:text-blue-700 active:shadow-[inset_5px_5px_10px_#d1d9e6,inset_-5px_-5px_10px_#ffffff] focus:outline-none focus:ring-2 focus:ring-offset-4 focus:ring-offset-slate-200 focus:ring-blue-500 disabled:shadow-none disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-200 ease-in-out"
        >
          Simpan Kunci
        </button>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [text, setText] = useState<string>('Narator: Halo! Selamat datang di Generator Suara.\nKarakter: Coba buat percakapan di sini!');
  const [selectedVoice, setSelectedVoice] = useState<string>('Gita');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generatedAudio, setGeneratedAudio] = useState<{ original: AudioResult; compressed: CompressionOption[] } | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  const [apiKey, setApiKey] = useState<string>('');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isMultiSpeakerMode, setIsMultiSpeakerMode] = useState<boolean>(false);
  const [speakers, setSpeakers] = useState<Speaker[]>([
      { id: 1, name: 'Narator', voice: 'Raden' },
      { id: 2, name: 'Karakter', voice: 'Gita' },
  ]);
  const [multiSpeakerStylePrompt, setMultiSpeakerStylePrompt] = useState<string>('Hasilkan percakapan podcast yang alami dan menarik.');

  useEffect(() => {
    const storedApiKey = localStorage.getItem('gemini_api_key');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    } else {
      setIsApiKeyModalOpen(true);
    }
  }, []);
  
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('speech_generation_history');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Gagal memuat riwayat dari localStorage:", error);
      localStorage.removeItem('speech_generation_history');
    }
  }, []);

  const handleSaveApiKey = (key: string) => {
    localStorage.setItem('gemini_api_key', key);
    setApiKey(key);
    setIsApiKeyModalOpen(false);
    setError(null);
  };
  
  const handleChangeApiKey = () => {
    localStorage.removeItem('gemini_api_key');
    setApiKey('');
    setIsApiKeyModalOpen(true);
  };

  const filteredVoices = useMemo(() => {
    if (genderFilter === 'all') {
      return VOICES;
    }
    return VOICES.filter(voice => voice.gender === genderFilter);
  }, [genderFilter]);

  useEffect(() => {
    if (isMultiSpeakerMode) return;
    const isSelectedVoiceInList = filteredVoices.some(voice => voice.name === selectedVoice);
    if (!isSelectedVoiceInList && filteredVoices.length > 0) {
      setSelectedVoice(filteredVoices[0].name);
    }
  }, [filteredVoices, selectedVoice, isMultiSpeakerMode]);

  useEffect(() => {
    return () => {
      if (generatedAudio) {
        URL.revokeObjectURL(generatedAudio.original.url);
        generatedAudio.compressed.forEach(option => URL.revokeObjectURL(option.url));
      }
    };
  }, [generatedAudio]);

  const formatBytes = (bytes: number, decimals = 2): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  const handleGenerate = useCallback(async () => {
    if (!apiKey) {
      setError('Silakan masukkan API Key Anda untuk melanjutkan.');
      setIsApiKeyModalOpen(true);
      return;
    }
    if (!text.trim()) {
      setError('Silakan masukkan teks untuk menghasilkan audio.');
      return;
    }
    setIsLoading(true);
    setError(null);
    if (generatedAudio) {
      URL.revokeObjectURL(generatedAudio.original.url);
      generatedAudio.compressed.forEach(option => URL.revokeObjectURL(option.url));
    }
    setGeneratedAudio(null);
    setFileName('');

    try {
      let base64Audio: string;

      if (isMultiSpeakerMode) {
          if (speakers.some(s => !s.name.trim())) {
              throw new Error("Nama semua pembicara harus diisi di Pengaturan Multi-Speaker.");
          }
          const multiSpeakerConfig = {
              speakers: speakers.map(s => {
                  const voiceApi = VOICES.find(v => v.name === s.voice);
                  if (!voiceApi) throw new Error(`Suara ${s.voice} tidak ditemukan.`);
                  return { name: s.name, voiceApiName: voiceApi.apiName };
              })
          };
          base64Audio = await generateSpeech(text.trim(), '', apiKey, multiSpeakerConfig, multiSpeakerStylePrompt);
      } else {
          const voiceObject = VOICES.find(v => v.name === selectedVoice);
          if (!voiceObject) {
              throw new Error("Suara yang dipilih tidak ditemukan. Silakan refresh halaman.");
          }
          let finalText = text.trim();
          if (selectedStyle) {
            const style = PROMPT_STYLES.find(s => s.name === selectedStyle);
            if (style) {
              finalText = `${style.prompt}\n\n${text.trim()}`;
            }
          }
          base64Audio = await generateSpeech(finalText, voiceObject.apiName, apiKey);
      }
      
      const pcmData = decode(base64Audio);

      const newHistoryEntry: HistoryEntry = {
          id: Date.now(),
          text: text.trim(),
          voice: isMultiSpeakerMode ? 'Percakapan' : selectedVoice,
      };

      setHistory(prevHistory => {
          if (prevHistory.length > 0 && prevHistory[0].text === newHistoryEntry.text && prevHistory[0].voice === newHistoryEntry.voice) {
              return prevHistory;
          }
          const updatedHistory = [newHistoryEntry, ...prevHistory].slice(0, 20);
          localStorage.setItem('speech_generation_history', JSON.stringify(updatedHistory));
          return updatedHistory;
      });
      
      const compressionLevels = [
        { level: 'Tinggi', bitrate: 128 }, { level: 'Sedang', bitrate: 64 }, { level: 'Rendah', bitrate: 32 },
      ];

      const compressedResults: CompressionOption[] = compressionLevels.map(({ level, bitrate }) => {
        const mp3Blob = pcmToMp3Blob(pcmData, 1, 24000, bitrate);
        const url = URL.createObjectURL(mp3Blob);
        return { level, bitrate, blob: mp3Blob, url, size: formatBytes(mp3Blob.size) };
      });

      const originalResult = compressedResults[0];

      setGeneratedAudio({
          original: { url: originalResult.url, blob: originalResult.blob, size: originalResult.size },
          compressed: compressedResults
      });
      
      const defaultName = text.trim().split(' ').slice(0, 4).join('_') || 'audio';
      setFileName(`${isMultiSpeakerMode ? 'percakapan' : selectedVoice}_${defaultName}`);

    } catch (e: any) {
      console.error(e);
      let errorMessage = `Gagal menghasilkan audio: ${e.message}.`;
      if (e.message?.includes('is not supported')) {
          errorMessage = `Gagal menghasilkan audio: Suara yang dipilih (${selectedVoice}) tidak didukung oleh API. Coba pilih suara lain.`;
      } else if (e.message?.toLowerCase().includes('api key')) {
          errorMessage = "Gagal menghasilkan audio. API Key Anda sepertinya tidak valid. Silakan periksa kembali."
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [text, selectedVoice, generatedAudio, apiKey, selectedStyle, isMultiSpeakerMode, speakers, multiSpeakerStylePrompt]);

  const handleDownload = (url: string, bitrate: number) => {
    if (!url || !fileName.trim()) return;
    let sanitizedFileName = fileName.trim().replace(/ /g, '_');
    const finalFileName = `${sanitizedFileName}_${bitrate}kbps.mp3`;
    const link = document.createElement('a');
    link.href = url;
    link.download = finalFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSelectHistory = (entry: HistoryEntry) => {
    setText(entry.text);
    if (entry.voice !== 'Percakapan') {
        setIsMultiSpeakerMode(false);
        setSelectedVoice(entry.voice);
    } else {
        setIsMultiSpeakerMode(true);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteHistory = (idToDelete: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory(prevHistory => {
        const updatedHistory = prevHistory.filter(item => item.id !== idToDelete);
        localStorage.setItem('speech_generation_history', JSON.stringify(updatedHistory));
        return updatedHistory;
    });
  };

  const handleSpeakerChange = (id: number, field: 'name' | 'voice', value: string) => {
      setSpeakers(prev =>
          prev.map(speaker =>
              speaker.id === id ? { ...speaker, [field]: value } : speaker
          )
      );
  };

  const genderFilterOptions = [
    { label: 'Semua', value: 'all' }, { label: 'Laki-laki', value: 'male' }, { label: 'Perempuan', value: 'female' }
  ] as const;

  return (
    <>
      {isApiKeyModalOpen && <ApiKeyModal onSave={handleSaveApiKey} />}
      
      <div className="min-h-screen bg-slate-200 flex items-center justify-center p-4 sm:p-6 transition-colors duration-300">
        <div className="w-full max-w-2xl bg-slate-200 rounded-3xl p-8 sm:p-12 space-y-8 shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff]">
          <header className="text-center">
            <h1 className="text-4xl font-bold text-slate-800">Kuttab Al Fatih Kediri</h1>
            <p className="text-slate-500 mt-2 text-lg">sinergi dalam dakwah dan inovasi</p>
          </header>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2 ml-2">
                <label htmlFor="text-input" className="block text-sm font-semibold text-slate-600">
                  Teks Anda
                </label>
              </div>
              <div className="relative w-full">
                <textarea
                  id="text-input"
                  rows={5}
                  className="w-full p-4 pr-10 border-transparent bg-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 shadow-[inset_5px_5px_10px_#d1d9e6,inset_-5px_-5px_10px_#ffffff] text-slate-700 placeholder:text-slate-400 resize-none"
                  placeholder="Masukkan teks untuk diubah menjadi suara..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  disabled={isLoading}
                />
                {text.length > 0 && !isLoading && (
                  <button onClick={() => setText('')} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1 transition-colors duration-200" aria-label="Hapus teks">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                  </button>
                )}
              </div>
            </div>
            
            {/* Redesigned Tab Controls */}
            <div className="space-y-4">
                <div className="flex space-x-1 sm:space-x-2 bg-slate-200 rounded-2xl p-1.5 shadow-[inset_5px_5px_10px_#d1d9e6,inset_-5px_-5px_10px_#ffffff]">
                    <button onClick={() => setIsMultiSpeakerMode(false)} disabled={isLoading} className={`w-full py-2.5 px-3 sm:px-4 rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-200 focus:ring-blue-500 ${!isMultiSpeakerMode ? 'bg-slate-200 text-blue-600 shadow-[5px_5px_10px_#d1d9e6,-5px_-5px_10px_#ffffff]' : 'text-slate-500 hover:text-slate-700'}`}>
                        Suara Tunggal
                    </button>
                    <button onClick={() => setIsMultiSpeakerMode(true)} disabled={isLoading} className={`w-full py-2.5 px-3 sm:px-4 rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-200 focus:ring-blue-500 ${isMultiSpeakerMode ? 'bg-slate-200 text-blue-600 shadow-[5px_5px_10px_#d1d9e6,-5px_-5px_10px_#ffffff]' : 'text-slate-500 hover:text-slate-700'}`}>
                        Multi-Speaker
                    </button>
                </div>

                {/* Tab Panels */}
                <div className="bg-slate-200 rounded-2xl p-4 shadow-[inset_5px_5px_10px_#d1d9e6,inset_-5px_-5px_10px_#ffffff]">
                    {!isMultiSpeakerMode ? (
                        // Single Speaker Panel
                        <div className="space-y-6">
                             <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-2 ml-2">Filter Jenis Suara</label>
                                <div className="flex space-x-1 sm:space-x-2 bg-slate-200 rounded-2xl p-1.5 shadow-[inset_3px_3px_5px_#d1d9e6,inset_-3px_-3px_5px_#ffffff]">
                                  {genderFilterOptions.map(({ label, value }) => (
                                      <button key={value} onClick={() => setGenderFilter(value)} className={`w-full py-2 px-3 sm:px-4 rounded-xl font-semibold transition-all duration-300 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-200 focus:ring-blue-500 ${genderFilter === value ? 'bg-slate-200 text-blue-600 shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff]' : 'text-slate-500 hover:text-slate-700'}`}>
                                        {label}
                                      </button>
                                    ))}
                                </div>
                              </div>
                              <div>
                                <label htmlFor="voice-select" className="block text-sm font-semibold text-slate-600 mb-2 ml-2">Pilih Suara</label>
                                <select id="voice-select" className="w-full p-4 border-transparent bg-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 shadow-[inset_5px_5px_10px_#d1d9e6,inset_-5px_-5px_10px_#ffffff] text-slate-700 appearance-none" value={selectedVoice} onChange={(e) => setSelectedVoice(e.target.value)} disabled={isLoading}>
                                  {filteredVoices.map((voice) => (<option key={voice.name} value={voice.name}>{voice.name} — {voice.description}</option>))}
                                </select>
                              </div>
                              <div>
                                  <label htmlFor="style-select" className="block text-sm font-semibold text-slate-600 mb-2 ml-2">Pilih Gaya (Opsional)</label>
                                  <select id="style-select" className="w-full p-4 border-transparent bg-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 shadow-[inset_5px_5px_10px_#d1d9e6,inset_-5px_-5px_10px_#ffffff] text-slate-700 appearance-none" value={selectedStyle} onChange={(e) => setSelectedStyle(e.target.value)} disabled={isLoading}>
                                    <option value="">Default</option>
                                    {PROMPT_STYLES.map((style) => (<option key={style.name} value={style.name}>{style.label}</option>))}
                                  </select>
                              </div>
                        </div>
                    ) : (
                        // Multi Speaker Panel
                        <div className="space-y-6">
                            <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded-lg shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff]">
                                <p className="font-bold">Cara Penggunaan:</p>
                                <p className="text-sm">Format teks Anda sebagai percakapan. Gunakan nama pembicara yang Anda tentukan di bawah, diikuti titik dua.</p>
                                <p className="text-sm mt-1 font-mono bg-slate-300 p-1 rounded">Contoh: <strong>Narator:</strong> Halo! Apa kabar?</p>
                            </div>
                            <div className="space-y-4">
                                {speakers.map(speaker => (
                                    <div key={speaker.id} className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                                        <input
                                            type="text"
                                            value={speaker.name}
                                            onChange={(e) => handleSpeakerChange(speaker.id, 'name', e.target.value)}
                                            placeholder={`Nama Pembicara ${speaker.id}`}
                                            className="w-full p-3 border-transparent bg-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-[inset_5px_5px_10px_#d1d9e6,inset_-5px_-5px_10px_#ffffff] text-slate-700"
                                        />
                                        <select
                                            value={speaker.voice}
                                            onChange={(e) => handleSpeakerChange(speaker.id, 'voice', e.target.value)}
                                            className="w-full p-3 border-transparent bg-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-[inset_5px_5px_10px_#d1d9e6,inset_-5px_-5px_10px_#ffffff] text-slate-700 appearance-none"
                                        >
                                            {VOICES.map(v => <option key={v.name} value={v.name}>{v.name} ({v.gender})</option>)}
                                        </select>
                                    </div>
                                ))}
                            </div>
                             <div>
                                <label htmlFor="conversation-style" className="block text-sm font-semibold text-slate-600 mb-2 ml-2">
                                  Gaya Percakapan (Opsional)
                                </label>
                                <textarea
                                  id="conversation-style"
                                  rows={2}
                                  className="w-full p-3 border-transparent bg-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 shadow-[inset_5px_5px_10px_#d1d9e6,inset_-5px_-5px_10px_#ffffff] text-slate-700 placeholder:text-slate-400 resize-none"
                                  placeholder="Jelaskan konteks atau nuansa percakapan..."
                                  value={multiSpeakerStylePrompt}
                                  onChange={(e) => setMultiSpeakerStylePrompt(e.target.value)}
                                  disabled={isLoading}
                                />
                                <p className="text-xs text-center text-slate-500 mt-2">Contoh: 'Percakapan podcast santai', 'Debat formal', 'Dialog drama sedih'.</p>
                            </div>
                            <p className="text-xs text-center text-slate-500">API saat ini hanya mendukung 2 pembicara.</p>
                        </div>
                    )}
                </div>
            </div>
          </div>

          <div className="flex items-center justify-center pt-4" style={{ minHeight: '80px' }}>
            {isLoading ? <Loader /> : (
              <button onClick={handleGenerate} disabled={!text.trim()} className="w-full sm:w-auto px-10 py-4 bg-slate-200 text-blue-600 font-bold rounded-2xl shadow-[5px_5px_10px_#d1d9e6,-5px_-5px_10px_#ffffff] hover:text-blue-700 active:shadow-[inset_5px_5px_10px_#d1d9e6,inset_-5px_-5px_10px_#ffffff] focus:outline-none focus:ring-2 focus:ring-offset-4 focus:ring-offset-slate-200 focus:ring-blue-500 disabled:shadow-none disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-200 ease-in-out transform hover:-translate-y-1 active:scale-95">
                Hasilkan Suara
              </button>
            )}
          </div>
          
          {error && <div className="text-red-700 bg-red-200 p-4 rounded-xl text-center font-medium shadow-[inset_3px_3px_6px_#d4b6b6,inset_-3px_-3px_6px_#ffeaea]">{error}</div>}

          {generatedAudio && (
            <div className="space-y-6 pt-6 border-t border-slate-300/60">
              <h2 className="text-xl font-semibold text-slate-700 text-center">Hasil Audio & Opsi Kompresi</h2>
              <div>
                 <label htmlFor="filename-input" className="block text-sm font-semibold text-slate-600 mb-2 ml-2">Nama File Dasar</label>
                <div className="relative w-full">
                  <input id="filename-input" type="text" value={fileName} onChange={(e) => setFileName(e.target.value)} placeholder="Masukkan nama file dasar..." className="w-full p-4 pr-12 border-transparent bg-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 shadow-[inset_5px_5px_10px_#d1d9e6,inset_-5px_-5px_10px_#ffffff] text-slate-700 placeholder:text-slate-400"/>
                  <div className="absolute top-0 right-0 h-full flex items-center pr-3 space-x-1">
                    {fileName.length > 0 && (<button onClick={() => setFileName('')} className="text-slate-400 hover:text-slate-600 rounded-full p-1.5 transition-colors" aria-label="Hapus nama file"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg></button>)}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {generatedAudio.compressed.map((option) => (
                  <div key={option.level} className="bg-slate-200 rounded-2xl p-4 space-y-3 shadow-[5px_5px_10px_#d1d9e6,-5px_-5px_10px_#ffffff]">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-slate-700">Kompresi {option.level}</h3>
                      <span className="text-sm font-semibold text-slate-500 bg-slate-300/70 rounded-full px-3 py-1">{option.size}</span>
                    </div>
                    <div className="p-2 bg-slate-200 rounded-full shadow-[inset_5px_5px_10px_#d1d9e6,inset_-5px_-5px_10px_#ffffff]">
                      <audio controls src={option.url} className="w-full rounded-full" />
                    </div>
                    <button onClick={() => handleDownload(option.url, option.bitrate)} disabled={!fileName.trim()} className="w-full px-4 py-2 bg-slate-200 text-green-600 font-semibold rounded-xl shadow-[5px_5px_10px_#d1d9e6,-5px_-5px_10px_#ffffff] hover:text-green-700 active:shadow-[inset_5px_5px_10px_#d1d9e6,inset_-5px_-5px_10px_#ffffff] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-200 focus:ring-green-500 transition-all duration-200 ease-in-out text-sm disabled:shadow-none disabled:text-slate-400 disabled:cursor-not-allowed">
                      Unduh ({option.bitrate} kbps)
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {history.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-slate-300/60">
              <h2 className="text-xl font-semibold text-slate-700 text-center">Riwayat</h2>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {history.map((item) => (
                  <div key={item.id} onClick={() => handleSelectHistory(item)} className="bg-slate-200 rounded-2xl p-4 flex justify-between items-center shadow-[5px_5px_10px_#d1d9e6,-5px_-5px_10px_#ffffff] hover:shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff] cursor-pointer transition-all duration-200" role="button" tabIndex={0} aria-label={`Gunakan kembali teks: ${item.text}`}>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-slate-700 font-medium truncate" title={item.text}>{item.text}</p>
                      <p className="text-xs text-slate-500 font-semibold">{item.voice}</p>
                    </div>
                    <button onClick={(e) => handleDeleteHistory(item.id, e)} className="ml-4 text-slate-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-full p-1.5 transition-colors duration-200 flex-shrink-0" aria-label="Hapus item riwayat">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="pt-4 text-center text-xs text-slate-500">
            {apiKey ? (<span>API Key tersimpan secara lokal.{" "}<button onClick={handleChangeApiKey} className="font-semibold text-blue-600 hover:underline focus:outline-none">Ubah API Key</button></span>) : (<span>API Key belum diatur. Silakan klik 'Hasilkan Suara' untuk memasukkannya.</span>)}
          </div>
        </div>
      </div>
    </>
  );
};

export default App;