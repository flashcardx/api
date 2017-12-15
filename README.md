# FlashcardX
Node.js REST API for the flashcard based learning platform: FlashcardX
# Requirements:
<ul>
    
    Unix based system(Linux or OSX)
    NODE v8
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

## Contributing

We'd greatly appreciate any contribution you make :).
Please check out our [milestones](https://github.com/flashcardx/api/milestones) here we have all the future goals for the project, you can pick any issue that's not taken by somebody and assign it to yourself, or if you have new ideas create a new issue in the [nice to have milestone](https://github.com/flashcardx/api/milestone/3) 
Please make a pull request to the branch [develop](https://github.com/flashcardx/api/tree/develop). Every week we merge the develop branch with master.

# Slack group
https://flashcardx.slack.com

# Documentation
https://api.flashcardx.co/apidoc

## License

This project is licensed under the terms of the
[MIT license](https://github.com/flashcardx/api/blob/master/LICENSE).). With the exception of the trademark and logos(flashcardx) wich are property of [Pablo Nicolas Marino](https://github.com/pablonm3)
