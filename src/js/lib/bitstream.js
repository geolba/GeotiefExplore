// From: https://gist.github.com/claus/2829664 */
// Usage:
// var buf = new Uint8Array(128);
// var bitstream = new BitStream(buf);
// bitstream.writeBits(12, 0xffff);
// bitstream.seekTo(0);
// bitstream.readBits(6); // 111111  (63)
// bitstream.readBits(10); // 1111110000  (1008)
// ES6'ified by mbw@geus.dk 20190605


export class BitStream  {

	constructor(uint8Array)		{
		this.a = uint8Array;
		this.position = 0;
		this.bitsPending = 0;			
	}

	writeBits(bits, value) {
		if (bits === 0) { return; }
		value &= (0xffffffff >>> (32 - bits));
		let bitsConsumed;
		if (this.bitsPending > 0) {
			if (this.bitsPending > bits) {
				this.a[this.position - 1] |= value << (this.bitsPending - bits);
				bitsConsumed = bits;
				this.bitsPending -= bits;
			} else if (this.bitsPending === bits) {
				this.a[this.position - 1] |= value;
				bitsConsumed = bits;
				this.bitsPending = 0;
			} else {
				this.a[this.position - 1] |= value >> (bits - this.bitsPending);
				bitsConsumed = bitsPending;
				this.bitsPending = 0;
			}
		} else {
			bitsConsumed = Math.min(8, bits);
			this.bitsPending = 8 - bitsConsumed;
			this.a[this.position++] = (value >> (bits - bitsConsumed)) << this.bitsPending;
		}
		bits -= bitsConsumed;
		if (bits > 0) {
			this.writeBits(bits, value);
		}
	}

	readBits(bits, bitBuffer) {
		if (typeof bitBuffer === "undefined") { bitBuffer = 0; }
		if (bits === 0) { return bitBuffer; }
		let partial;
		let bitsConsumed;
		if (this.bitsPending > 0) {
			const byte = this.a[this.position - 1] & (0xff >> (8 - this.bitsPending));
			bitsConsumed = Math.min(this.bitsPending, bits);
			this.bitsPending -= bitsConsumed;
			partial = byte >> this.bitsPending;
		} else {
			bitsConsumed = Math.min(8, bits);
			this.bitsPending = 8 - bitsConsumed;
			partial = this.a[this.position++] >> this.bitsPending;
		}
		bits -= bitsConsumed;
		bitBuffer = (bitBuffer << bitsConsumed) | partial;
		return (bits > 0) ? this.readBits(bits, bitBuffer) : bitBuffer;
	}

	seekTo(bitPos) {
		this.position = (bitPos / 8) | 0;
		this.bitsPending = bitPos % 8;
		if(this.bitsPending > 0) {
			this.bitsPending = 8 - this.bitsPending;
			this.position++;
		}
	}

}