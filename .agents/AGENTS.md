# Reglas del Agente para FocusFlow

Este archivo define las directrices y constricciones obligatorias para cualquier agente de IA que trabaje en el proyecto **FocusFlow**.

---

## 1. Convención de Confirmaciones de Git (Conventional Commits 1.0.0)
Todos los commits deben seguir estrictamente el estándar de **Conventional Commits 1.0.0** con las siguientes directrices específicas:
*   **Idioma:** Título, cuerpo y pie de página redactados **100% en español**.
*   **Tipo (Prefijo):** Debe estar en inglés y ser uno de los siguientes estándar: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`.
*   **Modo Verbal:** Iniciar la descripción corta siempre con un verbo en **infinitivo** (ej: `feat: implementar...`, `fix: corregir...`).
*   **Formato de Título:** Menos de 50 caracteres si es posible (máximo absoluto de 72), en minúsculas y **sin punto final**.
*   **Estructura:** Dejar una línea en blanco entre el título y el cuerpo del mensaje si este último es necesario.

---

## 2. Minimalismo y Prevención de Sobreingeniería (Ponytail & DRY)
*   **Limpieza de Workspace:** Al utilizar herramientas de compilación o utilidades externas (como instalar dependencias npm de Tailwind, Sharp, etc. en la raíz para generar estilos o iconos), se deben **eliminar por completo** de forma inmediata los archivos temporales (`node_modules`, `package.json`, `package-lock.json`, `.temp_tailwind`, scripts temporales) antes de dar por terminado el turno. El repositorio en producción debe mantenerse libre de código y dependencias de desarrollo redundantes.
*   **Soluciones Nativas:** Priorizar las APIs nativas del navegador (como Web Audio API para generación de audio sintetizado a través de Offscreen Documents) en lugar de importar reproductores o librerías de audio pesadas externas.

---

## 3. Seguridad de Extensiones de Chrome (CSP & Manifest V3)
*   **Cero Eventos Inline:** Queda prohibido el uso de manejadores de eventos inline en los archivos HTML (`onclick`, `onchange`, etc.). Todos los eventos deben asociarse de manera programática en archivos JS separados mediante `addEventListener()`.
*   **Cero Scripts Externos:** No se permiten llamadas a scripts externos o de CDNs remotos en los HTML. Todos los recursos de Javascript y CSS deben ser locales y cargarse de forma interna para no violar la directiva `script-src 'self'`.
*   **Compilación de Tailwind v4:** La compilación de Tailwind v4 debe ejecutarse siempre con el directorio de trabajo (`Cwd`) en la **raíz del proyecto** para escanear correctamente los HTMLs y JS de la UI.
*   **Safelist en HTML:** Al usar clases dinámicas inyectadas por JS para cambios de estado (pestañas activas, estilos condicionales, etc.), se deben declarar de forma explícita en un bloque de comentarios HTML al final del archivo para asegurar que el compilador las incluya en la hoja de estilos de salida (`style.css`).

---

## 4. Calidad Visual y Supersampling de Recursos
*   **Nitidez Cristalina:** Para evitar bordes borrosos o pixelación del logotipo en las vistas HTML (`popup.html`, `options.html`) sobre pantallas HiDPI/Retina, se debe enlazar siempre la imagen de mayor resolución disponible (`icons/icon128.png` en lugar de `icon48.png`) y reducir sus dimensiones lógicas a través de las clases de CSS correspondientes (ej: `class="w-8 h-8 object-contain"`).

---

## 5. Idioma de la Interfaz
*   Toda la interfaz de usuario, diálogos, notificaciones del sistema y configuraciones deben mantenerse en **Español**, conservando únicamente el nombre del producto **FocusFlow** en inglés.
