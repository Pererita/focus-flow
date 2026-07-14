# FocusFlow 🧘‍♂️💧

[![Licencia](https://img.shields.io/badge/Licencia-MIT-green.svg)](LICENSE)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue.svg)](manifest.json)
[![Open Source](https://img.shields.io/badge/Open%20Source-%E2%9D%A4-red.svg)](CONTRIBUTING.md)

**FocusFlow** es una extensión de Chrome de código abierto y diseño premium diseñada para cuidar la salud ergonómica y de hidratación de desarrolladores y profesionales que pasan largas horas frente a la pantalla.

Está construida de forma nativa bajo la arquitectura **Manifest V3**, utilizando un Service Worker de fondo y un canal Offscreen para la generación de alertas sonoras eficientes.

---

## ✨ Características Principales

*   **🧘 Recordatorio de Postura (Ergonomía):** Basado en el principio ergonómico de la regla 20-8-2 de la Universidad de Cornell. Te recuerda levantarte cada 30 minutos para realizar estiramientos leves por 2 minutos.
*   **💧 Control de Hidratación:** Alarma inteligente horaria para recordarte beber agua de forma regular, manteniendo la concentración y previniendo la fatiga. Incluye contador regresivo activo y registro diario de consumo.
*   **📊 Historial de Actividad Local:** Panel de control de rendimiento diario con visualización de pausas completadas y porcentaje de agua consumida. Filtros dinámicos (7 días, 30 días, 90 días, anual, todo) y paginación rápida.
*   **📥 Exportación a Excel (CSV):** Descarga todo tu historial en formato CSV compatible con Microsoft Excel y Google Drive/Sheets (delimitado con punto y coma y directiva `sep=;` integrada).
*   **🕒 Horario Laboral Inteligente:** Configuración de rangos de trabajo y pausa de almuerzo para suspender automáticamente las alarmas fuera de tu horario y fines de semana.

---

## 🛠️ Arquitectura Técnica (Manifest V3)

La extensión utiliza una arquitectura asíncrona desacoplada de alto rendimiento:

1.  **Service Worker (`background.js`):** El motor principal de la extensión. Administra el ciclo de vida de las alarmas con `chrome.alarms` e intercepta el almacenamiento. Ajusta las fechas de disparo calculando exclusiones de almuerzo y jornadas inhábiles.
2.  **Offscreen Document (`offscreen.html` / `offscreen.js`):** En cumplimiento estricto con Manifest V3, el Service Worker abre un iframe oculto en segundo plano para acceder a la Web Audio API y reproducir pitidos sintetizados nítidos de alta ganancia (0.8), evitando la descarga de pesados archivos MP3.
3.  **Popup UI (`popup.html` / `popup.js`):** Panel interactivo rápido del usuario con transiciones CSS optimizadas de Tailwind v4. Refresca la cuenta regresiva del agua y la postura cada segundo leyendo el storage de Chrome.
4.  **Options Dashboard (`options.html` / `options.js`):** El panel de control de configuraciones avanzadas del usuario y renderizado reactivo del historial de actividad en tiempo real.

---

## 💻 Instalación y Desarrollo Local

Para cargar la extensión en modo de desarrollo en tu navegador:

1.  Descarga o clona el código en una carpeta local de tu máquina.
2.  Abre Google Chrome y navega a la dirección: `chrome://extensions/`.
3.  Activa el interruptor de **Modo de desarrollador** en la esquina superior derecha.
4.  Haz clic en el botón **Cargar descomprimida** (Load unpacked) en la esquina superior izquierda.
5.  Selecciona la carpeta raíz del proyecto (donde se encuentra el archivo `manifest.json`).

---

## 📦 Empaquetado y Distribución

Para subir la extensión a la **Chrome Web Store Console**, se debe subir un único archivo comprimido en formato `.zip` que contenga únicamente los recursos de producción.

### 📋 Archivos a Incluir en el ZIP:
*   `manifest.json` (Configuración obligatoria de la extensión)
*   `background.js` (Service Worker)
*   `popup.html` y `popup.js` (Popup interactivo)
*   `options.html` y `options.js` (Panel de opciones e historial)
*   `offscreen.html` y `offscreen.js` (Sintetizador de sonido)
*   `style.css` (Estilos compilados de Tailwind v4)
*   `icons/` (Carpeta con todos los iconos PNG de producción: `icon16.png`, `icon48.png`, `icon128.png`, `icon.ico`)

### ❌ Archivos a Excluir (Ignorados por Git en `.gitignore`):
*   La carpeta de desarrollo y control de versiones `.git/`
*   El archivo `.gitignore`
*   El archivo de empaquetado `.zip` compilado
*   La carpeta de capturas de pantalla de la tienda `images/`
*   El archivo `README.md`
*   Cualquier script temporal (`package.json`, `package-lock.json`, `.temp_tailwind/`)

### ⚡ Comando de PowerShell para Empaquetar (Windows):
Ejecuta el siguiente comando en PowerShell estando posicionado en la raíz de la extensión para generar de forma inmediata el archivo ZIP limpio:

```powershell
Compress-Archive -Path manifest.json, background.js, popup.html, popup.js, options.html, options.js, offscreen.html, offscreen.js, style.css, icons -DestinationPath focus-flow.zip -Force
```

---

## 🔒 Privacidad de Datos
**FocusFlow** respeta la privacidad de tu información. Todos los datos de configuración, tiempos de descanso e historial de hidratación son almacenados localmente en la base de datos interna de tu navegador a través de `chrome.storage.local`. **Ninguna información se recopila ni se transfiere fuera de tu equipo.**

---

## 🤝 Comunidad y Licencia
Este proyecto es de código abierto y está abierto a la participación de la comunidad:
*   Para saber cómo colaborar, reportar errores o enviar mejoras, lee nuestra [Guía de Contribución](CONTRIBUTING.md).
*   En todas nuestras interacciones promovemos un entorno amigable regulado por nuestro [Código de Conducta](CODE_OF_CONDUCT.md).
*   El código de este proyecto está distribuido bajo la [Licencia MIT](LICENSE). Puedes usarlo, modificarlo y compartirlo libremente.
