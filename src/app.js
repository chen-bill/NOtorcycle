var UI = require('ui');
var ajax = require('ajax');
var Vector2 = require('vector2');

var URL = 'https://api.forecast.io/forecast/6513dde69395a71ec65a526c3b324a69/43.4667,-80.5167';

var locationOptions = {
  enableHighAccuracy: true, 
  maximumAge: 10000, 
  timeout: 10000
};

function locationSuccess(pos) {
  console.log('lat= ' + pos.coords.latitude + ' lon= ' + pos.coords.longitude);
  URL = 'https://api.forecast.io/forecast/6513dde69395a71ec65a526c3b324a69/' + pos.coords.latitude + "," + pos.coords.longitude;
}

function locationError(err) {
  textfield.text("Failed to locate");
}

Pebble.addEventListener('ready',
  function(e) {
    navigator.geolocation.getCurrentPosition(locationSuccess, locationError, locationOptions);
  }
);

var window = new UI.Window({
  fullscreen: true
});

var bgRect = new UI.Rect({
  position: new Vector2(5, 5),
  size: new Vector2(134, 77),
  backgroundColor: 'black'
});
var timeText = new UI.TimeText({
  position: new Vector2(0, 2),
  size: new Vector2(144, 25),
  text: "%H:%M",
  font: 'bitham-30-black',
  color: 'white',
  textAlign: 'center'
});
var dateText = new UI.TimeText({
  position: new Vector2(0, 33),
  size: new Vector2(144, 40),
  text: "%a/%b/%d",
  font: 'gothic-14-bold',
  color: 'white',
  textAlign: 'center'
});
var image = new UI.Image({
  position: new Vector2(0, 0),
  size: new Vector2(144, 168),
  image: 'images/bike.png'
});
var textfield = new UI.Text({
 position: new Vector2(0, 47),
 size: new Vector2(144, 168),
 font: 'gothic-14',
 text: 'Fetching data...'
});

window.add(image);
window.add(bgRect);
window.add(timeText);
window.add(dateText);
window.add(textfield);
window.show();

ajax({url: URL,type: 'json'},
  function(data) {
    var hoursDry = 0;
    var hoursBike = 0;
    var minutesDry = 0;
    
    for(var i = 0; i < 60; i++){
      if (data.minutely.data[i].precipProbability < 0){
        minutesDry++;
      }
    }
    
    for(i = 0; i < 12; i++){
      if (data.hourly.data[i].precipProbability <= 0 && data.hourly.data[i].precipIntensity <= 0.02){
        hoursDry++;
      }
      else{
        break;
      }
    }
    
    for(i = 0; i < 12; i++){
      if (data.hourly.data[i].precipProbability < 10 && data.hourly.data[i].precipIntensity < 0.02){
        hoursBike++;
      }
      else{
        break;
      }
    }
    textfield.text("Dry next: " + hoursDry.toString() + "h\nBikable next: " + hoursBike.toString() + "h");
  },
  function(error) {
    textfield.text("Failed to fetch data");
  }
);