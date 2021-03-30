/* Author: Alexandr Matveyev */

// grid size
var gridW = 1320, gridH = 1000;

// square size
var boxSize = 10;

// coordinates for tooltip and box pointer
var x = 0, y = 0;
var relativeX = 0;
var relativeY = 0;
var offset = 0;

// box coordinates
var x1 = 0, y1 = 0, x2 = 10, y2 = 0, x3 = 10, y3 = 10, x4 = 0, y4 = 10;
var p1 = 0, p2 = 0;

// main container
// ------------------------------------------------------------------ //
// var videoContainer = document.getElementById('video_container');
// ------------------------------------------------------------------ //

// box-pointers
// ------------------------------------------------------------------ //
// initial box-pointer
// box pointer element
var pseudo_box_id = 0;
var box_a = document.getElementById('square_box_a');
box_a.style.left = 0;
box_a.style.top = 0;
var box_width = 10;
var box_height = 10;

// second box-pointer
var box_b = document.getElementById('square_box_b');
box_b.style.left = 0;
box_b.style.top = 0;

var active_stage = "active";
var inactive_stage = "inactive";
// ------------------------------------------------------------------ //

// selected area indicator
var selected_squares = document.getElementById('selected_squares');
selected_squares.style.left = 0;
selected_squares.style.top = 0;
var tmp_squares_selected = 0, tmp_squares_selected_w = 0, tmp_squares_selected_h = 0;
var final_squares_selected = 0;

// tooltip element for selected square
var boxTooltipSpan = document.getElementById('price_tooltip');
var submitForm = "";
var boxTooltipPrice = per_square;
var boxTooltipText = "$" + boxTooltipPrice + " ";
var tmp_x = 0, tmp_y = 0;
var tooltip_offset = 30;

// tooltip buttons, buy-cancel tooltip
var boxTooltipSpanButtons = document.getElementById('buy_cancel_buttons');
var get_squares_html = 
    ' <span id="buy_button" class="buy-button">Buy</span>' +
    '<span id="cancel_button" class="cancel-button">Cancel</span>';

// it will indicate the width and the height of the selected area
var selectedAreaInfo = document.getElementById('selected_squares_info');

// area selection colors
var red = "rgb(255, 0, 0)";
var border_color = "rgb(255, 255, 255)";
var new_color = "rgb(85, 239, 196)";
var new_border_color = "rgb(225, 112, 85)";
var confirm_selection_border_color = "rgb(223, 230, 233)";
var confirm_selection_color = "rgb(129, 236, 236)";

// tracking if square was clicked
var isClicked = false;

// tracking if square selection started
var isSelecting = false;

// if this variable is true user cannot do any area selection
var isConfirmed = false;

// store final coordinates of initial square and size of current selected area
var final_top_x = 0, final_top_y = 0;
var final_w = 0, final_h = 0;
var current_x = 0, current_y = 0;
var final_cost = 0;
var tmp_area_w = 0, tmp_area_h = 0;


// this section used for moving a square box along with the mouse cursor
function boxPointer()
{
    if($(".video-container:hover").length != 0 && $(".video-fragment:hover").length == 0)
    {
        // display initial box-pointer
        if ($(".square-box-a").is(":hidden"))
        {
            $(".square-box-a").css('display', 'inline-block');
        }

        // working with the positioning box-a pointer if mouse pointer is inside the grid 
        if ( (relativeX >= 0 && relativeY >= 0) && (relativeX < gridW && relativeY < gridH) )
        {
            // x-coordinate move right
            if ( (relativeX - x1 - 10) > 0)
            {
                // keep current x-coordinate
                x1 = p1;
                box_a.style.left = (p1) + 'px';
            }

            // x-coordinate move left
            if ( (x1 - relativeX) > 1)
            {
                // keep current x-coordinate
                x1 = p1;
                box_a.style.left = (p1) + 'px';
            }

            // y-coordinate move down
            if ( (relativeY - y1) > 10)
            {
                // keep current y-coordinate
                y1 = p2;
                box_a.style.top = (p2) + 'px';
            }

            // y-coordinate move up
            if ( (y1 - relativeY) > 1)
            {
                // keep current y-coordinate
                y1 = p2;
                box_a.style.top = (p2) + 'px';
            }

            // even if box-b is hidden keep sitting up its coordinates
            box_b.style.left = box_a.style.left;
            box_b.style.top = box_a.style.top;

            // the point is to print in the upper right corner of the page the coordinates where
            // video file or gif file will be placed
            // showCoordinates($( "#square_box_a" ).position().left, $( "#square_box_a" ).position().top);
            showCoordinates(parseInt(box_a.style.left.replace('px', ''), 10), parseInt(box_a.style.top.replace('px', ''), 10));
        }
        // -------------------------------------------------------------------------- //
    }
    else
    {
        // hide square box
        $(".square-box-a").hide();
    }
}

