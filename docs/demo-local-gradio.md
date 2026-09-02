# Demo local interactiva con Gradio

## Estado

Propuesta para una implementación futura. No forma parte de la landing actual y no autoriza cambios en producción, conexiones a sistemas reales ni tratamiento de expedientes de clientes.

## Objetivo

Convertir el workflow visual de Curia en una demostración funcional que ejecute operaciones reales sobre un expediente sintético. La persona usuaria debe poder ver, en cada etapa:

1. qué información recibió Curia;
2. qué operación realizó;
3. qué resultado produjo;
4. qué debe revisar una persona abogada.

La primera versión debe correr localmente, no guardar resultados en una base de datos y no usar PII, credenciales productivas ni actuaciones reales.

## Decisión arquitectónica recomendada

Gradio no puede ejecutarse dentro del runtime de Cloudflare Workers. La integración debe separar la presentación de la ejecución:

- **React/TanStack Start:** conserva el workflow visual, los controles y el estado presentado al usuario.
- **Gradio/Python local:** ejecuta OCR, búsqueda, cálculos, recuperación documental y evaluación.
- **`@gradio/client`:** conecta el navegador con el servicio local.
- **`gr.Workflow`:** define y permite inspeccionar el pipeline técnico durante desarrollo.
- **Funciones Python puras:** implementan los nodos y se comparten entre el Workflow técnico y el endpoint consumido por React.

Durante desarrollo, las superficies serían:

```text
Landing React:  http://localhost:4176
Gradio Python:  http://localhost:7860
```

Una landing desplegada públicamente no puede llamar al `localhost` del equipo de desarrollo: para una demo pública futura, Gradio tendría que desplegarse como un servicio Python separado. Puede seguir siendo stateless y efímero, pero ya no sería literalmente local.

### Por qué no usar un iframe como experiencia final

Un iframe con el canvas completo de Gradio serviría para una prueba interna rápida, pero introduciría una segunda interfaz, estilos ajenos a Curia y una experiencia parecida a un editor técnico. La experiencia final debe conservar el componente React actual y actualizar cada nodo sólo cuando termine su operación real.

Los endpoints generados por Workflows permiten ejecutar pipelines completos. El JavaScript Client también expone estados generales de trabajo (`pending`, `generating`, `complete`, `error`) y resultados iterativos. Para indicar con precisión qué nodo terminó, conviene exponer un generador de demostración que emita eventos tipados por etapa.

```ts
interface CuriaDemoEvent {
  readonly runId: string;
  readonly step:
    | "monitoring"
    | "ocr"
    | "deadline"
    | "calendar"
    | "answer"
    | "references";
  readonly status: "running" | "complete" | "warning" | "error";
  readonly summary: string;
  readonly output: Record<string, unknown>;
}
```

React mantendría el historial de la ejecución en memoria. Recargar la página lo eliminaría.

## Demo recomendada: un expediente de principio a fin

La demo debe usar exclusivamente fixtures sintéticos versionados, por ejemplo:

```text
expediente-123-2026.json
boletin-jalisco-demo.html
acuerdo-123-2026-scan.pdf
calendario-procesal-demo.json
referencias-sjf-demo.json
```

El corpus SJF sería un snapshot pequeño de demostración, no una consulta en vivo ni una representación de cobertura completa.

### 1. Registro y monitoreo

**Interacción**

La persona selecciona el expediente ficticio `123/2026` y ejecuta “Buscar movimientos”.

**Operación real**

- Abrir el boletín local.
- Normalizar los números de expediente.
- Buscar coincidencias.
- Extraer fecha, juzgado, movimiento y fuente.

**Resultado visible**

```text
Expediente: 123/2026
Coincidencia: encontrada
Movimiento: acuerdo publicado
Fuente: boletín local de demostración
```

La etapa demuestra que Curia relaciona un movimiento con un expediente concreto, no que presenta una alerta genérica.

### 2. Documento y OCR

**Interacción**

La persona abre el acuerdo sintético y ejecuta o repite el OCR.

**Operación real**

- Procesar una página escaneada con un motor local.
- Extraer texto y números de página.
- Calcular advertencias o confianza cuando el motor lo permita.

**Resultado visible**

- Imagen original.
- Texto extraído.
- Fragmentos con página.
- Estado de procesamiento y advertencias.

Tesseract u otro motor local reproducible sería suficiente para el primer prototipo. Usar Gemini o Mistral ofrecería mayor paridad con producto, pero dejaría de ser una ejecución completamente local.

### 3. Propuesta de plazo

**Interacción**

La persona selecciona el fragmento con la notificación y pulsa “Calcular fecha de trabajo”. Puede corregir la fecha detectada y recalcular.

**Operación real**

- Extraer la fecha de notificación.
- Aplicar una regla ficticia y determinista.
- Excluir fines de semana y días inhábiles del calendario local.

**Resultado visible**

```text
Fecha detectada: 02 sep 2026
Regla aplicada: 5 días hábiles
Vencimiento propuesto: 09 sep 2026
Estado: revisión profesional requerida
```

La interfaz debe presentar el resultado como propuesta de trabajo, nunca como asesoría jurídica o fecha definitiva.

### 4. Evento para Outlook

**Interacción**

La persona revisa título, fecha y recordatorio y pulsa “Generar evento”.

**Operación real**

- Construir un evento iCalendar válido.
- Generar un archivo `.ics` en memoria.
- Permitir descargarlo y abrirlo con Outlook u otro calendario.

**Resultado visible**

- Título y fecha.
- Expediente relacionado.
- Recordatorio.
- Vista del contenido generado.

Esto produce un artefacto real sin Microsoft Graph, permisos de terceros ni credenciales.

