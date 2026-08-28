const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..", "node_modules");
const id = `${process.platform}-${process.arch}`;
const file = `lightningcss.${id}.node`;
const src = path.join(root, `lightningcss-${id}`, file);
const dest = path.join(root, "lightningcss", file);

if (fs.existsSync(src) && fs.existsSync(path.dirname(dest))) {
  fs.copyFileSync(src, dest);
}
