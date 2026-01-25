<?php

/**
 * Suprimir PHP Deprecation Warnings en Desarrollo
 * 
 * Estos warnings son de librerías externas (vendor) y no afectan la funcionalidad.
 * En producción, APP_DEBUG=false los oculta automáticamente.
 * 
 * Este archivo se carga en bootstrap/app.php para suprimir warnings de forma elegante.
 */

// Función para suprimir warnings específicos
set_error_handler(function ($errno, $errstr, $errfile, $errline, $errcontext = null) {
    // Suprimir solo Deprecated warnings de librerías externas
    if (
        $errno === E_DEPRECATED || 
        $errno === E_USER_DEPRECATED ||
        (strpos($errstr, 'Implicitly marking parameter') !== false && strpos($errfile, '/vendor/') !== false)
    ) {
        // Log del warning sin mostrar
        error_log($errstr . ' in ' . $errfile . ' on line ' . $errline);
        return true; // Suprimir el warning
    }
    
    // Dejar pasar otros errores
    return false;
}, E_DEPRECATED | E_USER_DEPRECATED);

// Alternativa: Configurar error_reporting para ignorar deprecations
if (env('APP_DEBUG', false)) {
    // En desarrollo: Mostrar todos excepto deprecation warnings
    error_reporting(E_ALL & ~E_DEPRECATED & ~E_USER_DEPRECATED);
}
