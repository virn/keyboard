/* globals require, $ */

(function() {
  'use strict';

  /**
   * Hi! Thanks for using XSplit JS Framework :)
   *
   * XSplit JS Framework exposes useful methods to work with XSplit without 
   * fiddling too much with the raw core methods exposed to JavaScript, which 
   * makes developing plugins for XSplit a lot easier.
   *
   * To get started, you just have to require our library:
   * var xjs = require('xjs');
   *
   * You can read more about it at our documentation:
   * http://xjsframework.github.io/quickstart.html
   * http://xjsframework.github.io/tutorials.html
   * http://xjsframework.github.io/api.html
   */
  var xjs = require('xjs');
  var Item = xjs.Item;
  var Rectangle = xjs.Rectangle;
  var tempConfig = {

  };
  var tempXpos;
  var tempYpos;
  var whichItem = '';

  var allKey = document.getElementById('allItems');
  /* Key code mappings (wParam)
   * In the event that two keys share the same wparam, we use an array where
   * arr[1] refers to the key sending lParam with bit 24 = 1 (extended key)
   *
   * For more details on the keyboard hook parameters, check the following link:
   * https://msdn.microsoft.com/en-us/library/windows/desktop/ms646280(v=vs.85).aspx
   */
  var wparamMap = {
    8   : 'Backspace',
    9   : 'Tab',
    12  : 'Num5', // VK_CLEAR. Sent when Num5 is pressed with NumLock off. 
    13  : ['Enter', 'NumEnter'],
    19  : 'Pause',
    20  : 'CapsLock',
    27  : 'Esc',
    32  : 'Space',
    33  : ['Num9', 'PageUp'],
    34  : ['Num3', 'PageDown'],
    35  : ['Num1', 'End'],
    36  : ['Num7', 'Home'],
    37  : ['Num4', 'Left'],
    38  : ['Num8', 'Up'],
    39  : ['Num6', 'Right'],
    40  : ['Num2', 'Down'],
    44  : 'PrtScr',
    45  : ['Num0', 'Insert'],
    46  : ['NumDecimal', 'Delete'],
    48  : '0',
    49  : '1',
    50  : '2',
    51  : '3',
    52  : '4',
    53  : '5',
    54  : '6',
    55  : '7',
    56  : '8',
    57  : '9',
    65  : 'A',
    66  : 'B',
    67  : 'C',
    68  : 'D',
    69  : 'E',
    70  : 'F',
    71  : 'G',
    72  : 'H',
    73  : 'I',
    74  : 'J',
    75  : 'K',
    76  : 'L',
    77  : 'M',
    78  : 'N',
    79  : 'O',
    80  : 'P',
    81  : 'Q',
    82  : 'R',
    83  : 'S',
    84  : 'T',
    85  : 'U',
    86  : 'V',
    87  : 'W',
    88  : 'X',
    89  : 'Y',
    90  : 'Z',
    91  : 'LCommand',
    92  : 'RCommand',
    93  : 'Menu',
    96  : 'Num0',
    97  : 'Num1',
    98  : 'Num2',
    99  : 'Num3',
    100 : 'Num4',
    101 : 'Num5',
    102 : 'Num6',
    103 : 'Num7',
    104 : 'Num8',
    105 : 'Num9',
    106 : 'Multiply',
    107 : 'Add',
    109 : 'Subtract',
    110 : 'NumDecimal',
    111 : 'Divide',
    112 : 'F1',
    113 : 'F2',
    114 : 'F3',
    115 : 'F4',
    116 : 'F5',
    117 : 'F6',
    118 : 'F7',
    119 : 'F8',
    120 : 'F9',
    121 : 'F10',
    122 : 'F11',
    123 : 'F12',
    144 : 'NumLock',
    145 : 'ScrollLock',
    160 : 'LShift',
    161 : 'RShift',
    162 : 'LCtrl',
    163 : 'RCtrl',
    164 : 'LAlt',
    165 : 'RAlt',
    186 : ';',
    187 : '=',
    188 : ',',
    189 : '-',
    190 : '.',
    191 : '/',
    192 : '`',
    219 : '[',
    220 : 'Backslash',
    221 : ']',
    222 : 'Quote'
  };

  // Mouse scroll direction constants
  var mouseScroll = {
    UP : '7864320',
    DOWN : '4287102976' // -7864320
  };

  var MOUSE_SCROLL_TIMEOUT = 150;

  // hook message constants
  var HOOK_MESSAGE_TYPE = {
    WM_KEYDOWN    : 0x0100,
    WM_KEYUP    : 0x0101,
    WM_SYSKEYDOWN : 0x0104,
    WM_SYSKEYUP   : 0x0105,
    WM_LBUTTONDOWN  : 0x0201,
    WM_LBUTTONUP  : 0x0202,
    WM_MOUSEMOVE  : 0x0200,
    WM_MOUSEWHEEL : 0x020A,
    WM_MOUSEHWHEEL  : 0x020E,
    WM_RBUTTONDOWN  : 0x0204,
    WM_RBUTTONUP  : 0x0205,
    WM_MBUTTONDOWN  : 0x0207,
    WM_MBUTTONUP  : 0x0208
  };

  // Key Visualizer class
  var KeystrokeVisualizer = function() {
    this.mouseScrollUpTimeout = null;
    this.mouseScrollDownTimeout = null;
  };

  KeystrokeVisualizer.prototype.init = function() {
    this.keyMap = {};
    this.mouseMap = {
      mouse_left : null,
      mouse_right : null,
      mouse_middle : null,
      mouse_scroll_up : null,
      mouse_scroll_down : null
    };

    var mapKeyFunction = function(mappedKey) {
      this.keyMap[mappedKey] = $('.key[code=\'' + mappedKey + '\']');
    }.bind(this);

    for (var keys in wparamMap) {
      var mapped = wparamMap[keys];
      if (Array.isArray(mapped)) {
        mapped.forEach(mapKeyFunction);
      } else {
        this.keyMap[keys] = $('.key[code=\'' + mapped + '\']'); 
      }
    }

    for (var button in this.mouseMap) {
      this.mouseMap[button] = $('#' + button); 
    }

    // TODO: finalize general method to use DLLs
    window.external.LoadDll('Scriptdlls\\SplitMediaLabs\\XjsEx.dll');
    window.external.CallDllEx('xsplit.HookSubscribe');
    window.OnDllOnInputHookEvent = this.readHookEvent.bind(this);
  };

  KeystrokeVisualizer.prototype.readHookEvent = function(msg, wparam, lparam) {
    // identify message type
    switch (parseInt(msg)) {
      case HOOK_MESSAGE_TYPE.WM_KEYDOWN:
      case HOOK_MESSAGE_TYPE.WM_SYSKEYDOWN:
        this.handleKeydown(wparam, lparam);
        break;
      case HOOK_MESSAGE_TYPE.WM_KEYUP:
      case HOOK_MESSAGE_TYPE.WM_SYSKEYUP:
        this.handleKeyup(wparam, lparam);
        break;
      case HOOK_MESSAGE_TYPE.WM_LBUTTONDOWN:
        this.handleMousedown(this.mouseMap.mouse_left);
        break;
      case HOOK_MESSAGE_TYPE.WM_RBUTTONDOWN:
        this.handleMousedown(this.mouseMap.mouse_right);
        break;
      case HOOK_MESSAGE_TYPE.WM_MBUTTONDOWN:
        this.handleMousedown(this.mouseMap.mouse_middle);
        break;
      case HOOK_MESSAGE_TYPE.WM_LBUTTONUP:
        this.handleMouseup(this.mouseMap.mouse_left);
        break;
      case HOOK_MESSAGE_TYPE.WM_RBUTTONUP:
        this.handleMouseup(this.mouseMap.mouse_right);
        break;
      case HOOK_MESSAGE_TYPE.WM_MBUTTONUP:
        this.handleMouseup(this.mouseMap.mouse_middle);
        break;
      case HOOK_MESSAGE_TYPE.WM_MOUSEWHEEL:
        this.handleMousescroll(wparam);
        break;
      default:
        break;
    }
  };

  KeystrokeVisualizer.prototype.handleKeydown = function(wparam, lparam) {
    if (Array.isArray(wparamMap[wparam])) {
      if ((parseInt(lparam) & 0x01000000) === 0x01000000) {
        this.keyMap[wparamMap[wparam][1]].addClass('activated');
      } else {
        this.keyMap[wparamMap[wparam][0]].addClass('activated');
      }
    } else {
      this.keyMap[wparam].addClass('activated');
    }
  };

  KeystrokeVisualizer.prototype.handleKeyup = function(wparam, lparam) {
    // extra handling for any extended keys
    if (Array.isArray(wparamMap[wparam])) {
      if ((parseInt(lparam) & 0x01000000) === 0x01000000) {
        this.keyMap[wparamMap[wparam][1]].removeClass('activated');
      } else {
        this.keyMap[wparamMap[wparam][0]].removeClass('activated');
      }
    } else {
      this.keyMap[wparam].removeClass('activated');
    }
  };

  KeystrokeVisualizer.prototype.handleMousedown = function(button) {
    button.addClass('activated');
  };

  KeystrokeVisualizer.prototype.handleMouseup = function(button) {
    button.removeClass('activated');
  };

  KeystrokeVisualizer.prototype.handleMousescroll = function(direction) {
    if (direction === mouseScroll.UP) {
      clearTimeout(this.mouseScrollUpTimeout);
      this.mouseScrollUpTimeout = setTimeout(function() {
        this.mouseMap.mouse_scroll_up.removeClass('activated');
      }.bind(this), MOUSE_SCROLL_TIMEOUT);
      this.mouseMap.mouse_scroll_up.addClass('activated');
    } else if (direction === mouseScroll.DOWN) {
      clearTimeout(this.mouseScrollDownTimeout);
      this.mouseScrollDownTimeout = setTimeout(function() {
        this.mouseMap.mouse_scroll_down.removeClass('activated');
      }.bind(this), MOUSE_SCROLL_TIMEOUT);
      this.mouseMap.mouse_scroll_down.addClass('activated');
    }
  };

  // jQuery UI interactions
  var initPositionX;
  var initPosXHolder;
  var initPositionY;
  var initPosYHolder;
  var initPointerX;
  var initPointerY;
  var initZoom;
  var axis;


  $('[data-section]').draggable({
    start: function(event, ui) {
      //SET INITIAL POSITION HERE-------------
      initPositionX = ui.position.left;
      initPositionY = ui.position.top;
      initPointerX = event.pageX;
      initPointerY = event.pageY;
      
    },
    drag: function(event, ui) {
      var $element = $(this);

      var zoom = parseFloat($element.css('zoom'));

      var offsetX = (event.pageX - initPointerX);
      var offsetY = (event.pageY - initPointerY);

      // adjust for zoom
      ui.position.top = Math.round(initPositionY + offsetY / zoom);
      ui.position.left = Math.round(initPositionX + offsetX / zoom);

      // adjust for boundaries
      if (ui.position.left < 0) {
        ui.position.left = 0;
      }
      if (zoom * (ui.position.left + $element.width()) >
        document.body.offsetWidth) {
          ui.position.left = (document.body.offsetWidth - 
            zoom * $element.width()) / zoom;
      }
      if (ui.position.top < 0) {
        ui.position.top = 0;
      }
      if (zoom * (ui.position.top + $element.height()) >
        document.body.offsetHeight) {
          ui.position.top = (document.body.offsetHeight -
           zoom * $element.height()) / zoom;
      }

        //Get positions based on ID
        whichItem = ui.helper.context.id;

        if(whichItem === 'mouse'){
          tempConfig.mouseXpos = ui.position.top;
          tempConfig.mouseYpos = ui.position.left;
        }

        if(whichItem === 'numpad'){
          tempConfig.numpadXpos = ui.position.top;
          tempConfig.numpadYpos = ui.position.left;
        }
        
        if(whichItem === 'function'){
          tempConfig.funcXpos = ui.position.top;
          tempConfig.funcYpos = ui.position.left;
        }

        if(whichItem === 'alpha'){
          tempConfig.alphaXpos = ui.position.top;
          tempConfig.alphaYpos = ui.position.left;

        }

        if(whichItem === 'scroll'){
          tempConfig.systemXpos = ui.position.top;
          tempConfig.systemYpos = ui.position.left;
        }

        if(whichItem === 'navigation'){
          tempConfig.navXpos = ui.position.top;
          tempConfig.navYpos = ui.position.left;
        }

        if(whichItem === 'arrow'){
          tempConfig.arrowXpos = ui.position.top;
          tempConfig.arrowYpos = ui.position.left;
        }
      
    }
  }).resizable({
    aspectRatio: true,
    handles: 'all',
    minWidth: 50,
    start: function(event, ui) {
      initZoom = $(this).css('zoom');
      initPositionX = ui.position.left;
      initPositionY = ui.position.top;
      initPointerX = event.pageX;
      initPointerY = event.pageY;
      // Gets the axis that the user is dragging. 'se', 'n', etc.
      axis = $(ui.element).data('ui-resizable').axis;
    },
    resize: function(event, ui) {
      // ui.element is data section
      var $element = ui.element;

      // Get mouse position 
      var  mouseX = event.pageX;
      var  mouseY = event.pageY;      

      // Disallow interactions beyond screen bounds
      if (mouseX < 0) {
        mouseX = 0;
        mouseY = 0;
      }
      if (mouseX > $(window).width()) {
        mouseX = $(window).width();
       }
      if (mouseY < 0) {
        mouseY = 0;
        mouseX = 0;
      }
      if (mouseY > $(window).height()) {
        console.log($(window).height())
        mouseY = $(window).height();
       }
      // get correct new zoom based on axis
      var newZoom = 0;
      if (axis.indexOf('w') === -1) {
          newZoom = Math.max(newZoom, (mouseX - initZoom *
            ui.originalPosition.left) / ui.originalSize.width);
      } else if (axis.indexOf('e') === -1) {
          newZoom = Math.max(newZoom, (initZoom * (ui.originalSize.width + 
            initPositionX) - mouseX) / ui.originalSize.width);
      }

      if (axis.indexOf('n') === -1) {
          newZoom = Math.max(newZoom, (mouseY - initZoom *
            ui.originalPosition.top) / ui.originalSize.height);
      } else if (axis.indexOf('s') === -1) {
          newZoom = Math.max(newZoom, (initZoom * (ui.originalSize.height + 
            initPositionY) - mouseY) / ui.originalSize.height);
      }
      // enforce zoom boundaries
      // Check: minimum zoom level
      if (newZoom < 1 ) {
        newZoom = 1;
      }
      // Check: resizing must not exceed boundaries

      // get ratio after all zoom checks are done.
      var zoomChangeRatio = newZoom / initZoom;
      console.log(newZoom);
      // get ui.originalPosition
      // get ui.position
      // apply ratio to ui.position -> new position = old(left,top) / ratio
      if (axis.indexOf('w') === -1) {
        ui.position.left = ui.originalPosition.left / zoomChangeRatio;
      } else if (axis.indexOf('e') === -1) {
        ui.position.left = mouseX / newZoom;
        if (ui.position.left > initPositionX && newZoom === 1) {
          ui.position.left = initPositionX;
        }
      }

      if (axis.indexOf('n') === -1) {
        ui.position.top = ui.originalPosition.top / zoomChangeRatio;
      } else if (axis.indexOf('s') === -1) {
        ui.position.top = mouseY / newZoom;
        if (ui.position.top > initPositionY && newZoom === 1) {
          ui.position.top = initPositionY;
        }
      }

      // maintain size: ui.size = ui.originalSize
      ui.size.width = ui.originalSize.width;
      ui.size.height = ui.originalSize.height;
      // workaround for mouse, as jquery uses px dimensions by default
      if ($element.is('#mouse')) {
        $element.css('width', '').css('height', '');
        ui.size.width = '';
        ui.size.height = '';
      }

      // apply ratio to zoom
      $element.css('zoom', newZoom);

      //Save new zoom per ui item
        whichItem = ui.helper.context.id;
        if(whichItem === 'mouse'){
          tempConfig.mouseZoom = newZoom;
          tempConfig.mouseXpos = ui.position.top;
          tempConfig.mouseYpos = ui.position.left;
        }

        if(whichItem === 'numpad'){
          tempConfig.numpadZoom = newZoom;
          tempConfig.numpadXpos = ui.position.top;
          tempConfig.numpadYpos = ui.position.left;
        }
        
        if(whichItem === 'function'){
          tempConfig.funcZoom = newZoom;
          tempConfig.funcXpos = ui.position.top;
          tempConfig.funcYpos = ui.position.left;
        }

        if(whichItem === 'alpha'){
          tempConfig.alphaZoom = newZoom;
          tempConfig.alphaXpos = ui.position.top;
          tempConfig.alphaYpos = ui.position.left;

        }

        if(whichItem === 'scroll'){
          tempConfig.systemZoom = newZoom;
          tempConfig.systemXpos = ui.position.top;
          tempConfig.systemYpos = ui.position.left;
        }

        if(whichItem === 'navigation'){
          tempConfig.navZoom = newZoom;
          tempConfig.navXpos = ui.position.top;
          tempConfig.navYpos = ui.position.left;
        }

        if(whichItem === 'arrow'){
          tempConfig.arrowZoom = newZoom;
          tempConfig.arrowXpos = ui.position.top;
          tempConfig.arrowYpos = ui.position.left;
        }

      // zoom out resizer handles so they will be the same size for all zooms
      $element.children('.ui-resizable-handle').css('zoom', 1 / newZoom);
    }
  });

  // XBC interaction begins here
  xjs.ready().then(Item.getCurrentSource).then(function(item) {
    return item.setKeepAspectRatio(false);
  }).then(function(item) {
    // use whole stage for source
    return item.setPosition(Rectangle.fromCoordinates(0, 0, 1, 1));
  }).then(function(item) {
    return item.setKeepLoaded(true);
  }).then(function(item) {
    return item.setBrowserCustomSize(xjs.Rectangle.fromDimensions(1920, 1019));
  }).then(function(item) {
    return item.setPositionLocked(true);
  }).then(function(item) {
    // initialize keyboard
    var keyboard = new KeystrokeVisualizer();
    keyboard.init();

    var sections = {
      func    : $('[data-section=function]'),
      alpha   : $('[data-section=alpha]'),
      system  : $('[data-section=scroll]'),
      nav     : $('[data-section=navigation]'),
      arrow   : $('[data-section=arrow]'),
      numpad  : $('[data-section=numpad]'),
      mouse   : $('[data-section=mouse]'),
    };

    var receiveData = function(config){
      for (var i in config) {
        if (sections[i] !== undefined) {
          if (config[i] === false) {
            sections[i].addClass('hidden');
          } else {
            sections[i].removeClass('hidden');
          }
        }
      }

      //SET Positions
      sections.mouse.css('zoom',config.mouseZoom)
      sections.mouse.css('top',config.mouseXpos)
      sections.mouse.css('left',config.mouseYpos)

      sections.numpad.css('zoom',config.numpadZoom)
      sections.numpad.css('top',config.numpadXpos)
      sections.numpad.css('left',config.numpadYpos)

      sections.func.css('zoom',config.funcZoom)
      sections.func.css('top',config.funcXpos)
      sections.func.css('left',config.funcYpos)

      sections.alpha.css('zoom',config.alphaZoom)
      sections.alpha.css('top',config.alphaXpos)
      sections.alpha.css('left',config.alphaYpos)

      sections.system.css('zoom',config.systemZoom)
      sections.system.css('top',config.systemXpos)
      sections.system.css('left',config.systemYpos)

      sections.nav.css('zoom',config.navZoom)
      sections.nav.css('top',config.navXpos)
      sections.nav.css('left',config.navYpos)

      sections.arrow.css('zoom',config.arrowZoom)
      sections.arrow.css('top',config.arrowXpos)
      sections.arrow.css('left',config.arrowYpos)

      //Transfer position data back to obj for it to be saved
      tempConfig.mouseXpos = config.mouseXpos;
      tempConfig.mouseYpos = config.mouseYpos;
      if(config.mouseZoom !== undefined){
        tempConfig.mouseZoom = config.mouseZoom;
      }
      
      tempConfig.numpadXpos = config.numpadXpos;
      tempConfig.numpadYpos = config.numpadYpos;
      if(config.numpadZoom !== undefined){
        tempConfig.numpadZoom = config.numpadZoom;
      }

      tempConfig.funcXpos = config.funcXpos;
      tempConfig.funcYpos = config.funcYpos;
      if(config.funcZoom !== undefined){
        tempConfig.funcZoom = config.funcZoom;
      }
      
      tempConfig.alphaXpos = config.alphaXpos;
      tempConfig.alphaYpos = config.alphaYpos;
      if(config.alphaZoom !== undefined){
        tempConfig.alphaZoom = config.alphaZoom;
      }
      
      tempConfig.systemXpos = config.systemXpos;
      tempConfig.systemYpos = config.systemYpos;
      if(config.systemZoom !== undefined){
        tempConfig.systemZoom = config.systemZoom;
      }
      
      tempConfig.navXpos = config.navXpos;
      tempConfig.navYpos = config.navYpos;
      if(config.navZoom !== undefined){
        tempConfig.navZoom = config.navZoom;
      }
      
      tempConfig.arrowXpos = config.arrowXpos;
      tempConfig.arrowYpos = config.arrowYpos;
      if(config.arrowZoom !== undefined){
        tempConfig.arrowZoom = config.arrowZoom; 
      }

    };

    //Apply config on Load
    item.loadConfig().then(receiveData);

    //Update and Save config with new coordinates or sizes every mouse-up
    allKey.addEventListener('mouseup',function (){
        item.saveConfig
        item.loadConfig().then(updateData);
      });

    //Apply config on Save
    xjs.SourcePluginWindow.getInstance().on('save-config', function(config) {
      // apply configuration
      for (var i in config) {
        if (sections[i] !== undefined) {
          if (config[i] === false) {
            sections[i].addClass('hidden');
          } else {
            sections[i].removeClass('hidden');
            }
          }
        }
        updateData(config);
    });

    //Merge config to tempConfig that holds the positions then save
    var updateData = function(config){
      for (var i in tempConfig){config[i] = tempConfig[i]}
      item.saveConfig(config);
    }
  });
})();
