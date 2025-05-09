import { createClient } from 'https://esm.sh/@supabase/supabase-js';
import { fetchGeoJSONRuteInfo } from './ruteinfopunkt.js';
import { fetchGeoJSONHytter } from './dnt_hytter.js';
import { fetchGeoJSONFot, fetchGeoJSONSki, fetchGeoJSONSykkel } from './ruter.js';
import { fetchGeoJSONSkredFaresone } from './skredFaresone.js';
import { fetchGeoJSONKvikkleireFare } from './kvikkleireFare.js';
import { nveBratthetLayer, createBratthetLegend } from './bratthet.js';
import { enableDynamicLoading, addLayerToggleButtons, setupMenuToggle,enableGeolocation, 
    setStartPosition, setEndPosition, calculateDistance, addCalculateDistanceButton, addUserInputRouteButton } from './mapFunctions.js';
import { hentNarmesteHytteOgVis } from './hentNarmesteHytte.js';
import { updateRouteWithUserAddresses } from './routingMachine.js';

// Supabase URL og API-nøkkel
const supabaseUrl = 'https://bpttsywlhshivfsyswvz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwdHRzeXdsaHNoaXZmc3lzd3Z6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2MzQzMjQsImV4cCI6MjA2MDIxMDMyNH0.bEJZQOS5bqHmDrO1vNCkX0hirsz7zDp1QsBxdoywxbA';
export const supabase = createClient(supabaseUrl, supabaseKey);

// Opprett kartet
const map = L.map('map').setView([58.5, 7.5], 8);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// Felles funksjon for å opprette lag
const createLayer = () => L.layerGroup();

// Definer lagene
const layers = {
    routeInfo: { layer: createLayer(), visible: false, fetchFunction: fetchGeoJSONRuteInfo },
    hytter: { layer: createLayer(), visible: false, fetchFunction: fetchGeoJSONHytter },
    fotRuter: { layer: createLayer(), visible: false, fetchFunction: fetchGeoJSONFot },
    skiloyper: { layer: createLayer(), visible: false, fetchFunction: fetchGeoJSONSki },
    sykkelruter: { layer: createLayer(), visible: false, fetchFunction: fetchGeoJSONSykkel },
    skredFaresone: { layer: createLayer(), visible: false, fetchFunction: fetchGeoJSONSkredFaresone },
    kvikkleireFare: { layer: createLayer(), visible: false, fetchFunction: fetchGeoJSONKvikkleireFare },
    nveBratthet: nveBratthetLayer
};

// Legg til bratthetslegenden
const bratthetLegend = createBratthetLegend(map);

// Aktiver dynamisk lasting av lag
enableDynamicLoading(map, layers);

// Legg til knapper for å vise/skjule lag
addLayerToggleButtons(map, layers);

// Aktiver menyknappen
setupMenuToggle();

// Aktiver geolokalisering
enableGeolocation(map);

// Legg til "Beregn avstand"-knappen
addCalculateDistanceButton(map, setStartPosition, setEndPosition, calculateDistance);

// Legg til "Legg inn egne adresser"-knappen
addUserInputRouteButton(map, updateRouteWithUserAddresses);

let søkerEtterHytte = false;

const finnHytteButton = document.getElementById('hentNarmesteHytte');
if (finnHytteButton) {
    finnHytteButton.addEventListener('click', () => {
        søkerEtterHytte = true;
        map.locate({ setView: true, maxZoom: 14 });
    });
}

map.on('locationfound', async (e) => {
    if (!søkerEtterHytte) return;
    søkerEtterHytte = false;

    await hentNarmesteHytteOgVis(e.latlng.lat, e.latlng.lng, map);
});
