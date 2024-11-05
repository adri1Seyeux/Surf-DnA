'use client';

import { 
  BiWater,
  BiSolidCircle,
  BiTime,
  BiErrorAlt,
  BiGroup
} from 'react-icons/bi';

interface SurfSpot {
  name: string;
  description: string;
  bestFor: string[];
  isDivider?: boolean;
}

interface SurfSpotResultsProps {
  spots: SurfSpot[];
  isLoading: boolean;
}

interface SurfDetailProps {
  icon: React.ReactElement;
  text: string;
  difficulty?: string;
}

const SurfDetail = ({ icon, text, difficulty = '' }: SurfDetailProps) => {
  // Split the text into label and content
  const [label, content] = text.split(':');

  return (
    <div className="flex items-center space-x-4 py-3">
      <div className={`w-7 h-7 ${
        difficulty === 'beginner' ? 'text-green-500' :
        difficulty === 'intermediate' ? 'text-yellow-500' :
        difficulty === 'advanced' ? 'text-red-500' :
        text.includes('Wave description:') ? 'text-blue-500' :
        text.includes('Best tide:') ? 'text-purple-500' :
        text.includes('Hazards:') ? 'text-orange-500' :
        text.includes('Crowd level:') ? 'text-indigo-500' :
        'text-gray-600'
      }`}>
        {icon}
      </div>
      <span className="text-gray-700">
        <span className="font-bold">{label}:</span>{content}
      </span>
    </div>
  );
};

// Separate SpotCard component for cleaner code
const SpotCard = ({ spot }: { spot: SurfSpot & { isDivider?: boolean } }) => {
  if (spot.isDivider) {
    return (
      <div className="my-8 text-center text-gray-500">
        {spot.name}
      </div>
    );
  }

  const lines = spot.description?.split('\n') || [];
  const difficultyLine = lines.find(line => line.includes('Difficulty:'));
  const difficulty = difficultyLine?.toLowerCase().includes('beginner') ? 'beginner' :
                    difficultyLine?.toLowerCase().includes('intermediate') ? 'intermediate' :
                    'advanced';
  
  const hasDistance = spot.name?.includes(' - ');
  const displayName = hasDistance ? spot.name.split(' - ')[0].trim() : spot.name;
  const distance = hasDistance ? spot.name.split(' - ')[1].trim() : '';
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <h3 className="text-2xl font-bold text-gray-900">{displayName}</h3>
          {distance && (
            <span className="text-sm text-gray-500 italic">{distance}</span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <BiSolidCircle size={24} className={
            difficulty === 'beginner' ? 'text-green-500' :
            difficulty === 'intermediate' ? 'text-yellow-500' :
            'text-red-500'
          } />
          <span className="font-medium text-gray-700">
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </span>
        </div>
      </div>
      <div className="flex flex-col space-y-4">
        {lines.map((line, idx) => {
          if (line.includes('Difficulty:')) {
            return null;
          }
          if (line.includes('Wave description:')) {
            return <SurfDetail key={idx} icon={<BiWater size={24} />} text={line} />;
          }
          if (line.includes('Best tide:')) {
            return <SurfDetail key={idx} icon={<BiTime size={24} />} text={line} />;
          }
          if (line.includes('Hazards:')) {
            return <SurfDetail key={idx} icon={<BiErrorAlt size={24} />} text={line} />;
          }
          if (line.includes('Crowd level:')) {
            return <SurfDetail key={idx} icon={<BiGroup size={24} />} text={line} />;
          }
          return null;
        })}
      </div>
    </div>
  );
};

export default function SurfSpotResults({ spots = [], isLoading }: SurfSpotResultsProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center mt-8">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-6">
      {spots.map((spot, index) => 
        spot.name === "__DIVIDER__" ? (
          <div key={`divider-${index}`} className="flex items-center my-8">
            <div className="flex-grow border-t border-gray-300"></div>
            <div className="mx-4 text-gray-500 font-medium">Other Nearby Spots</div>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>
        ) : (
          <SpotCard key={`spot-${index}`} spot={spot} />
        )
      )}
    </div>
  );
}