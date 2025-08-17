const Home = () => {
  return (
    <div className="flex flex-col items-center text-center pt-8">
      <div className="space-y-4">
        <h1 className="text-5xl font-bold text-leaf-green">Onam Photo Hub</h1>
        <p className="text-lg text-gray-700 max-w-md mx-auto">
          Capture and share the vibrant moments of your Onam celebration.
        </p>
      </div>
      <div className="my-8 max-w-xs sm:max-w-sm mx-auto">
        <img 
          src="/pookalam.svg" 
          alt="Onam Pookalam" 
          className="w-full h-auto"
          onError={(e) => { e.currentTarget.src = '/placeholder.svg'; e.currentTarget.onerror = null; }}
        />
      </div>
      <p className="text-gray-600">
        Tap the camera button to share your photo!
      </p>
    </div>
  );
};

export default Home;