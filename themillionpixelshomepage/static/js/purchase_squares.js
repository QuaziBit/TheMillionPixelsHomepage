/* Author: Alexandr Matveyev */

var form_width = 300, form_height = 200;
var purchase_window = document.getElementById('purchase_window');
var location_x = 0, location_y = 0, final_width = 0, final_height = 0, squares = 0, price = 0, fname = "", adName = "", email = "", ad_link = "";

var _URL = window.URL || window.webkitURL;
var ad_file = undefined;
var img_w = 0, img_h = 0;
var canSubmit = false;

var bad_input_color = "rgb(213, 27, 27)";
var good_input_color = "rgb(105, 221, 105)";
var no_input_color = "";

var good_form_info_color = "#22ab4d";
var bad_form_info_color = "#d52424";

var success_message_window = document.getElementById('success_window');
var success_message_x = 0, success_message_y = 0;
var info_msg = "";

// get area selection values
function getValues()
{
    // get necessary information to buy selected area
    location_x = final_top_x;
    location_y = final_top_y;
    final_width = final_w;
    final_height = final_h;
    squares = final_squares_selected;
    price = final_cost;
}

// this function will display or hide form
function displayPurchaseWindow()
{
    // display purchase window
    if ($(".purchase-window").is(":hidden"))
    {
        setFormPosition();
        updateFormInfo();

        $(".purchase-window").css('display', 'inline-block');
        $(".inactive-layer").css('display', 'block');
        $("#form_submit").prop("disabled", true);
        
        $( ".form-i-fname" ).css("border-color", no_input_color);
        $( ".form-i-ad-name" ).css("border-color", no_input_color);
        $( ".form-i-email" ).css("border-color", no_input_color);
        $( ".form-i-link" ).css("border-color", no_input_color);

        resetUserInput();
    }
    else
    {
        $(".purchase-window").css('display', 'none');
        $(".inactive-layer").css('display', 'none');

        $(".inactive-layer-loading").css('display', 'block');

        // reset location
        purchase_window.style.left = 0 + 'px';
        purchase_window.style.top = 0 + 'px';
        form_height = 0;
        canSubmit = false;

        // we have to reset all parameters and elements
        // resetAll(); // call external function

        // after clicking the grid box-a will show up there
        // boxPointer(); // call external function
    }
}

function setFormPosition()
{
    form_height = Math.trunc( parseInt( ($(".purchase-window").height()).toFixed() * 1) );

    // display a purchase window in the middle of the screen
    form_left = (gridW / 2) - (form_width / 2);
    form_top = (gridH / 2) - (form_height / 2);

    purchase_window.style.left = form_left + 'px';
    purchase_window.style.top = form_top + 'px';

    success_message_x = form_left;
    success_message_y = (form_height / 2) + 70;
}

function updateFormInfo()
{
    $(".form-info-1").empty();
    $(".form-info-2").empty();
    $(".form-info-2-1").empty();
    $(".form-info-3").empty();
    $(".form-info-4").empty();
    $( ".form-info-message" ).css('display', 'none');
    $( ".form-info-5" ).empty();

    $(".form-info-1").text( "$" + price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ".00 - Total Price");
    $(".form-info-2").text( final_width + "px * " + final_height + "px - Ad-Media Size" );

    s_alloc = Math.trunc( parseInt( squares * space_per_square * 1000 ));
    s_alloc_2 = s_alloc.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    alloc_msg = (s_alloc_2) + " kilobytes - allocated space";
    if (s_alloc > 1000)
    {
        s_alloc_2 = s_alloc / 1024;
        alloc_msg = (s_alloc_2) + " megabytes - allocated space";
    }
    $(".form-info-2-1").text( alloc_msg );

    $(".form-info-3").text( " squares: " + squares );
    $(".form-info-4").text( " location: " + location_x + "x, " + location_y + "y" );
}

