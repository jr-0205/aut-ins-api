from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


CANVAS_W = 6000
CANVAS_H = 3400
NODE_W = 1080
NODE_H = 340
HEADER_H = 92


def font(size: int, bold: bool = False):
    family = "arialbd.ttf" if bold else "arial.ttf"
    path = Path("C:/Windows/Fonts") / family
    return ImageFont.truetype(str(path), size=size)


TITLE_FONT = font(86, True)
SUBTITLE_FONT = font(48)
LANE_FONT = font(48, True)
NODE_TITLE_FONT = font(62, True)
NODE_TITLE_SMALL = font(53, True)
FIELD_FONT = font(57)
FIELD_BOLD = font(57, True)
CARD_FONT = font(48, True)
LEGEND_FONT = font(43)


NODES = {
    # Flujo principal
    "persona": (100, 430, "tbl_persona", ["PK id_persona", "UQ curp", "nombre / correo"]),
    "aspirante": (1280, 430, "tbl_aspirante", ["PK id_aspirante", "FK persona / carrera", "fecha_registro"]),
    "expediente": (2460, 430, "tbl_expediente", ["PK id_expediente", "UQ folio / aspirante", "FK estado_exp. / dictaminador"]),
    "alumno": (3640, 430, "tbl_alumno", ["PK id_alumno", "FK usuario / expediente", "FK carrera / estado"]),
    "inscripcion": (4820, 430, "tbl_inscripcion", ["PK id_inscripcion", "FK alumno / grupo", "FK periodo / estado_ins."]),
    # Referencias del núcleo
    "proceso": (100, 1040, "tbl_proceso_activo", ["PK/FK id_persona", "FK id_aspirante", "un proceso vigente"]),
    "carrera": (1280, 1040, "tbl_cat_carrera", ["PK id_carrera", "UQ clave / nombre", "activa"]),
    "estado_exp": (2460, 1040, "tbl_cat_estado_expediente", ["PK id_estado_expediente", "UQ codigo", "bloquea_curp / terminal"]),
    "usuario": (3640, 1040, "tbl_usuario", ["PK id_usuario", "UQ matricula", "hash / tipo / activo"]),
    "estado_alumno": (4820, 1040, "tbl_cat_estado_alumno", ["PK id_estado_alumno", "UQ codigo", "bloquea_curp / terminal"]),
    # Documentos y oferta académica
    "notificacion": (100, 1650, "tbl_notificacion_aspirante", ["PK id_notificacion", "FK id_aspirante", "tipo / estado / envio"]),
    "tipo_doc": (1280, 1650, "tbl_cat_tipo_documento", ["PK id_tipo_documento", "UQ codigo", "requerido / activo"]),
    "documento": (2460, 1650, "tbl_documento", ["PK id_documento", "FK expediente / tipo", "UQ version"]),
    "periodo": (3640, 1650, "tbl_cat_periodo", ["PK id_periodo", "UQ nombre", "fechas / estado"]),
    "grupo": (4820, 1650, "tbl_grupo", ["PK id_grupo", "FK carrera / periodo", "clave / capacidad"]),
    # Seguridad e historial
    "doc_vigente": (100, 2260, "tbl_documento_vigente", ["PK expediente + tipo", "FK id_documento", "version actual"]),
    "hist_exp": (1280, 2260, "tbl_historial_estado_expediente", ["PK id_historial", "FK expediente / estados", "FK registrado_por"]),
    "rol": (2460, 2260, "tbl_cat_rol_empleado", ["PK id_rol_empleado", "UQ codigo", "nombre / activo"]),
    "empleado": (3640, 2260, "tbl_empleado", ["PK id_empleado", "FK usuario / rol", "FK carrera opcional"]),
    "estado_ins": (4820, 2260, "tbl_cat_estado_inscripcion", ["PK id_estado_inscripcion", "UQ codigo", "ocupa_cupo / terminal"]),
    # Trazabilidad y mensajería
    "hist_alumno": (100, 2870, "tbl_historial_estado_alumno", ["PK id_historial", "FK alumno / estados", "FK registrado_por"]),
    "hist_ins": (1280, 2870, "tbl_historial_inscripcion", ["PK id_historial", "FK inscripcion / estados", "FK grupos / responsable"]),
    "conversacion": (2460, 2870, "tbl_conversacion", ["PK id_conversacion", "FK alumno / empleado", "area / asunto / estado"]),
    "mensaje": (3640, 2870, "tbl_mensaje", ["PK id_mensaje", "FK conversacion", "FK usuario remitente"]),
    "lectura": (4820, 2870, "tbl_mensaje_lectura", ["PK mensaje + usuario", "FK id_mensaje", "FK id_usuario"]),
}


RELATIONSHIPS = [
    # parent, child, cardinalities, secondary
    ("persona", "aspirante", "1", "N", False),
    ("persona", "proceso", "1", "0..1", False),
    ("aspirante", "proceso", "1", "0..1", False),
    ("carrera", "aspirante", "1", "N", False),
    ("aspirante", "expediente", "1", "0..1", False),
    ("aspirante", "notificacion", "1", "N", False),
    ("estado_exp", "expediente", "1", "N", False),
    ("expediente", "documento", "1", "N", False),
    ("tipo_doc", "documento", "1", "N", False),
    ("documento", "doc_vigente", "1", "0..1", False),
    ("expediente", "alumno", "1", "0..1", False),
    ("usuario", "alumno", "1", "0..1", False),
    ("carrera", "alumno", "1", "N", True),
    ("estado_alumno", "alumno", "1", "N", False),
    ("usuario", "empleado", "1", "0..1", False),
    ("rol", "empleado", "1", "N", False),
    ("carrera", "empleado", "1", "N", True),
    ("periodo", "grupo", "1", "N", False),
    ("carrera", "grupo", "1", "N", True),
    ("alumno", "inscripcion", "1", "N", False),
    ("periodo", "inscripcion", "1", "N", True),
    ("grupo", "inscripcion", "1", "N", False),
    ("estado_ins", "inscripcion", "1", "N", False),
    ("expediente", "hist_exp", "1", "N", True),
    ("estado_exp", "hist_exp", "1", "N", True),
    ("alumno", "hist_alumno", "1", "N", True),
    ("estado_alumno", "hist_alumno", "1", "N", True),
    ("inscripcion", "hist_ins", "1", "N", True),
    ("grupo", "hist_ins", "1", "N", True),
    ("empleado", "hist_exp", "1", "N", True),
    ("empleado", "hist_alumno", "1", "N", True),
    ("empleado", "hist_ins", "1", "N", True),
    ("alumno", "conversacion", "1", "N", False),
    ("empleado", "conversacion", "1", "N", True),
    ("conversacion", "mensaje", "1", "N", False),
    ("usuario", "mensaje", "1", "N", True),
    ("mensaje", "lectura", "1", "N", False),
    ("usuario", "lectura", "1", "N", True),
]


LANES = [
    (390, "FLUJO PRINCIPAL"),
    (1000, "REFERENCIAS DEL NÚCLEO"),
    (1610, "DOCUMENTOS Y OFERTA ACADÉMICA"),
    (2220, "SEGURIDAD E HISTORIAL"),
    (2830, "TRAZABILIDAD Y MENSAJERÍA"),
]


def node_rect(key: str):
    x, y, _, _ = NODES[key]
    return (x, y, x + NODE_W, y + NODE_H)


