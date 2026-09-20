# lotus_medallion.py — bake the hero's carved lotus-chakra relief medallion.
#
# Original geometry (an 8-petal double lotus + concentric gold rings + a 12-spoke
# chakra hub) in warm sandstone + gold-leaf, lit and rendered in Cycles to a
# transparent 1024² PNG. This is our OWN ornament in the reverent spirit of
# classical Indian relief — no copied art. Run inside Blender (bpy).
#
# Output: public/img/art/lotus-medallion.png
# Discipline (matches the portfolio engine rule): we ship the BAKED TEXTURE, not
# the mesh — the web uses the PNG.

import bpy, math

def reset():
    bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
    for coll in (bpy.data.meshes, bpy.data.materials, bpy.data.lights, bpy.data.cameras):
        for b in list(coll):
            if b.users == 0: coll.remove(b)

def mat(name, base, rough, metal=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes.get("Principled BSDF")
    b.inputs["Base Color"].default_value = (*base, 1)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    return m

def add_light(name, loc, energy, size, color, rot=(0, 0, 0)):
    ld = bpy.data.lights.new(name, 'AREA'); ld.energy = energy; ld.size = size; ld.color = color
    o = bpy.data.objects.new(name, ld); o.location = loc; o.rotation_euler = rot
    bpy.context.collection.objects.link(o); return o

def build():
    reset()
    plaster = mat("Plaster", (0.52, 0.40, 0.26), 0.9)
    gold    = mat("Gold",    (0.72, 0.52, 0.16), 0.35, metal=1.0)
    rose    = mat("Rose",    (0.55, 0.24, 0.16), 0.5)

    # ground disc
    bpy.ops.mesh.primitive_cylinder_add(vertices=128, radius=1.0, depth=0.08, location=(0, 0, 0))
    g = bpy.context.active_object; g.name = "Ground"; bpy.ops.object.shade_smooth()
    g.data.materials.append(plaster)

    # concentric gold rings
    for i, (r, minor, z) in enumerate([(0.94, 0.012, 0.05), (0.62, 0.016, 0.06), (0.30, 0.02, 0.07)]):
        bpy.ops.mesh.primitive_torus_add(major_radius=r, minor_radius=minor, location=(0, 0, z),
                                         major_segments=128, minor_segments=16)
        t = bpy.context.active_object; bpy.ops.object.shade_smooth(); t.data.materials.append(gold)

    # outer + inner lotus petals
    for i in range(8):
        a = i * math.pi / 4
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.16, location=(math.cos(a) * 0.46, math.sin(a) * 0.46, 0.05))
        p = bpy.context.active_object; p.scale = (0.5, 0.16, 0.42); p.rotation_euler = (0, 0, a)
        bpy.ops.object.transform_apply(scale=True, rotation=True); bpy.ops.object.shade_smooth()
        p.data.materials.append(gold)
    for i in range(8):
        a = i * math.pi / 4 + math.pi / 8
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.12, location=(math.cos(a) * 0.30, math.sin(a) * 0.30, 0.055))
        p = bpy.context.active_object; p.scale = (0.5, 0.15, 0.4); p.rotation_euler = (0, 0, a)
        bpy.ops.object.transform_apply(scale=True, rotation=True); bpy.ops.object.shade_smooth()
        p.data.materials.append(rose)

    # chakra hub + spokes
    bpy.ops.mesh.primitive_cylinder_add(vertices=64, radius=0.14, depth=0.10, location=(0, 0, 0.09))
    h = bpy.context.active_object; bpy.ops.object.shade_smooth(); h.data.materials.append(gold)
    for i in range(12):
        a = i * math.pi / 6
        bpy.ops.mesh.primitive_cube_add(size=1, location=(math.cos(a) * 0.20, math.sin(a) * 0.20, 0.075))
        s = bpy.context.active_object; s.scale = (0.16, 0.014, 0.02); s.rotation_euler = (0, 0, a)
        bpy.ops.object.transform_apply(scale=True, rotation=True); s.data.materials.append(gold)

    add_light("Key",  (2.2, -2.0, 3.2), 220, 3, (1, 0.9, 0.72), (math.radians(35), 0, math.radians(35)))
    add_light("Fill", (-2.4, -1.2, 2.0), 70, 4, (0.8, 0.85, 1.0))
    add_light("Rim",  (0, 2.6, 1.6), 110, 3, (1, 0.86, 0.6))

    cam_data = bpy.data.cameras.new("Cam"); cam_data.lens = 85
    cam = bpy.data.objects.new("Cam", cam_data); bpy.context.collection.objects.link(cam)
    cam.location = (0, -0.15, 4.2); cam.rotation_euler = (math.radians(2), 0, 0)
    bpy.context.scene.camera = cam

    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    try: sc.cycles.device = 'GPU'
    except Exception: pass
    sc.cycles.samples = 160
    sc.render.film_transparent = True
    sc.render.resolution_x = sc.render.resolution_y = 1024
    sc.render.image_settings.file_format = 'PNG'; sc.render.image_settings.color_mode = 'RGBA'
    sc.view_settings.exposure = -1.2
    w = bpy.data.worlds['World']; w.use_nodes = True
    bg = w.node_tree.nodes.get("Background")
    bg.inputs["Color"].default_value = (0.09, 0.07, 0.05, 1); bg.inputs["Strength"].default_value = 0.25

if __name__ == "__main__":
    build()
    # bpy.ops.render.render(write_still=True) after setting sc.render.filepath
