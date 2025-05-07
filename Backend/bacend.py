import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from pyproj import Transformer
import networkx as nx
import requests
import json

# Flask-app
app = Flask(__name__)
CORS(app)

# EPSG:4326 til EPSG:3395 konvertering
transformer = Transformer.from_crs("EPSG:4326", "EPSG:3395", always_xy=True)

def reproject_point_to_epsg3395(point):
    if isinstance(point, str):
        lng, lat = map(float, point.split(","))
    elif isinstance(point, dict) and 'lat' in point and 'lng' in point:
        lng, lat = point['lng'], point['lat']
    else:
        raise ValueError(f"Invalid point format: {point}")
    x, y = transformer.transform(lng, lat)
    return x, y

SUPABASE_URL = "https://bpttsywlhshivfsyswvz.supabase.co"
SUPABASE_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwdHRzeXdsaHNoaXZmc3lzd3Z6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2MzQzMjQsImV4cCI6MjA2MDIxMDMyNH0.bEJZQOS5bqHmDrO1vNCkX0hirsz7zDp1QsBxdoywxbA"

headers = {
    "apikey": SUPABASE_API_KEY,
    "Authorization": f"Bearer {SUPABASE_API_KEY}"
}

@app.route('/fetch_all_ruter', methods=['GET'])
def fetch_all_ruter():
    try:
        responses = {
            "annenrute_geojson_view": requests.get(
                f"{SUPABASE_URL}/rest/v1/annenrute_geojson_view",
                headers=headers,
                params={"select": "id, name, geom"}
            ),
            "fotruter_geojson_view": requests.get(
                f"{SUPABASE_URL}/rest/v1/fotruter_geojson_view",
                headers=headers,
                params={"select": "id, name, geom"}
            ),
            "sykkelrute_geojson_view": requests.get(
                f"{SUPABASE_URL}/rest/v1/sykkelrute_geojson_view",
                headers=headers,
                params={"select": "id, navn, geom"}
            ),
            "skiloype_geojson_view": requests.get(
                f"{SUPABASE_URL}/rest/v1/skiloype_geojson_view",
                headers=headers,
                params={"select": "id, name, geom"}
            )
        }

        features = []

        for key, response in responses.items():
            print(f"Henter data fra {key}: Statuskode {response.status_code}")
            if response.status_code == 200:
                try:
                    rows = response.json()
                    print(f"Antall rader hentet fra {key}: {len(rows)}")
                    for row in rows:
                        try:
                            features.append({
                                "type": "Feature",
                                "geometry": row['geom'],
                                "properties": {
                                    "id": row['id'],
                                    "name": row['name'],
                                    "type": key.capitalize()
                                }
                            })
                        except KeyError as e:
                            print(f"Feil i {key} data: {e}")
                except Exception as e:
                    print(f"Feil ved parsing av JSON fra {key}: {e}")
            else:
                print(f"Feil ved henting av {key}: {response.status_code} - {response.text}")

        data = {
            "type": "FeatureCollection",
            "features": features
        }

        return jsonify({'success': True, 'data': data})
    except Exception as e:
        print("Feil ved henting av ruter:", str(e))
        return jsonify({'success': False, 'error': str(e)})

# AI-basert anbefaling av ruter
@app.route('/anbefal_rute', methods=['POST'])
def anbefal_rute():
    try:
        data = request.json
        bruker_pos = reproject_point_to_epsg3395(data['location'])
        erfaring = data.get('experience', 'nybegynner').lower()
        rutetype = data.get('type', 'skitur').lower()

        # Bestem hvilken tabell vi skal bruke
        tabellnavn = {
            'skitur': 'skiloype_geojson_view',
            'fottur': 'fotruter_geojson_view'
        }.get(rutetype)

        if not tabellnavn:
            return jsonify({'success': False, 'error': 'Ugyldig rutetype. Bruk "skitur" eller "fottur".'})

        response = requests.get(
            f"{SUPABASE_URL}/rest/v1/{tabellnavn}",
            headers=headers,
            params={"select": "id, name, geom"}
        )

        if response.status_code != 200:
            return jsonify({'success': False, 'error': f'Feil ved henting av {rutetype}er'})

        ruter = response.json()
        anbefalte = []

        for rute in ruter:
            try:
                geom = rute['geom']
                coords = geom['coordinates'][0] if geom['type'] == 'LineString' else geom['coordinates'][0][0]
                rute_pos = reproject_point_to_epsg3395({"lng": coords[0], "lat": coords[1]})
                avstand = ((rute_pos[0] - bruker_pos[0])**2 + (rute_pos[1] - bruker_pos[1])**2)**0.5

                # Dynamisk AI-beslutning basert på rutetype og erfaring
                max_distanse = {
                    'skitur': {'nybegynner': 5000, 'erfaren': 15000},
                    'fottur': {'nybegynner': 3000, 'erfaren': 10000}
                }.get(rutetype, {}).get(erfaring, 5000)

                if avstand < max_distanse:
                    anbefalte.append(rute)
            except Exception as e:
                print(f"Feil ved behandling av {rutetype}: {e}")

        return jsonify({'success': True, 'anbefalte_ruter': anbefalte})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})
