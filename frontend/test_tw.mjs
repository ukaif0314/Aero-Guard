import postcss from "postcss";
import tailwindPostcss from "@tailwindcss/postcss";
import fs from "fs";

const css = fs.readFileSync("./src/app/globals.css", "utf8");

postcss([tailwindPostcss])
  .process(css, { from: "./src/app/globals.css" })
  .then((result) => {
    console.log("SUCCESS! Output CSS length:", result.css.length);
  })
  .catch((err) => {
    console.error("PostCSS ERROR:");
    console.error(err);
  });
