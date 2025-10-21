import React, { useState } from 'react';
import { credentials } from './authCredentials';

interface LoginProps {
  onLoginSuccess: () => void;
}

// Fungsi helper untuk melakukan hash SHA-256 pada sebuah string
async function sha256(message: string): Promise<string> {
  // Meng-encode string menjadi byte
  const msgBuffer = new TextEncoder().encode(message);
  // Melakukan hash pada buffer
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  // Mengubah buffer menjadi array byte
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  // Mengubah setiap byte menjadi string hex dan menggabungkannya
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Normalisasi input: ubah ke huruf kecil dan hapus spasi
      const normalizedUsername = username.toLowerCase().trim();
      // Hapus spasi dari sandi sebelum hashing untuk mencegah error umum
      const hashedPassword = await sha256(password.trim());

      // Simulasi penundaan jaringan dengan cara yang andal
      await new Promise(resolve => setTimeout(resolve, 500));

      if (credentials.has(normalizedUsername) && credentials.get(normalizedUsername) === hashedPassword) {
        onLoginSuccess();
      } else {
        setError('Username atau password salah. Silakan coba lagi.');
      }
    } catch (err) {
      console.error("Terjadi kesalahan saat login:", err);
      setError("Terjadi kesalahan tak terduga. Silakan coba lagi nanti.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-200 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-slate-200 rounded-3xl p-8 space-y-6 shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff]">
        <header className="text-center">
          <h1 className="text-2xl font-bold text-slate-800">Selamat Datang</h1>
          <p className="text-slate-500 mt-1">Silakan masuk untuk melanjutkan</p>
        </header>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-semibold text-slate-600 mb-2 ml-2"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full p-4 border-transparent bg-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 shadow-[inset_5px_5px_10px_#d1d9e6,inset_-5px_-5px_10px_#ffffff] text-slate-700 placeholder:text-slate-400"
              placeholder="Masukkan username"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-slate-600 mb-2 ml-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-4 border-transparent bg-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 shadow-[inset_5px_5px_10px_#d1d9e6,inset_-5px_-5px_10px_#ffffff] text-slate-700 placeholder:text-slate-400"
              placeholder="Masukkan password"
            />
          </div>
          
          {error && <p className="text-red-600 text-sm text-center">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-10 py-4 bg-slate-200 text-blue-600 font-bold rounded-2xl shadow-[5px_5px_10px_#d1d9e6,-5px_-5px_10px_#ffffff] hover:text-blue-700 active:shadow-[inset_5px_5px_10px_#d1d9e6,inset_-5px_-5px_10px_#ffffff] focus:outline-none focus:ring-2 focus:ring-offset-4 focus:ring-offset-slate-200 focus:ring-blue-500 disabled:shadow-none disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-200 ease-in-out"
            >
              {isLoading ? 'Memeriksa...' : 'Masuk'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;