import SurfSpotFinder from '@/components/ui/SurfSpotFinder';
import test from 'node:test';

const Page = () => {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="p-6 text-center">
        <h1 className="text-4xl font-bold mb-4">Surf Spot Finder</h1>
        <p className="text-gray-600 mb-8">Find the perfect waves around you</p>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <SurfSpotFinder />
      </main>

      <footer className="p-6 text-center text-gray-600">
        <p>Powered by Next.js and ChatGPT</p>
      </footer>
    </div>
  );
};

export default Page;
