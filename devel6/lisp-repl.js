/***** Javascript Lisp REPL Devel *****/

/* requires "tools.js" */
/* requires "lisp.js" */

$("form").onsubmit = function (){
  var input = $("input").value;
  addHist(input);
  
  outputln("JS-LISP> " + input);
  resetInput();
  
  try {
    outputln(Lisp.process(input));
  } catch (e){
    outputln(e);
  }
  
  return false;
};

$("form").setAttribute("action", "javascript:" +
"outputln('JS-LISP> ' + $('input').value);" +
"resetInput();" +
"outputln('Error: unknown (timeout?)'); ");

$("input").onkeydown = function (e){
  return checkHist(this, e);
};

function output(data){
  $("results").innerHTML += escapeHTML(data);
  $("page").scrollTop = $("page").scrollHeight;
}

function outputln(data){
  $("results").innerHTML += escapeHTML(data) + "<br>";
  $("page").scrollTop = $("page").scrollHeight;
}

function escapeHTML(data){
  data = String(data);
  data = data.replace(/</g, "&lt");
  data = data.replace(/>/g, "&gt");
  data = data.replace(/\n/g, "<br>");
  return data;
}

Lisp.setStdout(output);

//Lisp.file("/codes/apps/lisp-repl/devel6/lisp-test.lisp");

function resetInput(){
  $("input").value = "";
}

var inhist = [];
var histpos = 0;
function addHist(input){
  inhist.push(input);
  histpos = inhist.length;
}

function checkHist(field, event){
  var code = (event.key == undefined)?event.keyCode:event.key;
  if ((code == "Up" || code == 38) && (histpos-1) > -1){ // up key
    histpos = histpos-1;
    field.value = inhist[histpos];
    return false;
  }
  if ((code == "Down" || code == 40) && (histpos+1) <= inhist.length){ // down
    histpos = histpos+1;
    field.value = (histpos < inhist.length)?inhist[histpos]:"";
    return false;
  }
  return true;
}
