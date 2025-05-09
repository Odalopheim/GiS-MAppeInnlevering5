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

    // Hent data fra Supabase ved hjelp av en RPC-funksjon
    const { data, error } = await supabase
        .rpc('get_routes_in_bounds', { bounds: boundsJson, view_name: tableName });

    // Feilhåndtering hvis data ikke kan hentes
    if (error) {
        console.error(`Feil ved henting av data fra ${tableName}:`, error);
        return null;  // Returner null om det er feil
    }

    // Hvis ingen data finnes
    if (!data || data.length === 0) {
        console.warn(`Ingen data funnet i ${tableName}.`);
        return null;  // Returner null hvis ingen data
    }

    // Bygg GeoJSON
    const geojson = {
        type: 'FeatureCollection',
        features: data.map(item => ({
            type: 'Feature',
            geometry: item.geom, // Forutsetter at 'geom' er GeoJSON-kompatibel
            properties: {
                id: item.id,
                navn: item.navn || 'Ukjent'
            }
        }))
    };

    // Fjern tidligere lag hvis layerGroup er definert
    if (layerGroup) {
        layerGroup.clearLayers();
    }

    // Lag et GeoJSON-lag og legg til kartet
    const geojsonLayer = L.geoJSON(geojson, {
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
    });

    // Legg til laget på kartet hvis layerGroup er definert
    if (layerGroup) {
        geojsonLayer.addTo(layerGroup);
    }

    // Returner GeoJSON for videre behandling (brukes i fetchGeoJSONFot)
    return geojson;
}

    
//fotturer

export async function fetchGeoJSONFot(map, layerGroup) {
    // Få GeoJSON fra fetchGeoJSONRuter og returner det
    const geojson = await fetchGeoJSONRuter(map, layerGroup, 'fotruter_geojson_view', '#0074D9');
    
    if (!geojson || !geojson.features) {
        console.error('GeoJSON is invalid:', geojson);  // Logg en feil hvis geojson er ugyldig
        return null;  // Returner null hvis geojson er ugyldig
    }
    
    return geojson;  // Returner geojson-dataene til den som kaller funksjonen
}
//skiløyper
export async function fetchGeoJSONSki(map, layerGroup) {
    await fetchGeoJSONRuter(map, layerGroup, 'skiloype_geojson_view', '#33FF57');
}
//sykkelruter

export async function fetchGeoJSONSykkel(map, layerGroup) {
    await fetchGeoJSONRuter(map, layerGroup, 'sykkelrute_geojson_view', '#FF5733');
}
