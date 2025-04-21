// Opprett kartet
var map = L.map('map').setView([58.5, 7.5], 8);

// Legg til OpenStreetMap bakgrunn
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// Opprett lag for brannstasjoner og tilfluktsrom
var befolkningstetthetLayer = L.layerGroup();
var brannstasjonerLayer = L.layerGroup();
var tilfluktsromLayer = L.layerGroup();
var legevaktLayer = L.layerGroup();
var sykehusLayer = L.layerGroup();

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


// Initialiser Supabase-klienten
const { createClient } = supabase;

// Supabase URL og API-nøkkel (finnes i Supabase-prosjektet ditt)
const supabaseUrl = 'https://bpttsywlhshivfsyswvz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwdHRzeXdsaHNoaXZmc3lzd3Z6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2MzQzMjQsImV4cCI6MjA2MDIxMDMyNH0.bEJZQOS5bqHmDrO1vNCkX0hirsz7zDp1QsBxdoywxbA';
const HEADERS = { 'apikey': API_KEY, 'Authorization': `Bearer ${API_KEY}` };