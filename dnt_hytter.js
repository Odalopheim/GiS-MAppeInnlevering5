import { supabase } from './supabase.js'; // Importer Supabase-klienten

// Funksjon for egendefinert markør med farge og popup
export function customMarker(feature, latlng, color = "#0074D9") {
    let marker = L.circleMarker(latlng, {
        radius: 6,
        fillColor: color,
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.9
    });

    if (feature.properties.navn) {
        marker.bindPopup(`<b>${feature.properties.navn}</b>`);
    }

    return marker;
}

// Funksjon for å hente og vise hytter
export async function fetchGeoJSONHytter(map, layerGroup) {
    const { data, error } = await supabase
        .from('DNT_Hytter_view') // Bruker en view fra Supabase som allerede har GeoJSON-formatet
        .select('id, Navn, Kommune, Betjeningsgrad, Sengeplasser, geom'); // geom er allerede i GeoJSON-format

    if (error) {
        console.error('Feil ved henting av data:', error);
        return;
    }

    const geojson = {
        type: 'FeatureCollection',
        features: data.map(item => ({
            type: 'Feature',
            geometry: item.geom, // Direkte bruk av GeoJSON-formatet
            properties: {
                id: item.id,
                navn: item.Navn || 'Ukjent'
            }
        }))
    };

    // Legg til i lag med tilpasset markør
    L.geoJSON(geojson, {
        pointToLayer: (feature, latlng) => customMarker(feature, latlng, "#0074D9")
    }).addTo(layerGroup);
}