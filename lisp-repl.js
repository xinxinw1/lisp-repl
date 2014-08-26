/***** Lisp REPL Devel *****/

/* require tools >= 3.0 */
/* require lisp-parse */
/* require lisp-tools */
/* require lisp-exec */
/* require lisp-compile-basic */

var udfp = $.udfp;
var dmp = $.dmp;
var len = $.len;
var inp = $.inp;
var psh = $.psh;
var rpl = $.rpl;
var satt = $.satt;
var bot = $.bot;
var atth = $.atth;
var cmb = $.cmb;
var sefn = $.sefn;

var frm = $("form");
var it = $("input");
var res = $("results");
var pg = $("page");

function run(a){
  his(a);
  out("JS-LISP> " + a);
  rst();
  
  try {
    out(L.evls(a));
  } catch (e){
    // taken care of by efn(e)
    out(dmp(e));
  }
}

function ou(a){
  atth(esc(a), res);
  bot(pg);
}

function out(a){
  atth(esc(a) + "<br>", res);
  bot(pg);
}

function esc(a){
  return rpl(["<", ">", "\n"],
             ["&lt", "&gt", "<br>"], a);
}

function rst(){
  it.value = "";
}

frm.onsubmit = function (){
  run(it.value);
  return false;
};

satt(frm, "action",
  "javascript:" +
    "out('JS-LISP> ' + it.value);" +
    "rst();" +
    "out('Error: unknown (timeout?)'); ");

L.jn("*out*", function (a){
  ou(L.rp(L.str(a)));
  return [];
});

sefn(cmb(out, dmp));

L.evlf("lib/lisp-compile-basic.lisp");

//L.exe(get("/codes/apps/lisp-repl/devel7/lisp-test.lisp"));

var hs = [];
var p = 0;
var tmp = "";

function his(a){
  psh(a, hs);
  p = len(hs);
}

function pre(){
  if (p > 0){
    if (p == len(hs))tmp = it.value;
    p--;
    it.value = hs[p];
  }
}

function nex(){
  if (p <= len(hs)-1){
    p++;
    it.value = (p == len(hs))?tmp:hs[p];
  }
}

it.onkeydown = function (e){
  var c = udfp(e.key)?e.keyCode:e.key;
  if (inp(c, "Up", 38)){
    pre();
    return false;
  }
  if (inp(c, "Down", 40)){
    nex();
    return false;
  }
  return true;
};
