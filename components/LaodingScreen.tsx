import { Heart } from 'lucide-react'
import React from 'react'

function LaodingScreen() {
  return (
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
  )
}

export default LaodingScreen