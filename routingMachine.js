let cachedStartAddress = null; // Variabel for å lagre startadressen
let cachedEndAddress = null;   // Variabel for å lagre sluttadressen

export const updateRouteWithUserAddresses = async (map) => {
    // Hvis vi allerede har lagrede adresser, bruk dem
    if (cachedStartAddress && cachedEndAddress) {
        await calculateAndDisplayRoute(map, cachedStartAddress, cachedEndAddress);
        return;
    }

    // Be brukeren om å skrive inn start- og sluttadresser
    const startAddress = prompt('Skriv inn startadresse:', cachedStartAddress || '');
    const endAddress = prompt('Skriv inn sluttadresse:', cachedEndAddress || '');

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