import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, Save, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { generateAiPraise } from '../lib/gemini';
import type { DiaryEntry } from '../types';

interface EntryScreenProps {
  date: string;
  onBack: () => void;
}

const PROMPTS = [
  '첫 번째 잘한 일을 적어보세요',
  '두 번째 잘한 일을 적어보세요',
  '세 번째 잘한 일을 적어보세요',
];

export default function EntryScreen({ date, onBack }: EntryScreenProps) {
  const [things, setThings] = useState(['', '', '']);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [aiPraise, setAiPraise] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const displayDate = new Date(date + 'T00:00:00').toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });

  useEffect(() => {
    fetchEntry();
  }, [date]);

  const fetchEntry = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('diary_entries')
      .select('*')
      .eq('date', date)
      .maybeSingle();

    if (!error && data) {
      const entry = data as DiaryEntry;
      setThings([entry.thing1, entry.thing2, entry.thing3]);
      setAiPraise(entry.ai_praise ?? null);
    } else {
      setAiPraise(null);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    const baseEntry = {
      date,
      thing1: things[0],
      thing2: things[1],
      thing3: things[2],
    };

    const { error } = await supabase
      .from('diary_entries')
      .upsert(baseEntry, { onConflict: 'user_id,date' });

    if (error) {
      setError('저장 중 오류가 발생했습니다. 다시 시도해 주세요.');
      setSaving(false);
      return;
    }

    try {
      const praise = await generateAiPraise(things[0], things[1], things[2]);
      if (praise) {
        const { error: aiError } = await supabase
          .from('diary_entries')
          .upsert(
            {
              ...baseEntry,
              ai_praise: praise,
            },
            { onConflict: 'user_id,date' }
          );

        if (aiError) {
          setError('AI 응원 저장 중 오류가 발생했습니다. 기록은 저장되었습니다.');
        }

        setAiPraise(praise);
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (geminiError) {
      console.error(geminiError);
      setError('AI 응원 생성 중 오류가 발생했습니다. 기록은 저장되었습니다.');
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }

    setSaving(false);
  };

  const updateThing = (index: number, value: string) => {
    setThings((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
    setSaved(false);
    setAiPraise(null);
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-white border-b border-stone-100 px-4 py-4 flex items-center gap-3 shadow-sm">
        <button
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-stone-100 transition-colors text-stone-600"
          aria-label="뒤로가기"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-bold text-stone-800 text-base leading-tight">오늘의 기록</h1>
          <p className="text-xs text-stone-500 mt-0.5">{displayDate}</p>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-8">
        {/* Prompt banner */}
        <div className="bg-green-50 border border-green-100 rounded-2xl px-5 py-4 mb-8 flex items-start gap-3">
          <span className="text-xl leading-none mt-0.5">🌱</span>
          <div>
            <p className="font-semibold text-green-800 text-sm">오늘 잘한 일 3가지를 적어보세요</p>
            <p className="text-green-700 text-xs mt-0.5 leading-relaxed">
              아무리 작은 것도 괜찮아요. 오늘 하루를 충분히 살아낸 당신을 칭찬해 주세요.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-5">
            {things.map((value, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-soft p-5">
                <label className="flex items-center gap-2 text-sm font-semibold text-stone-700 mb-3">
                  <span className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {index + 1}
                  </span>
                  {index === 0 ? '첫 번째 잘한 일' : index === 1 ? '두 번째 잘한 일' : '세 번째 잘한 일'}
                </label>
                <textarea
                  value={value}
                  onChange={(e) => updateThing(index, e.target.value)}
                  placeholder={PROMPTS[index]}
                  rows={3}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-800 placeholder-stone-400 text-sm leading-relaxed focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all resize-none"
                />
              </div>
            ))}

            {aiPraise && (
              <div className="bg-white rounded-3xl border border-green-100 shadow-soft p-5">
                <p className="text-xs font-semibold text-green-600 uppercase tracking-[0.18em] mb-3">AI 응원 메시지</p>
                <div className="text-sm text-stone-800 leading-relaxed break-words">
                  <ReactMarkdown>{aiPraise}</ReactMarkdown>
                </div>
              </div>
            )}

            {error && (
              <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={saving || saved}
              className={`w-full py-3.5 rounded-2xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-sm
                ${saved
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : 'bg-green-500 hover:bg-green-600 active:bg-green-700 text-white disabled:opacity-60 disabled:cursor-not-allowed'
                }`}
            >
              {saved ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  저장되었습니다
                </>
              ) : saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  저장 중...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  저장하기
                </>
              )}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
