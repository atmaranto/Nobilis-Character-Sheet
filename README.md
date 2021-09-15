# Nobilis Character Sheet
 A character sheet for the game "Nobilis" that can be viewed in conventional browsers. It's specifically meant for a slightly altered version of 2e.
 
 ## Changes from Standard 2E
  - Rather than granting a MP, limits grant a CP. I thought this would add a bit of flexibility. I might regret it.
  - I incorporated the Estate Properties feature, which I believe is only found in 3e. It seemed nice.

# To Run
 The character sheet itself will work with any compatible server backend, with saving and loading mechanisms described in the first and last sections of `sheet.js` respectively. The
 packaged server system is based on Node, ExpressJS, and Mongoose. To install and run it, follow these steps:
 
### A Warning
 The default server interface is *ridiculously* basic. It doesn't even have a UI-based method to create or delete character sheets, or any method for sheet deletion at all beyond
 manually editing server values. Sheets are public, hidden only by their UUID (which doesn't mean much since all requests go over http). TL;DR, the server is *not* a secure system by
 any means, and if you want to host this for anything more than a few friends on a hard-to-guess IP address and port, you should probably create your own server system and use the
 character sheet as you will.
 
 With regards to the character sheet itself, I am *not* a professional designer. I haphazardly copied old UI libraries from one of my defunct projects to help create a slightly better
 UI.
 
## Step 1: Configuration
 Create a configuration file in the main directory called `config.key`. Populate it with the following values:
 ```json
 {
	"PORT": <80 or your preferred port>,
	"CONNECT_STRING": <your MongoDB connect string>,
	"MAX_READ_SIZE": <33554432 or another number but not really used>
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
 And the server will start up. You can then navigate to `http://localhost:<port>/` and see the fruits of your labor: an error screen. This is because you haven't created a sheet. To do so,
 run:
 ```bash
 node new_sheet.js
 ```
 in a separate window (optionally with the server IP and the port you specified). If the connection succeeded, the simple `new_sheet.js` script should return a UUID in the form
 "AAAAAAAA-BBBB-CCCC-DDDD-EEEEEEEEEEEE". Once you have this, navigate to http://localhost:<port>/?id=AAAAAAAA-BBBB-CCCC-DDDD-EEEEEEEEEEEE. Finally, you have your sheet! The settings don't
 (currently) work, but saving and loading does.

# Acknowledgements
 This project uses NodeJS ([MIT license here](https://raw.githubusercontent.com/nodejs/node/master/LICENSE)), expressjs ([MIT license here](https://github.com/expressjs/express/blob/master/LICENSE)),
 mongoose (I don't have a link, but also the MIT license as above), and JQuery (also the [MIT license](https://tldrlegal.com/license/mit-license)).
 This game also contains snippets of text and paraphrasing from [*Nobilis: The Game of Soverign Powers*](https://www.drivethrurpg.com/product/141424/Nobilis-the-Game-of-Sovereign-Powers-2002-Edition)
 by Jenna Katerin Moran, 2002/Hogshead edition. It is my hope that this inclusion (which I did only to try to make the character sheet easier to understand) constitutes "Fair Use". If you are the
 copyright holder for this work, please send me a message on GitHub, and when I verify your identity, I'll remove the sheet immediately. I only put this on the web because I thought it might lower
 the barrier of entry for playing Nobilis.