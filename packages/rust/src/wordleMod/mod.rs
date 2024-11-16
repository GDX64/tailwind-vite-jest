#![allow(non_snake_case)]
extern crate wasm_bindgen;

use wasm_bindgen::prelude::*;

mod Naive;
mod Wordle;
use Wordle::{ByteStr, Correctness};

pub const WORDLE_SIZE: usize = 5;
pub const WORDS: &str = include_str!("./words.txt");
const MAP_ARR_SIZE: usize = 3usize.pow(WORDLE_SIZE as u32);

pub struct Guess {
    word: ByteStr,
    mask: [Correctness; WORDLE_SIZE],
}

impl Guess {
    fn matches(&self, word: &ByteStr) -> bool {
        //A potential right word should produce the same mask as
        //the one we currently have in this guess
        Correctness::check(word, &self.word) == self.mask
    }

    fn calc_distribution(valid_words: &[ByteStr], guess_word: &ByteStr) -> [usize; MAP_ARR_SIZE] {
        let mut map_arr = [0usize; MAP_ARR_SIZE];
        valid_words.iter().for_each(|word| {
            let mask = Correctness::check(word, guess_word);
            let mask_radix = Correctness::mask_radix(&mask);
            map_arr[mask_radix] = map_arr[mask_radix] + 1;
        });
        map_arr
    }
}

#[wasm_bindgen]
pub fn main() {
    Wordle::Wordle::new(None, "hello").simulate("brick");
}

#[cfg(test)]
mod test {}
