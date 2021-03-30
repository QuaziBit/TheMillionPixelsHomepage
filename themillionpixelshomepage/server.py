# Author: Alexand Matveyev
# pip installs:
# 1: pip install numpy==1.19.3
# 2: pip install opencv-python for cv2
# 3: pip install Flask-Mail for flask_mail
# 4: pip install Flask-WTF for CSRFProtect
# 5: pip install flask-mysqldb for MySQL
# 6: pip install Flask-HTTPAuth
# python 3.8.5 x64, virtual environment 3.8.5

# pythonanywhere.com production using 3.7

import os
import re
import base64
import random
from os import urandom
import json
import numpy as np
import cv2 as cv
import datetime
import threading
from flask_mysqldb import MySQL
from flask_mail import Mail, Message
from flask import Flask, request, url_for, redirect, render_template, flash, jsonify, make_response, g
from flask_wtf.csrf import CSRFProtect # working with the secure file uploads
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
from flask_httpauth import HTTPBasicAuth

lock = threading.Lock()

REAL_PRICE = 100
PRICE_RATIO = 0.07 # 0.8 = 80%
SPACE_PER_SQUARE = 0.032 # megabytes
TIME_LIMIT_PENDING = 1.0 # minutes
AD_MAX_W = 100
AD_MAX_H = 100
AD_MAX_SQUARES = ( (AD_MAX_W / 10) * (AD_MAX_H / 10) )
AD_MAX_W_ADMIN = 1320
AD_MAX_H_ADMIN = 1000
AD_MAX_SQUARES_ADMIN = ( (AD_MAX_W_ADMIN / 10) * (AD_MAX_H_ADMIN / 10) )
EXTRA_PATH_SERVER = '/home/QuaziBit/mysite/themillionpixelshomepage'
UPLOAD_FOLDER = 'static/user_content/uploads'
UPLOAD_FOLDER_TMP = 'static/user_content/tmp'
UPLOAD_FOLDER_IMG = 'static/user_content/uploads/img'
UPLOAD_FOLDER_GIF = 'static/user_content/uploads/gif'
UPLOAD_FOLDER_THUMBNAILS = 'static/user_content/uploads/thumbnails'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

app = Flask(__name__) # app name

PROJECT_ROOT = os.path.dirname(os.path.realpath(__file__))

# Basic Authentication
auth = HTTPBasicAuth()
APP_ADMIN = 'your_admin_name'
APP_PASS = generate_password_hash("your_admin_pass")
app.config['APP_ADMIN'] = APP_ADMIN
app.config['APP_PASS'] = APP_PASS

# MySQL Database
mysql = MySQL()
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'your_mysql_pass'
app.config['MYSQL_DB'] = 'your_myslq_db_name'
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_PORT'] = 3336
# app.config['MYSQL_CHARSET'] = 'utf-8'
mysql.init_app(app)

# APP Settings
app.config['DEBUG'] = True
app.config['REAL_PRICE'] = REAL_PRICE
app.config['PRICE_RATIO'] = PRICE_RATIO
app.config['SPACE_PER_SQUARE'] = SPACE_PER_SQUARE
app.config['TIME_LIMIT_PENDING'] = TIME_LIMIT_PENDING
app.config['AD_MAX_W'] = AD_MAX_W
app.config['AD_MAX_H'] = AD_MAX_H
app.config['AD_MAX_SQUARES'] = AD_MAX_SQUARES
app.config['AD_MAX_W_ADMIN'] = AD_MAX_W_ADMIN
app.config['AD_MAX_H_ADMIN'] = AD_MAX_H_ADMIN
app.config['AD_MAX_SQUARES_ADMIN'] = AD_MAX_SQUARES_ADMIN
app.config['EXTRA_PATH_SERVER'] = EXTRA_PATH_SERVER
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['UPLOAD_FOLDER_TMP'] = UPLOAD_FOLDER_TMP
app.config['UPLOAD_FOLDER_IMG'] = UPLOAD_FOLDER_IMG
app.config['UPLOAD_FOLDER_GIF'] = UPLOAD_FOLDER_GIF
app.config['UPLOAD_FOLDER_THUMBNAILS'] = UPLOAD_FOLDER_THUMBNAILS

# Mail
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 465
app.config['MAIL_USE_TLS'] = False
app.config['MAIL_USE_SSL'] = True
app.config['MAIL_DEBUG'] = False
app.config['MAIL_USERNAME'] = 'your_gmail_account_user_name'
app.config['MAIL_PASSWORD'] = 'your_gmail_account_2FA_password' # email-app 2FA password
app.config['MAIL_DEFAULT_SENDER'] = 'your_gmail_account_user_name'
app.config['MAIL_MAX_EMAILS'] = 5
app.config['MAIL_SURPRESS_SEND'] = False
app.config['MAIL_ASCII_ATTACHMENTS'] = False
mail = Mail(app)

# For user uploads
# app.secret_key = 'my_secret_key' # secret-key for file uploads
app.secret_key = urandom(16).hex()
csrf = CSRFProtect(app) # secured file uploads

# Basic Authentication
# -----------------------------------------
# @app.before_request
# def before_request():
#    g.user = auth.current_user()

@auth.verify_password
def verify_password(username, password):

    # send_email_admin_login(request)
    admin_log(request)

    if username == APP_ADMIN:
        if check_password_hash(APP_PASS, password):
            return username
    
# -----------------------------------------

# working with the routs and APIs
# -----------------------------------------
@app.route('/')
@auth.login_required
def index1():
    # generate html response
    # tmp_html = generate_fragment_sql()
    
    # write into fragments.html new content
    # write_fragmens('./templates/fragments.html', tmp_html)

    return render_template('index.html')

@app.route('/index.html')
@auth.login_required
def index2():
    # generate html response
    # tmp_html = generate_fragment_sql()
    
    # write into fragments.html new content
    # write_fragmens('./templates/fragments.html', tmp_html)
    
    return render_template('index.html')

# get all posts from database as a single html file
@app.route('/tmp.html')
@auth.login_required
def tmp():

    return render_template('tmp.html')

@app.route('/update', methods=['GET'])
@auth.login_required
def update():
    # generate html response
    tmp_html = generate_fragment_sql()
    
    # write into fragments.html new content
    # write_fragmens(f"{EXTRA_PATH_SERVER}/templates/fragments.html", tmp_html) --> server
    write_fragmens('./templates/fragments.html', tmp_html)

    # get number of available squares
    s_available = -1
    try:
        s_available = get_available_squares_sql()
    except:
        print("\n\t[1] An exception occurred: cannot get data from sql database")

    if s_available == -1:
        resp = {'feedback': "server error", 'category': "failure", 'available_squares': s_available}
        return make_response(jsonify(resp), 200)

    # simple feedback
    resp = {'feedback': "fragments page updated", 'category': "success", 'available_squares': s_available}
    return make_response(jsonify(resp), 200)

@app.route('/buysquares.html')
@auth.login_required
def buysquares():
    return render_template('buysquares.html')

@app.route('/about.html')
@auth.login_required
def about():
    return render_template('about.html')

@app.route('/contact.html')
@auth.login_required
def contact():
    return render_template('contact.html')

@app.route('/index_admin.html')
@auth.login_required
def index_admin():
    # generate html response
    # tmp_html = generate_fragment_sql()
    
    # write into fragments.html new content
    # write_fragmens('./templates/fragments.html', tmp_html)
    
    return render_template('index_admin.html')

