var bcrypt = require("bcryptjs");

//THIS DATA SHOULD NEVER BE DELETED FRON DATABASE, EVERY NEW USER DUPLICATES WELCOME CARD FROM THE USER BELOW
const users=[  
    {
        email: "pablo1-n-m@hotmail.com",
        name: "pablo1",
        password:bcrypt.hashSync("0022884836", bcrypt.genSaltSync(10)),
        lang:"en"
    },
    {
        email: "pablo2-n-m@hotmail.com",
        name: "pablo2",
        password:bcrypt.hashSync("0022884836", bcrypt.genSaltSync(10)),
        lang:"en"
    },
    {
        email: "pablo3-n-m@hotmail.com",
        name: "pablo3",
        password:bcrypt.hashSync("0022884836", bcrypt.genSaltSync(10)),
        lang:"en"
    }
];
const cards=[
          {
                    name: "Readme!",
                    description:"Welcome! we are pleased you are here, hope you enjoy our tool!Remember: <br/>"+
                                "Everything in your profile is linked with the language set in your profile(English is set by default), you can change it in settings.<br/>"+
                                "If you will create cards in other language than the one you have selected, please change this setting,it will affect your recommendations and some services that need to know wich language you are using(the language setting does not change the language of the webpage).<br/>"+
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