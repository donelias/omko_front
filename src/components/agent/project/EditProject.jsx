"use client"
import { useState, useEffect } from 'react'
import { useTranslation } from '@/components/context/TranslationContext'
import { Skeleton } from "@/components/ui/skeleton"
import { generateAIPropertyDescriptionApi, generateAIPropertyMetaDataApi, getProjectDetailsApi, getUserProjectsApi, postProjectApi, uploadProjectDocumentApi, getFacilitiesApi } from '@/api/apiRoutes'
import { useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { generateSlug } from '@/utils/helperFunction'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import LocationComponent from '@/components/reusable-components/add-property/LocationComponent'
import ImagesVideoTab from '@/components/reusable-components/add-project/ImagesVideoTab'
import SEODetailsTab from '@/components/reusable-components/add-property/SEODetailsTab'
import ProjectDetailsTab from '@/components/reusable-components/add-project/ProjectDetailsTab'
import FloorDetails from '@/components/reusable-components/add-project/FloorDetails'
import FacilitiesComponent from '@/components/reusable-components/add-property/FacilitiesComponent'
import OutdoorFacilitiesComponent from '@/components/reusable-components/add-property/OutdoorFacilitiesComponent'
import React from 'react';
import PropertyFormShell from '@/components/agent/property/PropertyFormShell';

const EditProject = ({ params }) => {
    const router = useRouter()
    const { lang, slug } = router?.query
    // Get propertySlug from the params passed through UserRoot component
    const projectSlug = params?.[0] || slug?.split('/')[1]
    const userData = useSelector(state => state.User?.data)
    const languages = useSelector(state => state.LanguageSettings?.languages) || []
    const activeLanguage = useSelector(state => state.LanguageSettings?.active_language)
    const defaultLanguage = useSelector(state => state.LanguageSettings?.default_language)
    const t = useTranslation()
    const queryClient = useQueryClient()
    const [activeTab, setActiveTab] = useState("projectDetails")
    const [isLoading, setIsLoading] = useState(true)
    const [showLoader, setShowLoader] = useState(false);
    const [removedGalleryImages, setRemovedGalleryImages] = useState([]);
    const [removedDocuments, setRemovedDocuments] = useState([]);
    const [removedPlans, setRemovedPlans] = useState([]);
    const [removedMetaImage, setRemovedMetaImage] = useState(false);
    const [isDescriptionGenerating, setIsDescriptionGenerating] = useState(false);
    const [isMetaDataGenerating, setIsMetaDataGenerating] = useState(false);

    const websettings = useSelector(state => state.WebSetting?.data);
    const isCustomVideoUpload = websettings?.show_direct_video_upload === "1";

    // Find the active language object from the languages array
    const activeLanguageObj = React.useMemo(() => {
        if (!activeLanguage || !languages.length) return null;
        return languages.find(lang => lang.code === activeLanguage) || null;
    }, [activeLanguage, languages]);

    const [selectedLanguage, setSelectedLanguage] = useState(activeLanguageObj || activeLanguage || "English");
    const [translations, setTranslations] = useState([]);

    // Tab components
    const tabItems = [
        { id: "projectDetails", label: t("projectDetails") },
        { id: "imagesVideo", label: t("imagesVideo") },
        { id: "location", label: t("location") },
        { id: "floorDetails", label: t("floorDetails") },
            { id: "facilities", label: t("Amenities") },
        { id: "outdoorFacilities", label: t("Outdoor Facilities") },
        { id: "seoSettings", label: t("seoSettings") },
    ]


    // Property Details Form State
    const [selectedCategory, setSelectedCategory] = useState("")

    // Project Details Form State
    const [projectFormData, setProjectFormData] = useState({
        projectType: "upcoming",
        projectTitle: "",
        projectSlug: "",
        projectDescription: "",
        isPremiumProject: false,
    })

    // SEO Settings Form State
    const [seoFormData, setSeoFormData] = useState({
        metaTitle: "",
        metaKeywords: "",
        metaDescription: "",
        ogImage: null
    })

    // Floor Details Form State
    const [floorFormData, setFloorFormData] = useState([
        {
            floorTitle: '',
            floorImage: null,
            unitCode: '',
            price: '',
            currency: 'USD',
            totalUnits: '',
            availableUnits: '',
            unitStatus: 'available',
        }
    ]);

    // Combined Media Form State
    const [mediaFormData, setMediaFormData] = useState({
        titleImage: null,
        documents: [],
        galleryImages: [],
        videoLink: '',
        videoType: 'youtubeLink',
        customVideo: null
    });

    // Location Form State
    const [selectedLocationAddress, setSelectedLocationAddress] = useState({
        city: '',
        state: '',
        country: '',
        formattedAddress: '',
        latitude: 0,
        longitude: 0
    });

    const [editProjectId, setEditProjectId] = useState(null);
    const [shouldRemoveVideo, setShouldRemoveVideo] = useState(false);

    // Parameters (Features & Amenities) State
    const [parameterFormData, setParameterFormData] = useState({});

    // Outdoor Facilities State
    const [facilities, setFacilities] = useState([]);
    const [facilityDistances, setFacilityDistances] = useState({});

    // Fetch project details when slug_id is available
    useEffect(() => {
        if (projectSlug) {
            handleFetchProjectDetails();
        }
    }, [projectSlug]);

    // Initialize selected language when translations are loaded
    useEffect(() => {
        if (translations.length > 0 && !selectedLanguage) {
            // Set to the first available language or activeLanguageObj
            setSelectedLanguage(activeLanguageObj || activeLanguage || "English");
        }
    }, [translations, activeLanguageObj, activeLanguage, selectedLanguage])

    // Fetch outdoor facilities
    const handleFetchFacilities = async () => {
        try {
            const res = await getFacilitiesApi();
            if (res?.data) {
                setFacilities(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch facilities:", error);
        }
    };

    useEffect(() => {
        handleFetchFacilities();
    }, []);


    const handleFetchProjectDetails = async () => {
        try {
            setIsLoading(true);
            const response = await getUserProjectsApi({ slug_id: projectSlug, type: " ", request_status: " " });

            if (!response.error) {
                const projectData = response.data;

                // Set category from API response
                setSelectedCategory(projectData.category);

                setEditProjectId(projectData.id);

                // Set project form data
                setProjectFormData({
                    projectType: projectData.type || "upcoming",
                    projectTitle: projectData.title || "",
                    projectSlug: projectData.slug_id || "",
                    projectDescription: projectData.description || "",
                    isPremiumProject: projectData.is_premium === 1 || projectData.is_premium === true || projectData.is_premium === "1" || false,
                });

                // Set SEO form data
                setSeoFormData({
                    metaTitle: projectData.meta_title || "",
                    metaKeywords: projectData.meta_keywords || "",
                    metaDescription: projectData.meta_description || "",
                    ogImage: projectData.meta_image || null
                });

                // Set location data
                setSelectedLocationAddress({
                    city: projectData.city || "",
                    state: projectData.state || "",
                    country: projectData.country || "",
                    formattedAddress: projectData.location || "",
                    latitude: projectData.latitude || 0,
                    longitude: projectData.longitude || 0
                });

                // Set floor plan data
                if (projectData.plans && projectData.plans.length > 0) {
                    setFloorFormData(projectData.plans.map(plan => ({
                        id: plan.id,
                        floorTitle: plan.title || "",
                        floorImage: plan.document || null,
                        unitCode: plan.unit_code || "",
                        price: plan.price ?? "",
                        currency: plan.currency || "USD",
                        totalUnits: plan.total_units ?? "",
                        availableUnits: plan.available_units ?? "",
                        unitStatus: plan.unit_status || "available",
                        dynamicFeatures: plan.features || {},
                    })));
                }

                // Set media data
                const videoTypeMap = { 1: 'youtubeLink', 2: 'vimeoLink', 0: 'customVideo' };
                const rawVideoType = projectData.video_type;
                const resolvedVideoType = (rawVideoType !== undefined && rawVideoType !== null && rawVideoType !== "")
                    ? (videoTypeMap[Number(rawVideoType)] || "")
                    : "";

                setMediaFormData({
                    titleImage: projectData.image || null,
                    documents: projectData.documents || [],
                    galleryImages: projectData.gallary_images || [],
                    videoLink: projectData.video_link || "",
                    videoType: resolvedVideoType,
                    customVideo: null
                });

                // Set translations if they exist (simplified structure like AddProject)
                if (projectData.translations && Array.isArray(projectData.translations)) {
                    // Group translations by language_id since each language has separate entries for title and description
                    const translationsByLanguage = {};

                    projectData.translations.forEach(translation => {
                        const langId = translation.language_id;

                        // Initialize language entry if it doesn't exist
                        if (!translationsByLanguage[langId]) {
                            translationsByLanguage[langId] = {
                                language_id: langId,
                                title: "",
                                description: ""
                            };
                        }

                        // Assign values based on the key (title or description)
                        if (translation.key === "title") {
                            translationsByLanguage[langId].title = translation.value || "";
                        } else if (translation.key === "description") {
                            translationsByLanguage[langId].description = translation.value || "";
                        }
                    });

                    // Convert the grouped object back to an array
                    const translationsData = Object.values(translationsByLanguage);
                    setTranslations(translationsData);
                } else {
                    // Initialize empty translations array if no translations exist
                    setTranslations([]);
                }

                // Set existing parameters (Features & Amenities)
                if (projectData.assign_parameter && Array.isArray(projectData.assign_parameter)) {
                    const params = {};
                    projectData.assign_parameter.forEach(ap => {
                        if (ap.parameter_id && ap.value) {
                            params[ap.parameter_id] = ap.value;
                        }
                    });
                    setParameterFormData(params);
                }

                // Set existing outdoor facilities distances
                if (projectData.assign_facilities && Array.isArray(projectData.assign_facilities)) {
                    const distances = {};
                    projectData.assign_facilities.forEach(af => {
                        if (af.facility_id && af.distance) {
                            distances[af.facility_id] = af.distance;
                        }
                    });
                    setFacilityDistances(distances);
                }

                // Start with project details tab instead of categories
                setActiveTab("projectDetails");
            } else {
                toast.error(t(response.message) || t("somethingWentWrong"));
            }
        } catch (error) {
            console.error("Error fetching project details:", error);
            toast.error(t(error?.message) || t("errorFetchingProjectDetails"));
        } finally {
            setIsLoading(false);
        }
    };

    // Handle multilingual data changes
    const handleMultiLangChange = (language, field, value) => {
        setTranslations(prev => {
            // Find if we already have a translation for this language
            const existingIndex = prev.findIndex(item =>
                item.language_id === language.id ||
                item.language_id === language
            );

            // Create a new array to avoid mutating the previous state
            const newTranslations = [...prev];

            if (existingIndex !== -1) {
                // Update existing translation
                newTranslations[existingIndex] = {
                    ...newTranslations[existingIndex],
                    [field]: value
                };
            } else {
                // Add new translation
                newTranslations.push({
                    language_id: language.id || language,
                    [field]: value
                });
            }

            return newTranslations;
        });
    };

    // Handle removing any type of media
    const handleRemoveMedia = (type, index, id = null) => {
        if (type === 'titleImage') {
            setMediaFormData(prev => ({
                ...prev,
                titleImage: null
            }));
            return;
        }

        setMediaFormData(prev => {
            const updatedMedia = [...prev[type]];

            // Track removed item if it has an ID (existing item from backend)
            if (id && type === 'galleryImages') {
                setRemovedGalleryImages(prev => [...prev, id]);
            } else if (id && type === 'documents') {
                setRemovedDocuments(prev => [...prev, id]);
            }

            updatedMedia.splice(index, 1);
            return {
                ...prev,
                [type]: updatedMedia
            };
        });
    };

    // For backward compatibility with editing mode
    const handleRemoveGalleryImages = (index, id) => {
        if (id) {
            setRemovedGalleryImages(prev => [...prev, id]);
        }
        handleRemoveMedia('galleryImages', index);
    };

    const handleRemoveDocuments = (index, id) => {
        if (id) {
            setRemovedDocuments(prev => [...prev, id]);
        }
        handleRemoveMedia('documents', index);
    };

    // Update property form field handler
    const handleUpdateProjectForm = (e, customName, customValue) => {
        // For radio inputs and custom events where e.target might not have name/value
        if (customName && customValue !== undefined) {
            setProjectFormData(prev => ({
                ...prev,
                [customName]: customValue
            }));
            return;
        }

        // For standard form events (input, textarea)
        if (e && e.target) {
            const { name, value, type, checked } = e.target;

            // Handle title input for English language (similar to AddProject logic)
            if (name === "title") {
                setProjectFormData(prev => ({
                    ...prev,
                    projectTitle: value,
                    projectSlug: generateSlug(value)
                }));
                return;
            }

            // Handle description input for English language
            if (name === "description") {
                setProjectFormData(prev => ({
                    ...prev,
                    projectDescription: value
                }));
                return;
            }

            if (name === "projectTitle") {
                setProjectFormData(prev => ({
                    ...prev,
                    [name]: value,
                    projectSlug: generateSlug(value)
                }));
                return;
            }
            // Handle checkbox/switch inputs
            if (type === 'checkbox') {
                setProjectFormData(prev => ({
                    ...prev,
                    [name]: checked
                }));
                return;
            }

            // Handle regular inputs
            setProjectFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    }

    const handleFillSeoFormData = (e, customName, customValue) => {
        // If we have direct customName and customValue (from TagInput)
        if (customName && customValue !== undefined) {
            // Track if meta_image is being removed
            if (customName === 'ogImage' && customValue === null) {
                setRemovedMetaImage(true);
            } else if (customName === 'ogImage' && customValue !== null) {
                // Reset the flag if a new image is added
                setRemovedMetaImage(false);
            }

            setSeoFormData(prev => ({
                ...prev,
                [customName]: customValue
            }))
            return
        }

        // For standard form events (input, textarea)
        if (e && e.target) {
            const { name, value } = e.target
            setSeoFormData(prev => ({
                ...prev,
                [name]: value
            }))
        }
    }

    const validateFloorDetails = () => {
        const hasAnyFloorData = floorFormData.some((floor) =>
            [
                floor.floorTitle,
                floor.unitCode,
                floor.price,
                floor.currency,
                floor.totalUnits,
                floor.availableUnits,
            ].some((value) => value !== null && value !== undefined && String(value).trim() !== "")
        );

        if (!hasAnyFloorData) {
            return true;
        }

        const seenCodes = new Set();
        for (const floor of floorFormData) {
            if (!floor.floorTitle?.trim()) {
                toast.error(t("floorTitleIsRequired"));
                return false;
            }

            const unitCode = (floor.unitCode || "").trim().toUpperCase();
            if (unitCode) {
                if (seenCodes.has(unitCode)) {
                    toast.error(t("typologyUnitCodeUnique"));
                    return false;
                }
                seenCodes.add(unitCode);
            }

            const hasTotal = floor.totalUnits !== "" && floor.totalUnits !== null && floor.totalUnits !== undefined;
            const hasAvailable = floor.availableUnits !== "" && floor.availableUnits !== null && floor.availableUnits !== undefined;

            if (hasTotal && Number(floor.totalUnits) < 0) {
                toast.error(t("typologyTotalUnitsNonNegative"));
                return false;
            }

            if (hasAvailable && Number(floor.availableUnits) < 0) {
                toast.error(t("typologyAvailableUnitsNonNegative"));
                return false;
            }

            if (hasTotal && hasAvailable && Number(floor.availableUnits) > Number(floor.totalUnits)) {
                toast.error(t("typologyAvailableUnitsCannotExceedTotal"));
                return false;
            }
        }

        return true;
    };

    const handleCheckRequiredFields = (currentTab, nextTab) => {
        let missingFields = false;

        switch (currentTab) {
            case "projectDetails":
                if (!projectFormData.projectTitle) {
                    toast.error(t("projectTitleIsRequired"));
                    missingFields = true;
                    break;
                }

                if (!projectFormData.projectDescription) {
                    toast.error(t("projectDescriptionIsRequired"));
                    missingFields = true;
                    break;
                }
                break;
            case "location":
                if (!selectedLocationAddress.city) {
                    toast.error(t("cityIsRequired"));
                    missingFields = true;
                    break;
                }

                if (!selectedLocationAddress.state) {
                    toast.error(t("stateIsRequired"));
                    missingFields = true;
                    break;
                }

                if (!selectedLocationAddress.country) {
                    toast.error(t("countryIsRequired"));
                    missingFields = true;
                    break;
                }

                if (!selectedLocationAddress.formattedAddress) {
                    toast.error(t("addressIsRequired"));
                    missingFields = true;
                    break;
                }
                break;
            case "floorDetails":
                if (!validateFloorDetails()) {
                    missingFields = true;
                }
                break;
            case "imagesVideo":
                if (!mediaFormData.titleImage) {
                    toast.error(t("projectTitleImageIsRequired"));
                    missingFields = true;
                    break;
                }
                break;

            default:
                break;
        }

        if (!missingFields) {
            if (nextTab === "submit") {
                handleUpdateProject();
            } else {
                setActiveTab(nextTab);
            }
        }
    };

    const handleTabChange = (value) => {
        const tabOrder = ["projectDetails", "imagesVideo", "location", "floorDetails", "facilities", "outdoorFacilities", "seoSettings"];
        const currentIndex = tabOrder.indexOf(activeTab);
        const targetIndex = tabOrder.indexOf(value);

        // If navigating backwards or to the same tab, allow without validation
        if (targetIndex <= currentIndex) {
            setActiveTab(value);
            setSelectedLanguage(activeLanguageObj || activeLanguage || "English");
            return;
        }

        // Only validate when moving forward
        handleCheckRequiredFields(activeTab, value);
        // Reset language selection to default/active language when switching tabs
        setSelectedLanguage(activeLanguageObj || activeLanguage || "English");
    };
    //  "latitude": "23.23641641035775",
    // "longitude": "69.66288219979255",
    const handleLocationSelect = (address) => {
        // Update the form field with the selected address from the Map component
        setSelectedLocationAddress(prev => ({
            ...prev,
            city: address.city || prev.city,
            state: address.state || prev.state,
            country: address.country || prev.country,
            formattedAddress: address.formattedAddress || prev.formattedAddress,
            latitude: address.latitude || address.lat || prev.latitude,
            longitude: address.longitude || address.lng || prev.longitude
        }));
    };

    const handleDistanceChange = (facilityId, value) => {
        const parsedValue = parseFloat(value);
        const newValue = isNaN(parsedValue) || parsedValue < 0 ? 0 : parsedValue;
        setFacilityDistances(prev => ({
            ...prev,
            [facilityId]: newValue
        }));
    };

    const compressImageFile = async (file, options) => {
        if (!(file instanceof Blob) || !file.type?.startsWith('image/')) return file;
        const maxSizeMB = options?.maxSizeMB || 0.5;
        const maxWidthOrHeight = options?.maxWidthOrHeight || 1920;
        const quality = options?.initialQuality ?? 0.92;
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        if (file.size <= maxSizeBytes) return file;
        try {
            const img = await createImageBitmap(file);
            let { width, height } = img;
            if (width > maxWidthOrHeight || height > maxWidthOrHeight) {
                const ratio = Math.min(maxWidthOrHeight / width, maxWidthOrHeight / height);
                width = Math.round(width * ratio);
                height = Math.round(height * ratio);
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            img.close();
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
            canvas.width = 0;
            canvas.height = 0;
            if (!blob || blob.size >= file.size) return file;
            const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
            const baseName = (file.name || 'image').replace(/\.[^.]+$/, '');
            return new File([blob], `${baseName}.${ext}`, { type: 'image/jpeg' });
        } catch (error) {
            console.error('Image compression failed:', error);
            return file;
        }
    };

    const standardCompression = { maxSizeMB: 0.5, maxWidthOrHeight: 1920, initialQuality: 0.92 };

    const handleUpdateProject = async () => {
        try {
            if (!validateFloorDetails()) {
                return;
            }

            setShowLoader(true);

            // Filter out non-File objects from documents and galleryImages
            const filteredDocuments = mediaFormData.documents
                .filter(doc => doc instanceof File)
                .map(doc => doc);

            const filteredGalleryImages = mediaFormData.galleryImages
                .filter(img => img instanceof File)
                .map(img => img);

            // Compress all images before submitting
            const compressedTitleImage = mediaFormData.titleImage instanceof Blob
                ? await compressImageFile(mediaFormData.titleImage, standardCompression)
                : null;

            const compressedGalleryImages = [];
            for (const file of filteredGalleryImages) {
                compressedGalleryImages.push(await compressImageFile(file, standardCompression));
            }

            const compressedFloorFormData = [];
            for (const field of floorFormData) {
                if (field.floorImage instanceof Blob) {
                    const compressed = await compressImageFile(field.floorImage, standardCompression);
                    compressedFloorFormData.push({ ...field, floorImage: compressed });
                } else {
                    compressedFloorFormData.push(field);
                }
            }

            const compressedMetaImage = seoFormData.ogImage instanceof Blob
                ? await compressImageFile(seoFormData.ogImage, standardCompression)
                : seoFormData.ogImage;

            const compressedDocuments = [];
            for (const file of filteredDocuments) {
                compressedDocuments.push(await compressImageFile(file, standardCompression));
            }

            const plans = []; // Initialize an empty array for plans

            // Loop through floorFields and push each entry into plans array
            for (const field of compressedFloorFormData) {
                const title = field.floorTitle?.trim() || "";
                if (!title) continue;

                const id = field.id || "";
                const document = field.floorImage;

                plans.push({
                    id: id,
                    title: title,
                    document: document instanceof Blob ? document : "",
                    unit_code: (field.unitCode || "").trim().toUpperCase(),
                    price: field.price !== "" ? field.price : null,
                    currency: (field.currency || "USD").toUpperCase(),
                    total_units: field.totalUnits !== "" ? field.totalUnits : null,
                    available_units: field.availableUnits !== "" ? field.availableUnits : null,
                    unit_status: field.unitStatus || "available",
                    features: field.dynamicFeatures || {},
                });
            }

            // Convert removed items arrays for API
            const removeFloorsArray = Array.from(removedPlans);
            const removeGalleryArray = Array.from(removedGalleryImages);
            const removeDocArray = Array.from(removedDocuments);

            // Format translations for API (same as AddProject)
            const formattedTranslations = translations.map((translation, index) => ({
                translation_id: index,
                language_id: translation.language_id,
                title: translation.title || "",
                description: translation.description || ""
            }));

            // Prepare data payload for API
            const data = {
                id: editProjectId,
                title: projectFormData.projectTitle,
                description: projectFormData.projectDescription,
                category_id: selectedCategory.id,
                type: projectFormData.projectType,
                meta_title: seoFormData.metaTitle,
                meta_description: seoFormData.metaDescription,
                meta_keywords: seoFormData.metaKeywords,
                meta_image: (() => {
                    if (seoFormData.ogImage) {
                        if (seoFormData.ogImage instanceof Blob) {
                            return compressedMetaImage;
                        }
                        return ""; // Don't pass string URLs
                    }
                    return ""; // Return empty string if no image
                })(),
                city: selectedLocationAddress.city,
                state: selectedLocationAddress.state,
                country: selectedLocationAddress.country,
                latitude: selectedLocationAddress.latitude,
                longitude: selectedLocationAddress.longitude,
                location: selectedLocationAddress.formattedAddress,
                plans: plans,
                image: compressedTitleImage || "",
                documents: [],
                document_names: [],
                gallery_images: compressedGalleryImages,
                ...(!shouldRemoveVideo ? {
                    video_link: mediaFormData.videoLink,
                    custom_video: mediaFormData.customVideo,
                    ...(mediaFormData.videoLink || mediaFormData.customVideo
                        ? { video_type: mediaFormData.videoType }
                        : {}),
                } : {}),
                remove_plans: removeFloorsArray,
                remove_gallery_images: removeGalleryArray,
                remove_documents: removeDocArray,
                slug_id: projectFormData.projectSlug,
                translations: formattedTranslations,
                is_premium: projectFormData.isPremiumProject,

                // Features & Amenities (Parameters)
                parameters: Object.keys(parameterFormData).reduce((acc, paramId) => {
                    const val = parameterFormData[paramId];
                    if (Array.isArray(val)) {
                        if (val.length > 0) acc.push({ parameter_id: paramId, value: val });
                    } else if (val && val.toString().trim() !== '') {
                        acc.push({ parameter_id: paramId, value: val });
                    }
                    return acc;
                }, []),

                // Outdoor Facilities
                facilities: Object.keys(facilityDistances).reduce((acc, facilityId) => {
                    const val = facilityDistances[facilityId];
                    if (Array.isArray(val)) {
                        if (val.length > 0) acc.push({ facility_id: facilityId, distance: val });
                    } else if (val && val.toString().trim() !== '') {
                        acc.push({ facility_id: facilityId, distance: val });
                    }
                    return acc;
                }, []),

                ...(removedMetaImage && { remove_meta_image: 1 }),
                ...(shouldRemoveVideo && { remove_video: 1 }),
            };

            // Estimate total payload size and warn if near PHP limit
            const sizes = {
                titleImage: compressedTitleImage?.size || 0,
                galleryImages: compressedGalleryImages.reduce((s, f) => s + (f?.size || 0), 0),
                documents: 0,
                floorPlans: compressedFloorFormData.reduce((s, f) => s + (f.floorImage?.size || 0), 0),
                metaImage: compressedMetaImage?.size || 0,
            };
            const totalBytes = Object.values(sizes).reduce((a, b) => a + b, 0);

            console.log('File sizes (MB):', Object.fromEntries(
                Object.entries(sizes).map(([k, v]) => [k, Math.round(v / 1024 / 1024 * 10) / 10])
            ), 'Total:', Math.round(totalBytes / 1024 / 1024 * 10) / 10, 'MB');

            if (totalBytes > 40 * 1024 * 1024) {
                toast.error("The total file size exceeds the server limit. Please reduce image/document sizes.");
                setShowLoader(false);
                return;
            }

            // Upload documents individually before main form submit
            const uploadedDocNames = [];
            if (Array.isArray(compressedDocuments)) {
                for (const doc of compressedDocuments) {
                    if (!doc) continue;
                    try {
                        const docRes = await uploadProjectDocumentApi(doc);
                        if (!docRes?.error && docRes?.filename) {
                            uploadedDocNames.push(docRes.filename);
                        } else {
                            toast.error(docRes?.message || "Failed to upload document");
                            setShowLoader(false);
                            return;
                        }
                    } catch (docErr) {
                        console.error("Document upload error:", docErr);
                        toast.error("Failed to upload document. Please try again.");
                        setShowLoader(false);
                        return;
                    }
                }
            }
            data.document_names = uploadedDocNames;

            // Make the API call
            const response = await postProjectApi(data);

            if (!response?.error) {
                // Invalidate homepage cache so updated project appears immediately
                queryClient.invalidateQueries({ queryKey: ['homepageProjectSections'] });
                queryClient.invalidateQueries({ queryKey: ['homepagePropertySections'] });
                queryClient.invalidateQueries({ queryKey: ['homepageSections'] });
                queryClient.invalidateQueries({ queryKey: ['homepageOtherSections'] });
                queryClient.invalidateQueries({ queryKey: ['homePageMap'] });
                queryClient.invalidateQueries({ queryKey: ['homePageCities'] });
                queryClient.invalidateQueries({ queryKey: ['homePageAddBanners'] });
                toast.success(t(response?.message));
                // Redirect to projects listing
                router.push(router?.asPath?.includes("/user") ? `/user/listings?tab=projects&lang=${lang}` : `/agent/projects?lang=${lang}`);
            } else {
                toast.error(response?.message || t("somethingWentWrong"));
            }
        } catch (error) {
            console.error("Error updating project:", error);
            toast.error(error?.response?.data?.message || error?.message || t("somethingWentWrong"));
        } finally {
            setShowLoader(false);
        }
    };

    // Handler for generating Project Description using AI
    const handleGenerateAIDescription = async () => {
        try {
            setIsDescriptionGenerating(true);
            const response = await generateAIPropertyDescriptionApi({
                entity_type: "project",
                title: translations.find(tr => tr.language_id === selectedLanguage?.id)?.title || projectFormData.projectTitle || "",
                category_id: selectedCategory?.id,
                language_id: selectedLanguage?.id,
                project_type: projectFormData.projectType?.toLowerCase(),
                city: selectedLocationAddress.city,
                state: selectedLocationAddress.state,
                country: selectedLocationAddress.country
            });
            if (selectedLanguage?.code === defaultLanguage) {
                setProjectFormData((prev) => ({
                    ...prev,
                    projectDescription: response?.data?.description || "",
                }));
            } else {
                handleMultiLangChange(selectedLanguage, "description", response?.data?.description || "");
            }
        } catch (error) {
            console.error("AI Description Generation Error:", error);
            const message = error?.message || error?.details || error?.response?.data?.message || t("somethingWentWrong");
            toast.error(t(message) || message);
        } finally {
            setIsDescriptionGenerating(false);
        }
    }

    // Handler to generate AI meta data
    const handleGenerateAIMetaData = async () => {
        try {
            setIsMetaDataGenerating(true);
            const response = await generateAIPropertyMetaDataApi({
                entity_type: "project",
                title: projectFormData.projectTitle || "",
                category_id: selectedCategory?.id,
                language_id: selectedLanguage?.id,
                project_type: projectFormData.projectType?.toLowerCase(),
                city: selectedLocationAddress.city,
                state: selectedLocationAddress.state,
                country: selectedLocationAddress.country
            })
            const data = response?.data;
            setSeoFormData((prev) => ({
                ...prev,
                metaTitle: data?.meta_title || "",
                metaKeywords: data?.meta_keywords || "",
                metaDescription: data?.meta_description || "",
            }));
        } catch (error) {
            const message = error?.message || error?.details || error?.response?.data?.message || t("somethingWentWrong");
            toast.error(t(message) || message)
            console.error("Failed to generate AI meta data:", error);
        } finally {
            setIsMetaDataGenerating(false);
        }
    }

    if (isLoading) {
        return (
            <PropertyFormShell
                title={t("editProject")}
                tabItems={tabItems}
                activeTab={activeTab}
                onTabChange={handleTabChange}
            >
                <div className="flex flex-col gap-4">
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-10 w-1/2" />
                </div>
            </PropertyFormShell>
        );
    }

    return (
        <PropertyFormShell
            title={t("editProject")}
            tabItems={tabItems}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            showRoundedBorders={router?.asPath?.includes("/user")}
        >
            {activeTab === "projectDetails" && (
                <div className="flex flex-col gap-6 md:gap-14">
                    <ProjectDetailsTab
                        selectedCategory={selectedCategory}
                        projectFormData={projectFormData}
                        handleUpdateProjectForm={handleUpdateProjectForm}
                        handleCheckRequiredFields={handleCheckRequiredFields}
                        isEditing={true}
                        disableCategoryChange={true}
                        selectedLanguage={selectedLanguage}
                        setSelectedLanguage={setSelectedLanguage}
                        languages={languages}
                        translations={translations}
                        handleMultiLangChange={handleMultiLangChange}
                        handleGenerateAIDescription={handleGenerateAIDescription}
                        isDescriptionGenerating={isDescriptionGenerating}
                    />
                </div>
            )}

            {activeTab === "imagesVideo" && (
                <ImagesVideoTab
                    showLoader={showLoader}
                    handleCheckRequiredFields={handleCheckRequiredFields}
                    mediaFormData={mediaFormData}
                    setMediaFormData={setMediaFormData}
                    handleRemoveGalleryImages={handleRemoveGalleryImages}
                    handleRemoveDocuments={handleRemoveDocuments}
                    isEditing={true}
                    handleRemoveMedia={handleRemoveMedia}
                    isCustomVideoUpload={isCustomVideoUpload}
                    setShouldRemoveVideo={setShouldRemoveVideo}
                />
            )}

            {activeTab === "floorDetails" && (
                <FloorDetails
                    floorFormData={floorFormData}
                    setFloorFormData={setFloorFormData}
                    handleCheckRequiredFields={handleCheckRequiredFields}
                    isEditing={true}
                    setRemovedPlans={setRemovedPlans}
                    featureParameters={selectedCategory?.parameter_types?.filter(p => p.type === "feature") || []}
                    projectId={editProjectId}
                    onImportComplete={handleFetchProjectDetails}
                />
            )}

            {activeTab === "location" && (
                <LocationComponent
                    selectedLocationAddress={selectedLocationAddress}
                    setSelectedLocationAddress={setSelectedLocationAddress}
                    handleLocationSelect={handleLocationSelect}
                    handleCheckRequiredFields={handleCheckRequiredFields}
                    isProperty={false}
                    isEditing={true}
                />
            )}

            {activeTab === "facilities" && (
                <div className="flex flex-col gap-6 md:gap-14">
                    <FacilitiesComponent
                        formData={parameterFormData}
                        setFormData={setParameterFormData}
                        selectedCategory={selectedCategory}
                        handleCheckRequiredFields={handleCheckRequiredFields}
                        isEditing={true}
                        filterType="amenity"
                    />
                </div>
            )}

            {activeTab === "outdoorFacilities" && (
                <div className="flex flex-col gap-6 md:gap-14">
                    <OutdoorFacilitiesComponent
                        facilities={facilities}
                        handleTabChange={handleTabChange}
                        facilityDistances={facilityDistances}
                        handleDistanceChange={handleDistanceChange}
                        isEditing={true}
                    />
                </div>
            )}

            {activeTab === "seoSettings" && (
                <SEODetailsTab
                    showLoader={showLoader}
                    handleSubmit={() => handleCheckRequiredFields("seoSettings", "submit")}
                    handleTabChange={handleTabChange}
                    seoFormData={seoFormData}
                    handleFillSeoFormData={handleFillSeoFormData}
                    isProperty={false}
                    isEditing={true}
                    setIsRemoveOgImage={() => setRemovedMetaImage(true)}
                    handleGenerateAIMetaData={handleGenerateAIMetaData}
                    isMetaDataGenerating={isMetaDataGenerating}
                />
            )}
        </PropertyFormShell>
    )
}

export default EditProject