# API: getting the user-data - not Admin
# get user-data
@csrf.exempt
@app.route('/upload', methods=['GET', 'POST'])
@auth.login_required
def upload():
    error = None
    resp = {}
    resp_code = 200
    if request.method == 'POST':

        # check if selected area size
        isAreaValid = selected_area_check(request, AD_MAX_SQUARES)

        # check if a user input was valid
        isValid = input_check(request)

        if isAreaValid == True and isValid == True:

            # check if selected area is still available
            isOverlaping = False
            try:
                isOverlaping = is_area_available_sql(request)
            except:
                print("\n\t[2] An exception occurred: cannot check is selected area is overlaping")

            if isOverlaping == False:
                
                # uploaded ad-file and all info
                file_name = write_to_file(request)

                if file_name == "ERROR":
                    # if uploaded file is to large retrun bad reqeast
                    resp = {'feedback': "order cannot be submitted", 'category': "file size is to big" , 'category_id': 3}
                    resp_code = 400
                else:
                    # update fragments.html file

                    # generate html fragments
                    tmp_html = ""
                    try:
                        tmp_html = generate_fragment_sql()
                    except:
                        print("\n\t[3] An exception occurred: cannot generate json-response")

                    # save html fragments
                    try:
                        # write_fragmens(f"{EXTRA_PATH_SERVER}/templates/fragments.html", tmp_html) --> server
                        write_fragmens('./templates/fragments.html', tmp_html)
                    except:
                        print("\n\t[4] An exception occurred: cannot write an html fragment")

                    resp = {'feedback': "order submitted", 'category': "success", 'category_id': 0}
                    resp_code = 200
                
            else:
                resp = {'feedback': "order cannot be submitted", 'category': "failure" , 'category_id': 1}
                resp_code = 400

        elif isValid == False:
            resp = {'feedback': "order cannot be submitted", 'category': "failure", 'category_id': 2}
            resp_code = 400

        elif isAreaValid == False:
            resp = {'feedback': "order cannot be submitted", 'category': "failure", 'category_id': 4}
            resp_code = 400

        return make_response(jsonify(resp), resp_code)

    elif request.method == 'GET':

        # the code below is executed if the request method
        # was GET or the credentials were invalid
        """User is viewing the page"""
        return redirect("index.html", code=200)

# API: getting the user-data - Admin
# get user-data
@csrf.exempt
@app.route('/upload_admin', methods=['GET', 'POST'])
@auth.login_required
def upload_admin():
    error = None
    resp = {}
    resp_code = 200
    if request.method == 'POST':

        # check if selected area size
        isAreaValid = selected_area_check(request, AD_MAX_SQUARES_ADMIN)

        # check if a user input was valid
        isValid = input_check(request)

        if isAreaValid == True and isValid == True:

            # check if selected area is still available
            isOverlaping = False
            try:
                isOverlaping = is_area_available_sql(request)
            except:
                print("\n\t[2] An exception occurred: cannot check is selected area is overlaping")

            if isOverlaping == False:
                
                # uploaded ad-file and all info
                file_name = write_to_file(request)

                if file_name == "ERROR":
                    # if uploaded file is to large retrun bad reqeast
                    resp = {'feedback': "order cannot be submitted", 'category': "file size is to big" , 'category_id': 3}
                    resp_code = 400
                else:
                    # update fragments.html file

                    # generate html fragments
                    tmp_html = ""
                    try:
                        tmp_html = generate_fragment_sql()
                    except:
                        print("\n\t[3] An exception occurred: cannot generate json-response")

                    # save html fragments
                    try:
                        # write_fragmens(f"{EXTRA_PATH_SERVER}/templates/fragments.html", tmp_html) --> server
                        write_fragmens('./templates/fragments.html', tmp_html)
                    except:
                        print("\n\t[4] An exception occurred: cannot write an html fragment")

                    resp = {'feedback': "order submitted", 'category': "success", 'category_id': 0}
                    resp_code = 200
                
            else:
                resp = {'feedback': "order cannot be submitted", 'category': "failure" , 'category_id': 1}
                resp_code = 400

        elif isValid == False:
            resp = {'feedback': "order cannot be submitted", 'category': "failure", 'category_id': 2}
            resp_code = 400

        elif isAreaValid == False:
            resp = {'feedback': "order cannot be submitted", 'category': "failure", 'category_id': 4}
            resp_code = 400

        return make_response(jsonify(resp), resp_code)

    elif request.method == 'GET':

        # the code below is executed if the request method
        # was GET or the credentials were invalid
        """User is viewing the page"""
        return redirect("index.html", code=200)

# API: update a single user record
@app.route('/upd_pending/<int:r_id>/<int:is_p>')
@auth.login_required
def update_pending_record(r_id=None, is_p=None):

    # get arguments
    request_val_1 = r_id
    request_val_2 = is_p
    record_id = -1
    is_pending = -1

    # do fast value test
    try:
        record_id = int(request_val_1)
        is_pending = int(request_val_2)
    except:
        print(f'\n\t[0] An exception occurred: cannot convert string value into integer\n')

    # print(f'\n\trecord_id: {record_id}')
    # print(f'\tis_pending: {is_pending}\n')

    # extra test
    if record_id <= -1 or is_pending <= -1 or is_pending > 1:
        return redirect("/", code=400)
    else:
        update_pending_record_sql(record_id, is_pending)
        
    return redirect(url_for('index1'))

# API: delete a single user record
@app.route('/del_record/<int:r_id>')
@auth.login_required
def delete_record(r_id=None):

    request_val_1 = r_id
    record_id = -1

    # do fast value test
    try:
        record_id = int(request_val_1)
    except:
        print(f'\n\t[1] An exception occurred: cannot convert string value into integer\n')

    # extra test
    if record_id >= 0:

        num_of_squares = 0
        ids_dictionary = get_record_id_sql(r_id)
        dictionary_size = len(ids_dictionary)

        if dictionary_size >= 1:
            num_of_squares = delete_records(ids_dictionary)
            print(f'\n\t[***] Extra num_of_squares: {num_of_squares} \n')

            # update number of records
            update_squares_sql(num_of_squares)
        else:
            print(f'\n\t[DELETE] Nothing to delete\n')        
    else:

        return redirect("/", code=400)

    return redirect(url_for('index1'))


# API: get all posts
# /get_all
@app.route('/get_all')
@auth.login_required
def get_all():

    data = get_all_sql()
        
    # this statement automatically acquires the lock before entering the block, 
    # and releases it when leaving the block
    with lock:
        # tmp_path = f"{EXTRA_PATH_SERVER}/templates/tmp.html" --> seerver
        # html_object = open(tmp_path, "a")  --> seerver
        html_object = open('./templates/tmp.html', "a")
        html_object.truncate(0) # errace old content
        html_object.write(data) # write new content 
        html_object.close()     # close IO stream

    return redirect(url_for('tmp'))

# API: run cleanups, remove records that labeled as isPanding = YES
# -----------------------------------------
@app.route('/cleanup_records')
@auth.login_required
def cleanup_records():
    
    num_of_squares = 0

    ids_dictionary = get_records_id_sql()

    dictionary_size = len(ids_dictionary)

    if dictionary_size >= 1:
        num_of_squares = delete_records(ids_dictionary)
        print(f'\n\t[***] Extra num_of_squares: {num_of_squares} \n')

        # update number of records
        update_squares_sql(num_of_squares)
    else:
        print(f'\n\t[CLEANUP] Nothing to clean\n')

    return redirect(url_for('index1'))

