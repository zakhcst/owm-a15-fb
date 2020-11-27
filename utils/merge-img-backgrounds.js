// combined pictures result in 1.8MB .jpg and 4MB .png
// which is way beyond as separate files sum of 309.9 KiB (317,297)
const mergeImg = require("merge-img");

const inputFilesPng = [
  "../src/assets/backgrounds/default.png",
  "../src/assets/backgrounds/clear_d.png",
  "../src/assets/backgrounds/clear_n.png",
  "../src/assets/backgrounds/clouds_d.png",
  "../src/assets/backgrounds/clouds_n.png",
  "../src/assets/backgrounds/fog_d.png",
  "../src/assets/backgrounds/fog_n.png",
  "../src/assets/backgrounds/rain_d.png",
  "../src/assets/backgrounds/rain_n.png",
  "../src/assets/backgrounds/snow_d.png",
  "../src/assets/backgrounds/snow_n.png",
];
const inputFilesJpg = [
  "../src/assets/backgrounds/default.jpg",
  "../src/assets/backgrounds/clear_d.jpg",
  "../src/assets/backgrounds/clear_n.jpg",
  "../src/assets/backgrounds/clouds_d.jpg",
  "../src/assets/backgrounds/clouds_n.jpg",
  "../src/assets/backgrounds/fog_d.jpg",
  "../src/assets/backgrounds/fog_n.jpg",
  "../src/assets/backgrounds/rain_d.jpg",
  "../src/assets/backgrounds/rain_n.jpg",
  "../src/assets/backgrounds/snow_d.jpg",
  "../src/assets/backgrounds/snow_n.jpg",
];
const outputFileJpg = "../src/assets/backgrounds/backgrounds.jpg";
const outputFilePng = "../src/assets/backgrounds/backgrounds.png";

const options = {
  // direction: false, // vertical
  direction: true, // horizontal
};

mergeImg(inputFilesPng, options).then((img) => {
  console.log(img);
  // Save image as file
  img.write(outputFileJpg, () => console.log("done"));
});
