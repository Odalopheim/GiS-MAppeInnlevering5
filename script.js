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