import { supabase } from './supabase.js';
import { fetchGeoJSONPunkter} from './punkter.js'; // Importer én gang

export async function fetchGeoJSONHytter(map, layerGroup) {
    await fetchGeoJSONPunkter(map, layerGroup, 'DNT_Hytter_view', '#0074D9');
}


export async function fetchAndSendHytter() {
    try {
        // Hent hyttedata fra Supabase
        const { data: hytter, error } = await supabase
            .from('hytter') // Bytt til riktig tabellnavn
            .select('*');

        if (error) {
            console.error('Feil ved henting av hytter fra Supabase:', error);
            return;
        }

        // Send hyttedata til backend
        const response = await fetch('http://localhost:5000/upload_hytter', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(hytter),
        });

        const result = await response.json();
        console.log('Resultat fra backend:', result);
    } catch (err) {
        console.error('Feil ved henting eller sending av hytter:', err);
    }
}

export async function fetchHytterFromBackend(map) {
    fetch('http://localhost:5000/fetch_dnt_hytter')
        .then(res => res.json())
        .then(data => {
            if (!data.success || !data.data || !data.data.features) {
                console.error('Feil: Ugyldig dataformat', data);
                return;
            }

            data.data.features.forEach(hytte => {
                const [lng, lat] = hytte.geometry.coordinates;
                const hytteId = hytte.properties.id;
                const hytteNavn = hytte.properties.name || "Ukjent navn";

                const marker = L.marker([lat, lng]).addTo(map);
                marker.bindPopup(`${hytteNavn} <br><button onclick="velgHytte('${hytteId}')">Gå hit</button>`);
            });
        })
        .catch(err => console.error('Feil ved henting av hytter:', err));
}