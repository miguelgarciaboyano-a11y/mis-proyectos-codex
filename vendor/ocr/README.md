# OCR local · versiones fijadas

Archivos redistribuidos de npm, descargados con TLS y verificados contra su integridad SHA-512 antes de extraer. `manifest.json` registra esas integridades de origen y el SHA-256 de cada archivo distribuido. Las pruebas comprueban los archivos locales contra ese manifiesto; no se modificaron los paquetes para eludir verificaciones.

- **tesseract.js 7.0.0**: worker de reconocimiento. Apache-2.0, véase LICENSE-tesseract.md. Se conserva también la distribución ESM original como referencia; la aplicación usa directamente el protocolo del worker para poder cancelar desde su creación. https://www.npmjs.com/package/tesseract.js/v/7.0.0
- **tesseract.js-core 7.0.0**: compilaciones WebAssembly LSTM normal, SIMD y relaxed SIMD, con binarios embebidos. Apache-2.0, LICENSE-core.txt. El motor selecciona la variante compatible. https://www.npmjs.com/package/tesseract.js-core/v/7.0.0
- **@tesseract.js-data/spa 1.0.0**: modelo español 4.0.0_best_int. Licencia declarada MIT; autores Balearica y contribuidores identificados en language-package.json. https://www.npmjs.com/package/@tesseract.js-data/spa/v/1.0.0 y https://github.com/naptha/tessdata

Se conservan los avisos de dependencias embebidas de las distribuciones minificadas en tesseract-bundle-LICENSE.txt y worker-bundle-LICENSE.txt. Sus identificadores y autores constan allí (regenerator-runtime, buffer, ieee754 y zlib.js). Los modelos y código no contienen datos de pacientes.

Todos los caminos de carga se fijan al propio alojamiento de la aplicación. No se utilizan las direcciones CDN de respaldo del motor. `cacheMethod: none` impide usar IndexedDB para el modelo. La imagen se envía como píxeles codificados al Worker del mismo navegador mediante postMessage, nunca por una petición HTTP. El Worker se termina al completar, cancelar o fallar la lectura. El navegador puede mantener en su caché HTTP los archivos estáticos del motor, sin imágenes ni texto de la cartilla.

Reproducción: `npm pack tesseract.js@7.0.0`, `npm pack tesseract.js-core@7.0.0` y `npm pack @tesseract.js-data/spa@1.0.0` con scripts de instalación desactivados; comprobar primero las integridades SHA-512 del manifiesto y extraer únicamente los archivos enumerados, conservando sus licencias. No incorporar los tarballs ni datos clínicos al repositorio.
