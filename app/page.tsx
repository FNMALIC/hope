"use client"
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Smile, Book, Heart, Calendar, Star, BookMarked } from 'lucide-react';

type Verse = { reference: string; label: string ,category?: string;};
type VersesByCategory = { [key: string]: Verse[] };


const versesByCategory: VersesByCategory = {
  anxiety: [
    { reference: 'philippians+4:6-7', label: 'Philippians 4:6-7' },
    { reference: 'matthew+6:34', label: 'Matthew 6:34' },
    { reference: '1+peter+5:7', label: '1 Peter 5:7' },
    { reference: 'psalm+56:3', label: 'Psalm 56:3' }
  ],
  grief: [
    { reference: 'psalm+34:18', label: 'Psalm 34:18' },
    { reference: 'matthew+5:4', label: 'Matthew 5:4' },
    { reference: 'psalm+147:3', label: 'Psalm 147:3' },
    { reference: 'revelation+21:4', label: 'Revelation 21:4' }
  ],
  loneliness: [
    { reference: 'deuteronomy+31:6', label: 'Deuteronomy 31:6' },
    { reference: 'isaiah+41:10', label: 'Isaiah 41:10' },
    { reference: 'matthew+28:20', label: 'Matthew 28:20' },
    { reference: 'psalm+23:4', label: 'Psalm 23:4' }
  ],
  strength: [
    { reference: 'philippians+4:13', label: 'Philippians 4:13' },
    { reference: 'isaiah+40:31', label: 'Isaiah 40:31' },
    { reference: '2+corinthians+12:9', label: '2 Corinthians 12:9' },
    { reference: 'psalm+46:1', label: 'Psalm 46:1' }
  ],
  hope: [
    { reference: 'jeremiah+29:11', label: 'Jeremiah 29:11' },
    { reference: 'romans+15:13', label: 'Romans 15:13' },
    { reference: 'romans+8:28', label: 'Romans 8:28' },
    { reference: 'hebrews+11:1', label: 'Hebrews 11:1' }
  ],
  peace: [
    { reference: 'john+14:27', label: 'John 14:27' },
    { reference: 'philippians+4:7', label: 'Philippians 4:7' },
    { reference: 'psalm+29:11', label: 'Psalm 29:11' },
    { reference: 'isaiah+26:3', label: 'Isaiah 26:3' }
  ]
};

interface CategorySelectorProps {
  onSelect: (category: string) => void; // Adjust based on your function signature
  selectedCategory: string; // Adjust based on the type of `selectedCategory`
}


const CategorySelector : React.FC<CategorySelectorProps>= ({ onSelect, selectedCategory }) => (
  <div className="grid grid-cols-2 gap-2 mb-4">
    {Object.keys(versesByCategory).map((category) => (
      <Button
        key={category}
        onClick={() => onSelect(category)}
        variant={selectedCategory === category ? "default" : "outline"}
        className="capitalize"
      >
        {category}
      </Button>
    ))}
  </div>
);

const LoadingScreen = () => (
  <div className="fixed inset-0 bg-gradient-to-b from-blue-500 to-purple-600 flex items-center justify-center">
    <div className="text-center text-white space-y-6 p-8">
      <div className="animate-bounce mb-4">
        <Heart className="w-16 h-16 mx-auto text-white" />
      </div>
      <h1 className="text-4xl font-bold mb-4">Daily Light</h1>
      <p className="text-xl italic">
        In moments of darkness, may these words be your guiding light.
      </p>
      <div className="mt-8 flex justify-center space-x-2">
        <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
        <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
      </div>
    </div>
  </div>
);

