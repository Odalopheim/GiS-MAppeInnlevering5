import { createClient } from 'https://esm.sh/@supabase/supabase-js';
import { fetchGeoJSON } from './ruteinfopunkt.js';

// Supabase URL og API-nøkkel
const supabaseUrl = 'https://bpttsywlhshivfsyswvz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwdHRzeXdsaHNoaXZmc3lzd3Z6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2MzQzMjQsImV4cCI6MjA2MDIxMDMyNH0.bEJZQOS5bqHmDrO1vNCkX0hirsz7zDp1QsBxdoywxbA';
export const supabase = createClient(supabaseUrl, supabaseKey);

// Opprett kartet
var map = L.map('map').setView([58.5, 7.5], 8);

// Legg til OpenStreetMap bakgrunn
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// Lag nytt lag for ruteinfopunkter
const ruteinfopunktLayer = L.layerGroup();

// Hent knappen fra HTML
const showRouteInfoButton = document.getElementById('showRouteInfo');

// Variabel for å holde styr på om ruteinformasjonen er synlig
let isRouteInfoVisible = false;

// Legg til klikkhendelse for å vise/skjule ruteinformasjon
showRouteInfoButton.addEventListener('click', async () => {
    if (isRouteInfoVisible) {
        // Fjern ruteinformasjonen fra kartet
        map.removeLayer(ruteinfopunktLayer);
        showRouteInfoButton.textContent = 'Vis Ruteinformasjon';
        isRouteInfoVisible = false;
    } else {
        // Hent og vis ruteinformasjonen på kartet
        showRouteInfoButton.textContent = 'Laster...';
        await fetchGeoJSON(map, ruteinfopunktLayer);
        ruteinfopunktLayer.addTo(map);
        showRouteInfoButton.textContent = 'Skjul Ruteinformasjon';
        isRouteInfoVisible = true;
    }
});

const gpxURL = "https://ws.geonorge.no/hoydedata/v1/";
const endpoint = `http://openwps.statkart.no/skwms1/wps.elevation2?request=Execute&service=WPS&version=1.0.0&identifier=elevation&datainputs=lat=60;lon=10;epsg=4326${encodeURIComponent(gpxURL)}`;

fetch(endpoint)
  .then(res => res.json())
  .then(data => console.log("Høgdeprofil:", data));