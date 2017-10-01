/**
 * Created by lindaltc on 27/9/2017.
 */
var global = {};

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
    Object.assign(global,{canvas:{element:canvas,context:context}});
}

// document.getElementById('file-input')
//     .addEventListener('change', readSingleFile, false);