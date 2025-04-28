import { supabase } from './supabase.js'; // Importer Supabase-klienten

// Funksjon for egendefinert linje med farge og popup
export function customLine(feature, color = "#0074D9") {
    let line = L.polyline(feature.geometry.coordinates, {
        color: color,
        weight: 3,
        opacity: 1
    });

    if (feature.properties.navn) {
        line.bindPopup(`<b>${feature.properties.navn}</b>`);
    }

    return line;
}

// Funksjon for å hente og vise ruteinfo
export async function fetchGeoJSONAnnen(map, layerGroup) {
    const { data, error } = await supabase
        .from('annenrute_geojson_view') // Bruker en view fra Supabase som allerede har GeoJSON-formatet
        .select('id, navn, geom'); // geom er allerede i GeoJSON-format

    if (error) {
        console.error('Feil ved henting av data:', error);
        return;
    }

    const geojson = {
        type: 'FeatureCollection',
        features: data.map(item => ({
            type: 'Feature',
            geometry: item.geom, // GeoJSON-linjer for ruter
            properties: {
                id: item.id,
                navn: item.navn || 'Ukjent'
            }
        }))
    };

    // Legg til i lag med tilpasset linje
    L.geoJSON(geojson, {
        onEachFeature: (feature, layer) => {
            if (feature.properties.navn) {
                layer.bindPopup(`<b>${feature.properties.navn}</b>`);
            }
        }
    }).addTo(layerGroup);
}
