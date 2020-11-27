const mergeImg = require('merge-img');
 
const files = [
    '../src/assets/icons-weather/01d.png',
    '../src/assets/icons-weather/01n.png',
    '../src/assets/icons-weather/02d.png',
    '../src/assets/icons-weather/02n.png',
    '../src/assets/icons-weather/03d.png',
    '../src/assets/icons-weather/03n.png',
    '../src/assets/icons-weather/04d.png',
    '../src/assets/icons-weather/04n.png',
    '../src/assets/icons-weather/09d.png',
    '../src/assets/icons-weather/09n.png',
    '../src/assets/icons-weather/10d.png',
    '../src/assets/icons-weather/10n.png',
    '../src/assets/icons-weather/11d.png',
    '../src/assets/icons-weather/11n.png',
    '../src/assets/icons-weather/13d.png',
    '../src/assets/icons-weather/13n.png',
    '../src/assets/icons-weather/50d.png',
    '../src/assets/icons-weather/50n.png',
];

const options = {
    direction: true
};

mergeImg(files, options)
  .then((img) => {
    console.log(img)
    // Save image as file
    img.write('../src/assets/icons-weather/icons-weather.png', () => console.log('done'));
  });