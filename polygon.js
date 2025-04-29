import { supabase } from './supabase.js'; // Importer Supabase-klienten

export async function fetchGeoJSONPolygon(map, layerGroup, tableName, color = "#0074D9") {
    const { data, error } = await supabase
        .from(tableName) // Generisk tabell- eller view-navn
        .select('id, navn, geom');

    if (error) {
        console.error(`Feil ved henting av data fra ${tableName}:`, error.message, error.hint);
        return;
    }

    if (!data || data.length === 0) {
        console.warn(`Ingen data funnet for ${tableName}.`);
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
        style: () => ({
            color: color,
            weight: 3,
            opacity: 0.7
        }),
        onEachFeature: (feature, layer) => {
            if (feature.properties.navn) {
                layer.bindPopup(`<b>${feature.properties.navn}</b>`);
            }
        }
    }).addTo(layerGroup);
}