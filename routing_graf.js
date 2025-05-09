import { supabase } from './supabase.js';
import * as turf from 'https://cdn.skypack.dev/@turf/turf';


// Hent og vis GeoJSON-data fra Supabase
export async function fetchGeoJSONRuter(map, layerGroup, tableName, color = "#0074D9") {
    const bounds = map.getBounds();
    const boundsJson = {
        west: bounds.getWest(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        north: bounds.getNorth()
    };

    const { data, error } = await supabase
        .rpc('get_routes_in_bounds', { bounds: boundsJson, view_name: tableName });

    if (error) {
        console.error(`Feil ved henting av data fra ${tableName}:`, error);
        return null;
    }

    if (!data || data.length === 0) {
        console.warn(`Ingen data funnet i ${tableName}.`);
        return null;
    }

    const geojson = {
        type: 'FeatureCollection',
        features: data.map(item => ({
            type: 'Feature',
            geometry: item.geom,
            properties: {
                id: item.id,
                navn: item.navn || 'Ukjent'
            }
        }))
    };

    if (layerGroup) {
        layerGroup.clearLayers();
    }

    const geojsonLayer = L.geoJSON(geojson, {
        style: {
            color: color,
            weight: 3,
            opacity: 0.7
        },
        onEachFeature: (feature, layer) => {
            if (feature.properties.navn) {
                layer.bindPopup(`<b>${feature.properties.navn}</b>`);
            }
        }
    });

    if (layerGroup) {
        geojsonLayer.addTo(layerGroup);
    }

    return geojson;
}

// Fotruter
export async function fetchGeoJSONFot(map, layerGroup) {
    const geojson = await fetchGeoJSONRuter(map, layerGroup, 'fotruter_geojson_view', '#0074D9');
    if (!geojson || !geojson.features) {
        console.error('GeoJSON is invalid:', geojson);
        return null;
    }
    return geojson;
}

// Bygg graf fra GeoJSON
export function buildRoutingGraph(geojson) {
    if (!geojson || !geojson.features) {
        console.error('GeoJSON er ugyldig:', geojson);
        return;
    }

    const nodes = [];
    const nodeMap = {};
    let nextId = 0;
    const tolerance = 0.2; // 200 meter

    const getOrCreateNodeId = (pt) => {
        const key = pt.join(',');
        for (const existingKey in nodeMap) {
            const existingPt = existingKey.split(',').map(Number);
            if (turf.distance(turf.point(pt), turf.point(existingPt), { units: 'kilometers' }) < tolerance) {
                return nodeMap[existingKey];
            }
        }
        nodeMap[key] = nextId;
        nodes.push(pt);
        return nextId++;
    };

    const graph = {};

    geojson.features.forEach(feat => {
        if (feat.geometry.type !== 'LineString') return;

        const coords = feat.geometry.coordinates;
        const start = coords[0];
        const end = coords[coords.length - 1];

        const idStart = getOrCreateNodeId(start);
        const idEnd = getOrCreateNodeId(end);

        const dist = turf.length(feat, { units: 'kilometers' });

        graph[idStart] = graph[idStart] || [];
        graph[idEnd] = graph[idEnd] || [];

        graph[idStart].push({ node: idEnd, weight: dist, coords });
        graph[idEnd].push({ node: idStart, weight: dist, coords: coords.slice().reverse() });
    });

    console.log('Bygget graf:', graph);
    return { graph, nodes };
}

// Finn nærmeste node
export function findNearestNode(pt, nodes) {
    let minDistance = Infinity;
    let nearestNode = null;
    nodes.forEach((node, index) => {
        const distance = turf.distance(turf.point(pt), turf.point(node), { units: 'kilometers' });
        if (distance < minDistance) {
            minDistance = distance;
            nearestNode = index;
        }
    });
    return nearestNode;
}

// Dijkstra-algoritme
export function dijkstra(graph, startNode, endNode) {
    const distances = {};
    const previous = {};
    const visited = new Set();
    const queue = new Set(Object.keys(graph).map(Number));

    Object.keys(graph).forEach(node => {
        distances[node] = Infinity;
    });
    distances[startNode] = 0;

    while (queue.size > 0) {
        const current = [...queue].reduce((minNode, node) =>
            distances[node] < distances[minNode] ? node : minNode
        , [...queue][0]);

        if (current == endNode) break;

        queue.delete(Number(current));
        visited.add(Number(current));

        for (const neighbor of graph[current]) {
            if (visited.has(neighbor.node)) continue;

            const alt = distances[current] + neighbor.weight;
            if (alt < distances[neighbor.node]) {
                distances[neighbor.node] = alt;
                previous[neighbor.node] = Number(current);
            }
        }
    }

    const path = [];
    let current = endNode;
    while (current !== undefined) {
        path.unshift(current);
        current = previous[current];
    }

    return path;
}

// Sjekk om to noder er koblet
export function areNodesConnected(graph, start, end) {
    const visited = new Set();
    const stack = [start];

    while (stack.length > 0) {
        const current = stack.pop();
        if (current === end) return true;
        visited.add(current);
        for (const neighbor of graph[current] || []) {
            if (!visited.has(neighbor.node)) {
                stack.push(neighbor.node);
            }
        }
    }
    return false;
}

// Tegn rute på kartet
export function drawRouteOnMap(map, graphNodes, path) {
    const latlngs = path.map(nodeIndex => graphNodes[nodeIndex]);
    L.polyline(latlngs, { color: 'blue', weight: 5 }).addTo(map);
}

// Visualiser grafen (valgfritt for feilsøking)
export function visualizeGraph(map, graph, nodes) {
    Object.entries(graph).forEach(([nodeId, edges]) => {
        const pt = nodes[nodeId];
        L.circleMarker([pt[1], pt[0]], { radius: 3, color: 'gray' }).addTo(map);
        edges.forEach(edge => {
            const to = nodes[edge.node];
            L.polyline([[pt[1], pt[0]], [to[1], to[0]]], { color: 'lightgray', weight: 1 }).addTo(map);
        });
    });
}

// Interaktiv rutevalg
export function setupRouting(map, { graph, nodes }) {
    let startNode = null;
    let endNode = null;

    // Klikk for å velge start og slutt
    map.on('click', (e) => {
        const pt = [e.latlng.lng, e.latlng.lat];
        const nearestNode = findNearestNode(pt, nodes);
        const distance = turf.distance(turf.point(pt), turf.point(nodes[nearestNode]), { units: 'kilometers' });

        // Vis popup med info
        L.popup()
            .setLatLng([pt[1], pt[0]])
            .setContent(`Nærmeste node: ${nearestNode}<br>Avstand: ${distance.toFixed(2)} km`)
            .openOn(map);

        if (startNode === null) {
            startNode = nearestNode;
            console.log('Start Node satt til:', startNode);

            map.getContainer().style.cursor = 'crosshair';

            L.circleMarker([nodes[nearestNode][1], nodes[nearestNode][0]], {
                color: 'blue',
                radius: 8
            }).addTo(map).bindPopup('Start').openPopup();
        } else if (endNode === null) {
            endNode = nearestNode;
            console.log('End Node satt til:', endNode);

            map.getContainer().style.cursor = '';

            L.circleMarker([nodes[nearestNode][1], nodes[nearestNode][0]], {
                color: 'red',
                radius: 8
            }).addTo(map).bindPopup('End').openPopup();

            if (!areNodesConnected(graph, startNode, endNode)) {
                console.warn(`Node ${startNode} og ${endNode} er ikke koblet i grafen.`);
                alert('Ingen forbindelse mellom valgt start og sluttpunkt.');
                return;
            }

            const path = dijkstra(graph, startNode, endNode);
            console.log('Path:', path);

            if (path.length < 2) {
                console.error('Ingen sti funnet!');
                alert('Ingen sti funnet mellom punktene.');
                return;
            }

            const routeCoords = [];
            for (let i = 0; i < path.length - 1; i++) {
                const edge = graph[path[i]].find(e => e.node === path[i + 1]);
                if (edge) routeCoords.push(...edge.coords);
            }

            L.polyline(routeCoords.map(c => [c[1], c[0]]), { color: 'blue' }).addTo(map);

            startNode = null;
            endNode = null;
        }
    });

    // Høyreklikk for å nullstille
    map.on('contextmenu', () => {
        startNode = null;
        endNode = null;
        map.getContainer().style.cursor = '';
        map.eachLayer(layer => {
            if (layer instanceof L.CircleMarker || layer instanceof L.Polyline) {
                map.removeLayer(layer);
            }
        });
        console.log('Rutevalg nullstilt');
    });
}
z