// this function start to work after user did click the box-pointer, and now user can select area of squares
function squareSelection()
{
    if($(".video-container:hover").length != 0 && $(".video-fragment:hover").length == 0)
    {
        // display the second box-pointer
        if ($(".square-box-b").is(":hidden"))
        {
            box_b.style.left = (p1) + 'px';
            box_b.style.top = (p2) + 'px';

            $(".square-box-b").css('display', 'inline-block');
        }

        // display selection area
        if ($(".selected-squares").is(":hidden"))
        {
            selected_squares.style.left = box_a.style.left;
            selected_squares.style.top = box_a.style.top;

            $(".selected-squares").css('display', 'block');
        }

        // working with the positioning box-a pointer if mouse pointer is inside the grid 
        if ( (relativeX >= 0 && relativeY >= 0) && (relativeX < gridW && relativeY < gridH) )
        {
            // x-coordinate move right
            if ( (relativeX - x1 - 10) > 0)
            {
                // keep current x-coordinate
                x1 = p1;

                // increase box width
                box_width = box_width + 10;
            }

            // x-coordinate move left
            if ( (x1 - relativeX) > 1)
            {
                // keep current x-coordinate
                x1 = p1;

                // if box width is more than 10 than we can decrease it
                if (box_width > 10)
                {
                    // decrease the selection area size
                    box_width = box_width - 10;
                }

                // if box width is 10 then we have to change box location,
                // so after that we can scale it again from left to right
                if (box_width == 10)
                {
                    // update this coordinate variable, so we can update tooltip location
                    tmp_x = p1;

                    // if selection square is very close to the end of the grid the price-tooltip and its buttons will be 
                    // shifted to the left by 200px
                    if (p1 >= 1140)
                    {
                        // shift to the left tooltip
                        //p1 = p1 - 200;
                        //p1 = p1 - ($( "#price_tooltip" ).width() + $( "#buy_cancel_buttons" ).width() );

                        // store in the temp variable
                        tmp_x = p1;
                    }
                }
            }

            // y-coordinate move down
            if ( (relativeY - y1) > 10)
            {
                // keep current y-coordinate
                y1 = p2;

                // increase box height
                box_height = box_height + 10;
            }

            // y-coordinate move up
            if ( (y1 - relativeY) > 1)
            {
                // keep current y-coordinate
                y1 = p2;

                // if box height is more than 10 than we can decrease it
                if (box_height > 10)
                {
                    // decrease the selection area size
                    box_height = box_height - 10;
                }

                // if box height is 10 then we have to change box location,
                // so after that we can scale it again from left to right
                if (box_height == 10)
                {
                    // update this coordinate variable, so we can update tooltip location
                    tmp_y = p2 - 20;
                }
            }

            // update location of the second box-pointer
            box_b.style.left = (p1) + 'px';
            box_b.style.top = (p2) + 'px';

            // update the position and location of the selection area
            selectionAreaUpdate();

            // update location of the tooltip with the price
            priceTooltipUpdate();
        }
    }
}

