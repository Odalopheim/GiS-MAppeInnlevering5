import { supabase } from './supabase.js'; // Importer Supabase-klienten

// Generisk funksjon for å hente og vise GeoJSON-data
export async function fetchGeoJSONRuter(map, layerGroup, tableName, color = "#0074D9") {
    const bounds = map.getBounds();
    const boundsJson = {
        west: bounds.getWest(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        north: bounds.getNorth()
    };

    const { data, error } = await supabase
        .rpc('get_routes_in_bounds', { bounds: boundsJson, view_name: tableName });

    if (error) {
        console.error(`Feil ved henting av data fra ${tableName}:`, error);
        return;
    }

    if (!data || data.length === 0) {
        console.warn(`Ingen data funnet i ${tableName}.`);
        return;
    }

    const geojson = {
        type: 'FeatureCollection',
        features: data.map(item => ({
            type: 'Feature',
            geometry: item.geom,
            properties: {
                id: item.id,
                navn: item.navn || 'Ukjent'
            }
        }))
    };

    layerGroup.clearLayers();
    L.geoJSON(geojson, {
        style: {
            color: color,
            weight: 3,
            opacity: 0.7
        },
        onEachFeature: (feature, layer) => {
            if (feature.properties.navn) {
                layer.bindPopup(`<b>${feature.properties.navn}</b>`);
            }
        }
    }).addTo(layerGroup);
}
//fotturer

export async function fetchGeoJSONFot(map, layerGroup) {
    await fetchGeoJSONRuter(map, layerGroup, 'fotruter_geojson_view', '#0074D9');

}
//skiløyper
export async function fetchGeoJSONSki(map, layerGroup) {
    await fetchGeoJSONRuter(map, layerGroup, 'skiloype_geojson_view', '#33FF57');
}
//sykkelruter

export async function fetchGeoJSONSykkel(map, layerGroup) {
    await fetchGeoJSONRuter(map, layerGroup, 'sykkelrute_geojson_view', '#FF5733');
}

//annenrute
export async function fetchGeoJSONAnnen(map, layerGroup) {
    await fetchGeoJSONRuter(map, layerGroup, 'annenrute_geojson_view', '#FF33A1');
}

export async function fetch_all_ruter() {
    try {
        const response = await fetch('http://localhost:5000/fetch_all_ruter');
        const data = await response.json();

        if (data.success && data.data.features) {
            data.data.features.forEach((rute) => {
                const coords = rute.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
                let color;

                // Velg farge basert på rutetypen
                switch (rute.properties.type) {
                    case "Annenrute":
                        color = "purple";
                        break;
                    case "Fottur":
                        color = "green";
                        break;
                    case "Sykkelrute":
                        color = "blue";
                        break;
                    case "Skirute":
                        color = "red";
                        break;
                    default:
                        color = "gray";
                }

                // Legg til ruten på kartet
                const polyline = L.polyline(coords, { color }).addTo(map);
                polyline.bindPopup(`${rute.properties.type}: ${rute.properties.name}`);
            });
        } else {
            console.error('Feil ved henting av ruter:', data.error);
        }
    } catch (err) {
        console.error('Feil ved henting av ruter:', err);
    }
}