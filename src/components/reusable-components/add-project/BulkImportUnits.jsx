import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { FaFileCsv, FaFileExcel, FaTimes, FaCheck, FaExclamationTriangle, FaUpload, FaDownload, FaPlus } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/components/context/TranslationContext";
import { previewImportUnitsApi, bulkImportUnitsApi } from "@/api/apiRoutes";
import toast from "react-hot-toast";

const BulkImportUnits = ({ projectId, onImportComplete }) => {
    const t = useTranslation();
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [importing, setImporting] = useState(false);
    const [validationErrors, setValidationErrors] = useState([]);

    const onDrop = useCallback((acceptedFiles) => {
        const f = acceptedFiles[0];
        if (f) {
            setFile(f);
            setPreview(null);
            setValidationErrors([]);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "text/csv": [".csv"],
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
            "application/vnd.ms-excel": [".xls"],
        },
        multiple: false,
    });

    const handlePreview = async () => {
        if (!file) {
            toast.error(t("pleaseSelectFileFirst"));
            return;
        }

        setLoading(true);
        try {
            const res = await previewImportUnitsApi(projectId, file);
            if (!res.error) {
                setPreview(res.data);
                setValidationErrors(res.data.errors || []);
                if (res.data.errors?.length > 0) {
                    toast.warning(`${res.data.errors.length} row(s) have validation errors`);
                } else {
                    toast.success(`${res.data.valid_rows} row(s) ready to import`);
                }
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || error.message || t("somethingWentWrong"));
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async () => {
        if (!file) return;

        setImporting(true);
        try {
            const res = await bulkImportUnitsApi(projectId, file);
            if (!res.error) {
                toast.success(res.message);
                setFile(null);
                setPreview(null);
                setValidationErrors([]);
                if (onImportComplete) {
                    onImportComplete();
                }
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || error.message || t("somethingWentWrong"));
        } finally {
            setImporting(false);
        }
    };

    const handleReset = () => {
        setFile(null);
        setPreview(null);
        setValidationErrors([]);
    };

    const fileIcon = file?.name?.endsWith(".csv") ? FaFileCsv : FaFileExcel;

    return (
        <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-800">
                    {t("bulkImportUnits")}
                </h3>
                <a
                    href="/sample-import.csv"
                    download
                    className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700"
                >
                    <FaDownload size={12} />
                    {t("downloadSample")}
                </a>
            </div>

            {!file ? (
                <div
                    {...getRootProps()}
                    className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
                        isDragActive ? "border-teal-400 bg-teal-50" : "border-gray-300 hover:border-gray-400"
                    }`}
                >
                    <input {...getInputProps()} />
                    <FaUpload className="mb-2 text-gray-400" size={24} />
                    <p className="text-sm text-gray-500">
                        {isDragActive ? t("dropToUpload") : t("dragDropCsvExcel")}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">CSV, XLSX, XLS — {t("maxSize")} 5MB</p>
                </div>
            ) : (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-gray-600">{fileIcon}</span>
                            <div>
                                <p className="text-sm font-medium text-gray-700">{file.name}</p>
                                <p className="text-xs text-gray-500">
                                    {(file.size / 1024).toFixed(1)} KB
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleReset}
                            className="rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                        >
                            <FaTimes size={14} />
                        </button>
                    </div>
                </div>
            )}

            {validationErrors.length > 0 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <div className="mb-2 flex items-center gap-1 text-sm font-medium text-amber-800">
                        <FaExclamationTriangle size={14} />
                        {validationErrors.length} {t("validationErrors")}
                    </div>
                    <ul className="max-h-32 space-y-1 overflow-y-auto">
                        {validationErrors.map((err, i) => (
                            <li key={i} className="text-xs text-amber-700">
                                {t("row")} {err.row} ({err.title}): {err.errors.join(", ")}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {preview && preview.preview?.length > 0 && (
                <div className="max-h-48 overflow-y-auto rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200 text-xs">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-2 py-1.5 text-left font-medium text-gray-500">#</th>
                                <th className="px-2 py-1.5 text-left font-medium text-gray-500">{t("title")}</th>
                                <th className="px-2 py-1.5 text-left font-medium text-gray-500">{t("unitCode")}</th>
                                <th className="px-2 py-1.5 text-right font-medium text-gray-500">{t("price")}</th>
                                <th className="px-2 py-1.5 text-right font-medium text-gray-500">{t("total")}</th>
                                <th className="px-2 py-1.5 text-center font-medium text-gray-500">{t("status")}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {preview.preview.map((row, i) => (
                                <tr key={i} className={row.exists ? "bg-blue-50" : ""}>
                                    <td className="px-2 py-1 text-gray-500">{row.row}</td>
                                    <td className="px-2 py-1 font-medium text-gray-700">{row.title}</td>
                                    <td className="px-2 py-1 text-gray-600">{row.unit_code || "-"}</td>
                                    <td className="px-2 py-1 text-right text-gray-600">
                                        {row.price ? `${row.currency} ${Number(row.price).toLocaleString()}` : "-"}
                                    </td>
                                    <td className="px-2 py-1 text-right text-gray-600">{row.total_units || "-"}</td>
                                    <td className="px-2 py-1 text-center">
                                        {row.exists ? (
                                            <span className="inline-flex items-center gap-0.5 text-blue-600">
                                                <FaCheck size={10} /> {t("update")}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-0.5 text-green-600">
                                                <FaPlus size={10} /> {t("new")}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="flex justify-end gap-2">
                {file && !preview && (
                    <Button
                        type="button"
                        onClick={handlePreview}
                        disabled={loading}
                        className="rounded-md border border-gray-300 bg-white px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                        {loading ? t("previewing") : t("preview")}
                    </Button>
                )}
                {preview && validationErrors.length === 0 && (
                    <Button
                        type="button"
                        onClick={handleImport}
                        disabled={importing}
                        className="rounded-md bg-teal-600 px-4 py-1.5 text-sm text-white hover:bg-teal-700"
                    >
                        {importing ? t("importing") : t("confirmImport")}
                    </Button>
                )}
            </div>
        </div>
    );
};

export default BulkImportUnits;
