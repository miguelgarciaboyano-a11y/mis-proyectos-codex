# Cartilla vacunal

## Estado y bloqueo de fuentes

Cuarto apartado en la aplicación principal. Incluye texto pegado, fotografía con OCR local, transcripción revisable, fecha de nacimiento/consulta, edad de cada administración, agrupación documental y resumen copiable. La página independiente otitis.html sigue mostrando solo Otitis.

**La comparación clínica de vacunas pendientes con AEP y Madrid NO está implementada/activada como recomendador.** El 17/10/2026, las peticiones a vacunasaep.org/documentos/manual/cap-11 y comunidad.madrid/servicios/salud/vacunas devolvieron HTTP 403 desde este entorno. El usuario confirmó que la referencia es el Manual de Vacunas de la AEP. Se solicitaron calendarios vigentes y pautas de rescate oficiales, incluidas excepciones, para poder incorporar reglas trazables. No se ha sustituido ese paso por conocimiento del modelo ni se han inventado reglas de 2026.

Las dos tarjetas separan organismo, enlace y estado, con «NO EVALUADO». No hay resultados de cobertura, pauta completa, vacunas que faltan ni prescripciones. `vaccine-protocols.js` es un bloqueo de seguridad/estado de fuentes, no un motor de rescate ya validado. Al aportar los documentos habrá que implementar y contrastar las reglas: edades mínimas/máximas, intervalos, producto/valencia, dosis según edad de inicio, calendarios acelerados, cohortes, campañas y condiciones especiales. No basta el cartel de un calendario sistemático para deducir todo un rescate.

## Transcripción documental

El texto debe ser un registro de dosis administradas, no una tabla de recomendaciones. El parser local reconoce denominaciones y algunos preparados frecuentes, conserva sus productos y requiere comprobación de cada fila frente al original. Una combinada se desglosa por grupos para presentar el historial, sin convertirla automáticamente en varias dosis clínicas válidas. No se presupone equivalencia entre productos, formulaciones, valencias o campañas. Nirsevimab se identifica como inmunización frente a VRS, no como vacuna.

Solo se aceptan fechas completas ISO o día/mes/año con cuatro cifras de año. No se adivinan siglos, fechas manuscritas ni fechas a partir de «2 meses» o una edad recomendada. Varios preparados con varias fechas en una línea quedan sin asignar, evitando emparejarlos por conjetura. Preparados ambiguos como «pentavalente» sin composición, fechas imposibles y texto no reconocido permanecen visibles para revisión; no se eliminan silenciosamente ni se asumen como ausencia de vacunación.

El profesional puede corregir preparado, producto y fecha, añadir/eliminar registros y marcar cada transcripción como comprobada. Una edición retira esa marca. «Comprobado» no significa dosis clínicamente válida. Se advierten fechas previas al nacimiento, posteriores a la consulta, referencias incoherentes y solapamientos de componentes en la misma fecha. El recuento de transcripciones no equivale a dosis válidas.

Edad cronológica: días UTC y meses completos de calendario, con ajuste al último día del mes al sumar meses (por ejemplo, 29/02/2024 +12 meses =28/02/2025). No se usan meses de 30 días ni se redondea la edad para dar validez a una dosis. Las fechas y edades se conservan por administración. Límites: 50 000 caracteres y 200 registros.

## Fotografía y privacidad

JPG, PNG o WebP hasta 8 MB y 24 megapíxeles. Se admite giro local de 90°. La imagen se decodifica en el navegador, se reduce a un máximo de 2400 píxeles por lado, se presenta sin metadatos EXIF y se reconoce en un Worker local. Es OCR de español para texto legible: no garantiza reconocer manuscritos, sellos o estructura de tablas. El texto vuelve a un campo editable; no crea dosis comprobadas automáticamente. La lectura se puede cancelar y tiene límite de tiempo.

El motor Tesseract.js/Core 7 y el modelo español están alojados en vendor/ocr, con versiones fijadas, licencias e integridades. No hay CDN, API de IA, servicio OCR externo ni subida de cartillas. Las peticiones descargan solo archivos estáticos; la imagen se pasa al Worker por postMessage. Se verificó OCR real con una foto sintética y ausencia de peticiones externas o POST. No hay localStorage, sessionStorage ni IndexedDB: la caché de idioma está desactivada. Solo la caché HTTP de los archivos públicos del motor puede persistir. Código/datos/modelo ocupan aproximadamente 14 MB; solo se cargan al solicitar OCR.

La CSP del index permite Workers e imágenes blob del propio navegador, WebAssembly y carga de archivos del mismo origen (`connect-src self`); no autoriza conexiones a terceros ni ejecución de texto clínico. otitis.html conserva su política previa porque no incluye OCR.

## Resumen y límites

Agrupa registros por grupo vacunal, con producto, fecha y edad; distingue transcripción comprobada de filas pendientes y declara que AEP/Madrid no se han evaluado. No copia nombres, texto sin asignar ni identificadores del original al resumen. No certifica protección ni da un plan de vacunas pendiente. Las ediciones manuales se conservan; tras cambiar registros hay que actualizar el resumen antes de copiar. Un cambio del texto de origen se avisa para contrastar la tabla. Los datos viven solo en la memoria de esta pestaña y se pierden al cerrar/recargar/reiniciar.

## Validación técnica

14 pruebas unitarias de fechas, bisiestos, edades, combinadas, productos/valencias, líneas ambiguas, fechas incompletas, anomalías, solapamientos, VRS, límites, bloqueo por falta de fuentes e integridad de archivos. Chromium recorre pegado, revisión y corrección, informe/copia, navegación/reinicio, entrada maliciosa sin ejecución, formatos de imagen rechazados, cancelación y OCR real local, CSP, ausencia de almacenamiento y envío, accesibilidad y cuatro anchos. Estas pruebas no validan clínicamente pautas ni recomendaciones, que siguen pendientes de fuentes.

### Lectura local por zonas
La foto puede girarse y recortarse mediante límites porcentuales referidos a la imagen girada. «Ver recorte y ajustes» muestra exactamente la región que recibirá el OCR. Se ofrece contraste en escala de grises y segmentación de bloque, texto disperso o línea única. Cada lectura añade texto editable; no relaciona automáticamente columnas de una tabla ni confirma manuscritos. Restablecer muestra la imagen completa. No se envían fotos ni texto a servicios externos.
Estas mejoras facilitan la revisión manual; no garantizan transcripción perfecta. La prueba automatizada usa texto impreso sintético, no valida las fotos manuscritas aportadas por el usuario.
