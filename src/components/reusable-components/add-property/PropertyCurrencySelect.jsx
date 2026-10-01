import React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTranslation } from '@/components/context/TranslationContext'
import { PROPERTY_CURRENCIES } from '@/lib/currencyOptions'

// Selector de moneda del precio. Define en que moneda esta expresado el
// `price` de la propiedad (columna propertys.currency).
const PropertyCurrencySelect = ({ value, onChange, name = 'propertyCurrency' }) => {
    const t = useTranslation()

    return (
        <div className="w-full min-w-[140px] max-w-[200px] space-y-2">
            <Select value={value || 'USD'} onValueChange={(val) => onChange(val, name)} className="primaryBackgroundBg">
                <SelectTrigger className="!py-5 border-none focus:ring-0 primaryBackgroundBg text-gray-500">
                    <SelectValue placeholder={t('selectCurrency') || 'Select Currency'} />
                </SelectTrigger>
                <SelectContent className="primaryBackgroundBg text-gray-500">
                    {PROPERTY_CURRENCIES.map((c) => (
                        <SelectItem key={c.code} className="hover:cursor-pointer" value={c.code}>
                            {t(c.labelKey) || c.fallback}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}
export default PropertyCurrencySelect