export interface PrayerRequest {
    id: string;
    type: 'request' | 'gratitude';
    text: string;
    date: string;
    isAnswered?: boolean;
    category?: string;
  }