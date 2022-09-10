use wasm_bindgen::prelude::*;

fn d2xy(n: i64, d: i64) -> (i64, i64) {
    let mut x: i64;
    let mut y: i64;
    let mut rx: i64;
    let mut ry: i64;
    let mut s: i64 = 1;
    let mut t = d;
    x = 0;
    y = 0;

    while s < n {
        rx = 1 & (t / 2);
        ry = 1 & (t ^ rx);
        rot(s, &mut x, &mut y, rx, ry);
        x += s * rx;
        y += s * ry;
        t /= 4;
        s *= 2
    }
    (x, y)
}

//rotate/flip a quadrant appropriately
fn rot(n: i64, x: &mut i64, y: &mut i64, rx: i64, ry: i64) {
    if ry == 0 {
        if rx == 1 {
            *x = n - 1 - *x;
            *y = n - 1 - *y;
        }

        //Swap x and y
        let t: i64 = *x;
        *x = *y;
        *y = t;
    }
}

pub fn all_hilbert_in(n: u32, amount: u32) -> impl Iterator<Item = (i64, i64)> {
    (0..amount as i64).map(move |d| d2xy(n as i64, d))
}

#[wasm_bindgen]
pub fn all_hilbert(n: u32, amount: u32) -> Vec<i32> {
    all_hilbert_in(n, amount)
        .flat_map(|(x, y)| vec![x as i32, y as i32])
        .collect()
}

#[cfg(test)]
mod test {}
