// Importer Supabase-klienten
import { createClient } from 'https://esm.sh/@supabase/supabase-js';

// Supabase URL og API-nøkkel
const supabaseUrl = 'https://bpttsywlhshivfsyswvz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwdHRzeXdsaHNoaXZmc3lzd3Z6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2MzQzMjQsImV4cCI6MjA2MDIxMDMyNH0.bEJZQOS5bqHmDrO1vNCkX0hirsz7zDp1QsBxdoywxbA';
const supabase = createClient(supabaseUrl, supabaseKey);

// Opprett kartet
var map = L.map('map').setView([58.5, 7-.5], 8);

// Legg til OpenStreetMap bakgrunn
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// Legg til søkefunksjon i kartet
L.Control.geocoder({ defaultMarkGeocode: false }).on('markgeocode', function(e) {
    var bbox = e.geocode.bbox;
    var poly = L.polygon([
        bbox.getSouthEast(),
        bbox.getNorthEast(),
        bbox.getNorthWest(),
        bbox.getSouthWest()
    ]).addTo(map);

    map.fitBounds(poly.getBounds());
}).addTo(map);

// Lag nytt lag for ruteinfopunkter
const ruteinfopunktLayer = L.layerGroup().addTo(map);

// Funksjon for egendefinert markør med farge og popup
function customMarker(feature, latlng, color = "#0074D9") {
  let marker = L.circleMarker(latlng, {
    radius: 6,
    fillColor: color,
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.9
  });

  if (feature.properties.navn) {
    marker.bindPopup(`<b>${feature.properties.navn}</b>`);
  }

  return marker;
}

// Hent og vis ruteinfopunkt
async function fetchGeoJSON() {
  const { data, error } = await supabase
    .from('ruteinfopunkt_geojson_view') // Bruker en view fra supabase som allerede har GeoJSON-formatet
    .select('id, navn, geom'); // geom er allerede i GeoJSON-format

  if (error) {
    console.error('Feil ved henting av data:', error);
    return;
  }

  const geojson = {
    type: 'FeatureCollection',
    features: data.map(item => ({
      type: 'Feature',
      geometry: item.geom, // Direkte bruk av GeoJSON-formatet 
      properties: {
        id: item.id,
        navn: item.navn || 'Ukjent'
      }
    }))
  };

  // Legg til i lag med tilpasset markør
  L.geoJSON(geojson, {
    pointToLayer: (feature, latlng) => customMarker(feature, latlng, "#0074D9") 
  }).addTo(ruteinfopunktLayer);
}

fetchGeoJSON();
