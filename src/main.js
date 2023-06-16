import {GPU} from 'gpu.js';
const gpu = new GPU();

//set canvas width and height to document

const canvas = document.getElementById('canvas');

const ctx = canvas.getContext('2d');

canvas.width = document.body.clientWidth;
canvas.height = document.body.clientHeight;

width = canvas.width;
height = canvas.height;

const initial = gpu.createKernel(
    function() {
      var val = Math.trunc(Math.random()*2)
      this.color(val,val,val);
    },
    {useLegacyEncoder:true,output:[width, height],graphical:true});

const render = gpu.createKernel(
    function(pixels, width, height) {
        let x = this.thread.x;
        let y = height - 1 - this.thread.y;
        let index = (x + y * width) * 4;
        //count live neighbors
        let sum = 0;
        for(var j=-1;j<=1;j++){
            for(var i=-1;i<=1;i++){
                var h = (x+i+width) % width;
                var k = (y+j+height) % height;
                sum+=pixels[h*4+k*4*width]!=0?1:0;
          }
        }
        var status=pixels[index]!=0?1:0;
        sum-= status;
        var val=0;
        if (status==1 && (sum==3 || sum==2)) val=1;
        if (status==1 && ((sum<2) || (sum>3))) val=0;
        if (status==0 && sum==3) val=1;
        this.color(val, val, val, 1);
    },
{useLegacyEncoder:true,output:[width, height],graphical:true});

initial();

initPixels = initial.getPixels();
render(initPixels,width,height)


function animate(){
    render(render.getPixels(),width, height)
    ctx.drawImage(render.canvas,0,0);
    requestAnimationFrame(animate)
}

animate()
