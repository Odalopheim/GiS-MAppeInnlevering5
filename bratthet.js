export const nveBratthetLayer = {
    layer: L.tileLayer.wms('https://nve.geodataonline.no/arcgis/services/Bratthet/MapServer/WMSServer', {
        layers: 'Bratthet_snoskred', // Bruk riktig lagnavn
        format: 'image/png',
        transparent: true,
        crs: L.CRS.EPSG25833, // Bruk EPSG:25833 som koordinatsystem
        attribution: 'Kartdata © NVE'
    }),
    visible: false
};

export const createBratthetLegend = () => {
    const legend = L.control({ position: 'bottomleft' });

    legend.onAdd = () => {
        const div = L.DomUtil.create('div', 'legend-snoskred');
        div.innerHTML = `
            <h4>Bratthet Snøskred</h4>
            <div><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAADZJREFUOI1jYaAyYKGlgf+pYB4jugsZKTDsPwMDjb08auCogaMGjhqI00BKykRGdAMpKQvhAABd0QNSDPGCHwAAAABJRU5ErkJggg==" alt="0 - 27" /> 0 - 27<br></div>
            <div><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAADpJREFUOI1jYaAyYKGlgf+pYB4jigvVisk36VYvhKapl0cNHDVw1MBRA7EbCCuCyASM6AYyUmQcFAAA2rQEuh/h3hIAAAAASUVORK5CYII=" alt="27 - 30" /> 27 - 30<br></div>
            <div><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAADhJREFUOI1jYaAyYKGlgf+pYB4jigv/U2AkIyOEpqmXRw0cNXDUwFEDsRsIK4LIBIzoBlJmHBQAAF8jA1XJU6ZXAAAAAElFTkSuQmCC" alt="30 - 35" /> 30 - 35<br></div>
            <div><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAADlJREFUOI1jYaAyYKGlgf+pYB4jigv/r6LApDAITVMvjxo4auCogaMGYjcQVgSRCRjRDWSkyDgoAAB8WwOq40bSBAAAAABJRU5ErkJggg==" alt="35 - 40" /> 35 - 40<br></div>
            <div><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAADlJREFUOI1jYaAyYKGlgf+pYB4jigv/h1Jg0moITVMvjxo4auCogaMGYjcQVgSRCRjRDWSkyDgoAACZkwP/r1UNTQAAAABJRU5ErkJggg==" alt="40 - 45" /> 40 - 45<br></div>
            <div><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAADhJREFUOI1jYaAyYKGlgf+pYB4jiguLKTCpF0rT1MujBo4aOGrgqIHYDezFpYo4wIhuICNl5kEAADwsAuCsIenrAAAAAElFTkSuQmCC" alt="50 - 90" /> 50 - 90<br></div>
        `;
        return div;
    };

    return legend;
};