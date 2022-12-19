/*
** GORDLE - a code implementaiton of a well known commonly culturally referred word puzzle game
** 
** - when use changes a letter if all letter or row are filled in
**   > is it a word - if not reject with a reason, attempt remains open
**   > if yes, close attempt and colour letters
**   > if all green, congratulations!  close all attempts.
**   > if no, position user on the next attempt
**   > if no more attempts, commisserations and show them the word
**   > closed attempt should have all letters disabled for input
** - colouring letters:
**   > if we don't know the word, fetch it
**   > disect word into letters
**   > for each letter in attempt:
**     o is it in word (and not matched already)? - colour accordingly
**     o order of precedence exact match, then from start
**     * attempt: [{letter, colour}], word: [{letter, matched}]
**
** Useful API: github.com/toddmotto/public-apis
**             https://words.dev-apis.com/word-of-the-day
**             https://words.dev-apis.com/validate-word
*/
console.log('hello');

const attempts = document.querySelectorAll('.attempt');
const allLetters = document.querySelectorAll('.letter');
const notifications = document.querySelector('.notifications');

let todaysWord;  // once we get todays word, we will cache it here
let attemptCount = 0;

const isTodaysWord = (word) => {
    const fetchTodaysWord = () => {
        return responseJson = {
            "word": "cater",
            "puzzleNumber": 267
        };
    };

    if (!todaysWord) {
        todaysWord = fetchTodaysWord().word.toUpperCase();
    }
    return (word.toUpperCase() === todaysWord.toUpperCase());
}

const isValidWord = (word) => {
    const fetchValidateWord = (word) => {
        return responseJson = {
            "word": "crane",
            "validWord": true
        };
    };

    return fetchValidateWord(word).validWord;
};

const letterKeyDownHandler = (event) => {
    // handle letters being typed
    const isLetter = (letter) => /^[a-zA-Z]$/.test(letter);
    // allowing special navigation chars
    const key = event.which || event.keyCode;
    if ((key === 8) // backspace
        || (key === 9) // tab
        || (key === 46) // delete
        || (key >= 35 && key <= 40) // end, home, arrows
    ) {
        return;
    }
    // otherwise only allow letters
    if (!isLetter(event.key)) {
        event.preventDefault();
    }
}

const allGreen = (attempt) => {
    Array.from(attempt.children).forEach((elem) => elem.style.backgroundColor = "green");
}

const colourAttempt = (guess, todaysWord, attempt) => {
    const todaysWordArray = Array.from(todaysWord).map((letter) => { return { letter, found: false } });
    // find exact matches first
    guess.forEach((guessLetter, index) => {
        // if the letter match, update the colour to green and mark the letter as found
        if (guessLetter.letter === todaysWordArray[index].letter) {
            guess[index].colour = "green";
            todaysWordArray[index].found = true;
        }
    });
    // find any non-exact matches
    guess.forEach((guessLetter, i) => {
        // skip greens
        if (guessLetter.colour !== "green") {
            // if this letter in todays word and not found?
            const isThere = todaysWordArray.some((wordLetter) => (guessLetter.letter === wordLetter.letter) && (wordLetter.found === false));
            if (isThere) {
                // find the first match and mark as yellow and found
                todaysWordArray.forEach((wordLetter, j) => {
                    if ((guessLetter.letter === wordLetter.letter) && (wordLetter.found === false)) {
                        guess[i].colour = "yellow";
                        todaysWordArray[j].found = true;
                    }
                })
            }
        }
    });
    // colour the elements
    Array.from(attempt.children).forEach((elem, idx) => elem.style.backgroundColor = guess[idx].colour);
}

const letterChangeHandler = (event) => {
    const disableAttempt = (attempt) => Array.from(attempt.children).forEach((childInput) => childInput.disabled = true);
    const disableAllAttempts = (attempts) => Array.from(attempts).forEach((attempt) => disableAttempt(attempt));

    // trim the current letter if it is too long!  And ensure it is upper case!
    const thisLetter = event.target.value.toUpperCase();
    event.target.value = thisLetter
    if (thisLetter.trim().length !== 1) {
        event.target.value = thisLetter.trim().slice(thisLetter.length - 1);
        if (thisLetter.length !== 1) {
            return;
        }
    }
    // are all the letters of this attempt filled in?
    const attempt = event.target.parentNode;
    const letters = Array.from(attempt.children).map(letter => letter.value);
    const attemptComplete = letters.every((letter) => letter !== '');
    if (attemptComplete) {
        const guess = letters.map((letter) => { return { letter, colour: 'grey' } });
        const guessWord = guess.map((letter) => letter.letter).join('');
        // is it a valid word?
        if (!isValidWord(guessWord)) {
            notifications.innerText = 'That is not a valid word - keep trying.';
            return;
        };
        // is it a wrong guess?
        if (!isTodaysWord(guessWord)) {
            attemptCount++;
            if (attemptCount === 6) {
                notifications.innerText = `That guess is incorrect - sorry, you are out of goes! The word was ${todaysWord}`;
            } else {
                notifications.innerText = `That guess is incorrect - keep trying!`;
            }
            // disable all the input fields in this row!
            disableAttempt(attempt);
            colourAttempt(guess, todaysWord, attempt);
            return;
        }
        // they got it!
        const goWord = (attemptCount) ? 'goes' : 'go';
        notifications.innerText = `Well done, you got it right in ${attemptCount +1} ${goWord}!`;
        // diable all fields and play with colouring
        allGreen(attempt);
        disableAllAttempts(attempts);
    }
}

allLetters.forEach((letter) => letter.onchange = letterChangeHandler);
allLetters.forEach((letter) => letter.onkeydown = letterKeyDownHandler);


