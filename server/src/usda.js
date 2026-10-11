// Thin wrapper around USDA FoodData Central. The browser never sees the API key:
// React calls our server, and our server calls USDA.
const BASE = process.env.USDA_BASE_URL ?? "https://api.nal.usda.gov/fdc/v1";

// USDA nutrient ids -> the field names we use. Energy has several ids
// depending on the dataset, so we take the first one that is present.
const NUTRIENT_IDS = {
  calories: [1008, 2047, 2048],
  protein: [1003],
  fat: [1004],
  carbs: [1005],
  fiber: [1079],
  sodium: [1093],
};

function pickNutrients(foodNutrients = []) {
  const byId = new Map(foodNutrients.map((n) => [n.nutrientId, n.value]));
  const out = {};
  for (const [field, ids] of Object.entries(NUTRIENT_IDS)) {
    const id = ids.find((i) => byId.has(i));
    out[field] = id ? Number(byId.get(id)) || 0 : 0;
  }
  return out;
}

// Uses the key from .env; falls back to USDA's shared DEMO_KEY (heavily
// rate-limited) if the placeholder was never replaced.
function apiKey() {
  const key = (process.env.USDA_API_KEY ?? "").trim();
  if (!key || key === "PASTE_YOUR_KEY_HERE") {
    console.warn("USDA_API_KEY is not set in server/.env, using DEMO_KEY.");
    return "DEMO_KEY";
  }
  return key;
}

// Returns foods with nutrients per 100 g (how these USDA datasets report them).
export async function searchFoods(query) {
  const url = new URL(`${BASE}/foods/search`);
  url.searchParams.set("query", query);
  url.searchParams.set("pageSize", "12");
  url.searchParams.set("dataType", "Foundation,SR Legacy");
  url.searchParams.set("api_key", apiKey());

  const response = await fetch(url);
  if (!response.ok) throw new Error(`USDA responded with ${response.status}`);
  const data = await response.json();
  return (data.foods ?? []).map((f) => ({
    fdcId: f.fdcId,
    name: f.description,
    ...pickNutrients(f.foodNutrients),
  }));
}
