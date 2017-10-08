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
    canvas.addEventListener("touchmove",touchmove);
    canvas.addEventListener("touchstart",touchdown);
    canvas.addEventListener("touchend",touchup);
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

function resizeImage(imageData,targetWidth,targetHeight,criticalParam,callback){
    var canvas = document.createElement("canvas");
    var context = canvas.getContext('2d');
    var ratio;
    if(criticalParam){
        switch (criticalParam){
            case "width":
                ratio = targetWidth/imageData.width;
                targetHeight = imageData.height*ratio;
                break;
            case "height":
                ratio = targetHeight/imageData.height;
                targetWidth = imageData.width*ratio;
                break;
        }
    }
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    context.drawImage(imageData.imageObj,0,0,imageData.width,imageData.height,0,0,targetWidth,targetHeight);
    var resultStr = canvas.toDataURL();
    canvas.remove();
    var image = new Image();
    image.onload = callback;
    image.src = resultStr;
    return image;
}

function cropImage(imageData,callback){
    // width * height > 16777216
    // sqrt(16777216) = 4096
    if(imageData.height>4096){
        var image = resizeImage(imageData,4096,4096,"height",function(){
            var obj = {width:image.width,height:image.height,diff:image.width%image.height,imageObj:image};
            cropImage(obj,callback);
        });
    }else {
        var cropedImages = [];
        var canvas = document.createElement("canvas");
        var context = canvas.getContext('2d');
        canvas.width = imageData.height;
        canvas.height = imageData.height;
        for (var i = 0; i < (imageData.width - imageData.diff) / imageData.height; i++) {
            context.drawImage(imageData.imageObj, imageData.height * i + xOffset, 0, imageData.height, imageData.height, 0, 0, imageData.height, imageData.height);
            cropedImages.push(canvas.toDataURL());
            context.clearRect(0, 0, imageData.height, imageData.height);
        }
        canvas.remove();
        callback(cropedImages);
    }
}

function generateImages(imageData){
    cropImage(imageData,function(cropedImages){
        var scaleRatio = document.getElementById("canvas").clientWidth/imageData.width;
        document.getElementById("links").innerHTML = "";
        for(var i=0;i<cropedImages.length;i++){
            var img = document.createElement("img");
            img.width = imageData.height*scaleRatio;
            img.src = cropedImages[i];
            // link.appendChild(img);
            document.getElementById("links").appendChild(img);
        }
        var div = document.createElement("div");
        div.className = "hits-block";
        var linkText = document.createTextNode("Long press to download images");
        div.appendChild(linkText);
        document.getElementById("links").appendChild(div);
    });
}

function touchmove(e){
    if(lastDimen!=null){
        var touch;
        if (e.changedTouches.length >= 1)
            touch = e.changedTouches.item(0);
        var dX = touch.clientX-lastDimen.x;
        var dY = touch.clientY-lastDimen.y;
        xOffset += dX;
        yOffset += dY;
        xOffset = xOffset>0?xOffset<global.imageData.diff?xOffset:global.imageData.diff:0;
        lastDimen = {x:touch.clientX,y:touch.clientY};
        drawCanvas(
            global.canvas.element,
            global.canvas.context,
            global.imageData,
            document.getElementById("canvas").clientWidth,
            true
        );
    }
}

function touchdown(e){
    if(global.imageData){
        var touch;
        if (e.changedTouches.length >= 1)
            touch = e.changedTouches.item(0);
        lastDimen = {x:touch.clientX,y:touch.clientY};
    }
}

function touchup(e){
    lastDimen = null;
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
            document.getElementById("canvas").clientWidth,
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