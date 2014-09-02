;;;; Compiler ;;;;

#|
To run:
js> L.evlf("/codes/libjs/lisp-compile-basic/devel/lisp-compile-basic.lisp")
lisp> (cmpp "(js-blk (js-do 1 2 3))")
|#

;;; Main compile ;;;

(def cmp (a)
  (proc (cmp1 a)))

(def cmp1 (a)
  (if (atm? a)
    (case a
      nil? (cmp1 'nil)
      num? (cmp1 (lis 'js-num a))
      sym? (cmp1 (lis 'js-sym a))
      str? (cmp1 (lis 'js-str a))
      (err cmp1 "Unknown atom a = $1" a))
    (let b (car a)
      (if (atm? b)
            (if (sym? b) (cprc b (cdr a))
                (cmp1 (cons 'js-cal a)))
          (cmp1 (cons 'js-cal a))))))

;;; Procedures ;;;

(var *prcs* {})

#|(var *curropt* {})
(mac opt (a x)
  `(do (= (. *curropt* ,a) ,x)
       nil))

(def opts (ob)
  (oeach i x ob
    (= (*curropt* i) x)))

(mac defprc (nm ag . bd)
  `(= (. *prcs* ,nm)
      (fn ,ag
        (dyn *curropt* {}
          (rt ',nm (lin ,@bd) *curropt*)))))|#

(mac defspc (nm ag . bd)
  `(= (. *prcs* ,nm)
      (fn ,ag ,@bd)))

(var *curropt* {})

(mac opt (a b)
  `(do (= (. *curropt* ,a) ,b)
       nil))

#|(def opsfr1 (ob a)
  `(do (al "ob = $1 | a = $2 | has = $3" ,ob ',a (ohas (getopt ,ob) ',a))
       (if (ohas (getopt ,ob) ',a) (opt ,a (. (getopt ,ob) ,a)))))|#

(def opsfr1 (ob a)
  `(if (ohas (getopt ,ob) ',a) (opt ,a (. (getopt ,ob) ,a))))

(mac opsfr (ob . a)
  `(do ,@(map [opsfr1 ob _] a)))

(mac cpops (ops . a)
  `(let #r (do ,@a)
     (opsfr #r ,@ops)
     #r))

(mac prc (nm . bd)
  `(dyn *curropt* {}
     (rt ',nm (do ,@bd) *curropt*)))

(mac defprc (nm ag . bd)
  `(defspc ,nm ,ag
     (prc ,nm ,@bd)))

#|(prc do (cdo a))

#|(mac defprc (nm ag . bd)
  `(= (. *prcs* ,nm)
      (fn ,ag ,@bd)))|#

(def cprc (p a)
  (if (beg p 'js-)
        (let f (*prcs* (sli p 3))
          (if (no f) (err cprc "Unknown p = $1" p)
              (apl f a)))
      (cmp1 (lisd 'js-cal p a))))

;;; Places ;;;

(def send (a)
  (cmp1 a))

; *ps* = places
(var *ps* nil)
#|(over cmp (a (o p))
  (if (no p) (sup a)
      (cpla p (send a))))|#

(mac stapla (p . a)
  `(sta *ps* ,p ,@a))

(mac wpla (p a)
  `(stapla ,p (place ,a *ps*)))

(mac cpla (p a)
  `(wpla ,p (send ,a)))

#|
(over cmp (a (o p))
  (if (no p) (sup a)
      (inpla p (cmp1 a))))
|#

(def place (a ps)
  a)

(def cpa (p a)
  (map [cpla p _] a))

(mac defpla (a . opt)
  nil)

(mac defrt (a . opt)
  nil)

;;; JS Places ;;;

(var *blkpla* nil)
(var *blkrts* nil)

(def inblk? (ps)
  (has (car ps) *blkpla*))

(def blk? (a)
  (has (gettp a) *blkrts*))

(var *retpla* nil)
(var *endpla* nil)

(def inret? (ps)
  (if (no ps) nil
      (has (car ps) *retpla*) t
      (has (car ps) *endpla*) (inret? (cdr ps))
      nil))

(def ret? (a)
  (. (getopt a) ret))

(def thr? (a)
  (. (getopt a) thr))

(def brk? (a)
  (. (getopt a) brk))

(def exi? (a)
  (or (ret? a) (thr? a) (brk? a)))

(def bra? (a)
  (. (getopt a) bra))

(def needbra? (a)
  (unless (rt? a) (err needbra? "a = $1 must be a rt" a))
  (and (ohas (getopt a) 'bra)
       (bra? a)))

(def mkbra (a)
  (lns "{" (ind 2 a) "}"))

(def chkbra (a)
  (if (needbra? a) (mkbra a)
      a))

#|(def chkbra (a)
  (if (needbra? a) (lns "{" (ind 2 a) "}")
      (no a) ";"
      (car a)))|#

#|(def needbra? (a)
  (slis a
    (if (no a) nil
        (cdr a)
        (has (gettp (car a)) *brarts*) t
        nil)))|#



(def place (a ps)
  (if (inblk? ps)
        (if (no (blk? a))
              (if (no (inret? ps)) (mapa [lin _ ";"] a)
                  (rt (gettp a) (lin "return " (geta a) ";")
                      (owith (getopt a) 'ret t)))
            a)
      a))

(mac defpla (a . opt)
  `(with (#a ',a #opt '(,@opt))
     (if (has 'blk #opt) (psh #a *blkpla*))
     (if (has 'ret #opt) (psh #a *retpla*))
     (if (has 'end #opt) (psh #a *endpla*))
     nil))

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

(def jvar? (a)
  (has #"^[a-zA-Z$_][a-zA-Z0-9$_]*$" a))

(def var? (a)
  (has #"^[a-zA-Z$_][a-zA-Z0-9$_?-]*$" a))

(def jvar (a)
  (if (jvar? a) (str a)
      (var? a)
        (let s ""
          (idx i a
            (case (a i)
              '- (do (app= s (upp (a (+ i 1))))
                      (++ i))
              '? (app= s "p")
              (app= s (a i))))
          s)
      (err jvar "Can't coerce a = $1 to jvar" a)))

(defprc cal (nm . ag)
  (lin (cpla 'refee nm) (mpar ag)))

(def mpar (a)
  (lin "(" (btwa (cpa 'inln a) ", ") ")"))

(defprc blk a
  (opt bra t)
  (if (no a) "{}"
      (lns "{" (ind 2 (inpla 'blk (cdo a))) "}")))

(defpla blk blk ret)
(defrt blk blk)

(defprc whi (ts . a)
  (opt bra t)
  (lin "while (" (cmp ts 'bot) ")"
       (if (no a) ";"
           (chkbra (inpla 'lop (cdo a))))))

(defpla lop blk)
(defrt whi blk)

#|(defprc lop (st ts up . a)
  (rt 'lop
    (lin "for (" (cmp st 'forbeg) "; "
                 (cmp ts 'bot) "; "
                 (cmp up 'bot) ")"
         (chkbra (cmp (cons 'js-do a) 'lop)))))|#

(defspc do a (cdo a))

(def cdo (a)
  (if (no a) (cmp1 nil)
      (no (cdr a)) (cmp1 (car a))
      (let fst (cmp (car a) 'do)
        (if (redun? fst) (cdo (cdr a))
            (prc do
              (opt bra t)
              (lns fst (cdo1 (cdr a))))))))

(def cdo1 (a)
  (if (no (cdr a))
        (let r (cmp (car a) 'dolas)
          (opsfr r ret thr brk)
          r)
      (let fst (cmp (car a) 'do)
        (if (redun? fst) (cdo1 (cdr a))
            (lns fst (cdo1 (cdr a)))))))

(defpla do blk)
(defpla dolas blk end)
(defrt do blk)

(def redun? (a)
  ;(al "orig = $1" (getorig a))
  (and (is (gettp a) 'sym) (is (getorig a) "nil")))

(defspc if a (cif a))

(def cif (a)
  (if (no a) (cmp1 nil)
      (no (cdr a)) (cmp1 (car a))
      (prc if
        (opt bra t)
        (cif1 a))))

(def cif1 (a)
  (if (no a) (cmp nil 'if)
      (no (cdr a)) (cmp (car a) 'if)
      (with (ts (cmp (car a) 'bot)
             yes (cmp (cadr a) 'if))
        (opsfr yes ret thr brk)
        (if (exi? yes)
              (lns (lin "if (" ts ")" (chkbra yes))
                   (cif1 (cddr a)))
            (needbra? yes)
              (lin "if (" ts ")" (chkbra yes) " " (celif (cddr a)))
            (lns (lin "if (" ts ")" (chkbra yes))
                 (celif (cddr a)))))))

(def celif (a)
  (if (no a) nil
      (no (cdr a)) (lin "else " (chkbra (cmp (car a) 'if)))
      (with (ts (cmp (car a) 'bot)
             yes (cmp (cadr a) 'if))
        (if (needbra? yes)
              (lin "else if (" ts ")" (chkbra yes) " " (celif (cddr a)))
            (lns (lin "else if (" ts ")" (chkbra yes))
                 (celif (cddr a)))))))

(defpla if blk end)
(defrt if blk)

(defprc ret (a)
  (cpops (ret thr brk bra) 
    (cpla 'ret a)))

(defpla ret blk ret)
(defrt ret blk)

#|
(defspc ret (a)
  (wpla 'ret (cmp1 a)))
|#

(defprc nret (a)
  (cpops (ret thr brk bra)
    (cpla 'nret a)))

(defpla nret blk)
(defrt nret blk)

#|
(defprc fn (ag . bd)
  (lns (lin "function (" (joi ag ", ") "){")
       (wpla 'blk (call do bd))))

(defprc do a
  (if (no a) (chan nil)
      (no (cdr a)) (chan (car a))
      (let fst (cpla 'do (car a))
        (if (redun? fst) (pass do (cdr a))
            (do (opt bra t)
                (lns fst (cdo1 @(cdr a))))))))

(def cdo1 a
  (if (no (cdr a))
        (cpops (ret thr brk)
          (cpla 'dolas (car a)))
      (let fst (cpla 'do (car a))
        (if (redun? fst) (cdo1 @(cdr a))
            (lns fst (cdo1 @(cdr a)))))))

(defprc if a
  (if (no a) (chan nil)
      (no (cdr a)) (chan (car a))
      (do (opt bra t)
          (cif1 a))))

(def cif1 (a)
  (if (no a) (cpla 'if nil)
      (no (cdr a)) (cpla 'if (car a))
      (with (ts (cpla 'bot (car a))
             yes (cpla 'if (cadr a)))
        (opsfr yes ret thr brk)
        (if (exi? yes)
              (lns (lin "if (" ts ")" (chkbra yes))
                   (cif1 (cddr a)))
            (needbra? yes)
              (lin "if (" ts ")" (chkbra yes) " " (celif (cddr a)))
            (lns (lin "if (" ts ")" (chkbra yes))
                 (celif (cddr a)))))))

(def celif (a)
  (if (no a) nil
      (no (cdr a)) (lin "else " (chkbra (cpla 'if (car a))))
      (with (ts (cpla 'bot (car a))
             yes (cpla 'if (cadr a)))
        (if (needbra? yes)
              (lin "else if (" ts ")" (chkbra yes) " " (celif (cddr a)))
            (lns (lin "else if (" ts ")" (chkbra yes))
                 (celif (cddr a)))))))
|#

#|(def mkdo (a p)
  (if (no a) nil
      (atm? a) (err cpalas "Can't cmp improper list a = $1" a)
      (no (cdr a))
        (let r (cmp (car a) (app p 'las))
          (opt (getopt r))
          (lis r))
      (cons (cmp (car a) p) (mkdo (cdr a) p))))|#

#|(defprc do2 a
  (if (no a) (cmp0 nil)
      (let fst (cmp (car a) 'do)
        (if (redun? fst) (cmp0 (cadr a))
            (lns fst (cmp (cadr a) 'dolas))))))|#

#|(def cpalas (a p)
  (if (no a) nil
      (atm? a) (err cpalas "Can't cmp improper list a = $1" a)
      (no (cdr a)) (lis (let r (cmp (car a) (app p 'las))
                           (opts (getopt r))
                           r))
      (cons (cmp (car a) p) (cpalas (cdr a) p))))|#

#|(defprc if a (cif a))

(def cif (a)
  (if (no a) (cmp0 nil)
      (no (cdr a)) (cmp (car a) 'if)
      (with (ts (cmp (car a) 'bot)
             yes (cmp (cadr a) 'if))
        (opts (getopt yes))
        (if (exi? yes)
              (lns (lin "if (" ts ")" (chkbra yes))
                   (cif (cddr a)))
            (needbra? yes)
              (lin "if (" ts ")" (chkbra yes) " " (celif (cddr a)))
            (lns (lin "if (" ts ")" (chkbra yes))
                 (celif (cddr a)))))))

(def celif (a)
  (if (no a) nil
      (no (cdr a)) (lin "else " (chkbra (cmp (car a) 'if)))
      (lns (lin "else if (" (cmp (car a) 'bot) ")"
                (chkbra (cmp (cadr a) 'if)))
           (celif (cddr a)))))|#

;;; Types ;;;

(def lin a
  (linlis a))

(def linlis (a)
  (tg 'lin {a a}))

(def lns a
  (lnslis a))

(def lnslis (a)
  (tg 'lns {a a}))

(def lvllns a
  (tg 'lvllns {a a}))

(def ind (n . a)
  (indlis n a))

(def indlis (n a)
  (tg 'ind {n n a a}))

(def lvlind a
  (tg 'lvlind {a a}))

(def wind (n . a)
  (tg 'wind {n n a a}))

(def rt (tp a (o opt {}))
  (tg 'rt {tp tp a a opt (app {orig a} opt)}))

(def geta (a)
  (. (rp a) a))

(def getn (a)
  (. (rp a) n))

(def gettp (a)
  (. (rp a) tp))

(def getopt (a)
  (. (rp a) opt))

(def getorig (a)
  (. (getopt a) orig))

(def mapa (f a)
  (rt (gettp a) (f (geta a)) (getopt a)))

(def isa (a x)
  (is (typ a) x))

(def lin? (a)
  (isa a 'lin))

(def lns? (a)
  (isa a 'lns))

(def lvllns? (a)
  (isa a 'lvllns))

(def ind? (a)
  (isa a 'ind))

(def lvlind? (a)
  (isa a 'lvlind))

(def wind? (a)
  (isa a 'wind))

(def rt? (a)
  (isa a 'rt))

(over dsp (a)
  (sup (trans a)))

(def trans (a)
  (case a
    lin? `(lin ,@(trans (geta a)))
    lns? `(lns ,@(trans (geta a)))
    ind? `(ind ,(getn a) ,@(trans (geta a)))
    rt?  `(rt ,(gettp a) ,(trans (geta a)))
    lis? (map trans a)
    a))

;;; Output lines ;;;

(var *indlvl* 0)
(var *begline* t)
(var *linepos* 0)

(def emit (a)
  ;(al "a = $1 | *indlvl* = $2 | *begline* = $3 | *linepos* = $4" a *indlvl* *begline* *linepos*)
  (when *begline*
    (pr (nof *indlvl* " "))
    (+= *linepos* *indlvl*))
  (pr a)
  (+= *linepos* (len a))
  (= *begline* nil))

(def newln ()
  (pr "\n")
  (= *linepos* 0)
  (= *begline* t))

(def freshln ()
  (unless *begline* (newln)))

(def resetln ()
  (= *indlvl* 0)
  (= *linepos* 0)
  (= *begline* t)
  nil)

;;; Process lines ;;;

(def proc (a)
  (resetln)
  (tostr (proclin (lin a))))
    
(def proclin (a)
  (each x (flata (geta a))
    (unless (no x) (proclin1 x))))

(def proclin1 (a)
  (case a
    lin? (proclin a)
    lns? (proclns a)
    lvllns? (dyn *indlvl* *linepos*
              (proclns a))
    ind? (procind a)
    lvlind? (dyn *indlvl* *linepos*
              (procind a))
    wind? (procwind a)
    rt? (proclin1 (geta a))
    syn? (emit (str a))
    str? (emit a)
    (err proclin1 "Unknown type a = $1" a)))

(def proclns (a)
  (proclnslis (flata (geta a))))
  
(def proclnslis (a)
  (if (no a) nil
      (no (car a)) (proclnslis (cdr a))
      (do (proclns1 (car a))
          (proclnslis2 (cdr a)))))
          
(def proclnslis2 (a)
  (if (no a) nil
      (no (car a)) (proclnslis2 (cdr a))
      (do (newln)
          (proclns1 (car a))
          (proclnslis2 (cdr a)))))

(def proclns1 (a)
  (case a
    lin? (proclin a)
    lns? (proclns a)
    lvllns? (proclns a)
    ind? (procind a)
    lvlind? (procind a)
    wind? (procwind a)
    rt? (proclns1 (geta a))
    syn? (emit (str a))
    str? (emit a)
    (err proclns1 "Unknown type a = $1" a)))

(def procind (a)
  (dyn *indlvl* (+ *indlvl* (getn a))
    (proclns (lns (geta a)))))

(def procwind (a)
  (dyn *indlvl* (getn a)
    (proclns (lns (geta a)))))

(def flata (a)
  (if (no a) nil
      (atm? (car a)) (cons (car a) (flata (cdr a)))
      (app (flata (car a)) (flata (cdr a)))))

;;; Compile from str ;;;

(def cmpprs (a)
  (cmp1 (prs a)))

(def prnproc (a)
  (prn (proc a)))



(def cmps (a)
  (cmp (prs a)))

(def cmpp (a)
  (prn (cmps a)))