def nearest_anchors(source: str, target: str):
    ax1, ay1, ax2, ay2 = node_rect(source)
    bx1, by1, bx2, by2 = node_rect(target)
    ac = ((ax1 + ax2) // 2, (ay1 + ay2) // 2)
    bc = ((bx1 + bx2) // 2, (by1 + by2) // 2)
    dx, dy = bc[0] - ac[0], bc[1] - ac[1]
    if abs(dx) >= abs(dy):
        a = (ax2 if dx >= 0 else ax1, ac[1])
        b = (bx1 if dx >= 0 else bx2, bc[1])
        mid = (a[0] + b[0]) // 2
        points = [a, (mid, a[1]), (mid, b[1]), b]
    else:
        a = (ac[0], ay2 if dy >= 0 else ay1)
        b = (bc[0], by1 if dy >= 0 else by2)
        mid = (a[1] + b[1]) // 2
        points = [a, (a[0], mid), (b[0], mid), b]
    return points


def draw_dashed(draw: ImageDraw.ImageDraw, points, fill, width=7, dash=22, gap=15):
    for start, end in zip(points, points[1:]):
        x1, y1 = start
        x2, y2 = end
        length = max(abs(x2 - x1), abs(y2 - y1))
        if length == 0:
            continue
        steps = max(1, length // (dash + gap))
        for i in range(steps + 1):
            t1 = min(1.0, i * (dash + gap) / length)
            t2 = min(1.0, (i * (dash + gap) + dash) / length)
            if t1 >= 1:
                break
            p1 = (round(x1 + (x2 - x1) * t1), round(y1 + (y2 - y1) * t1))
            p2 = (round(x1 + (x2 - x1) * t2), round(y1 + (y2 - y1) * t2))
            draw.line([p1, p2], fill=fill, width=width)


def draw_relationship(draw: ImageDraw.ImageDraw, source, target, source_card, target_card, secondary):
    points = nearest_anchors(source, target)
    color = (164, 164, 164) if secondary else (92, 92, 92)
    if secondary:
        draw_dashed(draw, points, color, width=6)
    else:
        draw.line(points, fill=color, width=7, joint="curve")
    a, b = points[0], points[-1]
    radius = 11
    draw.ellipse((a[0] - radius, a[1] - radius, a[0] + radius, a[1] + radius), fill=color)
    draw.ellipse((b[0] - radius, b[1] - radius, b[0] + radius, b[1] + radius), fill=color)
    # Compact cardinality markers are placed just outside the node boundary.
    ax = a[0] + (18 if b[0] >= a[0] else -62)
    ay = a[1] + (18 if b[1] >= a[1] else -58)
    bx = b[0] + (-85 if b[0] >= a[0] else 20)
    by = b[1] + (-58 if b[1] >= a[1] else 18)
    draw.text((ax, ay), source_card, font=CARD_FONT, fill=color)
    draw.text((bx, by), target_card, font=CARD_FONT, fill=color)


def draw_node(draw: ImageDraw.ImageDraw, key: str):
    x, y, title, fields = NODES[key]
    rect = (x, y, x + NODE_W, y + NODE_H)
    draw.rounded_rectangle(rect, radius=22, fill=(255, 255, 255), outline=(20, 20, 20), width=6)
    draw.rounded_rectangle((x, y, x + NODE_W, y + HEADER_H + 12), radius=22, fill=(25, 25, 25))
    draw.rectangle((x, y + HEADER_H - 10, x + NODE_W, y + HEADER_H + 12), fill=(25, 25, 25))
    title_font = NODE_TITLE_SMALL if len(title) > 25 else NODE_TITLE_FONT
    bbox = draw.textbbox((0, 0), title, font=title_font)
    draw.text((x + (NODE_W - (bbox[2] - bbox[0])) / 2, y + 12), title, font=title_font, fill=(255, 255, 255))
    line_y = y + HEADER_H + 25
    for value in fields:
        is_key = value.startswith(("PK", "UQ", "FK"))
        draw.text((x + 28, line_y), value, font=FIELD_BOLD if is_key else FIELD_FONT, fill=(20, 20, 20))
        line_y += 68


def build_er_diagram(output: Path):
    image = Image.new("RGB", (CANVAS_W, CANVAS_H), "white")
    draw = ImageDraw.Draw(image)
    title = "DIAGRAMA ENTIDAD–RELACIÓN · MODELO FÍSICO AUT-INS"
    bbox = draw.textbbox((0, 0), title, font=TITLE_FONT)
    draw.text(((CANVAS_W - (bbox[2] - bbox[0])) / 2, 42), title, font=TITLE_FONT, fill=(15, 15, 15))
    subtitle = "25 tablas · claves principales y foráneas · cardinalidades esenciales"
    bbox = draw.textbbox((0, 0), subtitle, font=SUBTITLE_FONT)
    draw.text(((CANVAS_W - (bbox[2] - bbox[0])) / 2, 145), subtitle, font=SUBTITLE_FONT, fill=(75, 75, 75))

    for y, label in LANES:
        draw.line((100, y, 5900, y), fill=(205, 205, 205), width=4)
        draw.rounded_rectangle((100, y - 58, 1070, y - 6), radius=14, fill=(232, 232, 232))
        draw.text((125, y - 55), label, font=LANE_FONT, fill=(55, 55, 55))

    for relationship in RELATIONSHIPS:
        draw_relationship(draw, *relationship)
    for key in NODES:
        draw_node(draw, key)

    draw.rounded_rectangle((3850, 208, 5900, 355), radius=18, fill=(244, 244, 244), outline=(150, 150, 150), width=3)
    draw.text((3890, 226), "PK: primaria   FK: foránea   UQ: única", font=LEGEND_FONT, fill=(45, 45, 45))
    draw.line((3890, 310, 4140, 310), fill=(92, 92, 92), width=7)
    draw.text((4175, 285), "relación principal", font=LEGEND_FONT, fill=(65, 65, 65))
    draw_dashed(draw, [(4900, 310), (5150, 310)], (164, 164, 164), width=6)
    draw.text((5180, 285), "auditoría / apoyo", font=LEGEND_FONT, fill=(95, 95, 95))

    output.parent.mkdir(parents=True, exist_ok=True)
    image.save(output, format="PNG", optimize=True)
    return output


if __name__ == "__main__":
    target = Path(__file__).with_name("aut-ins-er-diagram.png")
    print(build_er_diagram(target))
