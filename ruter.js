import { supabase } from './supabase.js'; // Importer Supabase-klienten

// Generisk funksjon for å hente og vise GeoJSON-data
export async function fetchGeoJSONRuter(map, layerGroup, tableName, color = "#0074D9") {
    const { data, error } = await supabase
        .from(tableName) // Bruker tabellnavnet som parameter
        .select('id, navn, geom'); // Sørg for at feltene er konsistente i alle tabeller

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
            geometry: item.geom, // GeoJSON-linjer for ruter
            properties: {
                id: item.id,
                navn: item.navn || 'Ukjent'
            }
        }))
    };

    // Legg til i lag med tilpasset linje
    layerGroup.clearLayers(); // Tøm laget før du legger til nye data
    L.geoJSON(geojson, {
        style: {
            color: color,
            weight: 3,
            opacity: 1
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