/**
 * @return {Function}
 */
var createHelloWorld = function() {
    
    return ()=> {
        return "Hello World"
    }
};

const f = createHelloWorld();
console.log(f()); // "Hello World"