const EncouragementGenerator = () => {
  const [verse, setVerse] = useState<Verse | null>(null);
  const [joke, setJoke] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [favorites, setFavorites] = useState(() => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('favorites') || '[]');
    }
    return [];
  });
  const [streak, setStreak] = useState(() => {
    if (typeof window !== 'undefined') {
      return parseInt(localStorage.getItem('streak') || '0');
    }
    return 0;
  });
  const [lastVisit, setLastVisit] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('lastVisit') || '';
    }
    return '';
  });
  const [dailyVerse, setDailyVerse] = useState(null);
  const [showDailyChallenge, setShowDailyChallenge] = useState(false);

  const verseReferences = [
    'john+3:16',
    'philippians+4:13',
    'jeremiah+29:11',
    'psalm+23:4',
    'isaiah+41:10',
    'romans+8:28',
    'matthew+11:28',
    'joshua+1:9',
    'hebrews+11:1',
    'romans+15:13',
    'psalm+34:18',
    'philippians+4:6-7',
    'matthew+6:34',
    '2+corinthians+12:9',
    'proverbs+3:5-6'
  ];

  const dailyChallenges = [
    "Send an encouraging message to someone today",
    "Write down three things you're grateful for",
    "Pray for someone who's going through a difficult time",
    "Memorize today's verse",
    "Share an encouraging quote with a friend",
    "Do one random act of kindness today",
    "Take 5 minutes for quiet reflection"
  ];

  const fetchVerse = async (category = null) => {
    setLoading(true);
    try {
      let verseRef;
      if (category) {
        const categoryVerses = versesByCategory[category];
        verseRef = categoryVerses[Math.floor(Math.random() * categoryVerses.length)].reference;
      } else {
        verseRef = getRandomVerse();
      }
      
      const response = await fetch(`https://bible-api.com/${verseRef}`);
      const data = await response.json();
      setVerse({
        text: data.text.trim(),
        reference: data.reference,
        category: category
      });
    } catch (error) {
      console.error('Error fetching verse:', error);
      setVerse({
        text: 'For God so loved the world that he gave his one and only Son.',
        reference: 'John 3:16',
        category: null
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    // Check and update streak
    const today = new Date().toDateString();
    if (lastVisit !== today) {
      if (lastVisit === new Date(Date.now() - 86400000).toDateString()) {
        setStreak(prev => prev + 1);
      } else if (lastVisit !== new Date(Date.now() - 86400000).toDateString()) {
        setStreak(1);
      }
      setLastVisit(today);
      fetchDailyVerse();
    }

    setTimeout(() => {
      setInitialLoading(false);
    }, 3000);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('streak', streak.toString());
      localStorage.setItem('lastVisit', lastVisit);
      localStorage.setItem('favorites', JSON.stringify(favorites));
    }
  }, [streak, lastVisit, favorites]);

  const fetchDailyVerse = async () => {
    const randomVerseRef = getRandomVerse();
    try {
      const response = await fetch(`https://bible-api.com/${randomVerseRef}`);
      const data = await response.json();
      setDailyVerse({
        text: data.text.trim(),
        reference: data.reference
      });
    } catch (error) {
      console.error('Error fetching daily verse:', error);
    }
  };

  const getRandomVerse = () => {
    const randomIndex = Math.floor(Math.random() * verseReferences.length);
    return verseReferences[randomIndex];
  };

  // const fetchVerse = async () => {
  //   setLoading(true);
  //   try {
  //     const randomVerseRef = getRandomVerse();
  //     const response = await fetch(`https://bible-api.com/${randomVerseRef}`);
  //     const data = await response.json();
  //     setVerse({
  //       text: data.text.trim(),
  //       reference: data.reference
  //     });
  //   } catch (error) {
  //     console.error('Error fetching verse:', error);
  //     setVerse({
  //       text: 'For God so loved the world that he gave his one and only Son.',
  //       reference: 'John 3:16'
  //     });
  //   }
  //   setLoading(false);
  // };

  const fetchJoke = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        'https://v2.jokeapi.dev/joke/Any?safe-mode&type=single&blacklistFlags=religious,political,racist,sexist'
      );
      const data = await response.json();
      setJoke(data.joke);
    } catch (error) {
      console.error('Error fetching joke:', error);
      setJoke('Why don&apos;t programmers like nature? It has too many bugs!');
    }
    setLoading(false);
  };

  const toggleFavorite = (verse) => {
    setFavorites(prev => {
      const exists = prev.some(v => v.reference === verse.reference);
      if (exists) {
        return prev.filter(v => v.reference !== verse.reference);
      }
      return [...prev, verse];
    });
  };

  const getDailyChallenge = () => {
    const randomIndex = Math.floor(Math.random() * dailyChallenges.length);
    return dailyChallenges[randomIndex];
  };

  if (initialLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="max-w-lg mx-auto space-y-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl">Daily Light</CardTitle>
          <div className="flex justify-center items-center gap-2">
            <Calendar className="w-5 h-5" />
            <span className="text-sm">Daily Streak: {streak} days</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {dailyVerse && (
            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-bold mb-2">Today&apos;s Verse:</h3>
              <p className="text-lg mb-2">{dailyVerse.text}</p>
              <p className="text-sm text-gray-600">- {dailyVerse.reference}</p>
              <Button
                onClick={() => toggleFavorite(dailyVerse)}
                variant="ghost"
                className="mt-2"
              >
                <Star className={`w-5 h-5 ${favorites.some(v => v.reference === dailyVerse.reference) ? 'text-yellow-500 fill-yellow-500' : ''}`} />
              </Button>
            </div>
          )}

          <div className="space-y-4">
            <Button 
              onClick={() => setShowDailyChallenge(!showDailyChallenge)}
              className="w-full flex items-center justify-center gap-2"
            >
              <BookMarked size={20} />
              {showDailyChallenge ? 'Hide' : 'Show'} Daily Challenge
            </Button>
            {showDailyChallenge && (
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-bold mb-2">Today&apos;s Challenge:</h3>
                <p className="text-lg">{getDailyChallenge()}</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-center">How are you feeling today?</h3>
            <CategorySelector
              onSelect={(category) => {
                setSelectedCategory(category);
                fetchVerse(category);
              }}
              selectedCategory={selectedCategory}
            />
            
            {!selectedCategory && (
              <Button 
                onClick={() => fetchVerse()}
                className="w-full flex items-center justify-center gap-2"
                disabled={loading}
              >
                <Book size={20} />
                Get Random Verse
              </Button>
            )}

            {verse && (
              <div className="p-4 bg-blue-50 rounded-lg">
                {selectedCategory && (
                  <div className="mb-2">
                    <span className="inline-block px-2 py-1 text-sm capitalize bg-blue-100 rounded">
                      {selectedCategory}
                    </span>
                  </div>
                )}
                <p className="text-lg mb-2">{verse.text}</p>
                <p className="text-sm text-gray-600">- {verse.reference}</p>
                <Button
                  onClick={() => toggleFavorite(verse)}
                  variant="ghost"
                  className="mt-2"
                >
                  <Star className={`w-5 h-5 ${favorites.some(v => v.reference === verse.reference) ? 'text-yellow-500 fill-yellow-500' : ''}`} />
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <Button 
              onClick={fetchVerse}
              className="w-full flex items-center justify-center gap-2"
              disabled={loading}
            >
              <Book size={20} />
              Get Another Verse
            </Button>
            {verse && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-lg mb-2">{verse.text}</p>
                <p className="text-sm text-gray-600">- {verse.reference}</p>
                <Button
                  onClick={() => toggleFavorite(verse)}
                  variant="ghost"
                  className="mt-2"
                >
                  <Star className={`w-5 h-5 ${favorites.some(v => v.reference === verse.reference) ? 'text-yellow-500 fill-yellow-500' : ''}`} />
                </Button>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <Button 
              onClick={fetchJoke}
              className="w-full flex items-center justify-center gap-2"
              disabled={loading}
            >
              <Smile size={20} />
              Get Clean Joke
            </Button>
            {joke && (
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-lg">{joke}</p>
              </div>
            )}
          </div>

          {favorites.length > 0 && (
            <div className="mt-6">
              <h3 className="font-bold mb-2">Favorite Verses:</h3>
              <div className="space-y-2">
                {favorites.map((fav, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm">{fav.text}</p>
                    <p className="text-xs text-gray-600">- {fav.reference}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EncouragementGenerator;