var bcrypt = require("bcryptjs");
const users=[  
    {
        email: "pablo1-n-m@hotmail.com",
        name: "pablo",
        password:bcrypt.hashSync("1234", bcrypt.genSaltSync(10)),
        lang:"en"
    },
    {
        email: "pablonicolasm1.pm@gmail.com",
        name: "agustina",
        password:bcrypt.hashSync("1111", bcrypt.genSaltSync(10)),
        lang:"en"
    },
     {
        email: "anto-marino@hotmail.com",
        name: "antonella",
        password:bcrypt.hashSync("1121", bcrypt.genSaltSync(10)),
        lang:"es"
    }
];
const cards=[
    {
         name: "dog",
         description:"its a beautiful animal"
     },
    {
        name:"cat"
    },
    {
        name:"hinge",
        description:"widely used in doors"
    }
];

module.exports = {
    users:users,
    cards:cards
};