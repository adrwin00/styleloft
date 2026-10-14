/* StyleLoft – Produktkatalog */

var outerwear = "img-black-fashion-outerwear.jpg";
var coatsExtra = "img-black-fashion-coats-extra.jpg";
var tops = "img-black-fashion-tops.jpg";
var bottomsDresses = "img-black-fashion-bottoms-dresses.jpg";
var shoesAccessories = "img-black-fashion-shoes-accessories.jpg";
var colorJackets1 = "img-styleloft-jackets-1.jpg";
var colorJackets2 = "img-styleloft-jackets-2.jpg";
var colorJackets3 = "img-styleloft-jackets-3.jpg";
var colorJackets4 = "img-styleloft-jackets-4.jpg";
var colorTops = "img-color-fashion-tops.jpg";
var colorBottomsDresses = "img-color-fashion-bottoms-dresses.jpg";
var colorShoesAccessories = "img-color-fashion-shoes-accessories.jpg";

/** Hilfsfunktion: legt ein Produkt an (Bewertung und Anzahl Bewertungen sind fest berechnet). */
function item(id, name, category, price, image, crop, description, oldPrice, black, gender) {
  if (black === undefined) black = true;
  if (gender === undefined) gender = "damen";
  var p = { id: id, name: name, category: category, price: price };
  if (oldPrice !== undefined) p.oldPrice = oldPrice;
  p.image = image; p.crop = crop; p.description = description; p.black = black; p.gender = gender;
  p.rating = 4.2 + (id % 7) / 10;
  p.reviews = 28 + ((id * 47) % 390);
  return p;
}

