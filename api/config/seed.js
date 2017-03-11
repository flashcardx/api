var bcrypt = require("bcryptjs");
const users=[  
    {
        email: "pablo-n-m@hotmail.com",
        name: "pablo",
        password:bcrypt.hashSync("1234", bcrypt.genSaltSync(10)),
        lang:"en"
    },
    {
        email: "pablonicolasm.pm@gmail.com",
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
         description:"its a beautiful animal",
         urls: ["https://images-na.ssl-images-amazon.com/images/G/01/img15/pet-products/small-tiles/23695_pets_vertical_store_dogs_small_tile_8._CB312176604_.jpg",
                 "http://cdn1-www.dogtime.com/assets/uploads/2011/01/file_23262_entlebucher-mountain-dog-460x290.jpg"]
    },
    {
        name:"cat",
        urls: []
    },
    {
        name:"hinge",
        description:"widely used in doors",
        urls: []
    }
];

module.exports = {
    users:users,
    cards:cards
};