import ImageWithPlaceholder from "@/components/image-with-placeholder/ImageWithPlaceholder";
import { getDisplayValueForOption } from "@/utils/helperFunction";
import { BsGeoAlt, BsCheck } from "react-icons/bs";
import { ReactSVG } from "react-svg";
import { useSelector } from "react-redux";

const PropertyCard = ({
    property,
    isSelected = false,
    onSelect,
    showPrice = true,
    className = "",
}) => {
    const exchangeRate = useSelector((state) => state?.exchangeRate?.rate) || 58.5;

    const renderDualPrices = () => {
        const originalPrice = Number(property?.price || 0);
        if (!originalPrice) return { mainPriceString: "", convertedPriceString: "" };

        const currency = property?.currency?.toUpperCase()?.trim() || "USD";
        const rate = Number(exchangeRate) > 0 ? Number(exchangeRate) : 58.5;

        const usdFormatter = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });

        const dopFormatter = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "DOP",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });

        if (currency === "DOP" || currency === "RD$") {
            return {
                mainPriceString: dopFormatter.format(originalPrice).replace("DOP", "RD$"),
                convertedPriceString: `≈ ${usdFormatter.format(originalPrice / rate)}`,
            };
        }

        return {
            mainPriceString: usdFormatter.format(originalPrice),
            convertedPriceString: `≈ ${dopFormatter.format(originalPrice * rate).replace("DOP", "RD$")}`,
        };
    };

    const { mainPriceString, convertedPriceString } = renderDualPrices();

    const handleCardClick = () => {
        onSelect && onSelect(property);
    };

    const cardClasses = `
    relative bg-white newBorder rounded-2xl p-4 h-full lg:max-h-[148px] transition-all duration-200 hover:cursor-pointer outline-none
    ${isSelected ? 'border-2 !primaryBorderColor ' : ''}
    ${className}
  `.trim();
    const location = `${property?.city}${property?.city && property?.state ? ', ' : ''}${property?.state}${property?.state && property?.country ? ', ' : ''}${property?.country}`;

    return (
        <div className={cardClasses} onClick={handleCardClick} role="button" tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
            aria-label={`Select ${property?.translated_title || property?.title}`}>
            <div className="flex flex-col lg:flex-row gap-4">
                {/* Property Image */}
                <div className="w-28 h-28 flex-shrink-0">
                    <ImageWithPlaceholder
                        src={property?.title_image}
                        alt={property?.translated_title || property?.title || "Property Image"}
                        className="w-full h-full rounded-2xl object-cover"
                        loading="lazy"
                    />
                </div>

                {/* Property Details */}
                <div className="flex flex-col justify-between gap-2">
                    {/* Property Name and Check */}
                    <div className="flex items-start justify-between">
                        <h3 className="brandColor font-bold text-lg leading-tight flex-1 mr-2">{property?.translated_title || property?.title}</h3>
                        {isSelected && (
                            <div className="w-6 h-6 absolute right-3 top-3 primaryBg rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                <BsCheck className="w-5 h-5 text-white" />
                            </div>
                        )}
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-2">
                        <BsGeoAlt className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        <span className="text-sm text-gray-500">{location}</span>
                    </div>

                    {/* Facilities */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {property?.parameters?.length > 0 ? (
                            <>
                                {property?.parameters?.slice(0, 4)?.map((parameter, idx) => (
                                    <div
                                        key={parameter?.id}
                                        className="flex items-center gap-2 md:gap-3"
                                    >
                                        <ReactSVG
                                            src={parameter?.image}
                                            beforeInjection={(svg) => {
                                                svg.setAttribute(
                                                    "style",
                                                    `height: 100%; width: 100%;`,
                                                );
                                                svg.querySelectorAll("path").forEach((path) => {
                                                    path.setAttribute(
                                                        "style",
                                                        `fill: var(--facilities-icon-color);`,
                                                    );
                                                });
                                            }}
                                            className="leadColor h-4 w-4 object-contain"
                                            alt={parameter?.translated_name || parameter?.name || 'facilites icon'}
                                        />

                                        <span className="text-sm truncate font-medium">
                                            {getDisplayValueForOption(parameter)}
                                        </span>
                                        {property?.parameters?.slice(0, 4)?.length - 1 !== idx && <span className="h-4 border-r" />}
                                    </div>
                                ))}
                            </>
                        ) : (
                            <div />
                        )}
                    </div>

                    {/* Price */}
                    {showPrice && (
                        <div className="flex flex-col">
                            <span className="brandColor font-bold text-lg">{mainPriceString}</span>
                            {convertedPriceString ? (
                                <span className="text-xs text-gray-500 font-medium">{convertedPriceString}</span>
                            ) : null}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PropertyCard;