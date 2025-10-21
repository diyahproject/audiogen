// Since lamejs is loaded via a script tag, we need to declare the global.
// This tells TypeScript that a 'lamejs' variable exists at runtime.
declare const lamejs: any;

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
 * Mengenkode data audio PCM mentah menjadi Blob format file MP3 menggunakan lamejs.
 * @param pcmData Data audio mentah sebagai Uint8Array (diasumsikan PCM 16-bit signed).
 * @param numChannels Jumlah saluran audio (mis., 1 untuk mono).
 * @param sampleRate Tingkat sampel audio (mis., 24000 untuk Gemini TTS).
 * @param bitrate Bitrate untuk enkoding MP3 dalam kbps (mis., 128, 64, 32).
 * @returns Sebuah Blob yang merepresentasikan file MP3.
 */
export function pcmToMp3Blob(pcmData: Uint8Array, numChannels: number, sampleRate: number, bitrate: number = 128): Blob {
  // lamejs mengharapkan data PCM sebagai Int16Array.
  // Buffer dari Uint8Array dapat dilihat sebagai Int16Array.
  const samples = new Int16Array(pcmData.buffer);

  // Bitrate sekarang dapat dikonfigurasi untuk mengontrol kualitas vs ukuran file.
  const mp3encoder = new lamejs.Mp3Encoder(numChannels, sampleRate, bitrate);
  const mp3Data: Int8Array[] = [];

  const sampleBlockSize = 1152; // Ukuran blok sampel yang direkomendasikan untuk lamejs

  for (let i = 0; i < samples.length; i += sampleBlockSize) {
    const sampleChunk = samples.subarray(i, i + sampleBlockSize);
    const mp3buf = mp3encoder.encodeBuffer(sampleChunk);
    if (mp3buf.length > 0) {
      // mp3buf adalah Int8Array
      mp3Data.push(mp3buf);
    }
  }

  const mp3buf = mp3encoder.flush(); // Bersihkan sisa buffer
  if (mp3buf.length > 0) {
    mp3Data.push(mp3buf);
  }

  return new Blob(mp3Data, { type: 'audio/mp3' });
}