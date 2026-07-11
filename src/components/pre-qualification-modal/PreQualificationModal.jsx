"use client";
import { useEffect, useState } from "react";
import { useTranslation } from "../context/TranslationContext";
import { useSelector } from "react-redux";
import {
  getBanksApi,
  getCooperativesApi,
  getFinancialAdvisorsApi,
  submitPreQualificationApi,
} from "@/api/apiRoutes";
import { X, Upload, ChevronLeft, ChevronRight, Check } from "lucide-react";
import toast from "react-hot-toast";

const STEPS = ["entity", "documents", "income", "review"];

const STEP_LABELS = {
  entity: "Financial Entity",
  documents: "Documents",
  income: "Income",
  review: "Review",
};

const DOCUMENT_TYPES = [
  { key: "bank_statements", label: "Bank Statements (3 months)", accept: ".pdf,.jpg,.jpeg,.png", multiple: true },
  { key: "paystubs", label: "Pay Stubs / Checks", accept: ".pdf,.jpg,.jpeg,.png", multiple: true },
  { key: "taxes", label: "Tax Returns (2 years)", accept: ".pdf,.jpg,.jpeg,.png", multiple: true },
  { key: "passport", label: "Passport", accept: ".pdf,.jpg,.jpeg,.png", multiple: false },
  { key: "license_id", label: "License / ID", accept: ".pdf,.jpg,.jpeg,.png", multiple: false },
];

