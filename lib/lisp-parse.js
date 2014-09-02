/***** Lisp Parser Devel *****/

/* require tools >= 3.1 */
/* require lisp-tools */

(function (win, udf){
  ////// Import //////
  
  var udfp = $.udfp;
  var is = $.is;
  var has = $.has;
  var pos = $.pos;
  var rpl = $.rpl;
  var len = $.len;
  var sli = $.sli;
  //var beg = $.beg;
  var end = $.end;
  var mid = $.mid;
  var att = $.att;
  var mat = $.mat;
  var err = $.err;
  
  var s = L.s;
  var nilp = L.nilp;
  var synp = L.synp;
  var nump = L.nump;
  var iso = L.iso;
  var car = L.car;
  var cdr = L.cdr;
  var cons = L.cons;
  var lis = L.lis;
  var spl = L.spl;
  
  ////// Processing functions //////
  
  /*function begt(a, pos){
    return apl(beg, hea(sli(arguments, 2), sli(a, pos)));
  }*/
  
  function beg(a){
    var ag = arguments;
    var l = ag.length;
    for (var i = 1; i < l; i++){
      if (beg1(a, ag[i]))return true;
    }
    return false;
  }
  
  function beg1(a, x){
    var lx = x.length;
    var la = a.length;
    if (lx > la)return false;
    for (var i = 0; i < lx; i++){
      if (a[i] !== x[i])return false;
    }
    return true;
  }
  
  ////// Parser //////
  
  function prs(a, pos){
    var l = pgrp(a, [], 0)[0];
    if (nilp(cdr(l)))return car(l);
    return cons("do", l);
  }
  
  function prs1(a, pos){
    var b = sli(a, pos);
    if (beg(b, "{"))return conn("obj", pafg(b, "}", 1));
    if (beg(b, "("))return plis(b);
    if (beg(b, "["))return lisn("nfn", pafg(b, "]", 1));
    if (beg(b, "\""))return pstr(b);
    if (beg(b, "|"))return psym(b);
    if (beg(b, "#|"))return paft(b, len(gcom(b)));
    if (beg(b, "#\""))return prgx(b);
    if (beg(b, "#["))return conn("arr", pafg(b, "]", 2));
    if (beg(b, "#("))return conn("#", pafg(b, ")", 2));
    if (beg(b, "'"))return lisn("qt", paft(b, 1));
    if (beg(b, "`"))return lisn("qq", paft(b, 1));
    if (beg(b, ",@"))return lisn("uqs", paft(b, 2));
    if (beg(b, "@"))return lisn("splice", paft(b, 1));
    if (beg(b, ","))return lisn("uq", paft(b, 1));
    if (beg(b, "~"))return lisn("cmpl", paft(b, 1));
    //if (beg(b, "!"))return lisn("not", paft(b, 1));
    if (beg(b, ";"))return paft(b, len(mat(/^;[^\n\r]*/, b)));
    if ($.beg(b, /\s/))return paft(b, mat(/^\s+/, b).length);
    if (beg(b, ")", "]", "}"))return [b[0], 1];
    var s = mat(/^[^(){}"\[\]\s]*/, b);
    if (beg(s, "#") && s !== "#"){
      return lisn("qgs", [sli(s, 1), len(s)]);
    }
    if (is(s, "."))return [lis("dot"), 1];
    //if (is(s, "."))return [".", 1];
    if (has(".", s) && !nump(s)){
      if (end(s, "."))return obj(s);
      if (beg(s, "."))return [cons("dtfn", spl(sli(s, 1), ".")), len(s)];
      return [cons(".", spl(s, ".")), len(s)];
    }
    return obj(s);
  }
  
  // (var [o l] (prs1 a pos))
  function paft(a, n){
    return alen(n, prs1(a, n));
  }
  
  function pafg(a, end, n){
    return alen(n, pgrp(a, end, n));
  }
  
  function lisn(x, a){
    return [lis(x, a[0]), a[1]];
  }
  
  function conn(x, a){
    return [cons(x, a[0]), a[1]];
  }
  
  function obj(a){
    return [a, a.length];
  }
  
  function alen(n, a){
    return [a[0], a[1]+n];
  }
  
  function pgrp(a, end, pos){
    var r = prs1(a, pos);
    if (nilp(end)){
      if (r[0] === "")return [[], r[1]];
    } else {
      if (r[0] === "")err(pgrp, "Missing $1", end);
      if (synp(r[0])){
        var p = $.pos(end, r[0]);
        if (p != -1){
          if (p == 0)return [[], r[1]-len(r[0])+p+len(end)];
          return [lis(sli(r[0], 0, p)), r[1]-len(r[0])+p+len(end)];
        }
      }
    }
    var o = pgrp(a, end, pos+r[1]);
    return [cons(r[0], o[0]), r[1]+o[1]];
  }
  
  function plis(a){
    return alen(1, plgrp(a, 1));
  }
  
  function plgrp(a, pos){
    var end = ")";
    var r = prs1(a, pos);
    if (r[0] === "")err(plgrp, "Missing $1", end);
    if (synp(r[0])){
      var p = $.pos(end, r[0]);
      if (p != -1){
        if (p == 0)return [[], r[1]-r[0].length+p+end.length];
        return [lis(sli(r[0], 0, p)), r[1]-r[0].length+p+end.length];
      }
    }
    var o = plgrp(a, pos+r[1]);
    if (iso(r[0], lis("dot")) && a[pos-1] != "("){
    //if (r[0] == "." && a[pos-1] != "("){
      if (nilp(o[0]))err(plgrp, "Missing object after \".\" in a = $1", a);
      if (!nilp(cdr(o[0])))err(plgrp, "More than one object after \".\" in a = $1", a);
      return [car(o[0]), r[1]+o[1]];
    }
    return [cons(r[0], o[0]), r[1]+o[1]];
  }
  
  function pstr(a){
    var r = gstr(a);
    return [s(JSON.parse(r)), len(r)];
  }
  
  function gstr(a){
    return gbnd(a, "\"");
  }
  
  function psym(a){
    var r = gbnd(a, "|");
    return [mid(r), len(r)];
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
    err(gbnd, "Bounds x = $1 not matched in a = $2", x, a);
  }
  
  function gcom(a){
    for (var i = 2; i < a.length; i++){
      if (a[i] == "#" && a[i-1] == "|"){
        return sli(a, 0, i+1);
      }
    }
    err(gcom, "Block comment not matched in a = $1", a);
  }
  
  function prgx(a){
    var r = gstr(sli(a, 1));
    var s = rpl("\\\"", "\"", mid(r));
    return [new RegExp(s, "g"), len(r)+1];
  }
  
  ////// Object exposure //////
  
  att({prs: prs}, L);
  
  ////// Testing //////
  
  //al(prs("(+ 2 3)"));
  
})(window);
