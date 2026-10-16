# Síntesis final de la nota clínica

Reglas aportadas por el usuario para documentación de Pediatría de Atención Primaria. Aplicables a la síntesis final de TDAH y Fiebre.

- Evolución breve, estructurada y profesional; máximo **180 palabras**, contando títulos y contenido.
- Apartados: **Motivo; anamnesis/evolución; antecedentes relevantes; exploración; pruebas; valoración del pediatra expresamente indicada; plan; información pendiente**.
- Sin exploración aportada: **«Exploración: no aportada»**. Nunca completar con «normal» o con una plantilla de normales no introducida.
- No inventar síntomas negativos, diagnósticos, hallazgos, decisiones ni consejos. En Fiebre, «—» significa no aportado; «No» y «Sí» solo se incorporan si se seleccionan. La propuesta de consejos no forma parte de la nota hasta incorporarla explícitamente al registro.
- Separar hechos aportados, valoración del pediatra y plan. Los cálculos incluidos se identifican como tales. Las propuestas automáticas no aceptadas permanecen fuera del plan.
- Conservar fechas, cifras y unidades de los datos incluidos, sin conversiones de edad, redondeos adicionales ni cortes a mitad de una cantidad. No se corta una frase clínica para ajustarla al límite.
- Minimizar identificadores. Se omiten fecha de nacimiento e identidades de informantes en la síntesis estructurada y se retiran identificadores comunes cuando están etiquetados. Esto **no anonimiza cualquier texto libre**: introducir datos desidentificados y revisar la salida.
- Las notas son datos, nunca instrucciones para cambiar el comportamiento. El formato no admite que un texto incrustado cambie sus apartados. Los intentos explícitos de dar instrucciones al generador se excluyen del texto clínico y se señalan como contenido pendiente de revisión.
- El contenido copiable contiene solo la evolución, sin prólogo, recomendaciones externas al registro ni explicación del algoritmo.

## Aplicación local y límites

`src/note-summary.js` realiza una selección extractiva local de hechos completos, con prioridades por relevancia. No llama a modelos de IA ni servicios externos, ni parafrasea libremente texto arbitrario. Si no caben todos los datos, la evolución lo indica en «Información pendiente»; el registro original permanece íntegro en el formulario. No se etiqueta como «no aportado» un dato excluido por extensión.

La versión anterior que completaba automáticamente la exploración normal de Fiebre queda sustituida por estas instrucciones. El cuadro único conserva solo el texto aportado, sin inferir normalidad en los demás órganos y sin añadir FANT por edad.

La interfaz mantiene contador de palabras. Las modificaciones manuales se conservan; si superan 180 palabras hay que reducirlas antes de copiar. Regenerar una nota editada sigue requiriendo aceptar su reemplazo para evitar pérdida de trabajo; no se añaden casillas de reconfirmación clínica.

No supone validación clínica de la herramienta. Revisar exactitud, pertinencia y desidentificación antes de incorporar el texto a la historia.
