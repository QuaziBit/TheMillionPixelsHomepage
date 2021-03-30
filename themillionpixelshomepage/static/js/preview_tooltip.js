/* Author: Alexandr Matveyev */

var gridW = 1320, gridH = 1000;

// video
var id = ""; // original id
var vid = ""; // this one will store # + id to simplify usage of id 
var playTime = 0; // store a play time of a video fragment

// coordinates for tooltip and box pointer
var x = 0, y = 0;
var relativeX = 0;
var relativeY = 0;
var p1 = 0, p2 = 0;
var offset = 0;
var corner_x = 0;
var corner_y = 0;

// main container
// ------------------------------------------------------------------ //
var videoContainer = document.getElementById('video_container');
// ------------------------------------------------------------------ //

// tooltip
var tooltipSpan = document.getElementById('custom_tooltip');
var type = "";
var alt = "";
var src = "";
var link = "";
var isVideo = false;
var isGif = false;
var isImage = false;
var media_size_w = 0, media_size_h = 0;
var tooltip_html = "";
var tmp_link_html = "";
var tmp_ad_name = "";
var tooltipAdName = document.getElementById('tooltip_ad_name');
var tooltipAdLink = document.getElementById('tooltip_ad_link');

// links
var main_src = "";
var temp_src = "";
var tmp_link = "";

function getAttributes(val)
{
    // get attributes of an element
    id = $(val).attr("id");
    vid = "#" + id;
    type = $(vid).attr('type');
    alt = $(vid).attr('alt');
    link = $( '#a_' + id ).attr('href');
}

// start video fragment
function start(val)
{
    // get all attributes for a specific element
    getAttributes(val);

    // identify if it is video or gif
    if (type == "video")
    {
        isVideo = true;
        isGif = false;
        isImage = false;

        // get the path for a video file
        src = $(vid).attr('src');

        // get url to the file that will be used as a preview in the tooltip
        // it can be a video file
        temp_src = $("#v_" + id).attr('src');
    }
    else if (type == "gif")
    {
        isVideo = false;
        isGif = true;
        isImage = false;

        // get the path to the media file
        src = $(vid).attr('src');

        // get url to the file that will be used as preview in the tooltip
        temp_src = $("#g_" + id).attr('src');

        // remove static image and set gif-animation while hovering mouse
        $(vid).attr('src', temp_src);
    }

    else if (type == "img")
    {
        isVideo = false;
        isGif = false;
        isImage = true;

        // get the path to the media file
        src = $(vid).attr('src');

        // get url to the file that will be used as preview in the tooltip
        temp_src = $("#i_" + id).attr('src');

        // remove static image and set gif-animation while hovering mouse
        $(vid).attr('src', temp_src);
    }

    // get the size of a media file
    media_size_w = $(vid).attr('width');
    media_size_h = $(vid).attr('height');

    if (isVideo)
    {
        // current video fragment
        v = document.getElementById(id);
        playTime = v.currentTime;

        // set time when video was stopped
        // $(vid).get(0).currentTime = playTime;

        // play video
        v.currentTime = 0;
        $(vid).get(0).play();
    }
}

// stop video fragment
function stop(val)
{
    // get attributes of a specific element
    getAttributes(val);

    // play video fragment
    if (isVideo)
    {
        // current video fragment
        v = document.getElementById(id);

        // set specific time for a video to see its poster
        v.currentTime = playTime;
        $(vid).get(0).pause();
    }

    // gif will play itself simply after hovering static image if it must be a gif
    // the src link will be changed to a gif link
    if (isGif || isImage)
    {
        // remove gif-animation and set static image after mouse is not hovering this media
        $(vid).attr('src', src);
    }

    // reset the file source and other parameters
    id = "";
    vid = "";
    type = "";
    alt = "";
    src = "";
    link = "";
    temp_src = "";

    isVideo = false;
    isGif = false;
    isImage = false;
}

