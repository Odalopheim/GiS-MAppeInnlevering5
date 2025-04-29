import { createClient } from 'https://esm.sh/@supabase/supabase-js';
import { fetchGeoJSONRuteInfo } from './ruteinfopunkt.js';
import { fetchGeoJSONHytter } from './dnt_hytter.js';
import { fetchGeoJSONFot } from './ruter.js';
import { fetchGeoJSONSki } from './ruter.js';
import { fetchGeoJSONSykkel } from './ruter.js';
import { fetchGeoJSONAnnen } from './ruter.js';




// Supabase URL og API-nøkkel
const supabaseUrl = 'https://bpttsywlhshivfsyswvz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwdHRzeXdsaHNoaXZmc3lzd3Z6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2MzQzMjQsImV4cCI6MjA2MDIxMDMyNH0.bEJZQOS5bqHmDrO1vNCkX0hirsz7zDp1QsBxdoywxbA';
export const supabase = createClient(supabaseUrl, supabaseKey);

// Opprett kartet
const map = L.map('map').setView([58.5, 7.5], 8);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// Felles funksjon for å opprette lag
const createLayer = () => L.layerGroup();

// Konfigurer lagene og visningsstatus
const layers = {
    routeInfo: { layer: createLayer(), visible: false, fetchFunction: fetchGeoJSONRuteInfo },
    route: { layer: createLayer(), visible: false, fetchFunction: fetchGeoJSONAnnen },
    hytter: { layer: createLayer(), visible: false, fetchFunction: fetchGeoJSONHytter },
    fotRuter: { layer: createLayer(), visible: false, fetchFunction: fetchGeoJSONFot },
    skiloyper: { layer: createLayer(), visible: false, fetchFunction: fetchGeoJSONSki },
    sykkelruter: { layer: createLayer(), visible: false, fetchFunction: fetchGeoJSONSykkel }
};

// Felles funksjon for klikkhendelser
const toggleLayer = async (id) => {
    const layerConfig = layers[id];
    if (!layerConfig) return;

    const { layer, visible, fetchFunction } = layerConfig;
    const button = document.getElementById(`show${capitalizeFirstLetter(id)}`);

    if (visible) {
        map.removeLayer(layer);
        button.textContent = `Vis ${capitalizeFirstLetter(id)}`;
        layerConfig.visible = false;
    } else {
        button.textContent = 'Laster...';
        await fetchFunction(map, layer); // Dynamisk hent data
        layer.addTo(map);
        button.textContent = `Skjul ${capitalizeFirstLetter(id)}`;
        layerConfig.visible = true;
    }
};

// Funksjon for å kapitalisere første bokstav i en streng
const capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1); 

// Legg til hendelser for alle knapper
['routeInfo', 'route', 'hytter', 'fotRuter', 'skiloyper', 'sykkelruter'].forEach((id) => {
    const button = document.getElementById(`show${capitalizeFirstLetter(id)}`);
    button.addEventListener('click', () => toggleLayer(id));
});


// Dynamisk lasting ved flytting eller zooming
map.on('moveend', async () => {
    Object.keys(layers).forEach(async (id) => {
        if (layers[id].visible) {
            await layers[id].fetchFunction(map, layers[id].layer); // Dynamisk datahenting
        }
    });
});

const toggleMenuButton = document.getElementById('toggleMenu');
const menuContent = document.getElementById('menuContent');

toggleMenuButton.addEventListener('click', () => {
    if (menuContent.style.display === 'none' || menuContent.style.display === '') {
        menuContent.style.display = 'block'; // Vis menyen
    } else {
        menuContent.style.display = 'none'; // Skjul menyen
    }
});

// Legg til geolokalisering for å finne brukerens posisjon
map.locate({ setView: true, maxZoom: 16 });

// Håndtering av når brukerens posisjon er funnet
map.on('locationfound', (e) => {
    // Opprett markør for brukerens posisjon
    const userMarker = L.marker(e.latlng).addTo(map);
    userMarker.bindPopup("Du er her!").openPopup();

    // Sentere kartet på brukerens posisjon
    map.setView(e.latlng, 16); // Zoomnivå 16 for nærmere visning
});

// Håndtering av feil når posisjonen ikke kan finnes
map.on('locationerror', (e) => {
    alert("Kunne ikke finne din posisjon: " + e.message); // Vise feilmelding hvis posisjon ikke kan bestemmes
});