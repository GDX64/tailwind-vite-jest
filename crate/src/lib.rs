#![allow(non_snake_case)]
extern crate wasm_bindgen;

use wasm_bindgen::prelude::*;

mod Naive;
mod Wordle;
use Wordle::Correctness;

pub const WORDLE_SIZE: usize = 5;
pub const WORDS: &str = include_str!("./words.txt");

pub struct Guess {
    word: String,
    mask: [Correctness; WORDLE_SIZE],
}

impl Guess {
    fn matches(&self, word: &str) -> bool {
        //A potential right word should produce the same mask as
        //the one we currently have in this guess
        Correctness::check(word, &self.word) == self.mask
    }
}

pub trait Guesser {
    fn guess(&mut self, history: &[Guess]) -> String;

    fn calc_best_guesses(&self, history: &[Guess]) -> Vec<(&str, f64)>;
}

#[wasm_bindgen]
pub fn main() {
    Wordle::Wordle::new().simulate("brick");
}

#[cfg(test)]
mod test {}
