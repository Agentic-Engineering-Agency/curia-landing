# Copy final de la landing de Curia

Copy en español de México, organizado por los identificadores de sección acordados. Los nombres de iconos corresponden a `lucide-react`.

## Navegación

<!-- Fuentes: curia-ai/README.md; curia-ai/CONTEXT.md; curia-ai/apps/web/src/i18n/es-MX.ts; curia-landing/src/App.tsx. -->

1. **Inicio** — `#inicio`
2. **Curia hoy** — `#estado-actual`
3. **Monitoreo** — `#monitoreo`
4. **Plazos y Outlook** — `#plazos-outlook`
5. **Biblioteca** — `#biblioteca`
6. **OCR** — `#ocr`
7. **Asistentes** — `#asistentes`
8. **Reference Evaluator** — `#evaluador-referencias`
9. **Fuentes** — `#fuentes`
10. **Privacidad** — `#privacidad`
11. **Para el despacho** — `#despacho`
12. **Contacto** — `#contacto`

---

## `inicio`

<!-- Fuentes: curia-ai/README.md; curia-ai/CONTEXT.md; curia-ai/apps/web/src/i18n/es-MX.ts; curia-ai/docs/public-site-content-plan.md; curia-landing/src/App.tsx. -->

- **Kicker / caption:** Inteligencia legal para despachos mexicanos
- **H1:** Inteligencia legal que trabaja mientras tú no estás.
- **Subhead:** Curia reúne monitoreo judicial, gestión de plazos, calendario Outlook, análisis documental e investigación jurídica con estados de confianza para las citas, todo dentro del expediente.
- **CTA principal:** Conversemos sobre tu operación
- **CTA principal — destino:** `#contacto`
- **CTA secundaria:** Ver Curia hoy
- **CTA secundaria — destino:** `#estado-actual`
- **H2 de continuidad:** Del aviso al escrito, el contexto permanece en el expediente.
- **Intro:** Curia conecta tareas que hoy suelen vivir entre boletines, hojas de cálculo, correos y chats de IA. El equipo conserva la fuente, el plazo, los documentos y la investigación en una sola cadena operativa.

### Highlights

- **Valor:** Cada mañana
  - **Etiqueta:** Monitoreo y contexto para el despacho.
- **Valor:** 4 formatos
  - **Etiqueta:** PDF, DOCX, JPEG y PNG en la Biblioteca del expediente.
- **Valor:** 4 estados
  - **Etiqueta:** Pendiente, verificada, incierta o incorrecta para cada referencia evaluada.

### Tarjetas

1. **Icono sugerido:** `ShieldCheck`
   - **Título:** Arquitectura de confianza
   - **Cuerpo:** Curia conserva la fuente y muestra el estado de las referencias evaluadas para que el equipo revise la evidencia antes de usarla.
2. **Icono sugerido:** `Gavel`
   - **Título:** Diseñado para litigio mexicano
   - **Cuerpo:** La operación parte de expedientes, avisos, acuerdos y plazos del entorno jurídico mexicano, no de una herramienta extranjera traducida.
3. **Icono sugerido:** `Workflow`
   - **Título:** Una sola cadena operativa
   - **Cuerpo:** Monitoreo, calendario, documentos e investigación permanecen ligados al mismo asunto para reducir la fragmentación del trabajo.

---

## `estado-actual`

<!-- Fuentes: curia-ai/product-brief-klgv-planning.md; curia-ai/docs/launch-execution-plan-2026-06-04.md; curia-ai/docs/runbooks/klgv-onboarding-packet.md; curia-ai/packages/shared/src/source-registry.ts; PR curia-ai #720. -->

- **Kicker / caption:** Curia hoy
- **H2:** Un piloto real, con alcance claro.
- **Intro:** Curia está en piloto con KLGV Abogados desde julio de 2026. Jalisco CJJ está operativo; los demás estados están en incorporación. El alcance se comunica tal como existe hoy.

### Tarjetas

1. **Icono sugerido:** `Handshake`
   - **Título:** En piloto con KLGV Abogados
   - **Cuerpo:** KLGV Abogados participa como socio de diseño y primer cliente. Su uso en piloto guía la validación del flujo diario del despacho.
2. **Icono sugerido:** `Landmark`
   - **Título:** Jalisco CJJ operativo
   - **Cuerpo:** Curia puede registrar expedientes de Jalisco CJJ y relacionarlos con los avisos detectados en esa fuente judicial.
3. **Icono sugerido:** `Route`
   - **Título:** Más estados, en incorporación
   - **Cuerpo:** Las demás entidades se integran de manera progresiva. Curia comunica únicamente la cobertura que está disponible hoy.

### Timeline `morningSequence`

1. **Título:** Antes de iniciar la jornada — Monitoreo con contexto
   - **Cuerpo:** El objetivo operativo es presentar los movimientos detectados en Jalisco CJJ junto con el expediente y la fuente que corresponde.
2. **Título:** Del aviso al plazo — Revisión antes de actuar
   - **Cuerpo:** El acuerdo conserva su contexto mientras el equipo revisa el plazo calculado contra el documento judicial original y la legislación aplicable.
3. **Título:** Del plazo a Outlook — Evento con referencia
   - **Cuerpo:** Cuando Microsoft 365 está conectado y cuenta con los permisos necesarios, el equipo puede crear el evento de calendario con la referencia del expediente y su enlace de origen.
4. **Título:** Del documento a la consulta — Fuentes elegidas
   - **Cuerpo:** La Biblioteca procesa los documentos del expediente; sólo los archivos procesados que selecciona la persona abogada se usan como fuentes para responder.
5. **Título:** De la respuesta al escrito — Confianza visible
   - **Cuerpo:** Cuando una referencia pasa por Reference Evaluator, Curia muestra su estado antes de que el equipo decida usarla.

---

## `monitoreo`

<!-- Fuentes: curia-ai/README.md; curia-ai/CONTEXT.md; curia-ai/packages/shared/src/source-registry.ts; curia-ai/apps/web/src/routes/_authed.index.tsx; curia-ai/docs/runbooks/klgv-onboarding-packet.md. -->

- **Kicker / caption:** Monitoreo judicial
- **H2:** Los movimientos del expediente, sin empezar la mañana desde cero.
- **Intro:** Curia contrasta los expedientes registrados con los avisos obtenidos de Jalisco CJJ y concentra el resultado en el asunto correcto. El equipo revisa el movimiento con su procedencia, no como una alerta aislada.

### Tarjetas

1. **Icono sugerido:** `FolderSearch`
   - **Título:** Expedientes bajo seguimiento
   - **Cuerpo:** El despacho registra el número exacto del expediente y la fuente judicial correspondiente. Curia usa esos datos para identificar avisos relacionados.
2. **Icono sugerido:** `BellRing`
   - **Título:** Cada aviso en contexto
   - **Cuerpo:** La notificación reúne el aviso con el expediente y su fuente para facilitar la revisión operativa.
3. **Icono sugerido:** `FileClock`
   - **Título:** Procedencia consultable
   - **Cuerpo:** La fuente y el documento de origen permanecen ligados al movimiento para que el equipo pueda comprobarlo antes de actuar.

---

## `plazos-outlook`

<!-- Fuentes: curia-ai/specs/completed/SPEC-20260629-001-cur-71-outlook-autocreation.md; curia-ai/docs/runbooks/ms365-oauth-calendar.md; curia-ai/docs/runbooks/klgv-onboarding-packet.md; PR curia-ai #719; PR curia-ai #720. -->

- **Kicker / caption:** Plazos y Outlook
- **H2:** Del acuerdo a una fecha que el equipo puede revisar y calendarizar.
- **Intro:** Curia convierte el movimiento judicial en contexto operativo: plazo calculado, urgencia, expediente y acceso a la fuente. Con Microsoft 365 conectado, esa información puede convertirse en un evento de Outlook.

### Tarjetas

1. **Icono sugerido:** `Calculator`
   - **Título:** Plazo calculado, no asumido
   - **Cuerpo:** Curia propone una fecha a partir del aviso y conserva el contexto usado para calcularla. La persona abogada debe cotejarla contra el documento judicial original y el código procesal aplicable.
2. **Icono sugerido:** `CalendarPlus`
   - **Título:** Crear evento en Outlook
   - **Cuerpo:** El evento puede incluir la referencia del expediente, la fuente, un enlace de regreso a Curia y un recordatorio previo.
3. **Icono sugerido:** `BadgeAlert`
   - **Título:** Permisos visibles
   - **Cuerpo:** Si falta la conexión, el alcance de permisos o el consentimiento administrativo de Microsoft 365, Curia lo señala en lugar de dar por entregado el evento.

---

## `biblioteca`

<!-- Fuentes: curia-ai/apps/web/src/routes/_authed.biblioteca.caso.$caseId.tsx; curia-ai/apps/web/src/components/biblioteca/chat-panel.tsx; curia-ai/docs/public-site-content-plan.md; curia-ai/CONTEXT.md. -->

- **Kicker / caption:** Biblioteca por expediente
- **H2:** Los documentos del asunto, listos para leer y consultar en su contexto.
- **Intro:** Cada expediente cuenta con una Biblioteca para cargar y visualizar documentos. El análisis parte de los archivos del caso, no de una conversación desconectada del asunto.

### Tarjetas

1. **Icono sugerido:** `Files`
   - **Título:** Cuatro formatos de entrada
   - **Cuerpo:** La Biblioteca recibe PDF, DOCX, JPEG y PNG, además de los documentos obtenidos automáticamente por los flujos judiciales habilitados.
2. **Icono sugerido:** `BookOpenText`
   - **Título:** Espacio propio por expediente
   - **Cuerpo:** Los archivos, su visualización y el estado de procesamiento permanecen ligados al caso correspondiente.
3. **Icono sugerido:** `ListChecks`
   - **Título:** Fuentes elegidas por la persona abogada
   - **Cuerpo:** Sólo los documentos ya procesados y seleccionados de forma explícita se convierten en fuentes para el asistente del expediente.
4. **Icono sugerido:** `MessagesSquare`
   - **Título:** Consulta con referencias documentales
   - **Cuerpo:** Curia permite resumir, preguntar y ubicar fragmentos con referencias a los archivos seleccionados. Una referencia documental no equivale por sí sola a una cita jurídica verificada.

---

## `ocr`

<!-- Fuentes: curia-ai/docs/runbooks/ocr-pipeline.md; curia-ai/apps/api/src/documents/ocr/adapters/gemini.ts; curia-ai/apps/api/src/documents/ocr/adapters/mistral.ts; curia-ai/packages/shared/src/envelope-encryption.ts; PR curia-ai #700. -->

- **Kicker / caption:** OCR asíncrono
- **H2:** Documentos que pasan de imagen a texto sin bloquear el trabajo del expediente.
- **Intro:** Curia entrega los archivos de forma segura al almacenamiento y procesa el OCR en segundo plano. El estado permanece visible, los fallos pueden reintentarse y el resultado procesado se conserva cifrado.

### Tarjetas

1. **Icono sugerido:** `CloudUpload`
   - **Título:** Carga separada del procesamiento
   - **Cuerpo:** El archivo se entrega mediante una carga preautorizada a R2 y el trabajo continúa a través de una cola de Cloudflare.
2. **Icono sugerido:** `ScanText`
   - **Título:** Estado visible de principio a fin
   - **Cuerpo:** La interfaz distingue entre cargado, en cola, procesando, procesado y fallido para que el equipo sepa qué puede consultar.
3. **Icono sugerido:** `RefreshCw`
   - **Título:** Proveedor principal y respaldo
   - **Cuerpo:** El OCR usa Gemini 2.5 Flash como proveedor principal y Mistral OCR como alternativa cuando el primer intento no concluye correctamente.
4. **Icono sugerido:** `LockKeyhole`
   - **Título:** Resultado cifrado y fallos recuperables
   - **Cuerpo:** Curia permite reintentar el OCR después de un fallo y cifra el contenido procesado.

---

## `asistentes`

<!-- Fuentes: curia-ai/docs/runbooks/case-bound-agents.md; curia-ai/specs/completed/SPEC-20260612-001-cur-368-general-legal-agent.md; curia-ai/apps/web/src/components/biblioteca/chat-panel.tsx; curia-ai/docs/runbooks/klgv-onboarding-packet.md. -->

- **Kicker / caption:** Asistentes con contexto
- **H2:** Una superficie de ayuda para cada momento, con límites explícitos.
- **Intro:** Curia ofrece asistencia dentro del expediente, una vista general y un copiloto del sitio. Cada modalidad resuelve el contexto de forma explícita, respeta el aislamiento entre despachos y casos, y sigue una regla explícita de no inventar información.

### Tarjetas

1. **Icono sugerido:** `BriefcaseBusiness`
   - **Título:** Agente del expediente
   - **Cuerpo:** Trabaja dentro del caso y responde a partir del contexto y de los documentos procesados que la persona abogada selecciona.
2. **Icono sugerido:** `Scale`
   - **Título:** Asistente general
   - **Cuerpo:** Atiende consultas jurídicas en la vista general y mantiene visible el estado de confianza de las referencias.
3. **Icono sugerido:** `PanelTopOpen`
   - **Título:** Copiloto del sitio
   - **Cuerpo:** Acompaña la navegación y usa el contexto disponible de manera controlada, sin mezclar información entre despachos o expedientes.
4. **Icono sugerido:** `TriangleAlert`
   - **Título:** Revisión profesional obligatoria
   - **Cuerpo:** Curia es una herramienta de apoyo y no sustituye el análisis ni la asesoría profesional. Toda salida de IA, cita y cálculo de plazo debe revisarse contra el documento original y la legislación aplicable; la IA no consulta por sí sola internet ni legislación vigente en tiempo real.

---

## `evaluador-referencias`

<!-- Fuentes: curia-ai/docs/runbooks/citation-trust-badge.md; curia-ai/apps/api/src/reference-evaluator/verification-pipeline.ts; curia-ai/apps/web/src/components/trust/trust-badge-types.ts; PR curia-ai #647; PR curia-ai #712. -->

- **Kicker / caption:** Reference Evaluator
- **H2:** La confianza de una cita debe verse antes de usarla.
- **Intro:** Reference Evaluator contrasta referencias jurídicas mediante caché, base autoritativa y evaluación asistida. Sólo una coincidencia en la base autoritativa puede otorgar el estado de verificada; un modelo de IA no puede concederlo por sí solo.

### Estados de confianza

1. **Icono sugerido:** `Clock3`
   - **Título:** Pendiente
   - **Cuerpo:** La referencia aún no cuenta con un resultado concluyente y no debe tratarse como confirmada.
2. **Icono sugerido:** `BadgeCheck`
   - **Título:** Verificada
   - **Cuerpo:** Existe una coincidencia en la base autoritativa y Curia puede mostrar el vínculo de la fuente correspondiente.
3. **Icono sugerido:** `CircleHelp`
   - **Título:** Incierta
   - **Cuerpo:** No hay evidencia suficiente para confirmarla; Curia presenta la advertencia para que la persona abogada realice la revisión manual.
4. **Icono sugerido:** `CircleX`
   - **Título:** Incorrecta
   - **Cuerpo:** La evaluación detectó una inconsistencia y la referencia se marca de forma visible, en lugar de pasarla como confiable.

---

## `fuentes`

<!-- Fuentes: curia-ai/packages/shared/src/source-registry.ts; curia-ai/packages/shared/src/knowledge-sources/index.ts; curia-ai/docs/runbooks/klgv-onboarding-packet.md; PR curia-ai #712; PR curia-ai #716. -->

- **Kicker / caption:** Fuentes mexicanas
- **H2:** Monitoreo judicial y contraste jurídico, sin confundir sus funciones.
- **Intro:** Curia distingue la fuente operativa que entrega avisos del expediente de las bases usadas para contrastar referencias. Hoy Jalisco CJJ es la fuente judicial operativa; SJF, DOF y LeyesBiblio forman parte del corpus de contraste del Reference Evaluator.

### Tarjetas

1. **Icono sugerido:** `Landmark`
   - **Título:** Jalisco CJJ
   - **Cuerpo:** Fuente judicial operativa para el registro y monitoreo de expedientes del piloto. Las demás entidades están en incorporación.
2. **Icono sugerido:** `Gavel`
   - **Título:** Semanario Judicial de la Federación
   - **Cuerpo:** El corpus autoritativo incluye registros del SJF para contrastar referencias jurisprudenciales. Esto no implica monitoreo federal en vivo.
3. **Icono sugerido:** `Newspaper`
   - **Título:** Diario Oficial de la Federación
   - **Cuerpo:** DOF SIDOF funciona como fuente de referencia para publicaciones oficiales dentro del registro de Curia.
4. **Icono sugerido:** `LibraryBig`
   - **Título:** LeyesBiblio
   - **Cuerpo:** La Biblioteca de Leyes de la Cámara de Diputados se usa como fuente de referencia legislativa, no como fuente de avisos judiciales.

---

## `privacidad`

<!-- Fuentes: curia-ai/README.md; curia-ai/CONTEXT.md; curia-ai/packages/shared/src/envelope-encryption.ts; curia-ai/docs/runbooks/ocr-pipeline.md; curia-ai/docs/runbooks/arco-rights-flow.md. -->

- **Kicker / caption:** Privacidad por diseño
- **H2:** El expediente conserva límites técnicos, no sólo promesas.
- **Intro:** Curia reduce la exposición de información mediante aislamiento por despacho y caso, sanitización de datos personales, cifrado por cliente y flujos explícitos para derechos ARCO y trazabilidad.

### Tarjetas

1. **Icono sugerido:** `Building2`
   - **Título:** Aislamiento por despacho y expediente
   - **Cuerpo:** Los asistentes resuelven de forma explícita a qué organización y caso pertenece cada contexto antes de usarlo.
2. **Icono sugerido:** `ShieldCheck`
   - **Título:** PII sanitizada
   - **Cuerpo:** Curia sanitiza información personal identificable antes de llamadas externas de IA cuando la naturaleza del flujo o del documento lo requiere.
3. **Icono sugerido:** `KeyRound`
   - **Título:** Cifrado con clave por cliente
   - **Cuerpo:** El contenido derivado del OCR usa cifrado por envolvente con una clave administrada por despacho y capacidad de destrucción criptográfica.
4. **Icono sugerido:** `FileLock2`
   - **Título:** ARCO y trazabilidad
   - **Cuerpo:** El flujo ARCO contempla estados activo, bloqueado y eliminado; los eventos de auditoría son de sólo anexado y se conservan durante cinco años.

---

## `despacho`

<!-- Fuentes: curia-ai/README.md; curia-ai/CONTEXT.md; curia-ai/docs/runbooks/klgv-onboarding-packet.md; curia-ai/specs/active/SPEC-20260714-001-cur-521-settings-live-capacity-outlook-copy.md; PR curia-ai #718. -->

- **Kicker / caption:** Operación del despacho
- **H2:** Visibilidad para dirigir el trabajo, sin convertirla en vigilancia individual.
- **Intro:** Curia organiza la operación alrededor del expediente. Las personas asociadas trabajan sobre sus asuntos y los socios reciben agregados útiles de casos, plazos, asignaciones y capacidad.

### Tarjetas

1. **Icono sugerido:** `UsersRound`
   - **Título:** Visibilidad según la función
   - **Cuerpo:** Las personas asociadas consultan el trabajo que les corresponde; los socios pueden revisar el estado agregado del despacho.
