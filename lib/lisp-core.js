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
  
  var fnp = L.fnp;
  var is = L.is;
  
  var r = L.r;
  
  var jn = L.jn;
  var bol = L.bol;
  var chkb = L.chkb;
  var chrb = L.chrb;
  
  var jstr = L.jstr;
  
  ////// JS functions //////
  
  function arr(){
    return r($.cpy(arguments));
  }
  
  function tfn(a){
    if (fnp(a))return a;
    return function (x){
      return chkb(is(x, a));
    };
  }
  
  function prsl(a){
    return prs(jstr(a));
  }
  
  jn({
    dsp: L.dsp,
    
    ou: L.ou,
    out: L.out,
    pr: L.pr,
    prn: L.prn,
    al: L.al,
    
    sym: L.sym,
    str: L.str,
    num: L.num,
    tfn: tfn,
    tarr: L.tarr,
    tlis: L.tlis,
    tobj: L.tobj,
    
    map: L.map,
    dmap: L.dmap,
    pos: L.pos,
    has: chrb(L.has),
    all: chrb(L.all),
    keep: L.keep,
    rem: L.rem,
    rpl: L.rpl,
    mat: L.mat,
    mats: L.mats,
    
    len: L.len,
    emp: chrb(L.emp),
    cpy: L.cpy,
    cln: L.cln,
    rev: L.rev,
    nrev: L.nrev,
    
    sli: L.sli,
    fstn: L.fstn,
    rstn: L.rstn,
    rst: L.rst,
    mid: L.mid,
    
    spl: L.spl,
    grp: L.grp,
    par: L.par,
    tup: L.tup,
    
    joi: L.joi,
    fla: L.fla,
    app: L.app,
    
    evry: L.evry,
    
    fold: L.fold,
    foldi: L.foldi,
    foldr: L.foldr,
    foldri: L.foldri,
    
    hea: L.hea,
    tai: L.tai,
    
    beg: chrb(L.beg),
    end: chrb(L.end),
    bnd: chrb(L.bnd),
    
    eachfn: L.each,
    oeachfn: L.oeach,
    
    psh: L.psh,
    pop: L.pop,
    ush: L.ush,
    shf: L.shf,
    
    ncdr: L.ncdr,
    lisd: L.lisd,
    
    arr: L.arr,
    
    low: L.low,
    upp: L.upp,
    stf: L.stf,
    
    odd: chrb(R.oddp),
    evn: chrb(R.evnp),
    
    "+": L.add,
    "-": L.sub,
    "*": L.mul,
    "/": L.div,
    
    rnd: function rnd(a, p){
           return R.rnd(a, $.num(p));
         },
    
    ohas: chrb(L.ohas),
    oput: L.oput,
    orem: L.orem,
    oref: L.oref,
    oset: L.oset,
    osetp: chrb(L.osetp),
    odel: L.odel,
    oren: L.oren,
    owith: L.owith,
    
    err: L.err,
    prs: prsl
  });
  
  bol({
    ">": L.gt,
    "<": L.lt,
    ">=": L.ge,
    "<=": L.le
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
