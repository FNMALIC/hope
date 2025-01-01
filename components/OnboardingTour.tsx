
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Book, Calendar, PenLine, HandHeart, Users, Star, ChevronRight } from 'lucide-react';

const OnboardingTour = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  
  const steps = [
    {
      title: "Welcome to Daily Light",
      description: "Your daily companion for spiritual encouragement, reflection, and growth.",
      icon: null,
      highlight: "mb-4 bg-purple-50 p-6 rounded-lg"
    },
    {
      title: "Daily Streaks",
      description: "Build consistency in your spiritual journey. Visit daily to maintain your streak and track your progress.",
      icon: <Calendar className="w-8 h-8 text-purple-500" />,
      highlight: "mb-4 bg-blue-50 p-6 rounded-lg"
    },
    {
      title: "Verse Generator",
      description: "Receive encouraging verses tailored to your needs. Choose from different categories or get random verses for daily inspiration.",
      icon: <Book className="w-8 h-8 text-blue-500" />,
      highlight: "mb-4 bg-green-50 p-6 rounded-lg"
    },
    {
      title: "Personal Reflections",
      description: "Write and save your thoughts on verses that speak to you. Your spiritual journal helps track your growth over time.",
      icon: <PenLine className="w-8 h-8 text-green-500" />,
      highlight: "mb-4 bg-yellow-50 p-6 rounded-lg"
    },
    {
      title: "Prayer Journal",
      description: "Keep track of your prayers and answered prayers. Stay connected to your spiritual practice.",
      icon: <HandHeart className="w-8 h-8 text-yellow-500" />,
      highlight: "mb-4 bg-pink-50 p-6 rounded-lg"
    },
    {
      title: "Community",
      description: "Connect with others on their spiritual journey. Share encouragement and grow together.",
      icon: <Users className="w-8 h-8 text-pink-500" />,
      highlight: "mb-4 bg-indigo-50 p-6 rounded-lg"
    },
    {
      title: "Favorites & Sharing",
      description: "Save your favorite verses and share encouragement with others. Build your personal collection of meaningful scriptures.",
      icon: <Star className="w-8 h-8 text-indigo-500" />,
      highlight: "mb-4 bg-orange-50 p-6 rounded-lg"
    }
  ];

  const handleNext = () => {
    if (step === steps.length - 1) {
      onComplete();
    } else {
      setStep(step + 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className={steps[step].highlight}>
            <div className="flex justify-center mb-4">
              {steps[step].icon}
            </div>
            <h2 className="text-xl font-bold text-center mb-2">
              {steps[step].title}
            </h2>
            <p className="text-center text-gray-600">
              {steps[step].description}
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 w-4 rounded-full ${
                    index === step ? 'bg-purple-500' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <Button onClick={handleNext} className="gap-2">
              {step === steps.length - 1 ? "Get Started" : "Next"}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingTour;