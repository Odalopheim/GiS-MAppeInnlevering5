import { supabase } from './supabase.js'; // Importer Supabase-klienten

// Funksjon for egendefinert polygon med farge og popup
export function customPolygon(feature, color = "#0074D9") {
    let polygon = L.polygon(feature.geometry.coordinates, {
        color: color,
        weight: 3,
        opacity: 0.7
    });

    if (feature.properties.navn) {
        polygon.bindPopup(`<b>${feature.properties.navn}</b>`);
    }

    return polygon;
}

// Funksjon for å hente og vise polygoninfo
export async function fetchGeoJSONSkredFaresone(map, layerGroup) {
    const { data, error } = await supabase
        .from('skredfaresoner_geojson_view') // Endre til riktig tabell eller view
        .select('id, navn, geom');

    if (error) {
        console.error('Feil ved henting av data:', error);
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

    L.geoJSON(geojson, {
        onEachFeature: (feature, layer) => {
            if (feature.properties.navn) {
                layer.bindPopup(`<b>${feature.properties.navn}</b>`);
            }
        }
    }).addTo(layerGroup);
}
