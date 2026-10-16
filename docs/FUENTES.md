# Correspondencia de fuentes y reglas — revisión 2026-10-16

Revisión previa a implementar reglas. Los cinco PDF aportados se han leído por extracción y OCR de páginas escaneadas, contrastando visualmente las secciones usadas. No se redistribuyen los PDF ni se reproducen los ítems de Vanderbilt. Autoría/fecha de los guiones y guía farmacológica: no constan; requieren revisión profesional. Esta correspondencia no constituye validación clínica.

| Fuente recibida | Contenido integrado | Campos o reglas |
|---|---|---|
| Anamnesis TDAH 1a consulta, pp. 1–2 | Patrón, diez preguntas nucleares 0–3, deterioro, nueve áreas diferenciales, problemas diana | Entrevista descriptiva sin sumar puntuaciones; diez preguntas ampliadas con desconexión, errores por descuido y evitación del esfuerzo del guion explicado; frecuencia por síntoma, ejemplos, inicio, persistencia, entornos, impacto; cribado con cuatro estados; objetivos editables |
| Anamnesis TDAH explicada, pp. 1–4 | Inicio antes de 12 años, contexto/motivación, impacto aunque apruebe, aprendizaje/capacidad/lenguaje/TEA/ansiedad/ánimo/conducta/sueño/contexto, preguntas a docentes, estudio psicopedagógico si modifica manejo | Amplía la entrevista rápida sin duplicarla. Síntesis de evidencias y lagunas, sin probabilidad ni diagnóstico. Autolesión requiere valoración específica. No existe perfil WISC diagnóstico ni evaluación psicométrica rutinaria |
| Metilfenidato, p. 1 | Basal peso/talla/TA/FC/apetito/sueño, cribado CV personal y familiar, información familiar/escolar, objetivos, formulaciones | Mediciones fechadas, estado de revisión profesional de constantes, antecedentes de síncope/dolor o disnea de esfuerzo/palpitaciones/cardiopatía/muerte súbita o arritmias familiares, objetivos y tratamiento detallado |
| Metilfenidato, p. 2, apartados 3–5 | Respuesta frente a duración, RAM, adherencia y comorbilidad; feedback semanal en titulación | Propuestas orientativas trazables: mantener, revisar respuesta insuficiente, valorar cobertura, priorizar tolerabilidad. Nunca genera dosis ni conversiones. Se bloquean ajustes si faltan datos, revisión de RAM, cribado CV o valoración de constantes |
| Metilfenidato, p. 3, apartados 6–7 | Comparar objetivos con basal; mg/kg no es fórmula de dosis ni techo universal | Evolución por objetivo. No usar mg/kg para determinar dosis. No se implementan incrementos ni máximos sin contraste con ficha técnica vigente |
| Metilfenidato, p. 4, apartados 8–9 | Cobertura por función y seguridad, no descansos sistemáticos, no equivalencia mg a mg | Cobertura/necesidades en fin de semana y vacaciones documentables. Sin conversión automática ni booster dosificado. Cambios requieren valoración profesional |
| Spanish Vanderbilt ADHD Parent, NICHQ, revisión 1102, copyright 2005; contenedor AAP 2010, p. 4 | Conteos 2–3: 1–9, 10–18, 19–26, 27–40, 41–47; total 1–18; conteos 4–5 y media de rendimiento 48–55 | Registro de puntuaciones ya calculadas, con límites de entrada por subescala. No algoritmo de clasificación: no se adjuntan instrucciones completas de interpretación. Período de referencia: últimos seis meses |
| Spanish Vanderbilt ADHD Teacher, NICHQ, revisión 0303, copyright 2005; contenedor AAP 2010, p. 4 | Conteos 2–3: 1–9, 10–18, 19–28, 29–35; total 1–18; conteos 4–5 y media de rendimiento 36–43 | Registro separado, sin mezclar con padres, ni Conners. Período desde inicio de curso, registrar tiempo de observación |

Los campos de antecedentes gestacionales/perinatales, desarrollo, patología previa/familiar y exploración son registros clínicos libres añadidos para la consulta, sin reglas inferidas. Las negaciones solo se registran al seleccionarlas explícitamente. Para crecimiento se añaden técnica de medida y edema, sin asumirlos por defecto. El “No” inicial en RAM no cuenta como revisado.

## Pendientes delimitados

