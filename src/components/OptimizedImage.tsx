import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  imageUrl: string;
  alt: string;
  className?: string;
}

const generateCloudinaryUrl = (
  src: string,
  transformations: string
): string => {
  if (!src || !src.includes('/upload/')) {
    return src;
  }
  const parts = src.split('/upload/');
  return `${parts[0]}/upload/${transformations}/${parts[1]}`;
};

const generateSrcSet = (src: string): string => {
  const widths = [400, 600, 800, 1200];
  return widths
    .map(width => {
      const transformations = `w_${width},q_auto,f_auto`;
      return `${generateCloudinaryUrl(src, transformations)} ${width}w`;
    })
    .join(', ');
};

const OptimizedImage = ({ imageUrl, alt, className }: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  const lqipUrl = generateCloudinaryUrl(imageUrl, 'w_20,e_blur:100,q_auto,f_auto');
  const srcSet = generateSrcSet(imageUrl);
  const defaultSrc = generateCloudinaryUrl(imageUrl, 'w_600,q_auto,f_auto');

  useEffect(() => {
    const img = new Image();
    img.srcset = srcSet;
    img.src = defaultSrc;
    img.onload = () => {
      setIsLoaded(true);
    };
  }, [srcSet, defaultSrc]);

  return (
    <div className={cn("relative overflow-hidden bg-gray-100", className)}>
      <img
        src={lqipUrl}
        alt={alt}
        className={cn(
          "absolute inset-0 w-full h-full object-cover transition-opacity duration-500",
          isLoaded ? "opacity-0" : "opacity-100"
        )}
        aria-hidden="true"
      />
      <img
        src={defaultSrc}
        srcSet={srcSet}
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        alt={alt}
        className={cn(
          "absolute inset-0 w-full h-full object-cover transition-opacity duration-500",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
        onContextMenu={(e) => e.preventDefault()}
        loading="lazy"
      />
    </div>
  );
};

export default OptimizedImage;