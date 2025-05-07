import { supabase } from './supabase.js';  // Importer Supabase-klienten

export async function hentNarmesteHytteOgVis(lat, lng, map) {
    // Hent den nærmeste hytta ved å bruke en geografisk spørring i Supabase
    const { data, error } = await supabase
        .rpc('get_nearest_hytte', { lat: lat, lng: lng });  

    if (error) {
        console.error('Feil ved henting av hytter fra Supabase:', error);
        return;
    }

    // Hvis vi finner en nærmeste hytte, vis den på kartet
    if (data && data.length > 0) {
        const nærmeste = data[0];  

        const marker = L.marker([nærmeste.lat, nærmeste.lon]).addTo(map);  
        marker.bindPopup(`
            <b>${nærmeste.navn}</b><br>
            Kommune: ${nærmeste.kommune}<br>
            Sengeplasser: ${nærmeste.sengeplasser}<br>
            Betjeningsgrad: ${nærmeste.betjeningsgrad}
        `).openPopup();  

        map.setView([nærmeste.lat, nærmeste.lon], 13);  
    } else {
        alert("Fant ingen hytte i nærheten."); 
    }

    return data;  
}