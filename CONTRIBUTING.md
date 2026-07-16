# Guía de Contribución a FocusFlow

¡Gracias por tu interés en contribuir a **FocusFlow**! Como proyecto Open Source, valoramos enormemente las contribuciones de la comunidad para mejorar la salud ergonómica de los desarrolladores en todo el mundo.

---

## ¿Cómo puedo contribuir?

### 1. Reportar Errores (Bugs)
Si encuentras un error o comportamiento inesperado:
*   Asegúrate de estar utilizando la última versión de la extensión.
*   Busca en los [Issues](https://github.com/Pererita/focus-flow/issues) existentes para ver si alguien ya ha reportado el mismo problema.
*   Si es un error nuevo, abre un nuevo Issue describiendo:
    *   Pasos para reproducir el error.
    *   Comportamiento esperado y comportamiento real.
    *   Capturas de pantalla o logs de error de la consola de Chrome si están disponibles.

### 2. Proponer Nuevas Funcionalidades
¡Nos encanta escuchar nuevas ideas!
*   Abre un Issue detallando la funcionalidad propuesta, el beneficio que aporta y cómo te imaginas que debería interactuar con el usuario.

### 3. Enviar Pull Requests (PRs)
Si deseas escribir código para solucionar un bug o implementar una nueva funcionalidad:
1.  Realiza un **Fork** del repositorio.
2.  Crea una rama de trabajo descriptiva a partir de `main` (ej: `feature/nueva-alarma` o `fix/corregir-contador`).
3.  Escribe el código siguiendo el diseño premium y minimalista establecido (Tailwind CSS v4 y JavaScript Vanilla).
4.  Asegúrate de que no haya código de desarrollo temporal antes de proponer cambios.
5.  Abre un Pull Request hacia la rama `main` del repositorio original describiendo detalladamente los cambios realizados.

---

## Convención de Confirmaciones de Git (Conventional Commits)
Para mantener un historial de cambios limpio y legible, todos los mensajes de commit de este proyecto deben seguir estrictamente el estándar de **Conventional Commits 1.0.0** y redactarse en **español**:

Estructura:
```text
<tipo>(<alcance-opcional>): <descripción corta en minúsculas y sin punto final>
```

Tipos estándares permitidos:
*   `feat`: Una nueva funcionalidad.
*   `fix`: Corrección de un error.
*   `docs`: Cambios en la documentación.
*   `style`: Formato o cambios de diseño que no afectan el comportamiento del código.
*   `refactor`: Reestructuración de código sin cambios lógicos.
*   `perf`: Mejoras de rendimiento.
*   `chore`: Tareas de mantenimiento o configuración.

---

## Código de Conducta
Al participar en este proyecto, te comprometes a seguir y respetar nuestro [Código de Conducta](CODE_OF_CONDUCT.md) en todas las interacciones de la comunidad.
