import { createClient } from 'https://esm.sh/@supabase/supabase-js';
import { fetchGeoJSONRuteInfo } from './ruteinfopunkt.js';
import { fetchGeoJSONHytter } from './dnt_hytter.js';
import { fetchGeoJSONFot, fetchGeoJSONSki, fetchGeoJSONSykkel, fetchGeoJSONAnnen } from './ruter.js';
import { fetchGeoJSONSkredFaresone } from './skredFaresone.js';
import { fetchGeoJSONKvikkleireFare } from './kvikkleireFare.js'; // Importer én gang

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
    sykkelruter: { layer: createLayer(), visible: false, fetchFunction: fetchGeoJSONSykkel },
    skredFaresone: { layer: createLayer(), visible: false, fetchFunction: fetchGeoJSONSkredFaresone },
    kvikkleireFare: { layer: createLayer(), visible: false, fetchFunction: fetchGeoJSONKvikkleireFare },
};

// Felles funksjon for klikkhendelser
const toggleLayer = async (id) => {
    const layerConfig = layers[id];
    if (!layerConfig) {
        console.error(`Lagkonfigurasjon for ${id} mangler.`);
        return;
    }

    const { layer, visible, fetchFunction } = layerConfig;
    const button = document.getElementById(`show${capitalizeFirstLetter(id)}`);

    if (visible) {
        map.removeLayer(layer);
        button.textContent = `Vis ${capitalizeFirstLetter(id)}`;
        layerConfig.visible = false;
    } else {
        button.textContent = 'Laster...';
        await fetchFunction(map, layer); // Henter data dynamisk
        layer.addTo(map);
        button.textContent = `Skjul ${capitalizeFirstLetter(id)}`;
        layerConfig.visible = true;
    }
};

// Funksjon for å kapitalisere første bokstav i en streng
const capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);

// Legg til hendelser for alle knapper
['routeInfo', 'route', 'hytter', 'fotRuter', 'skiloyper', 'sykkelruter', 'skredFaresone', 'kvikkleireFare'].forEach((id) => {
    const button = document.getElementById(`show${capitalizeFirstLetter(id)}`);
    if (button) {
        button.addEventListener('click', () => toggleLayer(id));
    } else {
        console.warn(`Knappen med ID show${capitalizeFirstLetter(id)} finnes ikke.`);
    }
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
    const userMarker = L.marker(e.latlng).addTo(map);
    userMarker.bindPopup("Du er her!").openPopup();
    map.setView(e.latlng, 16);
});

// Håndtering av feil når posisjonen ikke kan finnes
map.on('locationerror', (e) => {
    alert("Kunne ikke finne din posisjon: " + e.message);

});

let startMarker = null;
let endMarker = null;

// Funksjon for å legge til en markør
const addMarker = (latlng, label, color) => {
    return L.marker(latlng, {
        icon: L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%;"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        })
    }).bindPopup(label).addTo(map);
};

// Funksjon for å sette startposisjon
const setStartPosition = (latlng) => {
    if (startMarker) {
        map.removeLayer(startMarker);
    }
    startMarker = addMarker(latlng, 'Startposisjon', 'green');
};

// Funksjon for å sette sluttposisjon
const setEndPosition = (latlng) => {
    if (endMarker) {
        map.removeLayer(endMarker);
    }
    endMarker = addMarker(latlng, 'Sluttposisjon', 'red');
};

// Funksjon for å beregne avstand mellom start og slutt
const calculateDistance = () => {
    if (startMarker && endMarker) {
        const startLatLng = startMarker.getLatLng();
        const endLatLng = endMarker.getLatLng();
        const distance = startLatLng.distanceTo(endLatLng); // Avstand i meter
        alert(`Avstanden mellom start og slutt er ${(distance / 1000).toFixed(2)} km.`);
    } else {
        alert('Både start- og sluttposisjon må være satt.');
    }
};

// Legg til knapper for å sette start- og sluttposisjon
map.on('click', (e) => {
    const { lat, lng } = e.latlng;
    const action = prompt('Vil du sette startposisjon eller sluttposisjon? (skriv "start" eller "slutt")');
    if (action === 'start') {
        setStartPosition(e.latlng);
    } else if (action === 'slutt') {
        setEndPosition(e.latlng);
    }
});

// Legg til en knapp for å beregne avstand
const calculateDistanceButton = document.getElementById('calculateDistance');
if (calculateDistanceButton) {
    calculateDistanceButton.addEventListener('click', calculateDistance);
} else {
    console.warn('Knappen med ID "calculateDistance" finnes ikke.');
}


// Hent brukerens posisjon og sett den som startpunkt for routing
map.locate({ setView: true, maxZoom: 16 });

// Funksjon for å oppdatere ruten basert på brukerens adresser
const updateRouteWithUserAddresses = async () => {
    // Be brukeren om å skrive inn start- og sluttadresser
    const startAddress = prompt('Skriv inn startadresse:');
    const endAddress = prompt('Skriv inn sluttadresse:');

    if (!startAddress || !endAddress) {
        alert('Du må skrive inn både start- og sluttadresser.');
        return;
    }

    try {
        // Geokoding av startadresse
        const startResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(startAddress)}`);
        const startData = await startResponse.json();

        if (startData.length === 0) {
            alert('Fant ikke startadressen. Sjekk at den er riktig.');
            return;
        }

        const startLat = parseFloat(startData[0].lat);
        const startLng = parseFloat(startData[0].lon);

        // Geokoding av sluttadresse
        const endResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endAddress)}`);
        const endData = await endResponse.json();

        if (endData.length === 0) {
            alert('Fant ikke sluttadressen. Sjekk at den er riktig.');
            return;
        }

        const endLat = parseFloat(endData[0].lat);
        const endLng = parseFloat(endData[0].lon);

        // Opprett routing med de geokodede punktene
        L.Routing.control({
            waypoints: [
                L.latLng(startLat, startLng), // Startpunkt
                L.latLng(endLat, endLng)      // Sluttpunkt
            ],
            routeWhileDragging: true, // Tillat rutejustering ved dragging
            geocoder: L.Control.Geocoder.nominatim() // Bruk geokoding for adresser
        }).addTo(map);

        // Marker start- og sluttpunktene
        const startMarker = L.marker([startLat, startLng]).addTo(map);
        startMarker.bindPopup(`Startpunkt: ${startAddress}`).openPopup();

        const endMarker = L.marker([endLat, endLng]).addTo(map);
        endMarker.bindPopup(`Sluttpunkt: ${endAddress}`).openPopup();
    } catch (error) {
        console.error('Feil under geokoding:', error);
        alert('Det oppsto en feil under geokoding. Prøv igjen senere.');
    }
};

// Legg til en knapp for å oppdatere ruten med brukerens adresser
const userInputRouteButton = document.createElement('button');
userInputRouteButton.textContent = 'Legg inn egne adresser';
userInputRouteButton.style.position = 'absolute';
userInputRouteButton.style.top = '10px';
userInputRouteButton.style.left = '10px';
userInputRouteButton.style.zIndex = '1000';
document.body.appendChild(userInputRouteButton);

userInputRouteButton.addEventListener('click', updateRouteWithUserAddresses);