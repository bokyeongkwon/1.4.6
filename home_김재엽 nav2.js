'use strict'

$(function(){
    const depth1 = $(".menu > li"),
          header = $("header");

    depth1.mouseenter(function(){
        header.stop().animate({height:"300px"});
    }).mouseleave(function(){
        header.stop().animate({height:"50px"});
    })
}); //ready
