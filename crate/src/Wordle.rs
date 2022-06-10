use crate::{Naive::NaiveGuesser, WORDS};

use super::{Guess, WORDLE_SIZE};
use wasm_bindgen::prelude::*;
pub type ByteStr = [u8; 5];

#[wasm_bindgen]
pub struct Wordle {
    guesser: NaiveGuesser,
    history: Vec<Guess>,
    answer: ByteStr,
    words: Vec<ByteStr>,
}

#[wasm_bindgen]
impl Wordle {
    pub fn new() -> Self {
        Wordle {
            guesser: NaiveGuesser::new(),
            history: Vec::new(),
            answer: *b"hello",
            words: WORDS.split_whitespace().map(str5).collect(),
        }
    }

    fn available_words(&self) -> Vec<ByteStr> {
        filter_with(&self.words, &self.history)
    }

    pub fn simulate(&mut self, answer: &str) -> usize {
        let answer = str5(answer);
        self.history = Vec::new();
        for i in 0..=16 {
            let guess = self.guesser.guess(&self.available_words());
            if guess == answer {
                self.reset();
                return i;
            }
            let correcness = Correctness::check(&answer, &guess);
            self.history.push(Guess {
                mask: correcness,
                word: guess,
            })
        }
        self.reset();
        panic!("Max guesses reached");
    }

    pub fn play(&mut self, guess_word: &str) -> JsValue {
        let guess_word = str5(guess_word);
        let correcness = Correctness::check(&self.answer, &guess_word);
        let guess = Guess {
            mask: correcness.clone(),
            word: guess_word,
        };
        let information_gain = self
            .guesser
            .guess_information(&self.available_words(), &guess);
        self.history.push(guess);
        let mask: Vec<u32> = correcness.iter().map(|value| *value as u32).collect();
        JsValue::from_serde(&(mask, information_gain)).unwrap()
    }

    pub fn reset(&mut self) {
        *self = Wordle::new();
    }

    pub fn set_ans(&mut self, answer: &str) {
        self.answer = str5(answer);
    }

    pub fn calc_best_guesses(&self) -> JsValue {
        let guesses = self.guesser.calc_best_guesses(&self.available_words());
        JsValue::from_serde(&guesses).unwrap()
    }

    pub fn distribution_of(&self, guess: &str) -> Vec<usize> {
        let valid_words = &filter_with(&self.words, &self.history);
        Guess::calc_distribution(valid_words, &str5(guess)).into()
    }

    pub fn entropy_of(&self, word: &str) -> f64 {
        self.guesser
            .entropy_of(&str5(word), &self.available_words())
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
pub enum Correctness {
    Wrong = 0,
    Misplaced = 1,
    Correct = 2,
}

impl Correctness {
    pub fn check(answer: &ByteStr, guess: &ByteStr) -> [Self; WORDLE_SIZE] {
        let mut mask = [Correctness::Wrong; WORDLE_SIZE];
        guess.iter().enumerate().for_each(|(index, c)| {
            mask[index] = check_word((*c, index), answer);
        });
        mask
    }

    pub fn mask_radix(mask: &[Correctness; WORDLE_SIZE]) -> usize {
        mask.iter().enumerate().fold(0, |acc, (index, value)| {
            acc + *value as usize * 3usize.pow(index as u32)
        })
    }
}

fn check_word((c, index): (u8, usize), answer: &[u8; WORDLE_SIZE]) -> Correctness {
    match answer.get(index) {
        Some(&index_char) if index_char == c => Correctness::Correct,
        _ if answer.contains(&c) => Correctness::Misplaced,
        _ => Correctness::Wrong,
    }
}

pub fn filter_with<'a>(all_words: &[ByteStr], history: &[Guess]) -> Vec<ByteStr> {
    all_words
        .iter()
        .filter(|&&word| {
            history
                .iter()
                .all(|guess| guess.matches(&word) && guess.word != word)
        })
        .map(|&str| str)
        .collect()
}

pub fn str5(val: &str) -> ByteStr {
    val.as_bytes().try_into().unwrap()
}

#[cfg(test)]
mod test {}
