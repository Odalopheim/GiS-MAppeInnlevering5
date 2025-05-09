import { fetchGeoJSONFot } from './ruter.js';
import { fetchGeoJSONHytter } from './dnt_hytter.js';
import { haversineDistance } from './utils.js';

export function setupFilterButtons(map, layers) {
    // Opprett knapp for å filtrere fotruter
    const filterFotRuterButton = document.createElement('button');
    filterFotRuterButton.textContent = 'Vis kun ruter nær hytter (1 km)';
    filterFotRuterButton.style.position = 'absolute';
    filterFotRuterButton.style.top = '100px';
    filterFotRuterButton.style.left = '10px';
    filterFotRuterButton.style.zIndex = '1000';
    filterFotRuterButton.style.display = 'none'; // Skjul knappen til den aktiveres
    document.body.appendChild(filterFotRuterButton);

    let hytterGeoJSON = null;
    const loadHytterData = async () => {
        try {
            hytterGeoJSON = await fetchGeoJSONHytter(map, layers.hytter.layer);
            if (!hytterGeoJSON || !hytterGeoJSON.features) {
                console.warn('Ingen hytter-data tilgjengelig.');
                return;
            }
            console.log('Hytter-data lastet inn:', hytterGeoJSON);
        } catch (error) {
            console.error('Feil under lasting av hytter-data:', error);
        }
    };

    // Last inn hytter-data
    loadHytterData();

    // Legg til event listener for filter-knappen
       filterFotRuterButton.addEventListener('click', async () => {
        try {
            if (!hytterGeoJSON || !hytterGeoJSON.features) {
                console.error('Hytter-data er ikke tilgjengelig.');
                return;
            }
    
            // Hent fotruter fra fetchGeoJSONFot
            const filteredFotRuter = await fetchGeoJSONFot(map, layers.fotRuter.layer);
            console.log('Fotruter hentet:', filteredFotRuter);
    
            if (!filteredFotRuter || !filteredFotRuter.features || filteredFotRuter.features.length === 0) {
                console.error('Ingen gyldige fotruter funnet.');
                return;
            }
    
            // Filtrer fotruter basert på avstand til hytter
            const filteredFeatures = filteredFotRuter.features.filter((fotRute) => {
                // Sjekk om fotRute har gyldig geometri
                if (!fotRute.geometry || !fotRute.geometry.coordinates) {
                    console.warn('FotRute mangler gyldig geometri:', fotRute);
                    return false;
                }
    
                const fotRuteCoords = fotRute.geometry.coordinates;
    
                // Sjekk om noen av hyttene er innenfor 1 km fra fotruten
                return hytterGeoJSON.features.some((hytte) => {
                    // Sjekk om hytte har gyldig geometri
                    if (!hytte.geometry || !hytte.geometry.coordinates) {
                        console.warn('Hytte mangler gyldig geometri:', hytte);
                        return false;
                    }
    
                    const hytteCoords = hytte.geometry.coordinates;
    
                    // Beregn avstanden mellom fotrute og hytte
                    return fotRuteCoords.some(([x, y]) => {
                        const distance = haversineDistance([y, x], [hytteCoords[1], hytteCoords[0]]);
                        return distance <= 1; // 1 km radius
                    });
                });
            });
    
            console.log('Filtrerte fotruter:', filteredFeatures);
    
            // Oppdater kartet med filtrerte fotruter
            const filteredGeoJSON = {
                type: 'FeatureCollection',
                features: filteredFeatures
            };
    
            layers.fotRuter.layer.clearLayers();
            L.geoJSON(filteredGeoJSON, {
                style: {
                    color: '#FF0000', // Rød farge for filtrerte ruter
                    weight: 3,
                    opacity: 0.7
                },
                onEachFeature: (feature, layer) => {
                    if (feature.properties.navn) {
                        layer.bindPopup(`<b>${feature.properties.navn}</b>`);
                    }
                }
            }).addTo(layers.fotRuter.layer);
    
        } catch (error) {
            console.error('Feil under filtrering av fotruter:', error);
        }
    });

    // Legg til event listener for "Vis Fotruter"-knappen
    const showFotRuterButton = document.getElementById('showFotRuter');
    if (showFotRuterButton) {
        showFotRuterButton.addEventListener('click', async () => {
            try {
                await fetchGeoJSONFot(map, layers.fotRuter.layer);
                if (hytterGeoJSON && hytterGeoJSON.features) {
                    filterFotRuterButton.style.display = 'block'; // Vis filter-knappen
                } else {
                    console.warn('Hytter-data er ikke tilgjengelig ennå.');
                }
            } catch (error) {
                console.error('Feil under lasting av fotruter:', error);
            }
        });
    }
}