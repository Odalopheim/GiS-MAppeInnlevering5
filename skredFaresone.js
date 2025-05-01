import { fetchGeoJSONPolygon } from './polygon.js';


export async function fetchGeoJSONSkredFaresone(map, layerGroup) {
    await fetchGeoJSONPolygon(map, layerGroup, 'skredfaresone_geojson_view', '#0074D9'); // Blå farge for skredFaresone
}