const PreQualificationModal = ({ isOpen, onClose, projectDetails }) => {
  const t = useTranslation();
  const user = useSelector((state) => state.User);
  const [currentStep, setCurrentStep] = useState(0);
  const [banks, setBanks] = useState([]);
  const [cooperatives, setCooperatives] = useState([]);
  const [advisors, setAdvisors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    entityType: "App\\Models\\Bank",
    entityId: "",
    advisorId: "",
    currency: "DOP",
    monthlyIncome: "",
    notes: "",
    documents: [],
  });

  const [uploadedFiles, setUploadedFiles] = useState({});

  useEffect(() => {
    if (isOpen) {
      loadEntities();
      setCurrentStep(0);
      setSuccess(false);
      setFormData({
        entityType: "App\\Models\\Bank",
        entityId: "",
        advisorId: "",
        currency: "DOP",
        monthlyIncome: "",
        notes: "",
        documents: [],
      });
      setUploadedFiles({});
    }
  }, [isOpen]);

  const loadEntities = async () => {
    setLoading(true);
    try {
      const [banksRes, coopsRes] = await Promise.all([
        getBanksApi(),
        getCooperativesApi(),
      ]);
      setBanks(banksRes?.data || []);
      setCooperatives(coopsRes?.data || []);
    } catch (e) {
      console.error("Failed to load entities", e);
    } finally {
      setLoading(false);
    }
  };

  const loadAdvisors = async (entityType, entityId) => {
    try {
      const res = await getFinancialAdvisorsApi({
        entity_type: entityType,
        entity_id: entityId,
      });
      setAdvisors(res?.data || []);
    } catch (e) {
      setAdvisors([]);
    }
  };

  const handleEntityChange = (type, id) => {
    setFormData({ ...formData, entityType: type, entityId: id, advisorId: "" });
    if (type && id) {
      loadAdvisors(type, id);
    } else {
      setAdvisors([]);
    }
  };

  const handleFileChange = (type, files) => {
    setUploadedFiles({ ...uploadedFiles, [type]: files });
  };

  const removeFile = (type, index) => {
    const current = [...(uploadedFiles[type] || [])];
    current.splice(index, 1);
    setUploadedFiles({ ...uploadedFiles, [type]: current });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("project_id", projectDetails?.id || "");
      fd.append("property_id", formData.propertyId || "");
      fd.append("financial_entity_type", formData.entityType);
      fd.append("financial_entity_id", formData.entityId);
      fd.append("financial_advisor_id", formData.advisorId);
      fd.append("currency", formData.currency);
      fd.append("monthly_income", formData.monthlyIncome || "");
      fd.append("notes", formData.notes || "");

      let docIndex = 0;
      Object.entries(uploadedFiles).forEach(([type, files]) => {
        if (files && files.length > 0) {
          Array.from(files).forEach((file) => {
            fd.append(`documents[${docIndex}][type]`, type);
            fd.append(`documents[${docIndex}][file]`, file);
            docIndex++;
          });
        }
      });

      const res = await submitPreQualificationApi(fd);
      if (res && !res.error) {
        setSuccess(true);
        toast.success(t("preQualificationSubmitted"));
      } else {
        toast.error(res?.message || t("somethingWentWrong"));
      }
    } catch (e) {
      toast.error(e?.message || t("somethingWentWrong"));
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const entities = formData.entityType === "App\\Models\\Bank" ? banks : cooperatives;
  const selectedEntity = entities.find((e) => e.id === formData.entityId);
  const currentStepKey = STEPS[currentStep];
  const isLastStep = currentStep === STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  const canProceed = () => {
    switch (currentStepKey) {
      case "entity":
        return !!formData.entityId;
      case "documents":
        return true;
      case "income":
        return true;
      case "review":
        return true;
      default:
        return false;
    }
  };

  const renderEntitySelection = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">{t("entityType")}</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleEntityChange("App\\Models\\Bank", "")}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
              formData.entityType === "App\\Models\\Bank"
                ? "bg-primary text-white border-primary"
                : "bg-white text-gray-600 border-gray-300 hover:border-primary"
            }`}
          >
            {t("bank")}
          </button>
          <button
            type="button"
            onClick={() => handleEntityChange("App\\Models\\Cooperative", "")}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
              formData.entityType === "App\\Models\\Cooperative"
                ? "bg-primary text-white border-primary"
                : "bg-white text-gray-600 border-gray-300 hover:border-primary"
            }`}
          >
            {t("cooperative")}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          {formData.entityType === "App\\Models\\Bank" ? t("selectBank") : t("selectCooperative")}
        </label>
        <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
          {entities.map((entity) => (
            <button
              key={entity.id}
              type="button"
              onClick={() => handleEntityChange(formData.entityType, entity.id)}
              className={`w-full text-left px-4 py-3 rounded-lg border transition ${
                formData.entityId === entity.id
                  ? "bg-primary/5 border-primary ring-1 ring-primary"
                  : "bg-white border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="font-medium">{entity.name}</div>
              {entity.interest_rate && (
                <div className="text-sm text-gray-500">
                  {t("interestRate")}: {entity.interest_rate}%
                </div>
              )}
              {entity.primary_advisor && (
                <div className="text-xs text-gray-400 mt-1">
                  {t("advisor")}: {entity.primary_advisor.name}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {advisors.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-1">{t("selectAdvisor")}</label>
          <div className="space-y-2">
            {advisors.map((advisor) => (
              <label key={advisor.id} className="flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="advisor"
                  checked={formData.advisorId === advisor.id}
                  onChange={() => setFormData({ ...formData, advisorId: advisor.id })}
                  className="text-primary"
                />
                <div>
                  <div className="text-sm font-medium">{advisor.name}</div>
                  <div className="text-xs text-gray-400">{advisor.email}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">{t("currency")}</label>
        <select
          value={formData.currency}
          onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
        >
          <option value="DOP">DOP (RD$)</option>
          <option value="USD">USD ($)</option>
        </select>
      </div>
    </div>
  );

  const renderDocumentUpload = () => (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">{t("uploadDocumentsDesc")}</p>
      {DOCUMENT_TYPES.map((docType) => (
        <div key={docType.key} className="border rounded-lg p-3">
          <label className="block text-sm font-medium mb-1">{docType.label}</label>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 border text-sm">
              <Upload size={16} />
              {t("chooseFile")}
              <input
                type="file"
                accept={docType.accept}
                multiple={docType.multiple}
                className="hidden"
                onChange={(e) => handleFileChange(docType.key, e.target.files)}
              />
            </label>
          </div>
          {uploadedFiles[docType.key] && uploadedFiles[docType.key].length > 0 && (
            <div className="mt-2 space-y-1">
              {Array.from(uploadedFiles[docType.key]).map((file, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                  <span className="truncate">{file.name}</span>
                  <button type="button" onClick={() => removeFile(docType.key, idx)} className="text-red-500 hover:text-red-700 ml-2">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderIncome = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">{t("monthlyIncome")}</label>
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold">{formData.currency === "DOP" ? "RD$" : "$"}</span>
          <input
            type="number"
            value={formData.monthlyIncome}
            onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value })}
            placeholder="0.00"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">{t("additionalNotes")}</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
          placeholder={t("notesPlaceholder")}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
        />
      </div>
    </div>
  );

  const renderReview = () => (
    <div className="space-y-4">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
        <Check size={40} className="mx-auto text-green-500 mb-2" />
        <p className="text-sm text-green-700">{t("reviewDesc")}</p>
      </div>
      <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">{t("entityType")}</span>
          <span className="font-medium">{formData.entityType === "App\\Models\\Bank" ? t("bank") : t("cooperative")}</span>
        </div>
        {selectedEntity && (
          <div className="flex justify-between">
            <span className="text-gray-500">{t("entity")}</span>
            <span className="font-medium">{selectedEntity.name}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-gray-500">{t("currency")}</span>
          <span className="font-medium">{formData.currency}</span>
        </div>
        {formData.monthlyIncome && (
          <div className="flex justify-between">
            <span className="text-gray-500">{t("monthlyIncome")}</span>
            <span className="font-medium">{formData.currency === "DOP" ? "RD$" : "$"} {formData.monthlyIncome}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-gray-500">{t("documents")}</span>
          <span className="font-medium">{Object.values(uploadedFiles).filter(f => f?.length > 0).length} {t("categories")}</span>
        </div>
      </div>
      {formData.notes && (
        <div className="bg-gray-50 rounded-lg p-4 text-sm">
          <span className="text-gray-500 block mb-1">{t("notes")}</span>
          <p className="text-gray-700">{formData.notes}</p>
        </div>
      )}
    </div>
  );

  const renderStep = () => {
    switch (currentStepKey) {
      case "entity":
        return renderEntitySelection();
      case "documents":
        return renderDocumentUpload();
      case "income":
        return renderIncome();
      case "review":
        return renderReview();
      default:
        return null;
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-green-600" />
          </div>
          <h3 className="text-xl font-bold mb-2">{t("preQualificationSubmitted")}</h3>
          <p className="text-gray-500 text-sm mb-6">{t("preQualificationSuccessDesc")}</p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90"
          >
            {t("close")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white rounded-t-2xl border-b px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">{t("preQualification")}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 pt-4 pb-2">
          <div className="flex items-center justify-between">
            {STEPS.map((step, idx) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                    idx <= currentStep
                      ? "bg-primary text-white"
                      : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {idx + 1}
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`w-8 h-0.5 mx-1 transition ${
                      idx < currentStep ? "bg-primary" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-center text-gray-400 mt-2">
            {STEP_LABELS[currentStepKey]}
          </p>
        </div>

        <div className="px-6 py-4">{renderStep()}</div>

        <div className="sticky bottom-0 bg-white rounded-b-2xl border-t px-6 py-4 flex justify-between">
          <button
            disabled={isFirstStep}
            onClick={() => setCurrentStep(currentStep - 1)}
            className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition ${
              isFirstStep
                ? "text-gray-300 cursor-not-allowed"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <ChevronLeft size={16} />
            {t("back")}
          </button>

          {isLastStep ? (
            <button
              onClick={handleSubmit}
              disabled={submitting || !canProceed()}
              className="flex items-center gap-1 px-6 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {t("submitting")}
                </span>
              ) : (
                <>
                  {t("submit")}
                  <Check size={16} />
                </>
              )}
            </button>
          ) : (
            <button
              disabled={!canProceed()}
              onClick={() => setCurrentStep(currentStep + 1)}
              className="flex items-center gap-1 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              {t("next")}
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreQualificationModal;