def delete_records(ids_dictionary):

    dictionary_size = len(ids_dictionary)
    
    ad_id = 0
    num_of_squares = 0
    ad_file_name = ""
    file_extension = ""
    image_path = ""
    gif_path = ""
    thumbnail_path = ""
    ad_file_link = ""
    verification_code = ""

    for key, value in ids_dictionary.items():
        ad_id = key
        # list od dictionaries
        for val in value:
            # dictionary
            for v in val.items():
                if v[0] == 'num_of_squares':
                    num_of_squares = num_of_squares + v[1]
                if v[0] == 'ad_file_name':
                    ad_file_name = v[1]
                if v[0] == 'file_extension':
                    file_extension = v[1]
                if v[0] == 'image_path':
                    image_path = v[1]
                if v[0] == 'gif_path':
                    gif_path = v[1]
                if v[0] == 'thumbnail_path':
                    thumbnail_path = v[1]
                if v[0] == 'ad_file_link':
                    ad_file_link = v[1]
                if v[0] == 'verification_code':
                    verification_code = v[1]

        if delete_records_sql(ad_id) == True and delete_code_sql(verification_code) == True:
            remove_file(ad_id, ad_file_name, image_path, gif_path, thumbnail_path)
        else:
            print(f"\n\tCannot remove SQL record and images [Record ID: {ad_id}]\n")

    return num_of_squares

def remove_file(ad_id, ad_file_name, image_path, gif_path, thumbnail_path):
    # remove image file
    try:
        # tmp_path = f"{EXTRA_PATH_SERVER}/{image_path}" --> server
        # os.remove(os.path.join(tmp_path, ad_file_name))  --> server
        os.remove(os.path.join(image_path, ad_file_name))
    except:
        print(f"\n\t[RF-1] An exception occurred: cannot remove image file [ID: {ad_id}]\n")
    finally:
        print(f"\n\t[RF-1] No exceptions: image file was removed [ID: {ad_id}]\n")

    # remove gif file
    try:
        # tmp_path = f"{EXTRA_PATH_SERVER}/{gif_path}" --> server
        # os.remove(os.path.join(tmp_path, ad_file_name))  --> server
        os.remove(os.path.join(gif_path, ad_file_name))
    except:
        print(f"\n\t[RF-2] An exception occurred: cannot remove gif file [ID: {ad_id}]\n")
    finally:
        print(f"\n\t[RF-2] No exceptions: gif file was removed [ID: {ad_id}]\n")

    # remove thumbnail file 'image'
    try:
        # tmp_file_name = f'{ad_file_name}.jpeg'  --> server
        # tmp_path = f"{EXTRA_PATH_SERVER}/{thumbnail_path}"  --> server
        # os.remove(os.path.join( tmp_path, tmp_file_name))  --> server
        tmp_file_name = f'{ad_file_name}.jpeg'
        os.remove(os.path.join( thumbnail_path, tmp_file_name))
    except:
        print(f"\n\t[RF-3] An exception occurred: cannot remove thumbnail 'image' file [ID: {ad_id}]\n")
    finally:
        print(f"\n\t[RF-3] No exceptions: thumbnail 'image' file was removed [ID: {ad_id}]\n")
# -----------------------------------------

# SQL
# -----------------------------------------
def update_pending_record_sql(record_id, is_pending):

    # read sql database
    try:
        
        conn = mysql.connection
        cur = conn.cursor()

        # print("\n\t[SQL-7.0] Opened database successfully [TABLE: ads]")

        # conn.isolation_level = 'EXCLUSIVE'
        # conn.execute('BEGIN EXCLUSIVE')
        # Exclusive access starts here. Nothing else can r/w the db

        cur.execute("UPDATE ads SET isPending = %s WHERE ad_id = %s", (is_pending, record_id) )
        
        conn.commit()
        # print("\t[SQL-7.1] Record successfully updated [TABLE: ads]\n")

        cur.close()
    except Exception as e:
        print(f'\n\t[+] An exception occurred: cannot update data int the sql database: {e}\n')


def update_squares_sql(num_of_squares):

    tmp = get_available_squares_sql() + num_of_squares
    # print(f'\n\t[**@**] New num_of_squares: {tmp} \n')

    # read sql database
    try:
        conn = mysql.connection
        cur = conn.cursor()

        # print("\n\t[SQL-10.0] Opened database successfully [TABLE: available_squares]")

        # conn.isolation_level = 'EXCLUSIVE'
        # conn.execute('BEGIN EXCLUSIVE')
        # Exclusive access starts here. Nothing else can r/w the db

        cur.execute("UPDATE available_squares SET squares = %s WHERE s_id = %s", (tmp, 1) )
        
        conn.commit()
        # print("\t[SQL-10.1] Record successfully updated [TABLE: available_squares]\n")

        cur.close()
    except Exception as e:
        print(f'\n\t[!#!] An exception occurred: cannot update data int the sql database: {e}\n')

# this record will removed from database 
def get_record_id_sql(ad_id):
    
    ids_dictionary = {}

    # read sql database
    try:
        
        conn = mysql.connection
        cur = conn.cursor()

        # print("\n\t[SQL-12.0] Opened database successfully [TABLE: ads]")

        # conn.isolation_level = 'EXCLUSIVE'
        # conn.execute('BEGIN EXCLUSIVE')
        # Exclusive access starts here. Nothing else can r/w the db

        cur.execute("SELECT * FROM ads")

        for row in cur:
            ID = row[0]
            isPending = row[1]
            num_of_squares = row[7]
            ad_file_name = row[13]
            file_extension = row[14]
            image_path = row[15]
            gif_path = row[16]
            thumbnail_path = row[17]
            ad_file_link = row[18]
            verification_code = row[19]
            date_created = row[20]

            if ID == ad_id and isPending == 1:
                # add ID to the list
                # print(f'\n\t[TEST-4] The record ID: {ID} must be deleted')
                # print(f'\t[TEST-4] ID: {ID} --- time since created: {time_diff_m} minuts\n')

                # append to dictionary
                ids_dictionary[ID] = []
                ids_dictionary[ID].append({
                    'num_of_squares': num_of_squares,
                    'ad_file_name': ad_file_name,
                    'file_extension': file_extension,
                    'image_path': image_path,
                    'gif_path': gif_path,
                    'thumbnail_path': thumbnail_path,
                    'ad_file_link': ad_file_link,
                    'verification_code': verification_code
                })
        
        conn.commit()
        # print("\t[SQL-12.1] Records successfully retrived [TABLE: ads]\n")

        cur.close()
    except Exception as e:
        print(f'\n\t[#@#] An exception occurred: cannot retrive data from sql database: {e}\n')
        
    return ids_dictionary

