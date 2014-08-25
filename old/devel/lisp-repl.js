/***** Javascript Lisp REPL Devel *****/

/* requires "tools.js" */
/* requires "lisp.js" */

$("form").onsubmit = function (){
  var input = $("input").value;
  addHist(input);
  
  output("JS-LISP> " + input + "<br>");
  resetInput();
  
  try {
    output(Lisp.process(input) + "<br>");
  } catch (e){
    output(e + "<br>");
  }
  
  return false;
};

$("form").setAttribute("action", "javascript:" +
"output('JS-LISP> ' + $('input').value + '<br>');" +
"resetInput();" +
"output('Error: unknown (timeout?)' + '<br>'); ");

$("input").onkeydown = function (e){
  return checkHist(this, e);
};

function output(data){
  $("results").innerHTML += data;
  $("page").scrollTop = $("page").scrollHeight;
}

Lisp.setStdout(function (a){
  output(a.replace(/\n/g, "<br>"));
});

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
