import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Eye, EyeOff, Leaf } from 'lucide-react';

type Mode = 'login' | 'signup';

export default function AuthScreen() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccess('계정이 생성되었습니다. 로그인해 주세요.');
        setMode('login');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '오류가 발생했습니다.';
      if (message.includes('Invalid login credentials')) {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      } else if (message.includes('User already registered')) {
        setError('이미 가입된 이메일입니다. 로그인해 주세요.');
      } else if (message.includes('Password should be at least')) {
        setError('비밀번호는 6자 이상이어야 합니다.');
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: 'http://localhost:5173' },
      });

      if (error) throw error;
      // Supabase will redirect the browser for OAuth flows.
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '오류가 발생했습니다.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
            <Leaf className="w-7 h-7 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-stone-800 tracking-tight">자존감 다이어리</h1>
          <p className="text-stone-500 text-sm mt-1">오늘 잘한 일을 기록해보세요</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-soft p-8">
          <h2 className="text-lg font-semibold text-stone-700 mb-6">
            {mode === 'login' ? '로그인' : '회원가입'}
          </h2>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 px-4 py-3 bg-green-50 border border-green-100 rounded-xl text-sm text-green-700">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1.5">이메일</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="hello@example.com"
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1.5">비밀번호</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="6자 이상"
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-semibold rounded-xl transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed mt-2 shadow-sm"
            >
              {loading ? '처리 중...' : mode === 'login' ? '로그인' : '가입하기'}
            </button>
          </form>

          <div className="mt-4">
            <div className="relative flex items-center">
              <div className="flex-1 h-px bg-stone-100" />
              <span className="px-3 text-xs text-stone-400">또는</span>
              <div className="flex-1 h-px bg-stone-100" />
            </div>
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full mt-3 py-3 border border-stone-200 rounded-xl flex items-center justify-center gap-2 bg-white text-stone-700 hover:bg-stone-50 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              구글로 로그인
            </button>
          </div>

          <div className="mt-6 text-center">
            <span className="text-sm text-stone-500">
              {mode === 'login' ? '계정이 없으신가요? ' : '이미 계정이 있으신가요? '}
            </span>
            <button
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); setSuccess(null); }}
              className="text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
            >
              {mode === 'login' ? '회원가입' : '로그인'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
