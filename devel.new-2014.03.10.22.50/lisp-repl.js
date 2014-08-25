/***** Javascript Lisp REPL Devel *****/

/* require tools >= 3.0 */
/* require lisp-parse */
/* require lisp-disp */
/* require lisp-exec */

var udefp = $.udefp;
var rpl = $.rpl;

$("form").onsubmit = function (){
  var input = $("input").value;
  addHist(input);
  
  outln("JS-LISP> " + input);
  resetInput();
  
  try {
    outln(Lisp.exec(input));
  } catch (e){
    outln(e);
  }
  
  return false;
};

$("form").setAttribute("action", "javascript:" +
"outln('JS-LISP> ' + $('input').value);" +
"resetInput();" +
"outln('Error: unknown (timeout?)'); ");

$("input").onkeydown = function (e){
  return checkHist(this, e);
};

function out(data){
  $("results").innerHTML += escapeHTML(data);
  $("page").scrollTop = $("page").scrollHeight;
}

function outln(data){
  $("results").innerHTML += escapeHTML(data) + "<br>";
  $("page").scrollTop = $("page").scrollHeight;
}

function escapeHTML(data){
  return rpl(["<", ">", "\n"], ["&lt", "&gt", "<br>"], String(data));
}

//Lisp.setout(out);

//Lisp.file("/codes/apps/lisp-repl/devel7/lisp-test.lisp");

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
  var code = udefp(event.key)?event.keyCode:event.key;
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