var PRODUCTS = [
  item(1, "Noir Belted Parka", "jacken", 129, outerwear, 0, "Taillierter schwarzer Parka mit mattem Finish", 169),
  item(2, "Midnight Gloss Puffer", "jacken", 149, outerwear, 1, "Glänzende schwarze Daunenjacke im Oversize-Schnitt"),
  item(3, "Studio Wool Coat", "jacken", 149, outerwear, 2, "Langer schwarzer Wollmantel mit klarer Schulterlinie", 229),
  item(4, "Urban Shell Anorak", "jacken", 119, outerwear, 3, "Wasserfester schwarzer Anorak mit großer Fronttasche"),
  item(5, "Night Flight Bomber", "jacken", 99, outerwear, 4, "Kurze schwarze Bomberjacke mit Volumenärmeln"),
  item(6, "Icon Trench Black", "jacken", 149, outerwear, 5, "Zeitloser schwarzer Trenchcoat mit Gürtel"),
  item(7, "Quilted City Jacket", "jacken", 109, outerwear, 6, "Leichte schwarze Steppjacke für den Alltag", 139),
  item(8, "Sculpted Oversize Coat", "jacken", 149, outerwear, 7, "Schwarzer Statement-Mantel mit skulpturalem Schnitt"),

  item(9, "Essential Merino Rolli", "pullover", 69, tops, 0, "Feiner schwarzer Merino-Rollkragenpullover"),
  item(10, "Cloud Knit Sweater", "pullover", 79, tops, 1, "Weicher schwarzer Oversize-Pullover", 99),
  item(11, "Contour Rib Cardigan", "pullover", 65, tops, 2, "Figurnaher schwarzer Cardigan aus Rippstrick"),
  item(12, "Cropped Cable Knit", "pullover", 59, tops, 3, "Kurzer schwarzer Zopfmuster-Pullover"),
  item(13, "Minimal Hoodie", "pullover", 72, tops, 4, "Schwarzer Premium-Hoodie mit cleaner Silhouette"),
  item(14, "After Dark Satin Blouse", "pullover", 75, tops, 5, "Schwarze Satinbluse für elegante Looks"),

  item(15, "Wide Leg Tailored Pants", "hosen", 89, bottomsDresses, 0, "Weite schwarze Anzughose mit hoher Taille", 119),
  item(16, "Vegan Leather Straight", "hosen", 99, bottomsDresses, 1, "Gerade schwarze Hose in Lederoptik"),
  item(17, "Utility Cargo Black", "hosen", 82, bottomsDresses, 2, "Moderne schwarze Cargohose mit weitem Bein"),
  item(18, "Second Skin Denim", "hosen", 74, bottomsDresses, 3, "Schwarze High-Waist Jeans mit klarem Finish"),

  item(19, "Silk Line Midi Dress", "kleider", 119, bottomsDresses, 4, "Fließendes schwarzes Slipdress in Midilänge", 149),
  item(20, "Form Longsleeve Dress", "kleider", 95, bottomsDresses, 5, "Figurnahes schwarzes Kleid mit langen Ärmeln"),
  item(21, "Power Blazer Dress", "kleider", 139, bottomsDresses, 6, "Strukturiertes schwarzes Blazerkleid"),
  item(22, "Noir Flow Maxi", "kleider", 129, bottomsDresses, 7, "Langes schwarzes Kleid mit fließendem Rock"),

  item(23, "Platform Chelsea Boot", "schuhe", 129, shoesAccessories, 0, "Schwarze Lederboots mit markanter Profilsohle", 169),
  item(24, "Mono Platform Sneaker", "schuhe", 99, shoesAccessories, 1, "Komplett schwarzer Ledersneaker auf Plateausohle"),
  item(25, "Sharp Slingback", "schuhe", 109, shoesAccessories, 2, "Spitzer schwarzer Slingback-Pumps"),
  item(26, "Tall City Boot", "schuhe", 179, shoesAccessories, 3, "Hoher schwarzer Lederstiefel mit Blockabsatz"),

  item(27, "Structure Shoulder Bag", "accessoires", 119, shoesAccessories, 4, "Strukturierte schwarze Schultertasche"),
  item(28, "Crescent Crossbody", "accessoires", 89, shoesAccessories, 5, "Schwarze Halbmondtasche aus glattem Leder", 119),
  item(29, "Noir Frame Sunglasses", "accessoires", 55, shoesAccessories, 6, "Oversize-Sonnenbrille mit schwarzer Fassung"),
  item(30, "Matte Statement Belt", "accessoires", 45, shoesAccessories, 7, "Breiter schwarzer Ledergürtel mit matter Schnalle"),

  item(31, "Sunset Field Parka", "jacken", 119, colorJackets1, 0, "Farbenfroher Parka mit lässigem Schnitt", 149, false),
  item(32, "Candy Gloss Puffer", "jacken", 139, colorJackets1, 1, "Glänzende Daunenjacke in kräftiger Farbe", undefined, false),
  item(33, "Heritage Wool Coat", "jacken", 169, colorJackets1, 2, "Klassischer Wollmantel in warmem Farbton", 219, false),
  item(34, "Trail Shell Anorak", "jacken", 109, colorJackets1, 3, "Wasserfester Anorak in leuchtendem Color-Blocking", undefined, false),
  item(35, "Retro Flight Bomber", "jacken", 95, colorJackets1, 4, "Kurze Bomberjacke mit farbigen Details", undefined, false),
  item(36, "Classic Trench Color", "jacken", 149, colorJackets1, 5, "Zeitloser Trenchcoat in saisonaler Farbe", undefined, false),
  item(37, "Quilted Day Jacket", "jacken", 99, colorJackets1, 6, "Leichte Steppjacke in frischer Farbe", 129, false),
  item(38, "Bold Oversize Coat", "jacken", 179, colorJackets1, 7, "Statement-Mantel in ausdrucksstarker Farbe", undefined, false),
  item(39, "Meadow Zip Parka", "jacken", 124, colorJackets2, 0, "Bequemer Parka mit farbigem Futter", undefined, false),
  item(40, "Prism Puffer Jacket", "jacken", 145, colorJackets2, 1, "Wattierte Jacke mit Farbverlauf-Optik", 185, false),
  item(41, "Gallery Wool Coat", "jacken", 172, colorJackets2, 2, "Eleganter Wollmantel in kräftigem Ton", undefined, false),
  item(42, "Harbor Rain Anorak", "jacken", 112, colorJackets2, 3, "Leichter Regen-Anorak in Signalfarbe", undefined, false),
  item(43, "Avenue Bomber Color", "jacken", 98, colorJackets2, 4, "Bomberjacke mit kontrastfarbenem Kragen", undefined, false),
  item(44, "Boulevard Trench", "jacken", 154, colorJackets2, 5, "Moderner Trenchcoat in saisonalem Farbton", 199, false),
  item(45, "Everyday Quilt Color", "jacken", 104, colorJackets2, 6, "Vielseitige Steppjacke in fröhlicher Farbe", undefined, false),
  item(46, "Statement Wrap Coat", "jacken", 184, colorJackets2, 7, "Wickelmantel in leuchtender Farbe", undefined, false),
  item(47, "City Light Parka", "jacken", 132, colorJackets3, 0, "Leichter Parka für die Übergangszeit", 165, false),
  item(48, "Color Pop Puffer", "jacken", 142, colorJackets3, 1, "Kurze Daunenjacke in Knallfarbe", undefined, false),
  item(49, "Atelier Long Coat", "jacken", 176, colorJackets3, 2, "Langer Mantel mit farbigem Stehkragen", undefined, false),
  item(50, "Coast Wind Anorak", "jacken", 116, colorJackets3, 3, "Winddichter Anorak in Pastellton", undefined, false),

  item(51, "Cherry Knit Pullover", "pullover", 64, colorTops, 0, "Rote Strickpullover mit Ballonärmeln", 84, false),
  item(52, "Honey Button Cardigan", "pullover", 72, colorTops, 1, "Senfgelber Cardigan mit Knöpfen", undefined, false),
  item(53, "Forest Comfy Hoodie", "pullover", 68, colorTops, 2, "Dunkelgrüner Hoodie mit Kängurutasche", undefined, false),
  item(54, "Rose Cable Knit", "pullover", 62, colorTops, 3, "Rosa Zopfmuster-Pullover", 79, false),
  item(55, "Cobalt Turtleneck", "pullover", 66, colorTops, 4, "Kobaltblauer Rollkragenpullover", undefined, false),
  item(56, "Cream Knit Cardigan", "pullover", 74, colorTops, 5, "Cremefarbener Strickcardigan", undefined, false),
  item(57, "Tangerine Satin Blouse", "pullover", 78, colorTops, 6, "Orange Satinbluse mit V-Ausschnitt", 98, false),
  item(58, "Lavender Soft Sweater", "pullover", 60, colorTops, 7, "Lavendelfarbener Weichstrick-Pullover", undefined, false),

  item(59, "Bordeaux Tailored Pants", "hosen", 84, colorBottomsDresses, 0, "Bordeauxrote Anzughose mit Bügelfalte", 109, false),
  item(60, "Blue Classic Jeans", "hosen", 69, colorBottomsDresses, 1, "Klassische Blue-Denim Jeans", undefined, false),
  item(61, "Olive Cargo Pants", "hosen", 78, colorBottomsDresses, 2, "Olivgrüne Cargohose mit weitem Bein", undefined, false),
  item(62, "Sand Wide Leg", "hosen", 86, colorBottomsDresses, 3, "Beige Marlenehose mit hoher Taille", 112, false),

  item(63, "Scarlet A-Line Dress", "kleider", 112, colorBottomsDresses, 4, "Rotes A-Linien-Kleid mit Karree-Ausschnitt", undefined, false),
  item(64, "Floral Slip Midi", "kleider", 108, colorBottomsDresses, 5, "Geblümtes Slipdress in Midilänge", 138, false),
  item(65, "Emerald Blazer Dress", "kleider", 132, colorBottomsDresses, 6, "Smaragdgrünes Blazerkleid", undefined, false),
  item(66, "Pink Tiered Maxi", "kleider", 122, colorBottomsDresses, 7, "Rosa Maxikleid mit Volants", undefined, false),

  item(67, "White Court Sneaker", "schuhe", 92, colorShoesAccessories, 0, "Weiße Ledersneaker mit beiger Ferse", 119, false),
  item(68, "Cognac Ankle Boot", "schuhe", 122, colorShoesAccessories, 1, "Braune Stiefelette mit Blockabsatz", undefined, false),
  item(69, "Ruby Patent Pump", "schuhe", 102, colorShoesAccessories, 2, "Rote Lackpumps mit Pfennigabsatz", undefined, false),
  item(70, "Sky Strap Sandal", "schuhe", 88, colorShoesAccessories, 3, "Hellblaue Sandalette mit Blockabsatz", 115, false),

  item(71, "Leo City Bag", "accessoires", 112, colorShoesAccessories, 4, "Handtasche im Leopardenmuster", undefined, false),
  item(72, "Blush Crossbody", "accessoires", 82, colorShoesAccessories, 5, "Rosa Umhängetasche aus Leder", 105, false),
  item(73, "Green Frame Sunglasses", "accessoires", 52, colorShoesAccessories, 6, "Sonnenbrille mit grüner Fassung", undefined, false),
  item(74, "Gold Shine Belt", "accessoires", 42, colorShoesAccessories, 7, "Goldener Ledergürtel mit Glanzschnalle", undefined, false),

  item(75, "Grande Wool Maxi Coat", "jacken", 199, coatsExtra, 0, "Bodenlanger schwarzer Wollmantel mit Revers"),
  item(76, "Belted Heritage Trench", "jacken", 165, coatsExtra, 1, "Doppelreihiger schwarzer Trench mit Gürtel", 209),
  item(77, "Soft Wrap Coat", "jacken", 155, coatsExtra, 2, "Schwarzer Wickelmantel mit Schalkragen"),
  item(78, "Double Breasted Peacoat", "jacken", 145, coatsExtra, 3, "Klassischer schwarzer Cabanjacke-Mantel", 185),
  item(79, "Hooded Long Parka", "jacken", 139, coatsExtra, 4, "Schwarzer Parka mit Kapuze und großen Taschen"),
  item(80, "Duster Coat Noir", "jacken", 149, coatsExtra, 5, "Langer schwarzer Duster-Mantel mit Revers", 179),
  item(81, "Cape Swing Coat", "jacken", 169, coatsExtra, 6, "Kurzer schwarzer Umhangmantel mit Kragen"),
  item(82, "Quilted Long Coat", "jacken", 129, coatsExtra, 7, "Gesteppter langer schwarzer Mantel mit Knopfleiste"),
];

