# Consulta · Pediatría

Aplicación web local en español con pestañas **TDAH** (primera consulta y seguimiento) y **Fiebre** (anamnesis, exploración y nota editable) en atención primaria pediátrica. Creada sobre el repositorio existente, que solo contenía un README. Prototipo funcional para revisión profesional: **no validado para uso clínico**, no diagnostica ni prescribe.

## Iniciar

Requiere Python 3.10+; Node 20+ solo para pruebas. La aplicación no necesita instalar paquetes ni compilar.

```bash
cd /workspace/mis-proyectos-codex
npm start
# Alternativa sin Node:
python3 -m http.server 5173 --bind 127.0.0.1
```

En tu equipo, abre la dirección local `http://127.0.0.1:5173` en un navegador moderno. En el entorno de nube, el servidor sirve para validación interna; esta entrega no incluye despliegue público ni una vista previa web. Detener con Ctrl+C. No abrir `index.html` con `file://`: los módulos requieren HTTP. No exponer el servidor de desarrollo a redes públicas ni cargar datos reales en el prototipo.

Cada tarea de nube está aislada: trabajar en este checkout, sin crear worktrees salvo petición explícita. Los procesos no sobreviven necesariamente al reinicio del entorno.

## Funciones implementadas

- Dos recorridos con secciones plegables, navegación por teclado, etiquetas de controles y diseño adaptable a ordenador, tableta y móvil.
- Anamnesis integrada de los dos guiones: patrón, síntomas, impacto, antecedentes, intervenciones, información escolar, cribado diferencial y cardiovascular. Vacío/no valorado, desconocido, sí y no permanecen diferenciados.
- Objetivos añadibles/editables con basal, criterio de mejoría, entorno y evolución.
- Hasta **2 familiares y 2 docentes**, NICHQ Vanderbilt con versión exacta y subescalas distintas. Se introducen puntuaciones **ya calculadas**, con avisos por límites de entrada. No puntúa ítems ni clasifica cuestionarios; ausencia/incompletitud no se convierte en negativo.
- Mediciones fechadas, unidades explícitas, IMC, advertencias de plausibilidad y comparación con mediciones importadas. Percentiles de peso/talla/IMC **OMS 2006 y 2007**, tablas oficiales locales, límites y método documentados en [PERCENTILES.md](docs/PERCENTILES.md). No hay percentiles de TA ni FC.
- Seguimiento: pauta previa, adherencia, respuesta por entornos, inicio/duración/cobertura, rebote, objetivos y RAM. «No» inicial en RAM no se lleva como negativa hasta confirmar revisión. Cambiar una RAM exige confirmar de nuevo.
- Síntesis razonada separada del registro: apoyo, lagunas/discordancias, comorbilidad/alternativas y siguientes pasos. No probabilidad numérica ni diagnóstico automático. Solo entra en la valoración al aceptarla expresamente.
- Propuestas cualitativas específicas de metilfenidato: justificación, regla, fuente, lagunas y precauciones. Bloqueadas ante datos indispensables ausentes o problemas que requieren valoración. Sin dosis, conversiones o equivalencias. Solo se incorporan al plan por aceptación explícita; los cambios posteriores invalidan esa aceptación.
- Nota estructurada editable y copiable en texto sencillo, parcial si faltan datos. El formulario nunca la reescribe automáticamente. Regenerar una nota editada requiere confirmación; cancelar conserva los cambios. Si el portapapeles no está disponible, se selecciona el texto y se explica cómo copiarlo manualmente.
- Exportación JSON explícita e importación selectiva de objetivos, tratamiento y mediciones. Se comprueba el mismo caso antes de trasladar. No se importan valoraciones, negativas, RAM revisadas ni evolución de objetivos.

## Privacidad

Todo el procesamiento clínico se hace en el navegador, sin IA, APIs externas, analítica, telemetría, cookies, localStorage, sessionStorage ni base de datos. El servidor solo entrega archivos estáticos. La política CSP prohíbe conexiones desde el código de la aplicación.

Los datos viven en memoria de la pestaña. «Reiniciar» limpia la consulta, la nota y cualquier archivo importado pendiente; cerrar o recargar pierde la consulta. Un navegador puede conservar pestañas suspendidas/restauradas: reiniciar al terminar y usar un equipo controlado.

**Exportar descarga un JSON sin cifrar** con la consulta y nota actuales. No tiene caducidad ni borrado remoto. Reiniciar no elimina exportaciones, portapapeles ni datos pegados en la historia clínica. No se incorporan documentos clínicos originales al repositorio. Ejemplos y pruebas usan datos ficticios.

## Comprobar

Pruebas de lógica sin dependencias:

```bash
npm run check
npm test
npm run build:who  # opcional: verifica hashes y regenera las tablas desde vendor/, sin red
```

Prueba real de navegador (requiere servidor iniciado):

