
import { fetchGeoJSONPunkter} from './punkter.js'; // Importer én gang

export async function fetchGeoJSONRuteInfo(map, layerGroup) {
    await fetchGeoJSONPunkter(map, layerGroup, 'ruteinfopunkt_geojson_view', '#FF5733');
}