// this function used to show price of the selected squares
function displayPriceTooltip()
{
    if ($(".price-tooltip").is(":hidden"))
    {
        // show price-tooltip and buy-cancel tooltip
        $(".price-tooltip").css('display', 'inline-block');
        $(".buy-cancel-buttons").css('display', 'inline-block');
        $(".selected-squares-info").css('display', 'inline-block');

        // store coordinates in the temp variables
        tmp_x = p1;
        tmp_y = p2;

        // if selection square is very close to the end of the grid the price-tooltip and its buttons will be 
        // shifted to the left by 200px
        
        if (p1 >= 1200)
        {
            // shift to the left tooltip
            p1 = p1 - 185;

            // store in the temp variable
            tmp_x = p1;
        }

        // set y-coordinate so tooltip will be upper from box pointer
        tmp_y = tmp_y - tooltip_offset;

        // location of price-tooltip
        boxTooltipSpan.style.left = (tmp_x) + 'px';
        boxTooltipSpan.style.top = (tmp_y) + 'px';
        isSelecting = true;
        $(".price-tooltip").append(boxTooltipText);

        // location of the buy-cancel tooltip
        // get sum of position and width to calculate a position bor buttons
        // tmp = $( "#price_tooltip" ).position().left + $( "#price_tooltip" ).width();
        tmp = parseInt(boxTooltipSpan.style.left.replace('px', ''), 10) + $( "#price_tooltip" ).width();

        boxTooltipSpanButtons.style.left = ( tmp + 12 ) + 'px';
        boxTooltipSpanButtons.style.top = (tmp_y) + 'px';
        $(".buy-cancel-buttons").append(get_squares_html);

        // working with the info-box for the selected area
        // -------------------------------------------------------------------------------- //
        // location of the selected-squares-info tooltip
        // get sum of position and width to calculate a position bor buttons
        // tmp_x = $( "#square_box_a" ).position().left;
        tmp_x = parseInt(box_a.style.left.replace('px', ''), 10);
        if (relativeX > 1280 && tmp_x >= 1090)
        {
            tmp_x = tmp_x - 120;
        }

        
        // var ax1 = $( "#square_box_a" ).position().left, ay1 = $( "#square_box_a" ).position().top;
        var ax1 = parseInt(box_a.style.left.replace('px', ''), 10);
        var ay1 = parseInt(box_a.style.top.replace('px', ''), 10);

        // ax1 = Math.trunc(ax1);
        // ay1 = Math.trunc(ay1);

        // tmp = $( "#square_box_a" ).position().top + 20;
        tmp = parseInt(box_b.style.top.replace('px', ''), 10) + 20;

        selectedAreaInfo.style.left = ( tmp_x ) + 'px';
        selectedAreaInfo.style.top = ( tmp ) + 'px';
        // $(".selected-squares-info").text(ax1 + "x, " + ay1 + "y : W: " + 10 + "px - H: " + 10 + "px : " + tmp_squares_selected + " squares");
        // tmp_info_msg = (tmp_area_w / 10) + "x" + (tmp_area_h / 10) + " = " + tmp_squares_selected + " squares";
        tmp_info_msg = tmp_squares_selected_w + "x" + tmp_squares_selected_h + " = " + tmp_squares_selected + " squares";
        $(".selected-squares-info").text(tmp_info_msg);

        // set the number of selected squares
        $(".area-text").empty();
        $(".area-text").text( tmp_squares_selected + " squares" );

        // show width and hight
        $(".area-size-text").empty();
        $(".area-size-text").text( tmp_area_w + "x" + tmp_area_h );
        // -------------------------------------------------------------------------------- //
    }
    else
    {
        // here we will hide price-tooltip, buy-cancel tooltip, and the second box-pointer

        // user is not selecting any more squares
        isSelecting = false;

        // clear and hide the price-tooltip
        $(".price-tooltip").empty();
        $(".price-tooltip").hide();

        // clear and hide the buy-cancel tooltip
        $(".buy-cancel-buttons").empty();
        $(".buy-cancel-buttons").hide();

        // reset price
        resetPriceTooltip();
    }
}

