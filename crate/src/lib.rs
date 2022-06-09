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
}

impl Guesser for fn(&[Guess]) -> String {
    fn guess(&mut self, history: &[Guess]) -> String {
        (*self)(history)
    }
}

#[wasm_bindgen]
pub fn main() {
    let wordle = Wordle::Wordle::new();
    let guesses = wordle.play("brick", Naive::NaiveGuesser::new());
    println!("Guesses: {}", guesses)
}

#[cfg(test)]
mod test {
    use std::{
        collections::hash_map::DefaultHasher,
        hash::{Hash, Hasher},
    };

    use crate::{Guess, Naive, Wordle};

    #[test]
    fn guess_right_from_start() {
        let wordle = Wordle::Wordle::new();
        let guesser: fn(&[Guess]) -> String = |_| "hello".to_string();
        assert_eq!(wordle.play("hello", guesser), 0);
    }

    #[test]
    fn guess_right_second() {
        let wordle = Wordle::Wordle::new();
        let guesser: fn(&[Guess]) -> String = |history| {
            if history.len() == 1 {
                "hello".to_string()
            } else {
                "there".to_string()
            }
        };
        assert_eq!(wordle.play("hello", guesser), 1);
    }

    #[test]
    fn exhaustive() {
        let wordle = Wordle::Wordle::new();
        let guesses = wordle.play("wrong", Naive::NaiveGuesser::new());
        println!("Guesses: {}", guesses)
    }

    #[test]
    fn hash() {
        let arr = [1, 2, 3];
        let mut h = DefaultHasher::new();
        arr.hash(&mut h);
        let mut h2 = DefaultHasher::new();
        arr.clone().hash(&mut h2);
        println!("{:?} {:?}", h.finish(), h2.finish());
    }
}
