var bcrypt = require("bcryptjs");

//THIS DATA SHOULD NEVER BE DELETED FRON DATABASE, EVERY NEW USER DUPLICATES WELCOME CARD FROM THE USER BELOW
const users=[  
    {
        email: "pablo1-n-m@hotmail.com",
        name: "pablo",
        password:bcrypt.hashSync("1234", bcrypt.genSaltSync(10)),
        lang:"en"
    }
];
const cards=[
          {
                    name: "Welcome!",
                    description:"We are pleased you are here, hope you enjoy our tool, here are some tips worth to remember: <br/>"+
                                "Your profile is linked with the languaje you choose when you signed up, you can change it in settings.<br/>"+
                                "If you will create cards in other languaje than the one you have selected, please change this setting, otherwise other people could receive non relevant card recommendations.<br/>"+
                                "Feel free to ask us anything, write us to: contact@flashcard-x.com",
                    imgs: [
                    {
                        url:"https://cdn.pixabay.com/photo/2016/11/21/15/38/dock-1846008_640.jpg?attachment",
                        width: 640,
                        height: 400
                    }],
                    isDuplicated: true
                 }
];

module.exports = {
    users:users,
    cards:cards
};