// this section responsible for showing custom tooltip with the page coordinates
function tooltipBox()
{
    if ( $(".video-container:hover").length != 0 && 
        $(".video-fragment:hover").length == 0 && 
        $(".purchase-window:hover").length == 0 
    )
    {
        // if mise cursor is hovering grid
        if ($(".custom-tooltip").is(":visible"))
        {
            /*
            // make tooltip ad-name invisible
            if ($(".tooltip-ad-name").is(":visible"))
            {   
                // clear tooltip name
                $(".tooltip-ad-name").empty();

                // hide tooltip name
                $(".tooltip-ad-name").hide();
            }

            // make tooltip ad-link invisible
            if ($(".tooltip-ad-link").is(":visible"))
            {   
                // clear tooltip link
                $(".tooltip-ad-link").empty();

                // hide tooltip link
                $(".tooltip-ad-link").hide();
            }
            */

            // we have to shift tooltip position
            rx = relativeX; 
            ry = relativeY;

            // if tooltip outside of screen
            // ---------------------------------- //
            if (relativeX > 1210)
            {
                rx = rx - 120;
            }

            if (relativeY < 80)
            {
                ry = ry + 50;
            }
            // ---------------------------------- //

            // position tooltip based on relative coordinates
            tooltipSpan.style.top = (ry - 40) + 'px';
            tooltipSpan.style.left = (rx + 25) + 'px';

            // version-1: display current cursor coordinates in the tooltip
            // show tooltip with coordinates, but show only relative coordinates
            // get exact coordinates
            // $(".custom-tooltip").text(relativeX + "x, " + relativeY + "y");

            // version-2: display current cursor coordinates in the tooltip
            // ---------------------------------------------------------------------------------------- //
            // sometimes we can get coordinates in a floating point format and digits after decimal extremely small, 
            // so we have to remove all decimal numbers after dot
            // ax1 = Math.trunc( $( "#square_box_a" ).position().left ); // box-a coordinates
            // ay1 = Math.trunc( $( "#square_box_a" ).position().top );  // box-a coordinates
            // bx1 = Math.trunc( $( "#square_box_b" ).position().left ); // box-b coordinates
            // by1 = Math.trunc( $( "#square_box_b" ).position().top );  // box-b coordinates

            ax1 = parseInt(box_a.style.left.replace('px', ''), 10);
            ay1 = parseInt(box_a.style.top.replace('px', ''), 10);
            bx1 = parseInt(box_b.style.left.replace('px', ''), 10);
            by1 = parseInt(box_b.style.top.replace('px', ''), 10);

            // if box-a is not active use coordinates of box-b
            if ( $( "#square_box_a" ).attr('name') == 'inactive' && $( "#square_box_b" ).attr('name') == 'active' )
            {
                ax1 = bx1;
                ay1 = by1;
            }

            // if box-a is not active and box-b is not active use relative coordinates
            if ( $( "#square_box_a" ).attr('name') == 'inactive' && $( "#square_box_b" ).attr('name') == 'inactive' )
            {
                ax1 = relativeX;
                ay1 = relativeY;
            }

            // show tooltip with coordinates, but show only relative coordinates
            // use coordinates of box-a and box-b coordinates
            $(".custom-tooltip").text(ax1 + "x, " + ay1 + "y");
            // ---------------------------------------------------------------------------------------- //
        }
        else
        {
            // show tooltip
            $(".custom-tooltip").css('display', 'inline-block');
        }
    }
    else if($(".video-container:hover").length != 0 && $(".video-fragment:hover").length != 0)
    {
        // hide form if user did hover a media-fragment with the mouse pointer
        /*
        if (!$(".purchase-window").is(":hidden"))
        {
            $(".purchase-window").css('display', 'none');
            $(".inactive-layer").css('display', 'none');

            // we have to reset all parameters and elements
            resetAll();
        }
        */

        // if mouse cursor is hovering a video fragment
        if ($(".custom-tooltip").is(":visible"))
        {
            /*
            // make tooltip ad-name visible
            if (!$(".tooltip-ad-name").is(":visible"))
            {   
                $(".tooltip-ad-name").css('display', 'inline-block');
            }

            // make tooltip ad-link visible
            if (!$(".tooltip-ad-link").is(":visible"))
            {   
                $(".tooltip-ad-link").css('display', 'inline-block');
            }
            */

            // creating tooltip image preview or gif animation
            generateTooltipPreview();

            // we have to shift tooltip position
            rx = relativeX + 40; 
            ry = relativeY + 40;

            // working with the location of the tooltip if it is out of screen
            // we have to recalculate its location
            // -------------------------------------------------------- //
            // tooltip_w = Math.trunc($( "#custom_tooltip" ).width());
            // tooltip_h = Math.trunc($( "#custom_tooltip" ).height());

            tooltip_w = parseInt(tooltipSpan.offsetWidth, 10);
            tooltip_h = parseInt(tooltipSpan.offsetHeight, 10);

            // looking up if tooltip is off grid we have to shift it
            if ( relativeX > (gridW - tooltip_w) )
            {
                rx = relativeX - tooltip_w - 40;
                ry = relativeY + 40;
            }

            // looking up if tooltip is off grid we have to shift it
            if ( relativeY > (gridH - tooltip_h))
            {
                rx = relativeX + 40;
                ry = relativeY - tooltip_h - 40;
            }

            // looking up if tooltip is off grid we have to shift it
            if ( (relativeX > (gridW - tooltip_w)) && (relativeY > (gridH - tooltip_h)) )
            {
                rx = relativeX - tooltip_w - 80;
                ry = relativeY - tooltip_h - 80;
            }

            // looking up if tooltip is off grid we have to shift it
            if ( relativeX >= 1080 && relativeY >= 830)
            {
                rx = relativeX - tooltip_w - 40;
                ry = relativeY - tooltip_h - 40;
            }

            // looking up if tooltip is off grid we have to shift it
            if ( relativeY >= 830)
            {
                // rx = relativeX - tooltip_w - 40;
                ry = relativeY - tooltip_h - 40;
            }

            // position tooltip based on relative coordinates
            tooltipSpan.style.left = (rx) + 'px';
            tooltipSpan.style.top = (ry) + 'px';

            // tooltip name top-left corner x-coordinate
            tooltipAdName.style.left = parseInt(tooltipSpan.style.left.replace('px', ''), 10) + 'px';

            // tooltip link top-left corner x-coordinate
            // tooltipAdLink.style.left = Math.trunc( $( "#custom_tooltip" ).position().left ) + 'px';
            tooltipAdLink.style.left = parseInt(tooltipSpan.style.left.replace('px', ''), 10) + 'px';

            // getting y-coordinate of main tooltip with image
            // y_position = Math.trunc( $( "#custom_tooltip" ).position().top );
            y_position = parseInt(tooltipSpan.style.top.replace('px', ''), 10);

            // for tooltip name top-left corner y-coordinate
            // tmp_h = parseInt(tooltipAdName.offsetHeight, 10);
            // tooltipAdName.style.top = (y_position - tmp_h) + 'px';

            // for tooltip link top-left corner y-coordinate
            // y_position = y_position + Math.trunc( parseInt( ($("#custom_tooltip").height()).toFixed() * 1) );
            y_position = y_position + parseInt(tooltipSpan.offsetHeight, 10); 
            y_position = y_position;
            tooltipAdName.style.top = y_position + 'px';

            tmp_h = parseInt(tooltipAdName.offsetHeight, 10);
            tooltipAdLink.style.top = (y_position + tmp_h) + 'px';
            // -------------------------------------------------------- //

        }
        else
        {
            //$(".custom-tooltip").show();
            $(".custom-tooltip").css('display', 'inline-block');
            // $(".tooltip-ad-name").css('display', 'inline-block');
            // $(".tooltip-ad-link").css('display', 'inline-block');
        }
    } 
    else
    {
        // even if tooltip is hidden show coordinates in a header
        // $(".coordinates").text(relativeX + "x, " + relativeY + "y");

        /*
        // clear tooltip name
        $(".tooltip-ad-name").empty();
        // hide tooltip name
        $(".tooltip-ad-name").hide();
        // clear tooltip link
        $(".tooltip-ad-link").empty();
        // hide tooltip link
        $(".tooltip-ad-link").hide();
        */

        // clear tooltip
        $(".custom-tooltip").empty();

        // hide tooltip
        $(".custom-tooltip").hide();
    }
}

