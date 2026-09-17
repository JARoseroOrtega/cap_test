# cap_test - Cápac Test Quiz Application

## Visión General

Un completo sistema de examen/test CAP (Cápac Test) que permite a los usuarios realizar cuestionarios con temporizador, respuesta de preguntas y revisión de resultados. La aplicación está diseñada para ser escalable, con soporte para cientos de preguntas organizadas en secciones, seguimiento de progreso y puntuación detallada.

## Características

### 🎯 **Experiencia de Examen Principal**
- **Temporizador** con cuenta regresiva de 120 minutos (120:00) con indicadores visuales de alerta para los últimos 5 y 10 minutos
- **Sección de preguntas proporcional** - selecciona automáticamente preguntas de cada sección basada en su proporción relativa en el banco de preguntas total
- **Navegación fluida** entre preguntas, con indicadores de progreso en tiempo real
- **Interfaz de respuesta en tiempo real** con feedback instantáneo por cada pregunta seleccionada
- **Modo de examen** que desactiva la posibilidad de cambiar respuestas después de finalizar un examen

### 🔍 **Modo de Revisión**
- **Exploración de respuestas completas** - permite revisar todas las preguntas con la respuesta seleccionada y correcta mostradas
- **Navegación sin temporizador** - sin cuenta regresiva, enfocado únicamente en la revisión
- **Controles claros de volver a resultados** - permite regresar al panel de resultados desde la revisión
- **Vista de progreso** - muestra el progreso a través del banco de preguntas seleccionadas

### 📊 **Visualización de Resultados**
- **Panel de resultados detallado** con clasificación de aprobado/reprobado
- **Estadísticas por sección** - visualización de rendimiento por cada sección del examen
- **Lista de preguntas falladas** con explicación detallada de por qué cada respuesta es incorrecta
- **Gráficos de progreso** mostrando porcentaje de respuestas correctas

### 💾 **Persistencia**
- **Almacenamiento local** - guarda automáticamente el progreso del examen cada 30 segundos
- **Soporte de reanudación** - los exámenes pueden reanudarse desde donde se dejaron
- **Persistencia segura** - valida la integridad de los datos guardados

### 🎨 **Interfaz de Usuario**
- **Diseño responsive** - funciona en computadoras de escritorio, tabletas y dispositivos móviles
- **Interacción con animaciones suaves** - transiciones fluidas y efectos visuales elegantes
- **Diseño minimalista pero profesional** - interfaz centrada en la usabilidad
- **Soporte para temas** - diseño moderno con gradientes y elementos visuales atractivos

## Tecnologías Utilizadas

- **HTML5** con semántica moderna
- **CSS3** con CSS variables y diseño responsive
- **JavaScript Vanilla** - sin dependencias externas
- **LocalStorage API** - persistencia de datos
- **Document Object Model (DOM)** - manipulación dinámica
- **Flexbox y Grid** - diseño responsivo

## Uso Básico

### Iniciar un Nuevo Examen
1. Abrir `index.html` en un navegador web
2. Hacer clic en **"Continuar examen"** si hay un examen en progreso, o **"Nuevo examen"** para comenzar desde cero

### Durante el Examen
- **Navegar preguntas** - usar los botones Anterior/Siguiente o las flechas del teclado
- **Seleccionar respuestas** - hacer clic en una opción para seleccionarla
- **Visualizar progreso** - barra de progreso y contador de preguntas sin responder
- **Revisar respuestas** - hacer clic en **"Revisar preguntas"** al final para revisar todas las respuestas

### Revisar Preguntas
1. Hacer clic en **"Revisar preguntas"** desde la pantalla de resultados
2. Navegar por todas las preguntas con la respuesta seleccionada mostrada
3. Hacer clic en **"Volver a resultados"** para regresar

### Ver Resultados
- Después de completar el examen o **Terminar examen**
- Ver puntuación total, porcentaje equivalente y clasificación
- Explorar estadísticas detalladas por sección
- Revisar preguntas falladas específicas con explicación completa

## Función del Modo de Revisión

El modo de revisión permite a los usuarios revisar todas sus respuestas después de completar un examen:

### Comportamiento

- **Navegación sin temporizador** - continúa la navegación sin cuenta regresiva
- **Vista de respuestas completas** - cada pregunta muestra la respuesta seleccionada y correcta
- **Botón de volver a resultados** - permite regresar fácilmente al panel de resultados
- **Ocultación de controles específicos del examen** - timer, terminar examen y barra lateral se ocultan
- **Opciones deshabilitadas** - las opciones de respuesta están deshabilitadas pero muestran los resultados visualmente

### Activación

El modo de revisión se activa haciendo clic en **"Revisar preguntas"** en la pantalla de resultados (después de completar un examen).

### Salida

Se puede salir del modo de revisión haciendo clic en **"Volver a resultados"**, lo que regresa a la pantalla de resultados y restaura los controles del examen.

## Características Técnicas

### Selección Proporcional de Preguntas

El sistema selecciona preguntas proporcionalmente de cada sección:

