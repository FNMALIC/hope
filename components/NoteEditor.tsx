import { useToast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';
import React, { useState } from 'react'
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';

function NoteEditor ({ onSave, initialText = '', verseReference = '', verseText = '' }) {
  
        const [noteText, setNoteText] = useState(initialText);
        const { toast } = useToast()
        const handleSave = () => {
          if (!noteText.trim()) {
            toast({
              description: "Please enter some text for your note.",
              variant: "destructive"
            });
            return;
          }
      
          onSave({
            id: Date.now().toString(),
            text: noteText,
            date: new Date().toISOString(),
            verseReference,
            verseText
          });
          setNoteText('');
        };
      
        return (
          <div className="space-y-4">
            <Textarea
              placeholder="Write your reflection here..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="min-h-[150px]"
            />
            <Button onClick={handleSave} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              Save Reflection
            </Button>
          </div>
        );
      
}

export default NoteEditor