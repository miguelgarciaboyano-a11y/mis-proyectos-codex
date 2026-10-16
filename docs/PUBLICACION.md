# Publicación estática en GitHub Pages

La aplicación no necesita backend ni secretos. La rama `gh-pages` contiene únicamente `index.html`, `otitis.html`, `src/`, `docs/`, `vendor/` y `.nojekyll`: no incluye dependencias de desarrollo, datos clínicos ni archivos exportados.

Para activar el alojamiento por primera vez, un administrador del repositorio debe elegir en **Settings → Pages → Build and deployment → Source: Deploy from a branch**, rama **gh-pages**, carpeta **/ (root)**, y guardar. GitHub inicia la publicación al guardar. Si el repositorio es privado, comprobar que el plan permite GitHub Pages; no cambiar la visibilidad del repositorio para resolverlo sin una decisión del propietario.

URL prevista por GitHub (solo estará disponible tras una publicación correcta):
`https://miguelgarciaboyano-a11y.github.io/mis-proyectos-codex/`

La publicación hace accesibles los archivos estáticos de la herramienta. Los datos introducidos en la consulta siguen en la memoria del navegador y no se transmiten al alojamiento. El proveedor recibe las peticiones HTTP necesarias para entregar los archivos, como en cualquier web. No hay autenticación de acceso a la herramienta ni cifrado de las exportaciones JSON. Mantener datos ficticios hasta la revisión clínica y de privacidad.

No hay despliegue automático configurado desde `main`: las futuras versiones deben actualizar también la rama de publicación. Conservar licencias, fuentes originales OMS y documentación al actualizar. Nunca incluir archivos exportados de consultas, capturas con datos reales ni credenciales.

Los puntos de entrada de HTML, CSS y los módulos de navegación llevan versión en la URL para evitar reutilizar menús anteriores desde la caché del navegador. Actualizar ese identificador al modificar estas pantallas. La presencia del commit en `gh-pages` no confirma que el despliegue de Pages haya finalizado: comprobar la ejecución de `pages build and deployment` en Actions cuando se tenga acceso.

La página independiente se publica en `/mis-proyectos-codex/otitis.html`. Incluir **otitis.html** en el árbol de `gh-pages` en cada actualización, además de index.html, src, docs, vendor y .nojekyll. La entrada `src/otitis-only.js` reutiliza el formulario de Otalgia en modo independiente, sin cargar TDAH ni Fiebre.
