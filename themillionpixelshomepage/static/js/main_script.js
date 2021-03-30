/* Author: Alexandr Matveyev */

/* CSRF Protection */
var csrftoken = $('meta[name=csrf-token]').attr('content');

// max size for free add 100x100 pixels
var adMaxW = 100, adMaxH = 100, adMaxSquare = (adMaxW / 10) * (adMaxH / 10);

var gridW = 1320, gridH = 1000;
// price_ratio = 0.8
var price_ratio = 0.07, space_per_square = 0.032; // megabytes
var real_price = 100; 
var per_square = Number((real_price * price_ratio).toFixed(0)), s_available = 13200;

function initPage() 
{
    $(".pre-header").empty();
    msg = "<span>Got a square - own kilobytes of internet history!</span>" + 
          "<span style='margin-left: 25px; color: #FFD700;'>" + (space_per_square * 1000) + " kilobytes per square</span>";
    $(".pre-header").html(msg);

    $(".free-ad-info").empty();
    msg = "<span>Free Ad can be up to <strong>" + (adMaxW / 10) + "x" + (adMaxH / 10) + "</strong> squares or <strong>" + adMaxW + "x" + adMaxH + "</strong> pixels, or less.</span>";
    msg += "<span><strong>You are not required to pay.</strong></span>";
    $(".free-ad-info").html(msg);
}


function callAjaxInit(handleData)
{
    // get html-fragments
    $.ajax({
        url: '/update',
        type: 'GET',
        dataType: 'json', 
        async: true,
        success: function(result)
        {
            handleData(result);
        },
        error: function(error)
        {
            console.log(error);
        }
    });
}

function updateStats(tmp)
{
    s_available = tmp;

    text1 = "  $" + per_square + " per square";
    text2 = " " + s_available.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " squares available";

    $( "#per_square_text" ).empty();
    $( "#s_available_text" ).empty();

    $( "#per_square_text" ).text(text1);
    $( "#s_available_text" ).text(text2);
}

// run this if html document completely loaded
$(document).ready(function () 
{
    initPage();

    // console.log("csrftoken: " + csrftoken + "\n\n");
    // console.log("$SCRIPT_ROOT: " + $SCRIPT_ROOT);

    callAjaxInit(function(output)
    {
        // console.log(output);
        s_available = output.available_squares;
        updateStats(s_available);
    });
    // Note: the call won't wait for the result,
    // so it will continue with the code here while waiting.
});
