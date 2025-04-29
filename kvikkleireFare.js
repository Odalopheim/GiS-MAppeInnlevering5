import { fetchGeoJSONPolygon } from './polygon.js'; 

export async function fetchGeoJSONKvikkleireFare(map, layerGroup) {
    await fetchGeoJSONPolygon(map, layerGroup, 'kvikkleirefare_geojson_view', '#FF4136'); 
}