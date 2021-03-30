/* MySQL */
/* schema name: millionpixelshomepage */
DROP TABLE IF EXISTS `ads`;
CREATE TABLE `millionpixelshomepage`.`ads` (
  `ad_id` INT NOT NULL AUTO_INCREMENT,
  `isPending` INT NOT NULL,
  `color` VARCHAR(45) NOT NULL,
  `coordinates_x` INT NOT NULL,
  `coordinates_y` INT NOT NULL,
  `image_width` INT NOT NULL,
  `image_height` INT NOT NULL,
  `num_of_squares` INT NOT NULL,
  `cost` INT NOT NULL,
  `full_name` VARCHAR(45) NOT NULL,
  `ad_name` VARCHAR(100) NOT NULL,
  `ad_email` VARCHAR(50) NOT NULL,
  `ad_hyperlink` VARCHAR(80) NOT NULL,
  `ad_file_name` VARCHAR(255) NOT NULL,
  `file_extension` VARCHAR(5) NOT NULL,
  `image_path` MEDIUMTEXT NOT NULL,
  `gif_path` MEDIUMTEXT NOT NULL,
  `thumbnail_path` MEDIUMTEXT NOT NULL,
  `ad_file_link` MEDIUMTEXT NOT NULL,
  `verification_code` VARCHAR(100) NOT NULL,
  `date_created` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`ad_id`),
  UNIQUE INDEX `ad_id_UNIQUE` (`ad_id` ASC) VISIBLE);


DROP TABLE IF EXISTS `user_code`;
CREATE TABLE `millionpixelshomepage`.`user_code` (
  `c_id` INT NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(16) NOT NULL,
  PRIMARY KEY (`c_id`),
  UNIQUE INDEX `c_id_UNIQUE` (`c_id` ASC) VISIBLE,
  UNIQUE INDEX `code_UNIQUE` (`code` ASC) VISIBLE);

DROP TABLE IF EXISTS `available_squares`;
CREATE TABLE `millionpixelshomepage`.`available_squares` (
  `s_id` INT NOT NULL AUTO_INCREMENT,
  `squares` INT NOT NULL,
  PRIMARY KEY (`s_id`));
INSERT INTO millionpixelshomepage.available_squares(squares) VALUES(13200);



/*pythonanywhere.com*/
/* ------------------------------------------ */
DROP TABLE IF EXISTS ads;
CREATE TABLE ads (
  ad_id INT NOT NULL AUTO_INCREMENT,
  isPending INT NOT NULL,
  color VARCHAR(45) NOT NULL,
  coordinates_x INT NOT NULL,
  coordinates_y INT NOT NULL,
  image_width INT NOT NULL,
  image_height INT NOT NULL,
  num_of_squares INT NOT NULL,
  cost INT NOT NULL,
  full_name VARCHAR(45) NOT NULL,
  ad_name VARCHAR(100) NOT NULL,
  ad_email VARCHAR(50) NOT NULL,
  ad_hyperlink VARCHAR(80) NOT NULL,
  ad_file_name VARCHAR(255) NOT NULL,
  file_extension VARCHAR(5) NOT NULL,
  image_path MEDIUMTEXT NOT NULL,
  gif_path MEDIUMTEXT NOT NULL,
  thumbnail_path MEDIUMTEXT NOT NULL,
  ad_file_link MEDIUMTEXT NOT NULL,
  verification_code VARCHAR(100) NOT NULL,
  date_created VARCHAR(100) NOT NULL,
  PRIMARY KEY (ad_id),
  UNIQUE INDEX ad_id_UNIQUE (ad_id ASC));

DROP TABLE IF EXISTS user_code;
CREATE TABLE user_code (
  c_id INT NOT NULL AUTO_INCREMENT,
  code VARCHAR(16) NOT NULL,
  PRIMARY KEY (c_id),
  UNIQUE INDEX c_id_UNIQUE (c_id ASC),
  UNIQUE INDEX code_UNIQUE (code ASC));

DROP TABLE IF EXISTS available_squares;
CREATE TABLE available_squares ( s_id INT NOT NULL AUTO_INCREMENT, squares INT NOT NULL, PRIMARY KEY (s_id));
INSERT INTO available_squares(squares) VALUES(13200);
/* ------------------------------------------ */


/* Insert - ads */
INSERT INTO ads(isPending, color, coordinates_x, coordinates_y, image_width, image_height,
 num_of_squares, cost, full_name, ad_name, ad_email, ad_hyperlink, ad_file_name, file_extension,
 image_path, gif_path, thumbnail_path, ad_file_link) VALUES(0,'rgb(0,0,0)', 50, 50, 500, 500,
 25000, 500000, 'FULL NAME', 'AD NAME', 'EMAIL.EXAMPLE@GMAIL.COM', 'AD WEB-URL', 'AD FILE-NAME', '.gif', 'https://www.sdvsdvds.com/image_path.jpg', 'https://www.sdvsdvds.com/image_path.gif', 'https://www.sdvsdvds.com/thumbnail_path.jpg', 'ad_file_link'); 

/* Update - ads */
UPDATE ads SET ad_email = 'EMAIL.EXAMPLE-2@GMAIL.COM' WHERE ad_id == 2;
UPDATE ads SET isPending = 1 WHERE ad_id == 1;
UPDATE ads SET isPending = 0 WHERE ad_id == 2;

/* UPDATE ALL */
UPDATE ads SET isPending = 0;

/* Delete - ads */
DELETE FROM ads WHERE ad_id == 1;
DELETE FROM ads WHERE ad_id == 2;

/* Select from ads */
SELECT * FROM ads;

/* Insert - available_squares */
INSERT INTO available_squares(squares) VALUES(13200);

/* Update - available_squares */
UPDATE available_squares SET squares = 13200 WHERE s_id == 1;
UPDATE available_squares SET squares = 13200;
UPDATE available_squares SET squares = 11000;

/* Select all */
SELECT * FROM available_squares;
SELECT s_id, squares FROM available_squares;
SELECT * FROM available_squares WHERE s_id == 1;
