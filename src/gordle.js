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
const someobject = {
    property1: 'heel',
    property2: 'er'
};

const letterChangeHangler = (event) => {
    console.log('on change');
    // are all the letters of this attempt filled in?
    const attempt = event.target.parentNode;
    const letters = Array.from(attempt.children).map(letter => letter.value);
    const attemptComplete = letters.every((letter) => letter !== '');
    if (attemptComplete) {
        console.log('attemptComplete');
        const guess = letters.map((letter) => {return {letter, colour: 'grey'}});
        console.log('guess', guess);
    }
}

allLetters.forEach((letter) => letter.onchange = letterChangeHangler);


