const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..", "node_modules");
const id = `${process.platform}-${process.arch}`;

function copyNative(src, dest) {
  if (fs.existsSync(src) && fs.existsSync(path.dirname(dest))) {
    fs.copyFileSync(src, dest);
  }
}

copyNative(
  path.join(root, `lightningcss-${id}`, `lightningcss.${id}.node`),
  path.join(root, "lightningcss", `lightningcss.${id}.node`),
);

copyNative(
  path.join(root, "@tailwindcss", `oxide-${id}`, `tailwindcss-oxide.${id}.node`),
  path.join(root, "@tailwindcss", "oxide", `tailwindcss-oxide.${id}.node`),
);
