//handles name change as you type

const nameChange = document.getElementById("name-change");
const inputHandler = function(e) {
    sessionStorage.setItem('name', e.target.value);
    console.log(sessionStorage.getItem('name'));
}

nameChange.addEventListener('input', inputHandler);
nameChange.addEventListener('propertychange', inputHandler);


//propagates the drop-down
const dropDown = 