// Celebrities often cited as examples of each beauty type in colour-analysis
// literature. Attributions are opinions, not facts: edit freely. `wiki` is the
// English Wikipedia page title, used to load a freely licensed portrait.

/** Set to false to hide celebrity photos everywhere (names and palettes stay). */
export const SHOW_CELEBRITY_PHOTOS = true;

export type Celebrity = { name: string; wiki: string };

export const CELEBRITIES: Record<string, { women: Celebrity[]; men: Celebrity[] }> = {
  "jasna-wiosna": {
    women: [{ name: "Amanda Seyfried", wiki: "Amanda_Seyfried" }, { name: "Blake Lively", wiki: "Blake_Lively" }, { name: "Cate Blanchett", wiki: "Cate_Blanchett" }],
    men: [{ name: "Owen Wilson", wiki: "Owen_Wilson" }, { name: "Brad Pitt", wiki: "Brad_Pitt" }],
  },
  "ciepla-wiosna": {
    women: [{ name: "Amy Adams", wiki: "Amy_Adams" }, { name: "Emma Stone", wiki: "Emma_Stone" }, { name: "Nicole Kidman", wiki: "Nicole_Kidman" }],
    men: [{ name: "Ed Sheeran", wiki: "Ed_Sheeran" }, { name: "Rupert Grint", wiki: "Rupert_Grint" }],
  },
  "czysta-wiosna": {
    women: [{ name: "Halle Berry", wiki: "Halle_Berry" }, { name: "Miranda Kerr", wiki: "Miranda_Kerr" }, { name: "Emma Watson", wiki: "Emma_Watson" }],
    men: [{ name: "Zac Efron", wiki: "Zac_Efron" }, { name: "Ryan Reynolds", wiki: "Ryan_Reynolds" }],
  },
  "jasne-lato": {
    women: [{ name: "Elle Fanning", wiki: "Elle_Fanning" }, { name: "Taylor Swift", wiki: "Taylor_Swift" }, { name: "Gwyneth Paltrow", wiki: "Gwyneth_Paltrow" }],
    men: [{ name: "Jude Law", wiki: "Jude_Law" }, { name: "Prince William", wiki: "William,_Prince_of_Wales" }],
  },
  "chlodne-lato": {
    women: [{ name: "Emily Blunt", wiki: "Emily_Blunt" }, { name: "Kristen Bell", wiki: "Kristen_Bell" }, { name: "Naomi Watts", wiki: "Naomi_Watts" }],
    men: [{ name: "Anderson Cooper", wiki: "Anderson_Cooper" }, { name: "Matt Damon", wiki: "Matt_Damon" }],
  },
  "zgaszone-lato": {
    women: [{ name: "Jennifer Aniston", wiki: "Jennifer_Aniston" }, { name: "Catherine, Princess of Wales", wiki: "Catherine,_Princess_of_Wales" }, { name: "Sarah Jessica Parker", wiki: "Sarah_Jessica_Parker" }],
    men: [{ name: "George Clooney", wiki: "George_Clooney" }, { name: "Bradley Cooper", wiki: "Bradley_Cooper" }],
  },
  "zgaszona-jesien": {
    women: [{ name: "Gisele Bündchen", wiki: "Gisele_Bündchen" }, { name: "Drew Barrymore", wiki: "Drew_Barrymore" }, { name: "Mila Kunis", wiki: "Mila_Kunis" }],
    men: [{ name: "Leonardo DiCaprio", wiki: "Leonardo_DiCaprio" }, { name: "Chris Evans", wiki: "Chris_Evans_(actor)" }],
  },
  "ciepla-jesien": {
    women: [{ name: "Julianne Moore", wiki: "Julianne_Moore" }, { name: "Jessica Chastain", wiki: "Jessica_Chastain" }, { name: "Isla Fisher", wiki: "Isla_Fisher" }],
    men: [{ name: "Prince Harry", wiki: "Prince_Harry,_Duke_of_Sussex" }, { name: "Damian Lewis", wiki: "Damian_Lewis" }],
  },
  "gleboka-jesien": {
    women: [{ name: "Jennifer Lopez", wiki: "Jennifer_Lopez" }, { name: "Beyoncé", wiki: "Beyoncé" }, { name: "Eva Mendes", wiki: "Eva_Mendes" }],
    men: [{ name: "Jason Momoa", wiki: "Jason_Momoa" }, { name: "Oscar Isaac", wiki: "Oscar_Isaac" }],
  },
  "gleboka-zima": {
    women: [{ name: "Sandra Bullock", wiki: "Sandra_Bullock" }, { name: "Lucy Liu", wiki: "Lucy_Liu" }, { name: "Kim Kardashian", wiki: "Kim_Kardashian" }],
    men: [{ name: "Keanu Reeves", wiki: "Keanu_Reeves" }, { name: "Idris Elba", wiki: "Idris_Elba" }],
  },
  "chlodna-zima": {
    women: [{ name: "Anne Hathaway", wiki: "Anne_Hathaway" }, { name: "Lupita Nyong'o", wiki: "Lupita_Nyong'o" }, { name: "Dita Von Teese", wiki: "Dita_Von_Teese" }],
    men: [{ name: "Henry Cavill", wiki: "Henry_Cavill" }, { name: "Pierce Brosnan", wiki: "Pierce_Brosnan" }],
  },
  "czysta-zima": {
    women: [{ name: "Megan Fox", wiki: "Megan_Fox" }, { name: "Courteney Cox", wiki: "Courteney_Cox" }, { name: "Zooey Deschanel", wiki: "Zooey_Deschanel" }],
    men: [{ name: "Matt Bomer", wiki: "Matt_Bomer" }, { name: "Adam Driver", wiki: "Adam_Driver" }],
  },
};
