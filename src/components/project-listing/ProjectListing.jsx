"use client";
import { useEffect, useState } from 'react';
import { useTranslation } from '../context/TranslationContext';
import { getAllProjectsApi } from '@/api/apiRoutes';
import NoDataFound from '../no-data-found/NoDataFound';
import NewBreadcrumb from '../breadcrumb/NewBreadCrumb';
import ProjectCardWithSwiper from '../cards/ProjectCardWithSwiper';
import ProjectCardSkeleton from '../skeletons/ProjectCardSkeleton';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';

const ProjectListing = () => {
    const t = useTranslation();

    const router = useRouter();
    const query = router?.query || {};
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [error, setError] = useState(null);
    const [offset, setOffset] = useState(0);
    const limit = 8;
    const [hasMore, setHasMore] = useState(true);
    const language = useSelector((state) => state.LanguageSettings?.active_language);
    const location = useSelector((state) => state.location);
    const latitude = query?.latitude || location?.latitude || "";
    const longitude = query?.longitude || location?.longitude || "";
    const range = query?.range || location?.radius || "";

    const fetchProjects = async (currentOffset = 0) => {
        setLoading(true);
        try {
            const response = await getAllProjectsApi({ limit, offset: currentOffset, latitude, longitude, range, language });
            if (response && response.data) {
                if (currentOffset === 0) {
                    setProjects(response?.data);
                } else {
                    setProjects(prevProjects => [...prevProjects, ...response.data]);
                }
                setHasMore(response.data.length + currentOffset < response.total);
            } else {
                setHasMore(false);
                setIsInitialLoading(false);
                setLoading(false);
            }
        } catch (error) {
            setError(error);
            console.error(error);
        } finally {
            setLoading(false);
            setIsInitialLoading(false);
        }
    };

    const handleLoadMore = () => {
        const newOffset = offset + limit;
        setOffset(newOffset);
        fetchProjects(newOffset);
    };

    // Update query params when location changes from modal
    useEffect(() => {
        if (location?.latitude && location?.longitude && location?.isLocationSet) {
            const newQuery = {
                ...router.query,
                latitude: location.latitude,
                longitude: location.longitude,
                radius: location.radius || ""
            };

            router.push(
                {
                    pathname: router.pathname,
                    query: newQuery,
                },
                undefined,
                { shallow: true }
            );
        }
    }, [location?.latitude, location?.longitude, location?.radius, location?.isLocationSet]);

    useEffect(() => {
        setOffset(0);
        fetchProjects(0);
    }, [language, latitude, longitude, range]);

    // Initial loading state
    if (isInitialLoading) {
        return (
            <div>
                <NewBreadcrumb title={t("allProjects")} items={[{ href: "/projects", label: t("allProjects") }]} />
                <div className='container mx-auto py-10 px-2'>
                    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                        {[...Array(limit)].map((_, index) => (
                            <ProjectCardSkeleton key={index} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // No projects found state
    if (!loading && projects.length === 0) {
        return (
            <div>
                <NewBreadcrumb title={t("allProjects")} items={[{ href: "/projects", label: t("allProjects") }]} />
                <div className='container mx-auto py-10 px-2'>
                    <NoDataFound />
                </div>
            </div>
        );
    }

    // Projects loaded state
    return (
        <div>
            <NewBreadcrumb title={t("allProjects")} items={[{ href: "/projects", label: t("allProjects") }]} />
            <div className='container mx-auto py-10 px-2'>
                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                    {projects.map((project) => (
                        <ProjectCardWithSwiper key={project.id} data={project} />
                    ))}
                </div>

                <div className="mt-8 flex justify-center">
                    {loading && !isInitialLoading && (
                        <div className="my-10 flex items-center justify-center">
                            <div className="custom-loader"></div>
                        </div>
                    )}

                    {!loading && hasMore && (
                        <div className="mt-5 flex w-full items-center justify-center text-center">
                            <button
                                className="brandColor hover:primaryBg brandBorder my-5 rounded-lg border hover:border-transparent hover:text-white px-4 py-2"
                                onClick={handleLoadMore}
                            >
                                {t("loadMore")}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectListing;