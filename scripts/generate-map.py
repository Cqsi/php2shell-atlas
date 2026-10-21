"""Generate compact SVG country paths from Natural Earth boundary data.

Boundary source: johan/world.geo.json (public domain Natural Earth data).
"""
import json
from pathlib import Path

source = json.loads(Path('data/countries.geo.json').read_text())
WIDTH, HEIGHT = 1200, 560

def project(lon, lat):
    return ((lon + 180) / 360 * WIDTH, (80 - lat) / 140 * HEIGHT)

countries = []
for feature in source['features']:
    geometry = feature['geometry']
    polygons = [geometry['coordinates']] if geometry['type'] == 'Polygon' else geometry['coordinates']
    paths = []
    for poly in polygons:
        for ring in poly:
            points = [project(*point) for point in ring]
            if not points:
                continue
            paths.append('M' + ' '.join(f'{x:.1f},{y:.1f}' for x, y in points) + 'Z')
    countries.append({'id': feature['id'], 'name': feature['properties']['name'], 'path': ''.join(paths)})

data = {'countries': countries}
Path('data/map-data.json').write_text(json.dumps(data, separators=(',', ':')))
print(f'{len(countries)} countries')
