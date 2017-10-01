/**
 * Created by lindaltc on 27/9/2017.
 */
var global = {};
var lastDimen = null;
var xOffset = 0,yOffset = 0;

function joinGlobal(param){
    Object.assign(global,param);
    return global;
}

var onReadFileDone = function(){};
function readFile(e) {
    var file = e.target.files[0];
    if (!file) {
        return;
    }
    var reader = new FileReader();
    reader.onload = function(e) {
        var contents = e.target.result;
        // displayContents(contents);
        onReadFileDone(e.target.result);
        // Object.assign(global,{image:e});
    };
    reader.readAsDataURL(file);
}

function getImageFromDataURL(data,onload){
    var imageObj = new Image();
    imageObj.onload = onload;
    imageObj.src = data;
    return imageObj;
}

function displayContents(contents) {
    // var element = document.getElementById('file-content');
    // element.textContent = contents;
    console.log(contents);
}

function bindFileReaderListener(id,onReadFileDone){
    document.getElementById('file-input').addEventListener('change', readFile, false);
    this.onReadFileDone = onReadFileDone;
}

function initCanvas(id){
    var canvas = document.getElementById(id),
        context = canvas.getContext('2d');
    Object.assign(global,
        {
            canvas:{
                element:canvas,
                context:context,
                dimen:{
                    x:canvas.getBoundingClientRect().x,
                    y:canvas.getBoundingClientRect().y
                }
            }
        });
    canvas.addEventListener("mousemove",mousemove);
    canvas.addEventListener("mousedown",mousedown);
    canvas.addEventListener("mouseup",mouseup);
}

function drawCanvas(canvas,context,imageData,maxWidth,drawLine){
    var scaleRatio = maxWidth/imageData.width;
    var scaleWidth = maxWidth;
    var scaleHeight = imageData.height*scaleRatio;

    // var scaleDiff = imageData.diff*scaleRatio;
    canvas.width = scaleWidth;
    canvas.height = scaleHeight;
    context.drawImage(imageData.imageObj,0,0,scaleWidth,scaleHeight);

    if(drawLine){
        for (var i = 0; i <= (imageData.width - imageData.diff) / imageData.height; i++) {
            if(i==0){
                context.fillStyle = 'rgba(255, 255, 255, 0.6)';
                context.fillRect(0,0,(imageData.height * i+xOffset) * scaleRatio,scaleHeight);
            }else if(i == (imageData.width - imageData.diff) / imageData.height){
                context.fillStyle = 'rgba(255, 255, 255, 0.6)';
                context.fillRect((imageData.height * i+xOffset) * scaleRatio,0,(imageData.width-imageData.height * i+xOffset) * scaleRatio,scaleHeight);
            }else{
                context.beginPath();
                context.strokeStyle = "white";
                context.moveTo((imageData.height * i+xOffset) * scaleRatio, 0);
                context.lineTo((imageData.height * i+xOffset) * scaleRatio, scaleHeight);
                context.stroke();
            }
        }
    }
}

function generateImages(imageData,maxWidth){
    var scaleRatio = maxWidth/imageData.width;
    var ocanvas = document.createElement("canvas");
    ocanvas.width = imageData.width;
    ocanvas.height = imageData.height;
    var ocontext = ocanvas.getContext('2d');
    ocontext.drawImage(imageData.imageObj,0,0,imageData.width,imageData.height);

    var pcanvas = document.createElement("canvas");
    pcanvas.width = imageData.height;
    pcanvas.height = imageData.height;
    var pcontext = pcanvas.getContext('2d');
    document.getElementById("links").innerHTML = "";
    for(var i=0;i<(imageData.width-imageData.diff)/imageData.height;i++){
        var data = ocontext.getImageData(imageData.height*i+xOffset,0,imageData.height,imageData.height);
        pcontext.putImageData(data,0,0);

        if(!detectmob()){
            var link = document.createElement("a");
            if(document.getElementById("file_prefix").value!="")
                link.download = document.getElementById("file_prefix").value+"_"+i+"_"+ new Date().getTime()+ ".png";
            else
                link.download = "image_"+i+"_"+ new Date().getTime()+ ".png";
            link.href = pcanvas.toDataURL();
            link.click();
            link.remove();
        }else{
            var link = document.createElement("a");
            if(document.getElementById("file_prefix").value!="")
                link.download = document.getElementById("file_prefix").value+"_"+i+"_"+ new Date().getTime()+ ".png";
            else
                link.download = "image_"+i+"_"+ new Date().getTime()+ ".png";
            link.href = pcanvas.toDataURL();

            var img = document.createElement("img");
            img.width = imageData.height*scaleRatio;
            img.src = pcanvas.toDataURL();
            link.appendChild(img);
            document.getElementById("links").appendChild(link);
        }

        // var linkText = document.createTextNode(link.download);
        // link.appendChild(linkText);
        // document.getElementById("links").appendChild(link);
    }
}

function mousemove(e){
    if(lastDimen!=null){
        var dX = e.clientX-lastDimen.x;
        var dY = e.clientY-lastDimen.y;
        xOffset += dX;
        yOffset += dY;
        xOffset = xOffset>0?xOffset<global.imageData.diff?xOffset:global.imageData.diff:0;

        lastDimen = {x:e.clientX,y:e.clientY};
        drawCanvas(
            global.canvas.element,
            global.canvas.context,
            global.imageData,
            detectmob()?500:1000,
            true
        );
    }
}

function mousedown(e){
    if(global.imageData)
        lastDimen = {x:e.clientX,y:e.clientY};
}

function mouseup(e){
    lastDimen = null;
}

function detectmob() {
    if( navigator.userAgent.match(/Android/i)
        || navigator.userAgent.match(/webOS/i)
        || navigator.userAgent.match(/iPhone/i)
        || navigator.userAgent.match(/iPad/i)
        || navigator.userAgent.match(/iPod/i)
        || navigator.userAgent.match(/BlackBerry/i)
        || navigator.userAgent.match(/Windows Phone/i)
    ){
        return true;
    }
    else {
        return false;
    }
}

// document.getElementById('file-input')
//     .addEventListener('change', readSingleFile, false);