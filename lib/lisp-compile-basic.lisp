;;;; Compiler ;;;;

#|
Examples:

(prn (cmp '(js-loop (set x 3) (lt x 5) (pp x) (js-def hey (a b c) (js-if test 1 2 3 4 5)) 3 4 5)))

|#

;;; Main compile ;;;

(def cmp (a)
  (proc (cmp1 a)))

; numbers are sent to the cal js procedure
; symbols are sent to sym
; strings are sent to str
; nil is sent to sym as 'nil
; the cal procedure is used for calls that aren't
;   defined as procedures or macros

(def cmp1 (a)
  (if (atm? a)
    (case a
      nil? (send 'nil)
      num? (call num a)
      sym? (if (smset? a) (send (xsmcal a))
               (call sym a))
      str? (call str a)
      (err cmp1 "Unknown atom a = $1" a))
    (cmp1l (car a) (cdr a))))

(def cmp1l (e a)
  (if (atm? e)
    (if (sym? e)
      (if (smset? e) (send (cons (xsmcal e) a))
          (mset? e) (send (xmcal e a))
          (sset? e) (xscal e a)
          (cprc e @a))
      (call cal e @a))
    (cmp1ll (car e) (cdr e) a)))

(def cmp1ll (e a b)
  (if (atm? e)
    (if (sym? e)
      (if (mmset? e) (send (xmmcal e a b))
          (call cal (cons e a) @b))
      (call cal (cons e a) @b))
    (call cal (cons e a) @b)))

#|
(send a) -> compile a
(call p @a) -> call jsprc p with args a
(chan a) -> cancel current compilation and (send a) instead
(pass p @a) -> cancel current compilation and (call p @a) instead
|#

(def send (a)
  (cmp1 a))

(mac call (p . a)
  ;(al "res = $1" `(send (lis ',(app 'js- p) ,@a)))
  `(send (lis ',(app 'js- p) ,@a)))

;;; Procedures ;;;

(var *prcs* {})

(var *curropt* {})

; set option nm to val
(mac opt (nm val)
  `(do (= (. *curropt* ,nm) ,val)
       nil))

(def opsfr1 (ob a)
  `(if (ohas (. ,ob opt) ',a) (opt ,a (. ,ob opt ,a))))

; use options in a from rt obj ob
(mac opsfr (ob . a)
  `(do ,@(map [opsfr1 ob _] a)))

; copy options in ops from rt obj in (do @a) and return rt obj
(mac cpops (ops . a)
  `(let #r (do ,@a)
     (opsfr #r ,@ops)
     #r))

; define procedure
(mac defprc (nm ag . bd)
  `(= (. *prcs* ,nm)
      (fn ,ag
        (blk ,nm
          (mwith ((chan (a) `(retfr ,,nm (send ,a)))
                  (pass (p . a)
                    `(retfr ,,nm (call ,p ,@a))))
            (dyn *curropt* {}
              (rt ',nm (do ,@bd) *curropt*)))))))

(def cprc (p . a)
  (if (beg p 'js-)
        (let f (*prcs* (sli p 3))
          (if (no f) (err cprc "Unknown p = $1" p)
              (f @a)))
      (call cal p @a)))

;;; Macros ;;;

(mkoacc spec s)
(mkoacc macs m)
(mkoacc smacs sm)
(mkoacc mmacs mm)

; mmacs can be used to optimize exprs like
;   ((dtfn test) a x y z)
;   to ((. a test) x y z)
;   or ((combine f g) a b c)
;   to (f (g a b c))

(def xscal (e a)
  ((sref e) @a))

(def xmcal (e a)
  ((mref e) @a))

(def xsmcal (a)
  ((smref a)))

(def xmmcal (e a b)
  ((mmref e) a b))

; (xmac ...) should be the same thing as running
;   (js-mac ...) in the compiler
(mac xmac (nm ag . bd)
  `(mput ',(app 'js- nm) (fn ,ag ,@bd)))

(xmac exe a
  (evl `(do ,@a)))

(xmac mac (nm ag . bd)
  (mput nm (evl `(fn ,ag ,@bd)))
  nil)

(xmac dmac (nm)
  (mdel nm)
  nil)

(xmac rmac (fr to)
  (mren fr to)
  nil)

(xmac smac (nm . bd)
  (smput nm (evl `(fn () ,@bd)))
  nil)

(xmac dsmac (nm)
  (smdel nm)
  nil)

(xmac rsmac (fr to)
  (smren fr to)
  nil)

(xmac mmac (nm ag1 ag2 . bd)
  (mmput nm (evl `(fn (,ag1 ,ag2) ,@bd)))
  nil)

(xmac dsmac (nm)
  (mmdel nm)
  nil)

(xmac rsmac (fr to)
  (mmren fr to)
  nil)

; special procedures are not compiled again after they are run
; this means the return value should already be compiled
(mac xspec (nm ag . bd)
  `(sput ',(app 'js- nm) (fn ,ag ,@bd)))

(xspec cdo1 (a . bd)
  (let r (send a)
    (send `(do ,@bd))
    r))

(xspec mblk a
  (mlay)
  (let r (send `(do ,@a))
    (mulay)
    r))

(xspec smblk a
  (smlay)
  (let r (send `(do ,@a))
    (smulay)
    r))

(xspec mmblk a
  (mmlay)
  (let r (send `(do ,@a))
    (mmulay)
    r))

(mac xmmac (nm ag1 ag2 . bd)
  `(mmput ',(app 'js- nm) (fn (,ag1 ,ag2) ,@bd)))

; ((dtfn a b c) x 1 2 3)
; -> ((. x a b c) 1 2 3)
(xmmac dtfn a (x . args)
  `((. ,x ,@a) ,@args))

; ((combine a b c) 1 2 3)
; -> (a (b (c 1 2 3)))
(xmmac combine fs args
  (foldr lis `(,(las fs) ,@args) (but fs)))

;;; Places ;;;

; *ps* = places
(var *ps* nil)

(mac stapla (p . a)
  `(sta *ps* ,p ,@a))

(mac wpla (p a)
  `(stapla ,p (place ,a)))

(mac cpla (p a)
  `(wpla ,p (send ,a)))

(def currpla ()
  (car *ps*))

(def getps ()
  *ps*)

; does any operations (such as adding parens, order of operations)
;   needed to put a into the env defined by *ps*;
;   should be overridden for the target language
(def place (a)
  a)

; compile all in list a in place p
(def cpa (p a)
  (map [cpla p _] a))

; define place; should be overridden to define options that
;   will be used by place
(mac defpla (a . opt)
  nil)

; define rt (return object)
(mac defrt (a . opt)
  nil)

;;; JS Places ;;;

; block places include the top level, inside a function, a while, an if...
; a block rt is anything that needs to be placed inside a block

(var *blkpla* nil)
(var *blkrts* nil)

(def inblk? ()
  (or (no (currpla))
      (has (currpla) *blkpla*)))

(def blk? (a)
  (has (. a tp) *blkrts*))

; return places include the end of a function and inside
;   a ret expression
; an end place is a place that carries over returns, but isn't a
;   ret place itself

(var *retpla* nil)
(var *endpla* nil)

(def inret? ((o ps (getps)))
  (if (no ps) nil
      (has (car ps) *retpla*) t
      (has (car ps) *endpla*) (inret? (cdr ps))
      nil))

; the ret rt option signals whether the code inside always returns
; the thr option signals whether the code always throws
; the brk option signals whether the code always breaks
; exi? says whether the code always exits, whether by ret, thr, or brk

(def ret? (a)
  (. a opt ret))

(def thr? (a)
  (. a opt thr))

(def brk? (a)
  (. a opt brk))

(def exi? (a)
  (or (ret? a) (thr? a) (brk? a)))

; the bra option says whether the code needs braces
(def bra? (a)
  (. a opt bra))

(def needbra? (a)
  ;(bug a (. a opt) (ohas (. a opt) 'bra) (bra? a))
  (unless (is (. a typ) 'rt) (err needbra? "a = $1 must be a rt" a))
  (and (ohas (. a opt) 'bra)
       (bra? a)))

(def mkbra (a)
  (lns "{" (ind 2 a) "}"))

; add bracket if a needs it
(def chkbra (a)
  (if (needbra? a) (mkbra a)
      a))

; *reqbrac* is a list of lists
; each list is of the form (rt pl) which specifies that
;   when a rt obj of type rt is placed in a place pl, it requires brackets
(var *reqbrac* nil)

; ex. (defreq doln inln)
(mac defreq (rt pl)
  `(psh '(,rt ,pl) *reqbrac*))

; ex. (reqbrac 'doln 'inln)
(def reqbrac? (rt pl)
  (has [iso _ (lis rt pl)] *reqbrac*))

; a should always be a rt
(def place (a)
  ;(bugm "place" a (inblk?) (blk? a) (inret?))
  (if (inblk?)
        (if (blk? a) a
            (no (inret?))
              (do (when (is (. a tp) 'fn)
                    (= a (mapdat [lin "(" _ ")"] a)))
                  (mapdat [lin _ ";"] a))
            (rt (. a tp) (lin "return " (. a dat) ";")
                (owith (. a opt) 'ret t)))
      (blk? a) (err place "Can't place blk $1 inside inline place $2"
                          a (currpla))
      (reqbrac? (. a tp) (currpla))
        (mapdat [lin "(" _ ")"] a)
      a))

; define whether your place is a blk or a ret or end
(mac defpla (a . opt)
  `(with (#a ',a #opt '(,@opt))
     (if (has 'blk #opt) (psh #a *blkpla*))
     (if (has 'ret #opt) (psh #a *retpla*))
     (if (has 'end #opt) (psh #a *endpla*))
     nil))

; define whether your rt is a blk
(mac defrt (a . opt)
  `(with (#a ',a #opt '(,@opt))
     (if (has 'blk #opt) (psh #a *blkrts*))
     nil))

;;; JS Procedures ;;;

(defprc num (a)
  (str a))

(defprc sym (a)
  (jvar a))

(defprc str (a)
  (dsp a))

; is a already a js variable
(def jvar? (a)
  (has #"^[a-zA-Z$_][a-zA-Z0-9$_]*$" a))

; is a suitable for conversion?
(def var? (a)
  (has #"^\*?[a-zA-Z$_*/+-^=!][a-zA-Z0-9$_*/+-^=!?-]*\*?$" a))

; convert lisp sym to js variable
; todo: *var* -> VAR
; * -> mul
; / -> div
; + -> add
; - -> sub
; ^ -> pow
; ! -> bang
; ? -> p
; a-test -> aTest
(def jvar (a)
  (if (jvar? a) (str a)
      (var? a)
        (let s ""
          (idx i a
            (case (a i)
              '- (if (is i 0) (app= s "sub")
                   (do (app= s (upp (a (+ i 1))))
                       (++ i)))
              '* (app= s "mul")
              '/ (app= s "div")
              '+ (app= s "add")
              '^ (app= s "pow")
              '! (app= s "bang")
              '? (app= s "p")
              (app= s (a i))))
          s)
      (err jvar "Can't coerce a = $1 to jvar" a)))

(defprc cal (nm . ag)
  (lin (cpla 'refee nm) (mpar ag)))

(def mpar (a)
  (lin "(" (btwa (cpa 'inln a) ", ") ")"))

(defprc do a
  (if (no a) (chan nil)
      (no (cdr a)) (chan (car a))
      (inblk?) (cdo @a)
      (pass doln @a)))

(def cdo a
  (let fst (cpla 'do (car a))
    (if (redun? fst) (pass do @(cdr a))
        (do (opt bra t)
            (lns fst (cdo2 @(cdr a)))))))

; same as cdo but don't pass to do and process last one differently
(def cdo2 a
  (if (no (cdr a))
        (cpops (ret thr brk)
          (cpla 'dolas (car a)))
      (let fst (cpla 'do (car a))
        (if (redun? fst) (cdo2 @(cdr a))
            (lns fst (cdo2 @(cdr a)))))))

(defpla do blk)
(defpla dolas blk end)
(defrt do blk)

(defprc doln a
  (if (no a) (chan nil)
      (no (cdr a)) (chan (car a))
      (cdoln @a)))

(def cdoln a
  (let fst (cpla 'doln (car a))
    (if (redun? fst) (pass do @(cdr a))
        (lin fst ", " (cdoln2 @(cdr a))))))

; same as cdoln but don't pass to do
(def cdoln2 a
  (let fst (cpla 'doln (car a))
    (if (no (cdr a)) fst
        (redun? fst) (cdoln2 @(cdr a))
        (lin fst ", " (cdoln2 @(cdr a))))))

; putting a doln rt into an inln pla requires brackets
(defreq doln inln)

(def redun? (a)
  ;(al "a = $1" a)
  ;(al "orig = $1" (. a opt orig))
  (and (is (. a tp) 'sym) (is (. a opt orig) "nil")))

(defprc whi (ts . bd)
  (opt bra t)
  (lin "while (" (cpla 'bot ts) ")"
       (if (no bd) ";"
           (chkbra (wpla 'lop (call do @bd))))))

(defpla lop blk)
(defrt whi blk)

(defprc loop (st p up . bd)
  (opt bra t)
  (lin "for (" (cpla 'forbeg st) "; "
               (cpla 'bot p) "; "
               (cpla 'bot up) ")"
       (if (no bd) ";"
           (chkbra (wpla 'lop (call do @bd))))))

(defrt loop blk)

(defprc if a
  (if (no a) (chan nil)
      (no (cdr a)) (chan (car a))
      (inblk?) (do (opt bra t)
                   (cif1 @a))
      (pass ifln @a)))

(def cif1 a
  (if (no a) (cpla 'if nil)
      (no (cdr a)) (cpla 'if (car a))
      (with (ts (cpla 'bot (car a))
             yes (cpla 'if (cadr a)))
        (opsfr yes ret thr brk)
        (if (exi? yes)
              (lns (lin "if (" ts ")" (chkbra yes))
                   (cif1 @(cddr a)))
            (needbra? yes)
              (lin "if (" ts ")" (chkbra yes) " " (celif @(cddr a)))
            (lns (lin "if (" ts ")" (chkbra yes))
                 (celif @(cddr a)))))))

(def celif a
  (if (no a) nil
      (no (cdr a)) (lin "else " (chkbra (cpla 'if (car a))))
      (with (ts (cpla 'bot (car a))
             yes (cpla 'if (cadr a)))
        (if (needbra? yes)
              (lin "else if (" ts ")" (chkbra yes) " " @(celif (cddr a)))
            (lns (lin "else if (" ts ")" (chkbra yes))
                 (celif @(cddr a)))))))

(defpla if blk end)
(defrt if blk)

(defprc ifln a
  (if (no a) (chan nil)
      (no (cdr a)) (chan (car a))
      (cifln2 @a)))

(def cifln2 (ts yes nop . rst)
  (lvl (lin (cpla 'iflntest ts) "?"
            (cpla 'iflnyes yes) ":"
            (if (no rst) (cpla 'iflnno nop)))
       (if rst (cifln2 @rst))))

(defprc ret (a)
  (cpops (ret thr brk bra) 
    (cpla 'ret a)))

(defpla ret blk ret)
(defrt ret blk)

(defprc nret (a)
  (cpops (ret thr brk bra)
    (cpla 'nret a)))

(defpla nret blk)
(defrt nret blk)

(defprc fn (ag . bd)
  (lns (lin "function " (mpar ag) "{")
       (ind 2 (wpla 'blk (call do @bd)))
       "}"))

#|(defprc blk a
  (opt bra t)
  (if (no a) "{}"
      (lns "{" (ind 2 (inpla 'blk (cdo a))) "}")))|#

(defpla blk blk ret)
(defrt fn)

(defprc def (nm ag . bd)
  (opt bra t)
  (lns (lin "function " (call sym nm) (mpar ag) "{")
       (ind 2 (wpla 'blk (call do @bd)))
       "}"))

(defrt def blk)



;;; Lines ;;;

(def mklnobj (typ ob)
  (app ob {typ typ}))

#| line:
(prn (proc (lin "" "test" "" "" "test"))) ->
testtest
|#

(def lin a
  (mklnobj 'lin {dat a}))

#| lines:
(prn (proc (lns "" "test" "" "" "test"))) ->

test


test
|#

(def lns a
  (mklnobj 'lns {dat a}))

#| fresh lines:
(prn (proc (flns "" "test" "" "" "test"))) ->
test
test
|#

(def flns a
  (mklnobj 'flns {dat a}))

#| level:
(prn (proc (lin "test" (lvl "test" "" "abc")))) ->
testtest
    
    abc
|#

(def lvl a
  (mklnobj 'lvl {dat a}))

#| level with indent on next lines:
(prn (proc (lin "test" (lvlind 3 "testing" "abc" "def")))) ->
testtesting
       abc
       def

(mac lvlind (n fst . rst)
  `(lvl ,fst (ind ,n ,@rst)))
|#

(def lvlind (n . a)
  (mklnobj 'lvlind {dat a n n}))

#| indent:
(prn (proc (lns "test" (ind 3 "testing" (ind 2 "abc" "def")) "hey"))) ->
test
   testing
     abc
     def
hey
|#

(def ind (n . a)
  (mklnobj 'ind {dat a n n}))

#| with indent:
(prn (proc (lns "test" (ind 3 "testing" (wind 2 "abc" "def") "what") "hey"))) ->
test
   testing
  abc
  def
   what
hey
|#

(def wind (n . a)
  (mklnobj 'wind {dat a n n}))

; return object: proc only uses dat property
(def rt (tp a (o opt {}))
  (mklnobj 'rt {dat a tp tp opt (app {orig a} opt)}))

; applies f to dat property of a
(def mapdat (f a)
  (mklnobj (. a typ) (app a {dat (f (. a dat))})))

(over dsp (a)
  (sup (trans a)))

(def trans (a)
  (case a
    obj? (case (. a typ)
           'lin `(lin ,@(trans (. a dat)))
           'lns `(lns ,@(trans (. a dat)))
           'ind `(ind ,(. a n) ,@(trans (. a dat)))
           'rt  `(rt ,(. a tp) ,(trans (. a dat))))
    lis? (map trans a)
    a))

;;; Output lines ;;;

(var *indlvl* 0)
(var *begline* t)
(var *linepos* 0)
(var *indented* nil)

; don't send "\n" to emit
; *begline* is t after \n is printed til the first text is emitted
; *indented* is t after indentation til \n is printed

(def emit (a)
  ;(bugm 'emit a *indlvl* *begline* *linepos* *indented*)
  (unless *indented* (emitind))
  (unless (is a "")
    (pr a)
    (+= *linepos* (len a))
    (= *begline* nil)))

(def emitind ()
  (pr (nof *indlvl* " "))
  (+= *linepos* *indlvl*)
  (= *indented* t))

(def newln ()
  (pr "\n")
  (= *linepos* 0)
  (= *begline* t)
  (= *indented* nil))

(def freshln ()
  (unless *begline* (newln)))

(def resetln ()
  (= *indlvl* 0)
  (= *linepos* 0)
  (= *begline* t)
  (= *indented* nil)
  nil)

;;; Process lines ;;;

(def proc (a)
  (resetln)
  (tostr (proclin (lin a))))

; process any type
(def proc1 (a)
  (case a
    obj?
      (case (. a typ)
        'lin (proclin a)
        'lns (proclns a)
        'flns (procflns a)
        'lvl (proclvl a)
        'ind (procind a)
        'lvlind (proclvlind a)
        'wind (procwind a)
        'rt (proc1 (. a dat))
        (err proc1 "Unknown type a = $1" a))
    syn? (emit (str a))
    str? (emit a)
    (err proc1 "Unknown type a = $1" a)))

; process lin objects
(def proclin (a)
  (each x (rflat (. a dat))
    (unless (no x) (proc1 x))))

; process lns objects
(def proclns (a)
  (var fst t)
  (each x (rflat (. a dat))
    (if (no x) (cont))
    (if fst (= fst nil)
        (newln))
    (proc1 x)))

; process flns objects
(def procflns (a)
  (var fst t)
  (each x (rflat (. a dat))
    (if (no x) (cont))
    (if fst (= fst nil)
        (freshln))
    (proc1 x)))

(def proclvl (a)
  (dyn *indlvl* (if *indented* *linepos* *indlvl*)
    (proclns a)))

(def proclvlind (a)
  (dyn *indlvl* (if *indented* *linepos* *indlvl*)
    (procind a)))

(def procind (a)
  (dyn *indlvl* (+ *indlvl* (. a n))
    (proclns (lns (. a dat)))))

(def procwind (a)
  (dyn *indlvl* (. a n)
    (proclns (lns (. a dat)))))

(def rflat (a)
  (if (no a) nil
      (atm? (car a)) (cons (car a) (rflat (cdr a)))
      (app (rflat (car a)) (rflat (cdr a)))))

;;; Compile from str ;;;

(def cmps (a)
  (cmp (prs a)))

(def cmpp (a)
  (prn (cmps a)))
