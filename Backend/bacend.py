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

@app.route('/fetch_all_ruter', methods=['GET'])
def fetch_all_ruter():
    try:
        headers = {
            "apikey": SUPABASE_API_KEY,
            "Authorization": f"Bearer {SUPABASE_API_KEY}"
        }

        # Hent data fra alle tabellene og konverter geom til GeoJSON
        responses = {
            "annenrute_geojson_view": requests.get(
                f"{SUPABASE_URL}/rest/v1/annenrute_geojson_view",
                headers=headers,
                params={"select": "id, name, ST_AsGeoJSON(geom)::json as geometry"}
            ),
            "fotruter_geojson_view": requests.get(
                f"{SUPABASE_URL}/rest/v1/fotruter_geojson_view",
                headers=headers,
                params={"select": "id, name, ST_AsGeoJSON(geom)::json as geometry"}
            ),
            "sykkelrute_geojson_view": requests.get(
                f"{SUPABASE_URL}/rest/v1/sykkelrute_geojson_view",
                headers=headers,
                params={"select": "id, name, ST_AsGeoJSON(geom)::json as geometry"}
            ),
            "skiloype_geojson_view": requests.get(
                f"{SUPABASE_URL}/rest/v1/skiloype_geojson_view",
                headers=headers,
                params={"select": "id, name, ST_AsGeoJSON(geom)::json as geometry"}
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
                                "geometry": row['geometry'],
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