var holders = require('./holders.json');
var fs = require('fs');

if (holders.length % 2 !== 0) {
    alert("You must have an even number of names. You currently have " + holders.length + " names.");
} else {
    var arr1 = holders.slice(), 
        arr2 = holders.slice(); 

    arr1.sort(function() { return 0.5 - Math.random();}); // shuffle arrays
    arr2.sort(function() { return 0.5 - Math.random();});
	let output = [];
    while (arr1.length) {
        var holder1 = arr1.pop(), // get the last value of arr1
            holder2 = arr2[0] === holder1 ? arr2.pop() : arr2.shift();
            //        ^^ if the first value is the same as name1, 
            //           get the last value, otherwise get the first
		output.push({
			matchA: holder1.owner_wallet,
			matchB: holder2.owner_wallet
		})
        console.log(holder1.owner_wallet + ' gets ' + holder2.owner_wallet);
    }
	console.log(output);
	fs.writeFile('matched.json',JSON.stringify(output),'utf-8',((err,data)=>{console.log('done')}));
}