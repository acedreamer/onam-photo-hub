import { WifiOff } from 'lucide-react';

const ConnectionError = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center animate-fade-in">
      <WifiOff className="h-16 w-16 text-destructive mb-4" />
      <h1 className="text-2xl font-bold text-foreground mb-2">Connection Failed</h1>
      <p className="text-muted-foreground max-w-md">
        We couldn't connect to our services. This is often caused by ad blockers or network restrictions. Please try disabling your ad blocker for this site and refresh the page.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
      >
        Refresh Page
      </button>
    </div>
  );
};

export default ConnectionError;