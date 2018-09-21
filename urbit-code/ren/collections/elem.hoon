::
::::
  ::
/?  309
/+  collections, cram
/=  gas  /$  fuel:html
/=  itm  /collections-web-item/
::
::
/=  collection-post
  /:  /===/web/landscape/collections/post      /!noun/
::
=<  (item-to-elem itm)
|%
++  item-to-elem
  |=  itm=item:collections
  ^-  manx
  ?<  =(/collections/web s.bem.gas)
  =/  sho  (fall (~(get by qix.gas) %show) %default)
  ;div.container
    ;div.row
      ;div.flex-col-2;
      ;div.flex-col-x
        ;div.collection-index
            ;+  (meta-to-elem itm sho)
            ;+
              ?-    -.itm
              ::
                  %collection
                ?+  sho     !!
                  %default  (collection-to-elem col.itm)
                  %post     (collection-post ~ (flop s.bem.gas))
                  %edit     !!
                ==
              ::
                  %raw
                ?+  sho     !!
                  %default  (raw-to-elem raw.itm)
                  %post     !!
                  %edit     (collection-post `raw.itm (flop s.bem.gas))
                ==
              ::
                  %both
                ?+  sho     !!
                  %default  (both-to-elem col.itm raw.itm)
                  %post     !!
                  %edit     (collection-post `raw.itm (flop s.bem.gas))
                ==
              ::
              ==
        ==
      ==
    ==
  ==
++  collection-to-elem
  |=  col=collection:collections
  ^-  manx
  ;ul.vanilla
    ;*  %+  turn
          %+  sort  ~(tap by data.col)
          |=  [[knot a=item:collections] [knot b=item:collections]]
          =/  a-dat  (extract-date-created a)
          =/  b-dat  (extract-date-created b)
          (gth a-dat b-dat)
        |=  [nom=knot ite=item:collections]
        ^-  manx
        ;li.collection-post.mt-6
          ;+  (item-to-snip nom ite)
        ==
  ==
::
++  raw-to-elem
  |=  raw=raw-item:collections
  ^-  manx
  =/  elm  elm:(static:cram (ream data.raw))
  =/  ht  (hedtal:collections +.elm)
  =/  title  (fall (~(get by meta.raw) %name) -.s.bem.gas)
  =/  date   (fall (~(get by meta.raw) %date-created) 'missing date')
  =/  owner  (fall (~(get by meta.raw) %owner) 'anonymous')
  ::
  ;div.mb-18.mt-4
    ;+  elm
  ==
::
++  both-to-elem
  |=  [col=collection:collections raw=raw-item:collections]
  ^-  manx
  ;div
    ;+  (raw-to-elem raw)
    ::
    ;div
      ;div.mb-2
        ;span(urb-component "IconComment");
        ;span: {<~(wyt by data.col)>}
      ==
      ::
      ;ul
      ;*  %+  turn
            %+  sort  ~(tap by data.col)
            |=  [[knot a=item:collections] [knot b=item:collections]]
            =/  a-dat  (extract-date-created a)
            =/  b-dat  (extract-date-created b)
            (gth a-dat b-dat)
          |=  [nom=knot ite=item:collections]
          ^-  manx
          ?>  ?=(%raw -.ite)
          =/  owner  (fall (~(get by meta.raw.ite) %owner) 'anonymous')
          =/  date  (fall (~(get by meta.raw.ite) %date-created) 'missing date')
          ;li.collection-comment
            ;div
              ;a.collection-comment-author.text-mono
                =href  "/~~/landscape/profile"
                ; {(trip owner)}
              ==
              ;+  elm:(static:cram (ream data.raw.ite))
            ==
            ;span.collection-date: {(trip date)}
          ==
      ==
      ::
      ;div
        =urb-component  "CommentCreate"
        =urb-pax        "{<(flop s.bem.gas)>}"
        =urb-ship       "{(scow %p p.bem.gas)}";
    ==
  ==
::
++  extract-date-created
  |=  i=item:collections
  ^-  @da
  ?-  -.i
    %collection  date-created.meta.col.i
    %both        date-created.meta.col.i
    %raw         (slav %da (~(got by meta.raw.i) %date-created))
  ==
::
::
::
++  item-to-snip
  |=  [nom=knot itm=item:collections]
  ^-  manx
  ?-    -.itm
      %collection
    (collection-to-snip nom col.itm)
      %raw
    (raw-to-snip nom raw.itm)
      %both
    (both-to-snip nom col.itm raw.itm)
  ==
