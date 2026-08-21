# Prompts de movimiento para los cinco clips

Un clip por sala. La imagen fotorrealista de la sala es el fotograma inicial, y
el prompt describe **sólo el movimiento de cámara**, con una línea de tiempo de
compases en vez de una petición abstracta: pedir "un recorrido cinematográfico"
falla, porque el modelo se queda en una deriva mínima.

Reglas comunes a los cinco, aprendidas de la receta de generación:

- Sin gente, sin texto sobreimpreso, sin logotipos.
- La cámara se mueve, el espacio no. Nada de muebles que se deslicen.
- Movimiento continuo, un solo plano, sin cortes.
- La sala conserva su geometría: sin muros que aparezcan ni ventanas que cambien.
- Luz estable: el sol no se mueve dentro del clip.
- Todo permanece dentro del cuadro, sin recortes en los bordes.

## 1 · Recepción — `sala1.jpg`

Slow forward dolly into the reception, camera at chest height, moving straight
ahead about one and a half metres over the whole shot. (0.0-1.5s) the counter
edge drifts past the left of frame as we advance. (1.5-3.5s) the framed
credentials on the wall grow slightly and stay sharp. (3.5-5.0s) the dolly
decelerates and settles. One continuous handheld push, no cuts, no pan, no
zoom. The room geometry never changes; furniture never slides. Sunlight stays
fixed. Everything stays inside the frame. No people, no text.

## 2 · Oficina privada — `sala2.jpg`

Slow forward dolly toward the desk and the monitor, camera at seated eye
height. (0.0-1.5s) begin advancing, the desk edge entering the lower frame.
(1.5-3.5s) the monitor grows steadily and becomes the centre of attention, its
screen readable. (3.5-5.0s) the move eases to a stop just short of the desk.
One continuous push, no cuts, no pan, no orbit. Nothing on the desk moves. The
chair stays where it is. Sunlight stays fixed. Everything stays inside the
frame. No people, no text.

## 3 · Archivo — `sala3.jpg`

Slow lateral dolly to the right along the archive shelving, camera at chest
height, travelling about one metre. (0.0-1.5s) the shelving begins to slide past
with real parallax, near boxes moving faster than far ones. (1.5-3.5s) the
scanning table enters from the right of frame. (3.5-5.0s) the move eases out.
One continuous tracking shot, no cuts, no zoom, no rotation. The boxes and
folders never move on their own. Sunlight stays fixed. Everything stays inside
the frame. No people, no text.

## 4 · Sala de juntas — `sala4.jpg`

Slow forward dolly along the length of the meeting table, camera at standing
eye height. (0.0-1.5s) the near end of the table slides beneath the frame as we
advance. (1.5-3.5s) the far chairs and the wall screen grow steadily.
(3.5-5.0s) the move decelerates and holds. One continuous push, no cuts, no
pan, no crane. Chairs and folders never move. Sunlight stays fixed. Everything
stays inside the frame. No people, no text.

## 5 · Biblioteca jurídica — `sala5.jpg`

Slow forward dolly into the law library, camera at chest height, ending close
to the reading table. (0.0-1.5s) begin advancing, bookcases entering from both
sides with parallax. (1.5-3.5s) the leather spines pass close enough to read as
individual volumes. (3.5-5.0s) the move eases to a stop at the reading table
with the open volume. One continuous push, no cuts, no pan, no orbit. Books and
papers never move. Sunlight stays fixed. Everything stays inside the frame. No
people, no text.
