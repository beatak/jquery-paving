jQuery.paving()
===============

jQuery.paving() offers a neatly packed layout with same-width/varying-height elements.

DEMO
----

[beatak.github.com/jquery-paving/](http://beatak.github.com/jquery-paving/ "demo")

EXAMPLE
-------

    // for the initial call
    $(".PARENT-SELECTOR").paving(OPTIONS);
    
    // after paved, you can still add more elaments to the parent node.
    // Then you call this.
    $(".PARENT-SELECTOR").paving(
      "append",
      OPTIONS
    );
    
    // or if you wanna add the element manually one by one.
    $(".YOUR-SELECTOR").paving(
      "add",
      OPTIONS,
      HTML,
      index
    );

OPTIONS
-------

The instance options as follows:

Name|Type|Default|Description
----|----|-------|-----------
**selector**|string|".stone"|$.fn.paving() will look for the element to "*pave*" by the selecetor you pass here.
**marking**|string|"paved"|After $.fn.paving() set the layout to the elements, it will mark the paved element by the string you pass here with using data attribute.
**callback**|function|null|Callback function after each element getting its layout.  **The first argument** is the "*paved*" element.  **The second argument** is the object that holds the pixel height of each column.
**finish**|funciton|null|Callback function after all *paving* is done.  **The first argument** is the object that holds the pixel height of each column.

