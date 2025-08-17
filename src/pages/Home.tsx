const Home = () => {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold text-leaf-green mb-4">Onam Photo Hub</h1>
      <p className="text-lg text-gray-700 mb-8">
        Capture and share the vibrant moments of your Onam celebration.
      </p>
      <div className="max-w-md mx-auto">
        <img 
          src="/pookalam.svg" 
          alt="Onam Pookalam" 
          className="w-full h-auto"
          onError={(e) => { e.currentTarget.src = '/placeholder.svg'; e.currentTarget.onerror = null; }}
        />
      </div>
      <p className="mt-8 text-gray-600">
        Tap the camera button to share your photo!
      </p>
    </div>
  );
};

export default Home;