
import { fetchGeoJSONPunkter} from './punkter.js'; // Importer én gang

export async function fetchGeoJSONHytter(map, layerGroup) {
    await fetchGeoJSONPunkter(map, layerGroup, 'dnt_hytter_view', '#0074D9');
}