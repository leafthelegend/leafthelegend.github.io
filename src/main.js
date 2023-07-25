"use strict";

import {GPU} from 'gpu.js';
import tooloud from 'tooloud';

function main(){

const gpu = new GPU();
console.log(gpu);

//set canvas width and height to document

const canvas = document.getElementById('canvas');

//TODO: make canvas loop

const ctx = canvas.getContext('2d');

const SCALE = 2;

canvas.width = Math.ceil(document.body.clientWidth/SCALE);
canvas.height = Math.ceil(document.body.clientHeight/SCALE);

var width = canvas.width;
var height = canvas.height;

const initial = gpu.createKernel(
    function() {
      var redval = Math.trunc(Math.random()*2)
      var blueval = Math.trunc(Math.random()*2)
      var greenval = Math.trunc(Math.random()*2)
      this.color(redval,greenval,blueval);
    },
    {useLegacyEncoder:true,output:[width, height],graphical:true});


function rule(redstatus, bluestatus, greenstatus, redsum, greensum, bluesum, redsum2, greensum2, bluesum2){
    const RANGE = 3;
    var redavg=redsum/((2*RANGE+1)**2);
    var greenavg=greensum/((2*RANGE+1)**2);
    var blueavg=bluesum/((2*RANGE+1)**2);
    const RANGE2 = 5;
    var redavg2=redsum2/((2*RANGE2+1)**2);
    var greenavg2=greensum2/((2*RANGE2+1)**2);
    var blueavg2=bluesum2/((2*RANGE2+1)**2);
    var redchange = 0;
    var greenchange = 0;
    var bluechange = 0;

    if( redavg >= 0.1 
        &&  redavg <= 0.2 ) { redchange = 0.1; }
        if( redavg >= 0.3 
        &&  redavg <= 0.4 ) { redchange = -0.1; }
        if( redavg2 >= 0.1 
        &&  redavg2 <= 0.2 ) { redchange = -0.1; }
        if( redavg2 >= 0.7 
        &&  redavg2 <= 0.8 ) { redchange = -0.1; }
        if( redavg >= 0.330 
        &&  redavg <= 0.350 ) { redchange = -0.1; }

    return [redstatus+redchange,greenstatus+greenchange, bluestatus+bluechange];
    return [redstatus,greenstatus, bluestatus];
}

gpu.addFunction(rule,{ argumentTypes: { redstatus: 'Number', bluestatus: 'Number', greenstatus: 'Number', redsum: 'Number', greensum: 'Number', bluesum: 'Number',redsum2: 'Number', greensum2: 'Number', bluesum2: 'Number'}, returnType: 'Array(3)' });

const render = gpu.createKernel(
    function(pixels, width, height) {
        const RANGE = 3;
        const RANGE2 = 5;
        let x = this.thread.x;
        let y = height - 1 - this.thread.y;
        let index = (x + y * width) * 4;
        //count live neighbors
        let redsum = 0;
        let bluesum = 0;
        let greensum = 0;
        for(var j=-RANGE;j<=RANGE;j++){
            for(var i=-RANGE;i<=RANGE;i++){
                var h = (x+i+width) % width;
                var k = (y+j+height) % height;
                redsum+=pixels[h*4+k*4*width]/255;
                bluesum+=pixels[h*4+k*4*width+2]/255;
                greensum+=pixels[h*4+k*4*width+1]/255;
          }
        }
        let redsum2 = 0;
        let bluesum2 = 0;
        let greensum2 = 0;
        for(var J=-RANGE2;J<=RANGE2;J++){
            for(var I=-RANGE2;I<=RANGE2;I++){
                var h = (x+I+width) % width;
                var k = (y+J+height) % height;
                redsum2+=pixels[h*4+k*4*width]/255;
                bluesum2+=pixels[h*4+k*4*width+2]/255;
                greensum2+=pixels[h*4+k*4*width+1]/255;
          }
        }
        var redstatus=pixels[index]/255;
        var bluestatus=pixels[index+2]/255;
        var greenstatus=pixels[index+1]/255;
        var [redval, greenval, blueval] = rule(redstatus, bluestatus, greenstatus, redsum, greensum, bluesum, redsum2, greensum2, bluesum2);
        this.color(redval,greenval,blueval);
    },
{useLegacyEncoder:true,output:[width, height],graphical:true});

initial();

var initPixels = initial.getPixels();


var data = ctx.getImageData(0,0,width,height).data;

const rNoise = tooloud.Perlin.create(Math.random()*100000).noise;
const gNoise = tooloud.Perlin.create(Math.random()*100000).noise;
const bNoise = tooloud.Perlin.create(Math.random()*100000).noise;

for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
        const index = (i + j * width) * 4;
        
        /*
        let x, y, z;

        Normalize:
        x = i / canvasWidth;
        y = j / canvasHeight;
        z = 0;
        // Fixing one of the coordinates turns 3D noise into 2D noise
        // Fixing two of the coordinates turns 3D noise into 1D noise
        // Fixed coordinate will serve as a seed, i.e. you'll get different results for different values
        
        // Scale:
        const scale = 10;
        x = scale * x;
        y = scale * y;
        */
        
        // In one go:
        const x = 30*(i / Math.max(width,height));
        const y = 30*(j / Math.max(width,height));         // You can use different scale values for each coordinate
        const z = 0;

        const r = Math.floor(255 * rNoise(x, y, z));
        const g = Math.floor(255 * gNoise(x, y, z));
        const b = Math.floor(255 * bNoise(x, y, z));

        data[index + 0] = r;            // R
        data[index + 1] = 0//g;            // G
        data[index + 2] = 0//b;            // B
        data[index + 3] = 255;          // A
    }
}

