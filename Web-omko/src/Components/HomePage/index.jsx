"use client"
import React, { useEffect, useState } from 'react'
import Layout from '../Layout/Layout'
import { useRouter } from 'next/router'
import { languageData } from '@/store/reducer/languageSlice'
import { useSelector } from 'react-redux'
import { settingsData } from '@/store/reducer/settingsSlice'
import { store } from '@/store/store'
import { categoriesCacheData, saveIsProject, saveSliderDataLength } from '@/store/reducer/momentSlice'
import Swal from 'sweetalert2'
import { useHomepageData } from '@/api' // NEW: Import custom hook
import HeroSlider from './HeroSlider'
import NearByProperty from './NearByProperty'
import FeaturedProperty from './FeaturedProperty'
import HomeCategory from './HomeCategory'
import MostViewedProperty from './MostViewedProperty'
import Agent from './Agent'
import UserRecommendationProperty from './UserRecommendationProperty'
import Projects from './Projects'
import MostFavProperty from './MostFavProperty'
import ProprtiesNearbyCity from './ProprtiesNearbyCity'
import HomeArticles from './HomeArticles'
import { useTranslate } from '@/hooks/useTranslate'
import NoData from '../NoDataFound/NoData'
import FAQS from './FAQS'

const index = () => {
    const translate = useTranslate();
    const router = useRouter()
    // Subscribe to language code changes - this triggers re-render automatically
    const currentLanguageCode = useSelector(
        (state) => state.Language?.currentLanguageCode || 'en'
    );
    const lang = useSelector(languageData)
    const settingData = useSelector(settingsData)
    const isPremiumUser = settingData && settingData.is_premium

    // NEW: Use custom hook instead of Redux actions
    const { data: homepageData, loading: isLoading } = useHomepageData()

    const [showModal, setShowModal] = useState(false)

    // Map homepage data to component props
    const sliderData = homepageData?.slider || []
    const categoryData = homepageData?.categories || []
    const nearbyCityData = homepageData?.nearbyProperties
    const getFeaturedListing = homepageData?.featured || []
    const getMostViewedProp = homepageData?.mostViewed || []
    const getMostFavProperties = homepageData?.mostLiked || []
    const getProjects = homepageData?.projects || []
    const getArticles = homepageData?.articles || []
    const agentsData = homepageData?.agents || []
    const getNearByCitysData = homepageData?.cities || []
    const userRecommendationData = homepageData?.recommendations || []
    const faqs = homepageData?.faqs || []

    const isLoggedIn = useSelector((state) => state.User_signup)
    const userCurrentId = isLoggedIn && isLoggedIn.data ? isLoggedIn.data.data.id : null
    const userCurrentLocation = isLoggedIn && isLoggedIn.data ? isLoggedIn.data.data.city : null
    const language = store.getState().Language.languages
    const Categorydata = useSelector(categoriesCacheData)

    const handleCloseModal = () => {
        setShowModal(false)
    }

    const handleImageLoaded = () => {
        // Function for image loading tracking - can be extended for optimization
    }

    // Save slider data length to Redux if needed
    useEffect(() => {
        if (sliderData.length > 0) {
            saveSliderDataLength(sliderData.length)
        }
    }, [sliderData])

    const handlecheckPremiumUser = (e, slug_id) => {
        e.preventDefault()
        if (userCurrentId) {
            if (isPremiumUser) {
                router.push(`/project-details/${slug_id}`)
            } else {
                Swal.fire({
                    title: translate("opps"),
                    text: translate("notPremiumUser"),
                    icon: "warning",
                    allowOutsideClick: false,
                    showCancelButton: false,
                    customClass: {
                        confirmButton: 'Swal-confirm-buttons',
                        cancelButton: "Swal-cancel-buttons"
                    },
                    confirmButtonText: translate("ok"),
                }).then((result) => {
                    if (result.isConfirmed) {
                        router.push("/subscription-plan")
                    }
                })
            }
        } else {
            Swal.fire({
                title: translate("plzLogFirsttoAccess"),
                icon: "warning",
                allowOutsideClick: false,
                showCancelButton: false,
                allowOutsideClick: true,
                customClass: {
                    confirmButton: 'Swal-confirm-buttons',
                    cancelButton: "Swal-cancel-buttons"
                },
                confirmButtonText: translate("ok"),
            }).then((result) => {
                if (result.isConfirmed) {
                    setShowModal(true)
                }
            })
        }
    }

    const handlecheckPremiumUserAgent = (e, ele) => {
        e.preventDefault()
        if (userCurrentId) {
            if (isPremiumUser) {
                if (ele?.property_count === 0 && ele?.projects_count !== 0) {
                    router.push(`/agent-details/${ele?.slug_id}`)
                    saveIsProject(true)
                } else {
                    router.push(`/agent-details/${ele?.slug_id}`)
                    saveIsProject(false)
                }
            } else {
                Swal.fire({
                    title: translate("opps"),
                    text: translate("notPremiumUser"),
                    icon: "warning",
                    allowOutsideClick: false,
                    showCancelButton: false,
                    customClass: {
                        confirmButton: 'Swal-confirm-buttons',
                        cancelButton: "Swal-cancel-buttons"
                    },
                    confirmButtonText: translate("ok"),
                }).then((result) => {
                    if (result.isConfirmed) {
                        router.push("/subscription-plan")
                    }
                })
            }
        } else {
            Swal.fire({
                title: translate("plzLogFirsttoAccess"),
                icon: "warning",
                allowOutsideClick: false,
                showCancelButton: false,
                allowOutsideClick: true,
                customClass: {
                    confirmButton: 'Swal-confirm-buttons',
                    cancelButton: "Swal-cancel-buttons"
                },
                confirmButtonText: translate("ok"),
            }).then((result) => {
                if (result.isConfirmed) {
                    setShowModal(true)
                }
            })
        }
    }

    const breakpoints = {
        0: { slidesPerView: 1.5 },
        375: { slidesPerView: 1.5 },
        576: { slidesPerView: 2.5 },
        768: { slidesPerView: 3 },
        992: { slidesPerView: 4 },
        1200: { slidesPerView: 3 },
        1400: { slidesPerView: 4 },
    }

    const breakpointsMostFav = {
        0: { slidesPerView: 1 },
        375: { slidesPerView: 1.5 },
        576: { slidesPerView: 2 },
        1200: { slidesPerView: 3 },
        1400: { slidesPerView: 4 },
    }

    const breakpointsProjects = {
        0: { slidesPerView: 1 },
        375: { slidesPerView: 1.5 },
        576: { slidesPerView: 2 },
        1200: { slidesPerView: 3 },
        1400: { slidesPerView: 4 },
    }

    const breakpointsAgents = {
        0: { slidesPerView: 1 },
        375: { slidesPerView: 1.5 },
        576: { slidesPerView: 2 },
        1200: { slidesPerView: 2.5 },
        1400: { slidesPerView: 4 },
    }



    return (
        <Layout>
            {/* slider section */}
            <HeroSlider sliderData={sliderData} Categorydata={Categorydata} isLoading={isLoading} />

            <div style={{ marginTop: sliderData && sliderData.length > 0 ? '0px' : '0px' }}>

                {/* Nearby City Section  Section  */}
                <NearByProperty isLoading={isLoading} userCurrentLocation={userCurrentLocation} nearbyCityData={nearbyCityData} language={language} breakpoints={breakpoints} />

                {/* featrured section */}
                <FeaturedProperty isLoading={isLoading} getFeaturedListing={getFeaturedListing} language={language} nearbyCityData={nearbyCityData} handleImageLoaded={handleImageLoaded} />

                {/* Category Section */}
                <HomeCategory isLoading={isLoading} categoryData={categoryData} language={language} breakpoints={breakpoints} />

                {/* ===== most PROPERTIE SECTION ====== */}
                <MostViewedProperty isLoading={isLoading} getMostViewedProp={getMostFavProperties} language={language} />

                {/* ===== AGENT SECTION =======  */}
                <Agent isLoading={isLoading} agentsData={agentsData} language={language} handlecheckPremiumUserAgent={handlecheckPremiumUserAgent} breakpointsAgents={breakpointsAgents} />

                {/* USER RECOMMANED PROPERTIES */}
                <UserRecommendationProperty isLoading={isLoading} userRecommendationData={userRecommendationData} language={language} breakpointsMostFav={breakpointsMostFav} />

                {/* UPCOMMINGS PROJECTS */}
                <Projects isLoading={isLoading} isPremiumUser={isPremiumUser} language={language} getProjects={getProjects} breakpointsProjects={breakpointsProjects} handlecheckPremiumUser={handlecheckPremiumUser} />

                {/* ===== MOST FAV SECTION =======  */}
                <MostFavProperty isLoading={isLoading} language={language} getMostFavProperties={getMostFavProperties} breakpointsMostFav={breakpointsMostFav} />

                {/* ===== PROPERTIES NEARBY CITY  SECTION ====== */}
                <ProprtiesNearbyCity isLoading={isLoading} getNearByCitysData={getNearByCitysData} language={language} />

                {/* ========== ARTICLE SECTION ========== */}
                <HomeArticles isLoading={isLoading} getArticles={getArticles} language={language} />

                {/* FAQS */}
                <FAQS data={faqs} language={language} />
                {/* WHEN NO DATA IN ADMIN PANEL  */}

                {!isLoading &&

                    sliderData?.length === 0 &&
                    getFeaturedListing?.length === 0 &&
                    categoryData.length === 0 &&
                    getMostViewedProp?.length === 0 &&
                    getNearByCitysData?.length === 0 &&
                    getMostFavProperties?.length === 0 &&
                    agentsData?.length === 0 &&
                    getArticles?.length === 0 ? (
                    <div className="noData_container">
                        <NoData />
                    </div>
                ) : null}
            </div>
        </Layout>
    )
}

export default index