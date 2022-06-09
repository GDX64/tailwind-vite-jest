use crate::{Naive::NaiveGuesser, WORDS};

use super::{Guess, WORDLE_SIZE};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct Wordle {
    guesser: NaiveGuesser,
    history: Vec<Guess>,
    answer: String,
    words: Vec<&'static str>,
}

#[wasm_bindgen]
impl Wordle {
    pub fn new() -> Self {
        Wordle {
            guesser: NaiveGuesser::new(),
            history: Vec::new(),
            answer: "hello".to_string(),
            words: WORDS.split_whitespace().collect(),
        }
    }

    fn available_words(&self) -> Vec<&str> {
        filter_with(&self.words, &self.history)
    }

    pub fn simulate(&mut self, answer: &str) -> usize {
        self.history = Vec::new();
        for i in 0..=16 {
            let guess = self.guesser.guess(&self.available_words());
            if guess == answer {
                self.reset();
                return i;
            }
            let correcness = Correctness::check(answer, &guess);
            self.history.push(Guess {
                mask: correcness,
                word: guess,
            })
        }
        self.reset();
        panic!("Max guesses reached");
    }

    pub fn play(&mut self, guess_word: &str) -> JsValue {
        let correcness = Correctness::check(&self.answer, &guess_word);
        let guess = Guess {
            mask: correcness.clone(),
            word: guess_word.to_string(),
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
        self.answer = answer.to_string();
    }

    pub fn calc_best_guesses(&self) -> JsValue {
        let guesses = self.guesser.calc_best_guesses(&self.available_words());
        JsValue::from_serde(&guesses).unwrap()
    }

    pub fn distribution_of(&self, guess: &str) -> Vec<usize> {
        let valid_words = &filter_with(&self.words, &self.history);
        Guess::calc_distribution(valid_words, guess).into()
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
pub enum Correctness {
    Wrong = 0,
    Misplaced = 1,
    Correct = 2,
}

impl Correctness {
    pub fn check(answer: &str, guess: &str) -> [Self; WORDLE_SIZE] {
        let answer_letters = answer.as_bytes().try_into().unwrap();
        let mut mask = [Correctness::Wrong; WORDLE_SIZE];
        guess.bytes().enumerate().for_each(|(index, c)| {
            mask[index] = check_word((c, index), &answer_letters);
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

pub fn filter_with<'a>(all_words: &[&'a str], history: &[Guess]) -> Vec<&'a str> {
    all_words
        .iter()
        .filter(|&&word| {
            history
                .iter()
                .all(|guess| guess.matches(word) && guess.word != word)
        })
        .map(|&str| str)
        .collect()
}

#[cfg(test)]
mod test {
    use crate::Correctness::{Correct, Misplaced, Wrong};
    use crate::{Correctness, WORDLE_SIZE};

    #[test]
    fn check_word() {
        assert_eq!([Correct; WORDLE_SIZE], Correctness::check("hello", "hello"));

        assert_eq!(
            [Wrong, Misplaced, Misplaced, Wrong, Correct],
            Correctness::check("hello", "thero")
        )
    }
}
