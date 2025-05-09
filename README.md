# **God Tur**

## Problemstilling og Introduksjon
Formålet med denne oppgaven er å utvikle et interaktivt verktøy som kan bidra til trygg ferdsel i norsk natur.

"God Tur" er en applikasjon som kombinerer informasjon om turruter, skredfaresoner og beredskapstilbud som DNT-hytter og gir brukeren et helhetlig verktøy for trygg turplanlegging. Målet er å bidra til forebygging av ulykker og senke terskelen for å fra ut på tur i nye områder på en trygg måte, uansett erfaring. Løsningen er utviklet med brukervennlighet i fokus og skal fungere som både en digital turplanlegger og som et støtteverktøy for trygg ferdsel.

## Hovedfunksjoner
- Visning av turruter, sykkelruter og skiløyper
- Visning av faresoner for snøskred, kvikkleire og generelle skredsoner
- Visning av DNT-hytter
- Filtrering av turer som leder til hytter (ikke fullstendig fungerende)
- Finne nærmeste DNT-hytte fra nåværende punkt
- Generere veibeskrivelser til valgt adresse
- Beregne avstander i luftlinje mellom valgte punkter
  
 
## Teknologivalg
Vi har valgt følgende teknologier for implementere løsningen: 

- **Backend & Database**: Supabase med PostGIS for lagring og spørringer av geografiske data. Her ble pgAdmin4 bruk som et mellomledd mellom QGIS og Supabase. 
- **API**: Supabase API for å hente og filtrere data.
- **Frontend**: Leaflet for kartvisualisering og interaktivitet.
- **Bearbeiding av data**: QGIS for forbehandling av geodata.

Disse valgene ble tatt fordi Supabase gir en enkel, skalerbar og effektiv løsning for å lagre og hente geografiske data, mens Leaflet gir gode muligheter for visualisering av kartdata på en brukervennlig måte.

## Datasett 
Vi har brukt følgende datasett: 

1. Turutebase
      - https://kartkatalog.geonorge.no/metadata/turrutebasen/d1422d17-6d95-4ef1-96ab-8af31744dd63
2. Skredfare
      - https://kartkatalog.geonorge.no/metadata/skredfaresoner/b2d5aaf8-79ac-40f3-9cd6-fdc30bc42ea1
3. Kvikkleire
      - https://kartkatalog.geonorge.no/metadata/kvikkleire/a29b905c-6aaa-4283-ae2c-d167624c08a8
4. Snøskredfare
      - https://nve.geodataonline.no/arcgis/rest/services/Bratthet/MapServer
5. DNT Hytter
      - Selvlaget datasett med informasion hentet fra DNT sine hjemmesider og Ut.no
6. OpenStreetMap - leaflet
      - https://leafletjs.com/download.html

## **Implementasjon**
### **1. Datainnhenting og lagring**
- Datasettene ble lastet ned og importert i QGIS for filtrering og gjort om til GeoJSON filer.
- Dataene ble deretter lastet opp til Supabase/PostGIS for enkel spørring og visualisering. Dette ble gjort ved bruk av DB manager i QGIS. 

### **2. Backend/API**
- Supabase API ble brukt for å hente data fra databasen. Vi bruker API URL og API Key for å få tilgang til dette i Index.html-filen. 

### **3. Frontend & Visualisering**
- Leaflet ble brukt for å vise kartlag med brannstasjoner, tilfluktsrom, sykehus og befolkningsfordeling.
- Bruker kan interagere med kartet ved å zoome inn og ut, og krysse av og på for å visualisere de ulike elementene. 

## **Bruksanvisning**
### **Lokal kjøring**
1. Klon repoet:  
   ```bash
   git clone https://github.com/Odalopheim/GiS-Gruppe7-.git
   ```
2. Installer avhengigheter:  
   Hvis du bruker VS Code, kan du installere Live Server-utvidelsen og klikke "Go Live".

## Kjøring via GitHub
1. Gå til GitHub Repo (https://github.com/Odalopheim/GiS-MAppeInnlevering5.git).
2. Følg README-instruksjonene for å sette opp løsningen. 

## **Bilder/Video**
Her er noen eksempler på visualiseringene av applikasjonen:



