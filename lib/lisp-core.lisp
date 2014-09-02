(var mac (mc (nm ag . bd)
           `(var ,nm (mc ,ag ,@bd))))

(mac def (nm ag . bd)
  `(var ,nm (fn ,ag ,@bd)))

(mac dot () `|.|)

(def aqt (a) (lis 'qt a))
(def auq (a) (lis 'uq a))

(mac |.| (x . a)
  (if (no a) x
      `(|.| ,(let y (car a)
               (if (atm? y) `(,x ',y)
                   `((|.| ,x ,(car y)) ,@(cdr y))))
          ,@(cdr a))))

(mac byn (n nm op)
  `(mac ,nm #g
     `(do ,@(map [qq (,,op ,@_)] (grp #g ,n)))))

(mac byone (nm op)
  `(byn 1 ,nm ,op))

(mac bytwo (nm op)
  `(byn 2 ,nm ,op))

(bytwo alias alias1)

(mac alias1 (new old)
  `(mac ,new #args `(,,old ,@#args)))

(mac nfn (a) `(fn (_) ,a))

; simple block
(mac sblk a
  `((fn () ,@a)))

(mac let (a x . bd)
  `((fn (,a) ,@bd) ,x))

(mac with (vs . bd)
  (let g (grp vs 2)
    `((fn ,(map car g) ,@bd) ,@(map cadr g))))

(mac withi (vs . bd)
  (let r (remdup vs)
    (if (no r) `(do ,@bd)
        `(with ,r ,@bd))))

(def remdup (a)
  (if (no a) nil
      (no (cdr a)) (lis (car a))
      (is (car a) (cadr a)) (remdup (cddr a))
      (lisd (car a) (cadr a) (remdup (cddr a)))))

(mac withs (vs . bd)
  (if (no vs) `(do ,@bd)
      `(let ,(car vs) ,(cadr vs)
         (withs ,(cddr vs) ,@bd))))

(mac slis (a . bd)
  `(if (atm? ,a) (let ,a (lis ,a) ,@bd)
       (do ,@bd)))

(mac wgs (nm . bd)
  (slis nm
    `(with ,(afta nm '(gs)) ,@bd)))

(def mapapp (f a)
  (apl app (map f a)))

(mac wrec (vs . bd)
  (let g (grp vs 2)
    `(with ,(mapapp [lis (car _) nil] g)
        ,@(map [qq (= ,(car _) ,(cadr _))] g)
        ,@bd)))

(def afta (a x)
  (if (no a) nil
      (lisd (car a) x (afta (cdr a) x))))

(def befa (a x)
  (if (no a) nil
      (lisd x (car a) (befa (cdr a) x))))

(def btwa (a x)
  (if (no a) nil
      (cons (car a) (befa (cdr a) x))))

(mac rfn (nm ag . bd)
  `(let ,nm nil
     (= ,nm (fn ,ag ,@bd))))

(mac afn (ag . bd)
  `(rfn self ,ag ,@bd))

(mac mlet ((nm . mbd) . bd)
  `(let ,nm (mc ,@mbd) ,@bd))

(mac mwith (as . bd)
  `(with ,(mapapp [lis (car _) `(mc ,@(cdr _))] as) ,@bd))

(mac mover (nm ag . bd)
  `(let sup ,nm
     (= ,nm (mc ,ag ,@bd))))

(mac moverlet ((nm . mbd) . bd)
  `(let ,nm (let sup ,nm (mc ,@mbd))
     ,@bd))

(mac rwith (nm vs . bd)
  (let g (grp vs 2)
    `((rfn ,nm ,(map car g) ,@bd) ,@(map cadr g))))

(mac infloop a `(whi true ,@a))

(mac tailrec (nm vs . bd)
  (let g (grp vs 2)
    `(mlet (,nm ,(map car g)
             `(nrt (do ,,@(map [qq (= ,_ ,(auq _))] (map car g)))))
       (with ,vs
         (infloop
           (ret ,@bd))))))

(mac ngs (n v . bd)
  `(let ,v (mkngs ,n) ,@bd))

(def mkngs (n)
  (if (is n 0) nil
      (cons (gs) (mkngs (- n 1)))))

#|
(with (a 1 b 2 c 3)
  (once (a b c)
    `(do (prn ,a)
         (prn ,b)
         (prn ,c))))
        
(mcx '(once (a b c)
        (prn a)
        (prn b)
        (prn c)))

(with (gs4 (gs) gs5 (gs) gs6 (gs))
  `(with (gs4 a gs5 b gs6 c)
     ,(with (a gs4 b gs5 c gs6)
        (prn a)
        (prn b)
        (prn c))))

(LET ((#:G3081 (GENSYM)) (#:G3082 (GENSYM)) (#:G3083 (GENSYM)))
  (LIST 'LET (LIST (LIST #:G3081 A) (LIST #:G3082 B) (LIST #:G3083 C))
    (LET ((A #:G3081) (B #:G3082) (C #:G3083))
      (PRN A))))

(with (#:G3081 (gs) #:G3082 (gs) #:G3083 (gs))
  `(with (,#:G3081 ,A ,#:G3082 ,B ,#:G3083 ,C)
     ,(with (A #:G3081 B #:G3082 C #:G3083)
        (prn A))))

(once (a b c)
 `(do (prn ,a)
      (prn ,b)
      (prn ,c))))

(with (gs4 (gs) gs5 (gs) gs6 (gs))
  `(with (,gs4 ,a ,gs5 ,b ,gs6 ,c)
     ,(with (a gs4 b gs5 c gs6)
        (prn a)
        (prn b)
        (prn c))))

(with (gs4 (if (sym? a) a (gs)) gs5 (gs) gs6 (gs))
  `(with ,(gslis (lis gs4 gs5 gs6) (lis a b c))
     ,(with (a gs4 b gs5 c gs6)
        (prn a)
        (prn b)
        (prn c))))

(with (gs4 (if (sym? a) a (gs)) gs5 (gs) gs6 (gs))
  (gswith (lis gs4 gs5 gs6) (lis a b c)
     (with (a gs4 b gs5 c gs6)
        (prn a)
        (prn b)
        (prn c))))


|#

#|(mac once (vs . bd)
  (if (sym? vs) `(once (,vs) ,@bd)
      (ngs (len vs) gens
        `(wgs ,gens
          `(with ,,(map auq (fla (par gens vs)))
             ,(with ,(fla (par vs gens)) ,@bd))))))|#

#|(mac once (vs . bd)
  (if (sym? vs) `(once (,vs) ,@bd)
      (ngs (len vs) gens
        `(with ,(fla (par gens (map [qq (if (sym? ,_) ,_ (gs))] vs)))
          `(with ,(gslis (lis ,@gens) (lis ,@vs))
             ,(with ,(fla (par vs gens)) ,@bd))))))|#

(mac once (vs . bd)
  (slis vs
    (ngs (len vs) gens
      `(with ,(fla (par gens (map [qq (if (sym? ,_) ,_ (gs))] vs)))
         (gswith (lis ,@gens) (lis ,@vs)
           (with ,(fla (par vs gens)) ,@bd))))))

(def gswith (gens vs rst)
  `(withi ,(gslis gens vs) ,rst))

(def gslis (gens vs)
  (if (or (no gens) (no vs)) nil
      (sym? (car vs)) (gslis (cdr gens) (cdr vs))
      (app (lis (car gens) (car vs)) (gslis (cdr gens) (cdr vs)))))

(mac retfr (s r)
  `(err nil "Unknown block $1" ',s))

#|
(block a
  (prn " Entering BLOCK")
  (bar [retfr a])
  (prn " Leaving BLOCK"))

->

(with (gs1 (lis nil) gs2 retfr)
  (let retfr (mc (s r)
               (if (is s 'a) `(thr gs1 ,r)
                   `(gs2 ,s ,r)))
    (cat gs1
      (prn " Entering BLOCK")
      (bar [retfr a])
      (prn " Leaving BLOCK"))
|#

(mac blk (v . bd)
  `(with (#g (lis nil) #retfr retfr)
     (mlet (retfr (s r)
             (if (is s ',v) `(thr #g ,r)
                 `(#retfr ,s ,r)))
       (cat #g ,@bd))))

(mac bdef (nm ag . bd)
  `(def ,nm ,ag (blk ,nm ,@bd)))

(mac brfn (nm ag . bd)
  `(rfn ,nm ,ag (blk ,nm ,@bd)))

#|
(loop (var i 0) (< i 10) (++ i)
  (if (is i 3) (cont))
  (prn i))
->
(sblk
  (mlet (cont () `(retfr #g))
    (var i 0)
    (while (< i 10)
      (blk #g
        (if (is i 3) (cont))
        (prn i))
      (++ i))))
|#

(mac loop (st p up . bd)
  `(sblk
     (mlet (cont () `(retfr #g))
       ,st
       (while ,p
         (blk #g ,@bd)
         ,up))))

(mac for (i n m . bd)
  (once (n m)
    `(loop (var ,i ,n) (<= ,i ,m) (++ ,i) ,@bd)))

(mac down (i n m . bd)
  (once (n m)
    `(loop (var ,i ,n) (>= ,i ,m) (-- ,i) ,@bd)))

(mac to (i n . bd)
  (once n
    `(loop (var ,i 0) (< ,i ,n) (++ ,i) ,@bd)))

(mac fr (i n . bd)
  `(down ,i ,n 0 ,@bd))
  
(mac idx (i a . bd)
  `(to ,i (len ,a) ,@bd))

(mac idr (i a . bd)
  `(fr ,i (- (len ,a) 1) ,@bd))

(mac rep (n . bd)
  `(down #i ,n 1 ,@bd))

(mac each (x a . bd)
  `(mlet (cont () `(retfr #g))
     (eachfn ,a
       (brfn #g (,x) ,@bd))))

(mac oeach (i x a . bd)
  `(mlet (cont () `(retfr #g))
     (oeachfn ,a
       (brfn #g (,i ,x) ,@bd))))

(mac nofcol (n a)
  `(let #g nil
     (rep ,n (psh ,a #g))
     (rev #g)))

(mac and a
  (if (no a) t
      (no (cdr a)) (car a)
      `(if ,(car a) (and ,@(cdr a)))))

(mac or a
  (wgs g
    `(let ,g nil
        (if ,@(afta (map [qq (= ,g ,_)] a) g)))))

#|
(or a b c)
-> (let gs nil
     (if (= gs a) gs
         (= gs b) gs
         (= gs c) gs))
|#
(mac no (a) `(nil? ,a))
(mac not (a) `(no ,a))

(mac when (ts . bd)
  `(if ,ts (do ,@bd)))

(mac mmac (name arg1 arg2 . body)
  `(mac ,name ,arg1
     (mc ,arg2 ,@body)))

; ((dtfn a b c) x 1 2 3)
; -> ((. x a b c) 1 2 3)
(mmac dtfn a (x . args)
  `((. ,x ,@a) ,@args))

(mac zap (f a . rst)
  `(= ,a (,f ,a ,@rst)))

(mac += (a x) `(= ,a (+ ,a ,x)))
(mac -= (a x) `(= ,a (- ,a ,x)))

(mac ++ (a) `(+= ,a 1))
(mac -- (a) `(-= ,a 1))

(var mcxp nil)
(def mcx1 (a)
  (if mcxp (= mcxp nil))
  (if (atm? a) a
      (and (sym? (car a)) (set? (car a)))
        (let m (evl (car a))
          (if (mac? m) (do (= mcxp t)
                           (apl (rp m) (cdr a)))
              (mcx1l a)))
      (mcx1l a)))

(def mcx1l (a)
  (if (no a) nil
      (let e (mcx1 (car a))
        (if mcxp (cons e (cdr a))
            (cons (car a) (mcx1l (cdr a)))))))

(def mcx (a)
  (if (atm? a) a
      (and (sym? (car a)) (set? (car a)))
        (let m (evl (car a))
          (if (mac? m) (mcx (apl (rp m) (cdr a)))
              (map mcx a)))
      (map mcx a)))

(mac in (x . a)
  (once x
    `(or ,@(map [qq (is ,x ,_)] a))))

(mac inl (nm ag . bd)
  `(mac ,nm ,ag
     `(do ,,@(let p (pnms ag)
               (dmap [if (has _ p) (auq _) _] bd)))))

(def pnms (a)
  (if (no a) nil
      (atm? a) (lis a)
      (is (car a) 'o) (lis (cadr a))
      (app (pnms (car a)) (pnms (cdr a)))))

(mac case (x . a)
  (once x
    `(if ,@(mkcase x a))))

(def mkcase (g a)
  (if (no a) nil
      (no (cdr a)) (lis (car a))
      (lisd `((tfn ,(car a)) ,g) (cadr a)
             (mkcase g (cddr a)))))

(def splbef (a x (o l))
  (if (no a) (lis (nrev l))
      (x (car a)) (cons (nrev l) (splbef (cdr a) x (lis (car a))))
      (splbef (cdr a) x (cons (car a) l))))

(mac tags a
  (let (beftag . s) (splbef a sym?)
    `(mlet (go (a) `(ret (,a)))
        (sblk ,@beftag
              ,@(let g (maplis [lisd (caar _) (caadr _) (cdar _)] s)
                  (map mktag1 g))
              (,(caar s))))))

(def maplis (f a)
  (if (no a) nil
      (cons (f a) (maplis f (cdr a)))))

(def mktag1 (a)
  `(def ,(car a) ()
     ,@(cddr a)
     ,(if (no (cadr a)) nil (lis (cadr a)))))

(def grpovr (a n m)
  (if (>= m n) (err grpovr "m = $1 must be < n = $2" m n)
      (no a) nil
      (no (ncdr n a)) (lis (fstn n a))
      (cons (fstn n a) (grpovr (ncdr (- n m) a) n m))))

(def fold3 (a zer one two)
  (if (no a) (zer)
      (no (cdr a)) (one (car a))
      (fold two a)))

(def foldr3 (a zer one two)
  (if (no a) (zer)
      (no (cdr a)) (one (car a))
      (foldr two a)))

(alias defn def)

(mac dyn (a x . bd)
  `(let #ori ,a
     (= ,a ,x)
     (prot (do ,@bd)
       (= ,a #ori))))

(mac sta (a x . bd)
  `(do (psh ,x ,a)
       (let #r (do ,@bd)
         (pop ,a)
         #r)))

(def nof (n a)
  (let r (case a
           lis? nil
           arr? #[]
           str? ""
           syn? (sli 't 1)
           (err nof "Can't make n = $1 of a = $2" n a))
    (rep n (= r (app r a)))
    r))

(def isn (a b)
  (not (is a b)))

(mac assert (a)
  `(if (not ,a) (err nil "Assertion a = $1 failed" ',a)))

(mac over (nm ag . bd)
  `(let sup ,nm
     (= ,nm (fn ,ag ,@bd))))

(mac app= (a . rst)
  `(= ,a (app ,a ,@rst)))

(mac tostr a
  `(let #s ""
     (dyn *out* [app= #s _]
       ,@a
       #s)))

(mac unless (ts . bd)
  `(when (not ,ts)
     ,@bd))

(mac bef (nm ag . bd)
  `(over ,nm #a
     (apl (fn ,ag ,@bd) #a)
     (apl sup #a)))

(mac aft (nm ag . bd)
  `(over ,nm #a
     (apl sup #a)
     (apl (fn ,ag ,@bd) #a)))

(mac do1 a
  (if (no a) nil
      `(let #r ,(car a)
         ,@(cdr a)
         #r)))

#|
(smlet a '(lis 1 2 3)
  a)
|#
(mac smlet (a x . bd)
  `(let ,a (smc ,x) ,@bd))

(mac smwith (vs . bd)
  `(with ,(mapapp [lis (car _) `(smc ,(cadr _))] (grp vs 2))
     ,@bd))

(mac olay (a)
  `(= ,a {0 ,a}))

(mac oulay (a)
  `(= ,a (,a 0)))

(mac mkoacc (nm pre)
  `(do (var ,nm {})
       (def ,(app pre 'ref) (a) (oref ,nm a))
       (def ,(app pre 'put) (a x) (oput ,nm a x))
       (def ,(app pre 'set) (a x) (oset ,nm a x))
       (def ,(app pre 'set?) (a) (oset? ,nm a))
       (def ,(app pre 'del) (a) (odel ,nm a))
       (def ,(app pre 'ren) (a b) (oren ,nm a b))
       (def ,(app pre 'lay) () (olay ,nm))
       (def ,(app pre 'ulay) () (oulay ,nm))))

(def las (a)
  (if (no a) nil
      (no (cdr a)) (car a)
      (las (cdr a))))

(def but (a)
  (if (no a) nil
      (no (cdr a)) nil
      (cons (car a) (but (cdr a)))))

(mac bug a
  `(let #g (lis ,@a)
     (al ,(joi (mapi (fn (_ i) (str _ " = $" i)) a 1) " | ") @#g)
     (las #g)))

(mac bugn (nm . a)
  `(let #g (lis ,@a)
     (al (str ,nm " | "
              ,(joi (mapi (fn (_ i) (str _ " = $" i))
                          a 1)
                    " | "))
         @#g)
     (las #g)))

(mac bugm (nm . a)
  `(do ,@(map [qq (bugn ,nm ,_)] a)))

(def mapi (f a (o i 0))
  (if (no a) nil
      (cons (f (car a) i) (mapi f (cdr a) (+ i 1)))))
