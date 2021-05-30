var Exception = require("./Exception");
var ExceptionCode = require("./ExceptionCode")
var Helpers   = require("./Helpers");
var Buff      = require("./Buffer");
var Protocols = require("./Protocols");

exports.Protocols = Protocols;

load();

exports.Exception = Exception;
exports.ExceptionCode = ExceptionCode.ExceptionCode;
exports.Package   = function (fcode, data) {
	var buffer = Buff.alloc(data.length + 1);

	buffer.writeUInt8(fcode, 0);
	Buff.from(data).copy(buffer, 1);

	return buffer;
};

exports.Helpers = {
	blocksToBuffer : Helpers.blocksToBuffer,
	bitsToBuffer   : Helpers.bitsToBuffer,

	bufferToBlocks : Helpers.bufferToBlocks,
	bufferToBits   : Helpers.bufferToBits,
};

function load() {
	exports.Request = function (buffer) {
		var code = buffer.readUInt8(0);

		for (var k in Protocols) {
			if (Protocols[k].Code === code) {
				var data = Protocols[k].Request.parse(buffer);

				if (typeof data === "object" && !Array.isArray(data) && data !== null) {
					data.code = k;
				} else {
					data = { code: k, data: data };
				}

				return data;
			}
		}

		return {
			code : buffer[0],
			data : buffer.slice(1)
		};
	};

	exports.Response = function (buffer) {
		var code = buffer.readUInt8(0);

		if (code & 0x80) {
			return Exception.parse(buffer);
		}

		for (var k in Protocols) {
			if (Protocols[k].Code === code) {
				var data = Protocols[k].Response.parse(buffer);

				if (typeof data === "object" && !Array.isArray(data) && data !== null) {
					data.code = k;
				} else {
					data = { code: k, data: data };
				}

				return data;
			}
		}

		return {
			code : buffer[0],
			data : buffer.slice(1)
		};
	};
}
