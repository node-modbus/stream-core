var Protocols = require("./Protocols")
var ExceptionCode = require("./ExceptionCode");

exports.error = function (reason) {
	if (typeof reason === "string" && reason in ExceptionCode.ExceptionCode) {
		var err = new Error(reason);
		err.code = ExceptionCode.ExceptionCode[reason];

		return err;
	}
	if (typeof reason === 'number') {
		var exceptionName = ExceptionCode.findExceptionNameByCode(reason)
		if (typeof exceptionName === 'string') {
			var err = new Error(exceptionName);
			err.code = ExceptionCode.ExceptionCode[exceptionName];
			return err;
		}
	}

	return new Error("" + reason);
};

exports.build = ExceptionCode.build;

exports.parse = function (buffer) {
	var data = {
		code      : buffer[0] & 0x7F,
		exception : buffer[1]
	};

	for (var k in Protocols) {
		if (Protocols[k].Code == data.code) {
			data.code = k;
			break;
		}
	}

	var exceptionName = ExceptionCode.findExceptionNameByCode(data.exception);
	if (typeof exceptionName === 'string') {
		data.exception = exceptionName;
	}

	return data;
};
