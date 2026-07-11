import Image from 'next/image'
import SomethingWentWrongImg from '@/assets/something_went_wrong.svg'
import { useTranslation } from '../context/TranslationContext'

const SomethingWentWrong = () => {
  const t = useTranslation()
  return (
    <div className='flex flex-col items-center justify-center h-screen'>
      <Image src={SomethingWentWrongImg} alt={t("somethingWentWrong")} width={500} height={500} loading='eager' priority />
      <h1 className='text-2xl font-bold'>{t("somethingWentWrong")}</h1>
      <p className='text-gray-500'>{t("pleaseTryAgainLater")}</p>
    </div>
  )
}

export default SomethingWentWrong