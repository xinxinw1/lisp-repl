/***** Lisp REPL *****/

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

out("Welcome to Xin-Xin's Javascript Lisp! Here are some example commands you can run: \n\n"
    + "(+ 2 2)\n"
    + "=> 4\n\n"
    + "(map [+ _ 1] '(1 2 3))\n"
    + "=> (2 3 4)\n\n"
    + "(def fact (n)\n"
    + "  (if (is n 0) 1\n"
    + "      (* n (fact (- n 1)))))\n"
    + "=> <fn fact (n)>\n"
    + "(fact 5)\n"
    + "=> 120\n\n");
outNoEsc("This project is on Github at <a href=\"https://github.com/xinxinw1/lisp-repl\">https://github.com/xinxinw1/lisp-repl</a>\n"
    + "and you can find more examples there as well.\n");

function run(a){
  his.add(a);
  out("JS-LISP> " + a);
  rst();
  
  time(function (){
    try {
      out(L.evls(a));
    } catch (e){
      // taken care of by efn(e)
      console.log(e);
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

function outNoEsc(a){
  atth(res, a + "<br>");
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