// update location and the size of the area the user selecting 
function selectionAreaUpdate()
{
    // get location of the box-pointers
    // $( "#id_name" ).position().left --> sometimes it gives not very accurate coordinates
    /*
    var ax1 = $( "#square_box_a" ).position().left, ay1 = $( "#square_box_a" ).position().top;
    var bx1 = $( "#square_box_b" ).position().left, by1 = $( "#square_box_b" ).position().top;
    */
    var ax1 = parseInt(box_a.style.left.replace('px', ''), 10);
    var ay1 = parseInt(box_a.style.top.replace('px', ''), 10);
    var bx1 = parseInt(box_b.style.left.replace('px', ''), 10);
    var by1 = parseInt(box_b.style.top.replace('px', ''), 10);

    // parseInt(siteA.style.left.replace('px', ''), 10)

    // sometimes we can get coordinates in a floating and digits after decimal extremely small, so
    // point form and we have to remove all decimal numbers
    /*
    ax1 = Math.trunc(ax1);
    ay1 = Math.trunc(ay1);
    bx1 = Math.trunc(bx1);
    by1 = Math.trunc(by1);
    */

    tmp_info_x = ax1;
    tmp_info_y = ay1;

    // accurately calculate the selected area
    var w = bx1 - ax1 + 10, h = by1 - ay1 + 10;

    if (bx1 < ax1 && by1 < ay1)
    {
        selected_squares.style.left = box_b.style.left;
        selected_squares.style.top = box_b.style.top;

        w = ax1 - bx1 + 10;
        h = ay1 - by1 + 10;

        // have to update coordinates based on where is the left upper corner of the selection area
        tmp_info_x = bx1;
        tmp_info_y = by1;
        showCoordinates(bx1, by1);

    }
    else if (bx1 < ax1)
    {
        selected_squares.style.left = box_b.style.left;
        selected_squares.style.top = box_a.style.top;

        w = ax1 - bx1 + 10;

        // have to update coordinates based on where is the left upper corner of the selection area
        tmp_info_x = bx1;
        tmp_info_y = ay1;
        showCoordinates(bx1, ay1);
    }
    else if (by1 < ay1)
    {
        selected_squares.style.left = box_a.style.left;
        selected_squares.style.top = box_b.style.top;

        h = ay1 - by1 + 10;

        // have to update coordinates based on where is the left upper corner of the selection area
        tmp_info_x = ax1;
        tmp_info_y = by1;
        showCoordinates(ax1, by1);
    }
    else
    {
        selected_squares.style.left = box_a.style.left;
        selected_squares.style.top = box_a.style.top;

        // have to update coordinates based on where is the left upper corner of the selection area
        tmp_info_x = ax1;
        tmp_info_y = ay1;
        showCoordinates(ax1, ay1);
    }

    // change size of the selecting area
    $("#selected_squares").css('width', w);
    $("#selected_squares").css('height', h);

    // working with the info-box for the selected area
    // ----------------------------------------------------------------------- //
    // location of the selected-squares-info tooltip
    // get width and height of the selected are an set coordinates for the info-box based on that parameters
    tmp_squares_selected = w * h / 100;
    tmp_squares_selected_w = w / 10;
    tmp_squares_selected_h = h / 10;
    // tmp_x = $( "#selected_squares" ).position().left;
    tmp_x = parseInt(selected_squares.style.left.replace('px', ''), 10);
    // tmp_box_x = $( "#square_box_a" ).position().left;
    tmp_box_x = parseInt(box_a.style.left.replace('px', ''), 10);

    if (relativeX > 1280 && tmp_box_x >= 1090)
    {
        tmp_x = tmp_x - 120;
    }

    // tmp_y = $( "#selected_squares" ).position().top + h + 10;
    tmp_y = parseInt(selected_squares.style.top.replace('px', ''), 10) + h + 10;

    selectedAreaInfo.style.left = ( tmp_x ) + 'px';
    selectedAreaInfo.style.top = ( tmp_y ) + 'px';
    // $(".selected-squares-info").text(tmp_info_x + "x, " + tmp_info_y + "y : W: " + w + "px - H: " + h + "px : " + tmp_squares_selected + " squares");
    // tmp_info_msg = (tmp_area_w / 10) + "x" + (tmp_area_h / 10) + " = " + tmp_squares_selected + " squares";
    tmp_info_msg = tmp_squares_selected_w + "x" + tmp_squares_selected_h + " = " + tmp_squares_selected + " squares";
    $(".selected-squares-info").text(tmp_info_msg);

    // set the number of selected squares
    $(".area-text").empty();
    $(".area-text").text( tmp_squares_selected + " squares" );

    // show width and hight
    $(".area-size-text").empty();
    $(".area-size-text").text( tmp_area_w + "x" + tmp_area_h );
    // ----------------------------------------------------------------------- //

    // store current size
    tmp_area_w = w;
    tmp_area_h = h;    

    // store coordinates of the upper left corner of the selected area
    current_x = tmp_info_x;
    current_y = tmp_info_y;
}