::
++  collection-to-snip
  |=  [nom=knot col=collection:collections]
  ^-  manx
  =/  lnk=tape
    "/~~/{(scow %p p.full-path.meta.col)}/=={(spud (flop (slag 1 s.full-path.meta.col)))}"
  ;div
    ;div.collection-date: {<date-created.meta.col>}
    ;h2.mt-0.mb-0
      ;a(href lnk): {(trip name.meta.col)}
    ==
    ;div.who.text-mono.text-600: {<owner.meta.col>}
    ;div.meta-cont
      ;div.com-count.ml-12
        ; {(trip (scot %ud ~(wyt by data.col)))} comments
      ==
    ==
  ==
::
++  raw-to-snip
  |=  [nom=knot raw=raw-item:collections]
  ^-  manx
  =/  elm=manx  elm:(static:cram (ream data.raw))
  =/  ht  (hedtal:collections +.elm)
  =?  tal.ht  ?=(~ hed.ht)
    (scag 5 c.elm)
  =/  title  (fall (~(get by meta.raw) %name) nom)
  =/  date   (fall (~(get by meta.raw) %date-created) 'missing date')
  =/  owner  (fall (~(get by meta.raw) %owner) 'anonymous')
  =/  lnk=tape
    "/~~/{(scow %p p.bem.gas)}/=={(spud (flop s.bem.gas))}/{(trip nom)}"
  ::
  ;div
    ;div.collection-date: {(trip date)}
    ;h2
      ;+  ?~  hed.ht
            ;a(href lnk): {(trip title)}
          ;a(href lnk): *{hed.ht}
    ==
    ;div.who.text-mono.text-600: {(trip owner)}
    ;div.snippet
      ;*  tal.ht
    ==
  ==
::
++  both-to-snip
  |=  [nom=knot col=collection:collections raw=raw-item:collections]
  ^-  manx
  =/  elm=manx  elm:(static:cram (ream data.raw))
  =/  ht  (hedtal:collections +.elm)
  =?  tal.ht  ?=(~ hed.ht)
    (scag 5 c.elm)
  =/  title  (fall (~(get by meta.raw) %name) nom)
  =/  lnk=tape
    "/~~/{(scow %p p.bem.gas)}/=={(spud (flop s.bem.gas))}/{(trip nom)}"
  ::
  ;div
    ;div.collection-date: {<date-created.meta.col>}
    ;h2.mt-0.mb-0.text-500
      ;+  ?~  hed.ht
            ;a(href lnk): {(trip title)}
          ;a(href lnk): *{hed.ht}
    ==
    ;div.text-mono-bold.mt-1.mb-1: {<owner.meta.col>}
    ;div
      ;span.icon-label.justify-start
        ;span(urb-component "IconComment");
        ;span.ml-1
          ; {(trip (scot %ud ~(wyt by data.col)))}
        ==
      ==
    ==
  ==
::
++  meta-to-elem
  |=  [itm=item:collections sho=@tas]
  ^-  manx
  =/  mat=mart
    :~  [%type "hidden"]
        [%name "urb-metadata"]
        [%urb-show (trip sho)]
        [%urb-path (spud (flop s.bem.gas))]
    ==
  :_  ~
  :-  %input
  %+  weld  mat
  ^-  mart
  ?-    -.itm
      %collection
    =*  met  meta.col.itm
    :~  [%urb-name (trip name.met)]
        [%urb-owner (scow %p owner.met)]
        [%urb-date-created (scow %da date-created.met)]
        [%urb-last-modified (scow %da last-modified.met)]
        [%urb-content-type (trip type.met)]
        [%urb-structure-type "collection-index"]
    ==
      %raw
    =/  met  ~(got by meta.raw.itm)
    :~  [%urb-name (trip (met %name))]
        [%urb-owner (trip (met %owner))]
        [%urb-date-created (trip (met %date-created))]
        [%urb-last-modified (trip (met %last-modified))]
        [%urb-content-type (trip (met %type))]
        [%urb-structure-type "collection-post"]
    ==
      %both
    =/  met  ~(got by meta.raw.itm)
    :~  [%urb-name (trip (met %name))]
        [%urb-owner (trip (met %owner))]
        [%urb-date-created (trip (met %date-created))]
        [%urb-last-modified (trip (met %last-modified))]
        [%urb-content-type (trip (met %type))]
        [%urb-structure-type "collection-post"]
    ==
  ==
--
