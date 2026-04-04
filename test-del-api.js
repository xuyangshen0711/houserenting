const id = "484 2nd st"; // This is slug usually, but the screenshot has it. Let's see all listings.
fetch('http://localhost:3000/api/listings')
.then(r => r.json())
.then(d => console.log(d))
