const person = {
    name: 'CameronClass',
    age: 24,
    gender: 'male',
    isMarried: true,
    sayHello: function() {
        console.log('Hello');
    }
}

function increaseAge(person) {
    newObject = {...person};
    newObject.age += 1;
    return newObject;
}

person2 = increaseAge(person);
console.log(person.age);
console.log(person2.age);
