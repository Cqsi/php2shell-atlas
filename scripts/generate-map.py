"""Generate SVG country paths from public-domain Natural Earth boundary data.

The world view uses johan/world.geo.json. Regional views load Natural Earth's
1:50m countries from nvkelso/natural-earth-vector for finer coastlines and borders.
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

regional_source = json.loads(Path('data/countries-50m.geo.json').read_text())
known_ids = {country['id'] for country in countries}
detail_paths = {}
for feature in regional_source['features']:
    code = feature['properties']['ADM0_A3']
    if code not in known_ids:
        continue
    geometry = feature['geometry']
    polygons = [geometry['coordinates']] if geometry['type'] == 'Polygon' else geometry['coordinates']
    paths = []
    for polygon in polygons:
        for ring in polygon:
            points = []
            for lon, lat in ring:
                x, y = project(lon, lat)
                point = f'{x:.2f},{y:.2f}'
                if not points or point != points[-1]:
                    points.append(point)
            if len(points) >= 3:
                paths.append('M' + ' '.join(points) + 'Z')
    detail_paths[code] = ''.join(paths)

Path('data/map-detail.json').write_text(json.dumps({'paths': detail_paths}, separators=(',', ':')))
print(f'{len(detail_paths)} detailed countries')