// here we generating html for the tooltip, it will show an image or gif for the user
function generateTooltipPreview()
{
    // if original size of the graphics very small we have to scale it,
    // so in the tooltip it will bi larger 

    // working with the size of the tooltip
    // -------------------------------------------------------- //
    w = media_size_w;
    h = media_size_h;

    // proportions for scaling an image
    // var gridW = 1320, gridH = 1000;
    if (w == gridW && gridH)
    {
        maxWidth = w / 4;
        maxHeight = h / 4;
    }
    else
    {
        maxWidth = w;
        maxHeight = h;
    }
    ratio = Math.min( maxWidth / w , maxHeight/ h );

    // calculate a preview image for the tooltip
    w = media_size_w * ratio;
    h = media_size_h * ratio;
    /*
    if (media_size_w <= 100 || media_size_h <= 100)
    {
        w = media_size_w * ratio;
        h = media_size_h * ratio;
    }
    if (media_size_w > 100 || media_size_h > 100)
    {
        w = media_size_w * ratio;
        h = media_size_h * ratio;
    }
    */
    // -------------------------------------------------------- //

    // store temporal tooltip html
    tmp_ad_name = "";
    tooltip_html = "";
    tmp_link_html = "";

    // generate tooltip for video
    if (isVideo)
    {
        // tooltip for a video fragment can be different comparing to gif or img
        tmp_ad_name = '<div class="custom-tooltip-text">' + alt + '</div>';
        /*
        tmp_preview = '<video autoplay loop="true" width="' + w + '" height="' + h + '">' +
                      '<source src="' + temp_src + '" type="video/mp4">' + '</video>';
        */
        tmp_preview = '<div class="custom-tooltip-preview"><img src="' + temp_src + '" height ="'+h+'" width="'+w+'"/></div>';
        tmp_link_html = '<a href="' + link + '" class="custom-tooltip-link">' + link + '</a>';

        tooltip_html = tmp_preview;
    }

    // generate tooltip for gif or img
    if (isGif || isImage)
    {
        tmp_ad_name = '<div class="custom-tooltip-name">' + alt + '</div>';
        tmp_preview = '<div class="custom-tooltip-preview"><img src="' + temp_src + '" height ="'+h+'" width="'+w+'"/></div>';
        tmp_link_html = '<div class="custom-tooltip-link"><a href="' + link + '" class="custom-tooltip-link">' + link + '</a></div>';

        tooltip_html = tmp_ad_name + tmp_preview + tmp_link_html;
    }

    // $(".tooltip-ad-name").empty();
    // $(".tooltip-ad-name").append(tmp_ad_name);

    $(".custom-tooltip").empty();
    $(".custom-tooltip").append(tooltip_html);

    // $(".tooltip-ad-link").empty();
    // $(".tooltip-ad-link").append(tmp_link_html);
}

