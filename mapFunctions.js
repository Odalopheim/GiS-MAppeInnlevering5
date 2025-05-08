import { createBratthetLegend } from './bratthet.js';
// Dynamisk lasting ved flytting eller zooming
export const enableDynamicLoading = (map, layers) => {
    map.on('moveend', async () => {
        Object.keys(layers).forEach(async (id) => {
            const layerConfig = layers[id];
            if (layerConfig.visible && layerConfig.fetchFunction) {
                await layerConfig.fetchFunction(map, layerConfig.layer);
            }
        });
    });
};

// Funksjon for å kapitalisere første bokstav i en streng
export const capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);
let bratthetLegend = null; // Legend må leve utenfor funksjonen for å kunne fjernes senere

export const addLayerToggleButtons = (map, layers) => {
    Object.keys(layers).forEach((id) => {
        const button = document.getElementById(`show${capitalizeFirstLetter(id)}`);
        if (button) {
            button.addEventListener('click', () => {
                const layerConfig = layers[id];
                const isBratthet = id === 'nveBratthet';

                if (layerConfig.visible) {
                    map.removeLayer(layerConfig.layer);
                    layerConfig.visible = false;
                    button.textContent = button.textContent.replace(/^Fjern/, 'Vis');

                    if (isBratthet && bratthetLegend) {
                        map.removeControl(bratthetLegend);
                        bratthetLegend = null;
                    }
                } else {
                    map.addLayer(layerConfig.layer);
                    if (layerConfig.fetchFunction) {
                        layerConfig.fetchFunction(map, layerConfig.layer);
                    }
                    layerConfig.visible = true;
                    button.textContent = button.textContent.replace(/^Vis/, 'Fjern');

                    if (isBratthet && !bratthetLegend) {
                        bratthetLegend = createBratthetLegend();
                        bratthetLegend.addTo(map);
                    }
                }
            });
        } else {
            console.warn(`Knappen med ID show${capitalizeFirstLetter(id)} finnes ikke.`);
        }
    });
};

// meny toggle
export const setupMenuToggle = () => {
    const toggleMenuButton = document.getElementById('toggleMenu');
    const menuContent = document.getElementById('menuContent');

    toggleMenuButton.addEventListener('click', () => {
        if (menuContent.style.display === 'none' || menuContent.style.display === '') {
            menuContent.style.display = 'block';
        } else {
            menuContent.style.display = 'none';
        }
    });
};

// Geolokalisering
export const enableGeolocation = (map) => {
    map.locate({ setView: true, maxZoom: 16 });

    map.on('locationfound', (e) => {
        const userMarker = L.marker(e.latlng).addTo(map);
        userMarker.bindPopup("Du er her!").openPopup();
        map.setView(e.latlng, 16);
    });

    map.on('locationerror', (e) => {
        alert("Kunne ikke finne din posisjon: " + e.message);
    });
};

// Funksjon for å legge til en markør
export const addMarker = (map, latlng, label, color) => {
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
export const setStartPosition = (map, startMarker, latlng) => {
    if (startMarker) {
        map.removeLayer(startMarker);
    }
    return addMarker(map, latlng, 'Startposisjon', 'green');
};

// Funksjon for å sette sluttposisjon
export const setEndPosition = (map, endMarker, latlng) => {
    if (endMarker) {
        map.removeLayer(endMarker);
    }
    return addMarker(map, latlng, 'Sluttposisjon', 'red');
};

// Funksjon for å beregne avstand mellom start og slutt
export const calculateDistance = (startMarker, endMarker) => {
    if (startMarker && endMarker) {
        const startLatLng = startMarker.getLatLng();
        const endLatLng = endMarker.getLatLng();
        const distance = startLatLng.distanceTo(endLatLng); // Avstand i meter
        alert(`Avstanden mellom start og slutt er ${(distance / 1000).toFixed(2)} km.`);
    } else {
        alert('Både start- og sluttposisjon må være satt.');
    }
};

let cachedStartAddress = null; // Variabel for å lagre startadressen
let cachedEndAddress = null;   // Variabel for å lagre sluttadressen

export const updateRouteWithUserAddresses = async (map) => {
    // Hvis vi allerede har lagret adresser, bruk dem
    if (cachedStartAddress && cachedEndAddress) {
        await calculateAndDisplayRoute(map, cachedStartAddress, cachedEndAddress);
        return;
    }

    // Be brukeren om å skrive inn start- og sluttadresser
    const startAddress = prompt('Skriv inn startadresse:');
    const endAddress = prompt('Skriv inn sluttadresse:');

    if (!startAddress || !endAddress) {
        alert('Du må skrive inn både start- og sluttadresser.');
        return;
    }

    // Lagre adressene i variablene
    cachedStartAddress = startAddress;
    cachedEndAddress = endAddress;

    // Beregn og vis ruten
    await calculateAndDisplayRoute(map, startAddress, endAddress);
};

// Funksjon for å beregne og vise ruten
const calculateAndDisplayRoute = async (map, startAddress, endAddress) => {
    try {
        // Geokoding for startadresse
        const startResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(startAddress)}`);
        const startData = await startResponse.json();

        if (startData.length === 0) {
            alert('Fant ikke startadressen. Sjekk at den er riktig.');
            return;
        }

        const startLat = parseFloat(startData[0].lat);
        const startLng = parseFloat(startData[0].lon);

        // Geokoding for sluttadresse
        const endResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endAddress)}`);
        const endData = await endResponse.json();

        if (endData.length === 0) {
            alert('Fant ikke sluttadressen. Sjekk at den er riktig.');
            return;
        }

        const endLat = parseFloat(endData[0].lat);
        const endLng = parseFloat(endData[0].lon);

        // Legg til ruten på kartet
        L.Routing.control({
            waypoints: [
                L.latLng(startLat, startLng),
                L.latLng(endLat, endLng)
            ],
            routeWhileDragging: true,
            geocoder: L.Control.Geocoder.nominatim()
        }).addTo(map);

        // Legg til markører for start- og sluttpunktene
        const startMarker = L.marker([startLat, startLng]).addTo(map);
        startMarker.bindPopup(`Startpunkt: ${startAddress}`).openPopup();

        const endMarker = L.marker([endLat, endLng]).addTo(map);
        endMarker.bindPopup(`Sluttpunkt: ${endAddress}`).openPopup();
    } catch (error) {
        console.error('Feil under geokoding:', error);
        alert('Det oppsto en feil under geokoding. Prøv igjen senere.');
    }
};
