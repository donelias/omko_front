import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Premium/Featured property card skeleton - matches PremiumPropertyCard layout
const PremiumCardSkeleton = ({ className = '' }) => {
    return (
        <div className={`relative rounded-2xl overflow-hidden h-full p-4 bg-white ${className}`}>
            {/* Main image area */}
            <div className="w-full h-full relative">
                <Skeleton className="w-full h-full min-h-[450px] rounded-2xl" />

                {/* Badge container at top-left */}
                <div className="absolute top-0 left-0 z-10 flex items-center justify-start gap-2 bg-white py-2 px-2 rounded-br-2xl">
                    <div className="flex items-center gap-2">
                        {/* Premium badge skeleton */}
                        <Skeleton className="h-7 w-24 rounded-md" />
                        {/* Featured badge skeleton */}
                        <Skeleton className="h-7 w-24 rounded-md" />
                    </div>
                </div>

                {/* Floating white panel at bottom */}
                <div className="absolute bottom-2 left-2 right-2 bg-white rounded-2xl shadow-sm p-4 flex flex-col items-start lg:flex-row lg:items-end justify-between gap-2">
                    <div className="flex flex-col gap-1 flex-1">
                        {/* Category badge */}
                        <Skeleton className="h-9 w-28 rounded-md mb-3" />
                        {/* Title */}
                        <Skeleton className="h-5 w-48 mb-1" />
                        {/* Location */}
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-4 w-4 rounded-full shrink-0" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </div>
                    {/* See Details button */}
                    <Skeleton className="h-10 w-28 rounded-md shrink-0" />
                </div>
            </div>
        </div>
    );
};

// Skeleton for featured projects section - matches PremiumPropertiesSection layout
const FeaturedProjectsSkeleton = () => {
    return (
        <div className="bg-[#F5F5F4] h-[780px] lg:h-[920px]">
            <div className="container mx-auto px-4 md:px-0 py-6 md:py-10 lg:py-[60px]">
                <div className="flex flex-col gap-6 md:gap-12">
                    {/* Section Title - centered */}
                    <div className="flex justify-center">
                        <Skeleton className="h-6 md:h-9 w-72 md:w-96" />
                    </div>

                    {/* Mobile Carousel skeleton */}
                    <div className="lg:hidden relative">
                        <div className="flex justify-center">
                            <div className="w-full max-w-md">
                                <PremiumCardSkeleton />
                            </div>
                        </div>

                        {/* Mobile navigation */}
                        <div className="flex justify-center gap-6 mt-4">
                            <Skeleton className="w-10 h-10 rounded-full" />
                            <div className="flex items-center gap-2">
                                <Skeleton className="w-2 h-2 rounded-full" />
                                <Skeleton className="w-3 h-3 rounded-full" />
                                <Skeleton className="w-2 h-2 rounded-full" />
                                <Skeleton className="w-2 h-2 rounded-full" />
                            </div>
                            <Skeleton className="w-10 h-10 rounded-full" />
                        </div>
                    </div>

                    {/* Desktop Grid Layout - 4 cards complex grid */}
                    <div className="hidden lg:grid grid-cols-6 gap-4 h-[700px]" style={{ gridTemplateRows: 'repeat(6, 1fr)' }}>
                        {/* Left card - full height */}
                        <div className="col-span-2 row-span-6">
                            <PremiumCardSkeleton />
                        </div>
                        {/* Right card - full height */}
                        <div className="col-span-2 row-span-6 col-start-5 row-start-1">
                            <PremiumCardSkeleton />
                        </div>
                        {/* Top middle card */}
                        <div className="col-span-2 row-span-3 col-start-3 row-start-1">
                            <PremiumCardSkeleton />
                        </div>
                        {/* Bottom middle card */}
                        <div className="col-span-2 row-span-3 col-start-3 row-start-4">
                            <PremiumCardSkeleton />
                        </div>
                    </div>

                    {/* Explore More Button skeleton - desktop only */}
                    <div className="hidden md:flex justify-center">
                        <Skeleton className="h-12 w-52 rounded-md" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeaturedProjectsSkeleton;
