# Brief de reunión — KLGV × Curia

**INTERNAL — CONFIDENTIAL**  
**No reenviar, publicar ni incorporar a materiales comerciales.** Este documento contiene términos económicos de KLGV y preguntas de relación que no están autorizados para uso público. KLGV debe describirse únicamente como **socio de diseño y primer cliente, en uso piloto**; nunca como despliegue completo en producción. [D §KLGV meeting context; G-KLGV; W-REL]

**Objetivo de la reunión:** salir con dos decisiones, no con una lista de promesas: (1) el flujo operativo que KLGV quiere priorizar y la evidencia que aceptará para evaluarlo; y (2) el responsable y la ruta para completar el consentimiento de administrador de Microsoft 365. La regla de relación es agrupar como máximo una o dos peticiones por reunión; todas las demás preguntas de este brief son condicionales. [G-5PATH; W-REL]

## Agenda

**Formato de 30 minutos, alineado con la revisión trimestral de KLGV:** Luci conduce el estado de la compañía y los hitos; Lic. García es dueño de las preguntas abiertas y decisiones. [G-QR; D §KLGV meeting context]

| Minutos | Bloque | Responsable | Resultado buscado |
|---|---|---|---|
| 0:00–0:02 | Apertura y marco | Luci | Confirmar que se revisará un piloto, no un despliegue completo; nombrar las dos decisiones esperadas. [W-REL] |
| 0:02–0:06 | Estado de Curia y del piloto | Luci | Resumir estado sin métricas no verificadas: KLGV es socio de diseño y primer cliente; Jalisco CJJ es la fuente operativa actual; otras jurisdicciones siguen en incorporación. [D §Product truth; W-REL] |
| 0:06–0:09 | Evidencia operativa | Lalo | Revisar únicamente evidencia registrada de uso, confiabilidad, notificaciones, fallas, soporte y revisión por abogados; “sin datos todavía” es una respuesta válida. [W-REL; W-GTM] |
| 0:09–0:21 | Demo del flujo completo | Lalo, con Fernando observando lenguaje | Recorrer expediente → aviso/plazo → Outlook → Biblioteca/OCR → chat fundamentado → distintivos de confianza, con datos sintéticos. [D §KLGV meeting context; G-ONBOARD] |
| 0:21–0:25 | Prioridad y límites | Lic. García decide; Luci facilita | Elegir uno de los flujos de mayor frecuencia para la siguiente ventana de evidencia y confirmar qué resultado cuenta como éxito. [W-REL; W-GTM] |
| 0:25–0:28 | Dos peticiones de esta reunión | Luci | Hacer solamente las dos marcadas **HACER AHORA** en “What to ask”; no añadir referencias, caso de estudio o intros salvo que Lic. García abra el tema. [G-5PATH] |
| 0:28–0:30 | Recap y cierre | Luci | Repetir decisiones, responsables, dependencias y fecha de comprobación; no improvisar compromisos de alcance o precio. [G-QR; W-REL] |

**Disciplina durante la reunión**

- Separar “demostrado hoy”, “en piloto” y “en incorporación”. No usar “producción” para describir el estado de KLGV. [D §Product truth; W-REL]
- No presentar ahorro, ROI, adopción, plazos evitados ni testimonios: el borrador de caso de estudio conserva esos resultados como marcadores pendientes de verificación y autorización. [G-CASE; D §Brand/domain rules]
- No presentar Telegram, WhatsApp, OneDrive ni los espacios tipo Harvey (`redactar`, `análisis profundo`, `tablas de revisión`) como capacidades disponibles. [D §Product truth]
- Toda decisión material —alcance, privacidad, precio, publicación o acción externa— requiere aprobación humana. [W-TEAM]

## Demo script

### Pre-demo checklist

Completar y registrar este checklist antes de abrir la sesión:

- [ ] **Entorno:** mostrar en pantalla si la sesión es `staging` o `production`. Usar staging por defecto; usar producción únicamente si la evidencia vigente del flujo está aprobada. Nunca inferir paridad entre entornos. La matriz anterior tenía evidencia de staging y pendientes de producción. [G-QA; W-CLAIMS]
- [ ] **Datos:** usar exclusivamente un tenant, personas, expediente Jalisco CJJ y documentos **sintéticos**. No reutilizar datos reales de un asunto ni datos personales de KLGV.
- [ ] **Cuenta y aislamiento:** verificar antes de la reunión que la cuenta demo accede sólo al tenant y expediente sintéticos. Curia implementa aislamiento por tenant/caso; la demo debe comprobarlo, no asumirlo. [D §Product truth]
- [ ] **Superficies habilitadas:** comprobar, una por una, monitoreo Jalisco CJJ, avisos/plazos, calendario, Biblioteca, OCR, visor, selección de fuentes, chat fundamentado y Evaluador de Referencias. [D §Product truth; G-ONBOARD]
- [ ] **Superficies deshabilitadas:** confirmar que Telegram y los espacios `redactar`, `análisis profundo` y `tablas de revisión` siguen fuera de la demo; OneDrive no forma parte del flujo. [D §Product truth]
- [ ] **Microsoft 365:** verificar el estado real del consentimiento de administrador en el tenant que se usará. Si está pendiente, demostrar el estado seguro de fallo y no forzar una escritura de calendario. El consentimiento del tenant real es requisito para la entrega en cola. [D §KLGV meeting context; G-MS365]
- [ ] **Archivo de prueba:** preparar un PDF sintético de menos de 250 páginas, ya revisado para no contener PII. El paquete de onboarding fija PDF de hasta 250 páginas para este recorrido. [G-ONBOARD]
- [ ] **OCR:** preparar dos copias del mismo expediente: una recién cargada para enseñar estados y otra ya procesada para evitar convertir la reunión en una espera. El tiempo orientativo documentado es 2–5 minutos, no una garantía. [D §KLGV meeting context; G-ONBOARD]
- [ ] **Pregunta y referencia de prueba:** preparar una pregunta contestable únicamente con los documentos seleccionados y una referencia sintética que permita enseñar un resultado del evaluador sin afirmar que toda cita será correcta. [D §Product truth; G-ONBOARD]
- [ ] **Plan de contingencia:** capturas o grabación local del flujo con datos sintéticos, etiquetadas con entorno y fecha. Si un paso falla, mostrar el fallo con honestidad, anotarlo y continuar con la copia ya procesada; no simular éxito.
- [ ] **Lenguaje:** Fernando revisa el lenguaje para cliente; Lalo revisa precisión técnica antes de entregar o usar el material. Es el gate indicado por el paquete de onboarding. [G-ONBOARD]

### Recorrido paso a paso

**1. Abrir con el límite del piloto**

- **Acción:** enseñar el indicador del entorno y la cuenta sintética antes del producto.
- **Qué decir:** “Hoy vamos a recorrer un flujo de piloto completo. KLGV es nuestro socio de diseño y primer cliente; no presentaremos esto como un despliegue completo en producción.” [W-REL]
- **Límite que debe decirse:** “Lo que veamos demuestra este recorrido y este entorno; no prueba por sí solo confiabilidad general, adopción ni resultados económicos.” [W-CLAIMS]

**2. Iniciar sesión y confirmar el contexto del despacho**

- **Acción:** iniciar sesión y señalar el tenant y asunto sintéticos.
- **Qué decir:** “El trabajo está organizado por despacho y expediente; el acceso se aísla por tenant y por caso.” [D §Product truth]
- **Límite que debe decirse:** “Para esta demo no usaremos información real de KLGV. La configuración de roles y visibilidad debe validarse en el tenant real antes de ampliar el piloto.” [W-REL]

**3. Crear el expediente Jalisco CJJ**

- **Acción:** crear un expediente con un número exacto, sintético y preparado; seleccionar Jalisco CJJ.
- **Qué decir:** “Jalisco CJJ es la fuente judicial operativa hoy y el alcance release-blocking del piloto KLGV.” [D §Product truth; G-ALPHA]
- **Límite que debe decirse:** “No prometemos cobertura nacional. Otras fuentes aparecen en el registro o están en incorporación, pero están fuera de este recorrido y no equivalen a cobertura operativa.” [D §Product truth; G-ALPHA]

**4. Mostrar monitoreo y avisos**

- **Acción:** abrir los avisos asociados al expediente y mostrar el documento judicial original disponible.
- **Qué decir:** “La cadena comienza con el monitoreo del expediente; el objetivo del piloto es comprobar si la revisión diaria puede reemplazar el chequeo manual del boletín.” [D §KLGV meeting context; G-SUCCESS]
- **Límite que debe decirse:** “Una demo de avisos no confirma todavía reemplazo operativo. Necesitamos evidencia semanal de entrega, fallas y uso; el documento de onboarding describe latencia típica dentro de 24 horas, no una garantía.” [G-ONBOARD; W-REL]

**5. Revisar el plazo calculado**

- **Acción:** abrir el aviso, enseñar el plazo propuesto y su vínculo con el documento fuente.
- **Qué decir:** “Curia conecta aviso, plazo, calendario y expediente para que la decisión quede dentro de una sola cadena operativa.” [D §Brand/domain rules]
- **Límite que debe decirse:** “El plazo debe cotejarse con el documento judicial original y el código procesal aplicable. Curia no sustituye el juicio profesional sobre fechas límite.” [D §KLGV meeting context; G-ONBOARD]

**6. Mostrar el consentimiento de Outlook**

- **Acción:** abrir el estado de conexión Microsoft 365/Outlook y mostrar si el consentimiento de administrador está concedido o pendiente.
- **Qué decir:** “La escritura real en el calendario del tenant necesita consentimiento de administrador. Hoy queremos acordar responsable y ruta para completarlo.” [D §KLGV meeting context; G-MS365]
- **Límite que debe decirse:** “Si el consentimiento está pendiente, no forzaremos la escritura ni describiremos la entrega en cola como operativa en ese tenant.” [G-MS365]

**7. Usar “Crear evento” y comprobar el resultado**

- **Acción:** con consentimiento válido, seleccionar **Crear evento**, abrir Outlook y verificar el evento; si no hay consentimiento, enseñar el estado seguro de fallo sin escribir.
- **Qué decir:** “El usuario confirma la creación; después verificamos el evento en el calendario y conservamos evidencia del recorrido.” [G-ALPHA; G-SUCCESS]
- **Límite que debe decirse:** “La meta de éxito del piloto es al menos un plazo crítico detectado y sincronizado con Outlook con rastro de auditoría; no afirmaremos que ya ocurrió hasta revisar la evidencia real.” [D §KLGV meeting context; G-SUCCESS]

**8. Abrir Biblioteca y cargar el PDF**

- **Acción:** entrar a la Biblioteca del expediente y cargar el PDF sintético preparado.
- **Qué decir:** “La Biblioteca admite carga por expediente de PDF, DOCX, JPEG y PNG; los documentos permanecen dentro del contexto del caso.” [D §Product truth]
- **Límite que debe decirse:** “En este recorrido usamos PDF de menos de 250 páginas. OneDrive no está disponible y no se promete como parte del piloto.” [G-ONBOARD; D §Product truth]

**9. Recorrer el ciclo de OCR**

- **Acción:** señalar los estados `uploaded`, `queued`, `processing`, `processed` y `failed`; mostrar la opción de reintento y después cambiar a la copia ya procesada.
- **Qué decir:** “El OCR es asíncrono: la carga, la cola, el procesamiento y el resultado son estados visibles; los resultados se almacenan cifrados.” [D §Product truth]
- **Límite que debe decirse:** “El rango orientativo de 2–5 minutos no es un SLA. Un documento puede fallar y requerir reintento; hoy no ocultaremos ese estado.” [G-ONBOARD; D §Product truth]

**10. Abrir el visor y revisar el texto extraído**

- **Acción:** abrir el documento procesado, comparar una página con su texto extraído y señalar cualquier imperfección visible.
- **Qué decir:** “El visor permite revisar el documento que fundamentará la consulta antes de usarlo como fuente.” [D §Product truth]
- **Límite que debe decirse:** “OCR no equivale a transcripción infalible. El abogado debe revisar el original cuando el detalle sea material.” [G-ONBOARD]

**11. Seleccionar las fuentes del chat**

- **Acción:** seleccionar únicamente los documentos procesados que deben entrar en la consulta.
- **Qué decir:** “Sólo los documentos procesados que el abogado selecciona se convierten en fuentes del chat de este expediente.” [D §Product truth]
- **Límite que debe decirse:** “El chat no navega internet ni conoce automáticamente la ley vigente fuera de las fuentes cargadas. No presentar silencio de las fuentes como una respuesta jurídica completa.” [D §KLGV meeting context; G-ONBOARD]

**12. Hacer una pregunta fundamentada**

- **Acción:** formular la pregunta preparada; enseñar la respuesta en streaming y abrir sus referencias a fuente.
- **Qué decir:** “La respuesta debe poder rastrearse a los documentos seleccionados y se presenta con referencias y aviso de revisión profesional.” [D §Product truth]
- **Límite que debe decirse:** “Curia no es un abogado y brinda información, no asesoría legal. Toda salida de IA requiere revisión por un abogado calificado y puede contener errores.” [D §KLGV meeting context; G-ONBOARD]

**13. Enseñar los distintivos del Evaluador de Referencias**

- **Acción:** abrir el estado de la referencia y explicar `pending`, `verified`, `uncertain` e `incorrect`.
- **Qué decir:** “El distintivo `verified` sólo se emite cuando hay coincidencia con una base autoritativa; el sistema también puede declarar incertidumbre o incorrección.” [D §Product truth]
- **Límite que debe decirse:** “El evaluador no garantiza la exactitud de toda cita ni reemplaza la comprobación del abogado. Una referencia pendiente o incierta debe tratarse como no verificada.” [G-ONBOARD]

**14. Cerrar con evidencia, no con adjetivos**

- **Acción:** volver al expediente y resumir la cadena aviso → plazo → calendario → documento → respuesta → referencia.
- **Qué decir:** “El valor a validar no es ‘otro chat’, sino una arquitectura de confianza que une el trabajo operativo y deja puntos explícitos de revisión humana.” [D §Brand/domain rules]
- **Límite que debe decirse:** “La siguiente decisión depende de evidencia de uso, confiabilidad, calidad revisada por abogados y carga de soporte; no de que la demo haya salido bien.” [W-REL; W-GTM]

## What to ask

**Regla:** hacer sólo las dos preguntas marcadas **HACER AHORA**. Las demás permanecen **CONDICIONALES** y sólo se formulan si Lic. García abre ese tema, si reemplazan una de las dos preguntas principales o en una revisión posterior. No repartirlas en mensajes separados después de la reunión. [G-5PATH]

1. **HACER AHORA — Prioridad + evidencia:** “Lic. García, de los flujos que vio —monitoreo diario, confirmación de plazos, calendario y revisión documental—, ¿cuál uno debemos priorizar durante el siguiente ciclo y qué evidencia concreta aceptaría usted para decir que es confiable: frecuencia de uso, entregas correctas, fallas, revisión por abogado y carga de soporte?” [W-REL; W-GTM]
2. **HACER AHORA — Consentimiento MS365:** “¿Autoriza que coordinemos el consentimiento de administrador de Microsoft 365 para el tenant real y quién será el responsable de KLGV que puede completarlo? No haremos escrituras de calendario sin esa aprobación.” [D §KLGV meeting context; G-MS365]
3. **CONDICIONAL — Evidencia actual del piloto:** “¿Qué uso real hubo desde el último corte —usuarios, expedientes, sesiones o flujos repetidos— y qué problemas de confiabilidad, notificación, fallback o soporte observaron? Si no existe registro, ¿podemos acordar desde hoy el formato de captura semanal?” [W-REL]
4. **CONDICIONAL — Confirmación de plazo crítico:** “¿KLGV confirma que Curia ya detectó por lo menos un plazo crítico, que un abogado lo cotejó contra el documento original y que quedó sincronizado en Outlook con rastro de auditoría? Si no, ¿qué falta para ejecutar esa prueba controlada?” [D §KLGV meeting context; G-SUCCESS]
5. **CONDICIONAL — Confirmación de referencia alucinada:** “¿Un abogado de KLGV confirma que el evaluador ya marcó o bloqueó al menos una referencia alucinada? ¿Podemos conservar evidencia anonimizada del resultado, sin publicarla todavía?” [D §KLGV meeting context; G-SUCCESS]
6. **CONDICIONAL — Calidad jurídica:** “Para el flujo prioritario, ¿quién en KLGV revisará la calidad jurídica y qué categorías de error deben impedir su uso: fuente ausente, cita incierta, OCR defectuoso, plazo no cotejado u otra?” [W-REL; G-ONBOARD]
7. **CONDICIONAL — Dos despachos pares:** “Una vez estabilizado el piloto, ¿podría compartir dos nombres de despachos de GDL o CDMX y el socio principal que podrían evaluar Curia? Pediríamos su autorización antes de mencionar a KLGV.” [G-5PATH; G-SUCCESS]
8. **CONDICIONAL — Autorización del caso de estudio:** “¿Está dispuesto a revisar una versión del caso de estudio y, sólo después de validar cada afirmación, otorgar autorización escrita para publicarlo? No se publicarán métricas, cita testimonial ni nombre sin su firma.” [G-CASE; W-GTM]
9. **CONDICIONAL — AMEXCAP / Hi Ventures / Cometa:** “¿Algún cliente o socio del despacho participa en AMEXCAP y podría mediar una presentación con Federico Antoni o Jimena Pardo de Hi Ventures, o con Diego Vargas de Cometa?” [G-5PATH]
10. **CONDICIONAL — Corresponsal CDMX:** “¿Cuál es el despacho corresponsal de KLGV en CDMX y sería apropiado pedirle una presentación con un partner de un fondo de venture?” [G-5PATH]
11. **CONDICIONAL — Otras rutas del checklist:** “Si las rutas anteriores no encajan, ¿existe una relación pertinente con Tec GDA/EGADE vinculada a Boom AI, con CANACO/COPARMEX para una puerta hacia SEDECO o Reto Zapopan, o con un Endeavor Entrepreneur/mentor para Investor Network?” [G-5PATH]
12. **CONDICIONAL — Renovación o expansión:** “Con la evidencia disponible, ¿su postura hoy es renovar el piloto, ampliar un flujo, mantener alcance, transitar a autoservicio cuando exista, o pausar? ¿Qué gate objetivo cambiaría esa postura?” [G-QR; W-REL]
13. **CONDICIONAL — Permisos y responsables:** “¿Quién puede aprobar en KLGV alcance, privacidad, claims, publicación y términos comerciales, y quién debe participar en cada aprobación?” [W-TEAM; W-REL]

**Si Lic. García ofrece una referencia, intro o autorización sin que se la pidamos:** agradecer, confirmar que no se enviará ni publicará nada sin una segunda confirmación del nombre, destinatario, texto y alcance; registrar el permiso por escrito. [G-5PATH; G-CASE]

## Objections

### “Necesitamos cobertura más allá de Jalisco”

**Respuesta:** “Es una necesidad válida. Jalisco CJJ es la fuente operativa hoy y el alcance del piloto KLGV. El registro contempla otras fuentes, pero públicamente y en esta reunión las describimos como ‘en incorporación’, no como cobertura nacional. Preferimos probar confiabilidad de una jurisdicción antes de ampliar.” [D §Product truth; G-ALPHA]

**No decir:** “32 estados”, “cobertura nacional” o que una fuente registrada equivale a una integración operativa. [D §Product truth]

**Decisión que pediríamos después:** priorizar jurisdicción sólo con volumen de asuntos, frecuencia del dolor, fuente accesible, aceptación y soporte definidos; no comprometer una fecha durante esta reunión. [W-GTM]

### “¿Por qué confiar en las citas?”

**Respuesta:** “No pedimos confianza ciega. El Evaluador distingue `pending`, `verified`, `uncertain` e `incorrect`; sólo una coincidencia con base autoritativa puede producir `verified`. La respuesta conserva referencias a las fuentes seleccionadas para que el abogado revise.” [D §Product truth]

**Límite explícito:** “Curia no puede garantizar todas las citas, no navega internet ni obtiene automáticamente derecho vigente fuera de las fuentes cargadas, y ninguna insignia sustituye la revisión profesional.” [G-ONBOARD; D §KLGV meeting context]

### “¿Cómo manejan privacidad y LFPDPPP?”

**Respuesta:** “La arquitectura disponible incluye aislamiento por tenant y caso, visibilidad por asunto, selección explícita de documentos para el chat, sanitización de PII cuando corresponde y resultados OCR cifrados.” [D §Product truth; D §Brand/domain rules]

**Límite explícito:** “No diremos ‘cumplimiento LFPDPPP garantizado’. La preparación para ampliar el piloto todavía exige validar seguridad y privacidad, ARCO/retención, respaldos y recuperación, monitoreo, responsable de soporte, criterios de aceptación y alcance contractual. La demo usa datos sintéticos.” [G-LAUNCH; W-PRODGATE]

### “¿Qué pasa cuando la IA se equivoca?”

**Respuesta:** “Diseñamos el flujo para hacer visible el error: fuentes elegidas por el abogado, referencias, estados de OCR, distintivos de confianza, aviso de revisión y estados de fallo. La persona conserva la decisión.” [D §Product truth; G-ONBOARD]

**Límite explícito:** “Curia no es asesoría legal, las salidas requieren revisión por un abogado calificado y los plazos deben cotejarse con el documento original y el código aplicable. No afirmamos cero errores ni cero alucinaciones.” [D §KLGV meeting context; G-ONBOARD]

**Operación:** registrar el incidente, fuente, entorno, impacto, fallback y resolución; decidir la mejora mínima siguiente en la revisión semanal. [W-REL]

### “¿Cambiará el precio?”

**Respuesta interna para KLGV:** “Los términos de founding partner ya documentados para KLGV se mantienen y el guion acordado dice ‘sin cambios para usted’. Estos términos son **CONFIDENCIALES**, no son precio de lista ni deben compararse públicamente.” Las cifras exactas **no se reproducen en este repositorio**: consultarlas en la fuente interna antes de la reunión. [D §KLGV meeting context; G-WHATSAPP]

**Postura externa y futura:** el precio público de Curia sigue **TBD** hasta contar con evidencia de uso, disposición a pagar, carga de soporte, alcance y entidad contratante. No mezclar estos términos con precios históricos del PRD ni con ofertas de servicios de Agentic Engineering. [D §Product truth; W-PRICING]

**Límite de negociación:** no prometer nuevos módulos, jurisdicciones, SLA, soporte o descuentos dentro de los términos existentes sin revisión humana del contrato, alcance y costo. [W-TEAM; W-PRICING]

## Commercials

### Términos actuales de KLGV — sólo para esta conversación confidencial

- **Founding-partner:** las cifras contratadas (implementación única + retainer mensual) **no se replican aquí**; leerlas en la fuente interna [G-WHATSAPP] antes de la reunión. El guion de KLGV las describe como “los términos contratados” y “sin cambios para usted”. [G-WHATSAPP; D §KLGV meeting context]
- Son términos de socio de diseño, no precio de mercado y no evidencia de precio repetible. KLGV es cliente pagado en piloto; no describir la relación como gratuita ni como despliegue completo en producción. [G-KLGV; W-REL]
- No copiar esas cifras a este repositorio, la landing, propuesta genérica, caso de estudio, deck de inversionistas ni conversación con otro despacho. La política pública vigente para Curia es **pricing TBD**. [D §Product truth; G-PRICING]
- No mezclar precios preliminares de los PRD, términos de KLGV o la escalera de ofertas de la agencia: son instrumentos distintos y los números históricos no están aprobados como precio público de Curia. [G-PRICING; W-PRICING]

### Postura comercial para la reunión

1. **No renegociar por improvisación.** Si KLGV pide más alcance, registrar jurisdicción, usuarios, frecuencia, nivel de soporte, datos, seguridad, integración y criterio de aceptación; responder después de revisión humana. [W-TEAM; W-PRICING]
2. **Separar renovación de expansión.** Renovar el flujo actual depende de evidencia de valor y confiabilidad; expansión agrega un nuevo alcance y requiere su propio gate. [W-REL; W-GTM]
3. **No usar la demo como aceptación.** Una demo satisfactoria no prueba operación confiable, uso sostenido, ROI ni preparación de producción. [W-CLAIMS; W-REL]
4. **No convertir métricas pendientes en claims.** El borrador de caso de estudio sigue pendiente de firma y todos los resultados/testimonial son marcadores hasta que KLGV los verifique y autorice por escrito. [G-CASE]

### Gate antes de ampliar más allá del piloto

No promover Curia como despliegue completo ni ampliar alcance hasta tener evidencia y dueño para cada criterio: [D §KLGV meeting context; W-PRODGATE]

- **Seguridad y privacidad:** revisión aprobada, aislamiento verificado, tratamiento de PII y requerimientos ARCO/retención resueltos. [G-LAUNCH; W-PRODGATE]
- **Operación confiable:** entregas y fallas observadas durante el periodo acordado; incidentes y fallbacks registrados. [W-REL]
- **Respaldos y recuperación:** procedimiento probado y evidencia conservada. [W-PRODGATE]
- **Monitoreo:** señales y responsables definidos para detectar y atender fallas. [W-PRODGATE]
- **Soporte:** propietario, canal, horario, escalamiento y expectativa de respuesta acordados; no prometer un SLA inexistente. [G-ONBOARD; W-PRODGATE]
- **Criterios de aceptación:** KLGV confirma el flujo, la evidencia mínima y quién firma la aceptación. [G-SUCCESS; W-PRODGATE]
- **Microsoft 365:** consentimiento de administrador real concedido antes de tratar la entrega de calendario en cola como operativa. [G-MS365]
- **Alcance contractual:** jurisdicciones, usuarios, integraciones, soporte, privacidad, datos y límites reflejados en contrato. [W-PRODGATE]
- **Claims y publicación:** permiso escrito, claims exactos, datos anonimizados/revisados y términos confidenciales excluidos antes de cualquier referencia o caso de estudio. [G-CASE; W-PRODGATE]

## Next steps

Las siguientes son acciones propuestas; Luci debe confirmarlas en voz alta al cierre y registrar cualquier cambio decidido por Lic. García.

| Cuándo | Owner | Acción concreta | Evidencia de cierre |
|---|---|---|---|
| Antes de la reunión | **Lalo** | Seleccionar entorno; completar el checklist; preparar tenant, expediente y PDF sintéticos; verificar las superficies y registrar el estado real de MS365. | Checklist fechado, captura del entorno y estado de cada superficie; ningún dato real. [G-QA; G-MS365] |
| Antes de la reunión | **Fernando** | Revisar el guion y las pantallas por lenguaje de cliente, límites de IA, privacidad y referencias; retirar cualquier claim que exceda evidencia. | Aprobación escrita o lista de correcciones; el paquete de onboarding exige revisión de lenguaje de Fernando. [G-ONBOARD] |
| Antes de la reunión | **Lucy** | Preparar apertura, estado y las dos preguntas **HACER AHORA**; ocultar del material presentado términos confidenciales y preguntas condicionales. | Agenda de 30 minutos y dos decisiones visibles. [G-QR; G-5PATH] |
| Durante la reunión | **Lucy** | Facilitar tiempos, dar la palabra a Lic. García para decisiones y detener peticiones adicionales después de las dos principales. | Registro de decisión: flujo prioritario, evidencia aceptada, owner KLGV para MS365 y preguntas diferidas. [G-QR; G-5PATH] |
| Durante la demo | **Lalo** | Narrar cada límite, mostrar fallas con honestidad y no describir un paso como operativo si sólo se demostró en staging. | Notas por paso con entorno, resultado y cualquier incidente. [G-QA; W-CLAIMS] |
| Durante la demo | **Fernando** | Capturar dudas de calidad jurídica, OCR, chat y referencias; no resolver una duda inventando una capacidad. | Lista de dudas con fuente, impacto y seguimiento propuesto. [W-REL; G-ONBOARD] |
| Mismo día | **Lucy** | Enviar recap privado de decisiones y dependencias; no incluir solicitudes condicionales que no se hicieron. | Recap aprobado por Lalo, con responsables y fechas; no es material público. [G-5PATH] |
| Dentro de 24 h | **Lalo** | Coordinar con el responsable que KLGV designe el consentimiento de administrador Microsoft 365; no ejecutar escrituras sin aprobación. | Estado concedido o bloqueo documentado, con responsable y siguiente comprobación. [G-MS365] |
| Dentro de 24 h | **Lalo** | Crear o actualizar el ledger semanal del flujo elegido: uso, entregas, fallas, revisión por abogado, incidentes/fallbacks y soporte. | Registro con fuente y fecha; ausencia de datos marcada como desconocida, no como cero. [W-REL] |
| Dentro de 48 h | **Fernando** | Convertir dudas de la demo en la mejora mínima siguiente, empezando por errores que afecten confianza jurídica o privacidad. | Propuesta acotada con criterio observable de aceptación; sin prometer fecha al cliente hasta aprobación. [W-REL] |
| Siguiente revisión | **Lucy** | Revisar postura de renovación/expansión y decidir si una pregunta condicional reemplaza una de las dos peticiones de esa reunión. | Decisión registrada: renovar, mantener, ampliar o pausar, con gate y evidencia. [G-QR; W-REL] |
| Sólo después de estabilización | **Lucy** | Si procede, pedir dos referencias de despachos **o** una ruta de intro, nunca todas juntas. | Permiso escrito, nombres exactos y autorización antes de contactar o mencionar a KLGV. [G-5PATH; G-SUCCESS] |
| Sólo con evidencia validada | **Lucy**, revisión de **Lalo** y **Fernando** | Enviar el borrador de caso de estudio para autorización escrita; verificar cada claim y eliminar términos/datos confidenciales. | Firma/autorización y versión final con claims comprobados; sin placeholders. [G-CASE; W-PRODGATE] |

