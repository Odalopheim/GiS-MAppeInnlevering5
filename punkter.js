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
                navn: item.navn || item.navn || 'Ukjent',
                kommune: item.kommune || item.kommune || 'Ukjent',
                betjeningsgrad: item.betjeningsgrad || item.betjeningsgrad || 'Ukjent',
                sengeplasser: item.sengeplasser || item.sengeplasser || 'Ukjent'
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

export function customMarker(feature, latlng) {
    const hytteIcon = L.icon({
        iconUrl: './images/hytteIcon.png', // Sett riktig filbane til bildet
        iconSize: [30, 30], 
        iconAnchor: [15, 30], 
        popupAnchor: [0, -30] 
    });

    const marker = L.marker(latlng, { icon: hytteIcon });

    // Sjekk om 'navn' finnes, og sett en fallback-tekst hvis det mangler
    const navn = feature.properties.navn || 'Ukjent navn';
    marker.bindPopup(`<b>${navn}</b>`);

    return marker;
}