### 5. Biblioteca y consulta documental

**Interacción**

La persona elige qué documentos usar y selecciona una pregunta sugerida o escribe una pregunta breve y sin datos personales.

Ejemplo:

> ¿Qué actuación debe revisarse antes del vencimiento?

**Operación real**

- Fragmentar el texto OCR.
- Crear embeddings localmente.
- Mantener el índice vectorial sólo en RAM.
- Recuperar los fragmentos relevantes.
- Construir una respuesta extractiva o usar un modelo local opcional.

**Resultado visible**

- Respuesta.
- Documento, página y fragmento utilizados.
- Fuentes seleccionadas y excluidas.

La etapa debe mostrar que la respuesta está limitada a las fuentes elegidas del expediente.

### 6. Reference Evaluator

**Interacción**

La persona selecciona una referencia de la respuesta y pulsa “Evaluar”.

**Operación real**

- Normalizar la referencia.
- Compararla contra el snapshot JSON local.
- Calcular coincidencias exactas y parciales.
- Aplicar reglas deterministas de clasificación.

**Resultado visible**

```text
Resultado: verificada / incierta / incorrecta
Coincidencia encontrada: …
Fuente consultada: snapshot SJF de demostración
```

La interfaz nunca debe presentar este resultado como una consulta en vivo al SJF.

## Presentación de cada nodo

Cada nodo debe exponer cuatro bloques consistentes:

```text
Qué recibió
Qué hizo Curia
Qué produjo
Qué debe revisar la persona abogada
```

Ejemplo para Plazo:

```text
Recibió:
Fecha y texto del acuerdo.

Procesó:
Extracción de fecha y calendario de días hábiles.

Produjo:
09 sep 2026.

Revisión requerida:
Confirmar el documento original y la legislación aplicable.
```

El avance visual debe depender de los eventos reales del backend. No se deben simular tiempos ni marcar una etapa como completa antes de recibir su resultado.

## Variantes útiles

### Flujo con incertidumbre

Permitir seleccionar uno de estos escenarios:

- ejecución exitosa;
- OCR con baja confianza;
- fecha no encontrada;
- calendario no disponible;
- referencia incierta;
- referencia incorrecta.

El objetivo es demostrar que Curia hace visibles sus límites y requiere revisión humana.

### Desafía al Reference Evaluator

Ofrecer una referencia correcta, una incompleta y una inventada. La persona elige una y observa la comparación real y la explicación del estado asignado.

Es una alternativa pequeña para una primera demo pública futura.

### Laboratorio documental

Ofrecer tres documentos preinstalados:

- PDF digital;
- acuerdo escaneado;
- fotografía con mala calidad.

La persona compara OCR, fragmentación, selección de fuentes y respuestas documentadas.

### Puntos de intervención humana

La demo puede permitir:

- aceptar o rechazar el movimiento;
- corregir la fecha detectada;
- confirmar el plazo propuesto;
- seleccionar documentos;
- decidir si una referencia puede utilizarse.

Cualquier intervención debe cambiar persistentemente el workflow a modo manual, como ya hace la demo visual actual.

## Persistencia, privacidad y limpieza

La primera versión debe:

- evitar uploads libres;
- usar sólo fixtures sintéticos incluidos en el proyecto;
- mantener resultados de interfaz en memoria React;
- mantener índices y resultados Python dentro de la ejecución;
- usar un directorio temporal por ejecución y eliminarlo en `finally`;
- cancelar el trabajo cuando la persona reinicia la demo;
- evitar R2, KV, D1, SQLite y bases vectoriales persistentes;
- no registrar prompts, documentos, nombres ni resultados;
- eliminar cualquier estado al reiniciar la página o el proceso local.

Los pesos de un modelo local y los fixtures pueden permanecer en disco; no son resultados de usuario.

Si una versión posterior acepta uploads, debe considerar que Gradio almacena archivos subidos y generados en su caché temporal. Será obligatorio limitar tamaño y tipo, configurar TTL y limpieza de caché y eliminar recursos al desconectarse. “Sin base de datos” no significa automáticamente “sin archivos persistentes”.

## Alcance inicial recomendado

1. Match real contra un boletín local.
2. OCR real de un acuerdo sintético.
3. Cálculo determinista de plazo.
4. Generación real de `.ics`.
5. Consulta documental local.
6. Evaluación contra un snapshot JSON.
7. Streaming de resultados al workflow React actual.
8. Escenario normal y un escenario de incertidumbre.

Fuera de alcance inicial:

- expedientes o documentos reales;
- uploads libres;
- conexiones en vivo a CJJ o SJF;
- Microsoft Graph;
- Gemini, Mistral u otros servicios externos;
- persistencia de ejecuciones;
- publicación del backend Gradio;
- cambios en producción.

## Criterios de aceptación futuros

- Cada transición visual corresponde a una operación completada realmente.
- La persona puede inspeccionar entrada, operación, salida y revisión requerida en cada nodo.
- Reiniciar borra toda la ejecución.
- Cerrar o cancelar limpia los recursos temporales.
- No se crean registros en bases de datos ni se envían datos a terceros.
- Los escenarios usan datos inequívocamente sintéticos.
- Los estados de error e incertidumbre son visibles y recuperables.
- El workflow conserva navegación por teclado, modo manual y movimiento reducido.

## Fuentes técnicas

- [Gradio Workflows](https://www.gradio.app/guides/workflows)
- [Gradio JavaScript Client](https://www.gradio.app/guides/getting-started-with-the-js-client)
- [Gradio Resource Cleanup](https://www.gradio.app/guides/resource-cleanup)
