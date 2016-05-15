/***** Lisp REPL Devel *****/

/* require tools >= 3.0 */
/* require ajax */
/* require prec-math */
/* require lisp-tools */
/* require lisp-parse */
/* require lisp-exec */
/* require lisp-core */
/* require lisp-compile-basic */

var udfp = $.udfp;
var dmp = $.dmp;
var len = $.len;
var inp = $.inp;
var psh = $.psh;
var rpl = $.rpl;
var satr = $.satr;
var bot = $.bot;
var atth = $.atth;
var cmb = $.cmb;
var sefn = $.sefn;

var frm = $("form");
var it = $("input");
var res = $("results");
var pg = $("page");

var his = $.his(it);

function run(a){
  his.add(a);
  out("JS-LISP> " + a);
  rst();
  
  time(function (){
    try {
      out(L.evls(a));
    } catch (e){
      // taken care of by efn(e)
      out(e.message);
    }
  });
}

function ou(a){
  atth(res, esc(a));
  bot(pg);
}

function out(a){
  atth(res, esc(a) + "<br>");
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

satr(frm, "action",
  "javascript:" +
    "out('JS-LISP> ' + it.value);" +
    "rst();" +
    "out('Error: unknown (timeout?)'); ");

L.djn("*out*", function (a){
  ou(L.dat(L.str(a)));
  return L.nil();
});

function settime(a){
  $("time").innerHTML = a;
}

function time(a){
  settime($.tim(a));
}

//sefn(cmb(out, dmp));

/*time(function (){
  L.evlf($.libdir + "/lisp-format/lisp-format.lisp");
  L.evlf($.libdir + "/lisp-compile-basic/lisp-compile-basic.lisp");
});*/

//L.exe(get("/codes/apps/lisp-repl/devel7/lisp-test.lisp"));

