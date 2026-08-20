# Curia — apertura cinematográfica: el despacho recorrido por scroll

Diseño de la apertura de la landing de Curia: un despacho en 3D que el
visitante atraviesa con el scroll, con el contenido real de la landing viviendo
dentro del espacio.

Estado: **revisado y rechazado por Sebastián el 2026-08-20 — 5/10 contra un
mínimo de 9.5 para producción.** La secuencia y su arquitectura técnica se
conservan; la sección 7 (materiales y luz) y la 5 (composición) quedan
invalidadas por la revisión de la sección 0. Leer la sección 0 primero.

---

## 0. Revisión de Sebastián y tesis corregida

### Qué falló

Verificado que no fue caché: el servidor entregaba el código de los cuatro
commits (`jacket`, `chair.rotation.y`, `safe:`, `dataset.safe`, `plankTexture`
presentes en los módulos servidos). Los cambios estaban vivos y aun así no
registraron. No eran los cambios que importaban.

El error de método: estuve puntuando el avance con un modelo de visión que
devolvía 7.5/10 mientras el juicio real era 5/10. Optimicé contra un proxy en
vez de comparar contra la referencia. La comparación lado a lado a igual
viewport está en `docs/reference/comparacion-referencia-vs-demo.png`.

### La tesis estaba equivocada, no incompleta

La referencia no gana por detalle. Gana por **restricción y dirección de arte**:
cuatro tonos por escena, seis a ocho objetos protagonistas cuidados, vacío
deliberado como recurso, tipografía pequeña e integrada en el espacio, y
encuadres con tensión compositiva.

Perseguir fotorrealismo —veta, oclusión, desgaste, normal maps— fue la
dirección equivocada. El diagnóstico externo del comparativo es explícito: la
brecha no es fidelidad de render, es **intencionalidad en cada escala**.

### Los siete puntos de esta vuelta

1. **El contenido va montado sobre los muros**, como arquitectura del espacio,
   no como bloque de texto flotando en una esquina del viewport. Los muros
   tienen metros libres; el texto de cada capítulo y las tarjetas de las
   secciones de Curia se cuelgan en ellos, en perspectiva. El modal con scrim
   se elimina: hoy lee como UI de videojuego atornillada al fondo.
2. **La cámara entra de verdad al monitor.** Un capítulo cuyo encuadre final es
   la interfaz de Curia legible, no una sala donde la pantalla mide 388 px.
3. **Tiene que leerse como despacho de abogados mexicano.** Falta densidad y
   falta iconografía legible: libreros con volúmenes distintos y lomos
   variados, códigos y tomos empastados, cédulas y diplomas enmarcados,
   expedientes atados, sellos. La biblioteca hoy es un mueble repetido tres
   veces por lado.
4. **Menos objetos, mejores.** El comparativo describe el estado actual como
   inventario disperso. Se sustituye por pocas piezas protagonistas con
   proporción y factura cuidadas.
5. **Paleta disciplinada por sala**, con bloques de color decididos y un acento
   que signifique algo. Hoy es beige sobre beige roto por acentos que se leen
   añadidos.
6. **Encuadres compuestos**, no vistas isométricas centradas. Profundidad en
   capas: primer plano, arquitectura media, fondo.
7. **La fluidez es requisito, no variable de ajuste.** Bajó de 61 a 54 fps y se
   siente. Hay que recuperarla y subir calidad a la vez: hornear lo que es
   estático en vez de recalcularlo por frame.

### Fuera de alcance en esta vuelta

Motion Anything: retirado por indicación de Sebastián hasta nuevo aviso.

---

## 1. Objetivo

La landing en producción es correcta pero convencional: doce secciones
editoriales, ninguna imagen, ningún video, ningún canvas. La apertura debe
hacer *sentir* la promesa que el copy ya declara —"inteligencia legal que
trabaja mientras tú no estás", "del aviso al escrito, el contexto permanece en
el expediente"— sin cambiar el mensaje ni la identidad.

Criterio rector: **el movimiento revela causalidad, no decora.** Si al quitar
la animación el visitante entiende lo mismo, la animación no servía.