// update price and the position of the tooltip
function priceTooltipUpdate()
{
    // get location of the box-pointers
    /*
    var ax1 = $( "#square_box_a" ).position().left, ay1 = $( "#square_box_a" ).position().top;
    var bx1 = $( "#square_box_b" ).position().left, by1 = $( "#square_box_b" ).position().top;
    */

    // parseInt(box_a.left.replace('px', ''), 10)
    var ax1 = parseInt(box_a.style.left.replace('px', ''), 10);
    var ay1 = parseInt(box_a.style.top.replace('px', ''), 10);
    var bx1 = parseInt(box_b.style.left.replace('px', ''), 10);
    var by1 = parseInt(box_b.style.top.replace('px', ''), 10);

    // sometimes we can get coordinates in a floating and digits after decimal extremely small, so
    // point form and we have to remove all decimal numbers
    /*
    ax1 = Math.trunc(ax1);
    ay1 = Math.trunc(ay1);
    bx1 = Math.trunc(bx1);
    by1 = Math.trunc(by1);
    */

    // calculate price by multiplying width and height
    var w = 0, h = 0;
    w = bx1 - ax1 + 10;
    h = by1 - ay1 + 10;

    // calculate the location for tooltip
    var tooltip_x = 0, tooltip_y = 0;

    if (bx1 < ax1 && by1 < ay1)
    {
        // location of price-tooltip
        tooltip_x = bx1;
        tooltip_y = by1;

        w = ax1 - bx1 + 10;
        h = ay1 - by1 + 10;
    }
    else if (bx1 < ax1)
    {
        // location of price-tooltip
        tooltip_x = bx1;
        tooltip_y = ay1;

        w = ax1 - bx1 + 10;
    }
    else if (by1 < ay1)
    {
        // location of price-tooltip
        tooltip_x = ax1;
        tooltip_y = by1;

        h = ay1 - by1 + 10;
    }
    else
    {
        // location of price-tooltip
        tooltip_x = ax1;
        tooltip_y = ay1;
    }

    // we have to make sure that the price-tooltip and it's buttons are not going over the screen
    temp_w = $( "#price_tooltip" ).width() + $( "#buy_cancel_buttons" ).width();
    if ( temp_w > w )
    {
        if ( tooltip_x >= (gridW - temp_w) )
        {
            // shift to the left tooltip
            tooltip_x = tooltip_x - temp_w;
        }
    }

    // set y-coordinate so tooltip will be upper from box pointer
    tooltip_y = tooltip_y - tooltip_offset;

    // original 100% price
    boxTooltipPrice = w * h;

    // 10% from original price
    // boxTooltipPrice = (w * h) - ( (w * h) * price_ratio );
    // boxTooltipPrice = (w * h) * price_ratio;
    boxTooltipPrice = Number(((w * h) * price_ratio).toFixed(0));
    final_cost = boxTooltipPrice;

    // create digits with the comma after thousand
    boxTooltipText = "$" + boxTooltipPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " ";

    // clear old information in price-tooltip
    $(".price-tooltip").empty();

    // show new price
    $(".price-tooltip").append(boxTooltipText);

    // location of the price-tooltip
    boxTooltipSpan.style.left = (tooltip_x) + 'px';
    boxTooltipSpan.style.top = (tooltip_y) + 'px';

    // location of the buy-cancel buttons
    // tmp = $( "#price_tooltip" ).position().left + $( "#price_tooltip" ).width();
    tmp = parseInt(boxTooltipSpan.style.left.replace('px', ''), 10) + $( "#price_tooltip" ).width();

    boxTooltipSpanButtons.style.left = ( tmp + 12 ) + 'px';
    boxTooltipSpanButtons.style.top = (tooltip_y) + 'px';
}

