# Ejemplos y transiciones

Se crearon dos imágenes con la herramienta integrada Imagegen, inspeccionadas visualmente y guardadas en `media/musica-ejemplo-v1.png` y `media/deporte-ejemplo-v1.png`.

Prompts empleados:

1. Use case ads-marketing. Create one polished landscape 16:9 digital signage sample poster for a community club, Spanish typography. Warm amber stage lights, live acoustic music scene with guitar and microphone, elegant editorial composition, large highly legible exact headline "NOCHE DE MÚSICA", smaller exact line "Vení a disfrutar al club", small exact label "EJEMPLO · SIN FECHA CONFIRMADA". No dates, no invented logo, no watermark. Safe generous margins, readable on television.
2. Use case ads-marketing. Create one polished landscape 16:9 digital signage sample poster for a community club, Spanish typography. Bright fresh green and cream sports court scene with a football and basketball, energetic tasteful composition, large highly legible exact headline "DEPORTE EN EL CLUB", smaller exact line "Compartí una jornada en familia", small exact label "EJEMPLO · SIN FECHA CONFIRMADA". No dates, no invented logo, no watermark. Safe generous margins, readable on television.

La playlist repite estas dos imágenes con cuatro efectos de entrada distintos, 6 segundos por elemento y animaciones de 800 ms incluidas en ese tiempo. `transition` acepta `fade`, `slide-left`, `slide-right`, `zoom` o `none`; por omisión usa `fade`. Videos conservan reproducción nativa. Para un TV con problemas, abrir `?transitions=off`. Recargar la página para obtener el reproductor v2. Los archivos v1 se conservan para clientes antiguos.

Animate.css 4.1.1 está en vendor con licencia, fuente y huellas. La integración usa máximo dos imágenes simultáneas y elimina la anterior tras 850 ms sin esperar eventos CSS. Compatible con cambios de playlist y tolerancia a errores existentes; no certifica rendimiento de NetCast sin probar el aparato.
