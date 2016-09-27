# Lisp Read, Eval, Print, Loop

http://xin-xin.me/code/lisp-repl/

This is a Lisp interpreter written in JavaScript. The version of Lisp implemented here is my own variation of Paul Graham's [Arc Lisp](http://www.paulgraham.com/arc.html).

## Example Commands

```
(+ 2 2)
=> 4

(map [+ _ 1] '(1 2 3))
=> (2 3 4)

(def fact (n)
      (if (is n 0) 1
          (* n (fact (- n 1)))))
    (fact 5))
=> 120

('(a b c d e) 2)
=> c

("abcde" 2)
=> "c"

(prn "Hi, how are you?\nI'm good, thank you!")
Hi, how are you?
I'm good, thank you!
=> nil

(case 1
  1 'a
  2 'b
  3 'c
  4 'd
  5 'e
  6 'f
  'else)
=> a
(case 5  1 'a  2 'b  3 'c  4 'd  5 'e  6 'f  'else)
=> e
(case 9  1 'a  2 'b  3 'c  4 'd  5 'e  6 'f  'else)
=> else

(for i 1 10 (pr i " "))
12345678910
=> nil

(rep 5 (prn 3))
3
3
3
3
3
=> nil

(tostr (prn "domesday") (prn "book"))
=> "domesday\nbook\n"

(= x '(c a b))
=> (c a b)
(pop x)
=> c
(push 'f x)
=> (f a b)
x
=> (f a b)

(= x '(1 2 3))
=> (1 2 3)
(++ (car x))
=> 2
x
=> (2 2 3)
```
