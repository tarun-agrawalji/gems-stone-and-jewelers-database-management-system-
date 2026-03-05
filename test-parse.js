const fs = require("fs");
const babel = require("@babel/core");

try {
  const code = fs.readFileSync("app/(app)/manufacturing/page.tsx", "utf-8");
  babel.transformSync(code, {
    presets: ["@babel/preset-typescript", "@babel/preset-react"],
    filename: "page.tsx",
  });
  console.log("SUCCESS");
} catch (e) {
  console.error(e);
}
