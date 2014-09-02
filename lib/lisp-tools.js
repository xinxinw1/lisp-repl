/***** Lisp Tools Devel *****/

/* require tools >= 4.4.1 */
/* require prec-math */

//var calls = {smacp: []};
(function (udf){
  var nodep = $.nodep;
  
  ////// Type //////
  
  function typ(a){
    if ($.arrp(a)){
      if (a.length == 0)return "nil";
      if (a[0] === tgsym)return a[1];
      return "lis";
    }
    if ($.strp(a)){
      if ($.has(/^-?[0-9]+(\.[0-9]+)?$/, a))return "num";
      return "sym";
    }
    if ($.objp(a))return "obj";
    if ($.rgxp(a))return "rgx";
    if ($.fnp(a))return "jn";
    err(typ, "Unknown type of a = $1", a);
  }
  
  // tagsym defined later
  function tg(x, a){
    var as = arguments;
    if (as.length == 2){
      if (isa(x, a))return a;
      return [tgsym, x, a];
    }
    return $.app([tgsym, x], $.sli(as, 1));
  }
  
  // n is probably never going to be greater than js int size
  function rp(a, n){
    if (n === udf)n = 0;
    if (tgp(a))return chku(a[$.num(n)+2]);
    return a;
  }
  
  function r(a){
    return tg("arr", a);
  }
  
  function s(a){
    return tg("str", a);
  }
  
  //// Predicates ////
  
  function nilp(a){
    //calls.nilp.push(arguments.callee.caller);
    return $.arrp(a) && a.length === 0;
  }
  
  // tags must have >= 3 items
  // return $.arrp(a) && a.length === 2 || a.length === 0
  function lisp(a){
    return $.arrp(a) && a[0] !== tgsym;
  }
  
  // !lisp(a) || nilp(a)
  function atmp(a){
    //calls.atmp.push(arguments.callee.caller);
    return !$.arrp(a) || a.length !== 2;
  }
  
  // lisp(a) && !nilp(a)
  // also !atmp(a)
  function consp(a){
    return $.arrp(a) && a.length === 2;
  }
  
  // includes nump
  var synp = $.strp;
  
  function symp(a){
    return synp(a) && !/^-?[0-9]+(\.[0-9]+)?$/.test(a);
  }
  
  /*function nump(a){
    return $.strp(a) && $.has(/^-?[0-9]+(\.[0-9]+)?$/, a);
  }*/
  
  function nump(a){
    return synp(a) && /^-?[0-9]+(\.[0-9]+)?$/.test(a);
  }
  
  var objp = $.objp;
  var rgxp = $.rgxp;
  var udfp = $.udfp;
  
  function tgp(a){
    return $.arrp(a) && a[0] === tgsym;
  }
  
  function strp(a){
    return tgp(a) && a[1] === "str";
  }
  
  function arrp(a){
    return tgp(a) && a[1] === "arr";
  }
  
  var jnp = $.fnp;
  
  function fnp(a){
    return jnp(a) || tgp(a) && $.inp(a[1], "fn", "nfn", "jn2");
  }
  
  function macp(a){
    return tgp(a) && a[1] === "mac";
  }
  
  function smacp(a){
    return tgp(a) && a[1] === "smac";
  }
  
  function spcp(a){
    return tgp(a) && $.inp(a[1], "mac", "smac", "spc");
  }
  
  function prcp(a){
    return fnp(a) || spcp(a);
  }
  
  ////// Comparison //////
  
  function is(a, b){
    if (a === b)return true;
    if ($.arrp(a)){
      if (!$.arrp(b))return false; // must match type
      if (a.length === 0)return b.length === 0; // nilp
      // if they are non nil arrays, they must be equal strings
      return a[0] === tgsym && b[0] === tgsym &&
             a[1] === "str" && b[1] === "str" &&
             a[2] === b[2];
    }
    return rgxp(a) && rgxp(b) && $.iso(a, b);
  }
  
  /*function is2(a, b){
    if (a === b || nilp(a) && nilp(b))return true;
    if (strp(a) && strp(b))return rp(a) === rp(b);
    if (rgxp(a) && rgxp(b))return $.iso(a, b);
    return false;
  }*/
  
  function iso(a, b){
    if (lisp(a) && lisp(b))return isolis(a, b);
    if (arrp(a) && arrp(b))return $.iso(rp(a), rp(b));
    return is(a, b);
  }
  
  /*function iso(a, b){
    if ($.arrp(a)){
      if (!$.arrp(b))return false;
      if (a[0] === tgsym){
        return b[0] === tgsym &&
               a[1] === "arr" && b[1] === "arr" &&
               $.iso(a[2], b[2]);
      }
      return b[0] !== tgsym && isolis(a, b);
    }
    return is(a, b);
  }*/
  
  function isolis(a, b){
    if (is(a, b))return true;
    // orig: return is(a, b); at this point, we know that is false
    if (atmp(a) || atmp(b))return false;
    return isolis(car(a), car(b)) && isolis(cdr(a), cdr(b));
  }
  
  /*function isolis(a, b){
    if (is(a, b))return true;
    if (atmp(a) || atmp(b))return is(a, b);
    return isolis(car(a), car(b)) && isolis(cdr(a), cdr(b));
  }*/
  
  function isa(x, a){
    var t = typ(a);
    if (is(x, t))return true;
    if (inp(x, "num", "sym") && inp(t, "num", "sym"))return true;
    if (is(x, "sym") && is(t, "nil"))return true;
    if (is(x, "fn") && inp(t, "jn", "jn2"))return true;
    if (is(x, "spc") && is(t, "mac"))return true;
    return false;
  }
  
  function inp(x){
    var a = arguments;
    for (var i = 1; i < a.length; i++){
      if (is(a[i], x))return true;
    }
    return false;
  }
  
  ////// Dynamic vars //////
  
  var sta = $.sta;
  
  ////// Display //////
  
  /*
  var a = L.lis("1", "3", "5");
  var b = L.arr(a, L.lis(a, "5"));
  L.set(b, "1", "1", b);
  var c = {a: a, b: b, c: "5"};
  L.set(c, "c", c);
  L.set(b, "1", "1", L.lis(a, b, c));
  L.dsp(c);
  */
  
  function dsp(a){
    return s(dsj(a));
  }
  
  var dsps = [];
  function dsj(a){
    return sta(dsps, a, function (){
      return dsj2(a);
    });
  }
  
  function dsj2(a){
    if (nilp(a))return "nil";
    if (lisp(a))return dlis(a);
    if (synp(a))return dsym(a);
    if (objp(a)){
      if (has(a, cdr(dsps)))return "{...}";
      return "{" + foldi(function (s, x, i){
        if (s == "")return dsj(i) + " " + dsj(x);
        return s + " " + dsj(i) + " " + dsj(x);
      }, "", a) + "}";
    }
    if (rgxp(a))return "#\"" + $.rpl("\"", "\\\"", a.source) + "\"";
    if (strp(a))return $.dsp(rp(a));
    if (arrp(a)){
      if (has(a, cdr(dsps)))return "#[...]";
      return "#[" + fold(function (s, x){
        if (s == "")return dsj(x);
        return s + " " + dsj(x);
      }, "", a) + "]";
    }
    if (fnp(a)){
      switch (typ(a)){
        /*case "fn": return "<fn " + dsj(rp(a, "0")) + " "
                                 + dsj(rp(a, "1")) + ">";*/
        case "fn": return "<fn " + dsj(rp(a, "0")) + ">";
        case "nfn": return "<nfn " + dsj(rp(a, "0")) + ">";
      }
    }
    if (tgp(a))return "<" + $.joi($.map(dsj, $.sli(a, 1)), " ") + ">";
    return $.dsp(a);
  }
  
  function dsym(a){
    var fr = ["\\", "\n", "\r", "\t", "\b", "\f"];
    var to = ["\\\\", "\\n", "\\r", "\\t", "\\b", "\\f"];
    return $.rpl(fr, to, a);
  }
  
  var dlists = [];
  var i = -1;
  function dlis(a){
    if (has(a, cdr(dsps)))return "(...)";
    switch (car(a)){
      case "qt": return "'" + dsj(cadr(a));
      case "qq": return "`" + dsj(cadr(a));
      case "uq": return "," + dsj(cadr(a));
      case "uqs": return ",@" + dsj(cadr(a));
      case "qgs": return "#" + dsj(cadr(a));
      case "splice": return "@" + dsj(cadr(a));
      case "not": return "!" + dsj(cadr(a));
      case "nfn": return "(fn (_) " + dsj(cadr(a)) + ")";
    }
    return "(" + sta(dlists, a, function (){
      return dlis2(a);
    }) + ")";
  }
  
  // dlis2( '(1 2 3 4 . 5) ) -> "1 2 3 4 . 5"
  function dlis2(a){
    if (nilp(cdr(a)))return dsj(car(a));
    if (atmp(cdr(a)))return dsj(car(a)) + " . " + dsj(cdr(a));
    if (has(a, cdr(dlists)))return dsj(car(a)) + " . (...)";
    return dsj(car(a)) + " " + dlis2(cdr(a));
  }
  
  ////// Output //////
  
  var of = function (a){return [];}
  
  function ofn(f){
    if (udfp(f))return of;
    return of = f;
  }
  
  function ou(a){
    return of(a);
  }
  
  function out(a){
    return of(app(a, s("\n")));
  }
  
  function alr(a){
    $.alr(rp(a));
    return [];
  }
  
  function pr(){
    return ou(apl(stf, r(arguments)));
  }
  
  function prn(a){
    return out(apl(stf, r(arguments)));
  }
  
  function al(a){
    return alr(apl(stf, r(arguments)));
  }
  
  ////// Converters //////
  
  function sym(a){
    if (synp(a))return a;
    if (strp(a))return rp(a);
    return dsj(a);
  }
  
  function str(){
    return joi(r(arguments));
  }
  
  function str1(a){
    if (strp(a))return a;
    if (nilp(a))return s("");
    if (synp(a))return s(a);
    return dsp(a);
  }
  
  function num(a){
    if (nump(a))return a;
    if (synp(a)){
      var s = $.mtc(/^-?[0-9]+(\.[0-9]+)?/, a);
      return (s == -1)?"0":s;
    }
    if (strp(a))return num(rp(a));
    return "0";
  }
  
  function tfn(a){
    if (fnp(a))return a;
    return function (x){
      return is(x, a);
    };
  }
  
  function tarr(a){
    if (arrp(a))return a;
    if (lisp(a))return r(jarr(a));
    if (synp(a))return r($.tarr(a));
    if (strp(a))return map(s, tarr(rp(a)));
    err(tarr, "Can't coerce a = $1 to arr", a);
  }
  
  function tlis(a){
    if (lisp(a))return a;
    if (arrp(a))return $.apl(lis, rp(a));
    if (synp(a) || strp(a))return tlis(tarr(a));
    if (objp(a))return $.foldi(function (l, x, i){
      return cons(cons(i, x), l);
    }, [], a);
    err(tlis, "Can't coerce a = $1 to lis", a);
  }
  
  /*function tobj(a, o){
    if (udfp(o))o = {};
    if (objp(a))return app(a, o);
    if (lisp(a))return foldlis(function (o, x){
      if (atmp(x))err(tobj, "Can't coerce a = $1 to obj", a);
      o[prop(car(x))] = cdr(x);
      return o;
    }, o, a);
    if (arrp(a))return $.tobj($.map(function (x){
      if (!$.arrp(x))err(tobj, "Can't coerce a = $1 to obj", a);
      return [jstr(x[0]), x[1]];
    }, $.map(jarr, rp(a))), tobj(o));
    if (synp(a))return $.tobj(a, tobj(o));
    if (strp(a))return map(s, tobj(rp(a), o));
    err(tobj, "Can't coerce a = $1 to obj", a);
  }*/
  
  function tobj(a){
    if (objp(a))return a;
    if (lisp(a))return foldlis(function (o, x){
      if (atmp(x))err(tobj, "Can't coerce a = $1 to obj", a);
      o[prop(car(x))] = cdr(x);
      return o;
    }, {}, a);
    if (arrp(a))return $.tobj($.map(function (x){
      if (!$.arrp(x))err(tobj, "Can't coerce a = $1 to obj", a);
      return [jstr(x[0]), x[1]];
    }, $.map(jarr, rp(a))), {});
    if (synp(a))return $.tobj(a);
    if (strp(a))return map(s, tobj(rp(a)));
    err(tobj, "Can't coerce a = $1 to obj", a);
  }
  
  function prop(a){
    if (synp(a))return a;
    if ($.arrp(a)){
      if (a.length === 0)return "";
      if (a[0] === tgsym && a[1] === "str")return a[2]; // rp(a)
    }
    err(prop, "Invalid obj prop name a = $1", a);
  }
  
  /*function prop(a){
    if (nilp(a))return "";
    if (synp(a))return a;
    if (strp(a))return rp(a);
    err(prop, "Invalid obj prop name a = $1", a);
  }*/
  
  function jstr(a){
    if (nilp(a))return "";
    if (synp(a))return a;
    if (strp(a))return rp(a);
    err(jstr, "Can't coerce a = $1 to jstr", a);
  }
  
  /*function jarr(a){
    if (arrp(a))return rp(a);
    if (lisp(a))return foldlis(function (r, x){
      r.push(x);
      return r;
    }, [], a);
    err(jarr, "Can't coerce a = $1 to jarr", a);
  }*/
  
  function jarr(a){
    if ($.arrp(a)){
      if (a.length === 0)return [];
      if (a.length === 2){
        var o = a;
        var r = [];
        while (consp(o)){
          r.push(o[0]);
          o = o[1];
        }
        return r;
      }
      if (a[0] === tgsym && a[1] === "arr")return a[2]; // rp(a)
    }
    err(jarr, "Can't coerce a = $1 to jarr", a);
  }
  
  function jmat(a){
    if (nilp(a))return "";
    if (synp(a) || rgxp(a))return a;
    if (strp(a))return rp(a);
    if (fnp(a))return jbn(a);
    if (lisp(a) || arrp(a))return jarr(map(jmat, a));
    err(jmat, "Can't coerce a = $1 to jmat", a);
  }
  
  function jn(a){
    if (jnp(a))return chrb(a);
    if (fnp(a))return function (){
      return $.apl(cal, $.hea(arguments, a));
    };
    return function (x){
      return chkb(is(x, a));
    };
  }
  
  function jbn(a){
    if (jnp(a))return bchr(a);
    if (fnp(a))return function (){
      return bchk($.apl(cal, $.hea(arguments, a)));
    };
    return function (x){
      return is(x, a);
    };
  }
  
  ////// Add //////
  
  ////// Sequence //////
  
  //// Items ////
  
  function ref(a){
    return $.fold(ref1, a, $.sli(arguments, 1));
  }
  
  function ref1(a, n){
    if (lisp(a))return nth(n, a);
    if (synp(a))return chku($.ref(a, $.num(n)));
    if (strp(a))return s(ref1(rp(a), n));
    if (arrp(a))return chku($.ref(rp(a), $.num(n)));
    if (objp(a))return chku($.ref(a, n));
    err(ref, "Can't get item n = $1 of a = $2", n, a);
  }
  
  function set(a, n, x){
    if (udfp(x))x = [];
    if (lisp(a))return (function set(a, n, x){
      if (nilp(a))psh([], a);
      if (le(n, "0"))return a[0] = x;
      return set(cdr(a), sub(n, "1"), x);
    })(a, n, x);
    if (arrp(a))return $.set(rp(a), $.num(n), x);
    if (objp(a))return $.set(a, n, x);
    err(set, "Can't set item n = $1 of a = $2 to x = $3", n, a, x);
  }
  
  function fst(a){
    return ref(a, "0");
  }
  
  function las(a){
    return ref(a, sub(len(a), "1"));
  }
  
  //// Apply ////
  
  function apl(f, a){
    return $.apl(f, jarr(a));
  }
  
  function map(f, a){
    if (lisp(a))return maplis(jn(f), a);
    if (arrp(a))return r($.map(jn(f), rp(a)));
    if (objp(a))return $.map(jn(f), a);
    err(map, "Can't map f = $1 over a = $2", f, a);
  }
  
  function mapn(f, a){
    if (lisp(a))return maplis(f, a);
    if (arrp(a))return r($.map(f, rp(a)));
    if (objp(a))return $.map(f, a);
    err(map, "Can't map f = $1 over a = $2", f, a);
  }
  
  function maplis(f, a){
    var r = [];
    // orig: !nilp(a)
    while (consp(a)){
      r = [f(a[0]), r];
      a = a[1];
    }
    return nrev(r);
  }
  
  /*function maplis(f, a){
    if (nilp(a))return [];
    return cons(f(car(a)), maplis(f, cdr(a)));
  }*/
  
  // maplis(f, a)
  
  function dmap(f, a){
    x = jn(f);
    if (synp(a) || strp(a))return x(a);
    if (lisp(a))return cons(dmap(x, car(a)), dmap(x, cdr(a)));
    if (arrp(a) || objp(a))return map(function (i){
      return dmap(x, i);
    }, a);
    err(dmap, "Can't dmap f = $1 over a = $2", f, a);
  }
  
  function pos(x, a, n){
    if (udfp(n))n = "0";
    if (lisp(a))return (function pos(x, a, n){
      if (udfp(n))n = "0";
      if (nilp(a))return "-1";
      if (x(car(a)))return n;
      return pos(x, cdr(a), add(n, "1"));
    })(jbn(x), ncdr(n, a));
    if (arrp(a))return $.str($.pos(jbn(x), rp(a), $.num(n)));
    if (objp(a))return $.str($.pos(jbn(x), a, $.num(n)));
    if (synp(a))return $.str($.pos(jmat(x), a, $.num(n)));
    if (strp(a))return pos(x, rp(a), n);
    err(pos, "Can't get pos of x = $1 in a = $2 from n = $3", x, a, n);
  }
  
  function has(x, a){
    if (lisp(a))return haslis(jbn(x), a);
    if (arrp(a))return $.has(jbn(x), rp(a));
    if (objp(a))return $.has(jbn(x), a);
    if (synp(a))return $.has(jmat(x), a);
    if (strp(a))return has(x, rp(a));
    err(has, "Can't find if a = $1 has x = $2", a, x);
  }
  
  function haslis(x, a){
    if (nilp(a))return false;
    if (x(car(a)))return true;
    return haslis(x, cdr(a));
  }
  
  function all(x, a){
    if (lisp(a))return (function all(x, a){
      if (nilp(a))return true;
      if (!x(car(a)))return false;
      return all(x, cdr(a));
    })(jbn(x), a);
    if (arrp(a))return $.all(jbn(x), rp(a));
    if (objp(a))return $.all(jbn(x), a);
    if (synp(a))return $.all(jmat(x), a);
    if (strp(a))return all(x, rp(a));
    err(all, "Can't find if all a = $1 is x = $2", a, x);
  }
  
  function keep(x, a){
    if (lisp(a))return (function keep(x, a){
      if (nilp(a))return [];
      if (!x(car(a)))return keep(x, cdr(a));
      return cons(car(a), keep(x, cdr(a)));
    })(jbn(x), a);
    if (synp(a))return $.keep(jmat(x), a);
    if (strp(a))return s(keep(x, rp(a)));
    if (objp(a))return $.keep(jbn(x), a);
    if (arrp(a))return r($.keep(jbn(x), rp(a)));
    err(keep, "Can't keep x = $1 in a = $2", x, a);
  }
  
  function rem(x, a){
    if (lisp(a))return (function rem(x, a){
      if (nilp(a))return [];
      if (x(car(a)))return rem(x, cdr(a));
      return cons(car(a), rem(x, cdr(a)));
    })(jbn(x), a);
    if (synp(a))return $.rem(jmat(x), a);
    if (strp(a))return s(rem(x, rp(a)));
    if (objp(a))return $.rem(jbn(x), a);
    if (arrp(a))return r($.rem(jbn(x), rp(a)));
    err(rem, "Can't rem x = $1 from a = $2", x, a);
  }
  
  // remove from the beginning
  function remb(x, a){
    if (lisp(a))return (function remb(x, a){
      if (nilp(a))return [];
      if (x(car(a)))return remb(x, cdr(a));
      return a;
    })(jbn(x), a);
    if (synp(a))return $.remb(jmat(x), a);
    if (strp(a))return s(remb(x, rp(a)));
    if (arrp(a))return r($.remb(jbn(x), rp(a)));
    err(remb, "Can't remb x = $1 from a = $2", x, a);
  }
  
  // remove from the end
  function reme(x, a){
    if (lisp(a))return nrev(remb(x, nrev(a)));
    err(reme, "Can't reme x = $1 from a = $2", x, a);
  }
  
  function rpl(x, y, a){
    if (lisp(a))return (function rpl(x, y, a){
      if (nilp(a))return [];
      return cons(x(car(a))?y:car(a), rpl(x, y, cdr(a)));
    })(jbn(x), y, a);
    if (synp(a))return $.rpl(jmat(x), jmat(y), a);
    if (strp(a))return s(rpl(x, y, rp(a)));
    if (objp(a))return $.rpl(jbn(x), y, a);
    if (arrp(a))return r($.rpl(jbn(x), y, rp(a)));
    err(rpl, "Can't rpl x = $1 with y = $2 in a = $3", x, y, a);
  }
  
  function mat(x, a){
    if (lisp(a))return (function mat(x, a){
      if (nilp(a))return [];
      if (x(car(a)))return car(a);
      return mat(x, cdr(a));
    })(jbn(x), a);
    if (synp(a))return $.mat(jmat(x), a);
    if (strp(a))return s(mat(x, rp(a)));
    if (objp(a))return $.mat(jbn(x), a);
    if (arrp(a))return r($.mat(jbn(x), rp(a)));
    err(mat, "Can't match x = $1 a = $2", x, a);
  }
  
  function mats(x, a){
    if (lisp(a))return keep(x, a);
    if (synp(a))return $.mats(jmat(x), a);
    if (strp(a))return s(mats(x, rp(a)));
    if (objp(a)){
      var f = jbn(x);
      var l = [];
      for (var i in a){
        if (f(a[i]))l = cons(a[i], l);
      }
      return nrev(l);
    }
    if (arrp(a))return r($.mats(jbn(x), rp(a)));
    err(mats, "Can't get matches of x = $1 a = $2", x, a);
  }
  
  //// Whole ////
  
  function len(a){
    if (lisp(a))return lenlis(a);
    if (synp(a) || objp(a))return $.str($.len(a));
    if (arrp(a))return $.str($.len(rp(a)));
    if (strp(a))return len(rp(a));
    err(len, "Can't get len of a = $1", a);
  }
  
  // apparently the largest len ever seen when running compile-basic is 2
  // probably shouldn't worry about this getting too big
  function lenlis(a){
    var r = 0;
    while (consp(a)){
      r += 1;
      a = a[1];
    }
    return $.str(r);
  }
  
  /*function lenlis2(a){
    if (nilp(a))return "0";
    return add(lenlis2(cdr(a)), "1");
  }*/
  
  function emp(a){
    if (lisp(a))return nilp(a);
    if (arrp(a) || synp(a) || strp(a) || fnp(a) || objp(a)){
      return is(len(a), "0");
    }
    if (udfp(a))return true;
    err(emp, "Can't find if a = $1 is empty", a);
  }
  
  function cpy(a){
    if (lisp(a))return map($.self, a);
    if (strp(a))return s(rp(a));
    if (arrp(a))return r($.cpy(rp(a)));
    if (objp(a))return $.cpy(a);
    return a;
  }
  
  function cln(a){
    if (lisp(a) || arrp(a) || objp(a))return map(cln, a);
    if (strp(a))return cpy(a);
    return a;
  }
  
  function rev(a){
    if (lisp(a))return revlis(a, []);
    if (arrp(a))return r($.rev(rp(a)));
    if (strp(a))return s($.rev(rp(a)));
    if (synp(a))return $.rev(a);
    err(rev, "Can't reverse a = $1", a);
  }
  
  //// Parts ////
  
  function sli(a, n, m){
    if (lisp(a))return ncdr(n, udfp(m)?a:fstn(m, a));
    if (udfp(m))m = len(a);
    if (synp(a))return $.sli(a, $.num(n), $.num(m));
    if (strp(a))return s(sli(rp(a), n, m));
    if (arrp(a))return r($.sli(rp(a), $.num(n), $.num(m)));
    err(sli, "Can't slice a = $1 from n = $2 to m = $3", a, n, m);
  }
  
  function fstn(n, a){
    if (lisp(a))return fstnlis(n, a);
    return sli(a, "0", n);
    err(fstn, "Can't get fst n = $1 of a = $2", n, a);
  }
  
  function fstnlis(n, a){
    if (le(n, "0") || nilp(a))return [];
    return cons(car(a), fstnlis(sub(n, "1"), cdr(a)));
  }
  
  function rstn(n, a){
    return sli(a, n);
  }
  
  function rst(a){
    return sli(a, "1");
  }
  
  function mid(a){
    return sli(a, "1", sub(len(a), "1"));
  }
  
  //// Group ////
  
  function spl(a, x){
    if (synp(a))return tlis(r($.spl(a, jmat(x))));
    if (strp(a))return map(s, spl(rp(a), x));
    if (lisp(a))return (function spl(a, x, c){
      if (udfp(c))c = [];
      if (is(car(a), x))return cons(nrev(c), spl(cdr(a), x));
      return spl(cdr(a), x, cons(car(a), c));
    })(a, x);
    if (arrp(a))return r($.spl(rp(a), x));
    err(spl, "Can't split a = $1 by x = $2", a, x);
  }
  
  function grp(a, n){
    if (!is(n, "0")){
      if (lisp(a))return grplis(a, n);
      if (synp(a) || strp(a))return grpstr(a, n);
      if (arrp(a))return r($.map(r, $.grp(rp(a), $.num(n))));
    }
    err(grp, "Can't grp a = $1 into grps of n = $2", a, n);
  }
  
  function grplis(a, n){
    if (nilp(a))return [];
    return cons(fstn(n, a), grp(ncdr(n, a), n));
  }
  
  function grpstr(a, n){
    if (emp(a))return [];
    return cons(fstn(n, a), grp(rstn(n, a), n));
  }
  
  function par(a, b){
    if (nilp(a))return [];
    if (atmp(a))return lis(lis(a, b));
    return app(par(car(a), car(b)), par(cdr(a), cdr(b)));
  }
  
  function tup(){
    return (function tup(a){
      if (all([], a))return [];
      return cons(map(car, a), tup(map(cdr, a)));
    })(tlis(r(arguments)));
  }
  
  //// Join ////
  
  function joi(a, x){
    if (udfp(x))x = s("");
    if (lisp(a) || arrp(a)){
      return fold(function (r, i){
        if (is(r, s("")))return str1(i);
        return app(r, x, str1(i));
      }, s(""), a);
    }
    err(joi, "Can't join a = $1 with x = $2", a, x);
  }
  
  function fla(a, x){
    if (udfp(x)){
      if (lisp(a))return fold(app2, [], a);
      if (arrp(a))return fold(app2, r([]), a);
      err(fla, "Can't flat a = $1", a);
    }
    if (lisp(a))return fold(function (r, a){
      if (emp(r))return app(r, a);
      return app(r, x, a);
    }, [], a);
    if (arrp(a))return fold(function (r, a){
      if (emp(r))return app(r, a);
      return app(r, x, a);
    }, r([]), a);
    err(fla, "Can't flat a = $1 with x = $2", a, x);
  }
  
  function app(){
    var a = arguments;
    if ($.len(a) == 0)return [];
    return $.fold(app2, $.rem(nilp, a));
  }
  
  function app2(a, b){
    if (lisp(a)){
      if (lisp(b) || arrp(b))return (function app(a, b){
        if (nilp(a))return b;
        if (nilp(b))return a;
        if (atmp(a))err(app, "a = $1 must be a list", a);
        return cons(car(a), app(cdr(a), b));
      })(a, tlis(b));
      return tai(a, b);
    }
    if (synp(a))return $.app(a, sym(b));
    if (strp(a))return s(app2(rp(a), b));
    if (objp(a))return $.app(a, tobj(b));
    if (arrp(a)){
      if (arrp(b) || lisp(b))return r($.app(jarr(a), jarr(b)));
      return tai(a, b);
    }
    err(app2, "Can't app a = $1 to b = $2", a, b);
  }
  
  //// ??? ////
  
  function evry(a, n, m){
    if (udfp(m))m = "0";
    if (lisp(a))return (function evry(a, n, m){
      if (nilp(a))return [];
      if (is(m, "0"))return cons(car(a), evry(cdr(a), n, sub(n, "1")));
      return evry(cdr(a), n, sub(m, "1"));
    })(a, n, m);
    if (synp(a))return $.evry(a, $.num(n), $.num(m));
    if (strp(a))return s(evry(rp(a), n, m));
    if (arrp(a))return r($.evry(rp(a), $.num(n), $.num(m)));
    err(evry, "Can't get every n = $1 of a = $2 starting at m = $3", n, a, m);
  }
  
  //// Reduce ////
  
  function fold(f, x, a){
    if (arguments.length >= 3){
      if (lisp(a))return foldlis(jn(f), x, a);
      if (arrp(a))return $.fold(jn(f), x, rp(a));
      if (objp(a))return $.fold(jn(f), x, a);
      err(fold, "Can't fold a = $1 with f = $2 and x = $3", a, f, x);
    }
    a = x;
    if (lisp(a)){
      if (nilp(a))return [];
      return fold(f, car(a), cdr(a));
    }
    if (arrp(a))return $.fold(jn(f), rp(a));
    err(fold, "Can't fold a = $1 with f = $2", a, f);
  }
  
  function foldlis2(f, x, a){
    if (nilp(a))return x;
    return foldlis2(f, f(x, car(a)), cdr(a));
  }
  
  function foldlis(f, x, a){
    // orig: !nilp(a), curr: !atmp(a) || tgp(a)
    while (consp(a)){
      x = f(x, a[0]);
      a = a[1];
    }
    return x;
  }
  
  function foldi(f, x, a){
    if (arguments.length >= 3){
      if (lisp(a))return (function fold(f, x, a, i){
        if (nilp(a))return x;
        return fold(f, f(x, car(a), i), cdr(a), add(i, "1"));
      })(jn(f), x, a, "0");
      if (arrp(a))return $.foldi(jn(f), x, rp(a));
      if (objp(a))return $.foldi(jn(f), x, a);
      err(foldi, "Can't foldi a = $1 with f = $2 and x = $3", a, f, x);
    }
    a = x;
    if (lisp(a)){
      if (nilp(a))return [];
      return (function fold(f, x, a, i){
        if (nilp(a))return x;
        return fold(f, f(x, car(a), i), cdr(a), add(i, "1"));
      })(jn(f), car(a), cdr(a), "1");
    }
    if (arrp(a))return $.foldi(jn(f), rp(a));
    err(foldi, "Can't foldi a = $1 with f = $2", a, f);
  }
  
  function foldr(f, x, a){
    if (arguments.length >= 3){
      if (lisp(a))return (function fold(f, x, a){
        if (nilp(a))return x;
        return fold(f, f(car(a), x), cdr(a));
      })(jn(f), x, rev(a));
      if (arrp(a))return $.foldr(jn(f), x, rp(a));
      if (objp(a))return $.foldr(jn(f), x, a);
      err(foldr, "Can't foldr a = $1 with f = $2 and x = $3", a, f, x);
    }
    a = x;
    if (lisp(a)){
      if (nilp(a))return [];
      var b = rev(a);
      return (function fold(f, x, a){
        if (nilp(a))return x;
        return fold(f, f(car(a), x), cdr(a));
      })(jn(f), car(b), cdr(b));
    }
    if (arrp(a))return $.foldr(jn(f), rp(a));
    err(foldr, "Can't foldr a = $1 with f = $2", a, f);
  }
  
  function foldri(f, x, a){
    if (arguments.length >= 3){
      if (lisp(a))return (function fold(f, x, a, i){
        if (nilp(a))return x;
        return fold(f, f(car(a), x, i), cdr(a), add(i, "1"));
      })(jn(f), x, rev(a), "0");
      if (arrp(a))return $.foldri(jn(f), x, rp(a));
      if (objp(a))return $.foldri(jn(f), x, a);
      err(foldri, "Can't foldri a = $1 with f = $2 and x = $3", a, f, x);
    }
    a = x;
    if (lisp(a)){
      if (nilp(a))return [];
      var b = rev(a);
      return (function fold(f, x, a, i){
        if (nilp(a))return x;
        return fold(f, f(car(a), x, i), cdr(a), sub(i, "1"));
      })(jn(f), car(b), cdr(b), sub(len(a), "2"));
    }
    if (arrp(a))return $.foldri(jn(f), rp(a));
    err(foldri, "Can't foldri a = $1 with f = $2", a, f);
  }
  
  //// Array ////
  
  function hea(a, x){
    if (lisp(a))return cons(x, a);
    if (arrp(a))return ush(x, cpy(a));
    err(hea, "Can't hea a = $1 with x = $2", a, x);
  }
  
  function tai(a, x){
    if (lisp(a))return (function tai(a, x){
      if (nilp(a))return lis(x);
      return cons(car(a), tai(cdr(a), x));
    })(a, x);
    if (arrp(a))return psh(x, cpy(a));
    err(tai, "Can't tai a = $1 with x = $2", a, x);
  }
  
  //// Other ////
  
  function beg(a){
    var x = $.sli(arguments, 1);
    if (synp(a) || strp(a))return is(pos(r(x), a), "0");
    if (lisp(a) || arrp(a))return $.has(fst(a), x);
    err(beg, "Can't find if a = $1 begs with x = $2", a, $.dsp(x));
  }
  
  function end(a){
    var x = $.sli(arguments, 1);
    if (synp(a) || strp(a)){
      var c;
      for (var i = 0; i < $.len(x); i++){
        c = pol(x[i], a);
        if (c != -1 && c == len(a)-len(x[i]))return true;
      }
      return false;
    }
    if (lisp(a) || arrp(a))return $.has(las(a), x);
    err(end, "Can't find if a = $1 ends with x = $2", a, x);
  }
  
  function bnd(a, x, y){
    return beg(a, x) && end(a, y);
  }
  
  ////// Imperative //////
  
  //// Each ////
  
  function each(a, f){
    if (lisp(a))return (function each(a, f){
      if (nilp(a))return [];
      f(car(a));
      return each(cdr(a), f);
    })(a, jn(f));
    if (arrp(a)){
      $.each(rp(a), jn(f));
      return [];
    }
    if (objp(a)){
      $.each(a, jn(f));
      return [];
    }
    err(each, "Can't loop through each in a = $1 with f = $2", a, f);
  }
  
  function oeach(a, f){
    var x = jn(f);
    for (var i in a)x(i, a[i]);
    return [];
  }
  
  //// Array ////
  
  function psh(x, a){
    if (lisp(a)){
      if (nilp(a)){
        a[1] = [];
        a[0] = x;
        return a;
      }
      a[1] = cons(a[0], a[1]);
      a[0] = x;
      return a;
    }
    if (arrp(a)){
      $.psh(x, rp(a));
      return a;
    }
    err(psh, "Can't psh x = $1 onto a = $2", x, a);
  }
  
  function pop(a){
    if (lisp(a)){
      var x = car(a);
      if (nilp(cdr(a))){
        a.pop();
        a.pop();
      } else {
        a[0] = cadr(a);
        a[1] = cddr(a);
      }
      return x;
    }
    if (arrp(a))return chku($.pop(rp(a)));
    err(pop, "Can't pop from a = $1", a);
  }
  
  function ush(x, a){
    if (lisp(a)){
      (function ush(x, a){
        if (nilp(a)){
          psh(x, a);
          return;
        }
        ush(x, cdr(a));
      })(x, a);
      return a;
    }
    if (arrp(a)){
      $.ush(x, rp(a));
      return a;
    }
    err(ush, "Can't ush x = $1 onto a = $2", x, a);
  }
  
  function shf(a){
    if (lisp(a))return (function shf(a){
      if (nilp(a))return [];
      if (nilp(cdr(a)))return pop(a);
      return shf(cdr(a));
    })(a);
    if (arrp(a))return chku($.shf(rp(a)));
    err(shf, "Can't shf from a = $1", a);
  }
  
  ////// List //////
  
  function car(a){
    return (a[0] !== udf)?a[0]:[];
  }
  
  function cdr(a){
    return (a[1] !== udf)?a[1]:[];
  }
  
  function cons(a, b){
    return [a, b];
  }
  
  //// cxr ////
  
  function caar(a){
    return car(car(a));
  }
  
  function cadr(a){
    return car(cdr(a));
  }
  
  function cdar(a){
    return cdr(car(a));
  }
  
  function cddr(a){
    return cdr(cdr(a));
  }
  
  function cxr(x, a){
    if (udfp(a))return function (a){
      return cxr(x, a);
    };
    if ($.emp(x))return a;
    if ($.beg(x, "a"))return car(cxr($.rst(x), a));
    if ($.beg(x, "d"))return cdr(cxr($.rst(x), a));
    err(cxr, "x = $1 must only contain a's and d's", x);
  }
  
  //// General ////
  
  function lis(){
    var a = arguments;
    var r = [];
    for (var i = a.length-1; i >= 0; i--){
      r = cons(a[i], r);
    }
    return r;
  }
  
  // can't use fold because it's backwards
  /*function lis2(){
    return $.foldr(cons, [], arguments);
  }*/
  
  function lisd(){
    return $.foldr(cons, arguments);
  }
  
  function nth(n, a){
    if (!nump(n))err(nth, "Can't get item n = $1 from a = $2", n, a);
    if (le(n, "0"))return car(a);
    return nth(sub(n, "1"), cdr(a));
  }
  
  function ncdr(n, a){
    if (!nump(n))err(nth, "Can't get ncdr n = $1 of a = $2", n, a);
    if (le(n, "0"))return a;
    return ncdr(sub(n, "1"), cdr(a));
  }
  
  function nrev(a, l){
    if (udfp(l))l = [];
    var n; // n = next
    // orig: !nilp(a)
    while (consp(a)){
      n = a[1];
      a[1] = l;
      l = a;
      a = n;
    }
    return l;
  }
  
  /*function nrev(a, l){
    if (udfp(l))l = [];
    if (nilp(a))return l;
    var n = a[1];
    a[1] = l;
    return nrev(n, a);
  }*/
  
  function revlis(a, b){
    if (udfp(b))b = [];
    // orig: !nilp(a)
    while (consp(a)){
      b = cons(car(a), b);
      a = cdr(a);
    }
    return b;
  }
  
  /*function revlis(a, b){
    if (nilp(a))return b;
    return revapp(cdr(a), cons(car(a), b));
  }*/
  
  function napp(a, b, o){
    if (udfp(o))o = a;
    if (nilp(a))return o;
    // orig: !nilp(a[1])
    while (consp(a[1]))a = a[1];
    a[1] = b;
    return o;
  }
  
  /*function app2(a, b){
    if (nilp(a))return b;
    if (nilp(b))return a;
    return cons(car(a), app2(cdr(a), b));
  }*/
  
  ////// Array //////
  
  function arr(){
    return r($.cpy(arguments));
  }
  
  ////// String //////
  
  function low(a){
    if (synp(a))return $.low(a);
    if (strp(a))return s(low(rp(a)));
    err(low, "Can't lowercase a = $1", a);
  }
  
  function upp(a){
    if (synp(a))return $.upp(a);
    if (strp(a))return s(upp(rp(a)));
    err(upp, "Can't uppercase a = $1", a);
  }
  
  function stf(a){
    if ($.len(arguments) == 0)return s("");
    if (strp(a) || synp(a))return foldi(function (s, x, i){
      return rpl("$" + i, dsp(x), s);
    }, r(arguments));
    return dsp(a);
  }
  
  ////// Number //////
  
  function foldarr(f, a){
    var s = a[0];
    for (var i = 1; i < a.length; i++){
      s = f(s, a[i]);
    }
    return s;
  }
  
  function add(){
    //calls.add.push(arguments.callee.caller);
    var a = arguments;
    if (a.length == 0)return "0";
    return foldarr(R.add, a);
  }
  
  function sub(){
    var a = arguments;
    if (a.length == 0)return "0";
    if (a.length == 1)return R.neg(a[0]);
    return foldarr(R.sub, a);
  }
  
  function mul(){
    var a = arguments;
    if (a.length == 0)return "1";
    return foldarr(R.mul, a);
  }
  
  function div(){
    var a = arguments;
    if (a.length == 0)return "1";
    if (a.length == 1)return R.div("1", a[0]);
    return foldarr(R.div, a);
  }
  
  function lt(){
    var a = arguments;
    for (var i = 1; i < a.length; i++){
      if (!R.lt(a[i-1], a[i]))return false;
    }
    return true;
  }
  
  function gt(){
    var a = arguments;
    for (var i = 1; i < a.length; i++){
      if (!R.gt(a[i-1], a[i]))return false;
    }
    return true;
  }
  
  function le(){
    var a = arguments;
    for (var i = 1; i < a.length; i++){
      if (!R.le(a[i-1], a[i]))return false;
    }
    return true;
  }
  
  function ge(){
    var a = arguments;
    for (var i = 1; i < a.length; i++){
      if (!R.ge(a[i-1], a[i]))return false;
    }
    return true;
  }
  
  ////// Object //////
  
  function ohas(a, x){
    return $.ohas(a, prop(x));
  }
  
  function oput(a, x, y){
    return $.oput(a, prop(x), y);
  }
  
  function orem(a, x){
    return $.orem(a, prop(x));
  }
  
  function oref(a, x){
    return $.oref(a, prop(x));
  }
  
  function oset(a, x, y){
    return $.oset(a, prop(x), y);
  }
  
  function osetp(a, x){
    return $.osetp(a, prop(x));
  }
  
  function odel(a, x){
    return $.odel(a, prop(x));
  }
  
  function oren(a, x, y){
    return $.oren(a, prop(x), prop(y));
  }
  
  function owith(o, a, b){
    var o2 = cpy(o);
    oput(o2, a, b);
    return o2;
  }
  
  ////// Function //////
  
  function cal(a){
    return $.apl(a, $.sli(arguments, 1));
  }
  
  function scal(f){
    cal = f;
  }
  
  ////// Checkers //////
  
  function chku(a){
    return (a === udf)?[]:a;
  }
  
  function chkb(a){
    if (a === false)return [];
    if (a === true)return "t";
    return a;
  }
  
  function chrb(f){
    return $.cmb(chkb, f);
  }
  
  function bchk(a){
    return !nilp(a);
  }
  
  function bchr(f){
    return $.cmb(bchk, f);
  }
  
  ////// Error //////
  
  // special handler that uses dsp(a)
  function err(f, a){
    $.err2(f, dsj(f), rp(apl(stf, r($.sli(arguments, 1)))));
  }
  
  ////// Other //////
  
  function dol(){
    return chku($.las(arguments));
  }
  
  function do1(){
    return chku(arguments[0]);
  }
  
  gs.n = 0;
  function gs(){
    return "gs" + gs.n++;
  }
  
  function gsn(){
    return gs.n;
  }
  
  var tgsym = gs();
  
  ////// Object exposure //////
  
  var L = {
    typ: typ,
    tg: tg,
    rp: rp,
    r: r,
    s: s,
    
    nilp: nilp,
    lisp: lisp,
    atmp: atmp,
    consp: consp,
    synp: synp,
    symp: symp,
    nump: nump,
    objp: objp,
    rgxp: rgxp,
    udfp: udfp,
    tgp: tgp,
    strp: strp,
    arrp: arrp,
    fnp: fnp,
    macp: macp,
    smacp: smacp,
    spcp: spcp,
    prcp: prcp,
    
    is: is,
    iso: iso,
    isa: isa,
    inp: inp,
    
    sta: sta,
    
    dsp: dsp,
    dsj: dsj,
    
    ofn: ofn,
    ou: ou,
    out: out,
    pr: pr,
    prn: prn,
    al: al,
    
    sym: sym,
    str: str,
    str1: str1,
    num: num,
    tfn: tfn,
    tarr: tarr,
    tlis: tlis,
    tobj: tobj,
    jstr: jstr,
    jarr: jarr,
    jmat: jmat,
    jn: jn,
    jbn: jbn,
    
    ref: ref,
    set: set,
    fst: fst,
    las: las,
    
    apl: apl,
    map: map,
    mapn: mapn,
    dmap: dmap,
    pos: pos,
    has: has,
    all: all,
    keep: keep,
    rem: rem,
    remb: remb,
    reme: reme,
    rpl: rpl,
    mat: mat,
    mats: mats,
    
    len: len,
    emp: emp,
    cpy: cpy,
    cln: cln,
    rev: rev,
    
    sli: sli,
    fstn: fstn,
    rstn: rstn,
    rst: rst,
    mid: mid,
    
    spl: spl,
    grp: grp,
    par: par,
    tup: tup,
    
    joi: joi,
    fla: fla,
    app: app,
    app2: app2,
    
    evry: evry,
    
    fold: fold,
    foldi: foldi,
    foldr: foldr,
    foldri: foldri,
    
    hea: hea,
    tai: tai,
    
    beg: beg,
    end: end,
    bnd: bnd,
    
    each: each,
    oeach: oeach,
    
    psh: psh,
    pop: pop,
    ush: ush,
    shf: shf,
    
    car: car,
    cdr: cdr,
    cons: cons,
    
    caar: caar,
    cadr: cadr,
    cdar: cdar,
    cddr: cddr,
    cxr: cxr,
    
    lis: lis,
    lisd: lisd,
    nth: nth,
    ncdr: ncdr,
    nrev: nrev,
    revlis: revlis,
    napp: napp,
    
    arr: arr,
    
    low: low,
    upp: upp,
    stf: stf,
    
    add: add,
    sub: sub,
    mul: mul,
    div: div,
    
    lt: lt,
    gt: gt,
    le: le,
    ge: ge,
    
    ohas: ohas,
    oput: oput,
    orem: orem,
    oref: oref,
    oset: oset,
    osetp: osetp,
    odel: odel,
    oren: oren,
    owith: owith,
    
    cal: cal,
    scal: scal,
    
    chku: chku,
    chkb: chkb,
    chrb: chrb,
    bchk: bchk,
    bchr: bchr,
    
    err: err,
    
    dol: dol,
    do1: do1,
    gs: gs,
    gsn: gsn,
    tgsym: tgsym
  };
  
  if (nodep)module.exports = L;
  else window.L = L;
  
  ////// Speed tests //////
  
  var o = {type: "jn", data: function (a){ return a; }};
  var l = function (a){ return a; };
  
  function typ2(a){
    return a.type;
  }
  
  function a(){
    typ2(o)
  }
  
  function b(){
    typ(l)
  }
  
  //al("");
  //$.spd(a, b, 10000000);
  
  ////// Testing //////
  
  
  
})();
