import { GoogleGenAI, Modality } from "@google/genai";

// Inisialisasi klien Google Gemini AI
// PENTING: Kunci API harus diatur dalam variabel lingkungan.
const apiKey = process.env.API_KEY;
if (!apiKey) {
  throw new Error("Variabel lingkungan API_KEY tidak diatur");
}
const ai = new GoogleGenAI({ apiKey });

/**
 * Menghasilkan ucapan dari teks menggunakan Gemini API.
 * 
 * Untuk beralih ke penyedia API suara yang berbeda (seperti Google Cloud TTS),
 * Anda akan mengganti isi fungsi ini dengan panggilan SDK penyedia baru.
 * Tanda tangan fungsi (input dan output) dapat tetap sama untuk meminimalkan perubahan
 * di komponen UI (App.tsx).
 * 
 * @param text Teks yang akan diubah menjadi ucapan.
 * @param voiceName Nama suara bawaan yang akan digunakan.
 * @returns Sebuah promise yang menghasilkan string audio berenkode base64.
 */
export async function generateSpeech(text: string, voiceName: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        // API memerlukan tepat satu modalitas dalam array.
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            // Pilih salah satu suara bawaan yang tersedia
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!audioData) {
      throw new Error("Tidak ada data audio yang diterima dari API.");
    }

    return audioData;

  } catch (error) {
    console.error("Terjadi kesalahan saat menghasilkan suara dengan Gemini API:", error);
    // Lemparkan kembali error untuk ditangani oleh fungsi pemanggil
    throw error;
  }
}