// this function handle events when we click box pointer
function eventBoxPointer()
{
    // get color of the initial box-pointer
    color = $( "#square_box_a" ).css( "background-color" );
    
    if (isClicked && !isSelecting)
    {
        // if clicked change color
        $( "#square_box_a" ).css("background", red);
        $( "#square_box_a" ).css("border-color", border_color);

        // reset selection so user can selected different area
        resetSelection();

        // reset box size
        resetBoxSize();

        // reset tooltip price
        resetPriceTooltip();

        resetSelectedArea();

        // show tooltip with the price or hide it
        displayPriceTooltip();
    }
    else 
    {
        // if not clicked change color
        if (color == red)
        {
            $( "#square_box_a" ).css("background", new_color);
            $( "#square_box_a" ).css("border-color", new_border_color);

            // indicate that the user start selecting an area
            isClicked = true;
            isSelecting = true;

            // show tooltip with the price or hide it
            displayPriceTooltip();
        }
        else
        {
            // reset color schema of the initial box-pointer
            $( "#square_box_a" ).css("background", red);
            $( "#square_box_a" ).css("border-color", border_color);
            
            // reset selection so user can selected different area
            resetSelection();

            // reset box size
            resetBoxSize();

            // reset tooltip price
            resetPriceTooltip();

            resetSelectedArea();

            // show tooltip with the price or hide it
            displayPriceTooltip();
        }
    }
}

// this function used to confirm selected area and to reset some parameters
function confirmSelectedArea()
{
    isConfirmed = true;

    // get lef-top x-coordinates and y-coordinates
    final_top_x = current_x;
    final_top_y = current_y;

    // get final size of the selected area
    final_w = tmp_area_w;
    final_h = tmp_area_h;

    final_squares_selected = tmp_squares_selected;
}

// the point is to print in the upper right corner of the page the coordinates where
// video file or gif file will be placed
function showCoordinates(x, y)
{
    // show all info about area selection
    $(".coordinates").empty();
    tmp_html = '<span>' + Math.trunc(x) + 'x, ' + Math.trunc(y) + 'y</span><br><span>W: ' + tmp_area_w + 'px - H: ' + tmp_area_h + 'px</span>';
    $(".coordinates").append(tmp_html);

    // show the number of selected squares
    $(".area-text").empty();
    $(".area-text").text( tmp_squares_selected + " squares" );

    // show width and hight
    $(".area-size-text").empty();
    $(".area-size-text").text( tmp_area_w + "x" + tmp_area_h );
}

// reset
function resetSelection()
{
    isClicked = false;
    isSelecting = false;
    isConfirmed = false;

    final_top_x = 0;
    final_top_y = 0;
    final_w = 0;
    final_h = 0;
    tmp_area_w = 0;
    tmp_area_h = 0;
}

// set square selection to its default size
function resetBoxSize() 
{
    // reset box size
    $("#square_box_a").css('width', 10);
    $("#square_box_a").css('height', 10);

    box_width = 10;
    box_height = 10;
}

// reset price
function resetPriceTooltip() 
{
    // reset price
    boxTooltipPrice = per_square;

    // reset tooltip text
    boxTooltipText = "$" + boxTooltipPrice + " ";
}

// reset selected area and the second box-pointer
function resetSelectedArea() 
{
    $( "#square_box_b" ).css("background", red);
    $( "#square_box_b" ).css("border-color", border_color);
    $(".square-box-b").css('display', 'none');
    $(".selected-squares").css('display', 'none');
    $(".area-text").text( "0 squares" );
    $(".area-size-text").text( tmp_area_w + "x" + tmp_area_h );
}

