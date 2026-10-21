"""Generate the compact dotted SVG map embedded in worker/index.js.

Boundary source: johan/world.geo.json (public domain Natural Earth data).
"""
import json
from pathlib import Path

source = json.loads(Path('data/countries.geo.json').read_text())
WIDTH, HEIGHT = 1200, 560

def project(lon, lat):
    return ((lon + 180) / 360 * WIDTH, (80 - lat) / 140 * HEIGHT)

def ring_contains(ring, lon, lat):
    inside = False
    j = len(ring) - 1
    for i, (xi, yi) in enumerate(ring):
        xj, yj = ring[j]
        if (yi > lat) != (yj > lat) and lon < (xj - xi) * (lat - yi) / (yj - yi) + xi:
            inside = not inside
        j = i
    return inside

def polygon_contains(poly, lon, lat):
    if not ring_contains(poly[0], lon, lat):
        return False
    return not any(ring_contains(hole, lon, lat) for hole in poly[1:])

countries = []
for feature in source['features']:
    geometry = feature['geometry']
    polygons = [geometry['coordinates']] if geometry['type'] == 'Polygon' else geometry['coordinates']
    boxes = []
    paths = []
    for poly in polygons:
        for ring in poly:
            points = [project(*point) for point in ring]
            if not points:
                continue
            paths.append('M' + ' '.join(f'{x:.1f},{y:.1f}' for x, y in points) + 'Z')
        outer = poly[0]
        boxes.append((min(p[0] for p in outer), max(p[0] for p in outer), min(p[1] for p in outer), max(p[1] for p in outer)))
    countries.append((feature['id'], feature['properties']['name'], polygons, boxes, ''.join(paths)))

dots = []
step = 7.5
for row in range(1, int(HEIGHT / step)):
    y = row * step
    lat = 80 - y / HEIGHT * 140
    for col in range(1, int(WIDTH / step)):
        x = col * step + (step / 2 if row % 2 else 0)
        lon = x / WIDTH * 360 - 180
        for code, _name, polygons, boxes, _path in countries:
            if any(a <= lon <= b and c <= lat <= d and polygon_contains(poly, lon, lat)
                   for poly, (a,b,c,d) in zip(polygons, boxes)):
                dots.append([round(x,1), round(y,1), code])
                break

data = {
    'dots': dots,
    'countries': [{'id': code, 'name': name, 'path': path} for code, name, _, _, path in countries],
}
Path('data/map-data.json').write_text(json.dumps(data, separators=(',', ':')))
print(f'{len(dots)} dots, {len(countries)} countries')
