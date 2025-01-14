const $ = require('jquery');

const Default = {
  TEMPLATE:
    '<div class="butterfly-toolTip" role="butterfly-tooltip"><div class="butterfly-tooltip-arrow"></div><div class="butterfly-tooltip-inner"></div></div>',

  $viewAppend: '.butterfly-wrapper',
  $viewCon: '.butterfly-toolTip',
  $inner: '.butterfly-tooltip-inner',
  callbackWhitelist: ['LI'],

  evntList: ['hover'],

  callBackOpen: true,

  delay: 300,
};

const _toFixed_3 = (num) => {
  if (Number(num)) {
    return Number(parseFloat(num).toFixed(3));
  }
};
const _getTipOffset = (placement, pos) => {
  const _pos = {};
  let {left, top, width, height, actualWidth, actualHeight} = pos;
  left = _toFixed_3(left);
  top = _toFixed_3(top);
  width = _toFixed_3(width);
  height = _toFixed_3(height);
  actualWidth = _toFixed_3(actualWidth);
  actualHeight = _toFixed_3(actualHeight);

  switch (placement) {
    case 'top':
      _pos.left = left + width / 2 - actualWidth / 2;
      _pos.top = top - actualHeight;
      break;
    case 'left':
      _pos.left = left - actualWidth;
      _pos.top = top + height / 2 - actualHeight / 2;
      break;
    case 'right':
      _pos.left = left + width;
      _pos.top = top + height / 2 - actualHeight / 2;
      break;
    case 'bottom':
      _pos.left = left + width / 2 - actualWidth / 2;
      _pos.top = top + actualHeight;
    default:
      _pos.left = left + width / 2 - actualWidth / 2;
      _pos.top = top - actualHeight;
  }
  return _pos;
};

const show = (opts, dom, toolTipDom, callBackFunc, e) => {
  $(opts.$viewCon).remove();

  opts.callBackOpen &&
    toolTipDom.on('click', (e) => {
      if (callBackFunc) {
        const res = {value: e.target.textContent};
        if (opts.callbackWhitelist.includes(e.target.nodeName)) callBackFunc(res, e);
      }
      e.stopPropagation();
    });

  toolTipDom.appendTo($(opts.$viewAppend));
  let placement = opts.placement || 'top';
  toolTipDom.addClass(placement);
  const posArr = dom.attr('style' || '').split(';');
  const [postTop = 0] = posArr
    .filter((j) => j.indexOf('top') > -1)
    .map((i) => i.replace(/[^\d.]/g, ''));
  const [posLeft = 0] = posArr
    .filter((j) => j.indexOf('left') > -1)
    .map((i) => i.replace(/[^\d.]/g, ''));

  const pos = {
    top: postTop || dom.position().top,
    left: posLeft || dom.position().left,
    width: dom.outerWidth(),
    height: dom.outerHeight(),
    actualWidth: toolTipDom.outerWidth(),
    actualHeight: toolTipDom.outerHeight(),
  };

  const posInit = _getTipOffset(placement, pos);
  const position = `top: ${posInit.top}px; left: ${posInit.left}px;`;
  toolTipDom.attr('style', position).addClass('in');
};

const hide = (toolTipDom) => {
  toolTipDom.removeClass('in').remove();
};

function creatTips(option, dom, callBackFunc) {
  const opts = {...Default, ...option};

  let toolTipDom = $(opts.TEMPLATE);
  toolTipDom.find(opts.$inner).html(opts.content);

  let _timeoutMouseover = null;

  opts.evntList.includes('hover') &&
    dom
      .on('mouseover', (e) => {
        clearTimeout(_timeoutMouseover);
        _timeoutMouseover = setTimeout(() => {
          show(opts, dom, toolTipDom, callBackFunc, e);
        }, opts.delay);
      })
      .on('mouseout', (e) => {
        clearTimeout(_timeoutMouseover);
        !$(opts.$viewCon).hasClass('butterfly-active-tip') && hide(toolTipDom);
      });
  opts.evntList.includes('click') &&
    dom.on('click', (e) => {
      if ($(opts.$viewCon).hasClass('butterfly-active-tip')) {
        $(opts.$viewCon).removeClass('butterfly-active-tip');
        hide(toolTipDom);
      } else {
        toolTipDom.addClass('butterfly-active-tip');
        show(opts, dom, toolTipDom, callBackFunc, e);
      }
    });
  return dom;
}

function creatMenus(opts, dom, callBackFunc, menu = [], showTip = false) {
  const menuDom = $('<div class="butterfly-tip-menu-div"></div>');

  const menuUl = $('<ul class="butterfly-tip-menu-ul"></ul>');

  (menu || []).forEach((item) => {
    $('<li class="butterfly-tip-menu-li"></li>')
      .attr('key', `${item.key}`)
      .text(item.value)
      .appendTo(menuUl);
  });

  showTip && $(`<div class="butterfly-tip-menu-title">${opts.content}</div>`).appendTo(menuDom);
  menuUl.appendTo(menuDom);

  opts.placement = opts.placement || 'right';
  opts.content = menuDom;
  opts.evntList = opts.evntList || ['click'];
  return creatTips(opts, dom, callBackFunc);
}

export default {
  creatTips,
  creatMenus,
};
