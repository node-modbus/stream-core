var ExceptionCode = require("./ExceptionCode");
var Buff = require("./Buffer");

var RawProtocols = {
	GetCommEventCounter: require("./protocol/GetCommEventCounter"),
	GetCommEventLog: require("./protocol/GetCommEventLog"),
	MaskWriteRegister: require("./protocol/MaskWriteRegister"),
	ReadCoils: require("./protocol/ReadCoils"),
	ReadDeviceIdentification: require("./protocol/ReadDeviceIdentification"),
	ReadDiscreteInputs: require("./protocol/ReadDiscreteInputs"),
	ReadExceptionStatus: require("./protocol/ReadExceptionStatus"),
	ReadFifoQueue: require("./protocol/ReadFifoQueue"),
	ReadFileRecord: require("./protocol/ReadFileRecord"),
	ReadHoldingRegisters: require("./protocol/ReadHoldingRegisters"),
	ReadInputRegisters: require("./protocol/ReadInputRegisters"),
	ReadWriteMultipleRegisters: require("./protocol/ReadWriteMultipleRegisters"),
	WriteFileRecord: require("./protocol/WriteFileRecord"),
	WriteMultipleCoils: require("./protocol/WriteMultipleCoils"),
	WriteMultipleRegisters: require("./protocol/WriteMultipleRegisters"),
	WriteSingleCoil: require("./protocol/WriteSingleCoil"),
	WriteSingleRegister: require("./protocol/WriteSingleRegister"),
};

function proxy(funct, method) {
	return function () {
		var stream = funct[method].apply(funct, arguments);
		var buffer = Buff.alloc(stream.length + 1);

		buffer[0] = funct.code;

		stream.copy(buffer, 1);

		return buffer;
	};
}

function createProtocol(funct) {
	var protocol = {
		Code: funct.code,
		Request: {
			build: proxy(funct, "buildRequest"),
			parse: function (buffer) {
				// byte 1 is function code
				return funct.parseRequest(buffer.slice(1));
			},
		},
		Response: {
			build: proxy(funct, "buildResponse"),
			parse: function (buffer) {
				// byte 1 is function code
				return funct.parseResponse(buffer.slice(1));
			},
		},
	};
	protocol.Exception = ExceptionCode.prepareException(protocol);
	return protocol;
}

var Protocols = {};
for (var key in RawProtocols) {
	Protocols[key] = createProtocol(RawProtocols[key]);
}
module.exports = Protocols;
