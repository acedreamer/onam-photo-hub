import { useEffect, useRef, useCallback, useState } from "react";
import { useGalleryStore, type Photo } from "@/stores/galleryStore";
import PhotoCard from "@/components/PhotoCard";
import PhotoDetail from "@/components/PhotoDetail";
import CategoryChips from "@/components/CategoryChips";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useSession } from "@/contexts/SessionContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Sparkles, TrendingUp } from "lucide-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const categories = ["All", "Pookalam", "Attire", "Performances", "Sadhya", "Candid"] as const;
const PHOTOS_PER_PAGE = 12;

const fetchPhotosPage = async ({ pageParam = 0, queryKey, userId }: any) => {
  const [_key, { filterCategory, sortBy }] = queryKey;
  
  const from = pageParam * PHOTOS_PER_PAGE;
  const to = from + PHOTOS_PER_PAGE - 1;

  let query = supabase.from("photos").select("*, profiles(full_name, avatar_url)");
  if (filterCategory !== 'All') {
      query = query.eq('category', filterCategory);
  }
  query = query.order(sortBy, { ascending: false }).range(from, to);

  const { data: photosData, error: photosError } = await query;
  if (photosError) throw photosError;

  const { data: likesData, error: likesError } = await supabase
      .from("likes")
      .select("photo_id")
      .eq("user_id", userId);
  if (likesError) throw likesError;
  const likedPhotoIds = new Set(likesData?.map(like => like.photo_id) || []);

  const data = (photosData || []).map(photo => ({
      ...photo,
      user_has_liked: likedPhotoIds.has(photo.id),
  }));

  return { data, nextPage: data.length === PHOTOS_PER_PAGE ? pageParam + 1 : undefined };
};

const Gallery = () => {
  const { filterCategory, sortBy, setFilterCategory, setSortBy } = useGalleryStore();
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const { user } = useSession();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
  } = useInfiniteQuery({
      queryKey: ['photos', { filterCategory, sortBy }],
      queryFn: ({ pageParam }) => fetchPhotosPage({ pageParam, queryKey: ['photos', { filterCategory, sortBy }], userId: user!.id }),
      getNextPageParam: (lastPage) => lastPage.nextPage,
      enabled: !!user,
  });

  const photos = data?.pages.flatMap(page => page.data) ?? [];

  const observer = useRef<IntersectionObserver>();
  const lastPhotoElementRef = useCallback((node: HTMLDivElement) => {
    if (isFetchingNextPage) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    });
    if (node) observer.current.observe(node);
  }, [isFetchingNextPage, hasNextPage, fetchNextPage]);

  const handleFilterChange = (value: string) => {
    if (value) setFilterCategory(value);
  };

  const handleSortChange = (value: 'created_at' | 'likes') => {
    if (value) setSortBy(value);
  };

  return (
    <>
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground font-serif">Community Gallery</h1>
          <p className="text-muted-foreground">Explore the vibrant moments of our Onam celebration.</p>
        </div>

        <div className="sticky top-[72px] bg-background/80 backdrop-blur-sm z-20 py-4 space-y-4">
          <CategoryChips 
            categories={categories}
            value={filterCategory}
            onValueChange={handleFilterChange}
          />
          <div className="flex justify-center">
            <ToggleGroup type="single" value={sortBy} onValueChange={handleSortChange} className="bg-gray-100 dark:bg-card p-1 rounded-lg">
              <ToggleGroupItem value="created_at" className="px-3 py-1 text-sm data-[state=on]:bg-background data-[state=on]:shadow">
                <Sparkles className="h-4 w-4 mr-2" />
                Recent
              </ToggleGroupItem>
              <ToggleGroupItem value="likes" className="px-3 py-1 text-sm data-[state=on]:bg-background data-[state=on]:shadow">
                <TrendingUp className="h-4 w-4 mr-2" />
                Most Liked
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
        
        {isLoading ? (
          <div className="columns-2 sm:columns-3 gap-4 space-y-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="break-inside-avoid">
                <Skeleton className="w-full h-40 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center text-muted-foreground mt-16 flex flex-col items-center">
            <div className="w-full max-w-xs sm:max-w-sm mx-auto mb-8">
              <img 
                src="/pookalam-detailed.svg" 
                alt="Pookalam illustration" 
                className="w-full h-auto animate-spin-slow text-muted-foreground"
                onError={(e) => { e.currentTarget.src = '/placeholder.svg'; e.currentTarget.onerror = null; }}
              />
            </div>
            <h2 className="text-2xl font-semibold text-foreground font-serif">The Gallery Awaits!</h2>
            <p className="text-muted-foreground mt-2">Be the first to share a vibrant Onam moment.</p>
          </div>
        ) : (
          <div className="columns-2 sm:columns-3 gap-4 space-y-4">
            {photos.map((photo, index) => (
              <div 
                key={photo.id} 
                ref={index === photos.length - 1 ? lastPhotoElementRef : null}
                className="cursor-pointer animate-fade-in-up" 
                style={{ animationDelay: `${Math.min(index * 75, 1000)}ms` }}
                onClick={() => setSelectedPhoto(photo)}
              >
                <PhotoCard photo={photo} />
              </div>
            ))}
          </div>
        )}
        {isFetchingNextPage && (
          <div className="flex justify-center items-center mt-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
      </div>

      <Dialog open={!!selectedPhoto} onOpenChange={(isOpen) => !isOpen && setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl bg-background">
          {selectedPhoto && (
            <>
              <DialogHeader className="sr-only">
                <DialogTitle>Photo Details: {selectedPhoto.category}</DialogTitle>
                <DialogDescription>
                  {selectedPhoto.caption || `An Onam celebration photo in the ${selectedPhoto.category} category.`}
                </DialogDescription>
              </DialogHeader>
              <PhotoDetail photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Gallery;