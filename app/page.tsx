"use client"
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// import { Smile, Book, Calendar, Star , BookMarked, PenLine, X ,HandHeart,Users} from 'lucide-react';
import { Verse } from '@/types/Verse';
import { Smile, Book, Calendar, Star, BookMarked, PenLine, HandHeart, Users, Menu, X, ChevronDown } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LaodingScreen from '@/components/LaodingScreen';
import { versesByCategory } from '@/constants/versesByCategory';
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Note } from '@/interfaces/Note';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import NearbyUsers from '@/components/NearbyUsers';
import PrayerJournal from '@/components/PrayerJournal';
import NoteEditor from '@/components/NoteEditor';
import CategorySelector from '@/components/CategorySelector';
import ShareButton from '@/components/ShareButton';

const EncouragementGenerator = () => {
  const [verse, setVerse] = useState<Verse | null>(null);
  const [joke, setJoke] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showPrayerJournal, setShowPrayerJournal] = useState(false);
  const [showNearbyUsers, setShowNearbyUsers] = useState(false);
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
  const { toast } = useToast()

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


  const [notes, setNotes] = useState<Note[]>(() => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('reflectionNotes') || '[]');
    }
    return [];
  });
  const [showNotes, setShowNotes] = useState(false);

  // Save notes to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('reflectionNotes', JSON.stringify(notes));
    }
  }, [notes]);

  const addNote = (newNote: Note) => {
    setNotes(prev => [newNote, ...prev]);
    toast({
      description: "Your reflection has been saved!",
    });
  };

  const deleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
    toast({
      description: "Reflection deleted.",
    });
  };
  if (initialLoading) {
    return <LaodingScreen />;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="mb-6">
        <CardHeader className="space-y-4">
          <CardTitle className="text-center text-2xl">Daily Light</CardTitle>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span className="text-sm">Daily Streak: {streak} days</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNotes(!showNotes)}
                className="flex items-center justify-center"
              >
                <PenLine className="w-4 h-4 mr-2" />
                Reflections
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPrayerJournal(!showPrayerJournal)}
                className="flex items-center justify-center"
              >
                <HandHeart className="w-4 h-4 mr-2" />
                Prayers
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNearbyUsers(!showNearbyUsers)}
                className="flex items-center justify-center"
              >
                <Users className="w-4 h-4 mr-2" />
                Community
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Daily Verse Section */}
          {dailyVerse && (
            <Collapsible>
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between p-2 bg-purple-50 rounded-t-lg">
                  <h3 className="font-bold">Today's Verse</h3>
                  <ChevronDown className="w-4 h-4" />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="p-4 bg-purple-50 rounded-b-lg">
                  <p className="text-lg mb-2">{dailyVerse.text}</p>
                  <p className="text-sm text-gray-600">- {dailyVerse.reference}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      onClick={() => toggleFavorite(dailyVerse)}
                      variant="ghost"
                    >
                      <Star className={`w-5 h-5 ${favorites.some(v => v.reference === dailyVerse.reference) ? 'text-yellow-500 fill-yellow-500' : ''}`} />
                    </Button>
                    <ShareButton content={dailyVerse.text} reference={dailyVerse.reference} />
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <PenLine className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Reflection</DialogTitle>
                        </DialogHeader>
                        <NoteEditor
                          onSave={addNote}
                          verseReference={dailyVerse.reference}
                          verseText={dailyVerse.text}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Daily Challenge Section */}
          <Collapsible>
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between p-2 bg-green-50 rounded-t-lg">
                <h3 className="font-bold">Daily Challenge</h3>
                <ChevronDown className="w-4 h-4" />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="p-4 bg-green-50 rounded-b-lg">
                <p className="text-lg">{getDailyChallenge()}</p>
                <div className="mt-2">
                  <ShareButton content={getDailyChallenge()} />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Verse Generator Section */}
          <div className="space-y-4 border rounded-lg p-4">
            <h3 className="font-semibold text-center">Get Encouraging Verses</h3>
            <CategorySelector
              onSelect={(category) => {
                setSelectedCategory(category);
                fetchVerse(category);
              }}
              selectedCategory={selectedCategory}
            />
            
            <div className="flex gap-2">
              {!selectedCategory && (
                <Button 
                  onClick={() => fetchVerse()}
                  className="flex-1"
                  disabled={loading}
                >
                  <Book size={20} className="mr-2" />
                  Random Verse
                </Button>
              )}
              <Button 
                onClick={fetchJoke}
                className="flex-1"
                disabled={loading}
              >
                <Smile size={20} className="mr-2" />
                Clean Joke
              </Button>
            </div>

            {verse && (
              <div className="p-4 bg-blue-50 rounded-lg">
                {selectedCategory && (
                  <span className="inline-block px-2 py-1 text-sm capitalize bg-blue-100 rounded mb-2">
                    {selectedCategory}
                  </span>
                )}
                <p className="text-lg mb-2">{verse.text}</p>
                <p className="text-sm text-gray-600">- {verse.reference}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    onClick={() => toggleFavorite(verse)}
                    variant="ghost"
                  >
                    <Star className={`w-5 h-5 ${favorites.some(v => v.reference === verse.reference) ? 'text-yellow-500 fill-yellow-500' : ''}`} />
                  </Button>
                  <ShareButton content={verse.text} reference={verse.reference} />
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <PenLine className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Reflection</DialogTitle>
                      </DialogHeader>
                      <NoteEditor
                        onSave={addNote}
                        verseReference={verse.reference}
                        verseText={verse.text}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            )}

            {joke && (
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-lg">{joke}</p>
              </div>
            )}
          </div>

          {/* Expandable Sections */}
          {showNearbyUsers && (
            <div className="border rounded-lg p-4">
              <NearbyUsers />
            </div>
          )}

          {showPrayerJournal && (
            <div className="border rounded-lg p-4">
              <PrayerJournal />
            </div>
          )}

          {showNotes && (
            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="font-bold">Your Reflections</h3>
              <ScrollArea className="h-[300px] pr-4">
                {notes.length === 0 ? (
                  <p className="text-gray-500 text-center">No reflections yet. Start writing!</p>
                ) : (
                  <div className="space-y-4">
                    {notes.map((note) => (
                      <div key={note.id} className="border rounded-lg p-3 space-y-2">
                        <div className="flex justify-between items-start">
                          <span className="text-sm text-gray-500">
                            {new Date(note.date).toLocaleDateString()}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNote(note.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        {note.verseText && (
                          <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                            "{note.verseText}"
                            {note.verseReference && <span> - {note.verseReference}</span>}
                          </div>
                        )}
                        <p className="text-sm whitespace-pre-wrap">{note.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          )}

          {/* Favorites Section */}
          {favorites.length > 0 && (
            <Collapsible>
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-t-lg">
                  <h3 className="font-bold">Favorite Verses</h3>
                  <ChevronDown className="w-4 h-4" />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="p-4 bg-gray-50 rounded-b-lg">
                  <div className="space-y-2">
                    {favorites.map((fav, index) => (
                      <div key={index} className="p-3 bg-white rounded-lg">
                        <p className="text-sm">{fav.text}</p>
                        <p className="text-xs text-gray-600">- {fav.reference}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EncouragementGenerator;

