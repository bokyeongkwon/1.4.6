'use strict'

$(function(){
    const depth1 = $(".menu > li"),
          header = $("header");

    depth1.mouseenter(function(){
        header.stop().animate({height:"500px"});
    }).mouseleave(function(){
        header.stop().animate({height:"100px"});
    })
}); //ready
