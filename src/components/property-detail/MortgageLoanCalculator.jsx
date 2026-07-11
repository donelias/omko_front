import { getBanksApi, getCooperativesApi, checkPackageLimitApi, mortgageCalculationApi } from "@/api/apiRoutes";
import { PackageTypes } from "@/utils/checkPackages/packageTypes";
import { formatPriceAbbreviated, showLoginSwal } from "@/utils/helperFunction";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useTranslation } from "../context/TranslationContext";
import EMIModal from "./EMIModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getDualPriceDisplay } from "@/utils/propertyPrice";

const MortgageLoanCalculator = ({ propertyDetails, showLoginModal, setShowLoginModal }) => {
  const t = useTranslation();
  const webSettings = useSelector((state) => state.WebSetting?.data);
  const exchangeRate = useSelector((state) => state?.exchangeRate?.rate) || 58.5;
  const router = useRouter();
  const isLoggedIn = useSelector((state) => {
    if (!state || !state.User) {
      return null;
    }
    return state.User;
  });

  const CurrencySymbol = webSettings?.currency_symbol || "$";
  const userCurrentId = isLoggedIn?.data?.id;
  const themeColor = webSettings?.system_color;
  const propertyCurrency = (propertyDetails?.currency || "USD").toUpperCase();
  const otherCurrency = propertyCurrency === "USD" ? "DOP" : "USD";

  const minRateInterest = 1;
  const maxRateInterest = 100;
  const maxInterestYears = 30;

  const [entities, setEntities] = useState([]);
  const [entityType, setEntityType] = useState("");
  const [selectedEntityId, setSelectedEntityId] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [downPaymentType, setDownPaymentType] = useState("price");
  const [years, setYears] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [totalEmiData, setTotalEmiData] = useState();
  const [totalEmiYearlyData, setTotalEmiYearlyData] = useState([]);
  const [calcCurrency, setCalcCurrency] = useState(propertyCurrency);

  useEffect(() => {
    Promise.all([getBanksApi(), getCooperativesApi()])
      .then(([banksRes, coopRes]) => {
        const banks = (banksRes?.data || []).map((b) => ({ ...b, _type: "bank" }));
        const coops = (coopRes?.data || []).map((c) => ({ ...c, _type: "cooperative" }));
        setEntities([...banks, ...coops]);
      })
      .catch(() => {});
  }, []);

  const selectedEntity = entities.find((e) => e.id === Number(selectedEntityId) && e._type === entityType);

  useEffect(() => {
    if (selectedEntity?.interest_rate) {
      setInterestRate(Number(selectedEntity.interest_rate));
    }
  }, [selectedEntity]);

  const propertyPriceInCalcCurrency = calcCurrency === propertyCurrency
    ? Number(propertyDetails?.price || 0)
    : calcCurrency === "USD"
      ? Number(propertyDetails?.price || 0) / exchangeRate
      : Number(propertyDetails?.price || 0) * exchangeRate;

  const handleInputChangeforInterest = (event) => {
    let value = parseFloat(event.target.value.trim()) || 0;
    if (value > maxRateInterest) {
      toast.error(`${t("interestRate")} ${t("cannotExceed")} ${maxRateInterest}%`);
      value = maxRateInterest;
    }
    setInterestRate(value);
  };

  const handleInputChangeforDownPayment = (event) => {
    let value = parseFloat(event.target.value.trim()) || 0;

    if (downPaymentType === "price") {
      if (value > propertyPriceInCalcCurrency) {
        toast.error(
          `${t("downPayment")} ${t("cannotExceed")} ${t("propertyPriceOf")} ${calcCurrency === "USD" ? "$" : "RD$"}${Math.round(propertyPriceInCalcCurrency).toLocaleString()}`,
        );
        value = propertyPriceInCalcCurrency;
      }
    } else if (downPaymentType === "rate") {
      if (value > 100) {
        toast.error(`${t("downPaymentRate")} ${t("cannotExceed")} 100%`);
        value = 100;
      }
    }

    setDownPayment(value);
  };

  const calculatedDownPayment =
    downPaymentType === "price"
      ? downPayment
      : (downPayment / 100) * propertyPriceInCalcCurrency;

  const handleInputChangeforYear = (event) => {
    let value = parseInt(event.target.value.trim(), 10) || 1;
    if (value > maxInterestYears) {
      toast.error(`${t("loanTerm")} ${t("cannotExceed")} ${maxInterestYears} ${t("years")}`);
      value = maxInterestYears;
    } else if (value < 1) {
      toast.error(`${t("loanTerm")} ${t("mustBeAtLeast")} 1 ${t("year")}`);
      value = 1;
    }
    setYears(value);
  };

  const fetchLoanCalculation = async (isFeatureAvailable) => {
    try {
      const res = await mortgageCalculationApi({
        loan_amount: Math.round(propertyPriceInCalcCurrency),
        down_payment: calculatedDownPayment > 0 ? Math.round(calculatedDownPayment) : "",
        interest_rate: interestRate,
        loan_term_years: years,
        show_all_details: isFeatureAvailable ? 1 : "",
      });
      if (!res?.error) {
        setTotalEmiData(res.data.main_total);
        setTotalEmiYearlyData(res.data.yearly_totals);
        setShowModal(true);
      }
    } catch (error) {
      console.error("Error fetching loan calculation:", error);
    }
  };

  const handleCalculate = async () => {
    if (!userCurrentId) {
      showLoginSwal("oops", "plzLogFirsttoAccess", () => {
        setShowLoginModal(true)
      }, t)
      return;
    }
    if (
      downPaymentType === "price" &&
      (downPayment < 0 || downPayment >= propertyPriceInCalcCurrency)
    ) {
      toast.error(
        `${t("downPayment")} ${t("shouldBeLessThan")} ${calcCurrency === "USD" ? "$" : "RD$"}${Math.round(propertyPriceInCalcCurrency).toLocaleString()}`,
      );
      return;
    }

    if (downPaymentType === "rate" && (downPayment < 0 || downPayment > 100)) {
      toast.error(`${t("downPaymentRateShouldBeBetween0And100")}`);
      return;
    }

    if (interestRate < minRateInterest || interestRate > maxRateInterest) {
      toast.error(
        `${t("interestRate")} ${t("shouldBeBetween")} ${minRateInterest}% ${t("and")} ${maxRateInterest}%`,
      );
      return;
    }

    if (years < 1 || years > maxInterestYears) {
      toast.error(
        `${t("loanTerm")} ${t("shouldBeBetween")} 1 ${t("and")} ${maxInterestYears} ${t("years")}`,
      );
      return;
    }

    try {
      const res = await checkPackageLimitApi({
        type: PackageTypes.MORTGAGE_CALCULATOR_DETAIL,
      });

      const { feature_available } = res?.data;
      fetchLoanCalculation(feature_available);
    } catch (error) {
      console.error("Error in package limit check:", error);
      toast.error(t("unexpectedErrorOccurred"));
    }
  };

  const TotalEMIData = [
    { name: "Principal Amount", value: totalEmiData?.principal_amount },
    { name: "Interest Payable", value: totalEmiData?.payable_interest },
  ];

  const COLORS = [themeColor, "#282f39"];

  const priceDisplay = getDualPriceDisplay(propertyDetails?.price, propertyCurrency, exchangeRate);

  return (
    <div className="cardBg newBorder flex flex-col gap-4 border rounded-2xl">
      <div className="blackTextColor border-b p-5 text-base font-bold md:text-lg">
        {t("MLC")}
      </div>
      <div className="px-5">
        <p className="blackTextColor text-sm font-semibold">
          {t("propertyLoanAmount")}
        </p>
        <p className="primaryColor text-lg font-bold">
          {formatPriceAbbreviated(propertyDetails?.price)}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {priceDisplay.mainPriceString} {priceDisplay.convertedPriceString}
        </p>
      </div>
      <div className="flex flex-col gap-4 px-5 pb-5">
        {/* Financial Entity Selector */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">
            {t("financialEntity") || "Financial Entity"}
          </label>
          <div className="flex min-h-12 gap-2">
            <Select value={entityType} onValueChange={(v) => { setEntityType(v); setSelectedEntityId(""); }}>
              <SelectTrigger className="cardBorder min-h-12 w-[40%] rounded-lg px-3">
                <SelectValue placeholder={t("type") || "Type"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank">{t("bank") || "Bank"}</SelectItem>
                <SelectItem value="cooperative">{t("cooperative") || "Cooperative"}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedEntityId} onValueChange={setSelectedEntityId} disabled={!entityType}>
              <SelectTrigger className="cardBorder min-h-12 w-[60%] rounded-lg px-3">
                <SelectValue placeholder={t("selectEntity") || "Select entity"} />
              </SelectTrigger>
              <SelectContent>
                {entities
                  .filter((e) => e._type === entityType)
                  .map((e) => (
                    <SelectItem key={`${e._type}-${e.id}`} value={String(e.id)}>
                      {e.name} ({e.interest_rate}%)
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          {selectedEntity && (
            <p className="text-xs text-gray-400">
              {selectedEntity.name} &mdash; {t("rate")}: {selectedEntity.interest_rate}% ({selectedEntity.currency})
              {selectedEntity.primary_advisor && ` | ${selectedEntity.primary_advisor.name}: ${selectedEntity.primary_advisor.email}`}
            </p>
          )}
        </div>

        {/* Calculation Currency */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">
            {t("calcCurrency") || "Calculate in"}
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setCalcCurrency("USD")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                calcCurrency === "USD"
                  ? "brandBg primaryTextColor border-transparent"
                  : "cardBorder brandColor hover:bg-gray-50"
              }`}
            >
              USD ($)
            </button>
            <button
              onClick={() => setCalcCurrency("DOP")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                calcCurrency === "DOP"
                  ? "brandBg primaryTextColor border-transparent"
                  : "cardBorder brandColor hover:bg-gray-50"
              }`}
            >
              DOP (RD$)
            </button>
          </div>
          {calcCurrency !== propertyCurrency && (
            <p className="text-xs text-amber-500">
              {t("convertedFrom") || "Converted from"} {propertyCurrency}: {calcCurrency === "USD" ? "$" : "RD$"}{Math.round(propertyPriceInCalcCurrency).toLocaleString()}
              &nbsp;(rate: {exchangeRate.toFixed(2)})
            </p>
          )}
        </div>

        {/* Down Payment */}
        <div className="flex flex-col gap-2">
          <label htmlFor="downPayment" className="text-sm font-medium">
            {t("downPayment")}
          </label>
          <div className="flex min-h-12">
            <span className="blackBgColor primaryTextColor flex min-w-[72px] items-center justify-center rounded-bl rounded-tl px-4 text-base font-bold">
              {downPaymentType === "price" ? (calcCurrency === "USD" ? "$" : "RD$") : "%"}
            </span>
            <input
              id="downPayment"
              type="number"
              min={0}
              className="cardBorder primaryBackgroundBg placeholder:brandColor w-full px-4 py-2 placeholder:text-xs focus:outline-none sm:placeholder:text-sm md:placeholder:text-base"
              placeholder={`${t("EnterDownPayment")} ${downPaymentType === "rate" ? t("rate") : t("price")}`}
              value={downPayment}
              max={propertyPriceInCalcCurrency}
              onChange={(e) => handleInputChangeforDownPayment(e)}
            />
            <Select value={downPaymentType} onValueChange={setDownPaymentType}>
              <SelectTrigger className="cardBorder w-[80px] min-h-12 rounded-bl-none rounded-tl-none rounded-br rounded-tr px-3 focus:outline-none focus:ring-0">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="!min-w-fit">
                <SelectItem value="price">{calcCurrency === "USD" ? "$" : "RD$"}</SelectItem>
                <SelectItem value="rate">%</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Interest Rate */}
        <div className="flex flex-col gap-2">
          <label htmlFor="interestRate" className="blackTextColor text-sm font-medium">
            {t("interestRate")}
          </label>
          <div className="flex min-h-12">
            <span className="blackBgColor primaryTextColor flex min-w-[72px] items-center justify-center rounded-bl rounded-tl px-4 text-base font-bold">%</span>
            <input
              type="number"
              min={minRateInterest}
              id="interestRate"
              className="cardBorder primaryBackgroundBg placeholder:brandColor w-full rounded-e px-4 py-2 placeholder:text-xs focus:outline-none sm:placeholder:text-sm md:placeholder:text-base"
              placeholder={t("enterIntrestRate")}
              value={interestRate}
              onChange={handleInputChangeforInterest}
              max={maxRateInterest}
            />
          </div>
        </div>

        {/* Loan Term */}
        <div className="flex flex-col gap-2">
          <label htmlFor="loanTenure" className="blackTextColor text-sm font-medium">
            {t("tenures")}
          </label>
          <div className="flex min-h-12">
            <span className="blackBgColor primaryTextColor flex min-w-[72px] items-center justify-center rounded-bl rounded-tl px-4 text-base font-bold">
              {t("yrs")}
            </span>
            <input
              type="number"
              id="loanTenure"
              className="cardBorder primaryBackgroundBg placeholder:brandColor w-full rounded-e px-4 py-2 placeholder:text-xs focus:outline-none sm:placeholder:text-sm md:placeholder:text-base"
              placeholder={t("enterYears")}
              value={years}
              onChange={handleInputChangeforYear}
              min={1}
              max={maxInterestYears}
            />
          </div>
        </div>

        {/* Calculate Button */}
        <div>
          <button
            onClick={handleCalculate}
            className="brandBg primaryTextColor w-full rounded-lg py-3 text-sm font-medium"
          >
            {t("calculate")}
          </button>
        </div>
      </div>
      {showModal && (
        <EMIModal
          show={showModal}
          TotalEMIData={TotalEMIData}
          data={totalEmiData}
          handleClose={() => setShowModal(false)}
          COLORS={COLORS}
          totalEmiYearlyData={totalEmiYearlyData}
          router={router}
          userCurrentId={userCurrentId}
          showLoginModal={showLoginModal}
          setShowLoginModal={setShowLoginModal}
        />
      )}
    </div>
  );
};

export default MortgageLoanCalculator;
