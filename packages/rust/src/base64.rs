#[allow(arithmetic_overflow)]
use wasm_bindgen::prelude::*;

static BASE64_TABLE: [u8; 64] =
    *b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

#[wasm_bindgen]
pub struct Base64Decoder {
    bytes: Vec<u8>,
    index: usize,
}

#[wasm_bindgen]
impl Base64Decoder {
    pub fn new() -> Self {
        Self {
            bytes: Vec::new(),
            index: 0,
        }
    }

    pub fn to_base64(&mut self, bytes: &[u8]) -> *const u8 {
        self.base64_string(bytes);
        self.bytes.as_ptr()
    }
}

impl Base64Decoder {
    fn base64_string(&mut self, bytes: &[u8]) {
        let chars = ((bytes.len() as f64 / 3.0).ceil() * 4.0) as usize;
        let base64 = &mut self.bytes;
        base64.resize(chars, 0);
        let items = [&bytes[bytes.len() - bytes.len() % 3..], &[0, 0]].concat();
        bytes
            .chunks_exact(3)
            .chain(std::iter::once(&items[..]))
            .zip(base64.chunks_exact_mut(4))
            .for_each(|(chunk_bytes, chunk_base64)| {
                let byte1 = chunk_bytes[0] as usize;
                let byte2 = chunk_bytes[1] as usize;
                let byte3 = chunk_bytes[2] as usize;
                let bits24 = (byte1 << 16) | (byte2 << 8) | byte3;

                let a1 = bits24 >> 18;
                let a2 = (bits24 >> 12) & 0b111111;
                let a3 = (bits24 >> 6) & 0b111111;
                let a4 = bits24 & 0b111111;

                chunk_base64[0] = BASE64_TABLE[a1];
                chunk_base64[1] = BASE64_TABLE[a2];
                chunk_base64[2] = BASE64_TABLE[a3];
                chunk_base64[3] = BASE64_TABLE[a4];
            });

        if bytes.len() % 3 == 1 {
            base64[chars - 1] = b'=';
            base64[chars - 2] = b'=';
        } else if bytes.len() % 3 == 2 {
            base64[chars - 1] = b'=';
        }
    }
}

#[cfg(test)]
mod test {
    #[test]
    fn base64_basic() {
        let bytes = b"Hello, world!";
        let mut decoder = super::Base64Decoder::new();
        decoder.to_base64(bytes);
        assert_eq!(decoder.bytes, b"SGVsbG8sIHdvcmxkIQ==");
    }
}
