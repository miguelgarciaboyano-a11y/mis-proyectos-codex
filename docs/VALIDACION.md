# Validación técnica realizada

Fecha: 2026-10-16. Entorno: Node 24.19.0, npm 11.9.0, Python 3.12.14, Chromium del sistema, Playwright 1.62.1 y axe-core/playwright 4.11.1. Todos los datos introducidos por las pruebas son ficticios. No se han usado historias clínicas reales.

## Comandos y resultados

| Comprobación | Resultado |
|---|---|
| `npm ci --ignore-scripts --no-audit --no-fund --cache /tmp/consulta-npm-cache` | Instalación reproducida desde lockfile, 4 paquetes de desarrollo |
| `npm run check` | Sintaxis correcta de los 13 módulos JavaScript |
| `npm test` | **60 pruebas aprobadas**, 0 fallidas, 0 omitidas |
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

## Síntesis final: verificación de la versión vigente

`node --test --test-isolation=none tests/*.test.js`: **60 pruebas aprobadas**, 0 fallidas y 0 omitidas: 42 de TDAH/antropometría, 10 de Fiebre y 8 del sintetizador compartido. Sintaxis de los 11 módulos comprobada. Se mantienen las reglas de orientación fuera de la síntesis final; solo pasan al plan opciones aceptadas expresamente.

Pruebas de síntesis: ocho apartados fijos, ausencia de normalidad/negativos/consejos inventados, «Exploración: no aportada», conservación de fechas, cifras y unidades, separación de valoración/plan, minimización de identificadores etiquetados, instrucciones incrustadas que no alteran la salida, y límite de 180 palabras incluso con entradas extensas. Se verifica el aviso de datos no incluidos, sin cortar cantidades ni modificar las fuentes, y sin confundir exclusión por extensión con dato no aportado.

Chromium: recorridos TDAH y Fiebre, generación de síntesis con ocho apartados y ≤180 palabras, datos explícitos y ausencia de plantillas normales, consejos solo tras incorporación expresa, contador y bloqueo de copia con edición manual >180 palabras, cancelación de regeneración sin perder ediciones, traslado entre pestañas sin mezclar consultas, portapapeles, reinicio, avisos de omisión y datos íntegros en el formulario. Sin errores JavaScript. Axe no detectó infracciones WCAG 2 A/AA y 2.1 AA. Se comprobó el bloque compacto de diez síntomas a 1440, 1024, 768 y 390 px de ancho por 900 px de alto.

Datos de prueba ficticios. La síntesis es extractiva y no demuestra comprensión clínica libre ni anonimización general. Pendientes revisión profesional, otros navegadores y auditoría manual de accesibilidad. La nueva política sustituye la antigua inferencia de exploración normal y los consejos automáticos de Fiebre.

## Primera consulta TDAH: versión vigente

`node --test --test-isolation=none tests/*.test.js`: **70 pruebas aprobadas**, 0 fallidas y 0 omitidas; 10 específicas de la primera consulta. `npm run check`: sintaxis correcta de 13 módulos. Las comprobaciones previas de orientación terapéutica, crecimiento y Fiebre siguen ejecutándose.

Se verifica que hay 12 bloques y 36 casillas, que marcar todas no cambia los hechos de la nota, que hogar/colegio/otras actividades permanecen diferenciados, y que hallazgos/comprobaciones/valoración/plan solo entran desde datos expresos. Se comprueban prioridad y discrepancias seleccionadas, edad 6–13 sin bloqueo fuera de rango, solicitud escolar de seis líneas, síntesis limitada a 180 palabras con aviso de omisiones y ausencia de contaminación implícita del seguimiento.

El nuevo recorrido Chromium comprueba la interfaz completa, casillas sin inferencias, registro parcial, copiado real de nota y solicitud escolar (sin envío), objetivos/cuestionarios/constantes compartidos, edición manual preservada, cancelación de regeneración, cambios de recorrido y de apartado sin perder respuestas, exportación completa y reinicio. Axe no detectó infracciones de los criterios automatizados WCAG 2 A/AA y 2.1 AA; navegación por teclado y cuatro anchos (1440/1024/768/390 px) sin desbordamiento horizontal. Sin errores JavaScript ni solicitudes externas. Captura local `test-results/first-visit.png`, ignorada por Git.

Datos ficticios. Esta evidencia técnica no valida diagnóstico, triaje, protocolos locales, indicación de pruebas/tratamientos/derivación ni una duración real de 15–20 minutos.

