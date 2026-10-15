# Arquitectura y requisitos acordados

## Alcance y decisiones

- Hosting gratuito GitHub Pages, HTML/CSS/JavaScript vanilla, sin PHP ni base de datos. Máximo operativo 500 MB de medios y 1–5 televisores, inicialmente uno.
- Prioridad LG 42LN5700 NetCast antiguo. No confundir con webOS. JavaScript ES5, XMLHttpRequest, DOM y CSS simples; sin módulos, fetch, promesas obligatorias, flexbox ni CDN en reproducción.
- Cola mixta: JPG/PNG y MP4. Cada imagen tiene duración individual de 1–3600 segundos desde su carga efectiva. Videos hasta `ended`, sin duración arbitraria; se omiten por error o falta de progreso durante 45 segundos. Arranque/carga con límite de 30 segundos. Bucle continuo; fallos con pausa de 2 segundos para evitar un ciclo agresivo.
- Precarga de una sola imagen siguiente. No precargar otro video: evitar presión de memoria y dos decodificadores. El video actual solicita preload auto, sujeto a la decisión del navegador.
- Consulta de JSON cada minuto, timeout 15 segundos, validación estricta y reemplazo al terminar el elemento actual. Una playlist inválida no reemplaza la última válida. Guardado de JSON en localStorage con excepciones controladas. No almacena medios en localStorage.
- Rutas relativas a la raíz del sitio y medios locales con nombres ASCII simples. Evitar URLs externas, HTML arbitrario, iframes y contenido ejecutable en la playlist.

## Administración y autenticación

GitHub Pages no ejecuta un servidor que pueda verificar contraseñas o custodiar secretos. La primera versión usa administración en dos pasos: panel público para preparar/validar/descargar JSON y GitHub autenticado para subir medios y publicar. La autorización real es la de GitHub, con permisos del repositorio y 2FA. No hay token, contraseña, OAuth client secret ni escritura vía API en JavaScript. El contenido publicado y el panel son públicos.

Un panel integrado que publique con un clic requiere cambiar el alcance: backend externo o proveedor CMS con autenticación y autorización del lado servidor (OAuth, cookies seguras, protección CSRF y permisos mínimos). No simular seguridad con una contraseña o token en el frontend. Esa integración queda deliberadamente fuera de esta base sin backend.

## Caché e invalidación

1. Medios inmutables por nombre: `evento-20261015-v2.mp4`. Nunca sobrescribir un nombre ya publicado. Igual para JS/CSS: cambiar sufijo y referencias HTML en cada actualización.
2. `playlist.json` lleva una `version` nueva en cada edición; solicitud con timestamp por minuto para evitar reutilización de una respuesta antigua del cliente. CDN y propagación del despliegue pueden agregar demora.
3. Guardar sólo la playlist validada más reciente. El reproductor conserva en memoria el contenido actual y la imagen precargada; el resto depende de la caché HTTP que el firmware permita. No hay garantía de persistencia de videos, operación offline de 500 MB ni arranque sin conexión.
4. Pages decide los encabezados HTTP; este repositorio no puede imponer Cache-Control. No usar Application Cache: obsoleto y con invalidación frágil. No depender de Service Worker/Cache API/IndexedDB en NetCast. Una mejora moderna opcional puede incorporarse después, con límites de almacenamiento y tratamiento correcto de peticiones Range, sin afectar el perfil antiguo.
5. Publicar medios primero, playlist después; conservar medios antiguos durante al menos una jornada operativa y hasta verificar que las pantallas actualizaron. El HTML inicial puede requerir recarga manual después de cambios del reproductor.

## Capacidad, formatos y compatibilidad

500 MB caben en el límite publicado de Pages de 1 GB, pero el ancho de banda flexible es 100 GB/mes. Cinco pantallas descargando 500 MB diariamente serían unos 75 GB/mes; si los videos se descargan en cada bucle, puede superarse ampliamente. Medir antes de ampliar. Git bloquea archivos mayores de 100 MiB y Pages no admite Git LFS; preferir videos cortos menores de 25 MB para facilitar subidas web. Evitar acumular versiones grandes en el historial.

Comenzar pruebas con MP4 H.264 + AAC, 720p, bitrate moderado y faststart; JPG/PNG 1280×720. Es un perfil de prueba, no una garantía de codec del navegador. El manual NetCast documenta APIs de aplicaciones; sus capacidades no prueban por sí solas que el navegador integrado de este modelo/firmware reproduzca HTML5 video. También validar TLS/certificados actuales de GitHub Pages. Si falla TLS o HTML5 video, cambiar una biblioteca no lo resuelve: se necesitará un reproductor HDMI externo o revisar el alojamiento. No degradar a HTTP con credenciales.

## Bibliotecas externas

No se incluyó una dependencia sin evidencia de compatibilidad con el TV. El decodificador nativo es inevitable y una biblioteca no amplía los codecs del firmware. Video.js se evaluó como candidato para un perfil moderno; su documentación actual no establece soporte para este NetCast. Reveal.js/Swiper y motores HLS/DASH no son necesarios para una cola de imágenes y MP4 y agregarían APIs, peso y superficie de fallos. Las diapositivas iniciales se exportan como imágenes.

Para incorporar una biblioteca: verificar versión exacta, licencia, mantenimiento y avisos de seguridad; ensayar en el TV; copiar distribución y licencia a `vendor/<nombre>/<version>/`, registrar SHA-256 y origen en `vendor/README.md`; no cargar CDN ni actualizar automáticamente. Si más adelante se necesita composición avanzada, evaluar una biblioteca acotada con fallback a imagen, antes de escribir un editor desde cero.

## Plan de aceptación pendiente en hardware

1. Abrir URL real de Pages en el LG, registrar firmware/user-agent, probar certificado y controles.
2. Cola imagen 3s, video corto con audio silenciado y otra imagen 7s; verificar `ended`, escalado, memoria y bucle durante 8 horas.
3. Probar archivo ausente, MP4 incompatible, pérdida de red, video detenido, autoplay bloqueado y todos los archivos fallando; verificar reintento sin bloqueo.
4. Cambiar JSON durante imagen y video; verificar aplicación al finalizar, preservación ante JSON inválido y recuperación tras red caída.
5. Reiniciar navegador sin red, observar qué conserva realmente el firmware y medir bytes transferidos por bucle. No prometer offline antes de esta prueba.
6. Repetir con 1 y luego 5 pantallas; medir tráfico mensual proyectado. Considerar player externo si no cumple.

## Fuentes primarias consultadas 15/10/2026

- https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
- https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github
- https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-git-large-file-storage
- https://webostv.developer.lge.com/assets/netcast/NetCast-Developing%20Web%20App.pdf
- https://videojs.org/docs/framework/react/guides/browser-support
