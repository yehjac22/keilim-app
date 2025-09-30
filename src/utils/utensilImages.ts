// utensilImages.ts
// Use the same file extension you save images as (jpg, png, etc.)
const modules = import.meta.glob("../assets/utensils/*.{jpg,jpeg,png}", {
  eager: true,
  import: "default",
});

type ImgMap = Record<string, string>;

// Build map: id → URL
const utensilImageMap: ImgMap = {};

for (const path in modules) {
  const module = modules[path] as any;  // each module's default export is the URL string
  // path is something like "/utensils/aluminum-pan.jpg"
  const filename = path.substring(path.lastIndexOf("/") + 1);  // e.g. "aluminum-pan.jpg"
  const id = filename.replace(/\.(jpg|jpeg|png)$/, "");  // "aluminum-pan"
  utensilImageMap[id] = module.default || module;  // module.default for ES import, fallback to module
}

export default utensilImageMap;
