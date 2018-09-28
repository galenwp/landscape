/+  collections, colls
/=  gas  /$  fuel:html
::/=  all-colls  /:  /===/web/collections
::               /collection-web-item/
|%
  :: is this collection on the profile?
  ++  is-pro
  |=  col=collection:collections
  visible.meta.col
--
^-  manx
;div.profile-page
  ;input(type "hidden", name "urb-header", value "header-profile", ship "{(scow %p p.bem.gas)}");
  ;div.container
    ;div.row
      ;div.flex-col-2;
      ;div.flex-col-x
        ;div.profile-avatar
          ;div(urb-component "Sigil", urb-size "320", urb-ship "{(scow %p p.bem.gas)}");
          ;div(urb-component "ProfileMsgBtn", urb-ship "{(scow %p p.bem.gas)}");
        ==
      ==
    ==
    ;div.row.mt-9
      ;div.flex-offset-special.flex-col-x
        ;h2.text-500: Meta
      ==
    ==
    ;div.row.mt-4.align-center
      ;div.flex-col-2;
      ;h3.text-500.flex-col-1.mt-0: Started:
      ;div.flex-col-x.text-mono: ~2018.4.12..6.45.12
    ==
    ;div.row.mt-3.align-center
      ;div.flex-col-2;
      ;h3.text-500.flex-col-1.mt-0: Issued:
      ;div.flex-col-x
        ;a.text-mono(href "/~~/{(scow %p (sein:title p.bem.gas))}/==/web/landscape/profile"): {(scow %p (sein:title p.bem.gas))}
      ==
    ==
  ==
==
