import fs from "fs";

export default () => {
  console.log("compiling...");

  const structureOrder = [
    "Sapphire_cropped",
    "Flowers(1)",
    "Samurai",
    "Angel_cropped",
    "Dragon_cropped(1)",
    {
      name: "1st Revolution",
      info: "Studied ファジョボレ",
      tags: ["clothing", "shading", "style"],
    },
    "Sailor_cropped",
    "Machine_cropped",
    "Dragon_cropped(2)",
    "Reaper",
    "Puppet",
    "Jelly",
    "Conductor",
    "Demon(1)",
    "Angel",
    {
      name: "2nd Revolution",
      info: "Changed Brushes",
      tags: ["shading", "style"],
    },
    "Flowers(2)",
    "Miku",
    "Pirate",
    "Demon(2)",
    "2024",
    "Discord",
    "Justice",
    {
      name: "3rd Revolution",
      info: "Studied Shading in Depth",
      tags: ["shading", "color"],
    },
    "Dragon_Tamer",
    "Smoke",
    "Be_Your_Army",
    "Blob_King",
    "Airship_Lore",
    "Death_And_Fate",
    "Halloween",
  ];

  const preCompContent = fs.readFileSync("structures-precomp.txt", "utf-8");

  let postCompContent = "";

  for (const line of preCompContent.split("\n")) {
    const parts = line.trim().split(/[\s\t]/);
    if (
      parts.length < 2 ||
      parts.shift() !== "#" ||
      parts.shift() !== "@digital-art-gallery"
    ) {
      postCompContent += line + "\n";
      continue;
    }
    const params = {};
    for (const part of parts) {
      const keyValueParts = part.split("=");
      if (keyValueParts.length !== 2) continue;
      const [key, value] = keyValueParts;
      params[key] = value;
    }
    const ox = parseFloat(params["x"] ?? "0");
    const oy = parseFloat(params["y"] ?? "0") - 1;
    const checkWalls = () => {
      while (wallI <= i) {
        const n = 2;
        for (let j = 0; j < n; j++) {
          wallParts.push(
            `wall ${ox - 0.5} ${oy - wallI} facing=y p2=false`,
            `wall ${ox + 0.5} ${oy - wallI} facing=y p2=false`,
          );
          wallI++;
        }
        wallParts.push(
          `arch ${ox} ${oy - wallI + 0.5} z=-1 facing=x`,
          `plight ${ox} ${
            oy - wallI + 0.5
          } z=3.5 distance=10 radius=2 intensity=1`,
          `carpet ${ox} ${oy - wallI + 1.5} height=1`,
        );
      }
    };
    let i = 0,
      wallI = 0, // down the hall
      artworkSide = false;
    let wallParts = [],
      artworkParts = [],
      textParts = [];
    checkWalls();
    for (const structure of structureOrder) {
      if (typeof structure === "string") {
        artworkSide = !artworkSide;
        artworkParts.push(
          `art ${ox + (artworkSide ? 0.5 : -0.5)} ${oy - i} x=${
            artworkSide ? -0.1 : 0.1
          } z=1.1 name=${structure} facing=x${artworkSide ? "+" : "-"}`,
        );
        if (!artworkSide) i++;
        checkWalls();
        continue;
      }
      checkWalls();
      i = wallI;
      textParts.push(
        `infobox ${ox} ${oy - i + 0.5} z=2 text=${structure.name.replaceAll(
          " ",
          "\\s",
        )} type=h1`,
        `infobox ${ox} ${oy - i + 0.5} z=1.85 text=${structure.info.replaceAll(
          " ",
          "\\s",
        )} type=h3`,
        `infobox ${ox} ${oy - i + 0.5} z=1.65 text=${structure.tags
          .map((tag) => tag[0].toUpperCase() + tag.slice(1))
          .join(",\\s")} type=h6`,
      );
      artworkSide = false;
    }
    postCompContent +=
      [...wallParts, ...artworkParts, ...textParts]
        .map((line) => `${line} loopY=${i + 2}`)
        .join("\n") + "\n";
  }

  fs.writeFileSync("structures.txt", postCompContent);
};
