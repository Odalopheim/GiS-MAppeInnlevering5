import { createClient } from 'https://esm.sh/@supabase/supabase-js';
import { fetchGeoJSONRuteInfo } from './ruteinfopunkt.js';
import { fetchGeoJSONHytter } from './dnt_hytter.js';
import { fetchGeoJSONFot, fetchGeoJSONSki, fetchGeoJSONSykkel } from './ruter.js';
import { fetchGeoJSONSkredFaresone } from './skredFaresone.js';
import { fetchGeoJSONKvikkleireFare } from './kvikkleireFare.js';
import { nveBratthetLayer, createBratthetLegend } from './bratthet.js';
import { enableDynamicLoading, addLayerToggleButtons, setupMenuToggle,enableGeolocation, 
    setStartPosition, setEndPosition, calculateDistance, } from './mapFunctions.js';
import { hentNarmesteHytteOgVis } from './hentNarmesteHytte.js';
import { updateRouteWithUserAddresses } from './routingMachine.js';
import { buildRoutingGraph, setupRouting, findNearestNode, dijkstra } from './routing_graf.js';

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

// Håndter klikk for å sette start- og sluttposisjon
let startMarker = null;
let endMarker = null;
let activeMode = null;

const onMapClick = (e) => {
    console.log('Kartet ble klikket. Aktiv modus:', activeMode);
    if (activeMode === 'start') {
        startMarker = setStartPosition(map, startMarker, e.latlng);
        alert('Startpunkt satt!');
        activeMode = null; // Deaktiver modus etter bruk
    } else if (activeMode === 'end') {
        endMarker = setEndPosition(map, endMarker, e.latlng);
        alert('Sluttpunkt satt!');
        activeMode = null; // Deaktiver modus etter bruk
    }
};


// Legg til en knapp for å beregne avstand
const calculateDistanceButton = document.getElementById('calculateDistance');
if (calculateDistanceButton) {
    calculateDistanceButton.addEventListener('click', () => calculateDistance(startMarker, endMarker));
}

// Legg til en knapp for å oppdatere ruten med brukerens adresser
const userInputRouteButton = document.createElement('button');
userInputRouteButton.textContent = 'Legg inn egne adresser';
userInputRouteButton.style.position = 'absolute';
userInputRouteButton.className = 'user-input-route-button';
document.body.appendChild(userInputRouteButton);

userInputRouteButton.addEventListener('click', () => updateRouteWithUserAddresses(map));
userInputRouteButton.addEventListener('click', updateRouteWithUserAddresses);

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

let graphData = null;


async function setupRoutingFromFotRuter() {
    const geojson = await fetchGeoJSONFot(map, null)
    graphData = buildRoutingGraph(geojson); // bygger snap-grafen
    setupRouting(map, graphData);           // aktiverer klikk/ruting
}

setupRoutingFromFotRuter();




const setStartButton = document.createElement('button');
setStartButton.textContent = 'Velg startpunkt';
setStartButton.className = 'set-start-button';
setStartButton.style.position = 'absolute';
setStartButton.style.top = '80px';
setStartButton.style.left = '10px';
document.body.appendChild(setStartButton);
setStartButton.addEventListener('click', () => activeMode = 'start');

const setEndButton = document.createElement('button');
setEndButton.textContent = 'Velg sluttpunkt';
setEndButton.className = 'set-end-button';
setEndButton.style.position = 'absolute';
setEndButton.style.top = '120px';
setEndButton.style.left = '10px';
document.body.appendChild(setEndButton);
setEndButton.addEventListener('click', () => activeMode = 'end');

function tegnRuteFraValgtePunkter() {
    if (!startMarker || !endMarker || !graphData) {
        alert("Startpunkt, sluttpunkt eller grafdata mangler.");
        return;
    }

    const startCoord = [startMarker.getLatLng().lng, startMarker.getLatLng().lat];
    const endCoord = [endMarker.getLatLng().lng, endMarker.getLatLng().lat];

    const startNodeKey = findNearestNode(startCoord, graphData);
    const endNodeKey = findNearestNode(endCoord, graphData);

    if (!startNodeKey || !endNodeKey) {
        alert("Fant ikke nærmeste node.");
        return;
    }

    const pathKeys = dijkstra(graphData, startNodeKey, endNodeKey);
    if (!pathKeys.length) {
        alert("Fant ingen rute.");
        return;
    }

    drawRouteOnMap(map, graphData.nodes, pathKeys);

    const routeCoords = pathKeys.map(key => {
        const [lng, lat] = graphData[key].coord;
        return [lat, lng]; // Leaflet-format
    });

    L.polyline(routeCoords, { color: 'blue' }).addTo(map);
    map.fitBounds(L.polyline(routeCoords).getBounds());
}
const beregnRuteButton = document.createElement('button');
beregnRuteButton.textContent = 'Beregn rute';
beregnRuteButton.className = 'beregn-rute-button';
beregnRuteButton.style.position = 'absolute';
beregnRuteButton.style.top = '160px';
beregnRuteButton.style.left = '10px';
document.body.appendChild(beregnRuteButton);

beregnRuteButton.addEventListener('click', tegnRuteFraValgtePunkter);