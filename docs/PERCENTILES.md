# Percentiles de crecimiento: procedencia y verificación

La implementación numérica está contrastada con las referencias indicadas. No equivale a validación clínica del producto. No se calculan percentiles de TA ni FC.

## Fuentes oficiales conservadas localmente

- **OMS Child Growth Standards 2006**, repositorio oficial [WorldHealthOrganization/anthro](https://github.com/WorldHealthOrganization/anthro), commit `b776d8a12b1c97369c748b561159fd2ec4f4db58`. Tablas `weianthro.txt`, `lenanthro.txt`, `bmianthro.txt`, `data-raw/growthstandards`. Algoritmos revisados: `R/z-score-helper.R`, `R/z-score.R`, `R/utils.R` y archivos por indicador.
- **OMS Growth Reference 2007**, repositorio oficial [WorldHealthOrganization/anthroplus](https://github.com/WorldHealthOrganization/anthroplus), commit `7cfcdb39026e9a55de55732bc3cf14c82261bcf7`. Tablas `wfawho2007.txt`, `hfawho2007.txt`, `bfawho2007.txt`; algoritmo `R/zscores.R`. Versión declarada por el repositorio: 1.1.0.9000; se fija el commit, no una rama mutable.
- Consulta y descarga: 2026-10-16, HTTPS mediante el proxy Git existente. La web `www.who.int` respondió 403; se usaron los repositorios oficiales anteriores. Ninguna descarga se hace durante el uso clínico.
- Los originales, descripciones de paquete y licencia GPL ≥3 se conservan en `vendor/who/`. Los SHA-256 están en `manifest.json`. `python3 scripts/build-who.py` verifica hashes y genera `src/who-data.js` sin red, sin modificar los números LMS. Conservar atribución/licencia y revisar sus condiciones antes de redistribuir una obra que los incorpore. Sin garantía de los autores originales ni de esta adaptación.

## Aplicabilidad y método

1. Se exigen fechas válidas de nacimiento y medición. Edad = diferencia de días civiles UTC, con años bisiestos; meses exactos = días / **30,4375**, conforme a Anthro. No usar solo edad en años, ni la fecha de consulta para una medición de otro día.
2. Sexo de referencia explícito: masculino (1) o femenino (2), conforme a las tablas OMS. Su ausencia impide estos cálculos, no el resto de la consulta.
3. Menos de 60 meses: estándares 2006, búsqueda diaria por sexo para peso, longitud/talla e IMC. Las tablas contienen 0–1856 días; se aplica la selección de Anthro `<60 meses`, sin prolongarla a la referencia escolar por redondeo.
4. Desde 60 meses: referencia 2007. La aplicación limita **talla e IMC a 60–228 meses inclusive** y **peso a 60–120 meses inclusive**. AnthroPlus ofrece también fracciones del último mes (<229 / <121); este prototipo usa un límite más conservador y no las calcula. No extrapola, ni calcula peso/edad en adolescentes.
5. Talla/longitud e IMC requieren técnica indicada. Antes de 731 días se usa longitud tumbado; si se midió de pie, se añaden 0,7 cm. Desde 731 días, si se midió tumbado se restan 0,7 cm. Es la corrección de Anthro, no una aproximación inventada. Para 2007 se exige de pie. La pantalla distingue el IMC aritmético con medida introducida y el percentil de IMC basado en medida estandarizada. No sustituye el dato original.
6. Peso e IMC exigen ausencia de edema confirmada; con edema, desconocido o no valorado se muestra motivo de indisponibilidad. Es más restrictivo que los valores por defecto del paquete OMS.
7. Parámetros 2007: interpolación **lineal de L, M y S** entre meses adyacentes, no de percentiles. 2006: fila diaria exacta. Z = `((x/M)^L − 1)/(L·S)`; si L=0, `ln(x/M)/S`.
8. Para peso/IMC, más allá de ±3 Z, se aplica la extensión lineal de colas de Anthro: distancia respecto a SD3 expresada en incrementos SD2–SD3. No se aplica a talla. Valores de plausibilidad OMS: talla |Z|>6, peso Z<−6 o >5, IMC |Z|>5 no muestran percentil y piden revisar la medición; el dato se conserva. Se usa Z sin redondear para este filtro, de forma conservadora.
9. Percentil = 100·Φ(Z). La CDF normal se evalúa con cuadratura Simpson de 2048 subintervalos; contrastada con `math.erf` de Python en 121 puntos de −6 a +6, error absoluto <1e−11. No se usa una fórmula aproximada de crecimiento ni tablas interpoladas inventadas. Se muestra un decimal; valores extremos como <0,1 o >99,9. Z no se redondea hasta presentarlo.
10. No se etiqueta normalidad, malnutrición ni hipertensión automáticamente. Son cálculos orientativos pendientes de valoración del profesional.

## Verificación reproducible

`tests/percentiles.test.js` verifica:

- Parámetros contiguos y válidos de las seis tablas y ambos sexos, medianas seleccionadas = Z0 / P50.
- Ejemplos de `anthro/tests/testthat/test-zscore-weight-for-age.R`: niña, 1522 días, 17 kg → Z **0,24**. Longitud: niño, 44 días, 50 cm, parámetros oficiales M56,4833/S0,03492.
- Ejemplos de `anthroplus/tests/testthat/test-zscores.R`: niñas a 60,32 meses, 113,8 cm/18,7 kg → talla Z **0,96**, peso **0,21**, IMC **−0,58**; 60,911701 meses, 113,6 cm/20,5 kg → talla **0,85**, peso **0,79**, IMC **0,42**. Datos de prueba sintéticos publicados en los tests oficiales, sin identificación de pacientes.
- Interpolación de LMS, extensión de colas, técnica y corrección 0,7 cm, fronteras 60/120/228 meses, negativos, fechas bisiestas y no válidas, datos ausentes, edema, extremos y variables no disponibles.
- CDF frente a los 121 valores guardados en `tests/fixtures/normal-cdf.json`, calculados con `0.5*(1+math.erf(z/math.sqrt(2)))`.

Pendiente: validación clínica independiente y contraste ampliado con herramientas OMS antes de uso asistencial; referencias específicas de TA (se propone AAP 2017 por edad, sexo y talla) y FC (requiere edad y condiciones de medición).
