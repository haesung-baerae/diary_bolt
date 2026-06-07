export interface DiaryEntry {
  id: string;
  user_id: string;
  date: string;
  thing1: string;
  thing2: string;
  thing3: string;
  ai_praise?: string | null;
  created_at: string;
}
