# **God Tur**

## Problemstilling og Introduksjon
Formålet med denne oppgaven er å kartlegge beredsskapsituasjonen i Agder, samt å identifisere geografiske områder med utilstrekkelig dekning for å undersøke mulige tiltak til forbedring.

(endres til vår oppgave) Begrepet beredsskapsituasjoner er slik gruppen definerer det situasjoner som krever akkutt responstid, ledig kapasitet og geografisk tilgjengelig i situasjoner der fare for menneskeliv og helse oppstår. Oppgaven har spesielt fokus på brannstasjoner, tilfluktsrom, legevakt og sykehus, og legge opp til analyserer forholdet mellom befolkningstettheten og disse institusjonene for å identifisere potensielle sårbare områder. På denne måten håper vi å visualisere og analysere disse datasettene med et interaktivt kart, som potensielt gi innsikt i beredskapssituasjonen og mulige forbedringer.  
 
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
      -https://kartkatalog.geonorge.no/metadata/turrutebasen/d1422d17-6d95-4ef1-96ab-8af31744dd63
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