render(data,width,height)
ctx.drawImage(render.canvas,0,0);

// ctx.filter = "hue-rotate(120deg) brightness(2)"

var tapEvent = false;
var tapx = 0;
var tapy = 0;

canvas.addEventListener('touchstart', function(e) {
    tapEvent = true;
    console.log(e);
    let bcr = e.target.getBoundingClientRect();
    tapx = e.targetTouches[0].clientX - bcr.x;
    tapy = e.targetTouches[0].clientY - bcr.y;
    console.log(tapx,tapy);
    // e.preventDefault();
}, false);

canvas.addEventListener('touchmove', function(e) {
    if (e.touches.length!=1){
        return;
    }
    tapEvent = true;
    let bcr = e.target.getBoundingClientRect();
    tapx = e.targetTouches[0].clientX - bcr.x;
    tapy = e.targetTouches[0].clientY - bcr.y;
    data = processData(data);
    // e.preventDefault();
}, false);

canvas.addEventListener('mousedown', function(e) {
    tapEvent = true;
    tapx = e.offsetX;
    tapy = e.offsetY;
    data = processData(data);
    // e.preventDefault();
}, false);

canvas.addEventListener('mousemove', function(e) {
    if (e.buttons!=1){
        return;
    }
    console.log("mousemove")
    tapEvent = true;
    tapx = e.offsetX;
    tapy = e.offsetY;
    data = processData(data);
    // e.preventDefault();
}, false);

const TAPRANGE = 20;

function getCircleHeights(r){
    var heights = [];
    for(var j=-r;j<=r;j++){
        heights.push(Math.floor(Math.sqrt(r*r-j*j)));
    }
    return heights;
}

const TAPHEIGHTS = getCircleHeights(TAPRANGE);

function processData(data){
    if (tapEvent){
        tapEvent = false;
        let x = Math.ceil(tapx/SCALE);
        let y = Math.ceil(tapy/SCALE);
        for(var j=-TAPRANGE;j<=TAPRANGE;j++){
            for(var i=-TAPHEIGHTS[j+TAPRANGE];i<=TAPHEIGHTS[j+TAPRANGE];i++){
                var h = (x+i+width) % width;
                var k = (y+j+height) % height;
                data[h*4+k*4*width]+=255;
                data[h*4+k*4*width+2]+=0;
                data[h*4+k*4*width+1]+=0;
          }
        }
    }
    return data;
};

var hue = 0;

function setHue(elem, hue){
    elem.style.filter = "hue-rotate("+hue+"deg)";
    //webkit
    elem.style.webkitFilter = "hue-rotate("+hue+"deg)";
}

function animate(){
    hue += 0;
    hue %= 360;
    setHue(canvas,hue);
    render(data,width,height);
    data = render.getPixels();
    data = processData(data);
    ctx.drawImage(render.canvas,0,0);
    requestAnimationFrame(animate);
}

animate()

}

main();