# this records will removed from database 
def get_records_id_sql():
    
    ids_dictionary = {}

    # read sql database
    try:
        
        conn = mysql.connection
        cur = conn.cursor()

        # print("\n\t[SQL-8.0] Opened database successfully [TABLE: ads]")

        # conn.isolation_level = 'EXCLUSIVE'
        # conn.execute('BEGIN EXCLUSIVE')
        # Exclusive access starts here. Nothing else can r/w the db

        cur.execute("SELECT * FROM ads")

        for row in cur:
            ID = row[0]
            isPending = row[1]
            num_of_squares = row[7]
            ad_file_name = row[13]
            file_extension = row[14]
            image_path = row[15]
            gif_path = row[16]
            thumbnail_path = row[17]
            ad_file_link = row[18]
            verification_code = row[19]
            date_created = row[20]

            # Convert time record from sql db from 'string' to 'datetime'
            a = datetime.datetime.strptime(date_created, "%Y-%m-%d %H:%M:%S.%f")
            # get current time
            b = datetime.datetime.now()

            # get time in seconds when user requested ad slot
            time_posted = int(a.timestamp())
            # get current time in seconds
            time_now = int(b.timestamp())
            # get time difference
            time_diff_s = time_now - time_posted # in seconds
            time_diff_m = ( time_diff_s / 60 ) # in minutes

            if isPending == 1 and time_diff_m >= TIME_LIMIT_PENDING:
                # add ID to the list
                # print(f'\n\t[TEST-4] The record ID: {ID} must be deleted')
                # print(f'\t[TEST-4] ID: {ID} --- time since created: {time_diff_m} minuts\n')

                # append to dictionary
                ids_dictionary[ID] = []
                ids_dictionary[ID].append({
                    'num_of_squares': num_of_squares,
                    'ad_file_name': ad_file_name,
                    'file_extension': file_extension,
                    'image_path': image_path,
                    'gif_path': gif_path,
                    'thumbnail_path': thumbnail_path,
                    'ad_file_link': ad_file_link,
                    'verification_code': verification_code
                })
        
        conn.commit()
        # print("\t[SQL-8.1] Records successfully retrived [TABLE: ads]\n")

        cur.close()
    except Exception as e:
        print(f'\n\t[#] An exception occurred: cannot retrive data from sql database: {e}\n')
        
    return ids_dictionary

def delete_records_sql(ad_id):
    
    # read sql database
    try:
        conn = mysql.connection
        cur = conn.cursor()

        # print("\n\t[SQL-9.0] Opened database successfully [TABLE: ads]")

        # conn.isolation_level = 'EXCLUSIVE'
        # conn.execute('BEGIN EXCLUSIVE')
        # Exclusive access starts here. Nothing else can r/w the db

        cur.execute( "DELETE FROM ads WHERE ad_id = %s", (ad_id,) )
            
        conn.commit()
        # print(f'\t[SQL-9.1] Record ID: {ad_id} successfully deleted [TABLE: ads]\n')

        cur.close()
    except Exception as e:
        print(f'\n\t[@^@] An exception occurred: cannot retrive data from sql database: {e}\n')
    finally:
        return True

    return False   

def delete_code_sql(code):
    
    # read sql database
    try:
        conn = mysql.connection
        cur = conn.cursor()

        # print("\n\t[SQL-10.0] Opened database successfully [TABLE: user_code]")

        # conn.isolation_level = 'EXCLUSIVE'
        # conn.execute('BEGIN EXCLUSIVE')
        # Exclusive access starts here. Nothing else can r/w the db

        cur.execute( "DELETE FROM user_code WHERE code = %s", (code,) )
            
        conn.commit()
        # print(f'\t[SQL-10.1] Record CODE: {code} successfully deleted [TABLE: user_code]\n')

        cur.close()
    except Exception as e:
        print(f'\n\t[!-@^@-!] An exception occurred: cannot retrive data from sql database: {e}\n')
    finally:
        return True

    return False   

# check if selected area is still available
def is_area_available_sql(request):

    isOverlaping = False

    x1 = int(request.form['coordinates_x']) # top left corner
    y1 = int(request.form['coordinates_y']) # top left corner
    width = int(request.form['image_width'])
    height = int(request.form['image_height'])
    x2 = x1 + width  # top right corner
    y2 = y1          # top right corner
    x3 = x1 + width  # bottom right corner
    y3 = y1 + height # bottom right corner
    x4 = x1          # bottom left corner
    y4 = y3          # bottom left corner

    # read sql database
    try:
        conn = mysql.connection
        cur = conn.cursor()

        # print("\n\t[SQL-4.0] Opened database successfully [TABLE: ads]")

        # conn.isolation_level = 'EXCLUSIVE'
        # conn.execute('BEGIN EXCLUSIVE')
        # Exclusive access starts here. Nothing else can r/w the db

        cur.execute("SELECT * FROM ads")
        
        for row in cur:
            ID = row[0]
            a1 = row[3] # top left corner
            b1 = row[4] # top left corner
            width1 = row[5]
            height1 = row[6]
            num_of_squares = row[7]
            cost = row[8]

            a2 = a1 + width1  # top right corner 'x'
            b2 = b1           # top right corner 'y'
            a3 = a1 + width1  # bottom right corner 'x'
            b3 = b1 + height1 # bottom right corner 'y'
            a4 = a1           # bottom left corner 'x'
            b4 = b3           # bottom left corner 'y'

            # test if two areas overlapping 
            if (x1 < a2) and (x2 > a1) and (y1 < b4) and (y4 > b1):
                isOverlaping = True
                break
        
        conn.commit()
        # print("\t[SQL-4.1] Records successfully retrived [TABLE: ads]\n")

        cur.close()
    except Exception as e:
        print(f'\n\t[(*)] An exception occurred: cannot retrive data from sql database: {e}\n')
        
    return isOverlaping

def generate_fragment_sql():

    tmp_html = ""

    # read sql database
    try:
        conn = mysql.connection
        cur = conn.cursor()

        # print("\n\t[SQL-2.0] Opened database successfully [TABLE: ads]")

        cur.execute("SELECT * FROM ads")

        for row in cur:
            ID = row[0]
            isPending = row[1]
            color = row[2]
            coordinates_x = row[3]
            coordinates_y = row[4]
            image_width = row[5]
            image_height = row[6]
            num_of_squares = row[7]
            cost = row[8]
            full_name = row[9]
            ad_name = row[10]
            ad_email = row[11]
            ad_hyperlink = row[12]
            ad_file_name = row[13]
            file_extension = row[14]
            image_path = row[15]
            gif_path = row[16]
            thumbnail_path = row[17]
            ad_file_link = row[18]
            verification_code = row[19]
            date_created = row[20]

            # print(f'\n\tID: {ID} --- verification_code: [{verification_code}] [{date_created}]\n')

            if isPending == 1:
                # for the reserved fragmens
                tmp_html += generate_response(ID, coordinates_x, coordinates_y, image_width, image_height, color)

            if isPending == 0:
                # for the bought fragmens
                tmp_html += generate_response_2(ID, coordinates_x, coordinates_y, image_width, image_height, ad_name, ad_hyperlink, ad_file_name, file_extension, image_path, gif_path, thumbnail_path, ad_file_link) 
            
            '''
            # this option allow users to see uploaded image right way
            # for the bought fragmens
            tmp_html += generate_response_2(ID, coordinates_x, coordinates_y, image_width, image_height, ad_name, ad_hyperlink, ad_file_name, file_extension, image_path, gif_path, thumbnail_path, ad_file_link)
            '''
        
        conn.commit()
        # print("\t[SQL-2.1] Records successfully retrived [TABLE: ads]\n")

        cur.close()
    except Exception as e:
        print(f'\n\t[#] An exception occurred: cannot retrive data from sql database: {e}\n')
        
    return tmp_html

