import { useEffect } from "react";

/**
 * Temporizador de cuenta regresiva reutilizable para OTP.
 * FASE 3 (T2): extraído del monólogo LoginModal.jsx para eliminar dos
 * useEffects de countdown casi idénticos (teléfono y correo).
 *
 * @param {boolean} isCounting - indica si la cuenta regresiva está activa
 * @param {number} timeLeft - tiempo restante en segundos
 * @param {Function} setTimeLeft - setter del tiempo restante
 * @param {Function} setIsCounting - setter del estado de cuenta regresiva
 * @param {boolean} [resetToZero=true] - al llegar a 0, ¿forzar el tiempo a 0?
 */
const useCountdownTimer = (isCounting, timeLeft, setTimeLeft, setIsCounting, resetToZero = true) => {
  useEffect(() => {
    let timer;
    if (isCounting && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      clearInterval(timer);
      if (resetToZero) setTimeLeft(0);
      setIsCounting(false);
    }
    return () => clearInterval(timer);
  }, [isCounting, timeLeft, setTimeLeft, setIsCounting, resetToZero]);
};

export default useCountdownTimer;