## 2. Fuente de verdad

| Qué | Dónde |
|---|---|
| Código en producción | `origin/main` (`7930588`), 14 componentes en `src/sections/` |
| Copy canónico | `docs/landing-copy.md` |
| Tokens de marca | `--curia-*` en `src/style.css` |
| Capa de motion existente | `motion` v12, `AmbientBackground.tsx`, `Reveal.tsx`, `motion.ts` |
| Referencia visual desplegada | `docs/reference/produccion-desktop-1440.png`, `-mobile-390.png` |

Producción y `main` son idénticos en código: los commits posteriores al último
despliegue no tocan `src/`.

No se introduce ninguna paleta ni familia tipográfica nueva. Los tonos de
material del 3D son oscurecimientos o aclaramientos de los tokens existentes,
más el ámbar `#c9a75b` que ya vive en `AmbientBackground.tsx`.

## 3. Referencia de arquitectura

`virtualwellbeinghub.ca`, diseccionada: un solo GLB de 2.65 MB, materiales
matcap, coreografía de cámara exportada de Theatre.js, canvas sticky, UI real
en HTML anclada encima, 6.9 pantallas de scroll, **cero video**.

Se adopta su arquitectura —WebGL en tiempo real, canvas pinneado, UI real
encima— y se rechazan dos de sus decisiones:

- **Matcaps.** Dejan los muros planos sin profundidad. Se usa PBR con rig de
  luz, que en un interior lee mejor.
- **Theatre.js.** La coreografía vive en un modelo puro y testeable, no en un
  JSON exportado de un editor.

Del portafolio `sebastiangmz.dev` se toma el ritmo **detener/viajar** y la
disciplina de modelo puro + driver separados.

## 4. Estructura de la secuencia

Cinco capítulos que siguen el `morningSequence` del copy de producción, en su
mismo orden. No es una narrativa inventada: es la que Curia ya escribió.

| # | Capítulo | Sala | Acento | Lado libre | Cámara x / z |
|---|---|---|---|---|---|
| 1 | Monitoreo judicial | Recepción | teal | izquierda | −1.10 / 3.05 |
| 2 | Plazos y Outlook | Oficina privada | ámbar | derecha | −0.45 / 0.80 |
| 3 | Biblioteca y OCR | Archivo | teal profundo | izquierda | −1.30 / 3.00 |
| 4 | Asistentes con contexto | Sala de juntas | teal claro | derecha | 1.85 / 3.50 |
| 5 | Reference Evaluator | Biblioteca jurídica | teal | izquierda | 0.35 / 3.00 |

### Ritmo

Meseta y tránsito alternados, con pesos: `HOLD_WEIGHT = 1`,
`TRAVEL_WEIGHT = 1.4`. Cinco mesetas y cuatro tránsitos dan un
**presupuesto de 10.6 viewports**. En la meseta la cámara se detiene para que
se lea el texto; en el tránsito viaja.

El modelo puro `resolveSequence(timeline, progress)` devuelve
`{ progress, pathT, chapterIndex, segmentProgress, holding }`. Acepta un objeto
`target` para no asignar memoria por frame. Diez pruebas cubren: alternancia y
cobertura sin huecos, inmovilidad durante la meseta, monotonía sobre la curva,
extremos exactos, saturación fuera de rango, y reutilización del objeto.

### Geometría del espacio

Enfilade de cinco salas de 9 × 9 × 3.6 m, muro de 0.25 m, paso de 9.25 m entre
centros. Vanos de 2.4 × 2.5 m que **alternan de lado**, así que la cámara
serpentea en vez de atravesar un túnel recto. Altura de ojo 1.56 m.

La cámara recorre un bezier cuadrático por tramo con el punto de control **en
el vano**, de modo que cruza la puerta en vez de cortar la esquina.

## 5. Composición y zonas seguras

Cada capítulo declara `safe: "left" | "right"`: la mitad del encuadre libre de
mobiliario. El copy y las marcas de capítulo se mueven a esa mitad, de forma
que el contenido real **nunca compite con el sujeto de la sala**.

