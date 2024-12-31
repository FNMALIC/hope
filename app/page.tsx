"use client"
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Smile, Book } from 'lucide-react';

const EncouragementGenerator = () => {
  const [verse, setVerse] = useState('');
  const [joke, setJoke] = useState('');
  const [loading, setLoading] = useState(false);

  // Array of encouraging Bible verse references
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

  const getRandomVerse = () => {
    const randomIndex = Math.floor(Math.random() * verseReferences.length);
    return verseReferences[randomIndex];
  };

  const fetchVerse = async () => {
    setLoading(true);
    try {
      const randomVerseRef = getRandomVerse();
      const response = await fetch(`https://bible-api.com/${randomVerseRef}`);
      const data = await response.json();
      setVerse({
        text: data.text.trim(),
        reference: data.reference
      });
    } catch (error) {
      console.error('Error fetching verse:', error);
      setVerse({
        text: "For God so loved the world that he gave his one and only Son.",
        reference: "John 3:16"
      });
    }
    setLoading(false);
  };

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
      setJoke("Why don't programmers like nature? It has too many bugs!");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto space-y-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl">Daily Encouragement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Button 
              onClick={fetchVerse}
              className="w-full flex items-center justify-center gap-2"
              disabled={loading}
            >
              <Book size={20} />
              Get Bible Verse
            </Button>
            {verse && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-lg mb-2">{verse.text}</p>
                <p className="text-sm text-gray-600">- {verse.reference}</p>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default EncouragementGenerator;