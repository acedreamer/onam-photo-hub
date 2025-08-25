import { useCallback, useState } from "react";
import { useGalleryStore } from "@/stores/galleryStore";
import PhotoCard from "@/components/PhotoCard";
import PhotoDetail from "@/components/PhotoDetail";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useSession } from "@/contexts/SessionContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { VirtuosoGrid } from 'react-virtuoso';
import GalleryFilterDrawer from "@/components/GalleryFilterDrawer";
import ResponsiveDialog from "@/components/ResponsiveDialog";

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
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
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
  const selectedPhoto = photos.find(p => p.id === selectedPhotoId) ?? null;

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleFilterChange = (value: string) => {
    if (value) setFilterCategory(value);
  };

  const handleSortChange = (value: 'created_at' | 'likes') => {
    if (value) setSortBy(value);
  };

  const GalleryFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <div className="flex justify-center items-center p-8 col-span-2 sm:col-span-3 md:col-span-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  };

  const PhotoDetailView = () => {
    if (!selectedPhoto) return null;
    return <PhotoDetail photo={selectedPhoto} onClose={() => setSelectedPhotoId(null)} />;
  };

  return (
    <>
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground font-serif">Community Gallery</h1>
          <p className="text-muted-foreground">Explore the vibrant moments of our Onam celebration.</p>
        </div>

        <div className="sticky top-[72px] bg-background/80 backdrop-blur-sm z-20 py-3 px-2 flex justify-between items-center border-b">
          <div className="text-sm text-muted-foreground truncate">
            Showing: <span className="font-semibold text-foreground">{filterCategory}</span>
            <span className="hidden sm:inline">
              {' / '}
              Sorted by: <span className="font-semibold text-foreground">{sortBy === 'created_at' ? 'Recent' : 'Most Liked'}</span>
            </span>
          </div>
          <GalleryFilterDrawer
            categories={categories}
            filterCategory={filterCategory}
            onFilterChange={handleFilterChange}
            sortBy={sortBy}
            onSortChange={handleSortChange}
          />
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pt-4">
            {Array.from({ length: 12 }).map((_, i) => (
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
          <div style={{ height: 'calc(100vh - 200px)' }} className="pt-4">
            <VirtuosoGrid
              totalCount={photos.length}
              endReached={loadMore}
              components={{ Footer: GalleryFooter }}
              itemContent={index => {
                const photo = photos[index];
                return (
                  <div
                    key={photo.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedPhotoId(photo.id)}
                  >
                    <PhotoCard photo={photo} />
                  </div>
                );
              }}
              listClassName="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
            />
          </div>
        )}
      </div>

      <ResponsiveDialog
        open={!!selectedPhoto}
        onOpenChange={(isOpen) => !isOpen && setSelectedPhotoId(null)}
        dialogClassName="max-w-4xl bg-background"
        drawerClassName="bg-background"
      >
        {selectedPhoto && (
          <>
            <DialogHeader className="sr-only">
              <DialogTitle>Photo Details: {selectedPhoto.category}</DialogTitle>
              <DialogDescription>
                {selectedPhoto.caption || `An Onam celebration photo in the ${selectedPhoto.category} category.`}
              </DialogDescription>
            </DialogHeader>
            <PhotoDetailView />
          </>
        )}
      </ResponsiveDialog>
    </>
  );
};

export default Gallery;