// reset all parameters
function resetAll()
{
    isClicked = false;
    isSelecting = false;
    isConfirmed = false;

    final_top_x = 0;
    final_top_y = 0;
    final_w = 0;
    final_h = 0;
    tmp_area_w = 0;
    tmp_area_h = 0;

    tmp_squares_selected = 0;
    final_squares_selected = 0;

    // reset box size
    $("#square_box_a").css('width', 10);
    $("#square_box_a").css('height', 10);

    box_width = 10;
    box_height = 10;

    // reset price
    boxTooltipPrice = per_square;
    final_cost = boxTooltipPrice;

    // reset tooltip text
    boxTooltipText = "$" + boxTooltipPrice + " ";

    $( "#square_box_a" ).css("background", red);
    $( "#square_box_a" ).css("border-color", border_color);
    $( "#square_box_b" ).css("background", red);
    $( "#square_box_b" ).css("border-color", border_color);
    $(".square-box-b").css('display', 'none');
    $(".selected-squares").css('display', 'none');
    $(".price-tooltip").css('display', 'none');
    $(".buy-cancel-buttons").css('display', 'none');
    $(".selected-squares-info").css('display', 'none');
    $(".price-tooltip").empty();
    $(".buy-cancel-buttons").empty();
    $(".coordinates").empty();
    $(".coordinates").append('<span>0x, 0y</span><br><span>W: 0px - H: 0px</span>');
    $(".selected-squares-info").text("0x, 0y" + " : W: " + 10 + "px - H: " + 10 + "px : " + 1 + " squares");
    $(".area-text").text( "0 squares" );
    $(".area-size-text").text( "0x0" );

    $( "#square_box_a" ).attr('name', active_stage);
    $( "#square_box_b" ).attr('name', inactive_stage);

    // empty form's fields
    $( "#form_i_fname" ).val("");
    $( "#form_i_ad_name" ).val("");
    $( "#form_i_email" ).val("");
    $( "#form_i_link" ).val("");

}

/*
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
    // console.log("relativeX: " + relativeX + ", relativeY: " + relativeY + "\n");
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
*/

