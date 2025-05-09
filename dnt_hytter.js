import { fetchGeoJSONPunkter } from './punkter.js';

export async function fetchGeoJSONHytter(map, layerGroup) {
    const geojson = await fetchGeoJSONPunkter(map, layerGroup, 'dnt_hytter_view', '#0074D9');
    if (!geojson) {
        console.warn('Ingen hytter funnet.');
        return null; // Returner null hvis ingen data finnes
    }
    return geojson; // Returner geojson-objektet
}