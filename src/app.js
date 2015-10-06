/**
 * RGB-Pi Pebble Client
 * Resolution: 144x168
 */

var UI = require('ui');
var ajax = require('ajax');
var Vector2 = require('vector2');

var ip = '192.168.0.105';
var port = 4321;

var hueWidth = 90;
var svWidth = 24;
var spaceX = 10;
var spaceY = 9;
var height = 168-(2*spaceY);
var selectionHeight = 10;
var selectionPadding = 5;
var increment = (selectionHeight/height);

var hueSelected = true;
var selectionHue = 0.0;
var selectionSV = 0.5-(increment/2.0);


console.log(spaceX+' '+hueWidth+' '+spaceY+' '+svWidth);

var main = new UI.Window({ fullscreen: true });

//Hue bar
var hue = new UI.Image({
  position: new Vector2(spaceX, spaceY),
  size: new Vector2(hueWidth, height),
  image: 'images/hue.png'
});
main.add(hue);

//SV bar
var sv = new UI.Image({
  position: new Vector2(144-(spaceX+svWidth), spaceY),
  size: new Vector2(svWidth, height),
  image: 'images/sv.png'
});
main.add(sv);

//Selection
var cursor = new UI.Rect({
  position: new Vector2(spaceX-selectionPadding, spaceY+(selectionHue*height)),
  size: new Vector2(hueWidth+selectionPadding+selectionPadding, selectionHeight),
  backgroundColor: 'transparent',
  borderColor: 'white'
});
main.add(cursor);

main.show();


function send(msg) {
    var m = JSON.stringify(msg);
    console.log('sending: '+m);
    ajax({
      url: 'http://' + ip + ':' + port,
      method:'post',
      type: 'json',
      data: msg
    }, 
    function(response){
      console.log(JSON.stringify(response));
    },
    function(err){
      console.log(err);
    });
}

function sendSelection(){
  var h = (selectionHue/(1.0-increment)) * 360;
  var s = ((selectionSV < 0.5-(increment/2.0)) ? (selectionSV/(0.5-(increment/2.0))) : 1.0) * 100;
  var v = 100 - (selectionSV/(1.0-increment)) * 100;
  
  var cmd = {
    commands:
    [
      {
        type:'cc', 
        color:'{hsv:'+h+','+s+','+v+'}'
      }
    ]
  };
  send(cmd);
}

main.on('click', function(e) {
  if(e.button == 'select'){
    hueSelected = !hueSelected;
    if(hueSelected){
      cursor.position(new Vector2(spaceX-selectionPadding, spaceY+(selectionHue*height)));
      cursor.size(new Vector2(hueWidth+selectionPadding+selectionPadding, selectionHeight));
    }
    else{
      cursor.position(new Vector2(144-(spaceX*2-selectionPadding+svWidth), spaceY+(selectionSV*height)));
      cursor.size(new Vector2(svWidth+selectionPadding+selectionPadding, selectionHeight));
    }
  }
  else if(e.button == 'down'){
    if(hueSelected){
      selectionHue += increment;
      selectionHue = selectionHue > (1.0-increment) ? 1.0-increment : selectionHue;
      cursor.position(new Vector2(spaceX-selectionPadding, spaceY+(selectionHue*height)));
    }
    else{
      selectionSV += increment;
      selectionSV = selectionSV > (1.0-increment) ? 1.0-increment : selectionSV;
      cursor.position(new Vector2(144-(spaceX*2-selectionPadding+svWidth), spaceY+(selectionSV*height)));
    }
    
    sendSelection();
  }
  else if(e.button == 'up'){
    if(hueSelected){
      selectionHue -= increment;
      selectionHue = selectionHue < (0.0) ? 0.0 : selectionHue;
      cursor.position(new Vector2(spaceX-selectionPadding, spaceY+(selectionHue*height)));
    }
    else{
      selectionSV -= increment;
      selectionSV = selectionSV < (0.0) ? 0.0 : selectionSV;
      cursor.position(new Vector2(144-(spaceX*2-selectionPadding+svWidth), spaceY+(selectionSV*height)));
    }
    
    sendSelection();
  }
  
  /*
  console.log('Button ' + e.button + ' pressed start.');
  send({
    commands:
    [
      {
        type:'cc', 
        color:'{r:0-1,0-1,0-1}'
      }
    ]
  });
  console.log('Button ' + e.button + ' pressed end.');
  */
});