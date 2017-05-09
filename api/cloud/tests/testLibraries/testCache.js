const cache = require("memory-cache"); 

var bar={
    name:"pablo",
    adress:"leones"
}

cache.put('foo', bar, 100000000000);
console.log(cache.get('foo'));