Medido a 1440 px: el bloque de texto queda en `x=72` o `x=888`, con 480 px de
ancho útil. La sala de juntas se reencuadró desde un extremo de la mesa porque
su mitad derecha no estaba libre.

Un scrim claro muy tenue detrás del texto resuelve el contraste: el gris
secundario pierde legibilidad sobre duela y estantería.

## 6. Interfaz real dentro de la escena

En la oficina privada, la vista de operación diaria de Curia vive **dentro de
la pantalla del monitor**, renderizada con `CSS3DRenderer`: es HTML real puesto
en perspectiva, no una textura horneada. El texto sigue siendo texto
seleccionable y accesible.

- Elemento de 1320 × 825 px escalado 0.001 → pantalla de 1.32 × 0.825 m dentro
  del bisel 3D.
- La cámara de ese capítulo se acerca a 0.8 m del centro de sala: la pantalla
  pasa de 218 px a 388 px de ancho.
- Se oculta fuera de su sala, porque el DOM siempre se dibuja sobre el WebGL y
  se vería atravesando los muros.
- Brillo reducido y reflejo tenue: el HTML no pasa por el tone mapping del
  render y salía a blanco puro, con 4.44 % de píxeles quemados.

Contenido: navegación (Inicio, Expedientes, Biblioteca, Investigación), avisos
para revisar con tres expedientes reales del copy, plazo calculado y estado de
referencia jurídica. Todo marcado como vista ilustrativa.

## 7. Sistema de materiales y luz

Siete reglas, cada una derivada de un defecto observado y medido:

1. **La arquitectura no proyecta sombra, sólo la recibe.** Con el techo
   proyectando bloqueaba el sol entero y el interior quedaba en luz ambiental
   plana.
2. **El sol entra rasante por la ventana de la sala activa.** Una luz
   direccional que baja desde arriba no existe dentro de un edificio. Su
   *shadow map* viaja con la cámara: 2048 px sobre la sala visible en vez de
   repartidos sobre los 46 m del enfilade.
3. **Environment map obligatorio** (`RoomEnvironment` vía PMREM,
   `envMapIntensity` 1.15). Sin él ningún material PBR tiene qué reflejar y
   todo se lee como plástico.
4. **Oclusión ambiental** (`GTAOPass`, radio 0.62 m, intensidad 1). Sin ella el
   encuentro muro-piso y el hueco bajo un mueble reciben la misma luz que una
   superficie abierta.
5. **Aristas redondeadas** en las piezas que la cámara ve de cerca. Una arista
   perfectamente viva es uno de los delatores más fuertes de render sintético.
6. **Texturas procedurales con normal map derivado del color.** Sin relieve, la
   veta es sólo una mancha y la superficie sigue siendo un plano ante la luz
   rasante. La duela marca junta (4.2), el yeso casi nada (1.1).
7. **Desgaste en el mapa de rugosidad.** Una superficie sin uso responde a la
   luz de forma perfectamente uniforme.

Cero assets externos: todas las texturas se dibujan en canvas al arrancar.

### Presencia sin figuras

El despacho se lee como recién dejado: silla girada, saco en el respaldo, taza
a medio terminar, lentes sobre el expediente, hojas abanicadas. **No se usan
figuras humanas** — el brief las excluye y una figura 3D genérica abarata la
pieza.

### Descartado

Un charco de luz pintado con un plano aditivo sobre el piso. Se leía como
calca. Se resolvió haciendo que el parteluz proyecte sombra real, con la
precisión del *shadow map* recalibrada (near 3, far 19, bias −0.00035,
normalBias 0.05, radius 2.5) para eliminar el moteado.

## 8. Rendimiento y degradación

- Dos niveles de calidad por capacidad, no por navegador: puntero grueso o
  GPU integrada antigua → `low`, que apaga antialias, sombras y
  postprocesado, y limita el pixel ratio.
- Nada corre fuera del viewport (`IntersectionObserver`) ni con el documento
  oculto.
- Geometría unitaria compartida y caches de material, textura y normal map por
  firma.
