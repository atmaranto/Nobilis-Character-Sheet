# Nobilis Character Sheet
 A character sheet for the game "Nobilis" that can be viewed in conventional browsers. It's specifically meant for a slightly altered version of 2e.
 
## To-Do
 - (Eventually) Make a more easily-configurable server system (and a more easily-configurable client-side API)
   * Partially fulfilled with the flexible ability to `require()` the main file in order to "add" the character sheet system to a modular server
 - Make a websocket-compliant update system for the Character Sheets. This will sync the character sheet's state across tabs.
   * As part of this, I could also add the ability to make character sheet updates (via the endpoint) more specific, with only the necessary attributes updated. However, I would need
     to combine this with the below in order to do so.
 - Change the character sheet specification to include the full breadth of what one can do with a character sheet, meaning it will be stored in MongoDB as
   an object rather than as a string. This should make it easier to search for character sheets by their attributes.
   * Additionally, I should restructure the CharacterSheet to be a subitem of Account so that they can be querried together more easily (and more atomically)
 - (*Maybe* eventually, but this is beyond the scope of the current project) Make the character sheet server shardable, so that I can host it across several servers on a
   reasonable payment model.
 
## Changes from Standard 2E
  - Rather than granting a MP, limits grant a CP. I thought this would add a bit of flexibility. I might regret it.
  - I incorporated the Estate Properties feature, which I believe is only found in 3e. It seemed nice.

# To Run
 The character sheet itself will work with any compatible server backend (although it may require a bit of effort to set up a compatible endpoint), with saving and loading mechanisms
 in the first and last sections of `sheet.js` respectively. The packaged server system is based on Node, ExpressJS, and Mongoose. To install and run it, follow these steps:
 
### A Warning
 The default server interface is *ridiculously* basic.
 Sheets are public by default, hidden only by their UUID (which doesn't mean much since all requests go over http). TL;DR, the server is *not* a secure system by
 any means, and if you want to host this for anything more than a few friends on a hard-to-guess IP address and port, you should probably create your own server system and use the
 character sheet as you will.
 
 With regards to the character sheet itself, I am *not* a professional designer. I haphazardly copied old UI libraries from one of my defunct projects to help create a slightly better
 UI.
 
## Step 1: Configuration
 Create a configuration file in the main directory called `config.key`. Populate it with the following values:
 ```json
 {
	"PORT": 80,
	"CONNECT_STRING": "your MongoDB connect string",
	"MAX_READ_SIZE": 33554432,
	"MAX_PW_LENGTH": 72,
	"MIN_PW_LENGTH": 6,
	"MAX_NAME_LENGTH": 128,
	"KEYGEN_ITERATIONS": 20000,
	"SESSION_LENGTH": 30758400000,
	"SESSION_KEY_LENGTH": 40,
	"ACCOUNT_CREATION_DISABLED": false,
	"ENABLE_ANONYMOUS_SHEET_CREATION": false
 }
```

## Step 2: Installation
 You'll need to install [NodeJS](https://nodejs.org/en/download/) and the Node Package Manager (comes with most installations of Node). Any version that supports `crypto.randomUUID` should
 be fine; if you get errors while trying to create character sheets, try updating.
 
 When this is installed, you'll need to make sure `express` and `mongoose` are installed through NPM. Navigate to the root directory of the git repository and run:
 ```bash
 npm install
 ```
 
 Assuming everything worked, you should have everything you need to run the server.

## Step 3: Run it
 Just type:
 ```bash
 node index.js
 ```
 And the server will start up. You can then navigate to `http://localhost:port/` and see the fruits of your labor: an error screen. This is because you haven't created a sheet. To do so,
 run:
 ```bash
 node new_sheet.js
 ```
 in a separate window (optionally with the server IP and the port you specified). If the connection succeeded, the simple `new_sheet.js` script should return a UUID in the form
 "AAAAAAAA-BBBB-CCCC-DDDD-EEEEEEEEEEEE". Once you have this, navigate to http://localhost:<port>/?id=AAAAAAAA-BBBB-CCCC-DDDD-EEEEEEEEEEEE. Finally, you have your sheet! The settings don't
 (currently) work, but saving and loading does. You can now also create a sheet at http://localhost/manager.html, which allows one to create an account and log in through a very basic
 interface.

# License
 Most files I created (models/\*, index.js, new_sheet.js, new_sheet.py, and everything under webroot except data.js and images/\*) are licensed under the MIT License:
 
 ```
MIT License

Copyright (c) 2022 Anthony Maranto

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
 ```
 
 I do not hold the copyright for many of the strings in data.js; rather, they are used with permission from Jenna Katerin Moran.
 The SVG files in webroot/images are licensed as described in the acknowledgements below.

# Acknowledgements
 This project uses NodeJS ([MIT license here](https://raw.githubusercontent.com/nodejs/node/master/LICENSE)), expressjs ([MIT license here](https://github.com/expressjs/express/blob/master/LICENSE)),
 mongoose (I don't have a link, but also the MIT license as above), and JQuery (also the [MIT license](https://tldrlegal.com/license/mit-license)). Finally, the icons in the `images` directory are
 from [Material.io](https://material.io/resources), licensed under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0.html).
 This game also contains snippets of text and paraphrasing from [*Nobilis: The Game of Soverign Powers*](https://www.drivethrurpg.com/product/141424/Nobilis-the-Game-of-Sovereign-Powers-2002-Edition)
 by Jenna Katerin Moran, 2002/Hogshead edition. Used with permission.