var CATEGORIES = [
  { id: "jacken", label: "Jacken & Mäntel", icon: "🧥" },
  { id: "pullover", label: "Pullover & Tops", icon: "👕" },
  { id: "hosen", label: "Hosen", icon: "👖" },
  { id: "kleider", label: "Kleider", icon: "👗" },
  { id: "schuhe", label: "Schuhe", icon: "👟" },
  { id: "accessoires", label: "Accessoires", icon: "👜" },
];

function productsFor(category) {
  return PRODUCTS.filter(function (product) { return product.category === category; });
}

/** Material, Zusammensetzung und Passform werden aus Name und Beschreibung abgeleitet. */
function productDetails(product) {
  var text = (product.name + " " + product.description).toLowerCase();
  var material = "Nicht angegeben";
  if (/wool|woll|merino/.test(text)) material = "Wolle";
  else if (/vegan|lederoptik|kunstleder/.test(text)) material = "Kunstleder";
  else if (/leder|leather/.test(text)) material = "Leder";
  else if (/denim|jeans/.test(text)) material = "Denim";
  else if (/satin/.test(text)) material = "Satin";
  else if (/strick|knit/.test(text)) material = "Strickstoff";
  else if (/trench/.test(text)) material = "Trenchstoff";
  else if (/stepp|quilt/.test(text)) material = "Steppstoff";
  return {
    material: material,
    composition: "Genaue Faserzusammensetzung nicht angegeben.",
    fit: /oversize|weit/.test(text) ? "Oversize / weit" : /tailliert|figurnah|wickel/.test(text) ? "Tailliert" : "Gerade / regulär"
  };
}
