use std::time::Duration;

use criterion::{black_box, criterion_group, criterion_main, BenchmarkId, Criterion};
use rand;
use trunk::book_things::{ArrBook, BookBuilder, MapBook, Offer};

enum Command {
    Add(Offer),
    Remove(Offer),
}

const INITAL_SIZE: usize = 30_000;

pub fn criterion_benchmark(c: &mut Criterion) {
    let offers: Vec<Command> = (0..50_000)
        .map(|v| {
            if rand::random::<bool>() {
                Command::Add(Offer {
                    index: (rand::random::<u16>() % INITAL_SIZE as u16) as usize,
                })
            } else {
                Command::Remove(Offer {
                    index: (rand::random::<u16>() % INITAL_SIZE as u16) as usize,
                })
            }
        })
        .collect();
    let mut group = c.benchmark_group("Books");
    group.bench_with_input(BenchmarkId::new("Array", 0), &offers, |b, offers| {
        b.iter(|| test_ordering(black_box(offers), ArrBook::new(INITAL_SIZE)));
    });
    group.bench_with_input(BenchmarkId::new("Map", 0), &offers, |b, offers| {
        b.iter(|| test_ordering(black_box(offers), MapBook::new(INITAL_SIZE)));
    });

    group.finish();
}

criterion_group!(benches, criterion_benchmark);
criterion_main!(benches);

fn test_ordering(offers: &[Command], mut mb: impl BookBuilder) -> Vec<Offer> {
    offers.into_iter().for_each(|v| match v {
        Command::Add(offer) => mb.add_offer(offer.clone()),
        Command::Remove(offer) => mb.remove_offer(offer.clone()),
    });
    mb.to_vec()
}
