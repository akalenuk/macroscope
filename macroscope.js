    // переопределение функций из Math.
    var abs=Math.abs;
    var acos=Math.acos;
    var asin=Math.asin;
    var atan=Math.atan;
    var ceil=Math.ceil;
    var cos=Math.cos;
    var exp=Math.exp;
    var floor=Math.floor;
    var log=Math.log;
    var max=Math.max;
    var min=Math.min;
    var pow=Math.pow;
    var random=Math.random;
    var round=Math.round;
    var sin=Math.sin;
    var sqrt=Math.sqrt;
    var tan=Math.tan;
    var PI=Math.PI;

    function sign(x){
        return x>=0?(x==0?0:1):-1;
    }
    var eps=pow(2, -30);

    var m=1;                var om;
    var dx=0;               var odx;
    var dy=0;               var ody;
    var do_tan=true;        var odo_tan;   
    var do_formula=false;   var odo_formula;
    var do_text=true;       var odo_text;

    var x;
    var y;

    // получение аргументов
    var args=(window.location).toString().split('?');
    var func='';
    if(args.length>1){
        func=args[1];
        for(var i=2; i<args.length; i++){
            func=func+'?'+args[i];
        }
    }
    func=func.split('%3C').join('<');
    func=func.split('%3E').join('>');
    eval(func); // чтение аргументов
    om=m;
    odx=dx;
    ody=dy;
    odo_tan=do_tan;
    odo_formula=do_formula;
    odo_text=do_text;


    // отделение функции от аргументов
    var fs=func.lastIndexOf('y=');
    if(fs==-1){
        fs=func.lastIndexOf('y =');
    }
    if(fs>0){
        func=func.substr(fs, func.length-fs);
    }



    // функции "свертки"
    function screen_to_real(i){
        if(do_tan){
            return m*Math.tan((i-256)*Math.PI/512);
        }else{
            return (i-256)/256*m;
        }
    }

    function real_to_screen(x){
        if(do_tan){
            return Math.atan(x/m)/Math.PI*512+256;
        }else{
            return 256+x*256/m;
        }
    }



    // функции поиска
    function find_extremum(){
        var xs=new Array();
        var ys=new Array();
        var dys=new Array();
        var om=m;   // запоминание масштаба
        var any_found=false;    // определяет, найден ли экстремум вообще 

        while(m>=0.000001){ // точность на один шаг больше, так как на каждой итерации точность увеличивается на два порядка, а не на один (можно "проскочить")
            for(var j=1; j<512; j++){   // составление карты разностей
                xs[j]=screen_to_real(j)+dx;
                x=xs[j];
                ys[j]=eval(func);
                x=xs[j]+eps;
                dys[j]=(eval(func)-ys[j])/eps;
            }
            var found=false;    // определяет, найден ли экстремум на этой итерации
            var dist;
            var ndx;
            for(var j=1; j<511; j++){   // поиск по карте разностей
                if(sign(dys[j])!=sign(dys[j+1])){
                    if(!found){
                        found=true;
                        dist=abs(dx-xs[j]);
                        ndx=xs[j];
                    }else{
                        if(abs(dx-xs[j])<dist){
                            dist=abs(dx-xs[j]);
                            ndx=xs[j];
                        }
                    }
                }
            }
            if(found){
                dx=ndx;
                any_found=true;
                m=m/100;
            }else{
                break;
            }
        }

        if(any_found){  // если найден хоть на каком-то приближении
            x=dx;
            var y=eval(func);
            if(!isNaN(y)){
                dy=y;
            }
        }
        m=om;
    }

    function find_root(){
        var xs=new Array();
        var ys=new Array();
        var dys=new Array();
        var om=m;   // запоминание масштаба
        var any_found=false;    // определяет, найден ли корень вообще 

        while(m>=0.000001){
            for(var j=1; j<512; j++){   // составление карты разностей
                xs[j]=screen_to_real(j)+dx;
                x=xs[j];
                ys[j]=eval(func);
                x=xs[j]+eps;
                dys[j]=(eval(func)-ys[j])/eps;
            }
            var found=false;    // определяет, найден ли корень на этой итерации
            var dist;
            var ndx;
            for(var j=1; j<511; j++){   // поиск по карте разностей
                if(sign(ys[j])!=sign(ys[j+1]) && sign(dys[j])==sign(ys[j+1]-ys[j]) ){
                    if(!found){
                        found=true;
                        dist=abs(dx-xs[j]);
                        ndx=xs[j];
                    }else{
                        if(abs(dx-xs[j])<dist){
                            dist=abs(dx-xs[j]);
                            ndx=xs[j];
                        }
                    }
                }
            }
            if(found){
                dx=ndx;
                any_found=true;
                m=m/100;
            }else{
                break;
            }
        }

        if(any_found){  // если найден хоть на каком-то приближении
            x=dx;
            var y=eval(func);
            if(!isNaN(y)){
                dy=y;
            }
        }
        m=om;
    }

    function find_root_iterative(){
        var xi=screen_to_real(255.5)+dx;

        x=xi;
        var d=eval(func);
        x=xi+0.0001;
        d=d-eval(func);
        if(d>0){
            for(var i=0; i<100; i++){
                x=xi;
                xi=eval(func+"+x");
            }
        }else{
            for(var i=0; i<100; i++){
                x=xi;
                xi=eval("-("+func+")+x");
            }
        }
        dx=xi;
        dy=0;
    }

    
    var teca = document.getElementById("teca");
    var teca_context = teca.getContext("2d");      

    teca.addEventListener('mousedown', function(e){
        if(e.button==0){
            if(e.shiftKey && !e.ctrlKey){
                dx=dx+screen_to_real(e.clientX);
                dy=dy+screen_to_real(512-e.clientY);
            }
            if(!e.shiftKey && e.ctrlKey){
                if(e.clientY>=256){
                    if(m>0.00001){
                        m=m/10;
                    }
                }else if(e.clientY<256){
                    if(m<100000){
                        m=m*10;
                    }
                }
            }
        }
        draw();
    }, false);

    document.addEventListener('keydown', function(e){
        if(e.keyCode==83){  // подстройка под функцию
            x=dx;
            var y=eval(func);
            if(!isNaN(y)){
                dy=y;
            }
        }else if(e.keyCode==68){    // сброс настроек
            m=om;
            dx=odx;
            dy=ody;
            do_tan=odo_tan;
            do_formula=odo_formula;
        }else if(e.keyCode==87){    // w - wrap/no wrap
            do_tan=!do_tan;
        }else if(e.keyCode==69){    // e - extremum
            find_extremum();
        }else if(e.keyCode==73){    // i - iterative solve test like '\'
            find_root_iterative();
        }else if(e.keyCode==82){    // r - root
            find_root();
        }else if(e.keyCode==70){    // f - formula
            do_formula=!do_formula;
        }else if(e.keyCode==84){    // t - text
            do_text=!do_text;
        }//else alert(e.keyCode);
        draw();
    }, false);


    function F6(x){ // форматирование
        var no1=ceil(pow(10,6)*x)/pow(10,6);
        var no2=floor(pow(10,6)*x)/pow(10,6);
        return no1.toString().length<no2.toString().length?no1:no2;
    }

    function write(s, x, y){
        try{
            teca_context.fillText(s, x, y);
        }catch(e){
            teca_context.translate(x,y);
            teca_context.mozDrawText(s);
            teca_context.translate(-x,-y);
        }
    }


    function draw(){    // отрисовка всего вообще
        // фон
        teca.width = teca.width;    // вместо очистки
        teca_context.fillStyle='#EEEEEE';
        teca_context.fillRect(0, 0, 512, 512);
        var tens=[-10000000, -1000000, -100000, -10000, -1000, -100, -10, -1, 0, 1, 10, 100, 1000, 10000, 100000, 1000000, 10000000];
        for(var i=1; i<tens.length; i++){
            for(var j=1; j<tens.length; j++){
                if((i+j)%2==0){
                    var x1=real_to_screen(tens[j-1]-dx)-0.5;
                    var x2=real_to_screen(tens[j]-dx)-0.5;
                    var y1=512-real_to_screen(tens[i-1]-dy)-0.5;
                    var y2=512-real_to_screen(tens[i]-dy)-0.5;
                    teca_context.fillStyle='#DDDDDD';
                    teca_context.fillRect(x1, y1, x2-x1, y2-y1);                
                }
            }
        }
        
        // крест
        teca_context.beginPath();
        for(var i=0; i<100; i++){
            teca_context.moveTo(512*i/100+1,255.5);
            teca_context.lineTo(512*i/100+3,255.5);
            teca_context.moveTo(255.5, 512*i/100+1);
            teca_context.lineTo(255.5, 512*i/100+3);
        }
        teca_context.strokeStyle="#666666 dotted";
        teca_context.stroke();

        // стрелочки
        var cx=floor(real_to_screen(0-dx))-0.5;
        var cy=floor(real_to_screen(0+dy))-0.5;
        teca_context.beginPath();
        teca_context.moveTo(0,cy);
        teca_context.lineTo(512,cy);
        teca_context.lineTo(512-16,cy-4);
        teca_context.lineTo(512,cy);
        teca_context.lineTo(512-16,cy+4);
        teca_context.moveTo(cx, 512);
        teca_context.lineTo(cx, 0);
        teca_context.lineTo(cx-4, 0+16);
        teca_context.lineTo(cx, 0);
        teca_context.lineTo(cx+4, 0+16);
        teca_context.strokeStyle="#000000";
        teca_context.stroke();

        if(func==''){
            teca_context.strokeStyle="#AAAAAA";
            teca_context.stroke();
            teca_context.fillStyle='#000000';
            teca_context.font = 'sans-serif';
            write('No parameters given.',10,20);
            write('try .../macroscope.html?y=exp(x)',10,40);
            write('also .../macroscope.html?m=5;y=exp(x)',10,70);
            write('.../macroscope.html?dx=1;dy=1;y=exp(x)',46,90);
            write('.../macroscope.html?do_tan=false;y=exp(x)',46,110);
            write('.../macroscope.html?do_formula=true;y=exp(x)',46,130);
            write('and clicking on this sheet with "Ctrl" or "Shift" down.',46,150);
            write('Plus some keys:',10,180);
            write('"w" is for "wrap/unwrap";',46,200);
            write('"e" is for "extremum";',46,220);
            write('"r" is for "root";',46,240);
            write('"t" is for "text on screen";',46,260);
            write('"s" is for "snap to function";',46,280);
            write('"d" is for "default";',46,300);
            write('"f" is for "function on screen".',46,320);
            write('Have fun!',10,340);
        }else{
            // функция
            teca_context.beginPath();
            for(var j=0; j<512;j+=1){
                x=screen_to_real(j)+dx;
                y=eval(func)-dy;

                var i=512-real_to_screen(y);
                if(i==Infinity){
                    i=0;
                }
                if(i==-Infinity){
                    i=511;
                }
                try{
                    if(j==0){
                        teca_context.moveTo(j-0.5, i-0.5);
                    }else{
                        teca_context.lineTo(j-0.5, i-0.5);
                    }
                }catch(e){
                    teca_context.moveTo(j-0.5, 0);
                }

            }
            if(do_tan){
                teca_context.strokeStyle="#CC2211";
            }else{
                teca_context.strokeStyle="#1122CC";
            }
            teca_context.stroke();
        }

        // подписи        
        teca_context.font = 'sans-serif';
        function write_coordinates(ldx, ldy){
            if(do_text){
                if(dx!=0 || dy!=0){
                    write('( '+F6(dx)+' ; '+F6(dy)+' )', 260+ldy, 270+ldy);
                }
                if(m!=1){
                    write(F6(m)+'x', 260+ldx, 250+ldy);
                }
                if(func!='' && do_formula){
                    write(func, 10+ldx, 20+ldy);
                }
            }
        }

        teca_context.fillStyle='#EEEEEE';
        write_coordinates( 1,0);
        write_coordinates(-1,0);
        write_coordinates(0, 1);
        write_coordinates(0,-1);
        teca_context.fillStyle='#444444';
        write_coordinates(0,0);

    }


    draw();
