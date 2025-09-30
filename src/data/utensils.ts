export type Need = "yes" | "no" | "varies";

export type Utensil = {
  id: string;
  name: string;
  tevila: Need;     // assumes typical material OR varies by material
  brocha: Need;     // "
  notes?: string;
  tags?: string[];
};

const Y: Need = "yes";
const N: Need = "no";
const V: Need = "varies";

/**
 * Source model: widely used community charts and guidelines.
 * Always consult a Rav for edge cases or when in doubt.
 */
export const UTENSILS: Utensil[] = [
  // ——— From your list (A–C) ———
  { id: "aluminum-tray-disposable", name: "Aluminum Tray", tevila: Y, brocha: V, notes: "Disposable aluminum pans do not require tevila since they are not considered keilim. Even if one were to use it a few times, it is still not a permanent keili since it was designed for one-time use and is not durable. Some are more stringent and toivel the pans if they will be used more than once, especially if the aluminum is made of thicker, less flimsy material." },
  { id: "apple-corer-metal", name: "Apple Corer (metal)", tevila: Y, brocha: Y },
  { id: "baking-sheet", name: "Baking/Cookie Sheet (metal)", tevila: Y, brocha: Y },
  { id: "barbeque-grill", name: "Barbeque Grill (racks)", tevila: Y, brocha: Y, notes: "Other components: no tevila." },
  { id: "blech", name: "Blech", tevila: N, brocha: N },
  { id: "blender-mixer", name: "Blender/Mixer (metal blades etc.)", tevila: Y, brocha: Y, notes: "Motor/base no tevila." },
  { id: "bottle-metal-glass", name: "Bottle (metal or glass)", tevila: Y, brocha: Y, notes: "If purchased filled and emptied by a Jew → generally no tevila." },
  { id: "brush-kitchen", name: "Brush (grill/pastry/egg)", tevila: N, brocha: N },
  { id: "cake-plate", name: "Cake Plate (metal/glass)", tevila: Y, brocha: Y, notes: "Cover: no tevila." },
  { id: "can-opener", name: "Can Opener", tevila: N, brocha: N },
  { id: "cast-iron-pot", name: "Cast Iron Pot", tevila: Y, brocha: Y },
  { id: "ceramic-knife", name: "Ceramic Knife", tevila: V, brocha: N, notes: "Glazed ceramics often without brocha; many hold ceramic knives → no tevila." },
  { id: "challah-board", name: "Challah Board", tevila: V, brocha: V, notes: "Metal or glass top → with brocha; plain wood/plastic → no tevila." },
  { id: "cheese-slicer-metal", name: "Cheese Slicer (metal)", tevila: Y, brocha: Y },
  { id: "china-glazed", name: "China (glazed)", tevila: Y, brocha: N },
  { id: "coffee-grinder", name: "Coffee Grinder", tevila: N, brocha: N },
  { id: "coffee-maker", name: "Coffee Maker (electric)", tevila: V, brocha: V, notes: "If toveling will ruin it → do not tovel; ask a Rav." },
  { id: "colander-metal", name: "Colander (metal)", tevila: Y, brocha: Y },
  { id: "cookie-cutter", name: "Cookie Cutter", tevila: V, brocha: V, notes: "If used only with inedible raw dough → no tevila; otherwise see material." },
  { id: "cooling-rack-metal", name: "Cooling Rack (metal)", tevila: N, brocha: N },
  { id: "corelle-plate", name: "Corelle Plate", tevila: Y, brocha: Y },
  { id: "corkscrew", name: "Corkscrew", tevila: N, brocha: N },
  { id: "corningware", name: "CorningWare", tevila: Y, brocha: N },
  { id: "corn-skewers", name: "Corn Skewers (metal prongs)", tevila: Y, brocha: Y },
  { id: "crockpot", name: "Crockpot", tevila: V, brocha: V, notes: "Metal/glass insert & glass lid → with brocha; ceramic insert → without; shell → none." },
  { id: "cup-mug", name: "Cup/Mug", tevila: V, brocha: V, notes: "Metal/glass → with brocha; glazed ceramic → without; plastic → none." },
  { id: "cutlery-metal", name: "Cutlery: forks/knives/spoons (metal)", tevila: Y, brocha: Y, notes: "Knife for crafts only → no tevila." },
  { id: "dentures", name: "Dentures", tevila: N, brocha: N },
  { id: "dishes-general", name: "Dishes (general)", tevila: V, brocha: V, notes: "Metal/glass → with brocha; glazed ceramic → without." },
  { id: "dish-rack", name: "Dish Rack", tevila: N, brocha: N },
  { id: "egg-slicer-metal", name: "Egg Slicer (metal)", tevila: Y, brocha: Y },
  { id: "flour-sifter", name: "Flour Sifter", tevila: N, brocha: N },
  { id: "frying-pan", name: "Frying Pan (metal)", tevila: V, brocha: V, notes: "Uncoated → with brocha; Teflon coated → tevila without brocha." },
  { id: "george-foreman", name: "George Foreman Grill", tevila: Y, brocha: N, notes: "If toveling will break it → don’t tovel; ask a Rav." },
  { id: "glasses-drinking", name: "Glasses (drinking, glass/metal)", tevila: Y, brocha: Y },
  { id: "grater-metal", name: "Grater (metal)", tevila: Y, brocha: Y },
  { id: "hot-plate", name: "Hot Plate / Platta", tevila: N, brocha: N },
  { id: "ice-cream-scooper", name: "Ice Cream Scooper (metal)", tevila: Y, brocha: Y },
  { id: "immersion-blender", name: "Immersion Blender (metal blades)", tevila: Y, brocha: Y },
  { id: "immersion-heater", name: "Immersion Heater", tevila: N, brocha: N },
  { id: "kettle", name: "Kettle (metal or glass)", tevila: Y, brocha: Y },
  { id: "keurig", name: "Keurig Machine", tevila: V, brocha: V, notes: "If immersion ruins it → do not tovel; ask a Rav." },
  { id: "kiddush-cup-metal", name: "Kiddush Cup (metal)", tevila: Y, brocha: Y, notes: "Manufactured in Israel may differ; see Rav." },
  { id: "knife-sharpener", name: "Knife Sharpener", tevila: N, brocha: N },
  { id: "ladle-metal", name: "Ladle (metal)", tevila: Y, brocha: Y },
  { id: "measuring-spoon-metal", name: "Measuring Spoon (metal)", tevila: Y, brocha: N },
  { id: "meat-grinder", name: "Meat Grinder (attachments)", tevila: V, brocha: V, notes: "If only for raw meat → tevila without brocha; otherwise with." },
  { id: "meat-tenderizer-hammer", name: "Meat Tenderizer (metal hammer)", tevila: N, brocha: N },
  { id: "meat-thermometer", name: "Meat Thermometer", tevila: N, brocha: N },
  { id: "medicine-spoon", name: "Medicine Spoon (metal/glass)", tevila: Y, brocha: N, notes: "If used for puposes other than medicie → brocha" },
  { id: "melon-baller-metal", name: "Melon Baller (metal)", tevila: Y, brocha: Y },
  { id: "microwave-turntable", name: "Microwave Turntable (glass)", tevila: Y, brocha: N },
  { id: "nutcracker", name: "Nutcracker", tevila: V, brocha: V, notes: "If used at table → with brocha; otherwise without." },
  { id: "oven-rack", name: "Oven Rack", tevila: N, brocha: N, notes: "Toaster-oven racks may differ (see separate item)." },
  { id: "peppermill", name: "Peppermill", tevila: Y, brocha: N },
  { id: "peeler", name: "Peeler (metal blade)", tevila: Y, brocha: Y, notes: "Even if handle is plastic." },
  { id: "plastic-utensil", name: "Plastic Utensil", tevila: N, brocha: N },
  { id: "popcorn-maker", name: "Popcorn Maker (metal)", tevila: Y, brocha: Y, notes: "If toveling will break it → do not tovel; ask a Rav." },
  { id: "pot-metal-glass", name: "Pot (metal or glass)", tevila: Y, brocha: Y, notes: "If Teflon/enamel coated → tevila without brocha." },
  { id: "pot-cover", name: "Pot Cover (metal or glass)", tevila: Y, brocha: Y },
  { id: "pyrex", name: "Pyrex Cookware", tevila: Y, brocha: Y },
  { id: "rolling-pin", name: "Rolling Pin", tevila: N, brocha: N },
  { id: "salt-shaker", name: "Salt Shaker (metal or glass)", tevila: Y, brocha: Y, notes: "Metal cap on plastic shaker → tevila without brocha." },
  { id: "sandwich-maker", name: "Sandwich Maker", tevila: Y, brocha: N },
  { id: "scissors-shears", name: "Scissors/Shears (kitchen)", tevila: V, brocha: V, notes: "Edible food → with brocha; raw only → without." },
  { id: "sieve-metal", name: "Sieve/Strainer (metal)", tevila: Y, brocha: Y },
  { id: "silicone-bakeware", name: "Silicone Bakeware", tevila: N, brocha: N },
  { id: "sink-rack", name: "Sink Rack", tevila: N, brocha: N },
  { id: "skewer-metal", name: "Skewer (metal)", tevila: Y, brocha: Y },
  { id: "spoon-rest", name: "Spoon Rest", tevila: N, brocha: N },
  { id: "storage-container", name: "Storage Container", tevila: Y, brocha: V, notes: "If used at table as well like a pitcher → with a brocha." },
  { id: "sugar-bowl", name: "Sugar Bowl (metal/glass)", tevila: Y, brocha: Y },
  { id: "teflon-pan", name: "Teflon-coated Pan (metal)", tevila: Y, brocha: N },
  { id: "thermos", name: "Thermos (insert metal/glass)", tevila: Y, brocha: Y, notes: "Casing without insert → no tevila." },
  { id: "toaster", name: "Toaster", tevila: Y, brocha: N },
  { id: "toaster-oven", name: "Toaster Oven (rack/tray)", tevila: Y, brocha: Y, notes: "Heating unit → no tevila." },
  { id: "trivet", name: "Trivet", tevila: N, brocha: N, notes: "If food doesn’t touch surface." },
  { id: "urn-metal", name: "Urn (metal)", tevila: Y, brocha: Y },
  { id: "waffle-maker", name: "Waffle Maker", tevila: Y, brocha: N },
  { id: "warming-tray", name: "Warming Tray", tevila: N, brocha: N },
  { id: "washing-cup-metal", name: "Washing Cup (metal)", tevila: N, brocha: N, notes: "If used only for netilas yadayim." },
  { id: "cutting-board-metal-glass", name: "Cutting Board (metal/glass)", tevila: Y, brocha: Y },

  // ——— A few extra commons ———
  { id: "measuring-cup-glass", name: "Measuring Cup (glass)", tevila: Y, brocha: Y },
  { id: "mixing-bowl-metal", name: "Mixing Bowl (metal)", tevila: Y, brocha: Y },
  { id: "serving-tray-metal", name: "Serving Tray (metal)", tevila: Y, brocha: Y },
  { id: "pressure-cooker-pot", name: "Pressure Cooker Pot (metal)", tevila: Y, brocha: Y },
  { id: "rice-cooker-pot", name: "Rice Cooker Pot (metal insert)", tevila: Y, brocha: Y },
];
