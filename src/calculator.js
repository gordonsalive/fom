const screen = document.querySelector('.screen');
// methods to get and update screen numbers, and hold last number and operator during calculations
let lastNumber = 0;
let currentOperator = '';
let lastKeyWasEqualsToggle = false;
let lastKeyWasEqualsToggleNumber = 0;
const screenText = () => screen.innerText;
const updateScreenText = (newText) => screen.innerText = newText;
// main method to handle key press
const handleKeyPress = (key) => {
    const operators = ['+', '-', '*', '/'];
    const numberKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    if (numberKeys.includes(key)) {
        // just add number to end of screen number
        updateScreenText(screenText() + key);
    } else if (key === '←') {
        // just add number to end of screen number
        updateScreenText(screenText().slice(0, -1));
    } else if (key === 'C') {
        updateScreenText('');
    } else if (key === '=') {
        // if the user presses = consecutive times then we reverse the operands, taking what is on the screen and using the number we kept aside for this situation
        const thisNumber = (lastKeyWasEqualsToggle) ? lastKeyWasEqualsToggleNumber : Number.parseInt(screenText());
        if (!lastKeyWasEqualsToggle) {
            lastKeyWasEqualsToggleNumber =  thisNumber
        }
        switch (currentOperator) {
            case '+' : updateScreenText(lastNumber + thisNumber); break;
            case '-' : updateScreenText(lastNumber - thisNumber); break;
            case '*' : updateScreenText(lastNumber * thisNumber); break;
            case '/' : updateScreenText(lastNumber / thisNumber); break;
            case '' : /* do thoing, no operator selected yet */ break;
            default: throw 'unexpecter operator!';
        } 
        lastNumber = Number.parseInt(screenText());
    } else if (operators.includes(key)) {
        currentOperator = key;
        lastNumber = Number.parseInt(screenText());
        updateScreenText('');
    }
    // handle the toggle that allows the user to keep pressing equals
    lastKeyWasEqualsToggle = (key === '=');
}
// add key press handling to all keys
const keys = document.querySelectorAll(".key");
keys.forEach(key => key.onclick = () => handleKeyPress(key.innerText));