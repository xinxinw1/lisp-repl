/***** Lisp Parser Devel *****/

/* require tools >= 3.1 */
/* require lisp-tools */

(function (win, udf){
  ////// Import //////
  
  var udfp = $.udfp;
  //var is = $.is;
  var has = $.has;
  var rpl = $.rpl;
  var len = $.len;
  var sli = $.sli;
  var beg = $.beg;
  var end = $.end;
  var mid = $.mid;
  var att = $.att;
  var mat = $.mat;
  var err = $.err;
  var app = $.app;
  var emp = $.emp;
  var inp = $.inp;
  
  var typ = L.typ;
  var tag = L.tag;
  var rep = L.rep;
  var dat = L.dat;
  
  var cons = L.cons;
  var car = L.car;
  var cdr = L.cdr;
  var nil = L.nil;
  var nrev = L.nrev;
  
  var lis = L.lis;
  
  var nilp = L.nilp;
  var symp = L.symp;
  
  var is = L.is;
  
  var sy = L.sy;
  var nu = L.nu;
  var st = L.st;
  var rx = L.rx;
  
  var isa = L.isa;
  
  var spl = L.spl;
  
  ////// Types //////
  
  // r = result; a lisp obj
  // l = length; a js int
  function ps(r, l, o){
    var b = {type: "ps", res: r, len: l};
    if (udfp(o))return b;
    return app(o, b);
  }
  
  function wh(l){
    return {type: "wh", len: l};
  }
  
  // end of file/string
  function ef(){
    return {type: "ef"};
  }
  
  // ending bracket
  function eb(b, l){
    return {type: "eb", bra: b, len: l};
  }
  
  function gres(a){
    return a.res;
  }
  
  function glen(a){
    return a.len;
  }
  
  function gbra(a){
    return a.bra;
  }
  
  function sres(a, x){
    return a.res = x;
  }
  
  function slen(a, x){
    return a.len = x;
  }
  
  function psp(a){
    return isa("ps", a);
  }
  
  function whp(a){
    return isa("wh", a);
  }
  
  function efp(a){
    return isa("ef", a);
  }
  
  function ebp(a){
    return isa("eb", a);
  }
  
  ////// Parser //////
  
  // L.dsj(L.prs($.get("../lisp-cmpr/lib/lisp-core.lisp")))
  // L.dsj(L.prs($.get("../lisp-cmpr/lib/lisp-cmp-core.lisp")))
  // L.dsj(L.prs($.get("../lisp-cmpr/lib/lisp-compile-basic.lisp")))
  
  // input: a js str of lisp code
  // output: a lisp obj representing that code
  function prs(a){
    var l = gres(psecn(a));
    if (nilp(cdr(l)))return car(l);
    return cons(sy("do"), l);
  }
  
  // parse the first object in a
  // input: a js str of lisp code
  // output: a ps obj with res = a lisp obj, and len = length of data parsed
  //           or a wh obj with len = length of whitespace
  //           or a ef obj (end of file) or an eb obj (end bracket)
  function prs1(a){
    if (emp(a))return ef();
    if (beg(a, "("))return plis(a);
    if (beg(a, "{"))return pobj(a);
    if (beg(a, "["))return pnfn(a);
    if (beg(a, "\""))return pstr(a);
    if (beg(a, "|"))return pbsym(a);
    if (beg(a, "#|"))return pbcom(a);
    if (beg(a, "#["))return parr(a);
    if (beg(a, "#("))return pref(a);
    if (beg(a, "#\""))return prgx(a);
    if (beg(a, "'"))return pqt(a);
    if (beg(a, "`"))return pqq(a);
    if (beg(a, ",@"))return puqs(a);
    if (beg(a, ","))return puq(a);
    if (beg(a, "@"))return pspi(a); // splice
    if (beg(a, "#"))return pqgs(a);
    if (beg(a, "~"))return pcmpl(a);
    if (beg(a, ";"))return pcom(a);
    if (beg(a, /^\s/))return pwhi(a);
    if (beg(a, ")", "]", "}"))return eb(a[0], 1);
    return psymnum(a);
  }
  // err(prs1, "Extra end bracket in a = $1", a);
  
  function plis(a){
    var r = plissec(sli(a, 1));
    slen(r, glen(r)+1);
    return r;
  }
  
  function pwhi(a){
    return wh(mat(/^\s+/, a).length);
  }
  
  function gsymnum(a){
    for (var i = 0; i < len(a); i++){
      if (has(/[\s(){}\[\]|";]/, a[i])){
        // for cases like "test(a b c)"
        return sli(a, 0, i);
      }
      if (a[i] === "#" && i+1 !== a.length &&
          inp(a[i+1], "|", "[", "(", "{", "\"")){
        // for cases like "test#|hey|#"
        return sli(a, 0, i);
      }
    }
    // for cases like a = "test"
    return a;
  }
  
  function psymnum(a){
    var r = gsymnum(a);
    if (r === "")err(psymnum, "Unknown item a = $1", a);
    if (has(/^-?[0-9]+(\.[0-9]+)?$/, r))return ps(nu(r), r.length);
    if (has(".", r) && !end(r, ".")){
      if (beg(r, ".")){
        return ps(cons(sy("dtfn"), spl(sy(sli(r, 1)), sy("."))), r.length);
      }
      return ps(cons(sy("."), spl(sy(r), sy("."))), r.length);
    }
    return ps(sy(r), r.length);
  }
  
  function pcom(a){
    return wh(mat(/^;[^\n\r]*/, a).length);
  }
  
  function pobj(a){
    var r = psec(sli(a, 1), "}");
    return ps(cons(sy("obj"), gres(r)), glen(r)+1);
  }
  
  function pnfn(a){
    var r = plissec(sli(a, 1), "]");
    return ps(lis(sy("nfn"), gres(r)), glen(r)+1);
  }
  
  function parr(a){
    var r = psec(sli(a, 2), "]");
    return ps(cons(sy("arr"), gres(r)), glen(r)+2);
  }
  
  function pref(a){
    var r = psec(sli(a, 2), ")");
    return ps(cons(sy("#"), gres(r)), glen(r)+2);
  }
  
  function pbcom(a){
    for (var i = 2; i < a.length; i++){
      if (a[i] == "#" && a[i-1] == "|"){
        return wh(i+1);
      }
    }
    err(pbcom, "Block comment not matched in a = $1", a);
  }
  
  // change this to #"test" since / is used for division
  function prgx(a){
    var r = gbnd(sli(a, 1), "\"");
    var s = rpl("\\\"", "\"", mid(r));
    var aft = prs1(sli(a, len(r)+1)); // len(r)+1 to include the # at the start
    if (psp(aft) && symp(gres(aft)) && !nilp(gres(aft))){
      var f = dat(gres(aft));
      if (!has("g", f))f += "g";
      return ps(rx(new RegExp(s, f)), len(r)+1+glen(aft));
    }
    return ps(rx(new RegExp(s, "g")), len(r)+1);
  }
  
  function pbsym(a){
    var r = gbnd(a, "|");
    return ps(sy(mid(r)), len(r), {bsym: true});
  }
  
  function pstr(a){
    var r = gbnd(a, "\"");
    return ps(st(JSON.parse(rpl(["\n", "\r", "\t"],
                                ["\\n", "\\r", "\\t"],
                                r))),
              len(r));
  }
  
  function gbnd(a, x){
    var s = false; // slashes
    for (var i = 1; i < len(a); i++){
      if (a[i] == "\\")s = !s;
      else {
        if (a[i] == x && !s){
          return sli(a, 0, i+1);
        }
        s = false;
      }
    }
    err(gbnd, "Missing bound $1 in a = $2", x, a);
  }
  
  // input: a js str of a list without the first bracket
  //          like "test test . c)"
  // output: a ps obj with res = list of contents and len = length
  function plissec(a, end){
    if (udfp(end))end = ")";
    var r = nil();
    var i = 0;
    var c; // curr
    var dot = false;
    var dotitem = false;
    while (true){
      c = prs1(sli(a, i));
      switch (typ(c)){
        case "ps":
          if (dot !== false){
            if (dotitem === false){
              // dot before this item and no item between dot and curr
              dotitem = gres(c);
            } else {
              // two items after dot == not lisd
              r = cons(dot, r); // add dot
              r = cons(dotitem, r); // add item btw dot and curr
              r = cons(gres(c), r); // add curr item
              dot = false;
              dotitem === false;
            }
          } else if (!nilp(r) && is(gres(c), sy(".")) && !c.bsym){
            // !nilp(r) == dot is not first in the list (. a)
            dot = gres(c);
          } else {
            // not currently after a dot and c is not a dot
            r = cons(gres(c), r);
          }
          i += glen(c);
          break;
        case "wh":
          i += glen(c);
          break;
        case "eb":
          if (gbra(c) === end){
            if (dot !== false){
              if (dotitem !== false){
                // one item after dot
                return ps(nrev(r, dotitem), i+1); // i+1 to include the ending )
              }
              // no items after dot
              r = cons(dot, r);
              return ps(nrev(r), i+1);
            }
            // no dots or more than one item after dot
            return ps(nrev(r), i+1);
          }
          err(plissec, "Mismatched bracket $1 in a = $2", gbra(c), a);
        case "ef":
          err(plissec, "Missing bracket $1 in a = $2", end, a);
        default:
          err(plissec, "Unknown c = $1 in a = $2", c, a);
      }
    }
    err(plissec, "Something strange happened a = $1", a);
  }
  
  // no dot version of plissec
  function psec(a, end){
    if (udfp(end))end = ")";
    var r = nil();
    var i = 0;
    var c; // curr
    while (true){
      c = prs1(sli(a, i));
      switch (typ(c)){
        case "ps":
          r = cons(gres(c), r);
          i += glen(c);
          break;
        case "wh":
          i += glen(c);
          break;
        case "eb":
          // i+1 to include the ending )
          if (gbra(c) === end)return ps(nrev(r), i+1);
          err(psec, "Mismatched bracket $1 in a = $2", gbra(c), a);
        case "ef":
          err(psec, "Missing bracket $1 in a = $2", end, a);
        default:
          err(psec, "Unknown c = $1 in a = $2", c, a);
      }
    }
    err(psec, "Something strange happened a = $1", a);
  }
  
  // parse to end of file
  function psecn(a){
    var r = nil();
    var i = 0;
    var c; // curr
    while (true){
      c = prs1(sli(a, i));
      switch (typ(c)){
        case "ps":
          r = cons(gres(c), r);
          i += glen(c);
          break;
        case "wh":
          i += glen(c);
          break;
        case "eb":
          err(psecn, "Extra end bracket $1 in a = $2", gbra(c), a);
        case "ef":
          return ps(nrev(r), i);
        default:
          err(psecn, "Unknown c = $1 in a = $2", c, a);
      }
    }
    err(psecn, "Something strange happened a = $1", a);
  }
  
  function pqt(a){
    var r = prs1(sli(a, 1));
    if (psp(r))return ps(lis(sy("qt"), gres(r)), glen(r)+1);
    return ps(sy("'"), 1);
  }
  
  function pqq(a){
    var r = prs1(sli(a, 1));
    if (psp(r))return ps(lis(sy("qq"), gres(r)), glen(r)+1);
    return ps(sy("`"), 1);
  }
  
  function puq(a){
    var r = prs1(sli(a, 1));
    if (psp(r))return ps(lis(sy("uq"), gres(r)), glen(r)+1);
    return ps(sy(","), 1);
  }
  
  function puqs(a){
    var r = prs1(sli(a, 2));
    if (psp(r))return ps(lis(sy("uqs"), gres(r)), glen(r)+2);
    return ps(sy(",@"), 2);
  }
  
  function pspi(a){
    var r = prs1(sli(a, 1));
    if (psp(r))return ps(lis(sy("splice"), gres(r)), glen(r)+1);
    return ps(sy("@"), 1);
  }
  
  function pqgs(a){
    var r = prs1(sli(a, 1));
    if (psp(r))return ps(lis(sy("qgs"), gres(r)), glen(r)+1);
    return ps(sy("#"), 1);
  }
  
  ////// Object exposure //////
  
  att({
    ps: ps,
    wh: wh,
    ef: ef,
    eb: eb,
    
    gres: gres,
    glen: glen,
    gbra: gbra,
    
    sres: sres,
    slen: slen,
    
    psp: psp,
    whp: whp,
    efp: efp,
    ebp: ebp,
    
    prs: prs,
    prs1: prs1,
    plis: plis,
    pwhi: pwhi,
    gsymnum: gsymnum,
    pcom: pcom,
    pobj: pobj,
    pnfn: pnfn,
    parr: parr,
    pref: pref,
    pbcom: pbcom,
    prgx: prgx,
    pbsym: pbsym,
    pstr: pstr,
    gbnd: gbnd,
    plissec: plissec,
    psec: psec,
    psecn: psecn
  }, L);
  
  ////// Testing //////
  
  //al(prs("(+ 2 3)"));
  
})(window);
