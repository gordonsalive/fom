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
**
** fetch API reference from (https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch):
const data = { username: 'example' };
*/

// TODO: jump to next input in attempt when they type a letter
// TODO: better styling

const attempts = document.querySelectorAll('.attempt');
const allLetters = document.querySelectorAll('.letter');
const notifications = document.querySelector('.notifications');
const resetButton = document.querySelector('.reset_button');

const cache = {};

const resetCache = (cache) => {
    let attemptCount = 0;
    let todaysWord;

    const fetchTodaysWord = async () => {
        // const resp = await Promise.resolve({
        //     "word": "yells",
        //     // "word": "cater",
        //     "puzzleNumber": 267
        // });
        try {
            const response = await fetch('https://words.dev-apis.com/word-of-the-day'); // simple GET fetch
            const data = await response.json();
            todaysWord = data.word.toUpperCase();
            return todaysWord;
        } catch (e) {
            throw 'error fetching word of the day. ' + e;
        }
    };

    cache.isTodaysWord = async (word) => {
        if (!todaysWord) {
            await fetchTodaysWord();
        }
        return (word === todaysWord);
    }
    cache.todaysWord = async () => {
        if (!todaysWord) {
            await fetchTodaysWord();
        }
        return todaysWord;
    };

    cache.isValidWord = async (word) => {
        const fetchValidateWord = async (word) => {
            // return Promise.resolve({
            //     "word": "crane",
            //     "validWord": true
            // });
            try {
                const response = await fetch('https://words.dev-apis.com/validate-word', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({word: word})
                });
                return await response.json();
            } catch (e) {
                throw 'error fetching if word is valid. ' + e;
            }
        };

        const resp = await fetchValidateWord(word);
        return resp.validWord;
    };

    cache.incrementAttemptCount = () => attemptCount++;
    cache.attemptCount = () => attemptCount;
};

resetCache(cache);

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

const colourAttempt = (guess, todaysWord, attempt) => {
    const todaysWordArray = Array.from(todaysWord).map((letter) => { return { letter, found: false } });
    const markLetterFound = (guessLetterindex, todaysWordIndex, color) => {
        if (!["green", "yellow"].includes(color)) {
            throw 'unexpected color for found letter matching';
        }
        guess[guessLetterindex].colour = color;
        todaysWordArray[todaysWordIndex].found = true;
    }
    // find exact matches first
    guess.forEach((guessLetter, index) => {
        // if the letter match, update the colour to green and mark the letter as found
        if (guessLetter.letter === todaysWordArray[index].letter) {
            markLetterFound(index, index, "green");
        }
    });
    // find any non-exact matches
    guess.forEach((guessLetter, i) => {
        const gl = guessLetter.letter;
        // skip greens
        if (guessLetter.colour !== "green") {
            // if this letter in todays word and not found?
            const isThere = todaysWordArray.some((wordLetter) => (gl === wordLetter.letter) && (wordLetter.found === false));
            if (isThere) {
                // find the first match and mark as yellow and found
                todaysWordArray.every((wordLetter, j) => {
                    const wl = wordLetter.letter;
                    if ((gl === wl) && (wordLetter.found === false)) {
                        markLetterFound(i, j, "yellow");
                        return false; // stop iterating through array
                    } else {
                        return true;
                    }
                });
            }
        }
    });
    // colour the elements
    Array.from(attempt.children).forEach((elem, idx) => elem.style.backgroundColor = guess[idx].colour);
}

const letterChangeHandler = async (event) => {
    const disableAttempt = (attempt) => Array.from(attempt.children).forEach((childInput) => childInput.disabled = true);
    const disableAllAttempts = (attempts) => {
        Array.from(attempts).forEach((attempt) => disableAttempt(attempt));
        resetButton.hidden = false;
    };
    const allGreen = (attempt) => Array.from(attempt.children).forEach((elem) => elem.style.backgroundColor = "green")

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
        const isValidWord = await cache.isValidWord(guessWord);
        if (!isValidWord) {
            notifications.innerText = 'That is not a valid word - keep trying.';
            return;
        };
        // is it a wrong guess?
        const isTodaysWord = await cache.isTodaysWord(guessWord);
        if (!isTodaysWord) {
            cache.incrementAttemptCount();
            if (cache.attemptCount() === 6) {
                notifications.innerText = `That guess is incorrect - sorry, you are out of goes! The word was ${await cache.todaysWord()}`;
                disableAllAttempts(attempts);
            } else {
                notifications.innerText = `That guess is incorrect - keep trying!`;
            }
            // disable all the input fields in this row!
            disableAttempt(attempt);
            colourAttempt(guess, await cache.todaysWord(), attempt);
            return;
        }
        // they got it!
        const goWord = cache.attemptCount() ? 'goes' : 'go';
        notifications.innerText = `Well done, you got it right in ${cache.attemptCount() + 1} ${goWord}!`;
        // diable all fields and play with colouring
        allGreen(attempt);
        disableAllAttempts(attempts);
    }
}

const resetPage = () => {
    Array.from(attempts).forEach(
        (attempt) => Array.from(attempt.children).forEach(
            (childInput) => {
                childInput.disabled = false;
                childInput.style.backgroundColor = "";
                childInput.value = "";
            }));
    notifications.innerText = "Can you guess the 5 letter word?";
    resetButton.hidden = true;
    resetCache(cache);
};

allLetters.forEach((letter) => letter.onchange = letterChangeHandler);
allLetters.forEach((letter) => letter.onkeydown = letterKeyDownHandler);
resetButton.onclick = () => resetPage();

