/-  urb
|=  [dep=@uvH inner=manx]  ^-  urb
:*
::;head;
  :-  0v0  ::XX separate file?
  ;=
    ;title: Nutalk
    ;meta(charset "utf-8");
    ;meta(name "viewport", content "width=device-width, initial-scale=1, shrink-to-fit=no");
    ;link(rel "stylesheet", href "/~~/pages/nutalk/css/index.css");
  ==
::;body;
  :-  dep  :: XX separate file?
  ;=
    ;div
      ;div.container.header-container
        ;div.row
          ;div.col-sm-1
            ;a/"/~~/pages/nutalk/menu"
              ;div.panini;
            ==
          ==
          ;div.col-sm-1
            ;a/"/~~/pages/nutalk"
              ;div.liang;
            ==
          ==
          ;div.col-sm-10(urb-component-header "");
        ==
      ==
      ;div.container
        ;div.row
          ;div.col-sm-10.col-sm-offset-2
            ;div#root
              ;+  inner
            ==
          ==
        ==
      ==
    ==

    ;script@"/~~/pages/nutalk/js/index.js";
  ==
::
==