- Medido en M5, Chromium headless a 1440×900: **entre 54 y 61 fps** según la
  sala (la penumbra suave del parteluz es lo que cuesta), cero errores de
  consola, exposición 185–229 sobre 255 con 0.01 % de píxeles quemados y 0 % de
  negros aplastados.
- Peso: la demo pesa 150 kB gzip (three.js es casi todo) en **su propia entrada
  de Vite**. La landing sigue en 123 kB gzip sin pagar three.js.

## 9. Móvil

Se rediseña, no se comprime:

- FOV que se abre en retrato hasta un tope de 58° — el fijo de 40° dejaba techo
  vacío y recortaba los lados.
- Copy en tarjeta con scrim claro y `backdrop-filter`, separado 50 px de la
  navegación.
- Marcas de capítulo en fila horizontal centrada abajo, con área táctil de
  44 × 44 px.

## 10. Accesibilidad y fallbacks

- `prefers-reduced-motion`: sin amortiguación, sin deriva de cámara, sin
  animación de entrada del texto. El recorrido sigue siendo navegable.
- Marcas de capítulo como `<button>` con `aria-label` y `aria-current`.
- El canvas es decorativo; todo el contenido informativo es HTML.
- La navegación por capítulos permite saltar sin scrollear.

## 11. Integración con la landing

**Propuesta, pendiente de confirmar.** La apertura sustituye el rol visual del
hero actual pero conserva su contenido: el H1, el subhead y los dos CTAs se
mueven a la zona segura del primer capítulo. Tras el quinto capítulo el
documento continúa en flujo normal con las doce secciones intactas.

La alternativa —apertura antes del hero, hero comprimido después— deja el CTA
principal a más de 10 viewports de profundidad y se descarta salvo indicación
contraria.

### Contrato del port a React

- Los módulos `sequence.ts` y `rooms.ts` se copian **tal cual**: son funciones
  puras y datos, sin DOM.
- La escena y el driver se montan en un `useEffect` con guarda; el componente
  sólo renderiza el contenedor y el contenido semántico.
- El scrub escribe cámara y `dataset` de forma imperativa. **El DOM se escribe
  sólo al cambiar de capítulo, nunca por frame.**
- Frontera explícita con `motion` v12: lo declarativo (reveals, `AmbientBackground`)
  sigue en React; el scrub vive fuera de su ciclo.
- `AmbientBackground` se conserva en el resto de la página. No hay dos fondos
  animados compitiendo: durante la apertura, el fondo es la escena.

## 12. Decisiones abiertas

1. **Confirmación de los siete puntos de la sección 0** como brief de la vuelta
   de rediseño.
2. **Cómo se injerta en la landing** (sección 11): la propuesta es que la
   apertura sustituya el rol visual del hero y herede su H1, subhead y CTAs.

Motion Anything sale de las decisiones abiertas: retirado por indicación de
Sebastián. Se retomará cuando él lo indique.

## 13. Gate de aceptación

Falla si:

- El primer viewport se parece a un hero de SaaS de dos columnas.
- El 3D aparece dentro de una tarjeta redondeada.
- La página podría representar ciberseguridad o fintech cambiando etiquetas.
- El flujo de producto queda menos inspeccionable que la landing actual.
- Más de una idea visual dominante compite en un viewport.
- El movimiento decora en vez de revelar causalidad.
- Escritorio y móvil no tienen composición deliberada.

Pasa si, además de lo anterior:

- El scroll causa una transformación coherente y visible.
- El flujo de la mañana es legible al llegar al capítulo de revisión.
- La interfaz de producto se lee sin hacer zoom.
- 50 fps o más sostenidos en el equipo de referencia, sin píxeles quemados.
- El bundle de la landing no crece por la apertura.

## 14. Fuera de alcance

- Seedance y cualquier generación de video: la referencia no usa video y la
  arquitectura elegida no lo necesita.
- Meshy: la geometría es paramétrica; sus mallas de preview traían 483 k
  triángulos por objeto, inservibles para web.
- Figuras humanas.
- Rediseño del contenido o de la estructura de las doce secciones.
- Cambios de paleta o tipografía.
