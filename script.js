import { createClient } from 'https://esm.sh/@supabase/supabase-js';
import { fetchGeoJSON } from './ruteinfopunkt.js';
import { fetchGeoJSONAnnen } from './annenrute.js';
import { fetchGeoJSONHytter } from './dnt_hytter.js';


// Supabase URL og API-nøkkel
const supabaseUrl = 'https://bpttsywlhshivfsyswvz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwdHRzeXdsaHNoaXZmc3lzd3Z6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2MzQzMjQsImV4cCI6MjA2MDIxMDMyNH0.bEJZQOS5bqHmDrO1vNCkX0hirsz7zDp1QsBxdoywxbA';
export const supabase = createClient(supabaseUrl, supabaseKey);

// Opprett kartet
var map = L.map('map').setView([58.5, 7.5], 8);

// Legg til OpenStreetMap bakgrunn
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// Lag nytt lag for ruteinfopunkter og linjer
const ruteinfopunktLayer = L.layerGroup();
const ruterLayer = L.layerGroup();
const hytterLayer = L.layerGroup();
 

// Hent knapper fra HTML
const showRouteInfoButton = document.getElementById('showRouteInfo');
const showRouteButton = document.getElementById('showRoute');
const showHytterButton = document.getElementById('showHytter');


// Variabler for synlighetsstatus
let isRouteInfoVisible = false;
let isRouteVisible = false;
let isHytterVisible = true;

// Legg til klikkhendelse for å vise/skjule ruteinformasjon
showRouteInfoButton.addEventListener('click', async () => {
    if (isRouteInfoVisible) {
        map.removeLayer(ruteinfopunktLayer);
        showRouteInfoButton.textContent = 'Vis Ruteinformasjon';
        isRouteInfoVisible = false;
    } else {
        showRouteInfoButton.textContent = 'Laster...';
        await fetchGeoJSON(map, ruteinfopunktLayer);
        ruteinfopunktLayer.addTo(map);
        showRouteInfoButton.textContent = 'Skjul Ruteinformasjon';
        isRouteInfoVisible = true;
    }
});

// Legg til klikkhendelse for å vise/skjule hytter
showHytterButton.addEventListener('click', async () => {
    if (isHytterVisible) {
        map.removeLayer(hytterLayer);
        showHytterButton.textContent = 'Vis Hytter';
        isHytterVisible = false;
    } else {
        showHytterButton.textContent = 'Laster...';
        await fetchGeoJSON(map, hytterLayer);
        hytterLayer.addTo(map);
        showHytterButton.textContent = 'Skjul Hytter';
        isHytterVisible = true;
    }
});
// Legg til klikkhendelse for å vise/skjule ruter
showRouteButton.addEventListener('click', async () => {
    if (isRouteVisible) {
        map.removeLayer(ruterLayer);
        showRouteButton.textContent = 'Vis Ruter';
        isRouteVisible = false;
    } else {
        showRouteButton.textContent = 'Laster...';
        await fetchGeoJSONAnnen(map, ruterLayer);
        ruterLayer.addTo(map);
        showRouteButton.textContent = 'Skjul Ruter';
        isRouteVisible = true;
    }
});
