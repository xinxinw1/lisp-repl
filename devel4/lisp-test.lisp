(def tris (x y)
  (if (in 0 x y) nil
      (append (tris1 x y)
              (if (is x y) (tris-y x (- y 1))
                  (append (tris-x (- x 1) y) (tris-y x (- y 1))))
              (tris (- x 1) (- y 1)))))

(def tris-y (x y)
  (if (is y 0) nil
      (append (tris1 x y)
              (tris-y x (- y 1)))))

(def tris-x (x y)
  (if (is x 0) nil
      (append (tris1 x y)
              (tris-x (- x 1) y))))

;(def tris1 (x y)
;  (let lst nil
;    (for i 0 x
;      (with (ystart 0 yend y)
;        (if (is i x) (do (= ystart 1) (= yend (- y 1)))
;            (is i 0) (= yend (/ y 2))
;            (> i (/ (- x (if (is x y) 1 0)) 2))
;              (= ystart 1))
;        (for k ystart yend
;          (= lst (cons `((0 . 0) (,i . ,y) (,x . ,k)) lst)))))
;    lst))

;(def tris1 (x y)
;  (if (is x y)
;        (append (loop-keep cons nil for k 0 (/ y 2)
;                  `((0 . 0) (0 . ,y) (,x . ,k)))
;                (loop-keep append nil for i 1 (- x 1)
;                  (loop-keep cons nil for k i y
;                    `((0 . 0) (,i . ,y) (,x . ,k)))))
;      (append (loop-keep cons nil for k 0 (/ y 2)
;                `((0 . 0) (0 . ,y) (,x . ,k)))
;              (loop-keep cons nil for i 1 (/ x 2)
;                `((0 . 0) (,i . ,y) (,x . 0)))
;              (loop-keep append nil for i 1 (- x 1)
;                (loop-keep cons nil for k 1 y
;                  `((0 . 0) (,i . ,y) (,x . ,k)))))))

(def tris1 (x y)
  (with (lens nil curr)
    (for i 0 x
      (for k 0 y
        (= curr (lengths `((0 . 0) (,i . ,y) (,x . ,k))))
        (if (and !(is x y) (uniq? curr lens))
              (= lens (cons curr lens)))))
    lens))
      

(def lengths (a)
  (sort < (list (dist (a 0) (a 1))
                (dist (a 0) (a 2))
                (dist (a 1) (a 2)))))

(def dist (a b)
  (+ (^ (- (b 0) (a 0)) 2)
     (^ (- (b 1) (a 1)) 2)))

(def uniq? (curr lens)
  (if (null? lens) t
      (and (iso curr (car lens))
           (uniq? curr (cdr lens)))))


;(def tris (xmax ymax)
;  (if (in 0 xmax ymax) nil
;      (append (tris2 xmax ymax)
;              (if (>= xmax ymax) (tris (- xmax 1) ymax)
;                                 (tris xmax (- ymax 1))))))

;(def tris2 (xmax ymax x)
;  (if (null? x) (tris2 xmax ymax 0)
;      (is x xmax) (tris-y xmax ymax x 1 (- ymax 1))
;      (append (if (is x 0) (tris-y xmax ymax x 0 (/ ymax 2))
;                  (<= x (/ (- xmax (if (is xmax ymax) 1 0)) 2))
;                    (tris-y xmax ymax x 0 ymax)
;                  (tris-y xmax ymax x 1 ymax))
;              (tris2 xmax ymax (+ x 1)))))

;(def tris-y (xmax ymax x ystart yend)
;  (map-list [list (cons 0 0) (cons x ymax) (cons xmax _)]
;            (for-keep i ystart yend i)))