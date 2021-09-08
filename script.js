// function getAlpha(){
// 	var input = document.getElementById("Alpha").value;
// 	//alert(input);
// 	return input;}

// function getTreshold(){
// 	var input = document.getElementById("treshold").value;
// 	//alert(input);
// 	return input;}
function getSlice(){
    var input = document.getElementById("slice").value;
    return input;
}

function getSingle(){
    if (document.getElementById("single").checked){
        document.getElementById("sliceName").hidden = false;
        document.getElementById("slice").hidden = false;

    } else {
        document.getElementById("sliceName").hidden = true;
        document.getElementById("slice").hidden = true;
    }
}
function changeShader(name){
    loadShaders(name);
}