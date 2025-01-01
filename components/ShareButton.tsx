import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@radix-ui/react-dropdown-menu';
import { Share2, Twitter, Facebook, Linkedin } from 'lucide-react';
import React from 'react'
import { Button } from './ui/button';

function ShareButton ({ content, reference = '' }){
   
        const shareText = reference ? `${content} - ${reference}` : content;
        const encodedText = encodeURIComponent(shareText);
        const { toast } = useToast()
        const handleShare = async (platform) => {
          const urls = {
            twitter: `https://twitter.com/intent/tweet?text=${encodedText}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${window.location.href}&quote=${encodedText}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${window.location.href}&summary=${encodedText}`,
          };
      
          if (navigator.share && platform === 'native') {
            try {
              await navigator.share({
                text: shareText,
                url: window.location.href,
              });
              toast({
                description: "Successfully shared!",
              });
            } catch (error) {
              console.error('Error sharing:', error);
            }
          } else {
            window.open(urls[platform], '_blank', 'width=600,height=400');
          }
        };
      
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Share2 className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleShare('twitter')}>
                <Twitter className="w-4 h-4 mr-2" />
                Share on Twitter
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShare('facebook')}>
                <Facebook className="w-4 h-4 mr-2" />
                Share on Facebook
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShare('linkedin')}>
                <Linkedin className="w-4 h-4 mr-2" />
                Share on LinkedIn
              </DropdownMenuItem>
              {navigator.share && (
                <DropdownMenuItem onClick={() => handleShare('native')}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share via device
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      
}

export default ShareButton