def add_sql_record(request, file_name, file_extension):

    isCostValid = False
    now = datetime.datetime.now()

    # get values from the request
    isPending = 1
    color = generate_color() # used for reserved area
    coordinates_x = int(request.form['coordinates_x'])
    coordinates_y = int(request.form['coordinates_y'])
    image_width = int(request.form['image_width'])
    image_height = int(request.form['image_height'])
    num_of_squares = int(request.form['num_of_squares'])
    cost = int(request.form['cost'])
    full_name = request.form['full_name']
    ad_name = request.form['ad_name']
    ad_email = request.form['ad_email']
    ad_hyperlink = request.form['ad_hyperlink']
    ad_file_name = file_name
    file_extension = file_extension
    image_path = f'{UPLOAD_FOLDER_IMG}/'
    gif_path = f'{UPLOAD_FOLDER_GIF}/'
    thumbnail_path = f'{UPLOAD_FOLDER_THUMBNAILS}/'
    ad_file_link = f'static/user_content/uploads/{file_name}'
    verification_code = f'{store_code_sql(get_code_sql())}'
    # date_created = f'{now.year}-{now.month}-{now.day} {now.hour}:{now.minute}:{now.second}'
    date_created = f'{now}'

    # recalculate cost
    per_square = REAL_PRICE * PRICE_RATIO 
    cost_tmp = int( num_of_squares * per_square )

    # print(f'\n\t[@-.-.-@] from client-cost: {cost} --- server calculated-cost: {cost_tmp}')

    if cost == cost_tmp:
        print(f'\t[@-.-.-@.-.-$] client and server verified cost amount\n')
        isCostValid = True
    else:
        print(f'\t[@-.-.-@.-.-%] client and server could not verify cost amount\n')
        isCostValid = False

    if isCostValid == True:

        try:

            conn = mysql.connection
            cur = conn.cursor()

            # print("\n\t[SQL-1.0] Opened database successfully [TABLE: ads]")

            # conn.isolation_level = 'EXCLUSIVE'
            # conn.execute('BEGIN EXCLUSIVE')
            # Exclusive access starts here. Nothing else can r/w the db

            cur.execute("INSERT INTO ads (isPending, color, coordinates_x, coordinates_y, image_width, image_height, num_of_squares, cost, full_name, ad_name, ad_email, ad_hyperlink, ad_file_name,file_extension, image_path, gif_path, thumbnail_path, ad_file_link, verification_code, date_created) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)", (isPending, color, coordinates_x, coordinates_y, image_width, image_height, num_of_squares, cost, full_name, ad_name, ad_email, ad_hyperlink, ad_file_name, file_extension, image_path, gif_path, thumbnail_path, ad_file_link, verification_code, date_created) )
            
            conn.commit()
            # print("\t[SQL-1.1] Record successfully inserted [TABLE: ads]\n")

            cur.close()
        except Exception as e:
            print(f'\n\t[@] An exception occurred: cannot insert into sql database: {e}\n')
        finally:
            # send email: for a user
            send_email_user(cost, full_name, ad_name, ad_email, ad_hyperlink, verification_code, date_created, num_of_squares)

            # send email: for admin
            send_email_admin(cost, full_name, ad_name, ad_email, ad_hyperlink, verification_code, date_created, num_of_squares, request.base_url, coordinates_x, coordinates_y, image_width, image_height, ad_file_name, ad_file_link)

    return isCostValid

def write_available_squares_sql(s_available):

    # read sql database
    try:
        conn = mysql.connection
        cur = conn.cursor()

        # print("\n\t[SQL-3.0] Opened database successfully [TABLE: available_squares]")

        # conn.isolation_level = 'EXCLUSIVE'
        # conn.execute('BEGIN EXCLUSIVE')
        # Exclusive access starts here. Nothing else can r/w the db

        cur.execute("UPDATE available_squares SET squares = %s WHERE s_id = %s", (s_available, 1) )
        
        conn.commit()
        # print("\t[SQL-3.1] Record successfully updated [TABLE: available_squares]\n")

        cur.close()
    except Exception as e:
        print(f'\n\t[!] An exception occurred: cannot update data in the sql database: {e}\n')

def get_available_squares_sql():

    squares = 0
    
    # read sql database
    try:
        conn = mysql.connection
        cur = conn.cursor()

        # print("\n\t[SQL-1.1] Opened database successfully [TABLE: available_squares]")

        # conn.isolation_level = 'EXCLUSIVE'
        # conn.execute('BEGIN EXCLUSIVE')
        # Exclusive access starts here. Nothing else can r/w the db

        cur.execute("SELECT * FROM available_squares")

        for row in cur:
            s_id = row[0]
            squares = row[1]
        
        conn.commit()
        # print("\t[SQL-1.1] Records successfully retrived [TABLE: available_squares]\n")

        cur.close()
    except Exception as e:
        print(f'\n\t[!] An exception occurred: cannot retrive data from sql database: {e}\n')
        
    return squares

def get_code_sql():

    valid_code = ""

    # read sql database
    try:
        conn = mysql.connection
        cur = conn.cursor()

        # print("\n\t[SQL-5.0] Opened database successfully [TABLE: user_code]")

        cur.execute("SELECT * FROM user_code")

        isValid = False
        isUnique = True
        while isValid == False:

            tmp_code = generate_code()

            for row in cur:
                c_id = row[0]
                code = row[1]

                if tmp_code == code:
                    isUnique == False

            if isUnique == True:
                valid_code = tmp_code
                isValid = True
        
        conn.commit()
        # print("\t[SQL-5.1] Records successfully retrived [TABLE: user_code]\n")

        cur.close()
    except Exception as e:
        print(f'\n\t[#-#] An exception occurred: cannot retrive data from sql database: {e}\n')
        
    return valid_code

def store_code_sql(code):
    
    try:
        conn = mysql.connection
        cur = conn.cursor()

        # print("\n\t[SQL-6.0] Opened database successfully [TABLE: user_code]")

        # conn.isolation_level = 'EXCLUSIVE'
        # conn.execute('BEGIN EXCLUSIVE')
        # Exclusive access starts here. Nothing else can r/w the db

        cur.execute("INSERT INTO user_code (code) VALUES (%s)", (code,))
            
        conn.commit()
        # print("\t[SQL-6.1] Record successfully inserted [TABLE: user_code]\n")

        cur.close()
    except Exception as e:
        print(f'\n\t[*-*] An exception occurred: cannot insert into sql database: {e}\n')

    return code

def get_post_id_sql(cost, full_name, ad_name, ad_email, ad_hyperlink, verification_code, date_created, num_of_squares):

    ad_id = -1

    # read sql database
    try:
        conn = mysql.connection
        cur = conn.cursor()

        # print("\n\t[SQL-2.0] Opened database successfully [TABLE: ads]")

        #  "DELETE FROM user_code WHERE code = %s", (code,) 
        cur.execute("SELECT * FROM ads WHERE cost = %s AND full_name = %s AND ad_name = %s AND ad_email = %s AND ad_hyperlink = %s AND verification_code = %s AND date_created = %s AND num_of_squares = %s", (cost, full_name, ad_name, ad_email, ad_hyperlink, verification_code, date_created, num_of_squares,) )

        for row in cur:
            ad_id = row[0]

            # print(f'\n\tID: {ID} --- verification_code: [{verification_code}] [{date_created}]\n')
        
        conn.commit()
        # print("\t[SQL-2.1] Records successfully retrived [TABLE: ads]\n")

        cur.close()
    except Exception as e:
        print(f'\n\t[***-***] An exception occurred: cannot retrive data from sql database: {e}\n')
        
    return ad_id

