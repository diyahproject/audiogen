import { GoogleGenAI, Modality } from "@google/genai";

interface MultiSpeakerConfig {
  speakers: Array<{ name: string; voiceApiName: string; }>;
}

/**
 * Menghasilkan ucapan dari teks menggunakan Gemini API.
 * Mendukung mode suara tunggal dan multi-speaker.
 * 
 * @param text Teks yang akan diubah menjadi ucapan.
 * @param voiceName Nama suara bawaan yang akan digunakan (hanya untuk mode tunggal).
 * @param apiKey Kunci API Google Gemini yang disediakan pengguna.
 * @param multiSpeakerConfig Konfigurasi untuk mode multi-speaker (opsional).
 * @param conversationStylePrompt Prompt kustom untuk mengatur nada percakapan (hanya untuk multi-speaker).
 * @returns Sebuah promise yang menghasilkan string audio berenkode base64.
 */
export async function generateSpeech(
  text: string, 
  voiceName: string, 
  apiKey: string,
  multiSpeakerConfig?: MultiSpeakerConfig,
  conversationStylePrompt?: string
): Promise<string> {
  if (!apiKey) {
    throw new Error("API Key tidak diberikan. Silakan masukkan kunci Anda.");
  }
  
  const ai = new GoogleGenAI({ apiKey });

  // Tentukan konfigurasi ucapan berdasarkan mode
  let speechConfig;
  let finalText = text;

  if (multiSpeakerConfig && multiSpeakerConfig.speakers.length === 2) {
    speechConfig = {
      multiSpeakerVoiceConfig: {
        speakerVoiceConfigs: multiSpeakerConfig.speakers.map(speaker => ({
          speaker: speaker.name,
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: speaker.voiceApiName }
          }
        }))
      }
    };
    
    // PERBAIKAN: Buat instruksi eksplisit untuk model TTS multi-speaker.
    const speakerNames = multiSpeakerConfig.speakers.map(s => s.name).join(' dan ');
    const ttsInstruction = `TTS percakapan berikut antara ${speakerNames}:`;

    // Gabungkan semua bagian prompt dengan benar
    const promptParts = [ttsInstruction];
    if (conversationStylePrompt?.trim()) {
      promptParts.push(conversationStylePrompt.trim());
    }
    promptParts.push(text); // Skrip pengguna di akhir

    finalText = promptParts.join('\n\n');

  } else {
    speechConfig = {
      voiceConfig: {
        prebuiltVoiceConfig: { voiceName },
      },
    };
    // Teks akhir untuk mode suara tunggal sudah ditangani di komponen App
    // (di mana prompt gaya seperti 'marah', 'jenaka', dll. ditambahkan)
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: finalText }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: speechConfig,
      },
    });

    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!audioData) {
      throw new Error("Tidak ada data audio yang diterima dari API.");
    }

    return audioData;

  } catch (error) {
    console.error("Terjadi kesalahan saat menghasilkan suara dengan Gemini API:", error);
    throw error;
  }
}