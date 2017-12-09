# FlashcardX
Node.js REST API for a the flashcard based learning platform: FlashcardX
# Requirements:
*Unix based system(Linux or OSX)
*NODE v7
*MongoDB V3
*REDIS V4

# For running the project:
1) clone the project and standing on the /api directory run: sudo npm install
2) create a folder called: "flashcardx-keys" in your $HOME directory (run "$HOME" in the console to know where it is pointing)
3) inside the "flashcardx-keys folder" you gotta drop the keys for the cloud services, write us to: "contact@flashcardx.co" and we will send you those keys
4) start the databases: mongo with "sudo mongod" and redis with "redis-server"
5) in /api dir run the project with "node app.js"
