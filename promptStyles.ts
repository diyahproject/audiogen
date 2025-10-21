export interface PromptStyle {
  name: string;
  label: string;
  prompt: string;
}

export const PROMPT_STYLES: PromptStyle[] = [
  { 
    name: 'marah', 
    label: 'Marah (tegas)', 
    prompt: 'Hasilkan voice-over dalam Bahasa Indonesia (id-ID) dengan nada tegas dan kesal. Artikulasi harus jelas dengan tekanan kuat pada kata-kata penting. Gunakan jeda pendek sekitar 120–180 ms antar frasa, dan kecepatan bicara normal hingga agak cepat.' 
  },
  { 
    name: 'jenaka', 
    label: 'Jenaka (humoris)', 
    prompt: 'Baca naskah gaya santai, komedik, dan hangat. Saat konteksnya lucu, gunakan variasi tawa yang natural dari daftar berikut:\n\n- **Chuckle Pendek (tertahan):** “heh…”, “eheh”, “hehe (pelan)”\n- **Tawa Sedang (riang):** “haha”, “ahaha”, “hehehe”\n- **Tawa Meledak (ngakak):** “HA-ha-ha—”, “huahaha—hah…”\n- **Cekikikan:** “hihihi”\n- **Tawa Malu/Canggung:** “heh—eh…”, “ehehe… (pendek)”\n\nATURAN TAWA:\n1. Selalu beri jeda singkat sebelum dan sesudah tawa.\n2. Sisipkan sedikit tarikan napas sebelum tawa besar, dan biarkan tawa mereda secara alami di akhir (volume menurun).\n3. Hindari mengulang jenis tawa yang sama; campurkan variasi agar terdengar hidup (gunakan 1-2 variasi per momen).\n\nINSTRUKSI LAINNYA:\n- Jaga tempo bercerita sekitar 0.95–1.05 dari normal.\n- Naikkan nada sedikit (+0–2 semitone) saat punchline.\n- Contoh pola: setup → jeda 300–500 ms → chuckle pendek → punchline → tawa sedang/meledak → mereda.'
  },
  { 
    name: 'semangat', 
    label: 'Semangat (motivasi)', 
    prompt: 'Hasilkan voice-over dalam Bahasa Indonesia (id-ID) yang energik dan menyemangati. Gunakan tempo yang agak cepat dengan nada optimistis. Berikan penekanan khusus di awal dan akhir kalimat, serta gunakan jeda singkat antar poin untuk menjaga dinamika.'
  },
  { 
    name: 'sedih', 
    label: 'Sedih (lembut)', 
    prompt: 'Hasilkan voice-over dalam Bahasa Indonesia (id-ID) yang lembut dan empatik. Gunakan tempo yang pelan dengan nada hangat. Hindari tekanan yang berlebihan pada kata-kata, dan sisipkan jeda yang lebih panjang sekitar 250–400 ms di bagian-bagian yang emosional untuk memberi ruang perenungan.'
  },
  { 
    name: 'formal', 
    label: 'Formal (profesional)', 
    prompt: 'Hasilkan voice-over dalam Bahasa Indonesia (id-ID) yang formal dan berwibawa, cocok untuk MC atau iklan. Jaga tempo bicara yang stabil dan gunakan diksi yang rapi. Berikan penekanan yang ringan pada angka atau fitur produk, dengan jeda konsisten sekitar 150–200 ms antar poin.'
  },
];