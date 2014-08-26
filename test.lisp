; http://www.gigamonkeys.com/book/the-special-operators.html

(def foo ()
  (prn "Entering foo")
  (cat *obj*
    (prn " Entering CATCH")
    (bar)
    (prn " Leaving CATCH"))
  (prn "Leaving foo"))

(def bar ()
  (prn "  Entering bar")
  (baz)
  (prn "  Leaving bar"))

(def baz ()
  (prn "   Entering baz")
  (thr *obj* nil)
  (prn "   Leaving baz"))

(foo)

(def foo ()
  (prn "Entering foo")
  (blk a
    (prn " Entering BLOCK")
    (bar [retfr a])
    (prn " Leaving BLOCK"))
  (prn "Leaving foo"))

(def bar (f)
  (prn "  Entering bar")
  (blk a (baz f))
  (prn "  Leaving bar"))
  
(def baz (f)
  (prn "   Entering baz")
  (f)
  (prn "   Leaving baz"))