```bash
npm ci --ignore-scripts --no-audit --no-fund --cache /tmp/consulta-npm-cache
npm start  # en otra terminal
npm run test:browser
```

La prueba usa Playwright 1.62.1, axe-core/playwright 4.11.1 y Chromium del sistema en `/usr/bin/chromium`. Si está en otra ruta, indicar `CHROMIUM_PATH=/ruta/a/chromium npm run test:browser`. Instalar Chromium con el gestor del sistema si falta. Las capturas de pruebas se generan en `test-results/` (ignorado por Git). No requiere descargar navegadores al iniciar la aplicación.

Resultados ejecutados y alcance: [VALIDACION.md](docs/VALIDACION.md).

## Organización

- `src/schema.js`: campos y estructura del estado; añadir nuevas patologías requiere su propio esquema y reglas.
- `src/app.js` / `style.css`: interfaz, navegación, nota editable, acciones locales.
- `src/clinical.js`: síntesis, propuestas y ensamblado de nota, con referencias por regla.
- `src/questionnaires.js`: versiones y límites de puntuaciones introducidas. Sin puntuación por ítems ni clasificación.
- `src/measurements.js`: IMC, comprobación de unidades/plausibilidad y comparación.
- `src/percentiles.js`: edad, LMS y CDF; `who-data.js`: datos generados; `vendor/who/`: originales, hashes y licencia.
- `src/transfer.js`: lectura restrictiva y traslado controlado de consultas.
- `tests/`: lógica y recorrido de navegador con datos ficticios.

No hay backend, cuentas, multitenencia, sincronización ni historial persistente. No se añade un framework o un servicio para un único módulo. Python sirve archivos; JavaScript ES modules separa interfaz, reglas, cuestionarios y cálculos sin compilación.

## Pendiente de fuentes o revisión

- **Revisión clínica independiente** de contenido, propuesta de campos, notas y percentiles antes del uso asistencial.
- **Conners**, no recibido; continuar solo con los cinco PDF fue confirmado por el usuario. Sin reglas ni umbrales inventados.
- **Vanderbilt**: manual completo de interpretación y verificación de permisos antes de incorporar ítems o clasificación. Los PDF sí documentan los conteos admitidos en sus páginas de uso profesional.
- **TA/FC**: referencias pediátricas específicas. Se propone revisar AAP 2017 para TA por edad, sexo y talla; FC requiere fuente por edad y condiciones. No se atribuyen a la OMS.
- **Farmacología**: los PDF no tienen fecha/autoría clínica verificable; contrastar con fichas técnicas vigentes de AEMPS/CIMA. Dosis, incrementos, máximos, cambios, boosters dosificados y descansos programados no se automatizan.
- Circuitos y criterios específicos de derivación de Madrid no aportados. Solo se indican las ampliaciones de estudio documentadas en los guiones.
- Pruebas realizadas en Chromium; pendientes otros navegadores, lector de pantalla, auditoría WCAG completa y validación prospectiva del flujo asistencial.

Correspondencia de las fuentes: [FUENTES.md](docs/FUENTES.md). Datos/métodos OMS: © World Health Organization, GPL ≥3; se conserva licencia y atribución en `vendor/who/`. Revisar sus términos antes de redistribuir. Esta aplicación no está avalada por la OMS, NICHQ ni AAP.

## Pestaña Fiebre

Diez síntomas: catarrales, tos, dificultad respiratoria, diarrea, vómitos, dolor, odinofagia, exantema, molestias urinarias y otalgia. «Sí» habilita días de evolución y los detalles específicos: deposiciones/vómitos en 24 h, horas desde último vómito y localización del dolor. Convivientes enfermos se recoge aparte.

Los «No» iniciales requieren confirmar anamnesis revisada para entrar como negativos en la nota. Escribe solo las alteraciones en los apartados de exploración: cada texto sustituye su frase normal completa. Confirmar la exploración es indispensable para añadir la plantilla normal; FANT se incluye con edad conocida <12 meses. No se interpreta texto libre mediante IA.

Los consejos propuestos ocupan dos líneas lógicas y requieren confirmar que se revisaron y explicaron. Plazo a elegir: 3 días totales, 2 días adicionales o personalizado; con ≥3 días de fiebre se propone reevaluación actual, y en <3 meses con fiebre ≥38 °C valoración urgente. No se determina el alta ni se ofrece protección legal. Es posible personalizar el texto completo.

Cambiar de pestaña conserva ambas consultas y notas en memoria, sin mezclar datos. Reiniciar fiebre borra solo esa consulta. `src/fever.js` contiene el ensamblado de nota y `src/fever-app.js` la interfaz. Pruebas: `tests/fever.test.js` y `tests/fever-browser.cjs`. Para ver el detalle de todas las pruebas en este entorno: `node --test --test-isolation=none tests/*.test.js` (Node 22+).