# return all user records as html fragments
def get_all_sql():

    tmp_html = "<h1>Images:</h1>"
    tmp_csv = "<h1>CSV Format:</h1>"

    # read sql database
    try:
        conn = mysql.connection
        cur = conn.cursor()

        # print("\n\t[SQL-2.0] Opened database successfully [TABLE: ads]")

        cur.execute("SELECT * FROM ads")

        for row in cur:
            ID = row[0]
            isPending = row[1]
            color = row[2]
            coordinates_x = row[3]
            coordinates_y = row[4]
            image_width = row[5]
            image_height = row[6]
            num_of_squares = row[7]
            cost = row[8]
            full_name = row[9]
            ad_name = row[10]
            ad_email = row[11]
            ad_hyperlink = row[12]
            ad_file_name = row[13]
            file_extension = row[14]
            image_path = row[15]
            gif_path = row[16]
            thumbnail_path = row[17]
            ad_file_link = row[18]
            verification_code = row[19]
            date_created = row[20]

            # print(f'\n\tID: {ID} --- verification_code: [{verification_code}] [{date_created}]\n')

            tmp_html += generate_response_3(ID, coordinates_x, coordinates_y, image_width, image_height, ad_name, ad_hyperlink, ad_file_name, file_extension, image_path, gif_path, thumbnail_path, ad_file_link) 

            if isPending == 1:
                tmp_csv += f'''<strong>[PENDING {file_extension}]</strong>: {ID};{isPending};{color};{coordinates_x};{coordinates_y};{image_width};{image_height};{num_of_squares};{cost};{full_name};{ad_name};{ad_email};{ad_hyperlink};{ad_file_name};{file_extension};{ad_file_link};{verification_code};{date_created};<br /><br />'''
            else:
                tmp_csv += f'''<strong>[PAID {file_extension}]</strong>: {ID};{isPending};{color};{coordinates_x};{coordinates_y};{image_width};{image_height};{num_of_squares};{cost};{full_name};{ad_name};{ad_email};{ad_hyperlink};{ad_file_name};{file_extension};{ad_file_link};{verification_code};{date_created};<br /><br />'''

        conn.commit()
        # print("\t[SQL-2.1] Records successfully retrived [TABLE: ads]\n")

        cur.close()
    except Exception as e:
        print(f'\n\t[###-.-###] An exception occurred: cannot retrive data from sql database: {e}\n')
        
    data = f"""{tmp_html}<br /><br /><br />{tmp_csv}"""

    return data

# -----------------------------------------

# working with files
# -----------------------------------------
# write an uploaded image file
def write_to_file(request):

    # save ad-file
    file_name = ad_file(request)

    # at this point return
    if file_name == "ERROR":
        return file_name

    # update squares: calculate available squares and write to a SQL database
    # ------------------------------
    s_available = -1
    try:
        s_available = calculate_available_squares(request)
    except:
        print("\n\t[7] An exception occurred: cannot calculate available-squares\n")

    # update squares: write squares into sql database
    try:
        write_available_squares_sql(s_available)
    except:
        print("\n\t[8.1] An exception occurred: cannot write into sql database\n")
    # ------------------------------

    # get file extention
    file_extension = get_file_extension(file_name)

    # write into sql database
    # -------------------------------------------------------------------------------
    isValid = False
    try:
        isValid = add_sql_record(request, file_name, file_extension)
    except:
        print("\n\tAn exception occurred: cannot write into SQL database\n")

    if isValid == False:
        file_name = "ERROR"
        return file_name
    # -------------------------------------------------------------------------------
    
    return file_name

# save uploaded ad-file
def ad_file(request):

    coordinates_x = request.form['coordinates_x']
    coordinates_y = request.form['coordinates_y']
    ad_email = request.form['ad_email']
    ad_media_file = 'ad_media_file'

    return save_file(request, coordinates_x, coordinates_y, ad_email, ad_media_file)

