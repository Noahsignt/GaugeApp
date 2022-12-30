import { apikey } from './config.js';
    /*
        L.map creates the map object via a given DOM id, so I can mess with location and stuff via that. 
        this.setView modifies this (the map) and then returns the map with the changed state. This is center and zoom.
    */
    var map = L.map('map').setView([-33.8688, 151.2093], 13); 
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    minZoom: 3,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    noWrap:true
}).addTo(map);

    // //ensure user can't get out of bounds
    var corner1 = L.latLng(90, -180);
    var corner2 = L.latLng(-90, 180);
    var bounds = L.latLngBounds(corner1, corner2);
    map.setMaxBounds(bounds);

    var marker = new L.marker([0, 0]); //invisible marker
    
    //to return correct location names
    function correctname(name){if(name === ''){return 'Ocean'} else {return name}};

    function onMapClick(e) {
        map.removeLayer(marker); //map only ever has a single active marker
        marker = new L.Marker(e.latlng);
        map.addLayer(marker);

        //query weather via OpenWeatherMap API
        var weatherData = new Object();
        
        //current input for location specific weather
        var lat = e.latlng.lat;
        var lng = e.latlng.lng;
        var url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apikey}&units=metric`

        fetch(url)
            .then(response => response.json())
            .then(data => {
                const { main, name, sys, weather } = data;
                const icon = `https://openweathermap.org/img/wn/${
                    weather[0]["icon"]
                }@2x.png`;
                
                const markup = ` 
                    <h2 class="city-name" data-name="${name},${sys.country}"> 
                    <span>${correctname(name)}</span> 
                    <sup>${sys.country}</sup> 
                    </h2> 
                    <div class="city-temp">${Math.round(main.temp)}<sup>°C</sup> 
                    </div> 
                    <figure style="width:175px; text-align: center; background-color: #333333; border-radius: 15px; font: 1rem/1.3 "Roboto", sans-serif;" > 
                    <img class="city-icon" src=${icon} alt=${weather[0]["main"]}> 
                    <figcaption style="text-transform:capitalize; text-align: center; color: white;">${weather[0]["description"]}</figcaption> 
                    </figure> 
                    `;

                //construct popup
                marker.bindPopup(markup).openPopup();
            })
        .catch(() => {
            alert("fatal error");
        });

    }

    map.on('click', onMapClick);
