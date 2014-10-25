/***** Lisp Core Devel *****/

/* require tools >= 3.1 */
/* require ajax >= 4.1 */
/* require lisp-tools */
/* require lisp-parse */
/* require lisp-exec */

(function (win, udf){
  ////// Import //////
  
  var dsj = L.dsj;
  var prs = L.prs;
  var evl = L.evl;
  
  var chrb = L.chrb;
  
  var djn = L.djn;
  var bol = L.bol;
  
  var ofn = L.ofn;
  var cal = L.cal;
  var get = L.xget;
  
  ////// JS functions //////
  
  djn({
    typ: function ltyp(a){
           return L.sy(L.typ(a));
         },
    tag: L.tag,
    rep: L.rep,
    det: L.det,
    dat: L.dat,
    sdat: L.sdat,
    
    mkdat: function lmkdat(t, d){
             return L.mkdat(L.jstr(t), d);
           },
    mkbui: function lmkbui(t){
             return L.jn(L.mkbui(t));
           },
           
    car: L.car,
    cdr: L.cdr,
    gcar: L.gcar,
    gcdr: L.gcdr,
    cons: L.cons,
    scar: L.scar,
    scdr: L.scdr,
    lis: L.lis,
    lisd: L.lisd,
    arr: L.arr,
    
    caar: L.caar,
    cdar: L.cdar,
    cadr: L.cadr,
    cddr: L.cddr
  });
  
  bol({
    isa: function lisa(t, a){
           return L.isa(L.jstr(t), a);
         },
    isany: function lisany(t){
             var r = $.cpy(arguments);
             r[0] = L.jstr(t);
             return $.apl(L.isany, r);
           },
    typin: function ltypin(a){
             var tp = L.typ(a);
             var t = arguments;
             for (var i = 1; i < t.length; i++){
               if (tp === L.jstr(t[i]))return true;
             }
             return false;
           }
  });
  
  djn({
    mkpre: function lmkpre(t){
             return L.jn(L.mkpre(L.jstr(t)));
           }
  });
  
  bol({
    "tag?": L.tagp,
    "lis?": L.lisp,
    "atm?": L.atmp,
    "nil?": L.nilp,
    "cons?": L.consp,
    "syn?": L.synp,
    "sym?": L.symp,
    "num?": L.nump,
    "obj?": L.objp,
    "rgx?": L.rgxp,
    "str?": L.strp,
    "arr?": L.arrp,
    "fn?": L.fnp,
    "jn?": L.jnp,
    "mac?": L.macp,
    "spec?": L.specp,
    "prc?": L.prcp,
    
    is: L.is,
    isn: L.isn,
    iso: L.iso,
    "in": L.inp
  });
  
  djn({
    //sta: L.sta,  stack should be done by macro
    
    dsp: L.dsp,
    
    ou: L.ou,
    out: L.out,
    pr: L.pr,
    prn: L.prn,
    al: L.al,
    
    sym: L.sym,
    str: L.str,
    str1: L.str1,
    num: L.num,
    tfn: L.tfn,
    tarr: L.tarr,
    tlis: L.tlis,
    tobj: L.tobj,
    
    ref: L.ref,
    ref1: L.ref1,
    set: L.set,
    fst: L.fst,
    las: L.las,
    
    apl: L.apl,
    cal: ["(f . a)", L.apl],
    //cal: L.cal,   would convert args to js arr then back to lisp list
    map: L.map,
    //dmap: L.dmap,
    pos: L.pos,
    has: chrb(L.has),
    //all: chrb(L.all),
    //keep: L.keep,
    rem: L.rem,
    rpl: L.rpl,
    //mat: L.mat,
    //mats: L.mats,
    
    len: L.len,
    emp: chrb(L.emp),
    cpy: L.cpy,
    //cln: L.cln,
    rev: L.rev,
    nrev: L.nrev,
    
    sli: L.sli,
    fstn: L.fstn,
    rstn: L.rstn,
    rst: L.rst,
    mid: L.mid,
    
    spl: L.spl,
    grp: L.grp,
    //par: L.par,
    //tup: L.tup,
    
    joi: L.joi,
    fla: L.fla,
    app: L.app,
    
    //evry: L.evry,
    
    fold: L.fold,
    foldi: L.foldi,
    foldr: L.foldr,
    foldri: L.foldri,
    
    hea: L.hea,
    tai: L.tai,
    
    beg: chrb(L.beg),
    //end: chrb(L.end),
    //bnd: chrb(L.bnd),
    
    //eachfn: L.each,
    //oeachfn: L.oeach,
    
    psh: L.psh,
    pop: L.pop,
    //ush: L.ush,
    //shf: L.shf,
    
    nth: L.nth,
    ncdr: L.ncdr,
    nrev: L.nrev,
    //napp: L.napp,
    
    low: L.low,
    upp: L.upp,
    stf: L.stf,
    
    odd: chrb(L.oddp),
    evn: chrb(L.evnp),
    
    "+": L.add,
    "-": L.sub,
    "*": L.mul,
    "/": L.div
  });
  
  bol({
    ">": L.gt,
    "<": L.lt,
    ">=": L.ge,
    "<=": L.le
  });
  
  djn({
    rnd: L.rnd,
    
    ohas: chrb(L.ohas),
    oput: L.oput,
    orem: L.orem,
    oref: L.oref,
    oset: L.oset,
    "oset?": chrb(L.osetp),
    odel: L.odel,
    oren: L.oren,
    owith: L.owith,
    
    err: function lerr(f, a){
           $.err2(f, L.dsj(f), L.dat($.apl(L.stf, $.sli(arguments, 1))));
         },
    
    do: L.dol,
    //do1: do1,  convert list to arr then get first item?
    gs: L.gs,
    gsn: function lgsn(){
           return L.nu($.str(L.gsn()));
         },
    
    prs: function lprs(a){
           return L.prs(L.jstr(a));
         },
    "=nm": L.setnm,
    "*out*": function (a){return L.nil();}
  });
  
  ofn(function (a){
    return cal(get("*out*"), a);
  });
  
  ////// Import lisp //////
  
  function prsf(a){
    return prs($.get(a));
  }
  
  // eval string
  function evls(a){
    return dsj(evl(prs(a)));
  }
  
  function evlf(a){
    return evls($.get(a));
  }
  
  evlf("lib/lisp-core.lisp");
  
  ////// Object exposure //////
  
  $.att({
    prsf: prsf,
    evls: evls,
    evlf: evlf
  }, L);
  
  ////// Testing //////
  
  
  
})(window);
