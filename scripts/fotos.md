# Foto's

Alle foto's in StudieKompas komen van [Wikimedia Commons](https://commons.wikimedia.org) en hebben een vrije licentie
(CC0, publiek domein, CC BY of CC BY-SA). Bij elke foto staat in de app de maker en licentie, met een link naar de bron.

## Opnieuw ophalen of een foto vervangen

```bash
# 1. Zoeken: schrijft per zoekterm een JSON met kandidaten en een contactvel (JPG) om uit te kiezen
python3 scripts/fotos/zoek.py .cache/fotos "Academiegebouw Groningen" "TU Delft Aula"

# 2. Kies in scripts/fotos/keuzes.json per sleutel het zoekresultaat ("bestand") en het nummer van de foto ("nr")

# 3. Downloaden: maakt public/fotos/<sleutel>-800.webp en -1600.webp en werkt src/data/fotos.json bij
#    (keuzes.json moet naast de zoekresultaten staan)
cp scripts/fotos/keuzes.json .cache/fotos/
python3 scripts/fotos/download.py .cache/fotos/keuzes.json public/fotos src/data/fotos
```

Wikimedia beperkt het aantal verzoeken; de scripts wachten zo lang als de server aangeeft (Retry-After).

## Verantwoording

| Sleutel | Maker | Licentie | Bron |
|---|---|---|---|
| `campus` | Wutsje | CC BY-SA 3.0 | [bron](https://commons.wikimedia.org/wiki/File:20090529_Academiegebouw_Groningen_NL.jpg) |
| `stad-groningen` | Aristonico | CC BY-SA 3.0 nl | [bron](https://commons.wikimedia.org/wiki/File:Academiegebouw_in_Broerstraat.jpg) |
| `stad-amsterdam` | Fons Heijnsbroek | CC0 | [bron](https://commons.wikimedia.org/wiki/File:A_photo_of_two_students,_walking_on_the_university_campus_Roeterseiland,_Amsterdam;_high_resolution_image_by_FotoDutch_in_June_2013.jpg) |
| `stad-utrecht` | Victor van Werkhooven | CC BY-SA 3.0 | [bron](https://commons.wikimedia.org/wiki/File:Uithof_Utrecht_2009.jpg) |
| `stad-leiden` | PeteBobb | CC BY-SA 3.0 nl | [bron](https://commons.wikimedia.org/wiki/File:Leiden_-_Rapenburg_met_Academiegebouw_en_Nonnenbrug.jpg) |
| `stad-tilburg` | Clau Suanne2 | Public domain | [bron](https://commons.wikimedia.org/wiki/File:TilburgUniversityCampus_2.jpg) |
| `stad-rotterdam` | Timelezz | CC BY-SA 3.0 | [bron](https://commons.wikimedia.org/wiki/File:Tegelversiering_Karel_Appel_Woudestein.jpg) |
| `stad-delft` | Gerard Dukker | CC BY-SA 4.0 | [bron](https://commons.wikimedia.org/wiki/File:Overzicht_aula_-_Delft_-_20389925_-_RCE.jpg) |
| `stad-enschede` | W.J. Maaskant | CC BY 2.0 nl | [bron](https://commons.wikimedia.org/wiki/File:Universiteit_Twente_Carillon_2005-07-12.jpg) |
| `stad-maastricht` | Romaine | CC0 | [bron](https://commons.wikimedia.org/wiki/File:Maastricht-39e_Diesviering_in_de_St._Janskerk_(Universiteit_Maastricht)_(6).JPG) |
| `stad-wageningen` | Van Gooien | CC BY-SA 4.0 | [bron](https://commons.wikimedia.org/wiki/File:Wageningen_Campus_augustus2017.jpg) |
| `lab` | JohnRH4 | CC BY-SA 2.0 | [bron](https://commons.wikimedia.org/wiki/File:Chemistry_Stockroom_(3965117470).jpg) |
| `techniek` | Navinreddy23 | CC BY-SA 3.0 | [bron](https://commons.wikimedia.org/wiki/File:Students_practicing_Welding_at_Workshop.jpg) |
| `code` | luis gomes | CC0 | [bron](https://commons.wikimedia.org/wiki/File:Pexels-luis-gomes-546819.jpg) |
| `natuur` | USFWSAlaska | Public domain | [bron](https://commons.wikimedia.org/wiki/File:Biologist_monitoring_a_nest_(53708065060).jpg) |
| `economie` | Ank Kumar | CC BY-SA 4.0 | [bron](https://commons.wikimedia.org/wiki/File:Frankfurt_Stock_Exchange_(Ank_Kumar)_02.jpg) |
| `recht` | Kasteelbeer | CC BY-SA 3.0 nl | [bron](https://commons.wikimedia.org/wiki/File:Vredespaleis-voor.jpg) |
| `bibliotheek` | PENG Yanan (Neo-Jay) | CC BY-SA 3.0 | [bron](https://commons.wikimedia.org/wiki/File:Yale_Law_School_Library_Reading_Room_(L3).jpg) |
| `theater` | Wikimedia Commons | CC BY-SA 4.0 | [bron](https://commons.wikimedia.org/wiki/File:Still_from_%22The_Fall_of_King_Lear%22_by_PEPAC_Theatre_Company.jpg) |
| `kamer` | Kleon3 | CC BY-SA 4.0 | [bron](https://commons.wikimedia.org/wiki/File:2020_The_Student_Hotel_Maastricht_09.jpg) |
| `collegezaal` | Wikimedia Commons | Public domain | [bron](https://commons.wikimedia.org/wiki/File:EducatoriumCollegezaal.jpg) |
| `stad-eindhoven` | Wolkenbrij | CC BY-SA 4.0 | [bron](https://commons.wikimedia.org/wiki/File:TUe,_Eindhoven_University_of_Technology,_Atlas,_Main_Building.jpg) |
| `stad-nijmegen` | Roger Veringmeier | CC BY 3.0 | [bron](https://commons.wikimedia.org/wiki/File:Het_Grotiusgebouw_Faculteit_der_Rechtsgeleerdheid_Radboud_Universiteit_Nijmegen.jpg) |
| `heelal` | Onderwijsgek | CC BY-SA 2.5 nl | [bron](https://commons.wikimedia.org/wiki/File:Westerbork_Synthese_Radio_Telescoop.JPG) |
| `samenwerken` | Faizanalivarya | CC BY-SA 4.0 | [bron](https://commons.wikimedia.org/wiki/File:Group_of_Tajik_Students_in_Karachi_University.jpg) |
| `studeren` | Tulane Public Relations | CC BY 2.0 | [bron](https://commons.wikimedia.org/wiki/File:Three_walking_students,_Tulane_University_New_Orleans,_March_2008.jpg) |
| `museum` | Hnapel | CC BY-SA 4.0 | [bron](https://commons.wikimedia.org/wiki/File:Rijksmuseum_Eregalerij_met_Nachtwacht_01.jpg) |
| `fietsen` | Fons Heijnsbroek | CC0 | [bron](https://commons.wikimedia.org/wiki/File:A_photo_of_students_walking_over_the_bridge_on_the_campus_Roeterseiland,_Amsterdam;_high_resolution_image_by_FotoDutch_in_June_2013.jpg) |
| `ziekenhuis` | John Crawford | Public domain | [bron](https://commons.wikimedia.org/wiki/File:Operating_room.jpg) |