**Cierre verbal recomendado:** “Confirmo dos acuerdos: priorizamos **[flujo]** y mediremos **[evidencia]**; para Microsoft 365, **[responsable]** coordina con Lalo antes de **[fecha]**. Todo lo demás queda pendiente y no publicaremos ninguna afirmación sobre KLGV sin autorización escrita.” [G-5PATH; G-CASE]

## Sources

Las claves entre corchetes remiten a estas fuentes. Los reportes de scouts incluyen la ruta y rangos de línea de cada artefacto primario.

- **[D]** `local://research-digest.md`, especialmente “Product truth”, “Brand/domain rules” y “KLGV meeting context”.
- **[G-KLGV]** `agent://ScoutGTM` → `repos/agentic-engineering-wiki/articles/klgv-relationship.md:19-43` y `repos/agentic-engineering-wiki/articles/klgv-launch-playbook.md:19-22`.
- **[G-SUCCESS]** `agent://ScoutGTM` → `repos/agentic-engineering-wiki/articles/klgv-launch-playbook.md:53-59`.
- **[G-ONBOARD]** `agent://ScoutGTM` → `repos/curia-ai/docs/runbooks/klgv-onboarding-packet.md`.
- **[G-ALPHA]** `agent://ScoutGTM` → `repos/curia-ai/docs/runbooks/klgv-alpha-release-smoke.md:1-27`.
- **[G-MS365]** `agent://ScoutGTM` → `repos/curia-ai/docs/runbooks/klgv-alpha-release-smoke.md:131-142` y `repos/curia-ai/docs/qa/klgv-mvp-smoke-matrix.md:96-103`.
- **[G-QA]** `agent://ScoutGTM` → `repos/curia-ai/docs/qa/klgv-mvp-smoke-matrix.md:30-49,60-76,105-157`.
- **[G-5PATH]** `agent://ScoutGTM` → `klgv-pack/KLGV_5_Path_Checklist.md:7-15,18-79,93-99`.
- **[G-QR]** `agent://ScoutGTM` → `klgv-pack/KLGV_Quarterly_Review_Agenda_ES.md:1-18,35-76`.
- **[G-CASE]** `agent://ScoutGTM` → `klgv-pack/Curia_Case_Study_Draft_ES.md:1-6,29-61`.
- **[G-WHATSAPP]** `agent://ScoutGTM` → `klgv-pack/KLGV_Tuesday_WhatsApp_Script.md:11-29`.
- **[G-PRICING]** `agent://ScoutGTM` → `repos/agentic-engineering-wiki/articles/curia-gtm-pricing-playbook.md:19-29` y `klgv-pack/KLGV_Tier3_Pricing_Justification.md:11-13,59-80` (este último es interno y no debe exponerse).
- **[G-LAUNCH]** `agent://ScoutGTM` → `repos/curia-ai/docs/launch-execution-plan-2026-06-04.md:19-49`.
- **[W-REL]** `agent://ScoutWiki` → `articles/klgv-relationship.md:20-56` y `articles/klgv-launch-playbook.md:20-46`.
- **[W-GTM]** `agent://ScoutWiki` → `articles/curia-gtm-pricing-playbook.md:17-25,40-63`.
- **[W-PRICING]** `agent://ScoutWiki` → `articles/curia-gtm-pricing-playbook.md:27-38` y `articles/claims-registry.md:84-92`.
- **[W-PRODGATE]** `agent://ScoutWiki` → `articles/klgv-launch-playbook.md:44-54`.
- **[W-CLAIMS]** `agent://ScoutWiki` → `articles/claims-registry.md:50-70,123-164` y `articles/marketing-honesty-policy.md:17-56`.
- **[W-TEAM]** `agent://ScoutWiki` → `articles/team-and-roles.md:16-40,50-56`.
