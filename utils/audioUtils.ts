/**
 * Mendekode string base64 menjadi Uint8Array.
 * @param base64 String berenkode base64.
 * @returns Sebuah Uint8Array yang berisi data biner yang telah didekode.
 */
export function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Mengenkode data audio PCM mentah menjadi Blob format file WAV.
 * Ini diperlukan karena tag <audio> tidak dapat memutar PCM mentah secara langsung.
 * @param pcmData Data audio mentah sebagai Uint8Array.
 * @param numChannels Jumlah saluran audio (mis., 1 untuk mono, 2 untuk stereo).
 * @param sampleRate Tingkat sampel audio (mis., 24000 untuk Gemini TTS).
 * @returns Sebuah Blob yang merepresentasikan file WAV.
 */
export function pcmToWavBlob(pcmData: Uint8Array, numChannels: number, sampleRate: number): Blob {
  const bytesPerSample = 2; // 16-bit PCM
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = pcmData.length;

  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // RIFF header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');

  // fmt sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Ukuran sub-chunk (16 untuk PCM)
  view.setUint16(20, 1, true); // Format audio (1 untuk PCM)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bytesPerSample * 8, true); // Bit per sampel

  // data sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Tulis data PCM
  for (let i = 0; i < dataSize; i++) {
    view.setUint8(44 + i, pcmData[i]);
  }

  return new Blob([view], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}