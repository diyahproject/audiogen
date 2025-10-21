
interface Voice {
  name: string;
  apiName: string; // Nama internal untuk API
  description: string;
  gender: 'male' | 'female';
}

// Catatan: Pemetaan ini didasarkan pada upaya terbaik untuk mencocokkan deskripsi
// dengan karakteristik suara API yang tersedia.
export const VOICES: Voice[] = [
  { name: 'Gita', apiName: 'kore', description: 'ceria, spontan, mood booster', gender: 'female' },
  { name: 'Raden', apiName: 'puck', description: 'kalem, bijak, suara adem', gender: 'male' },
  { name: 'Baskara', apiName: 'umbriel', description: 'pintar, berwibawa, fokus', gender: 'male' },
  { name: 'Kirana', apiName: 'schedar', description: 'tegas, lugas, leader vibes', gender: 'female' },
  { name: 'Bayu', apiName: 'zephyr', description: 'heboh, semangat, komentator', gender: 'male' },
  { name: 'Ratih', apiName: 'autonoe', description: 'kekinian, cepat tanggap, luwes', gender: 'female' },
  { name: 'Agung', apiName: 'zubenelgenubi', description: 'berwibawa, gentleman, humor bapak', gender: 'male' },
  { name: 'Ayu', apiName: 'laomedeia', description: 'lembut, hangat, menenangkan', gender: 'female' },
  { name: 'Dian', apiName: 'erinome', description: 'santai, chill, vibes liburan', gender: 'female' },
  { name: 'Sari', apiName: 'callirrhoe', description: 'ceria, ketawa renyah, nular', gender: 'female' },
  { name: 'Budi', apiName: 'orus', description: 'santai, asik, bestie ngopi', gender: 'male' },
  { name: 'Dewi', apiName: 'vindemiatrix', description: 'halus, sopan, pro gamer', gender: 'female' },
  { name: 'Surya', apiName: 'fenrir', description: 'enerjik, suara bass, cocok jadi host', gender: 'male' },
  { name: 'Jaka', apiName: 'sadachbia', description: 'tenang, hemat, elegan', gender: 'male' },
  { name: 'Maya', apiName: 'aoede', description: 'hangat, ramah, up-to-date', gender: 'female' },
  { name: 'Prabu', apiName: 'gacrux', description: 'tegas, prinsipil, to the point', gender: 'male' },
  { name: 'Gatot', apiName: 'iapetus', description: 'stabil, menenangkan, storyteller', gender: 'male' },
  { name: 'Wisnu', apiName: 'alnilam', description: 'dewasa, pemikir, teliti', gender: 'male' },
  { name: 'Tania', apiName: 'despina', description: 'pede, blak-blakan, witty', gender: 'female' },
  { name: 'Dimas', apiName: 'charon', description: 'ramah, ganteng, sopan', gender: 'male' }
];