function patternMatch(value, type)
{
    result = false;

    fnamePattern = /^([A-Za-z,0-9, ]+)+$/i;
    adNamePattern = /^([A-Za-z,0-9, ,-]+)+$/i;
    // emailPattern = /^[a-z0-9]+(?:[\.-]?[a-z0-9]+)*(?:[\._]?[a-z0-9]+)*@[a-z0-9]+([-]?[a-z0-9]+)*[\.-]?[a-z0-9]+([-]?[a-z0-9]+)*([\.-]?[a-z]{2,})*(\.[a-z]{2,5})+$/i;
    emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/i;
    ad_linkPattern = /^([a-z][a-z0-9\*\-\.]*):\/\/(?:(?:(?:[\w\.\-\+!$&'\(\)*\+,;=]|%[0-9a-f]{2})+:)*(?:[\w\.\-\+%!$&'\(\)*\+,;=]|%[0-9a-f]{2})+@)?(?:(?:[a-z0-9\-\.]|%[0-9a-f]{2})+|(?:\[(?:[0-9a-f]{0,4}:)*(?:[0-9a-f]{0,4})\]))(?::[0-9]+)?(?:[\/|\?](?:[\w#!:\.\?\+=&@!$'~*,;\/\(\)\[\]\-]|%[0-9a-f]{2})*)?$/i;

    if (type === "fname")
    {
        if (value.match(fnamePattern))
        {
            return true;
        }
    }

    if (type === "adName")
    {
        if (value.match(adNamePattern))
        {
            return true;
        }
    }

    if (type === "email")
    {
        if (value.match(emailPattern))
        {
            return true;
        }
    }

    if (type === "ad_link")
    {
        if (value.match(ad_linkPattern))
        {
            return true;
        }
    }

    return result;
}

// get user input
function getFormInput()
{
    fname = $( "#form_i_fname" ).val();
    adName = $( "#form_i_ad_name" ).val();
    email = $( "#form_i_email" ).val();
    ad_link = $( "#form_i_link" ).val();

    // get a file
    ad_file = $( "#ad_file" ).prop('files')[0];
}

function verifyUserInput()
{
    var isFname = false, isAdName = false, isEmail = false, isAdLink = false, isAdFile = false;

    if (fname.length == 0)
    {
        $( ".form-i-fname" ).css("border-color", bad_input_color);
        isFname = false;
    }
    else
    {
        $( ".form-i-fname" ).css("border-color", good_input_color);
        isFname = true;
    }

    if (adName.length == 0)
    {
        $( ".form-i-ad-name" ).css("border-color", bad_input_color);
        isAdName = false;
    }
    else
    {
        $( ".form-i-ad-name" ).css("border-color", good_input_color);
        isAdName = true;
    }

    if (email.length == 0)
    {
        $( ".form-i-email" ).css("border-color", bad_input_color);
        isEmail = false;
    }
    else
    {
        $( ".form-i-email" ).css("border-color", good_input_color);
        isEmail = true;
    }

    if (ad_link.length == 0)
    {
        $( ".form-i-link" ).css("border-color", bad_input_color);
        isAdLink = false;
    }
    else
    {
        $( ".form-i-link" ).css("border-color", good_input_color);
        isAdLink = true;
    }

    if (ad_file === undefined)
    {
        isAdFile = false;
    }
    else
    {
        isAdFile = true;
    }

    if (isFname && isAdName && isEmail && isAdLink && isAdFile)
    {
        canSubmit = true;
    }
    else 
    {
        canSubmit = false;
    }
}

function resetUserInput()
{
    // reset user input
    $( "#form_i_fname" ).val("");
    $( "#form_i_ad_name" ).val("");
    $( "#form_i_email" ).val("");
    $( "#form_i_link" ).val("");
    $( "#ad_file" ).val("");
    ad_file = undefined;
}

// hide the form and reset all parameters
function hideForm(event)
{
    // if user did click specific elements we have to reset everything and hide form,
    // but if user did click anywhere in the form the form will stay visible
    canHideForm = false;
    if ( $(event.target).is('#form_cancel') ||
         $(event.target).is('#cancel_button') ||
         $(event.target).is('#background_grid') || 
         $(event.target).is('.video-fragment') ||
         $(event.target).is('.square-box-a') ||
         $(event.target).is('#price_tooltip') ||
         $(event.target).is('#selected_squares') ||
         $(event.target).is('#selected_squares_info')
     )
    {
        canHideForm = true;
    }

    if ( canHideForm )
    {
        if ( !$(".purchase-window").is(":hidden") )
        {
            $(".purchase-window").css('display', 'none');
            $(".inactive-layer").css('display', 'none');

            // we have to reset all parameters and elements
            resetAll(); // call external function

            // after clicking the grid box-a will show up there
            boxPointer(); // call external function
        }
    }
}

// entry point to display the form to a user and to get information about selected area
function userForm()
{
    // get information about selected area
    getValues();

    // show to a user form
    displayPurchaseWindow();
}

function verifyUserInputDynamic()
{
    getFormInput();

    if ($(".form-i-fname").val().length == 0)
    {
        $( ".form-i-fname" ).css("border-color", bad_input_color);
    }
    else
    {
        if (patternMatch(fname, "fname"))
        {
            $( ".form-i-fname" ).css("border-color", good_input_color);
        }
        else
        {
            $( ".form-i-fname" ).css("border-color", bad_input_color);
        }
    }

    if ($(".form-i-ad-name").val().length == 0)
    {
        $( ".form-i-ad-name" ).css("border-color", bad_input_color);
    }
    else
    {
        if (patternMatch(adName, "adName"))
        {
            $( ".form-i-ad-name" ).css("border-color", good_input_color);
        }
        else
        {
            $( ".form-i-ad-name" ).css("border-color", bad_input_color);
        }
    }

    if ($(".form-i-email").val().length == 0)
    {
        $( ".form-i-email" ).css("border-color", bad_input_color);
    }
    else
    {
        if (patternMatch(email, "email"))
        {
            $( ".form-i-email" ).css("border-color", good_input_color);
        }
        else
        {
            $( ".form-i-email" ).css("border-color", bad_input_color);
        }
        
    }

    if ($(".form-i-link").val().length == 0)
    {
        $( ".form-i-link" ).css("border-color", bad_input_color);
    }
    else
    {
        tmp_url = $( "#form_i_link" ).val();
        url_h = ["http://www.", "https://www."];
        var len = url_h.length;
        var isValidURL = false;
        for (var i = 0; i < len; i++) 
        {
            if (tmp_url.includes(url_h[i]))
            {
                isValidURL = true;
            }
        }

        if (isValidURL == true)
        {
            $( ".form-i-link" ).css("border-color", good_input_color);

            if (patternMatch(ad_link, "ad_link"))
            {
                $( ".form-i-link" ).css("border-color", good_input_color);
            }
            else
            {
                $( ".form-i-link" ).css("border-color", bad_input_color);
            }

        }
        else
        {
            $( ".form-i-link" ).css("border-color", bad_input_color);
        }
    }
}

// create json structure and send it to the server using ajax 
function finalize()
{
    /*
    console.log("Finalize Purchase Squares");
    console.log("location: " + location_x + "x, " + location_y + "y");
    console.log("size: " + final_width + "w, " + final_height + "h"); 
    console.log("squares selected: " + squares);
    console.log("total cost: " + price);
    console.log("Full Name: " + fname);
    console.log("Ad Name: " + adName);
    console.log("email: " + email);
    console.log("ad-link: " + ad_link);
    console.log(ad_file);
    console.log("-------------------------");
    */

    info_msg = "<span>Ad placement will cost $" +
               price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + 
               " dollars and the image size is "+final_width+" by " +final_height+" pixels.</span>";

    // use ajax
    callAjax();

    /*
    callAjax(function(output)
    {
        // here you use the output
        console.log(output);
        s_available = output.available_squares;
        // updateStats(output.available_squares);
    });
    // Note: the call won't wait for the result,
    // so it will continue with the code here while waiting.
    */

    // success message
    // successMessage();
}

function callAjax(handleData)
{
    // The FormData interface provides a way to easily construct 
    // a set of key/value pairs representing form fields and their values, 
    // which can then be easily sent using the XMLHttpRequest
    // ajax have to use processData: false, contentType: false,
    var formData  = new FormData();    
    formData.append( 'coordinates_x', location_x );
    formData.append( 'coordinates_y', location_y );
    formData.append( 'image_width', final_width );
    formData.append( 'image_height', final_height );
    formData.append( 'num_of_squares', squares );
    formData.append( 'cost', price );
    formData.append( 'full_name', fname );
    formData.append( 'ad_name', adName );
    formData.append( 'ad_email', email );
    formData.append( 'ad_hyperlink', ad_link );
    formData.append( 'ad_media_file', ad_file );
    formData.append( 's_available', s_available );

    $.ajaxSetup({
        beforeSend: function(xhr, settings) 
        {
            if (!/^(GET|HEAD|OPTIONS|TRACE)$/i.test(settings.type)) 
            {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });

    /* send text-data */
    return $.ajax({
        url: '/upload',
        type: 'POST',
        dataType: 'json',
        contentType: false,
        cache: false,
        async: true,
        processData: false,
        data: formData,  
        success: function(result)
        {
            // console.log("user-data uploaded");
            // console.log(result);
            // console.log("------------------");   

            // success message
            var isSuccess = true;
            successMessage(isSuccess, result, squares, space_per_square);
        },
        error: function(XMLHttpRequest, status, error)
        {
            // console.log("user-data cannot be uploaded");
            // console.log(error);
            // console.log("------------------");
            // console.log(XMLHttpRequest);
            // console.log("------------------");

            // success message
            var isSuccess = false;
            successMessage(isSuccess, JSON.parse(XMLHttpRequest.responseText), squares, space_per_square);
        }
    });
}

function successMessage(isSuccess, result, sqs, pps)
{
    // loading indicator
    $(".inactive-layer-loading").css('display', 'none');

    // space in megabytes per square
    space_allocated = sqs * pps;

    if (isSuccess)
    {
        // display initial box-pointer
        if ($(".success-window").is(":hidden"))
        {
            $(".success-window").css('display', 'inline-block');
            $(".inactive-layer-2").css('display', 'block');

            $(".form-success-name").empty();
            $(".form-success-name").text("Success!");
            $( "#form_success_name" ).css("background-color", "rgb(30, 205, 120)");

            $(".form-success-text").empty();
            tmp_html = "Dear customer you will receive several emails shortly to perform payments in order for your ad to be placed on this website.<br /><br />" +
            "First email should be from: <u>themillionpixelshomepage@gmail.com</u><br /><br />" +
            "Second email should be from a <u>different</u> email and <u>themillionpixelshomepage@gmail.com</u> will be CC email.<br /><br />" +
            "<u>Payments accepted only via PayPal.</u>";
            $(".form-success-text").html(tmp_html);

            $(".form-success-info").empty();
            $(".form-success-info").html(info_msg);

            success_message_window.style.left = success_message_x + 'px';
            success_message_window.style.top = success_message_y + 'px';
        }
    }
    else
    {
        c_id = result.category_id;
        console.log("category_id: " + c_id + "\n");

        if (c_id == "1")
        {
            tmp_msg = "<span>Your ad cannot be placed because the area you selected is overlapping with someone's else ad. Please try to select a different area for your ad.</span><br /><br />Please refresh this webpage to see reserved ads’ slots</span>";
        }
        else if (c_id == "2")
        {
            tmp_msg = "<span>Your input has invalid characters.</span><br /><br />Please try again or contact me via email.</span>";
        }
        else if (c_id == "3")
        {
            tmp_msg = "<span>File size is to large.<br /><br />" + 
                      "File size should not be greater than<br /><u>" + space_allocated + " megabytes</u>.</span>";
        }
        else if (c_id == "4")
        {
            tmp_msg = "<span>Selected area is to large.<br /><br />" + 
                      "Selected area for a free Ad can have maximum size<br />" + (adMaxW / 10) + "x" + (adMaxH / 10) + " squares or" + adMaxW + "x" + adMaxH + " pixels.</span>";
        }

        if ($(".success-window").is(":hidden"))
        {
            $(".success-window").css('display', 'inline-block');
            $(".inactive-layer-2").css('display', 'block');

            $(".form-success-name").empty();
            $(".form-success-name").text("Failure!");
            $( "#form_success_name" ).css("background-color", "rgb(205, 30, 30)");

            $(".form-success-text").empty();
            tmp_html = "Advertisement cannot be placed.";
            $(".form-success-text").html(tmp_html);

            $(".form-success-info").empty();
            info_msg = tmp_msg;
            $(".form-success-info").html(info_msg);

            success_message_window.style.left = success_message_x + 'px';
            success_message_window.style.top = success_message_y + 'px';
        }
    }
}

function hideSuccessMessage()
{
    $(".success-window").css('display', 'none');
    $(".inactive-layer-2").css('display', 'none');
}

// eny time when user start typing it will validate input
$(document).on('keypress', function(e) 
{
    verifyUserInputDynamic();

    // verifyUserInput();
});

$(document).ready(function () 
{
    $('body').click(function( event ) 
    {
        // validate input
        if($(event.target).is('#form_i_fname'))
        {
            verifyUserInputDynamic();
        }

        // validate input
        if($(event.target).is('#form_i_ad_name'))
        {
            verifyUserInputDynamic();
        }

        // validate input
        if($(event.target).is('#form_i_email'))
        {
            verifyUserInputDynamic();
        }

        // validate input
        if($(event.target).is('#form_i_link'))
        {
            verifyUserInputDynamic();
        }

        if($(event.target).is('#form_submit'))
        {
            verifyUserInputDynamic();

            // the form should be displayed already
            // get full name and email information
            getFormInput();

            // verify user input
            verifyUserInput();

            if (canSubmit)
            {
                // create json structure and send it to the server using ajax
                finalize();

                // hide form and reset parameters after submitting information to the server
                displayPurchaseWindow();

                // reset inputs
                resetUserInput();

                canSubmit = false;
            }
        }
        else
        {
            // hide form if user did click something specific, but not the submit button
            hideForm(event);
        }

        // reload current page in order to see changes
        // ajax is not very useful in this current project because of 'delegate events'
        if($(event.target).is('#form_success_button'))
        {
            window.location.reload();
        }
    });

    // validating the width and height of the uploading image
    $("#ad_file").change(function (e) 
    {
        var file, img;
        if ((file = this.files[0])) 
        {
            img = new Image();
            var w = 0, h = 0;
            var file_size = ((file.size / 1024) / 1024); // result in megabytes

            var space_allocated = squares * space_per_square;
            
            /*
            console.log("space-allocated: " + space_allocated + " megabytes");
            console.log("file size: " + (file.size) + " Bytes");
            console.log("file size: " + (file.size / 1000) + " Kilobytes");
            console.log("file size: " + (file_size) + " Megabytes");
            */

            // let each square be a megabyte size
            // if uploaded file has more megabytes then square were selected for it show error
            if (file_size > space_allocated)
            {
                // console.log("File is too large --> file size: " + file_size + " megabyte");

                $( ".form-info-message" ).css('display', 'block');
                $( ".form-info-5" ).empty();
                msg = "The file size that you want to upload is <u>" + (Number((file_size).toFixed(3)) * 1000) + " kilobytes</u>, it is to large!\nYour file can by up to <br /><u>" + (space_allocated * 1000) + " kilobytes</u>.";
                $( ".form-info-5" ).html(msg);
                $( ".form-info-message" ).css("background-color", bad_form_info_color);
            }
            else if (file_size <= squares)
            {
                // console.log("File size is ok --> file size: " + file_size + " megabyte.");

                img.src = _URL.createObjectURL(file);
                img.onload = function () 
                {
                    w = this.naturalWidth;
                    h = this.naturalHeight;
    
                    if (w == final_width && h == final_height)
                    {
                        //alert("Image can be uploaded: " + w + "x" + h);
    
                        if (!$(".form-info-message").is(":hidden"))
                        {
                            $( ".form-info-5" ).empty();
                            msg = "Image dimension does mach selected area!";
                            $( ".form-info-5" ).html(msg);
                            $( ".form-info-message" ).css("background-color", good_form_info_color);
                        }
    
                        $("#form_submit").prop("disabled", false);
                        setFormPosition();
                    }
                    else if (w > gridW || h > gridH)
                    {
                        //alert("Image is too large!");
    
                        msg = "Image dimension is too large!";
    
                        $( ".form-info-5" ).empty();
                        $( ".form-info-message" ).css('display', 'block');
                        $( ".form-info-5" ).html(msg);
                        $( ".form-info-message" ).css("background-color", bad_form_info_color);
    
                        $("#form_submit").prop("disabled", true);
                    }
                    else if ( squares > adMaxSquare)
                    {
                        msg = "Free Ad can be only "  + (adMaxW / 10) + "x" + (adMaxH / 10) +  " squares or "  + adMaxW + "x" + adMaxH + " pixels, or less!";
    
                        $( ".form-info-5" ).empty();
                        $( ".form-info-message" ).css('display', 'block');
                        $( ".form-info-5" ).html(msg);
                        $( ".form-info-message" ).css("background-color", bad_form_info_color);
    
                        $("#form_submit").prop("disabled", true);
                    }
                    else
                    {
                        //alert("Image width and height does not mach selected are: " + w + "x" + h);
    
                        msg = "Image dimension does not mach selected area! <br />" +
                                  "Image size is <u>" + w + "x" + h + "</u> pixels<br />" +
                                  "Selected area is <u>" + final_width + "x" + final_height + "</u> pixels<br /><br />" +
                                  "You can upload image, but it will be scaled disproportionately.";
    
                        $( ".form-info-5" ).empty();
                        $( ".form-info-message" ).css('display', 'block');
                        $( ".form-info-5" ).html(msg);
                        $( ".form-info-message" ).css("background-color", bad_form_info_color);
    
                        $("#form_submit").prop("disabled", false);
                        setFormPosition();
                    }
    
                    _URL.revokeObjectURL(img.src);
                };
            }
        }
    });
});