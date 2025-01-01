import { useToast } from '@/hooks/use-toast';
import { PrayerRequest } from '@/interfaces/PrayerRequest';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Save, Heart, Send, X } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';

const PRAYER_PARTNER_NUMBER = "+23797122421";

function PrayerJournal() {
  const [prayerEntries, setPrayerEntries] = useState<PrayerRequest[]>(() => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('prayerEntries') || '[]');
    }
    return [];
  });
  const { toast } = useToast()

  const [newEntry, setNewEntry] = useState('');
  const [entryType, setEntryType] = useState<'request' | 'gratitude'>('request');
  const [category, setCategory] = useState('');
  const [showAnsweredOnly, setShowAnsweredOnly] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('prayerEntries', JSON.stringify(prayerEntries));
    }
  }, [prayerEntries]);

  const handleSubmit = () => {
    if (!newEntry.trim()) {
      toast({
        description: "Please enter your prayer request or gratitude.",
        variant: "destructive"
      });
      return;
    }

    const entry: PrayerRequest = {
      id: Date.now().toString(),
      type: entryType,
      text: newEntry,
      date: new Date().toISOString(),
      category,
      isAnswered: false
    };

    setPrayerEntries(prev => [entry, ...prev]);
    setNewEntry('');
    setCategory('');
    toast({
      description: `Your ${entryType} has been added to the journal.`,
    });
  };

  const toggleAnswered = (id: string) => {
    setPrayerEntries(prev =>
      prev.map(entry =>
        entry.id === id
          ? { ...entry, isAnswered: !entry.isAnswered }
          : entry
      )
    );
  };

  const deleteEntry = (id: string) => {
    setPrayerEntries(prev => prev.filter(entry => entry.id !== id));
    toast({
      description: "Entry deleted.",
    });
  };

  const shareToWhatsApp = (entry: PrayerRequest) => {
    const text = encodeURIComponent(
      `🙏 ${entry.type === 'request' ? 'Prayer Request' : 'Gratitude'}\n\n` +
      `${entry.text}\n\n` +
      `Category: ${entry.category || 'General'}\n` +
      `Date: ${new Date(entry.date).toLocaleDateString()}`
    );
    
    window.open(`https://wa.me/${PRAYER_PARTNER_NUMBER}?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div className="flex flex-col space-y-2">
          <Label>Type</Label>
          <Select value={entryType} onValueChange={(value: 'request' | 'gratitude') => setEntryType(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="request">Prayer Request</SelectItem>
                <SelectItem value="gratitude">Gratitude</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col space-y-2">
          <Label>Category (optional)</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="family">Family</SelectItem>
                <SelectItem value="health">Health</SelectItem>
                <SelectItem value="work">Work</SelectItem>
                <SelectItem value="spiritual">Spiritual</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col space-y-2">
          <Label>Your {entryType === 'request' ? 'Prayer Request' : 'Gratitude'}</Label>
          <Textarea
            placeholder={`Write your ${entryType === 'request' ? 'prayer request' : 'gratitude'} here...`}
            value={newEntry}
            onChange={(e) => setNewEntry(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        <Button onClick={handleSubmit} className="w-full">
          <Save className="w-4 h-4 mr-2" />
          Save Entry
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold">Journal Entries</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAnsweredOnly(!showAnsweredOnly)}
          >
            {showAnsweredOnly ? 'Show All' : 'Show Answered Only'}
          </Button>
        </div>

        <ScrollArea className="h-[400px]">
          <div className="pr-4">
            {prayerEntries
              .filter(entry => !showAnsweredOnly || entry.isAnswered)
              .map((entry) => (
                <div
                  key={entry.id}
                  className={`border rounded-lg p-3 space-y-2 mb-3 ${
                    entry.isAnswered ? 'bg-green-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={`inline-block px-2 py-1 text-xs rounded ${
                        entry.type === 'request' ? 'bg-blue-100' : 'bg-purple-100'
                      }`}>
                        {entry.type === 'request' ? 'Prayer Request' : 'Gratitude'}
                      </span>
                      {entry.category && (
                        <span className="ml-2 text-xs text-gray-500">
                          {entry.category}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {entry.type === 'request' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleAnswered(entry.id)}
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              entry.isAnswered ? 'fill-red-500 text-red-500' : ''
                            }`}
                          />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => shareToWhatsApp(entry)}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteEntry(entry.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{entry.text}</p>
                  <span className="text-xs text-gray-500">
                    {new Date(entry.date).toLocaleDateString()}
                  </span>
                </div>
              ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

export default PrayerJournal;