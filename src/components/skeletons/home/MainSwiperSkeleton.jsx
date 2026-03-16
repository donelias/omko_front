import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const MainSwiperSkeleton = () => {
  return (
    <div className="relative w-full h-[500px] md:h-[690px] lg:h-[680px] 3xl:h-[780px] pb-40">
      <Skeleton className="absolute inset-0 w-full h-full rounded-none" />
    </div>
  );
};

export default MainSwiperSkeleton;