// call this function any time when mouse is moving
function getCoordinates(event)
{
    // get absolute coordinates
    x = event.pageX;
    y = event.pageY;

    // get exact coordinates of the pointer in the video-container,
    // so technically it is relative coordinates
    // offset = $(".video-container").offset();
    // console.log("[@] offset L: " + offset.left + " --- T: " + offset.top + "\n");
    // relativeX = parseInt( (x - offset.left).toFixed() * 1);
    // relativeY = parseInt( (y - offset.top).toFixed() * 1); 

    offset = videoContainer;
    relativeX = parseInt( (x - offset.offsetLeft).toFixed() * 1);
    relativeY = parseInt( (y - offset.offsetTop).toFixed() * 1); 
    // in javascript we need to be more specific with numbers, so we have to use parseInt() and *1

    // get coordinates for box pointer
    // -------------------------------------------------------------------------------- //

    // just temporal variables
    tmpDigit = null;
    lastDigit = null;
    
    // get coordinate for x-position of the top left corner of the box
    // convert to string
    tmpDigit = relativeX.toString();
    
    // get lest digit of the relativeX as integer
    lastDigit = tmpDigit.substring( (tmpDigit.length - 1) , tmpDigit.length );

    // subtract lastDigit from relativeX
    // for the coordinates we need round number that gives us ([num % 10] == 0)
    // have to use this way to make sure box will move any time mouse move,
    // and simple usage of ([num % 10] == 0) will not work to get coordinates
    p1 = relativeX - parseInt(lastDigit, 10);

    // get coordinate for x-position of the top left corner of the box
    tmpDigit = relativeY.toString();

    // get lest digit of the relativeX as integer
    lastDigit = tmpDigit.substring( (tmpDigit.length - 1) , tmpDigit.length );

    // subtract lastDigit from relativeY
    // for the coordinates we need round number that gives us ([num % 10] == 0)
    // have to use this way to make sure box will move any time mouse move,
    // and simple usage of ([num % 10] == 0) will not work to get coordinates
    p2 = relativeY - parseInt(lastDigit, 10);
    // -------------------------------------------------------------------------------- //
}

// run this if html document completely loaded
$(document).ready(function () 
{
    // working with mouse hover a video fragment
    $(".video-fragment").hover( function () { start(this); }, function () { stop(this); } );

    // on mouse move show tooltip and box pointer
    $(document).mousemove( function( event )
    {
        // get coordinates
        getCoordinates(event);

        // working with tooltip
        tooltipBox();
    });
});