- No se ha recibido Conners ni otro documento diagnóstico. El usuario indica continuar con los cinco PDF. No se implementan Conners ni sus umbrales.
- Vanderbilt: se aceptan resultados previamente calculados. Sin puntuación por ítems ni clasificación automática; faltan manual completo y verificación del permiso de reproducción/adaptación. Una interpretación escrita por el profesional se identifica como tal.
- Percentiles: se incorporaron posteriormente las tablas oficiales OMS 2006/2007 desde sus repositorios oficiales. Ver [PERCENTILES.md](PERCENTILES.md) para commits, métodos, rangos exactos y pruebas. Implementación numérica contrastada, pendiente validación clínica independiente. TA/FC: sin percentiles OMS. Para TA se propone revisar tablas pediátricas AAP 2017 por edad/sexo/talla (sin implementación); FC requiere referencia específica por edad y condiciones de medición.
- Guía farmacológica adjunta sin fecha/firma: orientación cualitativa implementada, no prescripción. Dosis de inicio, escalones, máximos, cambios, equivalencias y descansos deben contrastarse con fichas técnicas AEMPS/CIMA y el caso individual; no se automatizan.
- No hay protocolo específico de derivación de Madrid aportado. Se documenta ampliar estudio o valorar derivación según las áreas del guion, sin inventar circuitos o criterios locales.

## Fiebre y síntesis final: versión vigente

Los síntomas del formulario y el esquema de exploración proceden de las peticiones explícitas del profesional en esta conversación, no de los PDF de TDAH. Las instrucciones posteriores de síntesis prevalecen sobre los valores por defecto solicitados al principio: **no se completa ninguna exploración normal ausente**, no se añaden negativos de síntomas no valorados ni se documentan consejos por defecto. FANT solo aparece si se escribe, no por inferencia de edad.

Ver [REGLAS_NOTA.md](REGLAS_NOTA.md): ocho apartados, máximo 180 palabras, datos originales tratados como datos y no instrucciones, conservación de cifras/fechas/unidades, minimización de identificadores, separación de valoración y plan. La síntesis es local y extractiva, con aviso si se omiten datos por extensión.

Los consejos orientativos de Fiebre siguen siendo propuestas fuera de la nota. El plazo de 3 días responde al flujo solicitado, no es un umbral universal de gravedad. El aviso de valoración urgente en <3 meses con fiebre ≥38 °C coincide con NICE NG143 (https://www.nice.org.uk/guidance/ng143/chapter/Recommendations). No se implementa el algoritmo NICE, no se decide el alta ni se ofrece garantía legal. Solo se incorpora a la evolución el consejo indicado explícitamente. Pendiente revisión clínica independiente.

## Rediseño completo de primera consulta por posible TDAH

El usuario aporta el objetivo (6–13 años, entrevista de 15–20 minutos), los doce bloques, el enfoque neutral y la diferenciación de familia/colegio/pediatría. [PRIMERA_CONSULTA.md](PRIMERA_CONSULTA.md) conserva la checklist y la plantilla de solicitud escolar de seis líneas. Desarrollo, aprendizaje, sueño y bienestar ya estaban en los guiones; visión/audición, hábitos, medicación, voz del menor, prioridades y diferenciación de fuentes se explicitan según la nueva petición. Las posibilidades diferenciales son hipótesis a contrastar, no resultados de la checklist.

No se añaden criterios diagnósticos, umbrales de escalas ni circuitos locales. Las casillas solo registran preguntas abordadas y no entran como hallazgos en la síntesis. La valoración, el plan y la prioridad requieren texto o selección expresos del profesional. Las actuaciones se presentan para contraste con protocolos locales. Los anexos de cuestionarios y crecimiento mantienen sus fuentes y restricciones previas. Primera consulta, seguimiento y Fiebre disponen de campos diferenciados; la síntesis final sigue la política documental de 180 palabras. No es una herramienta clínica validada.

### Otalgia

Capítulo 130 «Otitis media aguda y otitis externa. Complicaciones», M. García Boyano y F. Baquero Artigao, pp. 1591–1596, imágenes aportadas por el usuario (edición completa no especificada). Sustituye las indicaciones textuales iniciales donde difieren. Concentraciones de amoxicilina 50 mg/mL y combinación 100 mg/mL indicadas por el usuario. Reglas, límites y decisiones de implementación: [OTALGIA.md](OTALGIA.md).

Identificación de la obra aportada por el usuario el 17/10/2026: **LIBRO VERDE: Manual de Diagnóstico y Terapéutica en Pediatría, 7ª edición**. La implementación incluye ajustes posteriores expresos del usuario sobre gravedad, recurrencia, otorrea y duraciones; véase OTALGIA.md. Cetraxal Plus frasco multidosis fue confirmado por el usuario; el intento de consulta de su ficha en CIMA devolvió HTTP 403 y no se considera una verificación online completada.

### Cartilla vacunal · 17/10/2026

Confirmado Manual de Vacunas de AEP y programa de Comunidad de Madrid. Acceso a ambos portales bloqueado (HTTP 403); solicitados documentos oficiales para calendario y rescate. No se ha atribuido ninguna pauta de rescate a estas fuentes ni se ha activado comparación clínica. El parser solo reconoce denominaciones/preparados para transcripción documental; no valida cobertura. Detalles en CARTILLA_VACUNAL.md. OCR: Tesseract.js/Core 7.0.0 y paquete de idioma español 1.0.0, con integridades y licencias en vendor/ocr.
