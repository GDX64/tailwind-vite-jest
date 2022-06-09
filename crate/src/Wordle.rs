use super::{Guess, Guesser, WORDLE_SIZE};
pub struct Wordle {}

impl Wordle {
    pub fn new() -> Self {
        Wordle {}
    }

    pub fn play(&self, answer: &'static str, mut guesser: impl Guesser) -> usize {
        let mut history: Vec<Guess> = Vec::new();
        for i in 0..=16 {
            let guess = guesser.guess(&history);
            if guess == answer {
                return i;
            }
            let correcness = Correctness::check(answer, &guess);
            history.push(Guess {
                mask: correcness,
                word: guess,
            })
        }
        panic!("Max guesses reached");
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
