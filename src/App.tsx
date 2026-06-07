import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import AuthScreen from './components/AuthScreen';
import CalendarScreen from './components/CalendarScreen';
import EntryScreen from './components/EntryScreen';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoadingSession(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSelectedDate(null);
  };

  if (loadingSession) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <AuthScreen />;
  }

  if (selectedDate) {
    return (
      <EntryScreen
        date={selectedDate}
        onBack={() => setSelectedDate(null)}
      />
    );
  }

  return (
    <CalendarScreen
      onDateSelect={setSelectedDate}
      onSignOut={handleSignOut}
      userEmail={session.user.email ?? ''}
    />
  );
}
