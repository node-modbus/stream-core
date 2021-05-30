/// <reference types="node" />
import { EventEmitter } from "events";
import { Duplex } from "stream"

declare module "modbus-stream-core" {
    class Mutex {
        constructor(onComplete: () => void);

        lock(next: () => void): void;
    }

    interface StreamOptions {
        debug?: string | null;
        debugdate?: boolean;
        debuginvert?: boolean;
    }

    interface StreamAddressOption {
        address?: number;
    }

    interface StreamExtraOption {
        extra?: {};
    }

    type StreamSimpleOptions = StreamAddressOption & StreamExtraOption;

    type StreamReadOption = StreamSimpleOptions & {
        quantity?: number;
    };

    interface ReadCoilResponse {
        code: string;
        data: boolean[];
    }

    type CallbackType = (err?: Error, result?: any) => void;

    class Stream extends EventEmitter {
        constructor(transport: BaseTransport, options: StreamOptions);

        on(event: "error", listener: (error: any) => void): this;
        on(event: "close", listener: () => void): this;
        on(
            functionCode: string,
            listener: (
                req: UnwrappedData,
                reply: (err?: null | Error | string, ...data: any[]) => void
            ) => void
        ): this;

        close(next?: CallbackType): void;

        write(data: Buffer, options: {}, next?: CallbackType): void;
        write(data: Buffer, next: CallbackType): void;

        readCoils(
            options?: StreamReadOption,
            next?: (
                err: Error | null,
                info?: UnwrappedData & {
                    response: ReadCoilResponse;
                }
            ) => void
        ): void;

        readDiscreteInputs(
            options?: StreamReadOption,
            next?: (
                err: Error | null,
                info?: UnwrappedData & {
                    response: ReadCoilResponse;
                }
            ) => void
        ): void;

        readHoldingRegisters(
            options?: StreamReadOption,
            next?: (
                err: Error | null,
                info?: UnwrappedData & {
                    response: {
                        code: string;
                        data: Buffer[];
                    };
                }
            ) => void
        ): void;

        readInputRegisters(
            options?: StreamReadOption,
            next?: (
                err: Error | null,
                info?: UnwrappedData & {
                    response: {
                        code: string;
                        data: Buffer[];
                    };
                }
            ) => void
        ): void;

        writeSingleCoil(
            options?: StreamSimpleOptions & {
                value?: number;
            },
            next?: (err: Error | null, info?: any) => void
        ): void;

        writeSingleRegister(
            options?: StreamSimpleOptions & {
                value?: Buffer;
            },
            next?: CallbackType
        ): void;

        writeMultipleCoils(
            options?: StreamSimpleOptions & {
                values?: number[];
            },
            next?: CallbackType
        ): void;

        writeMultipleRegisters(
            options?: StreamSimpleOptions & {
                values?: Buffer[];
            },
            next?: CallbackType
        ): void;

        readFileRecord(
            options?: StreamExtraOption & {
                requests?: any[];
            },
            next?: CallbackType
        ): void;

        writeFileRecord(
            options?: StreamExtraOption & {
                requests?: any[];
            },
            next?: CallbackType
        ): void;

        maskWriteRegister(
            options?: StreamSimpleOptions & {
                andmask?: number;
                ormask?: number;
            },
            next?: CallbackType
        ): void;

        readWriteMultipleRegisters(
            options?: StreamExtraOption & {
                read_address?: number;
                read_quantity?: number;
                write_address?: number;
                values?: Buffer[];
            },
            next?: CallbackType
        ): void;

        readDeviceIdentification(
            options?: StreamExtraOption & {
                type?: string;
                id?: string;
            },
            next?: CallbackType
        ): void;

        readExceptionSatus(options: StreamExtraOption, next?: CallbackType): void;

        getCommEventCounter(options: StreamExtraOption, next?: CallbackType): void;

        getCommEventLog(options: StreamExtraOption, next?: CallbackType): void;

        readFifoQueue(options: StreamSimpleOptions, next?: CallbackType): void;
    }

    const stream: typeof Stream

    interface BaseTransportOptions {
        retries?: number;
        retry?: number;
        beforerequest?: CallbackType;
        afterrequest?: CallbackType;
        mutex?: Mutex;
    }

    interface TCPTransportOptions extends BaseTransportOptions {
        transactionId?: number;
        unitId?: number;
        protocol?: number;
    }

    interface UnwrappedData {
        transactionId: number;
        protocol: number;
        length: number;
        unitId: number;
        pdu: Buffer;
        stream: Stream;
    }

    class BaseTransport {
        constructor(stream: Duplex, options: BaseTransportOptions);

        close(next?: CallbackType): void;

        write(data: any, next?: CallbackType): void;

        send(
            functionCode: string,
            extra: {},
            next?: (err: Error | null) => void
        ): void;

        retrySend(data: any, retries: number, retry: number, next: CallbackType): void;

        clearSend(): void;

        listen(): void;
    }

    class TCPTransport extends BaseTransport {
        constructor(stream: Duplex, options?: TCPTransportOptions);

        wrap(pdu: any, options: TCPTransportOptions, next?: CallbackType): Buffer;

        close(next: CallbackType): void;

        pending(): boolean;

        unwrap(data: Buffer): UnwrappedData;

        prepare(options: TCPTransportOptions): (stream: Stream) => TCPTransport;
    }

    interface SerialTransportOptions extends BaseTransportOptions {
        slaveId?: number;
        maxDataInterval?: number;
        mode?: "ascii";
    }

    class SerialTransport extends BaseTransport {
        constructor(stream: Duplex, options?: SerialTransportOptions);

        wrap(pdu: any, options?: SerialTransportOptions, next?: () => void): Buffer;

        unwrap(data: Buffer): UnwrappedData;

        clearSend(): void;

        static crc16(buffer: Buffer): number;

        static prepare(options?: SerialTransportOptions): (stream: Stream) => SerialTransport;
    }

    interface ASCIITransportOptions {
        slaveId?: number;
    }

    class ASCIITransport extends BaseTransport {
        constructor(stream: Duplex, options?: ASCIITransportOptions);
        wrap(pdu: any, options?: ASCIITransportOptions, next?: () => void): Buffer;

        unwrap(data: Buffer): UnwrappedData;

        static lrc(data: Buffer): Buffer;

        static prepare(options?: ASCIITransportOptions): (stream: Stream) => ASCIITransport;
    }

    const transports: {
        tcp: typeof TCPTransport;
        ascii: typeof ASCIITransport;
        serial: typeof SerialTransport;
    };

    interface PduExceptionParseResult {
        code: string;
        exception: string
    }

    interface PduException {
        error(reason: string): Error
        build(fcode: number, code: string | number): Buffer
        parse(buffer: Buffer): PduExceptionParseResult
    }

    interface PduExceptionCode {
        readonly IllegalFunction: number;
        readonly IllegalDataAddress: number;
        readonly IllegalDataValue: number;
        readonly ServerDeviceFailure: number;
        readonly Aknowledge: number;
        readonly ServerDeviceBusy: number;
        readonly MemoryParityError: number;
        readonly GatewayPathUnavailable: number;
        readonly GatewayTargetDeviceFailedToRespond: number;
    }

    // @todo reference to modbus-pdu (missing types)
    const pdu: {
        ExceptionCode: PduExceptionCode,
        Exception: PduException,
    };
}