2. **Icono sugerido:** `Gauge`
   - **Título:** Capacidad con datos actuales
   - **Cuerpo:** La configuración muestra el uso y la capacidad vigentes del equipo, en lugar de cifras de demostración.
3. **Icono sugerido:** `Workflow`
   - **Título:** Una sola cadena operativa
   - **Cuerpo:** Monitoreo, plazo, calendario, documentos e investigación permanecen ligados al mismo expediente.
4. **Icono sugerido:** `MapPinned`
   - **Título:** Hecho para litigio mexicano
   - **Cuerpo:** La estructura parte de expedientes, acuerdos, boletines y plazos del entorno jurídico mexicano, no de software extranjero traducido.

---

## `contacto`

<!-- Fuentes: curia-ai/docs/runbooks/klgv-onboarding-packet.md; curia-ai/docs/runbooks/ms365-oauth-calendar.md; curia-landing/src/App.tsx; curia-landing/src/worker.ts. -->

- **Kicker / caption:** Contacto
- **H2:** Si tu despacho quiere conectar monitoreo, plazos y documentos, conversemos.
- **Intro:** Cuéntanos cómo revisan hoy sus expedientes, coordinan fechas y preparan investigación. Podemos revisar si el alcance actual de Curia corresponde a su operación y qué requisitos necesita el flujo de Microsoft 365.

### Tarjetas

1. **Icono sugerido:** `Landmark`
   - **Título:** Punto de partida operativo
   - **Cuerpo:** Revisemos qué fuentes judiciales usa el despacho y si Jalisco CJJ forma parte de su operación actual.
2. **Icono sugerido:** `FolderKanban`
   - **Título:** Flujo por expediente
   - **Cuerpo:** Identifiquemos dónde se separan hoy los avisos, plazos, documentos y consultas del equipo.
3. **Icono sugerido:** `CloudCog`
   - **Título:** Requisitos de Microsoft 365
   - **Cuerpo:** Confirmemos la conexión y el consentimiento administrativo necesarios para crear eventos de Outlook en el entorno real del despacho.

### Formulario

- **Nombre:** `Tu nombre`
- **Despacho:** `Nombre del despacho`
- **Correo de contacto:** `tu@despacho.com`
- **Mensaje — etiqueta:** ¿Qué te gustaría explorar con Curia?
- **Mensaje — placeholder:** Cuéntanos qué expedientes monitorean, cómo coordinan plazos o qué problema quieren resolver primero.
- **Aviso bajo el formulario:** Al enviar, registraremos tu mensaje en nuestro CRM para darle seguimiento.
- **Botón inicial:** Solicitar conversación
- **Botón enviando:** Enviando
- **Botón enviado:** Mensaje enviado
- **Confirmación:** Recibimos tu mensaje. El equipo de Curia dará seguimiento por correo.
- **Error:** No pudimos enviar tu mensaje. Intenta de nuevo o escríbenos por correo.

---

## CTA transversal

<!-- Fuentes: curia-ai/README.md; curia-ai/CONTEXT.md; curia-ai/docs/runbooks/klgv-onboarding-packet.md. -->

- **Caption:** Una operación legal con contexto
- **H2:** Revisa si Curia corresponde al flujo real de tu despacho.
- **Intro:** Sin promesas de cobertura que aún no existe ni respuestas de IA presentadas como criterio profesional. Sólo un recorrido por el monitoreo, los plazos, la Biblioteca y la arquitectura de confianza disponibles hoy.
- **CTA:** Conversemos sobre tu operación
- **Destino:** `#contacto`

## Footer

<!-- Fuentes: curia-ai/README.md; curia-ai/apps/web/src/i18n/es-MX.ts; curia-ai/docs/runbooks/case-bound-agents.md. -->

**Línea:** Curia — inteligencia legal para despachos mexicanos. Herramienta de apoyo: toda salida de IA requiere revisión profesional.
