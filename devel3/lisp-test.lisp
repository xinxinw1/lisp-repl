(mac display a
  `(string ,@a))

(def display-list-contents (a)
  (if (null? (cdr a)) (display (car a))
      (atom? (cdr a)) (+ (display (car a)) " . " (display (cdr a)))
      (+ (display (car a)) " " (display-list-contents (cdr a)))))