```javascript
function selectProportionalQuestions(questions, target) {
    // Agrupa preguntas por sección
    // Calcula conteos basándose en la proporción de cada sección
    // Distribuye el conteo restante a las secciones con mayor fracción
    // Mezcla el orden final usando el algoritmo Fisher-Yates
}
```

### Persistir Estado del Examen

Guarda automáticamente el progreso del examen utilizando `localStorage`:

- **Tiempo restante** - continúa desde donde se detuvo
- **Preguntas seleccionadas** - identifica las preguntas del examen actual usando IDs
- **Respuestas** - guarda las respuestas seleccionadas y la corrección
- **Autoguardado** - guarda cada 30 segundos durante el examen activo

### Optimización del Desempeño

- **Cacheado de elementos DOM** - referencias rápidas a elementos que se usan con frecuencia
- **Mezclado Fisher-Yates** - algoritmo eficiente para mezclar preguntas
- **Animaciones optimizadas** - usa clases CSS en lugar de manipulación de estilos JavaScript

### Interacción con el Usuario

- **Soporte para teclado** - navegación con flechas y Enter para responder
- **Soporte para toques** - optimizado para dispositivos táctiles
- **Feedback visual** - animaciones sutiles y cambios de estado claros
- **Advertencias con accesibilidad** - anuncios claros para acciones destructivas

## Requisitos del Sistema

### Mínimos
- **Navegador web moderno** (Chrome, Firefox, Safari, Edge)
- **JavaScript habilitado**
- **20 MB de espacio libre**

### Soportado en
- Computadoras de escritorio (Windows, macOS, Linux)
- Dispositivos móviles (iOS, Android)
- Tabletas

## Compatibilidad con el Navegador

| Característica | Navegadores Mínimos |
|---------------|-------------------|
| CSS Grid      | Chrome 60+, Firefox 52+, Edge 16+, Safari 10+ |
| CSS Variables | Chrome 60+, Firefox 52+, Edge 16+, Safari 10+ |
| LocalStorage  | Todos los navegadores modernos |
| Flexbox       | Chrome 21+, Firefox 3.6+, Edge 12+, Safari 6.1+ |

## Limitaciones Conocidas

- **Modo de revisión** - la navegación de preguntas usa las flechas del teclado, pero los botones Anterior/Siguiente están deshabilitados
- **Navegación en dispositivos móviles** - algunos navegadores pueden necesitar zoom para la interacción precisa de los botones
- **Almacenamiento limitado** - depende de LocalStorage; navegadores con almacenamiento limitado pueden tener problemas
- **Deshacer no disponible** - una vez que una respuesta es seleccionada, no puede ser cambiada (comportamiento estándar de examen)

## Problemas Frecuentes

### Q: No se guarda el progreso del examen
A: Asegúrate de que `localStorage` esté habilitado en tu navegador. El sistema guarda automáticamente cada 30 segundos.

### Q: El examen se recarga accidentalmente
A: El sistema muestra advertencias para acciones destructivas como **Terminar examen** o **Nuevo examen**.

### Q: No puedo responder preguntas
A: Asegúrate de que los botones estén habilitados. En el modo de revisión, las opciones de respuesta están deshabilitadas intencionalmente.

### Q: El modo de revisión no funciona
A: El modo de revisión se activa solo después de completar un examen. Intenta completar el examen primero, ver los resultados y luego hacer clic en **Revisar preguntas**.

## Implementación del Modo de Revisión

El modo de revisión fue implementado para resolver la función faltante `enterReviewMode()` que era referenciada en `index.html:136`. Esta función:

1. **Establece el estado de revisión** (`isReviewMode = true`)
2. **Restaura la interfaz** - muestra el panel del quiz y oculta los resultados
3. **Ocultar controles específicos** - timer, terminar examen, barra lateral
4. **Actualiza los indicadores** - cambia el progreso del label para mostrar el contexto de revisión
5. **Renderiza preguntas** - con la respuesta seleccionada y correcta mostradas
6. **Restaura navegación normal** - botones Anterior/Siguiente habilitados
7. **Proporciona salida** - botón **Volver a resultados** para regresar

## Cómo Contribuir

### Reportar Problemas
1. Abre un issue describiendo el problema
2. Incluye pasos para reproducirlo
3. Comparte cualquier mensaje de error o captura de pantalla

### Agregar Preguntas
1. Edita `questions.js`
2. Sigue el formato JSON existente
3. Asegúrate de que cada pregunta tenga `id`, `section`, `question`, `options`, `answer`, `norma` y `referencia`

### Mejorar la Interfaz
1. Edita `index.html` y `style.css`
2. Haz cambios incrementales
3. Verifica el diseño en diferentes tamaños de pantalla

## Licencia

Este proyecto está disponible bajo la Licencia MIT.

## Agradecimientos

- El creador del examen CAP original por el valioso contenido de preguntas
- Todos los contribuyentes que han mejorado y mantenido este proyecto
- La comunidad de desarrolladores web por compartir recursos y mejores prácticas

## Información de Contacto

Para preguntas, reportar bugs o sugerencias:
- Revisa el archivo issues del repositorio
- Contacta al maintainer del proyecto a través de los canales adecuados

---

*Última actualización: septiembre 2026 - Versión 1.0*
