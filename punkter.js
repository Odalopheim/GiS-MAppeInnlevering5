import { supabase } from './supabase.js'; // Importer Supabase-klienten

// Generisk funksjon for å hente og vise GeoJSON-data
export async function fetchGeoJSONPunkter(map, layerGroup, tableName, color = "#0074D9") {
    const { data, error } = await supabase
        .from(tableName) // Bruker tabellnavnet som parameter
        .select('*'); // Sørg for at feltene er konsistente i alle tabeller

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
            geometry: item.geom, // GeoJSON-linjer eller punkter
            properties: {
                id: item.id,
                navn: item.navn || item.Navn || 'Ukjent',
                kommune: item.kommune || item.Komunne || 'Ukjent',
                betjeningsgrad: item.betjeningsgrad || item.Betjeningsgrad || 'Ukjent',
                sengeplasser: item.sengeplasser || item.Sengeplasser || 'Ukjent'
            }
        }))
    };

    // Legg til i lag med tilpasset markør eller linje
    layerGroup.clearLayers();
    L.geoJSON(geojson, {
        pointToLayer: (feature, latlng) => customMarker(feature, latlng, color),
        style: {
            color: color,
            weight: 3,
            opacity: 1
        },
        onEachFeature: (feature, layer) => {
            // pop-up med informasjon om hyttene 
            const { navn, kommune, betjeningsgrad, sengeplasser } = feature.properties;
            const popupContent = `
                <b>Navn:</b> ${navn}<br> 
                <b>Kommune:</b> ${kommune}<br>
                <b>Betjeningsgrad:</b> ${betjeningsgrad}<br>
                <b>Sengeplasser:</b> ${sengeplasser} 
            `;
            layer.bindPopup(popupContent);
        }
    }).addTo(layerGroup);
}
export function customMarker(feature, latlng, color = "#0074D9") {
    let marker = L.circleMarker(latlng, {
        radius: 3,
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