function conway(redstatus, bluestatus, greenstatus, redsum, greensum, bluesum){
    const RANGE = 3;
    redsum-= redstatus;
    bluesum-= bluestatus;
    greensum-= greenstatus;
    var redval=0;
    var blueval=0;
    var greenval=0;
    if (redstatus==1 && (redsum==3 || redsum==2)) redval=1;
    if (redstatus==1 && ((redsum<2) || (redsum>3))) redval=0;
    if (redstatus==0 && redsum==3) redval=1;
    if (bluestatus==1 && (bluesum==3 || bluesum==2)) blueval=1;
    if (bluestatus==1 && ((bluesum<2) || (bluesum>3))) blueval=0;
    if (bluestatus==0 && bluesum==3) blueval=1;
    if (greenstatus==1 && (greensum==3 || greensum==2)) greenval=1;
    if (greenstatus==1 && ((greensum<2) || (greensum>3))) greenval=0;
    if (greenstatus==0 && greensum==3) greenval=1;
    return [redval,blueval, greenval];
}

function equilibrium(redstatus, bluestatus, greenstatus, redsum, greensum, bluesum){
    const RANGE = 3;
    var redavg=redsum/((2*RANGE+1)**2);
    var blueavg=bluesum/((2*RANGE+1)**2);
    var greenavg=greensum/((2*RANGE+1)**2);
    var redval = 0;
    var blueval = 0;
    var greenval = 0;
    if (redavg > 0.33334 && blueavg < 0.5){ //mysterious number = 21/49
        redval=1;
    }
    else{
        redval=0;
    }
    if (blueavg > 0.33334 && greenavg < 0.5){
        blueval=1;
    }
    else{
        blueval=0;
    }
    if (greenavg > 0.33334 && redavg < 0.5){
        greenval=1;
    }
    else{
        greenval=0;
    }
    return [redval,greenval, blueval];
}

function cells(redstatus, bluestatus, greenstatus, redsum, greensum, bluesum, redsum2, greensum2, bluesum2){
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

    if( redavg >= 0.6 &&  redavg <= 0.8 ) { redchange += 0.1; }
    if( greenavg <= 0.5) { redchange += 0.1; }
    if( redavg2 < 0.5 && greenstatus<0.6) { greenchange += 0.1; }
    if( greenavg2 >= 0.7) { redchange += -0.1; }
    if(redavg<0.7 && redavg>0.6){greenchange += 0.1;}
    if(greenavg<0.7 && greenavg>0.6){redchange += 0.1;}
    if(redavg2>0.7&&redavg2<0.8){greenchange += 0.1;}
    if(redavg>0.7&&redavg<0.8){greenchange += -0.05;}
    if(greenavg2>0.25&&greenavg2<0.35){redchange += 0.1;}

    if(greenavg2>0.8 && greenstatus > 0.7){greenchange += -0.2;}
    if(redavg2>0.8 && redstatus > 0.7){redchange += -0.1;}

    if(redavg2<0.2 && redstatus > 0.2){redchange += 0.1;}
    if(greenavg2<0.2 && greenstatus > 0.2){greenchange += 0.1;}

    if(redavg > 0.3 && redavg < 0.4){redchange += 0.2;}
    return [redstatus+redchange,greenstatus+greenchange, bluestatus+bluechange];
    return [redstatus,greenstatus, bluestatus];
}
