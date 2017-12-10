# FlashcardX
Node.js REST API for the flashcard based learning platform: FlashcardX
# Requirements:
<ul>
    
    Unix based system(Linux or OSX)
    NODE v7
    MongoDB V3
    REDIS V4 
</ul>


# For running the project:
1) clone the project and standing on the /api directory run: `sudo npm install`
2) create a folder called: "flashcardx-keys" in your $HOME directory (run `$HOME` in the console to know where it is pointing to)
3) inside the "flashcardx-keys folder" you gotta drop the keys for the cloud services, write us to: "contact@flashcardx.co" and we will send you those keys  
4) start the databases: mongo with `sudo mongod` and redis with `redis-server`  
5) Create the user for mongodb with the commands:  
            <ul>
            a) Open the mongo console by running: `mongo`  
            b) Run `db.createUser({user:"pablo", pwd:"1234", roles:[{role:"root", db:"admin"}]})`  
            </ul>
6) in /api dir run the project with `node app.js`



# Slack group
https://flashcardx.slack.com

# API endpoints documentation
https://api.flashcardx.co/apidoc
