$(function () {

  var layerWidth = parseFloat($('.layer').width());
  var layerHeight = parseFloat($('.layer').height());

  var maskWidth = parseFloat($('.mask').width());
  var maskHeight = parseFloat($('.mask').height());

  var largeWidth = parseFloat($('.large').width());
  // console.log('largeWidth ==>', largeWidth);

  var largeHeight = parseFloat($('.large').height());
  // console.log('largeHeight ==>', largeHeight);


  // 获取放大比例
  var scale = largeWidth / maskWidth;


  $('.layer').mouseenter(function () {

    $('.mask').css('display', 'block')
    $('.large').css('display', 'block')
    var src = $('.box').children(0).attr('src');
    console.log('scr ==', src);


    $('.large').css({
      backgroundImage: 'url("' + src + '")'
    })
    $('.large').css({
      backgroundRepeat: 'no-repeat'
    })

    // 设置图片背景图放大后大小
    $('.large').css({
      backgroundSize: layerWidth * scale + 'px ' + layerHeight * scale + 'px'
    })


  })

  $('.layer').mouseleave(function () {

    $('.mask').css('display', 'none')
    $('.large').css('display', 'none')

  })

  $('.layer').mousemove(function (e) {
    // values: e.clientX, e.clientY, e.pageX, e.pageY
    var x = e.offsetX;
    var y = e.offsetY;
    // console.log('x==>',x);
    // console.log('y==>',y);

    // 滑块横向移动范围：
    var minLeft = 0;
    var maxLeft = layerWidth - maskWidth;

    // 滑块纵向移动距离：
    var minTop = 0;
    var maxTop = layerHeight - maskHeight;

    var left = x - maskWidth / 2;
    var top = y - maskHeight / 2;

    // 控制滑块移动范围：
    left = left >= maxLeft ? maxLeft : left <= minLeft ? minLeft : left;
    top = top >= maxTop ? maxTop : top <= minTop ? minTop : top;

    $('.mask').css({
      left: left + 'px',
      top: top + 'px'
    });

    // 设置移动块后放大图：
    $('.large').css({
      backgroundPosition: -left * scale + 'px ' + -top * scale + 'px'
    })


  });


  $('.img').mousemove(function () {
    // console.log(this);
    $(this).children();
    // console.log($(this).children());

    $(this).addClass('active').siblings().removeClass('active');

    var url = $(this).children().attr("src");
    // console.log('url ==>', url)

    $(".box").children($(this).index()).attr('src', url);

  })
  
})