// run this if html document completely loaded
$(document).ready(function () 
{
    // working with mouse hover a video fragment, hide grid selection
    $(".video-fragment").hover( function () 
    { 
        if ($(".purchase-window").is(":hidden"))
        {
            // we have to reset all parameters and elements
            // resetAll();
        }


        // hide success message window
        // hideSuccessMessage();
    });

    // area selection version 1
    // ---------------------------------------------------------------------- //
    // on mouse move show tooltip and box pointer
    $(document).mousemove( function( event )
    {
        // this function get called from preview_tooltip.js
        // get coordinates
        // getCoordinates(event);

        // working with box pointer movements
        if (!isClicked)
        {
            // single box-pointer
            boxPointer();
        }

        // if first square selected draw a set of square according to mouse movements
        if (isClicked)
        {
            if (!isConfirmed)
            {
                // working directly with the squares selection
                squareSelection();
            }
        }
    });
    // ---------------------------------------------------------------------- //

    // Working with the grid selection
    // ---------------------------------------------------------------------------- //
    $('body').click(function( event ) 
    {
        // capturing mouse click anywhere in the HTML document
        // if it is box, change its color.
        // If it is different element remove selection

        // figuring out if any form element was clicked excluding form buttons
        // if it is not a form button do not reset selection
        isFormClicked = true;
        if( !$(event.target).is('#purchase_window') && 
            !$(event.target).is('#form_name') &&
            !$(event.target).is('#form') &&
            !$(event.target).is('#form_i_fname') &&
            !$(event.target).is('#form_i_ad_name') &&
            !$(event.target).is('#form_i_email') &&
            !$(event.target).is('#form_i_link') &&
            !$(event.target).is('.form-group') &&
            !$(event.target).is('.form-info') && 
            !$(event.target).is('.form-info-1') &&
            !$(event.target).is('.form-info-2') &&
            !$(event.target).is('.form-info-3') &&
            !$(event.target).is('.form-info-4') &&  
            !$(event.target).is('.media-file-label') &&
            !$(event.target).is('.file-brows-btn') &&
            !$(event.target).is('.browse-files') &&
            !$(event.target).is('.form-info-price') &&
            !$(event.target).is('.form-info-size') &&
            !$(event.target).is('.form-info-message') &&
            !$(event.target).is('.form-info-5')
          )
        { 
            isFormClicked = false; 
        }

        // if we did not click form excluding buttons we can see area selection
        if( !isFormClicked )
        {
            if($(event.target).is('#square_box_a'))
            {
                // if success-window is displayed and user clicked a box-pointer reload page
                // to be able see changes
                if (!$(".success-window").is(":hidden"))
                {
                    // hide success message window
                    hideSuccessMessage();

                    // we have to reset all parameters and elements
                    resetAll();
        
                    // reload current page in order to see changes
                    // ajax is not very useful in this current project because of 'delegate events'
                    window.location.reload();
                }

                // confirm selected are
                if (isClicked && isSelecting)
                {
                    // change the color of the initial box-pointer that will indicate it is cannot be moved
                    $( "#square_box_a" ).css("background", confirm_selection_color);
                    $( "#square_box_a" ).css("border-color", confirm_selection_border_color);
                }
                else
                {
                    // init some parameters after used clicked the box-pointer
                    // ------------------------------------------------------------------------- //
                    // minimum one square is selected after user did click a box-pointer
                    tmp_squares_selected = 1;
                    tmp_squares_selected_w = 1;
                    tmp_squares_selected_h = 1;
    
                    // minimum 10x10 area is selected after user did click a box-pointer
                    tmp_area_w = 10;
                    tmp_area_h = 10;
    
                    // after used did click box-a make it inactive and make box-b active
                    $( "#square_box_a" ).attr('name', inactive_stage);
                    $( "#square_box_b" ).attr('name', active_stage);
    
                    // set coordinates for the box-b after box-a will be inactive
                    box_b.style.left = box_a.style.left;
                    box_b.style.top = box_a.style.top;
                    // ------------------------------------------------------------------------- //
    
                    // handle area selection, it can be cancel selection or start selection
                    eventBoxPointer();
                }
            }
            else if($(event.target).is('#square_box_b'))
            {
                // change color of the second box-pointer and indicate that the selection locked
                $( "#square_box_b" ).css("background", new_color);
                $( "#square_box_b" ).css("border-color", new_border_color);
    
                // after used did click box-b make it inactive
                $( "#square_box_b" ).attr('name', inactive_stage);
    
                // used to confirm selected area and to reset some values
                confirmSelectedArea();
            } 
            else if($(event.target).is('#buy_button'))
            {
                /*
                console.log("Finalize");
                console.log("location: " + final_top_x + "x, " + final_top_y + "y");
                console.log("size: " + final_w + "w, " + final_h + "h"); 
                console.log("squares selected: " + final_squares_selected);
                console.log("total cost: " + final_cost);
                console.log("-------------------------");
                */

                // call external function
                userForm();
    
                // redirect to the buy page and pass all necessary parameters
    
                // we have to reset all parameters and elements
                // resetAll();
    
                // after clicking the grid box-a will show up there
                // boxPointer();
            }
            else if($(event.target).is('#cancel_button'))
            {
                // cancel and reset
                // console.log("Cancel purchase.");
    
                // hide purchase form
                hideForm(event);
    
                // we have to reset all parameters and elements
                resetAll();
    
                // after clicking the grid box-a will show up there
                boxPointer();
            }
            else if ($(event.target).is('#form_success_button'))
            {
                // cancel and reset
                // console.log("User confirmed.");

                // hide success message window
                hideSuccessMessage();

                // we have to reset all parameters and elements
                resetAll();
    
                // after clicking the grid box-a will show up there
                boxPointer();
            }
            else
            {
                // we have to reset all parameters and elements
                resetAll();
    
                // after clicking the grid box-a will show up there
                boxPointer();
            }
        }


        // if a square is selected and we did click the grid it will remove square selection 
        if($(event.target).is('#background_grid'))
        {
            // we have to reset all parameters and elements
            resetAll();

            // after clicking the grid box-a will show up there
            boxPointer();

            // if success-window is displayed and user clicked a greed-background reload page
            // to be able see changes
            if (!$(".success-window").is(":hidden"))
            {
                // hide success message window
                hideSuccessMessage();

                // we have to reset all parameters and elements
                resetAll();
        
                // reload current page in order to see changes
                // ajax is not very useful in this current project because of 'delegate events'
                window.location.reload();
            }
        }
    });
});