(ns grammkit.abnf
  (:require [instaparse.core :as insta]
            [instaparse.abnf :refer [abnf-parser]]
            [instaparse.gll :as gll]))

(def whitescape (js/require "whitescape"))

(def parse-int js/parseInt)

(defn repetition [repeat element]
  {:type "OneOrMore"
   :arguments [element (str (:low repeat) "," (:high repeat))]})

(def abnf-transformer
  {
   :rule
   (fn [rulename expression]
     {:name rulename
      :diagram {:type "Diagram"
                :arguments [expression]}})
  ;  :hide-tag-rule (fn [tag rule] {tag (hide-tag rule)})
   :rulename-left #(apply str %&)
   :rulename-right (fn [& args] {:type "NonTerminal" :arguments [(apply str args)]})
   :alternation
   (fn [& args]
     {:type "Choice"
      :arguments (concat [0] args)})

   :concatenation
   (fn [& args]
     {:type "Sequence"
      :arguments args})

   :repeat (fn [& items]
             (case (count items)
               1 (cond
                   (= (first items) "*") {}                         ; *
                   :else {:low (first items), :high (first items)}) ; x
               2 (cond
                   (= (first items) "*") {:high (second items)}     ; *x
                   :else {:low (first items)})                      ; x*
               3 {:low (first items), :high (nth items 2)}))        ; x*y

   :repetition (fn
                 ([repeat element]
                  (cond
                    (empty? repeat) {:type "ZeroOrMore" :arguments [element]}
                    (= (count repeat) 2) (repetition repeat element)
                    (= (:low repeat) 1) {:type "OneOrMore" :arguments [element]}
                    (= (:high repeat) 1) {:type "Optional" :arguments [element]}
                    :else (repetition repeat element)))
                    ; (rep (or (:low repeat) 0)
                    ;      (or (:high repeat) #?(:clj Double/POSITIVE_INFINITY
                    ;                            :cljs js/Infinity))
                    ;      element)))
                 ([element]
                  element))

   :option (fn [element] {:type "Optional" :arguments [element]})
  ;  :hide hide
  ;  :look look
  ;  :neg neg
  ;  :regexp (comp regexp cfg/process-regexp)
   :char-val (fn [& cs]
               {:type "Terminal" :arguments [(whitescape (apply str cs))]})
  ;  :bin-char (fn [& cs]
  ;              (parse-int (apply str cs) 2))
  ;  :dec-char (fn [& cs]
  ;              (parse-int (apply str cs)))
  ;  :hex-char (fn [& cs]
  ;              (parse-int (apply str cs) 16))
  ;  :bin-val get-char-combinator
  ;  :dec-val get-char-combinator
  ;  :hex-val get-char-combinator
   :NUM #(parse-int (apply str %&))})

; (defn build-parser [spec output-format]
;   (let [rule-tree (gll/parse abnf-parser :rulelist spec false)]
;     (if (instance? instaparse.gll.Failure rule-tree)
;       (throw-runtime-exception
;         "Error parsing grammar specification:\n"
;         (with-out-str (println rule-tree)))
;       (let [rules (t/transform abnf-transformer rule-tree)
;             grammar-map (rules->grammar-map rules)
;             start-production (first (first (first rules)))]
;         {:grammar (cfg/check-grammar (red/apply-standard-reductions output-format grammar-map))
;          :start-production start-production
;          :output-format output-format})))))))

; ^:export to keep this function during dead code elimination
(defn ^:export parse [input]
  (->> (gll/parse abnf-parser :rulelist input false)
       (insta/transform abnf-transformer)
       (clj->js)))
