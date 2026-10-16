# Validación técnica realizada

Fecha: 2026-10-16. Entorno: Node 24.19.0, npm 11.9.0, Python 3.12.14, Chromium del sistema, Playwright 1.62.1 y axe-core/playwright 4.11.1. Todos los datos introducidos por las pruebas son ficticios. No se han usado historias clínicas reales.

## Comandos y resultados

| Comprobación | Resultado |
|---|---|
| `npm ci --ignore-scripts --no-audit --no-fund --cache /tmp/consulta-npm-cache` | Instalación reproducida desde lockfile, 4 paquetes de desarrollo |
| `npm run check` | Sintaxis correcta de los 8 módulos JavaScript |
| `npm test` | **42 pruebas aprobadas**, 0 fallidas, 0 omitidas |
| `npm start` y petición HTTP local | Servidor estático iniciado, HTTP 200 y aplicación cargada en Chromium |
| `npm run test:browser` | Recorrido integral completado; sin errores JavaScript ni solicitudes externas |
| axe WCAG 2 A/AA y 2.1 AA | 0 infracciones detectadas en pantalla inicial y seguimiento con secciones abiertas; no equivale a auditoría manual completa |
| `python3 scripts/build-who.py` | Hashes SHA-256 de las seis tablas comprobados; generación local correcta |

Las capturas del recorrido se generan en `test-results/desktop.png` y `test-results/width-{1024,768,390}.png`, sin añadirlas a Git. Los informes automatizados de accesibilidad se guardan en el mismo directorio, ignorado por Git. Las pruebas preservan los fallos mediante código de salida no cero; no cuentan como éxito suites vacías.

## Capacidades demostradas

- Primera consulta parcial: nota con datos efectivamente introducidos, sin negaciones ni exploraciones inventadas. Una frecuencia cero seleccionada se conserva; un campo vacío no se convierte en cero.
- Seguimiento con tratamiento: respuesta, cobertura, adherencia y evolución funcional registradas. RAM iniciales sin revisar diferenciadas de negativas confirmadas; al editar una RAM se revoca la confirmación y se muestran sus detalles si es positiva.
- Propuestas: datos insuficientes, adherencia desconocida, falta de cribado cardiovascular, constantes pendientes, rebote no valorado y ausencia de objetivos bloquean el ajuste orientativo. Se prioriza valoración ante cribado cardiovascular positivo, constantes por revisar o ideas autolesivas. Las reglas de metilfenidato no se aplican a otro principio activo.
- La propuesta requiere aceptación explícita antes de aparecer en el plan. Cambiar datos invalida la aceptación. No se introducen dosis ni conversiones. La nota ya editada se conserva y se advierte que debe actualizarse.
- Nota: creación con información parcial, edición manual, cancelación de regeneración sin perder cambios y reemplazo confirmado. Copiado real contrastado con la API del portapapeles en Chromium. La alternativa manual para navegadores que lo denieguen está implementada; no se ha simulado la denegación en el recorrido.
- Vanderbilt: dos registros de familiares y dos de docentes como máximo, límites distintos por versión, valores vacíos no convertidos en resultados negativos. Las pruebas no afirman una interpretación diagnóstica ni validan puntuación por ítems, que no se implementa.
- IMC: kg/cm, ausencia de datos, ceros/negativos y valores dudosos conservados con advertencias. Diferencias entre mediciones solo cuando la fecha actual es posterior.
- Percentiles: tablas LMS oficiales, ambos sexos, medianas, ejemplos publicados en tests OMS, interpolación, extensión de colas, límites de edad, técnica de medida, edema y supresión ante datos insuficientes/extremos. Detalles en [PERCENTILES.md](PERCENTILES.md). No hay percentiles OMS de TA/FC.
- Exportación JSON real y transferencia por selección y confirmación del mismo caso. Se trasladan las bases de objetivos sin su evolución, tratamiento y mediciones previas, sin convertirlas en actuales ni importar valoraciones/RAM/decisiones.
- Importaciones incompatibles o demasiado grandes rechazadas; campos no admitidos descartados. HTML introducido/importado se muestra como texto, no como elementos ejecutables.
- Reinicio elimina el estado de consulta, la nota y el archivo importado pendiente de esta pestaña. No promete eliminar descargas ni portapapeles.
- Navegación nativa por teclado (Enter en secciones plegables), controles etiquetados, aviso vivo de acciones y contraste comprobado. Sin desbordamiento horizontal a 1024, 768 y 390 px.
- Sin cookies, localStorage o sessionStorage; sin peticiones a servicios externos durante el recorrido funcional. Exportar/importar es explícito y local.

## Límites de esta evidencia

Es una verificación técnica del prototipo, no una validación clínica ni una certificación WCAG. Pendientes: revisión profesional de reglas/notas y percentiles, otros navegadores, lector de pantalla, circuito asistencial real, clasificación Vanderbilt, fuentes Conners, referencias TA/FC y actualización farmacológica mediante fichas técnicas oficiales. No hay diagnóstico automático ni prescripción validada.

La configuración reutilizable de nube contiene `install_script` y `start_skill` guardados como borrador. Guardar ese borrador no ejecuta ni publica la configuración. La instancia actual se ha probado; no se afirma haber verificado restauración en una tarea nueva ni publicación del entorno.
