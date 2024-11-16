use super::{Guess, WORDLE_SIZE};
use super::{Naive, WORDS};
use std::collections::HashSet;
use wasm_bindgen::prelude::*;
pub type ByteStr = [u8; 5];
use super::super::random;

#[wasm_bindgen]
pub struct Wordle {
    history: Vec<Guess>,
    answer: ByteStr,
    words: Vec<ByteStr>,
}

#[wasm_bindgen]
impl Wordle {
    pub fn new(words: Option<String>, answer: &str) -> Self {
        let mut wordle = Wordle {
            history: Vec::new(),
            answer: str5(answer),
            words: words
                .unwrap_or(WORDS.to_string())
                .split_whitespace()
                .map(str5)
                .collect(),
        };
        if !wordle.words.contains(&wordle.answer) {
            wordle.words.push(wordle.answer)
        }
        wordle
    }

    fn available_words(&self) -> Vec<ByteStr> {
        filter_with(&self.words, &self.history)
    }

    pub fn simulate(&mut self, answer: &str) -> usize {
        let answer = str5(answer);
        self.history = Vec::new();
        for i in 0..=16 {
            let guess = Naive::guess(&self.available_words());
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
        let information_gain = Naive::guess_information(&self.available_words(), &guess);
        self.history.push(guess);
        let mask: Vec<u32> = correcness.iter().map(|value| *value as u32).collect();
        JsValue::from_serde(&(mask, information_gain))
            .expect("could not turn the result into a js value")
    }

    pub fn reset(&mut self) {
        *self = Wordle::new(None, "hello");
    }

    pub fn calc_best_guesses(&self) -> JsValue {
        let words = self.available_words();
        let random_words: Vec<_> = (0..500)
            .filter_map(|_| get_random_word(&words))
            .collect::<HashSet<_>>()
            .into_iter()
            .collect();
        let guesses: Vec<_> = Naive::calc_best_guesses(&words, &random_words)
            .into_iter()
            .map(|(v, score)| {
                let string = String::from_utf8(v.to_vec()).expect("could not decode utf8 string");
                (string, score)
            })
            .collect();
        JsValue::from_serde(&guesses).expect("could not turn guess into js value")
    }

    pub fn distribution_of(&self, guess: &str) -> Vec<usize> {
        let valid_words = &filter_with(&self.words, &self.history);
        Guess::calc_distribution(valid_words, &str5(guess)).into()
    }

    pub fn entropy_of(&self, word: &str) -> f64 {
        Naive::entropy_of(&str5(word), &self.available_words())
    }
}

fn get_random_word(words: &[ByteStr]) -> Option<ByteStr> {
    let index = (words.len() as f64 * random()).round() as usize;
    words.get(index).map(|str| *str)
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
pub enum Correctness {
    Wrong = 0,
    Misplaced = 1,
    Correct = 2,
}

struct CharCounter {
    chars: ByteStr,
    count: ByteStr,
}

impl CharCounter {
    pub fn new(word: &ByteStr) -> Self {
        let mut chars = [0u8; WORDLE_SIZE];
        let mut count = [0u8; WORDLE_SIZE];
        word.iter().for_each(|char| {
            for (index, item) in chars.iter_mut().enumerate() {
                if *item == 0 {
                    (*item) = *char
                }
                if *item == *char {
                    count[index] += 1;
                    break;
                }
            }
        });
        CharCounter { chars, count }
    }

    pub fn find_count(&self, c: u8) -> usize {
        self.chars
            .iter()
            .enumerate()
            .find(|(_, &char)| char == c)
            .map(|(index, _)| self.count[index])
            .unwrap_or(0) as usize
    }

    pub fn decrement(&mut self, c: u8) {
        if let Some((index, _)) = self.chars.iter().enumerate().find(|(_, &char)| char == c) {
            self.count[index] -= 1;
        }
    }
}

impl Correctness {
    pub fn check(answer: &ByteStr, guess: &ByteStr) -> [Self; WORDLE_SIZE] {
        let mut mask = [Correctness::Wrong; WORDLE_SIZE];
        let mut not_correct = [0u8; WORDLE_SIZE];
        guess.iter().enumerate().for_each(|(index, &c)| {
            if c == answer[index] {
                mask[index] = Correctness::Correct
            } else {
                not_correct[index] = answer[index];
            }
        });
        let mut counter = CharCounter::new(&not_correct);
        mask.iter_mut()
            .enumerate()
            .for_each(|(index, correctness)| {
                if *correctness != Correctness::Correct && counter.find_count(guess[index]) > 0 {
                    counter.decrement(guess[index]);
                    *correctness = Correctness::Misplaced;
                }
            });
        mask
    }

    pub fn mask_radix(mask: &[Correctness; WORDLE_SIZE]) -> usize {
        mask.iter().enumerate().fold(0, |acc, (index, value)| {
            acc + *value as usize * 3usize.pow(index as u32)
        })
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
    val.as_bytes()
        .try_into()
        .expect("The word passed is not a 5 letters word")
}

#[cfg(test)]
mod test {
    use super::Correctness;
    use super::Correctness::{Correct, Misplaced, Wrong};

    #[test]
    fn test_check() {
        let mask = Correctness::check(b"hello", b"there");
        assert_eq!(mask, [Wrong, Misplaced, Misplaced, Wrong, Wrong])
    }

    #[test]
    fn check_2letters() {
        let mask = Correctness::check(b"there", b"flees");
        assert_eq!(mask, [Wrong, Wrong, Correct, Misplaced, Wrong])
    }

    #[test]
    fn check_2letters_one_correct() {
        let mask = Correctness::check(b"aabcd", b"afagt");
        assert_eq!(mask, [Correct, Wrong, Misplaced, Wrong, Wrong]);
        let mask = Correctness::check(b"ajbcd", b"afagt");
        assert_eq!(mask, [Correct, Wrong, Wrong, Wrong, Wrong]);
    }
}
