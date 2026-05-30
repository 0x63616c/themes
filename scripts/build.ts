import { buildTheme } from "./theme";

const out = JSON.stringify(buildTheme(), null, 2) + "\n";
await Bun.write("themes/blackout-dark.json", out);
console.log("Wrote themes/blackout-dark.json");
