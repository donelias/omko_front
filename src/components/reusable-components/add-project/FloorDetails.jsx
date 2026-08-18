import { useState, useMemo, useRef, useEffect } from "react";
import { FaPlus, FaTimes } from "react-icons/fa";
import { IoMdRemoveCircleOutline } from "react-icons/io";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/components/context/TranslationContext";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import toast from "react-hot-toast";
import BulkImportUnits from "./BulkImportUnits";

// Floor Details Component for Projects
const FloorDetails = ({
    floorFormData,
    setFloorFormData,
    handleCheckRequiredFields,
    isEditing = false,
    setRemovedPlans = () => {},
    featureParameters = [],
    projectId = null,
    onImportComplete = () => {},
}) => {
    const t = useTranslation();
    const [currentFloorIndex, setCurrentFloorIndex] = useState(0);

    const getDefaultFloor = () => ({
        floorTitle: "",
        floorImage: null,
        unitCode: "",
        price: "",
        currency: "USD",
        totalUnits: "",
        availableUnits: "",
        unitStatus: "available",
        dynamicFeatures: {},
    });

    // Store object URLs to prevent re-creation on every render
    const floorImageUrls = useRef(new Map());

    // Clean up object URLs on unmount
    useEffect(() => {
        // Capture the current ref value for cleanup
        const currentUrls = floorImageUrls.current;

        return () => {
            // Revoke all object URLs to prevent memory leaks
            [...currentUrls.values()].forEach(url => {
                URL.revokeObjectURL(url);
            });
            currentUrls.clear();
        };
    }, []);

    // Helper function to get image URL safely
    const getImageUrl = (image) => {
        if (typeof image === 'string') return image;
        if (!image) return null;

        try {
            // Use file name as key
            const fileId = image.name || Date.now().toString();

            if (!floorImageUrls.current.has(fileId)) {
                const url = URL.createObjectURL(image);
                floorImageUrls.current.set(fileId, url);
            }

            return floorImageUrls.current.get(fileId);
        } catch (error) {
            console.error("Error creating object URL:", error);
            return null;
        }
    };

    // Get ordinal suffix for numbers (1st, 2nd, 3rd, etc.)
    const getOrdinal = (index) => {
        const j = index + 1;
        if (j === 11 || j === 12 || j === 13) {
            return `${j}th`;
        } else {
            const suffixes = ["st", "nd", "rd"];
            const remainder = j % 10;
            const suffix = suffixes[remainder - 1] || "th";
            return `${j}${suffix}`;
        }
    };

    // Handle adding a new floor
    const handleAddFloor = () => {
        const lastFloorIndex = floorFormData.length - 1;
        const lastFloor = floorFormData[lastFloorIndex];

        if (lastFloor.floorTitle.trim() === "" || !lastFloor.floorImage) {
            return toast.error(t("currentFloorDetailsIsRequired"));
        } else {
            setFloorFormData((prev) => [...prev, getDefaultFloor()]);
            setCurrentFloorIndex(floorFormData.length);
        }
    };

    // Handle removing a floor
    const handleRemoveFloor = (index) => {
        // Clean up object URL if needed
        const floor = floorFormData[index];
        setRemovedPlans((prev) => new Set([...prev, floor?.id].filter(Boolean)));
        if (floor?.floorImage && typeof floor.floorImage !== 'string') {
            try {
                const fileId = floor.floorImage.name || Date.now().toString();
                if (floorImageUrls.current.has(fileId)) {
                    URL.revokeObjectURL(floorImageUrls.current.get(fileId));
                    floorImageUrls.current.delete(fileId);
                }
            } catch (error) {
                console.error("Error cleaning up floor image URL:", error);
            }
        }

        setFloorFormData((prev) => {
            const updated = prev.filter((_, i) => i !== index);

            // Update currentFloorIndex
            const newCurrentIndex = index < currentFloorIndex
                ? currentFloorIndex - 1
                : index === currentFloorIndex
                    ? Math.max(0, index - 1)
                    : currentFloorIndex;

            setCurrentFloorIndex(newCurrentIndex);
            return updated;
        });
    };

    // Update floor title
    const handleDynamicFeatureChange = (index, fieldName, value) => {
        setFloorFormData((prev) => {
            const updated = [...prev];
            updated[index] = {
                ...updated[index],
                dynamicFeatures: {
                    ...(updated[index].dynamicFeatures || {}),
                    [fieldName]: value,
                },
            };
            return updated;
        });
    };

    const handleFloorInputChange = (index, e) => {
        const { name, value } = e.target;
        setFloorFormData((prev) => {
            const updated = [...prev];

            let normalizedValue = value;

            if (name === "unitCode") {
                normalizedValue = value
                    .toUpperCase()
                    .trim()
                    .replace(/\s+/g, "_")
                    .replace(/[^A-Z0-9_-]/g, "");
            }

            if (name === "currency") {
                normalizedValue = value
                    .toUpperCase()
                    .replace(/[^A-Z]/g, "")
                    .slice(0, 3);
            }

            if (name === "totalUnits" || name === "availableUnits") {
                normalizedValue = value === "" ? "" : Math.max(0, Number(value));
            }

            updated[index] = { ...updated[index], [name]: normalizedValue };

            // Keep available units bounded by total units on the client side.
            if (name === "totalUnits" && normalizedValue !== "") {
                const total = Number(normalizedValue);
                const currentAvailable = updated[index].availableUnits;
                if (currentAvailable !== "" && Number(currentAvailable) > total) {
                    updated[index].availableUnits = total;
                }
            }

            return updated;
        });
    };

    // Handle floor image uploads
    const onDropFloorImgs = (floorIndex, acceptedFiles) => {
        setFloorFormData((prev) => {
            const updated = [...prev];
            if (!updated[floorIndex]) {
                updated[floorIndex] = getDefaultFloor();
            }

            // For single file upload (replace the existing files)
            updated[floorIndex] = {
                ...updated[floorIndex],
                floorImage: acceptedFiles[0],
            };
            return updated;
        });
    };

    // Remove floor image
    const removeFloorImgs = (floorIndex) => {
        // Clean up object URL if needed
        const floor = floorFormData[floorIndex];
        if (floor?.floorImage && typeof floor.floorImage !== 'string') {
            try {
                const fileId = floor.floorImage.name || Date.now().toString();
                if (floorImageUrls.current.has(fileId)) {
                    URL.revokeObjectURL(floorImageUrls.current.get(fileId));
                    floorImageUrls.current.delete(fileId);
                }
            } catch (error) {
                console.error("Error cleaning up floor image URL:", error);
            }
        }

        setFloorFormData((prev) => {
            const updated = [...prev];
            updated[floorIndex] = { ...updated[floorIndex], floorImage: null };
            return updated;
        });
    };

    // Setup dropzone for floor images
    const {
        getRootProps: getRootPropsFloor,
        getInputProps: getInputPropsFloor,
        isDragActive: isDragActiveFloor,
    } = useDropzone({
        onDrop: (acceptedFiles) => onDropFloorImgs(currentFloorIndex, acceptedFiles),
        accept: {
            "image/jpeg": [".jpeg", ".jpg"],
            "image/png": [".png"],
            "image/webp": [".webp"],
        },
        multiple: false,
    });

    const floorValidation = useMemo(() => {
        const codeCount = {};
        const hasAnyFloorData = floorFormData.some((floor) =>
            [
                floor.floorTitle,
                floor.floorImage,
                floor.unitCode,
                floor.price,
                floor.currency,
                floor.totalUnits,
                floor.availableUnits,
            ].some((value) => value !== null && value !== undefined && String(value).trim() !== "")
        );

        floorFormData.forEach((floor) => {
            const normalizedCode = (floor.unitCode || "").trim().toUpperCase();
            if (normalizedCode) {
                codeCount[normalizedCode] = (codeCount[normalizedCode] || 0) + 1;
            }
        });

        const rowErrors = floorFormData.map((floor) => {
            const errors = {};
            if (!hasAnyFloorData) {
                return errors;
            }

            if (!floor.floorTitle?.trim()) {
                errors.floorTitle = t("floorTitleIsRequired");
            }

            if (!floor.floorImage) {
                errors.floorImage = t("floorImageIsRequired");
            }

            const normalizedCode = (floor.unitCode || "").trim().toUpperCase();
            if (normalizedCode && codeCount[normalizedCode] > 1) {
                errors.unitCode = t("typologyUnitCodeUnique");
            }

            const hasTotal = floor.totalUnits !== "" && floor.totalUnits !== null && floor.totalUnits !== undefined;
            const hasAvailable = floor.availableUnits !== "" && floor.availableUnits !== null && floor.availableUnits !== undefined;

            if (hasTotal && Number(floor.totalUnits) < 0) {
                errors.totalUnits = t("typologyTotalUnitsNonNegative");
            }

            if (hasAvailable && Number(floor.availableUnits) < 0) {
                errors.availableUnits = t("typologyAvailableUnitsNonNegative");
            }

            if (hasTotal && hasAvailable && Number(floor.availableUnits) > Number(floor.totalUnits)) {
                errors.availableUnits = t("typologyAvailableUnitsCannotExceedTotal");
            }

            if (floor.currency && String(floor.currency).length !== 3) {
                errors.currency = t("typologyCurrencyThreeLetters");
            }

            return errors;
        });

        const hasBlockingErrors = rowErrors.some((errors) => Object.keys(errors).length > 0);

        return {
            hasAnyFloorData,
            rowErrors,
            hasBlockingErrors,
        };
    }, [floorFormData]);

    // Render floor images
    const floorsFiles = useMemo(
        () =>
            floorFormData.map((floor, index) => {
                if (!floor.floorImage) return null;

                try {
                    // Get safe image URL
                    const imageUrl = getImageUrl(floor.floorImage);
                    if (!imageUrl) return null; // Skip if URL cannot be created

                    // Get file name based on type
                    const fileName = typeof floor.floorImage === 'string'
                        ? floor.floorImage.split('/').pop() || t("file")
                        : floor.floorImage.name || t("file");

                    // Get file size if available
                    const fileSize = typeof floor.floorImage !== 'string' && floor.floorImage.size
                        ? `${Math.round(floor.floorImage.size / 1024)} KB`
                        : '';

                    return (
                        <div key={index} className="space-y-2">
                            <div className="relative overflow-hidden rounded-md">
                                <Image
                                    width={0}
                                    height={0}
                                    src={imageUrl}
                                    alt={fileName}
                                    className="h-[150px] w-full object-cover"
                                    onError={(e) => {
                                        console.error(`Floor image ${index} failed to load`);
                                        e.target.src = '/placeholder-image.png'; // Fallback
                                    }}
                                />
                                <button
                                    className="absolute right-2 top-2 rounded-full bg-black p-1.5 text-white hover:bg-gray-800"
                                    onClick={() => removeFloorImgs(index)}
                                    type="button"
                                >
                                    <FaTimes size={14} />
                                </button>
                                <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-black/50 px-2 py-1.5 text-xs text-white">
                                    <div className="overflow-hidden">
                                        <span className="block max-w-[200px] truncate">
                                            {fileName}
                                        </span>
                                    </div>
                                    <span>{fileSize}</span>
                                </div>
                            </div>
                        </div>
                    );
                } catch (error) {
                    console.error(`Error rendering floor image at index ${index}:`, error);
                    return null;
                }
            }).filter(Boolean),
        [floorFormData, t, getImageUrl],
    );

    // Simplified UI to match the image
    return (
        <div className="flex flex-col gap-8">
            <div className="space-y-6">
                {floorFormData.map((floor, floorIndex) => (
                    <div
                        key={floorIndex}
                        className="relative grid grid-cols-1 gap-6 md:grid-cols-2"
                    >
                        {(() => {
                            const errors = floorValidation.rowErrors[floorIndex] || {};

                            return (
                                <>
                        <div>
                            <Label className="mb-2 block font-medium text-gray-800">
                                {getOrdinal(floorIndex)} {t("floorTitle")}
                            </Label>
                            <Input
                                type="text"
                                id={`floor-title-${floorIndex}`}
                                name="floorTitle"
                                value={floor.floorTitle}
                                onChange={(e) => handleFloorInputChange(floorIndex, e)}
                                placeholder={t("enterFloorTitle")}
                                className={`primaryBackgroundBg w-full rounded-md px-3 py-2 focus:outline-none ${errors.floorTitle ? "border border-red-500" : ""}`}
                            />
                            {errors.floorTitle && <p className="mt-1 text-xs text-red-600">{errors.floorTitle}</p>}
                        </div>

                        <div>
                            <Label className="mb-2 block font-medium text-gray-800">
                                {getOrdinal(floorIndex)} {t("floorImage")}
                            </Label>
                            <div
                                onMouseEnter={() => setCurrentFloorIndex(floorIndex)}
                                className="flex gap-2"
                            >
                                <div className="primaryBackgroundBg w-full rounded-md">
                                    {!floor.floorImage ? (
                                        <div
                                            {...getRootPropsFloor()}
                                            className={`flex min-h-[72px] cursor-pointer flex-col items-center justify-center rounded-md border border-dashed p-4 transition-colors duration-200 ${isDragActiveFloor ? "border-primary bg-primary/5" : "border-gray-300"}`}
                                        >
                                            <input {...getInputPropsFloor()} />
                                            <div className="text-center text-gray-500">
                                                {isDragActiveFloor ? (
                                                    <span>{t("dropToUpload")}</span>
                                                ) : (
                                                    <span>
                                                        {t("dragDrop")}{" "}
                                                        <span className="underline">{t("browse")}</span>
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mt-2">
                                            {floorsFiles[floorIndex]}
                                        </div>
                                    )}
                                </div>
                                {errors.floorImage && <p className="mt-1 text-xs text-red-600">{errors.floorImage}</p>}
                                {floorFormData.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveFloor(floorIndex)}
                                        className="w-fit text-teal-600"
                                        aria-label="Remove floor"
                                    >
                                        <IoMdRemoveCircleOutline size={24} />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div>
                            <Label className="mb-2 block font-medium text-gray-800">
                                Unit Code
                            </Label>
                            <Input
                                type="text"
                                id={`unit-code-${floorIndex}`}
                                name="unitCode"
                                value={floor.unitCode || ""}
                                onChange={(e) => handleFloorInputChange(floorIndex, e)}
                                placeholder="TIPO-A"
                                className={`primaryBackgroundBg w-full rounded-md px-3 py-2 focus:outline-none ${errors.unitCode ? "border border-red-500" : ""}`}
                            />
                            {errors.unitCode && <p className="mt-1 text-xs text-red-600">{errors.unitCode}</p>}
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:col-span-2 md:grid-cols-4">
                            <div>
                                <Label className="mb-2 block font-medium text-gray-800">{t("price")}</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    name="price"
                                    value={floor.price || ""}
                                    onChange={(e) => handleFloorInputChange(floorIndex, e)}
                                    placeholder="0.00"
                                    className="primaryBackgroundBg w-full rounded-md px-3 py-2 focus:outline-none"
                                />
                            </div>
                            <div>
                                <Label className="mb-2 block font-medium text-gray-800">{t("currency")}</Label>
                                <Input
                                    type="text"
                                    maxLength={3}
                                    name="currency"
                                    value={floor.currency || "USD"}
                                    onChange={(e) => handleFloorInputChange(floorIndex, e)}
                                    placeholder="USD"
                                    className={`primaryBackgroundBg w-full rounded-md px-3 py-2 uppercase focus:outline-none ${errors.currency ? "border border-red-500" : ""}`}
                                />
                                {errors.currency && <p className="mt-1 text-xs text-red-600">{errors.currency}</p>}
                            </div>
                            <div>
                                <Label className="mb-2 block font-medium text-gray-800">Total Units</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    step="1"
                                    name="totalUnits"
                                    value={floor.totalUnits || ""}
                                    onChange={(e) => handleFloorInputChange(floorIndex, e)}
                                    placeholder="0"
                                    className={`primaryBackgroundBg w-full rounded-md px-3 py-2 focus:outline-none ${errors.totalUnits ? "border border-red-500" : ""}`}
                                />
                                {errors.totalUnits && <p className="mt-1 text-xs text-red-600">{errors.totalUnits}</p>}
                            </div>
                            <div>
                                <Label className="mb-2 block font-medium text-gray-800">Available Units</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    step="1"
                                    name="availableUnits"
                                    value={floor.availableUnits || ""}
                                    onChange={(e) => handleFloorInputChange(floorIndex, e)}
                                    placeholder="0"
                                    className={`primaryBackgroundBg w-full rounded-md px-3 py-2 focus:outline-none ${errors.availableUnits ? "border border-red-500" : ""}`}
                                />
                                {errors.availableUnits && <p className="mt-1 text-xs text-red-600">{errors.availableUnits}</p>}
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <Label className="mb-2 block font-medium text-gray-800">Unit Status</Label>
                            <select
                                name="unitStatus"
                                value={floor.unitStatus || "available"}
                                onChange={(e) => handleFloorInputChange(floorIndex, e)}
                                className="primaryBackgroundBg w-full rounded-md border px-3 py-2 focus:outline-none"
                            >
                                <option value="available">Available</option>
                                <option value="low_stock">Low Stock</option>
                                <option value="sold_out">Sold Out</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        {featureParameters.length > 0 && (
                            <>
                                <div className="col-span-1 md:col-span-2 mt-4">
                                    <h4 className="text-sm font-semibold text-gray-800 mb-3">
                                        {t("additionalFeatures") || "Additional Features"}
                                    </h4>
                                </div>
                                <div className="grid grid-cols-1 gap-4 md:col-span-2 md:grid-cols-4">
                                    {featureParameters.map((param) => {
                                        const fieldName = `param_${param.id}`;
                                        return (
                                            <div key={param.id}>
                                                <Label className="mb-2 block font-medium text-gray-800">{param.name}</Label>
                                                {param.type_of_parameter === "dropdown" ? (
                                                    <select
                                                        value={floor.dynamicFeatures?.[fieldName] || ""}
                                                        onChange={(e) => handleDynamicFeatureChange(floorIndex, fieldName, e.target.value)}
                                                        className="primaryBackgroundBg w-full rounded-md border px-3 py-2 focus:outline-none"
                                                    >
                                                        <option value="">Select</option>
                                                        {param.options?.map((opt, idx) => (
                                                            <option key={idx} value={opt}>{opt}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <Input
                                                        type={param.type_of_parameter === "number" ? "number" : "text"}
                                                        min={param.type_of_parameter === "number" ? "0" : undefined}
                                                        step={param.type_of_parameter === "number" ? "any" : undefined}
                                                        name={fieldName}
                                                        value={floor.dynamicFeatures?.[fieldName] || ""}
                                                        onChange={(e) => handleDynamicFeatureChange(floorIndex, fieldName, e.target.value)}
                                                        placeholder={param.name}
                                                        className="primaryBackgroundBg w-full rounded-md px-3 py-2 focus:outline-none"
                                                    />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                                </>
                            );
                        })()}
                    </div>
                ))}

                <Button
                    onClick={handleAddFloor}
                    className="primaryBorderColor primaryColor flex w-auto items-center justify-center gap-2 border px-6 py-2 hover:primaryColor hover:primaryBorderColor bg-white hover:bg-white"
                    type="button"
                >
                    <span>{t("addFloor")}</span>
                </Button>
            </div>

            {/* Bulk Import (edit mode only) */}
            {projectId && (
                <BulkImportUnits projectId={projectId} onImportComplete={onImportComplete} />
            )}

            {/* Next Button */}
            <div className="flex justify-end">
                <Button
                    onClick={() => {
                        if (floorValidation.hasBlockingErrors) {
                            toast.error(t("typologyFixErrorsBeforeContinue"));
                            return;
                        }
                        handleCheckRequiredFields("floorDetails", "seoSettings");
                    }}
                    disabled={floorValidation.hasBlockingErrors}
                    className="rounded-md bg-gray-800 px-10 py-2 text-white hover:bg-gray-900"
                >
                    {isEditing ? t("save") : t("next")}
                </Button>
            </div>
        </div>
    );
};

export default FloorDetails;
