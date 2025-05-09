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
        const userMarker = L.marker(e.latlng, {
            icon: L.divIcon({
                className: 'user-location-marker',
                html: `<div style="background-color: blue; width: 25px; height: 25px; border-radius: 50%; border: 3px solid white;"></div>`,
                iconSize: [25, 25],
                iconAnchor: [12.5, 12.5]
            })
        }).addTo(map);

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

// Funksjon for å opprette "Beregn avstand"-knappen og håndtere logikken
export const addCalculateDistanceButton = (map, setStartPosition, setEndPosition, calculateDistance) => {
    let canSetPositions = false; // Variabel for å kontrollere om brukeren kan sette posisjoner
    let startMarker = null;
    let endMarker = null;

    // Håndter klikk på kartet for å sette start- og sluttposisjon
    map.on('click', (e) => {
        if (!canSetPositions) {
            alert('Klikk på "Beregn avstand" for å aktivere funksjonen.');
            return;
        }

        const action = prompt('Vil du sette startposisjon eller sluttposisjon? (skriv "start" eller "slutt")');
        if (action === 'start') {
            startMarker = setStartPosition(map, startMarker, e.latlng);
        } else if (action === 'slutt') {
            endMarker = setEndPosition(map, endMarker, e.latlng);
        }

        // Beregn avstanden automatisk når begge posisjonene er satt
        if (startMarker && endMarker) {
            calculateDistance(startMarker, endMarker);
            canSetPositions = false; // Deaktiver funksjonaliteten etter beregning
        }
    });
    // Opprett knappen for "Beregn avstand"
    const calculateDistanceButton = document.createElement('button');
    calculateDistanceButton.textContent = 'Beregn avstand';
    calculateDistanceButton.className = 'calculate-distance-button button-style';
    document.body.appendChild(calculateDistanceButton);

    // Legg til funksjonalitet for knappen
    calculateDistanceButton.addEventListener('click', () => {
        canSetPositions = true; // Aktiver funksjonaliteten
        alert('Du kan nå klikke på kartet for å sette start- og sluttposisjon.');
    });
};


// Funksjon for å opprette "Legg inn egne adresser"-knappen
export const addUserInputRouteButton = (map, updateRouteWithUserAddresses) => {
    const userInputRouteButton = document.createElement('button');
    userInputRouteButton.textContent = 'Legg inn egne adresser';
    userInputRouteButton.className = 'user-input-route-button button-style';
    document.body.appendChild(userInputRouteButton);

    userInputRouteButton.addEventListener('click', () => updateRouteWithUserAddresses(map));
};