## Otalgia · 16/10/2026

Añadidas 12 pruebas unitarias (82 en total) y una prueba Chromium de la tercera página. Incluyen umbrales de edad y dosis, ausencia de inferencias, alergias, riesgos, oído derecho/izquierdo, adopción explícita e invalidación. Sintaxis de 15 módulos. Alcance clínico documentado en OTALGIA.md. Todas las pruebas unitarias y los cuatro recorridos de navegador superados.

## Revisión de Otalgia con capítulo 130 · 16/10/2026

Las 18 pruebas de Otalgia sustituyen sus 12 anteriores: 88 pruebas unitarias totales. Nuevos casos: formulaciones 50/100 mg/mL, máximo 3 g/día, redondeo, criterios de probable/confirmada, recurrencia con episodio reciente, 48 horas previas cumplidas, generación directa y alergia positiva opcional. El recorrido de Otalgia comprueba la retirada de los campos y pasos solicitados, cálculo actualizado y límites. Véase OTALGIA.md para diferencias respecto de la primera versión.

## Redacción clínica de Otalgia · 16/10/2026

20 pruebas específicas y 90 unitarias totales. Añadidas comprobaciones de relato clínico sin edad/peso, sin apartados vacíos, sin historial de analgesia en la salida, con persistencia de su efecto sobre la decisión y con las presentaciones 250 mg/5 mL y 100/12,5 mg/mL. La prueba de navegador verifica generación, actualización, copia y edición del nuevo formato.

## Antecedentes y antibiótico previo · 16/10/2026

25 pruebas de Otalgia y 95 unitarias totales. Casos nuevos: una única entrada de repetición en antecedentes; claves retiradas; selección estructurada del antibiótico para el rescate; dosis por kg y máximos; inmunodepresión unificada que evita pautas estándar incluso con fracaso; exposición reciente sin cambio automático. Chromium comprueba selección y cambios de pauta, campos retirados, cifras de recurrencia y dosis por kg, además de edición, copia, navegación, accesibilidad y cuatro anchos.

## Recurrencia, duraciones, inmunosupresión y salida · 16/10/2026

29 pruebas de Otalgia, 99 totales. Nuevos casos: recurrencia marcada sin cifras → combinación inmediata y 10 días; menor intervalo de 5–7 días → 5; inmunosupresión no grave vs grave/desconocida; negativos de síntomas según edad; CAE en mayúscula; pauta ótica sin marcas ni instrucciones retiradas; mg por toma junto al volumen. La prueba de navegador verifica los mismos cambios y los recorridos previos de edición, copia, cambio de página, accesibilidad y móvil.

## Matriz de manejo y presentación · 17/10/2026

34 pruebas de Otalgia, 104 totales. Gravedad ≥2 años: 7 días; recurrencia: 7–10 salvo criterio independiente de 10; gravedad <2 años no cambia por sí sola a combinación. Amoxicilina último mes, observación 48 h, unión negativa con «ni», otorrea aislada confirmada sin hallazgos de OE, tubos con un envase tópico y OE con edema importante/Cetraxal Plus multidosis. Chromium valida cabecera, campos, ramas terapéuticas y recorridos de interfaz. No es validación clínica ni de ficha técnica.

## Página independiente de Otitis · 17/10/2026

Nueva prueba de navegador: acceso directo a otitis.html, un único apartado sin enlaces ni carga de módulos de TDAH/Fiebre, generación y copia con las mismas dosis, reinicio, ausencia de errores, accesibilidad y tres anchos. Verifica además que la navegación completa de la página principal se conserva. Sintaxis de 16 módulos; sin cambios en reglas clínicas.

## Cartilla vacunal · 17/10/2026

14 pruebas nuevas, 118 unitarias totales; sintaxis de 20 módulos. Nuevo recorrido de navegador para texto/combos, fechas y edades, revisión, anomalías, reporte/copia, conservación entre módulos, formato de foto rechazado, cancelación y OCR real de una imagen sintética. Comprueba ausencia de peticiones a terceros, POST, localStorage, sessionStorage o IndexedDB, sin violaciones CSP, entrada HTML sin ejecución, accesibilidad y cuatro anchos. La comparación AEP/Madrid y las vacunas pendientes NO están evaluadas ni implementadas como recomendador: fuentes oficiales pendientes por HTTP 403, según CARTILLA_VACUNAL.md.