def get_file_extension(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower()

def file_name(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[0].lower()

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_file(request, coordinates_x, coordinates_y, ad_email, ad_media_file):
    # check if the post request has the file part
    if ad_media_file not in request.files:
        flash('No file part')
        return redirect(request.url)
    
    # get file from the request object
    file = request.files[ad_media_file]
    
    # if user does not select file, browser also
    # submit an empty part without filename
    if file.filename == '':
        flash('No selected file')
        return redirect(request.url)
        
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        extension = get_file_extension(filename)

        now = datetime.datetime.now()
        td = f'{now.year}-{now.month}-{now.day}_{now.hour}-{now.minute}-{now.second}'

        # this file name will be used to save original file uploaded by user
        name = f'''{coordinates_x}x{coordinates_y}_{ad_email.replace("@", "-")}_{td}.{extension}'''

        # this file name will be used to generate a static image from gif file
        thumbnail_name = f'''{coordinates_x}x{coordinates_y}_{ad_email.replace("@", "-")}_{td}.{extension}'''

        # we need to save a gif file in a different folder
        tmp_path = ""
        if extension == "gif":
            # tmp_path = f"{EXTRA_PATH_SERVER}/{app.config['UPLOAD_FOLDER_GIF']}" --> server
            tmp_path = app.config['UPLOAD_FOLDER_GIF']
        else:
            # tmp_path = f"{EXTRA_PATH_SERVER}/{app.config['UPLOAD_FOLDER_IMG']}" --> server
            tmp_path = app.config['UPLOAD_FOLDER_IMG']

        # save original file
        try:
            file.save(os.path.join(tmp_path, name))
        except:
            print("\n\t[9] An exception occurred: save uploaded file\n")
        finally:
            print("\n\t[FILE SAVED] No exception occurred: uploaded file saved\n")

        # check file size
        isFileSizeValid = False
        try:
            isFileSizeValid = check_file_size(request, tmp_path, name)
        except:
            print("\n\t[9.1] An exception occurred: cannot get file size\n")
        # isFileSizeValid = True

        if isFileSizeValid == True:
            # we can continue working with the uploaded file
            # if it is a gif file we have to create a thumbnail and save it
            if extension == "gif":
                # convert gif to jpeg
                # tmp_path = f"{EXTRA_PATH_SERVER}/{app.config['UPLOAD_FOLDER_GIF']}" --> server
                # tmp = os.path.join(tmp_path, name) --> server
                tmp = os.path.join(app.config['UPLOAD_FOLDER_GIF'], name)
                gif = cv.VideoCapture(tmp)
                ret, frame = gif.read()

                try:
                    # tmp_path = f"{EXTRA_PATH_SERVER}/{UPLOAD_FOLDER_THUMBNAILS}/{thumbnail_name}.jpeg"  --> server
                    # cv.imwrite(tmp_path, frame)  --> server

                    cv.imwrite(f'{UPLOAD_FOLDER_THUMBNAILS}/{thumbnail_name}.jpeg', frame)
                except:
                    print("\n\t[10] An exception occurred: save thumbnail file\n")
        else:
            # remove file
            try:
                os.remove(os.path.join(tmp_path, name))
            except:
                print("\n\t[9.2] An exception occurred: cannot remove file\n")

            name = "ERROR"
        
        return name

# we have to check how many squares are available
def calculate_available_squares(request):
    s_available = int(request.form['s_available'])
    num_of_squares = int(request.form['num_of_squares'])
    s_available = s_available - num_of_squares
    # print(f'\ns_available: {s_available}\n')

    return s_available

# save html fragments in the file, html fragmens is an ad-fragment
def write_fragmens(filename, data):

    # this statement automatically acquires the lock before entering the block, 
    # and releases it when leaving the block
    with lock:
        html_object = open(filename, "a")
        html_object.truncate(0) # errace old content
        html_object.write(data) # write new content 
        html_object.close()     # close IO stream

# -----------------------------------------

# generate HTML fragments, it can be verified and unverified fragments
# -----------------------------------------
# unverified fragments
def generate_response(id, x ,y, w, h, color):

    tmp_html = f'''<!-- reserved fragment -->
    <a id="a_file{id}" href="#" class="site-link" style="left: {x}px; top: {y}px;">
    <img hidden id="i_file{id}" src="static/img/tmp/reserved_area_5.png"></img>
    <img id="file{id}" type="img" src="static/img/tmp/reserved_area_5.png" alt="Reserved Area" 
    width="{w}" height="{h}" class="video-fragment vf-extra" style="background-color: {color};"/></a>\n\n'''
    return tmp_html

# verified fragments
def generate_response_2(id, x ,y, w, h, ad_name, ad_hyperlink, ad_file_name, file_extension, image_path, gif_path, thumbnail_path, ad_file_link):
    
    tmp_html = ""
    if file_extension == 'gif':
        tmp_html = f'''<!-- comfirmet fragment -->
        <a id="a_file{id}" href="{ad_hyperlink}" class="site-link" style="left: {x}px; top: {y}px;">
        <img hidden id="i_file{id}" src="{gif_path}{ad_file_name}"></img>
        <img id="file{id}" type="img" src="{thumbnail_path}{ad_file_name}.jpeg" alt="{ad_name}" 
        width="{w}" height="{h}" class="video-fragment"/></a>\n\n'''
    else:
        tmp_html = f'''<!-- comfirmet fragment -->
        <a id="a_file{id}" href="{ad_hyperlink}" class="site-link" style="left: {x}px; top: {y}px;">
        <img hidden id="i_file{id}" src="{image_path}{ad_file_name}"></img>
        <img id="file{id}" type="img" src="{image_path}{ad_file_name}" alt="{ad_name}" 
        width="{w}" height="{h}" class="video-fragment"/></a>\n\n'''

    return tmp_html

# form tmp.html
def generate_response_3(id, x ,y, w, h, ad_name, ad_hyperlink, ad_file_name, file_extension, image_path, gif_path, thumbnail_path, ad_file_link):
    
    tmp_html = ""
    if file_extension == 'gif':
        tmp_html = f'''<!-- comfirmet fragment -->
        <input type="hidden" id="a_file{id}" value="left: {x}px; top: {y}px; width="{w}" height="{h}"">
        <a id="a_file{id}" href="{ad_hyperlink}" class="site-link" style="left: {x}px; top: {y}px;">
        <img hidden id="i_file{id}" src="{gif_path}{ad_file_name}"></img>
        <img id="file{id}" type="img" src="{thumbnail_path}{ad_file_name}.jpeg" alt="{ad_name}" 
        width="64px" height="64px" class="video-fragment"/></a><span></span>\n\n'''
    else:
        tmp_html = f'''<!-- comfirmet fragment -->
        <input type="hidden" id="a_file{id}" value="left: {x}px; top: {y}px; width="{w}" height="{h}"">
        <a id="a_file{id}" href="{ad_hyperlink}" class="site-link" style="left: {x}px; top: {y}px;">
        <img hidden id="i_file{id}" src="{image_path}{ad_file_name}"></img>
        <img id="file{id}" type="img" src="{image_path}{ad_file_name}" alt="{ad_name}" 
        width="64px" height="64px" class="video-fragment"/></a>\n\n'''

    return tmp_html
# -----------------------------------------

# selected area size check
def selected_area_check(request, maxSquares):

    isValid = False

    width = int(request.form['image_width'])
    height = int(request.form['image_height'])
    num_of_squares = int(request.form['num_of_squares'])

    if num_of_squares <= maxSquares:
        isValid = True

    return isValid

# user input check
# -----------------------------------------
# test text-fields input
def input_check(request):
    isValid = True

    # regex pattern for name and ad-name
    fname_pattern = '^([a-z,A-Z,0-9, ]+)+$'

    # '^([\ -]*?[a-zA-Z0-9]+)+[\ -]*$'
    ad_name_pattern = '^([a-z,A-Z,0-9, ,-]+)+$'

    # regex patterns fro email
    email_pattern = '^[a-z0-9]+(?:[\.-]?[a-z0-9]+)*(?:[\._]?[a-z0-9]+)*@[a-z0-9]+([-]?[a-z0-9]+)*[\.-]?[a-z0-9]+([-]?[a-z0-9]+)*([\.-]?[a-z]{2,})*(\.[a-z]{2,5})+$'
    
    # regex patterns fro url
    # pattern name: @mattfarina
    ad_link_pattern = "^([a-z][a-z0-9\*\-\.]*):\/\/(?:(?:(?:[\w\.\-\+!$&'\(\)*\+,;=]|%[0-9a-f]{2})+:)*(?:[\w\.\-\+%!$&'\(\)*\+,;=]|%[0-9a-f]{2})+@)?(?:(?:[a-z0-9\-\.]|%[0-9a-f]{2})+|(?:\[(?:[0-9a-f]{0,4}:)*(?:[0-9a-f]{0,4})\]))(?::[0-9]+)?(?:[\/|\?](?:[\w#!:\.\?\+=&@!$'~*,;\/\(\)\[\]\-]|%[0-9a-f]{2})*)?$"

    '''
    # removed test for: http, https, www.
    ad_link_pattern2 = "^(?:(?:[a-z0-9\-\.]|%[0-9a-f]{2})+|(?:\[(?:[0-9a-f]{0,4}:)*(?:[0-9a-f]{0,4})\]))(?::[0-9]+)?(?:[\/|\?](?:[\w#!:\.\?\+=&@!$'~*,;\/\(\)\[\]\-]|%[0-9a-f]{2})*)?$"
    '''

    full_name = request.form['full_name']
    ad_name = request.form['ad_name']
    ad_email = request.form['ad_email']
    ad_hyperlink = request.form['ad_hyperlink']

    if len(full_name) > 35:
        return False
    if len(ad_name) > 80:
        return False
    if len(ad_email) > 50:
        return False
    if len(ad_hyperlink) > 80:
        return False

    result = re.fullmatch(fname_pattern, full_name)
    # print(f'\n\t[INPUT-1] full_name: {full_name} --> {result}')
    if result is None:
        return False

    result = re.fullmatch(ad_name_pattern, ad_name)
    # print(f'\t[INPUT-2] ad_name: {ad_name} --> {result}')
    if result is None:
        return False

    result = re.fullmatch(email_pattern, ad_email)
    # print(f'\t[INPUT-3] ad_email: {result}')
    if result is None:
        return False

    # extra for the ad-link
    # ---------------------------------------------------
    # we need check if provided link has following:
    # 1: http:// 
    # 2: https://
    # 3: www --> after https or https
    """
    url_h = ["http://", "https://", "www.", "http://www.", "https://www."]

    print(f'\n\t[Ad-LINK]: {ad_hyperlink}')
    k = 1
    tmp_url_h = ""
    new_url = ""
    for h in url_h:
        sub_h = ad_hyperlink[:len(h)] # getting the url HTTP protocol name
        print(f'\t[Ad-LINK-TEST-{k}]: {sub_h}')

        if sub_h == h:
            tmp_url_h = h
            new_url = ad_hyperlink.replace(h, "")
        k = k + 1
    
    print(f'\n\t[TMP-URL-H]: {tmp_url_h}')
    print(f'\t[NEW-Ad-LINK]: {new_url}\n')
    """
    # ---------------------------------------------------

    result = re.fullmatch(ad_link_pattern, ad_hyperlink)
    # print(f'\t[INPUT-4] ad_hyperlink: {result}\n')
    if result is None:
        return False

    return isValid

# user input check: test uploaded file
def check_file_size(request, path, name):
    
    isFileSizeValid = False

    num_of_squares = int( request.form['num_of_squares'] )

    # calculate how much space was allocated for the uploaded image
    space_allocated = num_of_squares * SPACE_PER_SQUARE

    # get uploaded file
    size = os.stat( f'{path}/{name}' ).st_size
    size = ( ( size / 1024 ) / 1024 ) # size in megabites

    print(f'\n\t[FILE] file-zie: {size} megabytes')
    print(f'\t[FILE] space-allocated: {space_allocated} megabytes\n')
    
    if size <= space_allocated:
        isFileSizeValid = True
    
    return isFileSizeValid
# -----------------------------------------

# working with the sending email
# -----------------------------------------
# write email data into email_db.json for logs
def send_email_user(cost, full_name, ad_name, ad_email, ad_hyperlink, verification_code, date_created, num_of_squares):

    per_square = round(REAL_PRICE * PRICE_RATIO,0)

    mail_body = f''' 
    Hello {full_name}, \n
    Recently you booked a slot for your Ad on the www.themillionpixelshomepage.com website.

    The total cost: ${cost}.00 USD;
    Selected {num_of_squares} square(s);
    Price per square is ${per_square}0 USD;

    Please note that if you will not perform a payment withing 12 hours the ad-slot that you booked
    will be removed. After that you have to select a new slot, and ad-slots are limited.

    Your verification code: [{verification_code}]. Ad-slot booked on date-time: {date_created}.

    Dear customer I will contact you soon using a different email that is alex.matveyev88@gmail.com, so you can provide your verification code and pay for the Ad placement. 
    I do that in such a way to make sure that you are a real person and not a bot, hopefully you do understand that.

    Please make sure you read all information on the "Buy Squares" webpage, 
    here is a link: https://www.themillionpixelshomepage.com/buysquares.html .
    
    You provided the following information: 
    Full Name: {full_name};
    Ad-Name: {ad_name};
    Ad-URL: {ad_hyperlink};
    
    If that information is incorrect please book another ad-slot and this one will be removed in 12 hours. \n

    Please remember that I will contact with you only via themillionpixelshomepage@gmail.com or alex.matveyev88@gmail.com. If someone contacted you via different email address about payments do not follow that.

    Thank you.
    '''
    
    try:
        with app.app_context():
            msg = Message(subject="Ad-Slot booked on www.themillionpixelshomepage.com",
                        sender=app.config.get("MAIL_USERNAME"),
                        recipients=[ad_email, "your_second_gmail_to_get_email_notofication_on"],
                        body=mail_body)
            mail.send(msg)
    except Exception as e:
        print(f"\t[ERROR: CANNOT SEND EMAIL]: {e}\n")
    finally:
        print("\t[EMAIL WAS SENT TO USER]\n")

def send_email_admin(cost, full_name, ad_name, ad_email, ad_hyperlink, verification_code, date_created, num_of_squares, url, coordinates_x, coordinates_y, image_width, image_height, ad_file_name, ad_file_link):

    # find a record in the database to get ID
    ad_id = get_post_id_sql(cost, full_name, ad_name, ad_email, ad_hyperlink, verification_code, date_created, num_of_squares)

    per_square = round(REAL_PRICE * PRICE_RATIO,0) 

    # remove from the request url a request route name to get initial url of this web-app
    s = 0
    tmp_url = ""
    try:

        char_index = url.find('u')
        if char_index > 0:
            tmp_url = url[:(char_index - 1)]

    except Exception as e:
        print(f'\n\t[SLICE ERROR]: {e}\n')

    mail_body = f''' 
    Information for Admin:

    \tUser ID: {ad_id};

    \tUser full name: {full_name};
    \tAd-Name: {ad_name};
    \tAd-email: {ad_email};
    \tAd-URL: {ad_hyperlink};
    \tThe total cost: ${cost}.00 USD;
    \tSelected {num_of_squares} square(s);
    \tPrice per square is ${per_square}0 USD;
    \tUSer verification code: [{verification_code}];
    \tAd booked on date-time: {date_created};
    
    \tcoordinates_x: {coordinates_x}
    \tcoordinates_y: {coordinates_y}
    \timage_width: {image_width}
    \timage_height: {image_height}
    \tad_file_name: {ad_file_name} 
    \tad_file_link: {ad_file_link}

    \tGET ALL POSTS: {tmp_url}/get_all

    \tMAKE AD-POST VISIBLE: {tmp_url}/upd_pending/{ad_id}/0
    \tHIDE AD-POST: {tmp_url}/upd_pending/{ad_id}/1
    \tDELETE AD-POST: {tmp_url}/del_record/{ad_id}
    
    \tSHOW ALL POSTS: {tmp_url}/get_all

    \tCLEAN-UP ALL RECORDS: {tmp_url}/cleanup_records

    \thttps://www.themillionpixelshomepage.com/
    
    '''
    
    try:
        with app.app_context():
            msg = Message(subject=f"For Admin: Ad-Slot #{ad_id}",
                        sender=app.config.get("MAIL_USERNAME"),
                        recipients=["your_second_gmail_to_get_email_notofication_on"],
                        body=mail_body)
            mail.send(msg)
    except Exception as e:
        print(f"\t[ERROR: CANNOT SEND EMAIL]: {e}\n")
    finally:
        print("\t[EMAIL WAS SENT TO ADMIN]\n")


def send_email_admin_login(request):

    # request.remote_addr ---> IP address

    mail_body = f''' 
    Information for Admin:

    Login detected date-time: {datetime.datetime.now()} ;
    IP: {request.remote_addr} ;
    
    '''
    
    try:
        with app.app_context():
            msg = Message(subject=f"For Admin: Login",
                        sender=app.config.get("MAIL_USERNAME"),
                        recipients=["tyour_second_gmail_to_get_email_notofication_on"],
                        body=mail_body)
            mail.send(msg)
    except Exception as e:
        print(f"\t[ERROR: CANNOT SEND EMAIL <LOGIN>]: {e}\n")
    finally:
        print("\t[EMAIL WAS SENT TO ADMIN <LOGIN>]\n")

def admin_log(request):

    print(f'\n\tLogin detected date-time: {datetime.datetime.now()} --- IP: {request.remote_addr}\n')

# -----------------------------------------

# colors generator
# -----------------------------------------
def generate_color():

    tmp_color = ""

    # rundom numbers from 0 to 255
    num1 = random.randint(0, 255)
    num2 = random.randint(0, 255)
    num3 = random.randint(0, 255)

    tmp_color = f'rgb({num1}, {num2}, {num3})'

    return tmp_color
# -----------------------------------------

# code generator
# -----------------------------------------
def generate_code():

    # the code will be provided for a user to verify if a user is a human and not a bot

    tmp_code = ""
    code_length = 10

    char_string = "qwertyuiop[]asdfghjkl;zxcvbnm,.!@#$%^&*-=+0123456789<>?()"

    i = 0
    while i < code_length:

        char_index = random.randint(0, (len(char_string) - 1) )
        tmp_code = tmp_code + char_string[char_index]

        i = i + 1

    return tmp_code
# -----------------------------------------

# write log
# -----------------------------------------

# -----------------------------------------

# this code will work if run this server.[y script as python script and as Flask app
if __name__ == "__main__":
    app.run(host='127.0.0.1', port=4000, threaded=False, debug=True)