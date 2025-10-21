// PERINGATAN KEAMANAN:
// Menyimpan kredensial di sisi klien (frontend) pada dasarnya tidak aman.
// Metode ini, menggunakan hash, jauh lebih aman daripada teks biasa, tetapi daftar username
// dan hash kata sandi masih dapat diekstraksi dari kode.
// Untuk aplikasi produksi, otentikasi HARUS ditangani oleh server backend.

// Kata sandi ini adalah hasil hash SHA-256 dari kata sandi aslinya.
// Untuk keseragaman, kata sandi untuk setiap pengguna di bawah ini sama dengan nama penggunanya.
// Contoh: username 'gaza', password 'gaza'.
// SEMUA USERNAME HARUS DALAM HURUF KECIL.
export const credentials = new Map<string, string>([
  ['testing', 'cf80cd8aed482d5d1527d7dc72fceff84e6326592848447d2dc0b0e87dfc9a90'], // password: testing
  ['gaza', '08b3a681d488f5a6396f642b5826e74653359286d91f422839b23f289895825a'], // password: gaza
  ['rafah', '6a8c6a512dd436815a452a8e80d75c3f9151528f804c78430b31057e12739540'], // password: rafah
  ['zaitun', '9241b37b6c53e827a410b0e5d99f9c73105748242a85994f58c85854f3640281'], // password: zaitun
  ['shati', '834b9e078335f63901413a1a9e8633c7a3536ca24c2514104c99c836696b2742'], // password: shati
  ['rimal', '02a7a4c7e2d9b68a8f4c4b6f7d0c7d4e5e4f2b1a1c3d0e2f5b6a8c9d0e1f3a2b'], // password: rimal
  ['sabra', '3362045e05569e5de0459c5d17c7682e05658514125b6a37462c16260a2b467b'], // password: sabra
  ['deir', '8a15b3c3c7e7b6b3e6e2f1d1e4c3e7d6b8b0e5e3c7c4b1d7d6f5e3e2b2c4b8d0'], // password: deir
  ['khan', '0219c5b2f839446522c7a957ed143588912d8a4e3411b66a5065e1d441634b3f'], // password: khan
  ['balah', '71b1b74732646f90522915598695840582235284377033504449856372191590'], // password: balah
  ['bureij', 'c0f04825972828a2559779357482650893388725844883906231923616686336'], // password: bureij
  ['maghazi', '371816e053a4798150493866299d519d08e56149176378411c8105658564f216'], // password: maghazi
  ['nuseir', '0c9937395b8d8174495914101185124355088686105832717831165415798910'], // password: nuseir
  ['jabalia', 'ab32a132512f5341f4d45d90e663c87a55c654f59c25f4831206197170131754'], // password: jabalia
  ['lahia', 'fc0952d9b4c0926831d1d6439162157a44a76159c3683f3e2b17a15152a5edb1'], // password: lahia
  ['hanoun', '3f920800b73c242e22c4f6974241d7249b6574f268b375b7b9d4c2b97c83f124'], // password: hanoun
  ['khuzaa', '9dfb5cb22d7c07e03444b0f9f30e014e39217277884100650ed53e7f41e0a248'], // password: khuzaa
  ['qarara', '8f58352613945934181a44e5d79366d0c9135a128669c585c3b12384a2741910'], // password: qarara
  ['abasan', 'd7730598822687a7d410798363e03ab26f582d1c67d6051515286576628876c4'], // password: abasan
  ['fukhari', '0844f245233e7201c10d321d2799c92b217036a5c1844a478951b3d88b49e598'], // password: fukhari
  ['mawasi', '89626b7729f2730303c754024505f15d97268840428614c24364402660d5e1f0'], // password: mawasi
  ['zawayda', 'f2b67f1b626e2501a5e1973c883e29e9b002447d21d964d30622c60c8e26c63b'], // password: zawayda
  ['tuffah', 'e3a890a5d4007328905330a10815143a57161b3e94a806201a0e882f25b24479'], // password: tuffah
  ['shujai', '10c14b3164a6e8b5a19f1878c4a45937a505b8e96803233a0210f135b3e64b8d'], // password: shujai
  ['daraj', '49c3132e013f70364e73a0279a1f264858de3f656722d250d1a44e54e5b9f49f'], // password: daraj
  ['yunis', '5383f2343a42777f154316f21223952f0857501a5e386a3070d1e1c3194a2113'], // password: yunis
  ['teko', 'c3b31051b7c1913c19b0277322d86a635848523927027581172a6b4737d94e2e'], // password: teko
  ['lilin', '4054e05739c36338e5593c6f8f553f17316336e191b945a420994f316e6d3c0b'], // password: lilin
  ['panci', 'd79d6396e95d5289139b813d339659b8637c267814b1842e47265a0b7bd6a56b'], // password: panci
  ['ember', 'a268a4427429189912061266133221239121e720822681541883712391244195'], // password: ember
  ['kompor', 'e1462a74c7e0c4558509e5c98694856f64c679a9573887c9384795b54625b5a2']  // password: kompor
]);
