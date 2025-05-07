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
