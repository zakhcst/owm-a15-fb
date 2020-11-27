
#// https://openweathermap.org/weather-conditions
#// Array.from(document.querySelectorAll('#Icon-list + table td img'), img => img.src);
declare -a arr=(
'http://openweathermap.org/img/w/01d.png'
'http://openweathermap.org/img/w/01n.png'
'http://openweathermap.org/img/w/02d.png'
'http://openweathermap.org/img/w/02n.png'
'http://openweathermap.org/img/w/03d.png'
'http://openweathermap.org/img/w/03n.png'
'http://openweathermap.org/img/w/04d.png'
'http://openweathermap.org/img/w/04n.png'
'http://openweathermap.org/img/w/09d.png'
'http://openweathermap.org/img/w/09n.png'
'http://openweathermap.org/img/w/10d.png'
'http://openweathermap.org/img/w/10n.png'
'http://openweathermap.org/img/w/11d.png'
'http://openweathermap.org/img/w/11n.png'
'http://openweathermap.org/img/w/13d.png'
'http://openweathermap.org/img/w/13n.png'
'http://openweathermap.org/img/w/50d.png'
'http://openweathermap.org/img/w/50n.png'
)

for i in "${arr[@]}"
do
   echo "$i"
   wget $i
done
