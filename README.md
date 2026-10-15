# Pantalla de propaganda del club

Primera implementación local, 15/10/2026. El directorio estaba vacío al revisarlo; no había código ni configuración que preservar. Este chat se vinculó al proyecto de Codex existente.

## Uso

1. Crear un repositorio público en GitHub y subir este directorio (sin credenciales). No se creó ni publicó un repositorio automáticamente.
2. En Settings → Pages seleccionar Deploy from a branch, rama main, carpeta raíz. Abrir la URL HTTPS que informe GitHub, incluyendo el subdirectorio del repositorio.
3. Abrir `/admin/` desde una computadora moderna. Preparar JSON y descargarlo; subir los medios a `media/` y reemplazar `playlist.json` con la sesión autenticada de GitHub. También se puede editar el JSON directamente desde GitHub.
4. Abrir la raíz en el televisor. Si hace falta, presionar Iniciar con el control remoto. Video silenciado por defecto.
5. Usar la misma URL en 1–5 televisores. Reproducción independiente, sin sincronización entre pantallas.

No abrir como `file://`: la playlist se obtiene por HTTP. Para desarrollo, cualquier servidor estático sirve la raíz. No requiere instalación, compilación, PHP ni base de datos.

Ver `docs/ARQUITECTURA.md` para decisiones, restricciones, evaluación de bibliotecas y prueba en el LG. Ejecutar `node --test tests/*.test.cjs` para validar contrato y comportamiento del reproductor.
