/***** Lisp Interpreter Devel *****/

/* require tools >= 3.1 */
/* require lisp-tools */

(function (win, udf){
  ////// Import //////
  
  var typ = L.typ;
  var tg = L.tg;
  var rp = L.rp;
  var s = L.s;
  
  var nilp = L.nilp;
  var lisp = L.lisp;
  var atmp = L.atmp;
  var consp = L.consp;
  var synp = L.synp;
  var symp = L.symp;
  var nump = L.nump;
  var objp = L.objp;
  var rgxp = L.rgxp;
  var udfp = L.udfp;
  var tgp = L.tgp;
  var strp = L.strp;
  var arrp = L.arrp;
  var fnp = L.fnp;
  var macp = L.macp;
  var smacp = L.smacp;
  var spcp = L.spcp;
  var prcp = L.prcp;
  
  var is = L.is;
  
  var sta = L.sta;
  
  var ofn = L.ofn;
  
  var tarr = L.tarr;
  var tobj = L.tobj;
  var jarr = L.jarr;
  
  var map = L.map;
  var has = L.has;
  
  var rst = L.rst;
  var mid = L.mid;
  
  var app = L.app;
  
  var beg = L.beg;
  
  var car = L.car;
  var cdr = L.cdr;
  var cons = L.cons;
  
  var caar = L.caar;
  var cadr = L.cadr;
  var cdar = L.cdar;
  var cddr = L.cddr;
  var cxr = L.cxr;
  
  var lis = L.lis;
  var nth = L.nth;
  
  var nrev = L.nrev;
  var revlis = L.revlis;
  var napp = L.napp;
  
  var sub = L.sub;
  
  var oput = L.oput;
  
  var scal = L.scal;
  
  var chku = L.chku;
  var chkb = L.chkb;
  var chrb = L.chrb;
  
  var err = L.err;
  
  var dol = L.dol;
  var gs = L.gs;
  
  var tgsym = L.tgsym;
  
  ////// Optimization //////
  
  function no(a){
    return a.length === 0;
  }
  
  ////// Lisp evaluator //////
  
  var envs = [];
  /*function evl(a, env){
    if (udfp(env))env = glbs;
    return sta(envs, env, function (){
      return evl2(a, env);
    });
  }*/
  
  function evl(a, env){
    if (env === udf)env = glbs;
    $.L.psh(env, envs);
    try {
      return evl1(a, env);
    } finally {
      $.L.pop(envs);
    }
  }
  
  function evl1(a, env){
    if (!$.arrp(a)){ // sym/num, rgx, obj, jfn
      if (symp(a)){
        var x = get(a, env);
        if (smacp(x))return evl1(apl(rp(x), []), env);
        return x;
      }
      return a;
    }
    if (a.length !== 2)return a; // nil, str, arr, other tags
    var o = evl1(car(a), env);
    if (tgp(o)){ // orig: spcp(o)
      switch (o[1]){ // orig: typ(o); o[1] is the tag type
        case "mac": return evl1(apl(o[2], cdr(a)), env);
        case "spc": return espc(o[2], cdr(a), env);
      }
    }
    return apl(o, elis(cdr(a), env));
  }
  
  /*function evl12(a, env){
    if (atmp(a)){
      if (symp(a)){
        var x = get(a, env);
        if (smacp(x))return evl1(apl(rp(x), []), env);
        return x;
      }
      return a;
    }
    var o = evl1(car(a), env);
    if (spcp(o)){
      switch (typ(o)){
        case "mac": return evl1(apl(rp(o), cdr(a)), env);
        case "spc": return espc(rp(o), cdr(a), env);
      }
    }
    return apl(o, elis(cdr(a), env));
  }*/
  
  
  
  function espc(f, a, env){
    switch (f){
      case "qt": return car(a);
      case "qq": return eqq(car(a), env);
      case "=": return set(car(a), evl1(cadr(a), env), env);
      case "var": return put(car(a), evl1(cadr(a), env), env);
      case "if": return eif(a, env);
      case "fn": return fn(car(a), cons("do", cdr(a)), env);
      case "mc": return mc(car(a), cons("do", cdr(a)), env);
      case "evl": return evl1(evl1(car(a), env), env);
      case "while": return ewhi(car(a), cdr(a), env);
      case "set?": return esetp(evl1(car(a), env), env);
      case "obj": return eobj(a, env);
      case "cat": return ecat(a, env);
      case "thr": return ethr(a, env);
      case "smc": return smc(cons("do", a), env);
      case "brk": return ebrk(a, env);
      case "cont": return econt(a, env);
      case "prot": return eprot(a, env);
    }
    err(espc, "Unknown spcial prcedure f = $1", f);
  }
  
  function apl(a, x){
    var tp = typ(a);
    switch (tp){
      case "fn": return afn(a, x);
      case "jn": return $.apl(a, jarr(x));
      case "jn2": return ajn2(a, x);
      case "sym": 
      case "num": return asyn(a, x);
      case "str": return astr(a, x);
      case "arr": return chku(rp(a)[car(x)]);
      case "obj": return aobj(a, x);
      case "lis": return nth(car(x), a);
    }
    err(apl, "Can't apl a = $1 to x = $2", a, x);
  }
  
  /*function par(a, b, env){
    if (nilp(a))return [];
    if (atmp(a))return wobj(a, udfp(b)?[]:b, env);
    if (a[0] === "o")return wobj(cadr(a), udfp(b)?evl1(nth("2", a), env):b, env);
    if (b === udf)b = [];
    return napp(par(car(a), nilp(b)?udf:car(b), env), par(cdr(a), cdr(b), env));
  }*/
  
  function par(a, b, env){
    if (!$.arrp(a))return wobj(a, udfp(b)?[]:b, env);
    if (a.length === 0)return [];
    if (a[0] === tgsym)return wobj(a, udfp(b)?[]:b, env);
    if (a[0] === "o")return wobj(cadr(a), udfp(b)?evl1(nth("2", a), env):b, env);
    if (b === udf)b = [];
    return napp(par(car(a), nilp(b)?udf:car(b), env), par(cdr(a), cdr(b), env));
  }
  
  function parenv(a, b, env){
    par(a, b, env);
    return env;
  }
  
  /*function par2(a, b){
    if (nilp(a))return [];
    if (atmp(a))return lis(cons(a, b));
    return app(par2(car(a), car(b)), par2(cdr(a), cdr(b)));
  }*/
  
  function wobj(a, b, o){
    oput(o, a, b);
    return lis(cons(a, b));
  }
  
  function afn(a, x){
    var env = {0: rp(a, "2")};
    return evl(rp(a, "1"), parenv(rp(a, "0"), x, env));
  }
  
  function ajn2(a, x){
    var env = {0: glbs};
    return $.apl(rp(a, "1"), jarr(map(cdr, par(rp(a, "0"), x, env))));
  }
  
  function asyn(a, x){
    return chku(a[car(x)]);
  }
  
  /*function astr(a, x){
    if (nilp(cdr(x))){
      var str = chku(rp(a)[car(x)]);
      return nilp(s)?[]:s(str);
    }
    return s($.sli(rp(a), car(x), cadr(x)));
  }*/
  
  function astr(a, x){
    var str = chku(rp(a)[car(x)]);
    return nilp(str)?[]:s(str);
  }
  
  function aobj(a, x){
    var k = car(x);
    if (synp(k))return chku(a[k]);
    if (strp(k))return chku(a[rp(k)]);
    err(aobj, "Invalid object property name car(x) = $1", k);
  }
  
  function elis(a, env){
    var r = []; var x;
    // orig: !nilp(a)
    while (consp(a)){
      // can't use nrevapp here because the spliced list might still
      //   be used
      x = a[0];
      if (car(x) === "splice")r = revlis(evl1(cadr(x), env), r);
      else r = cons(evl1(car(a), env), r);
      a = a[1];
    }
    return nrev(r);
  }
  
  /*function elis2(a, env){
    if (no(a))return [];
    if (is(caar(a), "splice"))return app(evl1(cadar(a), env), elis(cdr(a), env));
    return cons(evl1(car(a), env), elis(cdr(a), env));
  }
  
  function cadar(a){
    return car(cdr(car(a)));
  }*/
  
  var qgs = {};
  function eqq(a, env){
    if (env === udf)env = glbs;
    var prev = qgs;
    try {
      qgs = {};
      return eqq1(a, env, 1);
    } finally {
      qgs = prev;
    }
  }
  
  function eqq1(a, env, lvl){
    if (atmp(a))return a;
    switch (car(a)){
      case "uq":
        return euq(cadr(a), env, lvl-1).d;
      case "qq":
        return lis(car(a), eqq1(cadr(a), env, lvl+1));
      case "qgs":
        var t = cadr(a);
        if (!udfp(qgs[t]))return qgs[t];
        return qgs[t] = gs();
    }
    var r = eqq2(car(a), env, lvl);
    return r.f(r.d, eqq1(cdr(a), env, lvl));
  }
  
  function euq(a, env, lvl){
    if (lvl == 0)return {evp: true, d: evl1(a, env)};
    if (atmp(a))return {evp: false, d: lis("uq", a)};
    if (car(a) == "uq"){
      var r = euq(cadr(a), env, lvl-1);
      if (r.evp)return r;
      return {evp: false, d: lis("uq", r.d)};
    }
    return {evp: false, d: lis("uq", eqq1(a, env, lvl))};
  }
  
  function eqq2(a, env, lvl){
    if (atmp(a))return {f: cons, evp: false, d: a};
    switch (car(a)){
      case "uq":
        if (lvl == 1)return {f: cons, evp: true, d: evl1(cadr(a), env)};
        var r = eqq2(cadr(a), env, lvl-1);
        if (r.evp)return r;
        return {f: cons, evp: r.evp, d: lis("uq", r.d)};
      case "uqs":
        if (lvl == 1)return {f: app, evp: true, d: evl1(cadr(a), env)};
        return {f: cons, evp: false, d: eqq1(a, env, lvl-1)};
    }
    return {f: cons, evp: false, d: eqq1(a, env, lvl)};
  }
  
  function eif(a, env){
    if (no(a))return [];
    if (no(cdr(a)))return evl1(car(a), env);
    if (!nilp(evl1(car(a), env)))return evl1(cadr(a), env);
    return eif(cddr(a), env);
  }
  
  function eif2(a, env){
    while (true){
      if (no(a))return [];
      if (no(cdr(a)))return evl1(car(a), env);
      if (!nilp(evl1(car(a), env)))return evl1(cadr(a), env);
      a = cddr(a);
    }
  }
  
  function fn(args, expr, env){
    return tg("fn", args, expr, env);
  }
  
  function mc(args, expr, env){
    return tg("mac", fn(args, expr, env));
  }
  
  function smc(expr, env){
    return tg("smac", fn([], expr, env));
  }
  
  function ewhi(cond, body, env){
    while (!nilp(evl1(cond, env))){
      try {
        evl1(cons("do", body), env);
      } catch (e){
        if (is(typ(e), "break"))break;
        if (is(typ(e), "continue"))continue;
        throw e;
      }
    }
    return [];
  }
  
  function ebrk(a, env){
    throw tg("break", []);
  }
  
  function econt(a, env){
    throw tg("continue", []);
  }
  
  function esetp(a, env){
    if (udfp(env)){
      if (is(a, "nil") || has(/^c[ad]+r$/, a))return "t";
      return [];
    }
    if (udfp(env[a]))return esetp(a, env[0]);
    return "t";
  }
  
  function eobj(a, env, o){
    if (udfp(o))o = {};
    if (nilp(a))return o;
    o[eprop(car(a))] = evl1(cadr(a), env);
    return eobj(cddr(a), env, o);
  }
  
  function eprop(a){
    if (synp(a))return a;
    if (strp(a))return a[1];
    err(eprop, "Invalid object property name a = $1", a);
  }
  
  function ecat(a, env){
    var obj = evl1(car(a), env);
    try {
      return evl1(cons("do", cdr(a)), env);
    } catch (e){
      if (is(typ(e), "throw") && is(rp(e).obj, obj)){
        return rp(e).ret;
      }
      throw e;
    }
  }
  
  function ethr(a, env){
    throw tg("throw", {obj: evl1(car(a), env), ret: evl1(cadr(a), env)});
  }
  
  function eprot(a, env){
    try {
      return evl1(car(a), env);
    } finally {
      evl1(cons("do", cdr(a)), env);
    }
  }
  
  function cal(a){
    return apl(a, $.apl(lis, $.sli(arguments, 1)));
  }

  function calsym(a){
    return apl(glb(a), $.apl(lis, $.sli(arguments, 1)));
  }
  
  scal(cal);
  
  ////// Variables //////
  
  function get(a, env){
    while (true){
      if (env === udf){
        if (a === "nil")return [];
        if (has(/^c[ad]+r$/, a))return cxr(mid(a));
        err(get, "Unknown variable a = $1", a);
      }
      if (env[a] !== udf)return env[a];
      env = env[0];
    }
  }
  
  /*function get2(a, env){
    if (env === udf){
      if (a === "nil")return [];
      if (has(/^c[ad]+r$/, a))return cxr(mid(a));
      err(get, "Unknown variable a = $1", a);
    }
    if (env[a] === udf)return get(a, env[0]);
    return env[a];
  }*/
  
  function put(a, x, env){
    return env[a] = x;
  }
  
  function set(a, x, env){
    if (atmp(a)){
      if (symp(a))return ssym(a, x, env, env);
      err(set, "Can't set a = $1 to x = $2", a, x);
    }
    var o = evl1(car(a), env);
    if (spcp(o)){
      switch (typ(o)){
        case "mac": return set(apl(rp(o), cdr(a)), x, env);
        case "spc": err(set, "Can't set a = $1 to x = $2", a, x);
      }
    }
    return slis(o, elis(cdr(a), env), x);
  }
  
  function ssym(a, x, topenv, env){
    if (udfp(env))return put(a, x, topenv);
    if (udfp(env[a]))return ssym(a, x, topenv, env[0]);
    return put(a, x, env);
  }
  
  function slis(f, a, x){
    if (fnp(f)){
      if (f === car)return car(a)[0] = x;
      if (f === cdr)return car(a)[1] = x;
      if (f === nth)return L.set(cadr(a), car(a), x);
      err(slis, "Can't set f = $1 of a = $2 to x = $3", f, a, x);
    }
    if (arrp(f))return rp(f)[car(a)] = x;
    if (objp(f))return f[car(a)] = x;
    if (lisp(f))return L.set(f, car(a), x);
    err(slis, "Can't set list with f = $1 and a = $2 to x = $3", f, a, x);
  }
  
  ////// Global environment //////
  
  var glbs = {};
  
  /*var glb = $.man2(a, b){
    put(a, b, glbs);
  }*/
  
  function glb(a){
    return get(a, glbs);
  }
  
  var sglb = $.man2(function (a, b){
    put(a, b, glbs);
  });
  
  sglb("t", "t");
  sglb("$", $.cpyobj($));
  
  //// Specials ////
  
  var spc = $.man1(function (a){
    sglb(a, tg("spc", a));
  });
  
  spc("qt", "qq", "=", "var", "if", "fn", "mc", "smc",
      "evl", "while", "set?", "obj", "cat", "thr",
      "brk", "cont", "prot");
  
  //// JS functions ////
  
  var jn = $.man2(function (a, b){
    if ($.fnp(b))sglb(a, b);
    else sglb(a, tg("jn2", prs(b[0]), b[1]));
  });
  
  jn({
    car: car,
    cdr: cdr,
    cons: cons,
    
    caar: caar,
    cdar: cdar,
    cadr: cadr,
    cddr: cddr,
    
    typ: typ,
    tg: tg,
    rp: rp,
    
    is: chrb(is),
    
    lis: lis,
    
    do: dol,
    gs: gs,
    
    apl: apl,
    
    "*out*": function (a){return [];}
  });
  
  ofn(function (a){
    return cal(get("*out*", car(envs)), a);
  });
  
  //// Booleans ////
  
  var bol = $.man2(function (a, b){
    jn(a, chrb(b));
  });
  
  bol({
    "lis?": lisp,
    "atm?": atmp,
    "nil?": nilp,
    "syn?": synp,
    "sym?": symp,
    "num?": nump,
    "obj?": objp,
    "rgx?": rgxp,
    "tg?": tgp,
    "str?": strp,
    "arr?": arrp,
    "fn?": fnp,
    "mac?": macp,
    "spc?": spcp,
    "prc?": prcp
  });
  
  ////// Object exposure //////
  
  $.att({
    envs: envs,
    evl: evl,
    evl1: evl1,
    apl: apl,
    cal: cal,
    calsym: calsym,
    
    glbs: glbs,
    glb: glb,
    sglb: sglb,
    jn: jn,
    bol: bol
  }, L);
  
  ////// Testing //////
  
  
  
})(window);
