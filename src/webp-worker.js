// import wasmWebp from "@saschazar/wasm-webp";
// import defaultOptions from "@saschazar/wasm-webp/options";
// import wasmImageLoader from "@saschazar/wasm-image-loader";

// const wasmWebp = require("@saschazar/wasm-webp");
// const defaultOptions = require("@saschazar/wasm-webp/options");
// const wasmImageLoader = require("@saschazar/wasm-image-loader");
import {INIT_STATE, SCHEDULE_STATE} from "./constant";

const wasmWebp = (function () {
    var _scriptDir = typeof document !== 'undefined' && document.currentScript ? document.currentScript.src : undefined;
    if (typeof __filename !== 'undefined') _scriptDir = _scriptDir || __filename;
    return (
        function (wasm_webp) {
            wasm_webp = wasm_webp || {};

            var Module = typeof wasm_webp !== "undefined" ? wasm_webp : {};
            var readyPromiseResolve, readyPromiseReject;
            Module["ready"] = new Promise(function (resolve, reject) {
                readyPromiseResolve = resolve;
                readyPromiseReject = reject
            });
            var moduleOverrides = {};
            var key;
            for (key in Module) {
                if (Module.hasOwnProperty(key)) {
                    moduleOverrides[key] = Module[key]
                }
            }
            var arguments_ = [];
            var thisProgram = "./this.program";
            var quit_ = function (status, toThrow) {
                throw toThrow
            };
            var ENVIRONMENT_IS_WEB = false;
            var ENVIRONMENT_IS_WORKER = false;
            var ENVIRONMENT_IS_NODE = false;
            var ENVIRONMENT_IS_SHELL = false;
            ENVIRONMENT_IS_WEB = typeof window === "object";
            ENVIRONMENT_IS_WORKER = typeof importScripts === "function";
            ENVIRONMENT_IS_NODE = typeof process === "object" && typeof process.versions === "object" && typeof process.versions.node === "string";
            ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
            var scriptDirectory = "";

            function locateFile(path) {
                if (Module["locateFile"]) {
                    return Module["locateFile"](path, scriptDirectory)
                }
                return scriptDirectory + path
            }

            var read_, readAsync, readBinary, setWindowTitle;
            var nodeFS;
            var nodePath;
            if (ENVIRONMENT_IS_NODE) {
            } else if (ENVIRONMENT_IS_SHELL) {
            } else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
                if (ENVIRONMENT_IS_WORKER) {
                    scriptDirectory = self.location.href
                } else if (typeof document !== "undefined" && document.currentScript) {
                    scriptDirectory = document.currentScript.src
                }
                if (_scriptDir) {
                    scriptDirectory = _scriptDir
                }
                if (scriptDirectory.indexOf("blob:") !== 0) {
                    scriptDirectory = scriptDirectory.substr(0, scriptDirectory.lastIndexOf("/") + 1)
                } else {
                    scriptDirectory = ""
                }
                {
                    read_ = function (url) {
                        var xhr = new XMLHttpRequest;
                        xhr.open("GET", url, false);
                        xhr.send(null);
                        return xhr.responseText
                    };
                    if (ENVIRONMENT_IS_WORKER) {
                        readBinary = function (url) {
                            var xhr = new XMLHttpRequest;
                            xhr.open("GET", url, false);
                            xhr.responseType = "arraybuffer";
                            xhr.send(null);
                            return new Uint8Array(xhr.response)
                        }
                    }
                    readAsync = function (url, onload, onerror) {
                        var xhr = new XMLHttpRequest;
                        xhr.open("GET", url, true);
                        xhr.responseType = "arraybuffer";
                        xhr.onload = function () {
                            if (xhr.status == 200 || xhr.status == 0 && xhr.response) {
                                onload(xhr.response);
                                return
                            }
                            onerror()
                        };
                        xhr.onerror = onerror;
                        xhr.send(null)
                    }
                }
                setWindowTitle = function (title) {
                    document.title = title
                }
            } else {
            }
            var out = Module["print"] || console.log.bind(console);
            var err = Module["printErr"] || console.warn.bind(console);
            for (key in moduleOverrides) {
                if (moduleOverrides.hasOwnProperty(key)) {
                    Module[key] = moduleOverrides[key]
                }
            }
            moduleOverrides = null;
            if (Module["arguments"]) arguments_ = Module["arguments"];
            if (Module["thisProgram"]) thisProgram = Module["thisProgram"];
            if (Module["quit"]) quit_ = Module["quit"];
            var tempRet0 = 0;
            var setTempRet0 = function (value) {
                tempRet0 = value
            };
            var wasmBinary;
            if (Module["wasmBinary"]) wasmBinary = Module["wasmBinary"];
            var noExitRuntime = Module["noExitRuntime"] || true;
            if (typeof WebAssembly !== "object") {
                abort("no native wasm support detected")
            }
            var wasmMemory;
            var ABORT = false;
            var EXITSTATUS;

            function assert(condition, text) {
                if (!condition) {
                    abort("Assertion failed: " + text)
                }
            }

            var UTF8Decoder = typeof TextDecoder !== "undefined" ? new TextDecoder("utf8") : undefined;

            function UTF8ArrayToString(heap, idx, maxBytesToRead) {
                var endIdx = idx + maxBytesToRead;
                var endPtr = idx;
                while (heap[endPtr] && !(endPtr >= endIdx)) ++endPtr;
                if (endPtr - idx > 16 && heap.subarray && UTF8Decoder) {
                    return UTF8Decoder.decode(heap.subarray(idx, endPtr))
                } else {
                    var str = "";
                    while (idx < endPtr) {
                        var u0 = heap[idx++];
                        if (!(u0 & 128)) {
                            str += String.fromCharCode(u0);
                            continue
                        }
                        var u1 = heap[idx++] & 63;
                        if ((u0 & 224) == 192) {
                            str += String.fromCharCode((u0 & 31) << 6 | u1);
                            continue
                        }
                        var u2 = heap[idx++] & 63;
                        if ((u0 & 240) == 224) {
                            u0 = (u0 & 15) << 12 | u1 << 6 | u2
                        } else {
                            u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | heap[idx++] & 63
                        }
                        if (u0 < 65536) {
                            str += String.fromCharCode(u0)
                        } else {
                            var ch = u0 - 65536;
                            str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023)
                        }
                    }
                }
                return str
            }

            function UTF8ToString(ptr, maxBytesToRead) {
                return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : ""
            }

            function stringToUTF8Array(str, heap, outIdx, maxBytesToWrite) {
                if (!(maxBytesToWrite > 0)) return 0;
                var startIdx = outIdx;
                var endIdx = outIdx + maxBytesToWrite - 1;
                for (var i = 0; i < str.length; ++i) {
                    var u = str.charCodeAt(i);
                    if (u >= 55296 && u <= 57343) {
                        var u1 = str.charCodeAt(++i);
                        u = 65536 + ((u & 1023) << 10) | u1 & 1023
                    }
                    if (u <= 127) {
                        if (outIdx >= endIdx) break;
                        heap[outIdx++] = u
                    } else if (u <= 2047) {
                        if (outIdx + 1 >= endIdx) break;
                        heap[outIdx++] = 192 | u >> 6;
                        heap[outIdx++] = 128 | u & 63
                    } else if (u <= 65535) {
                        if (outIdx + 2 >= endIdx) break;
                        heap[outIdx++] = 224 | u >> 12;
                        heap[outIdx++] = 128 | u >> 6 & 63;
                        heap[outIdx++] = 128 | u & 63
                    } else {
                        if (outIdx + 3 >= endIdx) break;
                        heap[outIdx++] = 240 | u >> 18;
                        heap[outIdx++] = 128 | u >> 12 & 63;
                        heap[outIdx++] = 128 | u >> 6 & 63;
                        heap[outIdx++] = 128 | u & 63
                    }
                }
                heap[outIdx] = 0;
                return outIdx - startIdx
            }

            function stringToUTF8(str, outPtr, maxBytesToWrite) {
                return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite)
            }

            function lengthBytesUTF8(str) {
                var len = 0;
                for (var i = 0; i < str.length; ++i) {
                    var u = str.charCodeAt(i);
                    if (u >= 55296 && u <= 57343) u = 65536 + ((u & 1023) << 10) | str.charCodeAt(++i) & 1023;
                    if (u <= 127) ++len; else if (u <= 2047) len += 2; else if (u <= 65535) len += 3; else len += 4
                }
                return len
            }

            var UTF16Decoder = typeof TextDecoder !== "undefined" ? new TextDecoder("utf-16le") : undefined;

            function UTF16ToString(ptr, maxBytesToRead) {
                var endPtr = ptr;
                var idx = endPtr >> 1;
                var maxIdx = idx + maxBytesToRead / 2;
                while (!(idx >= maxIdx) && HEAPU16[idx]) ++idx;
                endPtr = idx << 1;
                if (endPtr - ptr > 32 && UTF16Decoder) {
                    return UTF16Decoder.decode(HEAPU8.subarray(ptr, endPtr))
                } else {
                    var str = "";
                    for (var i = 0; !(i >= maxBytesToRead / 2); ++i) {
                        var codeUnit = HEAP16[ptr + i * 2 >> 1];
                        if (codeUnit == 0) break;
                        str += String.fromCharCode(codeUnit)
                    }
                    return str
                }
            }

            function stringToUTF16(str, outPtr, maxBytesToWrite) {
                if (maxBytesToWrite === undefined) {
                    maxBytesToWrite = 2147483647
                }
                if (maxBytesToWrite < 2) return 0;
                maxBytesToWrite -= 2;
                var startPtr = outPtr;
                var numCharsToWrite = maxBytesToWrite < str.length * 2 ? maxBytesToWrite / 2 : str.length;
                for (var i = 0; i < numCharsToWrite; ++i) {
                    var codeUnit = str.charCodeAt(i);
                    HEAP16[outPtr >> 1] = codeUnit;
                    outPtr += 2
                }
                HEAP16[outPtr >> 1] = 0;
                return outPtr - startPtr
            }

            function lengthBytesUTF16(str) {
                return str.length * 2
            }

            function UTF32ToString(ptr, maxBytesToRead) {
                var i = 0;
                var str = "";
                while (!(i >= maxBytesToRead / 4)) {
                    var utf32 = HEAP32[ptr + i * 4 >> 2];
                    if (utf32 == 0) break;
                    ++i;
                    if (utf32 >= 65536) {
                        var ch = utf32 - 65536;
                        str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023)
                    } else {
                        str += String.fromCharCode(utf32)
                    }
                }
                return str
            }

            function stringToUTF32(str, outPtr, maxBytesToWrite) {
                if (maxBytesToWrite === undefined) {
                    maxBytesToWrite = 2147483647
                }
                if (maxBytesToWrite < 4) return 0;
                var startPtr = outPtr;
                var endPtr = startPtr + maxBytesToWrite - 4;
                for (var i = 0; i < str.length; ++i) {
                    var codeUnit = str.charCodeAt(i);
                    if (codeUnit >= 55296 && codeUnit <= 57343) {
                        var trailSurrogate = str.charCodeAt(++i);
                        codeUnit = 65536 + ((codeUnit & 1023) << 10) | trailSurrogate & 1023
                    }
                    HEAP32[outPtr >> 2] = codeUnit;
                    outPtr += 4;
                    if (outPtr + 4 > endPtr) break
                }
                HEAP32[outPtr >> 2] = 0;
                return outPtr - startPtr
            }

            function lengthBytesUTF32(str) {
                var len = 0;
                for (var i = 0; i < str.length; ++i) {
                    var codeUnit = str.charCodeAt(i);
                    if (codeUnit >= 55296 && codeUnit <= 57343) ++i;
                    len += 4
                }
                return len
            }

            function alignUp(x, multiple) {
                if (x % multiple > 0) {
                    x += multiple - x % multiple
                }
                return x
            }

            var buffer, HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;

            function updateGlobalBufferAndViews(buf) {
                buffer = buf;
                Module["HEAP8"] = HEAP8 = new Int8Array(buf);
                Module["HEAP16"] = HEAP16 = new Int16Array(buf);
                Module["HEAP32"] = HEAP32 = new Int32Array(buf);
                Module["HEAPU8"] = HEAPU8 = new Uint8Array(buf);
                Module["HEAPU16"] = HEAPU16 = new Uint16Array(buf);
                Module["HEAPU32"] = HEAPU32 = new Uint32Array(buf);
                Module["HEAPF32"] = HEAPF32 = new Float32Array(buf);
                Module["HEAPF64"] = HEAPF64 = new Float64Array(buf)
            }

            var INITIAL_MEMORY = Module["INITIAL_MEMORY"] || 16777216;
            var wasmTable;
            var __ATPRERUN__ = [];
            var __ATINIT__ = [];
            var __ATMAIN__ = [];
            var __ATPOSTRUN__ = [];
            var runtimeInitialized = false;

            function preRun() {
                if (Module["preRun"]) {
                    if (typeof Module["preRun"] == "function") Module["preRun"] = [Module["preRun"]];
                    while (Module["preRun"].length) {
                        addOnPreRun(Module["preRun"].shift())
                    }
                }
                callRuntimeCallbacks(__ATPRERUN__)
            }

            function initRuntime() {
                runtimeInitialized = true;
                callRuntimeCallbacks(__ATINIT__)
            }

            function preMain() {
                callRuntimeCallbacks(__ATMAIN__)
            }

            function postRun() {
                if (Module["postRun"]) {
                    if (typeof Module["postRun"] == "function") Module["postRun"] = [Module["postRun"]];
                    while (Module["postRun"].length) {
                        addOnPostRun(Module["postRun"].shift())
                    }
                }
                callRuntimeCallbacks(__ATPOSTRUN__)
            }

            function addOnPreRun(cb) {
                __ATPRERUN__.unshift(cb)
            }

            function addOnInit(cb) {
                __ATINIT__.unshift(cb)
            }

            function addOnPostRun(cb) {
                __ATPOSTRUN__.unshift(cb)
            }

            var runDependencies = 0;
            var runDependencyWatcher = null;
            var dependenciesFulfilled = null;

            function addRunDependency(id) {
                runDependencies++;
                if (Module["monitorRunDependencies"]) {
                    Module["monitorRunDependencies"](runDependencies)
                }
            }

            function removeRunDependency(id) {
                runDependencies--;
                if (Module["monitorRunDependencies"]) {
                    Module["monitorRunDependencies"](runDependencies)
                }
                if (runDependencies == 0) {
                    if (runDependencyWatcher !== null) {
                        clearInterval(runDependencyWatcher);
                        runDependencyWatcher = null
                    }
                    if (dependenciesFulfilled) {
                        var callback = dependenciesFulfilled;
                        dependenciesFulfilled = null;
                        callback()
                    }
                }
            }

            Module["preloadedImages"] = {};
            Module["preloadedAudios"] = {};

            function abort(what) {
                if (Module["onAbort"]) {
                    Module["onAbort"](what)
                }
                what += "";
                err(what);
                ABORT = true;
                EXITSTATUS = 1;
                what = "abort(" + what + "). Build with -s ASSERTIONS=1 for more info.";
                var e = new WebAssembly.RuntimeError(what);
                readyPromiseReject(e);
                throw e
            }

            function hasPrefix(str, prefix) {
                return String.prototype.startsWith ? str.startsWith(prefix) : str.indexOf(prefix) === 0
            }

            var dataURIPrefix = "data:application/octet-stream;base64,";

            function isDataURI(filename) {
                return hasPrefix(filename, dataURIPrefix)
            }

            var fileURIPrefix = "file://";

            function isFileURI(filename) {
                return hasPrefix(filename, fileURIPrefix)
            }

            var wasmBinaryFile = "wasm_webp.wasm";
            if (!isDataURI(wasmBinaryFile)) {
                wasmBinaryFile = locateFile(wasmBinaryFile)
            }

            function getBinary(file) {
                try {
                    if (file == wasmBinaryFile && wasmBinary) {
                        return new Uint8Array(wasmBinary)
                    }
                    if (readBinary) {
                        return readBinary(file)
                    } else {
                        throw"both async and sync fetching of the wasm failed"
                    }
                } catch (err) {
                    abort(err)
                }
            }

            function getBinaryPromise() {
                if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
                    if (typeof fetch === "function" && !isFileURI(wasmBinaryFile)) {
                        return fetch(wasmBinaryFile, {credentials: "same-origin"}).then(function (response) {
                            if (!response["ok"]) {
                                throw"failed to load wasm binary file at '" + wasmBinaryFile + "'"
                            }
                            return response["arrayBuffer"]()
                        }).catch(function () {
                            return getBinary(wasmBinaryFile)
                        })
                    } else {
                        if (readAsync) {
                            return new Promise(function (resolve, reject) {
                                readAsync(wasmBinaryFile, function (response) {
                                    resolve(new Uint8Array(response))
                                }, reject)
                            })
                        }
                    }
                }
                return Promise.resolve().then(function () {
                    return getBinary(wasmBinaryFile)
                })
            }

            function createWasm() {
                var info = {"a": asmLibraryArg};

                function receiveInstance(instance, module) {
                    var exports = instance.exports;
                    Module["asm"] = exports;
                    wasmMemory = Module["asm"]["z"];
                    updateGlobalBufferAndViews(wasmMemory.buffer);
                    wasmTable = Module["asm"]["B"];
                    addOnInit(Module["asm"]["A"]);
                    removeRunDependency("wasm-instantiate")
                }

                addRunDependency("wasm-instantiate");

                function receiveInstantiatedSource(output) {
                    receiveInstance(output["instance"])
                }

                function instantiateArrayBuffer(receiver) {
                    return getBinaryPromise().then(function (binary) {
                        var result = WebAssembly.instantiate(binary, info);
                        return result
                    }).then(receiver, function (reason) {
                        err("failed to asynchronously prepare wasm: " + reason);
                        abort(reason)
                    })
                }

                function instantiateAsync() {
                    if (!wasmBinary && typeof WebAssembly.instantiateStreaming === "function" && !isDataURI(wasmBinaryFile) && !isFileURI(wasmBinaryFile) && typeof fetch === "function") {
                        return fetch(wasmBinaryFile, {credentials: "same-origin"}).then(function (response) {
                            var result = WebAssembly.instantiateStreaming(response, info);
                            return result.then(receiveInstantiatedSource, function (reason) {
                                err("wasm streaming compile failed: " + reason);
                                err("falling back to ArrayBuffer instantiation");
                                return instantiateArrayBuffer(receiveInstantiatedSource)
                            })
                        })
                    } else {
                        return instantiateArrayBuffer(receiveInstantiatedSource)
                    }
                }

                if (Module["instantiateWasm"]) {
                    try {
                        var exports = Module["instantiateWasm"](info, receiveInstance);
                        return exports
                    } catch (e) {
                        err("Module.instantiateWasm callback failed with error: " + e);
                        return false
                    }
                }
                instantiateAsync().catch(readyPromiseReject);
                return {}
            }

            function callRuntimeCallbacks(callbacks) {
                while (callbacks.length > 0) {
                    var callback = callbacks.shift();
                    if (typeof callback == "function") {
                        callback(Module);
                        continue
                    }
                    var func = callback.func;
                    if (typeof func === "number") {
                        if (callback.arg === undefined) {
                            wasmTable.get(func)()
                        } else {
                            wasmTable.get(func)(callback.arg)
                        }
                    } else {
                        func(callback.arg === undefined ? null : callback.arg)
                    }
                }
            }

            var ExceptionInfoAttrs = {
                DESTRUCTOR_OFFSET: 0,
                REFCOUNT_OFFSET: 4,
                TYPE_OFFSET: 8,
                CAUGHT_OFFSET: 12,
                RETHROWN_OFFSET: 13,
                SIZE: 16
            };

            function ___cxa_allocate_exception(size) {
                return _malloc(size + ExceptionInfoAttrs.SIZE) + ExceptionInfoAttrs.SIZE
            }

            function ExceptionInfo(excPtr) {
                this.excPtr = excPtr;
                this.ptr = excPtr - ExceptionInfoAttrs.SIZE;
                this.set_type = function (type) {
                    HEAP32[this.ptr + ExceptionInfoAttrs.TYPE_OFFSET >> 2] = type
                };
                this.get_type = function () {
                    return HEAP32[this.ptr + ExceptionInfoAttrs.TYPE_OFFSET >> 2]
                };
                this.set_destructor = function (destructor) {
                    HEAP32[this.ptr + ExceptionInfoAttrs.DESTRUCTOR_OFFSET >> 2] = destructor
                };
                this.get_destructor = function () {
                    return HEAP32[this.ptr + ExceptionInfoAttrs.DESTRUCTOR_OFFSET >> 2]
                };
                this.set_refcount = function (refcount) {
                    HEAP32[this.ptr + ExceptionInfoAttrs.REFCOUNT_OFFSET >> 2] = refcount
                };
                this.set_caught = function (caught) {
                    caught = caught ? 1 : 0;
                    HEAP8[this.ptr + ExceptionInfoAttrs.CAUGHT_OFFSET >> 0] = caught
                };
                this.get_caught = function () {
                    return HEAP8[this.ptr + ExceptionInfoAttrs.CAUGHT_OFFSET >> 0] != 0
                };
                this.set_rethrown = function (rethrown) {
                    rethrown = rethrown ? 1 : 0;
                    HEAP8[this.ptr + ExceptionInfoAttrs.RETHROWN_OFFSET >> 0] = rethrown
                };
                this.get_rethrown = function () {
                    return HEAP8[this.ptr + ExceptionInfoAttrs.RETHROWN_OFFSET >> 0] != 0
                };
                this.init = function (type, destructor) {
                    this.set_type(type);
                    this.set_destructor(destructor);
                    this.set_refcount(0);
                    this.set_caught(false);
                    this.set_rethrown(false)
                };
                this.add_ref = function () {
                    var value = HEAP32[this.ptr + ExceptionInfoAttrs.REFCOUNT_OFFSET >> 2];
                    HEAP32[this.ptr + ExceptionInfoAttrs.REFCOUNT_OFFSET >> 2] = value + 1
                };
                this.release_ref = function () {
                    var prev = HEAP32[this.ptr + ExceptionInfoAttrs.REFCOUNT_OFFSET >> 2];
                    HEAP32[this.ptr + ExceptionInfoAttrs.REFCOUNT_OFFSET >> 2] = prev - 1;
                    return prev === 1
                }
            }

            var exceptionLast = 0;
            var uncaughtExceptionCount = 0;

            function ___cxa_throw(ptr, type, destructor) {
                var info = new ExceptionInfo(ptr);
                info.init(type, destructor);
                exceptionLast = ptr;
                uncaughtExceptionCount++;
                throw ptr
            }

            var structRegistrations = {};

            function runDestructors(destructors) {
                while (destructors.length) {
                    var ptr = destructors.pop();
                    var del = destructors.pop();
                    del(ptr)
                }
            }

            function simpleReadValueFromPointer(pointer) {
                return this["fromWireType"](HEAPU32[pointer >> 2])
            }

            var awaitingDependencies = {};
            var registeredTypes = {};
            var typeDependencies = {};
            var char_0 = 48;
            var char_9 = 57;

            function makeLegalFunctionName(name) {
                if (undefined === name) {
                    return "_unknown"
                }
                name = name.replace(/[^a-zA-Z0-9_]/g, "$");
                var f = name.charCodeAt(0);
                if (f >= char_0 && f <= char_9) {
                    return "_" + name
                } else {
                    return name
                }
            }

            function createNamedFunction(name, body) {
                name = makeLegalFunctionName(name);
                return new Function("body", "return function " + name + "() {\n" + '    "use strict";' + "    return body.apply(this, arguments);\n" + "};\n")(body)
            }

            function extendError(baseErrorType, errorName) {
                var errorClass = createNamedFunction(errorName, function (message) {
                    this.name = errorName;
                    this.message = message;
                    var stack = new Error(message).stack;
                    if (stack !== undefined) {
                        this.stack = this.toString() + "\n" + stack.replace(/^Error(:[^\n]*)?\n/, "")
                    }
                });
                errorClass.prototype = Object.create(baseErrorType.prototype);
                errorClass.prototype.constructor = errorClass;
                errorClass.prototype.toString = function () {
                    if (this.message === undefined) {
                        return this.name
                    } else {
                        return this.name + ": " + this.message
                    }
                };
                return errorClass
            }

            var InternalError = undefined;

            function throwInternalError(message) {
                throw new InternalError(message)
            }

            function whenDependentTypesAreResolved(myTypes, dependentTypes, getTypeConverters) {
                myTypes.forEach(function (type) {
                    typeDependencies[type] = dependentTypes
                });

                function onComplete(typeConverters) {
                    var myTypeConverters = getTypeConverters(typeConverters);
                    if (myTypeConverters.length !== myTypes.length) {
                        throwInternalError("Mismatched type converter count")
                    }
                    for (var i = 0; i < myTypes.length; ++i) {
                        registerType(myTypes[i], myTypeConverters[i])
                    }
                }

                var typeConverters = new Array(dependentTypes.length);
                var unregisteredTypes = [];
                var registered = 0;
                dependentTypes.forEach(function (dt, i) {
                    if (registeredTypes.hasOwnProperty(dt)) {
                        typeConverters[i] = registeredTypes[dt]
                    } else {
                        unregisteredTypes.push(dt);
                        if (!awaitingDependencies.hasOwnProperty(dt)) {
                            awaitingDependencies[dt] = []
                        }
                        awaitingDependencies[dt].push(function () {
                            typeConverters[i] = registeredTypes[dt];
                            ++registered;
                            if (registered === unregisteredTypes.length) {
                                onComplete(typeConverters)
                            }
                        })
                    }
                });
                if (0 === unregisteredTypes.length) {
                    onComplete(typeConverters)
                }
            }

            function __embind_finalize_value_object(structType) {
                var reg = structRegistrations[structType];
                delete structRegistrations[structType];
                var rawConstructor = reg.rawConstructor;
                var rawDestructor = reg.rawDestructor;
                var fieldRecords = reg.fields;
                var fieldTypes = fieldRecords.map(function (field) {
                    return field.getterReturnType
                }).concat(fieldRecords.map(function (field) {
                    return field.setterArgumentType
                }));
                whenDependentTypesAreResolved([structType], fieldTypes, function (fieldTypes) {
                    var fields = {};
                    fieldRecords.forEach(function (field, i) {
                        var fieldName = field.fieldName;
                        var getterReturnType = fieldTypes[i];
                        var getter = field.getter;
                        var getterContext = field.getterContext;
                        var setterArgumentType = fieldTypes[i + fieldRecords.length];
                        var setter = field.setter;
                        var setterContext = field.setterContext;
                        fields[fieldName] = {
                            read: function (ptr) {
                                return getterReturnType["fromWireType"](getter(getterContext, ptr))
                            }, write: function (ptr, o) {
                                var destructors = [];
                                setter(setterContext, ptr, setterArgumentType["toWireType"](destructors, o));
                                runDestructors(destructors)
                            }
                        }
                    });
                    return [{
                        name: reg.name,
                        "fromWireType": function (ptr) {
                            var rv = {};
                            for (var i in fields) {
                                rv[i] = fields[i].read(ptr)
                            }
                            rawDestructor(ptr);
                            return rv
                        },
                        "toWireType": function (destructors, o) {
                            for (var fieldName in fields) {
                                if (!(fieldName in o)) {
                                    throw new TypeError('Missing field:  "' + fieldName + '"')
                                }
                            }
                            var ptr = rawConstructor();
                            for (fieldName in fields) {
                                fields[fieldName].write(ptr, o[fieldName])
                            }
                            if (destructors !== null) {
                                destructors.push(rawDestructor, ptr)
                            }
                            return ptr
                        },
                        "argPackAdvance": 8,
                        "readValueFromPointer": simpleReadValueFromPointer,
                        destructorFunction: rawDestructor
                    }]
                })
            }

            function getShiftFromSize(size) {
                switch (size) {
                    case 1:
                        return 0;
                    case 2:
                        return 1;
                    case 4:
                        return 2;
                    case 8:
                        return 3;
                    default:
                        throw new TypeError("Unknown type size: " + size)
                }
            }

            function embind_init_charCodes() {
                var codes = new Array(256);
                for (var i = 0; i < 256; ++i) {
                    codes[i] = String.fromCharCode(i)
                }
                embind_charCodes = codes
            }

            var embind_charCodes = undefined;

            function readLatin1String(ptr) {
                var ret = "";
                var c = ptr;
                while (HEAPU8[c]) {
                    ret += embind_charCodes[HEAPU8[c++]]
                }
                return ret
            }

            var BindingError = undefined;

            function throwBindingError(message) {
                throw new BindingError(message)
            }

            function registerType(rawType, registeredInstance, options) {
                options = options || {};
                if (!("argPackAdvance" in registeredInstance)) {
                    throw new TypeError("registerType registeredInstance requires argPackAdvance")
                }
                var name = registeredInstance.name;
                if (!rawType) {
                    throwBindingError('type "' + name + '" must have a positive integer typeid pointer')
                }
                if (registeredTypes.hasOwnProperty(rawType)) {
                    if (options.ignoreDuplicateRegistrations) {
                        return
                    } else {
                        throwBindingError("Cannot register type '" + name + "' twice")
                    }
                }
                registeredTypes[rawType] = registeredInstance;
                delete typeDependencies[rawType];
                if (awaitingDependencies.hasOwnProperty(rawType)) {
                    var callbacks = awaitingDependencies[rawType];
                    delete awaitingDependencies[rawType];
                    callbacks.forEach(function (cb) {
                        cb()
                    })
                }
            }

            function __embind_register_bool(rawType, name, size, trueValue, falseValue) {
                var shift = getShiftFromSize(size);
                name = readLatin1String(name);
                registerType(rawType, {
                    name: name, "fromWireType": function (wt) {
                        return !!wt
                    }, "toWireType": function (destructors, o) {
                        return o ? trueValue : falseValue
                    }, "argPackAdvance": 8, "readValueFromPointer": function (pointer) {
                        var heap;
                        if (size === 1) {
                            heap = HEAP8
                        } else if (size === 2) {
                            heap = HEAP16
                        } else if (size === 4) {
                            heap = HEAP32
                        } else {
                            throw new TypeError("Unknown boolean type size: " + name)
                        }
                        return this["fromWireType"](heap[pointer >> shift])
                    }, destructorFunction: null
                })
            }

            var emval_free_list = [];
            var emval_handle_array = [{}, {value: undefined}, {value: null}, {value: true}, {value: false}];

            function __emval_decref(handle) {
                if (handle > 4 && 0 === --emval_handle_array[handle].refcount) {
                    emval_handle_array[handle] = undefined;
                    emval_free_list.push(handle)
                }
            }

            function count_emval_handles() {
                var count = 0;
                for (var i = 5; i < emval_handle_array.length; ++i) {
                    if (emval_handle_array[i] !== undefined) {
                        ++count
                    }
                }
                return count
            }

            function get_first_emval() {
                for (var i = 5; i < emval_handle_array.length; ++i) {
                    if (emval_handle_array[i] !== undefined) {
                        return emval_handle_array[i]
                    }
                }
                return null
            }

            function init_emval() {
                Module["count_emval_handles"] = count_emval_handles;
                Module["get_first_emval"] = get_first_emval
            }

            function __emval_register(value) {
                switch (value) {
                    case undefined: {
                        return 1
                    }
                    case null: {
                        return 2
                    }
                    case true: {
                        return 3
                    }
                    case false: {
                        return 4
                    }
                    default: {
                        var handle = emval_free_list.length ? emval_free_list.pop() : emval_handle_array.length;
                        emval_handle_array[handle] = {refcount: 1, value: value};
                        return handle
                    }
                }
            }

            function __embind_register_emval(rawType, name) {
                name = readLatin1String(name);
                registerType(rawType, {
                    name: name, "fromWireType": function (handle) {
                        var rv = emval_handle_array[handle].value;
                        __emval_decref(handle);
                        return rv
                    }, "toWireType": function (destructors, value) {
                        return __emval_register(value)
                    }, "argPackAdvance": 8, "readValueFromPointer": simpleReadValueFromPointer, destructorFunction: null
                })
            }

            function ensureOverloadTable(proto, methodName, humanName) {
                if (undefined === proto[methodName].overloadTable) {
                    var prevFunc = proto[methodName];
                    proto[methodName] = function () {
                        if (!proto[methodName].overloadTable.hasOwnProperty(arguments.length)) {
                            throwBindingError("Function '" + humanName + "' called with an invalid number of arguments (" + arguments.length + ") - expects one of (" + proto[methodName].overloadTable + ")!")
                        }
                        return proto[methodName].overloadTable[arguments.length].apply(this, arguments)
                    };
                    proto[methodName].overloadTable = [];
                    proto[methodName].overloadTable[prevFunc.argCount] = prevFunc
                }
            }

            function exposePublicSymbol(name, value, numArguments) {
                if (Module.hasOwnProperty(name)) {
                    if (undefined === numArguments || undefined !== Module[name].overloadTable && undefined !== Module[name].overloadTable[numArguments]) {
                        throwBindingError("Cannot register public name '" + name + "' twice")
                    }
                    ensureOverloadTable(Module, name, name);
                    if (Module.hasOwnProperty(numArguments)) {
                        throwBindingError("Cannot register multiple overloads of a function with the same number of arguments (" + numArguments + ")!")
                    }
                    Module[name].overloadTable[numArguments] = value
                } else {
                    Module[name] = value;
                    if (undefined !== numArguments) {
                        Module[name].numArguments = numArguments
                    }
                }
            }

            function enumReadValueFromPointer(name, shift, signed) {
                switch (shift) {
                    case 0:
                        return function (pointer) {
                            var heap = signed ? HEAP8 : HEAPU8;
                            return this["fromWireType"](heap[pointer])
                        };
                    case 1:
                        return function (pointer) {
                            var heap = signed ? HEAP16 : HEAPU16;
                            return this["fromWireType"](heap[pointer >> 1])
                        };
                    case 2:
                        return function (pointer) {
                            var heap = signed ? HEAP32 : HEAPU32;
                            return this["fromWireType"](heap[pointer >> 2])
                        };
                    default:
                        throw new TypeError("Unknown integer type: " + name)
                }
            }

            function __embind_register_enum(rawType, name, size, isSigned) {
                var shift = getShiftFromSize(size);
                name = readLatin1String(name);

                function ctor() {
                }

                ctor.values = {};
                registerType(rawType, {
                    name: name,
                    constructor: ctor,
                    "fromWireType": function (c) {
                        return this.constructor.values[c]
                    },
                    "toWireType": function (destructors, c) {
                        return c.value
                    },
                    "argPackAdvance": 8,
                    "readValueFromPointer": enumReadValueFromPointer(name, shift, isSigned),
                    destructorFunction: null
                });
                exposePublicSymbol(name, ctor)
            }

            function getTypeName(type) {
                var ptr = ___getTypeName(type);
                var rv = readLatin1String(ptr);
                _free(ptr);
                return rv
            }

            function requireRegisteredType(rawType, humanName) {
                var impl = registeredTypes[rawType];
                if (undefined === impl) {
                    throwBindingError(humanName + " has unknown type " + getTypeName(rawType))
                }
                return impl
            }

            function __embind_register_enum_value(rawEnumType, name, enumValue) {
                var enumType = requireRegisteredType(rawEnumType, "enum");
                name = readLatin1String(name);
                var Enum = enumType.constructor;
                var Value = Object.create(enumType.constructor.prototype, {
                    value: {value: enumValue},
                    constructor: {
                        value: createNamedFunction(enumType.name + "_" + name, function () {
                        })
                    }
                });
                Enum.values[enumValue] = Value;
                Enum[name] = Value
            }

            function _embind_repr(v) {
                if (v === null) {
                    return "null"
                }
                var t = typeof v;
                if (t === "object" || t === "array" || t === "function") {
                    return v.toString()
                } else {
                    return "" + v
                }
            }

            function floatReadValueFromPointer(name, shift) {
                switch (shift) {
                    case 2:
                        return function (pointer) {
                            return this["fromWireType"](HEAPF32[pointer >> 2])
                        };
                    case 3:
                        return function (pointer) {
                            return this["fromWireType"](HEAPF64[pointer >> 3])
                        };
                    default:
                        throw new TypeError("Unknown float type: " + name)
                }
            }

            function __embind_register_float(rawType, name, size) {
                var shift = getShiftFromSize(size);
                name = readLatin1String(name);
                registerType(rawType, {
                    name: name,
                    "fromWireType": function (value) {
                        return value
                    },
                    "toWireType": function (destructors, value) {
                        if (typeof value !== "number" && typeof value !== "boolean") {
                            throw new TypeError('Cannot convert "' + _embind_repr(value) + '" to ' + this.name)
                        }
                        return value
                    },
                    "argPackAdvance": 8,
                    "readValueFromPointer": floatReadValueFromPointer(name, shift),
                    destructorFunction: null
                })
            }

            function new_(constructor, argumentList) {
                if (!(constructor instanceof Function)) {
                    throw new TypeError("new_ called with constructor type " + typeof constructor + " which is not a function")
                }
                var dummy = createNamedFunction(constructor.name || "unknownFunctionName", function () {
                });
                dummy.prototype = constructor.prototype;
                var obj = new dummy;
                var r = constructor.apply(obj, argumentList);
                return r instanceof Object ? r : obj
            }

            function craftInvokerFunction(humanName, argTypes, classType, cppInvokerFunc, cppTargetFunc) {
                var argCount = argTypes.length;
                if (argCount < 2) {
                    throwBindingError("argTypes array size mismatch! Must at least get return value and 'this' types!")
                }
                var isClassMethodFunc = argTypes[1] !== null && classType !== null;
                var needsDestructorStack = false;
                for (var i = 1; i < argTypes.length; ++i) {
                    if (argTypes[i] !== null && argTypes[i].destructorFunction === undefined) {
                        needsDestructorStack = true;
                        break
                    }
                }
                var returns = argTypes[0].name !== "void";
                var argsList = "";
                var argsListWired = "";
                for (var i = 0; i < argCount - 2; ++i) {
                    argsList += (i !== 0 ? ", " : "") + "arg" + i;
                    argsListWired += (i !== 0 ? ", " : "") + "arg" + i + "Wired"
                }
                var invokerFnBody = "return function " + makeLegalFunctionName(humanName) + "(" + argsList + ") {\n" + "if (arguments.length !== " + (argCount - 2) + ") {\n" + "throwBindingError('function " + humanName + " called with ' + arguments.length + ' arguments, expected " + (argCount - 2) + " args!');\n" + "}\n";
                if (needsDestructorStack) {
                    invokerFnBody += "var destructors = [];\n"
                }
                var dtorStack = needsDestructorStack ? "destructors" : "null";
                var args1 = ["throwBindingError", "invoker", "fn", "runDestructors", "retType", "classParam"];
                var args2 = [throwBindingError, cppInvokerFunc, cppTargetFunc, runDestructors, argTypes[0], argTypes[1]];
                if (isClassMethodFunc) {
                    invokerFnBody += "var thisWired = classParam.toWireType(" + dtorStack + ", this);\n"
                }
                for (var i = 0; i < argCount - 2; ++i) {
                    invokerFnBody += "var arg" + i + "Wired = argType" + i + ".toWireType(" + dtorStack + ", arg" + i + "); // " + argTypes[i + 2].name + "\n";
                    args1.push("argType" + i);
                    args2.push(argTypes[i + 2])
                }
                if (isClassMethodFunc) {
                    argsListWired = "thisWired" + (argsListWired.length > 0 ? ", " : "") + argsListWired
                }
                invokerFnBody += (returns ? "var rv = " : "") + "invoker(fn" + (argsListWired.length > 0 ? ", " : "") + argsListWired + ");\n";
                if (needsDestructorStack) {
                    invokerFnBody += "runDestructors(destructors);\n"
                } else {
                    for (var i = isClassMethodFunc ? 1 : 2; i < argTypes.length; ++i) {
                        var paramName = i === 1 ? "thisWired" : "arg" + (i - 2) + "Wired";
                        if (argTypes[i].destructorFunction !== null) {
                            invokerFnBody += paramName + "_dtor(" + paramName + "); // " + argTypes[i].name + "\n";
                            args1.push(paramName + "_dtor");
                            args2.push(argTypes[i].destructorFunction)
                        }
                    }
                }
                if (returns) {
                    invokerFnBody += "var ret = retType.fromWireType(rv);\n" + "return ret;\n"
                } else {
                }
                invokerFnBody += "}\n";
                args1.push(invokerFnBody);
                var invokerFunction = new_(Function, args1).apply(null, args2);
                return invokerFunction
            }

            function heap32VectorToArray(count, firstElement) {
                var array = [];
                for (var i = 0; i < count; i++) {
                    array.push(HEAP32[(firstElement >> 2) + i])
                }
                return array
            }

            function replacePublicSymbol(name, value, numArguments) {
                if (!Module.hasOwnProperty(name)) {
                    throwInternalError("Replacing nonexistant public symbol")
                }
                if (undefined !== Module[name].overloadTable && undefined !== numArguments) {
                    Module[name].overloadTable[numArguments] = value
                } else {
                    Module[name] = value;
                    Module[name].argCount = numArguments
                }
            }

            function dynCallLegacy(sig, ptr, args) {
                var f = Module["dynCall_" + sig];
                return args && args.length ? f.apply(null, [ptr].concat(args)) : f.call(null, ptr)
            }

            function dynCall(sig, ptr, args) {
                if (sig.indexOf("j") != -1) {
                    return dynCallLegacy(sig, ptr, args)
                }
                return wasmTable.get(ptr).apply(null, args)
            }

            function getDynCaller(sig, ptr) {
                var argCache = [];
                return function () {
                    argCache.length = arguments.length;
                    for (var i = 0; i < arguments.length; i++) {
                        argCache[i] = arguments[i]
                    }
                    return dynCall(sig, ptr, argCache)
                }
            }

            function embind__requireFunction(signature, rawFunction) {
                signature = readLatin1String(signature);

                function makeDynCaller() {
                    if (signature.indexOf("j") != -1) {
                        return getDynCaller(signature, rawFunction)
                    }
                    return wasmTable.get(rawFunction)
                }

                var fp = makeDynCaller();
                if (typeof fp !== "function") {
                    throwBindingError("unknown function pointer with signature " + signature + ": " + rawFunction)
                }
                return fp
            }

            var UnboundTypeError = undefined;

            function throwUnboundTypeError(message, types) {
                var unboundTypes = [];
                var seen = {};

                function visit(type) {
                    if (seen[type]) {
                        return
                    }
                    if (registeredTypes[type]) {
                        return
                    }
                    if (typeDependencies[type]) {
                        typeDependencies[type].forEach(visit);
                        return
                    }
                    unboundTypes.push(type);
                    seen[type] = true
                }

                types.forEach(visit);
                throw new UnboundTypeError(message + ": " + unboundTypes.map(getTypeName).join([", "]))
            }

            function __embind_register_function(name, argCount, rawArgTypesAddr, signature, rawInvoker, fn) {
                var argTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
                name = readLatin1String(name);
                rawInvoker = embind__requireFunction(signature, rawInvoker);
                exposePublicSymbol(name, function () {
                    throwUnboundTypeError("Cannot call " + name + " due to unbound types", argTypes)
                }, argCount - 1);
                whenDependentTypesAreResolved([], argTypes, function (argTypes) {
                    var invokerArgsArray = [argTypes[0], null].concat(argTypes.slice(1));
                    replacePublicSymbol(name, craftInvokerFunction(name, invokerArgsArray, null, rawInvoker, fn), argCount - 1);
                    return []
                })
            }

            function integerReadValueFromPointer(name, shift, signed) {
                switch (shift) {
                    case 0:
                        return signed ? function readS8FromPointer(pointer) {
                            return HEAP8[pointer]
                        } : function readU8FromPointer(pointer) {
                            return HEAPU8[pointer]
                        };
                    case 1:
                        return signed ? function readS16FromPointer(pointer) {
                            return HEAP16[pointer >> 1]
                        } : function readU16FromPointer(pointer) {
                            return HEAPU16[pointer >> 1]
                        };
                    case 2:
                        return signed ? function readS32FromPointer(pointer) {
                            return HEAP32[pointer >> 2]
                        } : function readU32FromPointer(pointer) {
                            return HEAPU32[pointer >> 2]
                        };
                    default:
                        throw new TypeError("Unknown integer type: " + name)
                }
            }

            function __embind_register_integer(primitiveType, name, size, minRange, maxRange) {
                name = readLatin1String(name);
                if (maxRange === -1) {
                    maxRange = 4294967295
                }
                var shift = getShiftFromSize(size);
                var fromWireType = function (value) {
                    return value
                };
                if (minRange === 0) {
                    var bitshift = 32 - 8 * size;
                    fromWireType = function (value) {
                        return value << bitshift >>> bitshift
                    }
                }
                var isUnsignedType = name.indexOf("unsigned") != -1;
                registerType(primitiveType, {
                    name: name,
                    "fromWireType": fromWireType,
                    "toWireType": function (destructors, value) {
                        if (typeof value !== "number" && typeof value !== "boolean") {
                            throw new TypeError('Cannot convert "' + _embind_repr(value) + '" to ' + this.name)
                        }
                        if (value < minRange || value > maxRange) {
                            throw new TypeError('Passing a number "' + _embind_repr(value) + '" from JS side to C/C++ side to an argument of type "' + name + '", which is outside the valid range [' + minRange + ", " + maxRange + "]!")
                        }
                        return isUnsignedType ? value >>> 0 : value | 0
                    },
                    "argPackAdvance": 8,
                    "readValueFromPointer": integerReadValueFromPointer(name, shift, minRange !== 0),
                    destructorFunction: null
                })
            }

            function __embind_register_memory_view(rawType, dataTypeIndex, name) {
                var typeMapping = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array];
                var TA = typeMapping[dataTypeIndex];

                function decodeMemoryView(handle) {
                    handle = handle >> 2;
                    var heap = HEAPU32;
                    var size = heap[handle];
                    var data = heap[handle + 1];
                    return new TA(buffer, data, size)
                }

                name = readLatin1String(name);
                registerType(rawType, {
                    name: name,
                    "fromWireType": decodeMemoryView,
                    "argPackAdvance": 8,
                    "readValueFromPointer": decodeMemoryView
                }, {ignoreDuplicateRegistrations: true})
            }

            function __embind_register_std_string(rawType, name) {
                name = readLatin1String(name);
                var stdStringIsUTF8 = name === "std::string";
                registerType(rawType, {
                    name: name,
                    "fromWireType": function (value) {
                        var length = HEAPU32[value >> 2];
                        var str;
                        if (stdStringIsUTF8) {
                            var decodeStartPtr = value + 4;
                            for (var i = 0; i <= length; ++i) {
                                var currentBytePtr = value + 4 + i;
                                if (i == length || HEAPU8[currentBytePtr] == 0) {
                                    var maxRead = currentBytePtr - decodeStartPtr;
                                    var stringSegment = UTF8ToString(decodeStartPtr, maxRead);
                                    if (str === undefined) {
                                        str = stringSegment
                                    } else {
                                        str += String.fromCharCode(0);
                                        str += stringSegment
                                    }
                                    decodeStartPtr = currentBytePtr + 1
                                }
                            }
                        } else {
                            var a = new Array(length);
                            for (var i = 0; i < length; ++i) {
                                a[i] = String.fromCharCode(HEAPU8[value + 4 + i])
                            }
                            str = a.join("")
                        }
                        _free(value);
                        return str
                    },
                    "toWireType": function (destructors, value) {
                        if (value instanceof ArrayBuffer) {
                            value = new Uint8Array(value)
                        }
                        var getLength;
                        var valueIsOfTypeString = typeof value === "string";
                        if (!(valueIsOfTypeString || value instanceof Uint8Array || value instanceof Uint8ClampedArray || value instanceof Int8Array)) {
                            throwBindingError("Cannot pass non-string to std::string")
                        }
                        if (stdStringIsUTF8 && valueIsOfTypeString) {
                            getLength = function () {
                                return lengthBytesUTF8(value)
                            }
                        } else {
                            getLength = function () {
                                return value.length
                            }
                        }
                        var length = getLength();
                        var ptr = _malloc(4 + length + 1);
                        HEAPU32[ptr >> 2] = length;
                        if (stdStringIsUTF8 && valueIsOfTypeString) {
                            stringToUTF8(value, ptr + 4, length + 1)
                        } else {
                            if (valueIsOfTypeString) {
                                for (var i = 0; i < length; ++i) {
                                    var charCode = value.charCodeAt(i);
                                    if (charCode > 255) {
                                        _free(ptr);
                                        throwBindingError("String has UTF-16 code units that do not fit in 8 bits")
                                    }
                                    HEAPU8[ptr + 4 + i] = charCode
                                }
                            } else {
                                for (var i = 0; i < length; ++i) {
                                    HEAPU8[ptr + 4 + i] = value[i]
                                }
                            }
                        }
                        if (destructors !== null) {
                            destructors.push(_free, ptr)
                        }
                        return ptr
                    },
                    "argPackAdvance": 8,
                    "readValueFromPointer": simpleReadValueFromPointer,
                    destructorFunction: function (ptr) {
                        _free(ptr)
                    }
                })
            }

            function __embind_register_std_wstring(rawType, charSize, name) {
                name = readLatin1String(name);
                var decodeString, encodeString, getHeap, lengthBytesUTF, shift;
                if (charSize === 2) {
                    decodeString = UTF16ToString;
                    encodeString = stringToUTF16;
                    lengthBytesUTF = lengthBytesUTF16;
                    getHeap = function () {
                        return HEAPU16
                    };
                    shift = 1
                } else if (charSize === 4) {
                    decodeString = UTF32ToString;
                    encodeString = stringToUTF32;
                    lengthBytesUTF = lengthBytesUTF32;
                    getHeap = function () {
                        return HEAPU32
                    };
                    shift = 2
                }
                registerType(rawType, {
                    name: name,
                    "fromWireType": function (value) {
                        var length = HEAPU32[value >> 2];
                        var HEAP = getHeap();
                        var str;
                        var decodeStartPtr = value + 4;
                        for (var i = 0; i <= length; ++i) {
                            var currentBytePtr = value + 4 + i * charSize;
                            if (i == length || HEAP[currentBytePtr >> shift] == 0) {
                                var maxReadBytes = currentBytePtr - decodeStartPtr;
                                var stringSegment = decodeString(decodeStartPtr, maxReadBytes);
                                if (str === undefined) {
                                    str = stringSegment
                                } else {
                                    str += String.fromCharCode(0);
                                    str += stringSegment
                                }
                                decodeStartPtr = currentBytePtr + charSize
                            }
                        }
                        _free(value);
                        return str
                    },
                    "toWireType": function (destructors, value) {
                        if (!(typeof value === "string")) {
                            throwBindingError("Cannot pass non-string to C++ string type " + name)
                        }
                        var length = lengthBytesUTF(value);
                        var ptr = _malloc(4 + length + charSize);
                        HEAPU32[ptr >> 2] = length >> shift;
                        encodeString(value, ptr + 4, length + charSize);
                        if (destructors !== null) {
                            destructors.push(_free, ptr)
                        }
                        return ptr
                    },
                    "argPackAdvance": 8,
                    "readValueFromPointer": simpleReadValueFromPointer,
                    destructorFunction: function (ptr) {
                        _free(ptr)
                    }
                })
            }

            function __embind_register_value_object(rawType, name, constructorSignature, rawConstructor, destructorSignature, rawDestructor) {
                structRegistrations[rawType] = {
                    name: readLatin1String(name),
                    rawConstructor: embind__requireFunction(constructorSignature, rawConstructor),
                    rawDestructor: embind__requireFunction(destructorSignature, rawDestructor),
                    fields: []
                }
            }

            function __embind_register_value_object_field(structType, fieldName, getterReturnType, getterSignature, getter, getterContext, setterArgumentType, setterSignature, setter, setterContext) {
                structRegistrations[structType].fields.push({
                    fieldName: readLatin1String(fieldName),
                    getterReturnType: getterReturnType,
                    getter: embind__requireFunction(getterSignature, getter),
                    getterContext: getterContext,
                    setterArgumentType: setterArgumentType,
                    setter: embind__requireFunction(setterSignature, setter),
                    setterContext: setterContext
                })
            }

            function __embind_register_void(rawType, name) {
                name = readLatin1String(name);
                registerType(rawType, {
                    isVoid: true, name: name, "argPackAdvance": 0, "fromWireType": function () {
                        return undefined
                    }, "toWireType": function (destructors, o) {
                        return undefined
                    }
                })
            }

            function __emval_incref(handle) {
                if (handle > 4) {
                    emval_handle_array[handle].refcount += 1
                }
            }

            var emval_symbols = {};

            function getStringOrSymbol(address) {
                var symbol = emval_symbols[address];
                if (symbol === undefined) {
                    return readLatin1String(address)
                } else {
                    return symbol
                }
            }

            function __emval_new_cstring(v) {
                return __emval_register(getStringOrSymbol(v))
            }

            function __emval_new_object() {
                return __emval_register({})
            }

            function requireHandle(handle) {
                if (!handle) {
                    throwBindingError("Cannot use deleted val. handle = " + handle)
                }
                return emval_handle_array[handle].value
            }

            function __emval_set_property(handle, key, value) {
                handle = requireHandle(handle);
                key = requireHandle(key);
                value = requireHandle(value);
                handle[key] = value
            }

            function __emval_take_value(type, argv) {
                type = requireRegisteredType(type, "_emval_take_value");
                var v = type["readValueFromPointer"](argv);
                return __emval_register(v)
            }

            function _abort() {
                abort()
            }

            function emscripten_realloc_buffer(size) {
                try {
                    wasmMemory.grow(size - buffer.byteLength + 65535 >>> 16);
                    updateGlobalBufferAndViews(wasmMemory.buffer);
                    return 1
                } catch (e) {
                }
            }

            function _emscripten_resize_heap(requestedSize) {
                var oldSize = HEAPU8.length;
                requestedSize = requestedSize >>> 0;
                var maxHeapSize = 2147483648;
                if (requestedSize > maxHeapSize) {
                    return false
                }
                for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
                    var overGrownHeapSize = oldSize * (1 + .2 / cutDown);
                    overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);
                    var newSize = Math.min(maxHeapSize, alignUp(Math.max(requestedSize, overGrownHeapSize), 65536));
                    var replacement = emscripten_realloc_buffer(newSize);
                    if (replacement) {
                        return true
                    }
                }
                return false
            }

            function _setTempRet0($i) {
                setTempRet0($i | 0)
            }

            InternalError = Module["InternalError"] = extendError(Error, "InternalError");
            embind_init_charCodes();
            BindingError = Module["BindingError"] = extendError(Error, "BindingError");
            init_emval();
            UnboundTypeError = Module["UnboundTypeError"] = extendError(Error, "UnboundTypeError");
            var asmLibraryArg = {
                "e": ___cxa_allocate_exception,
                "o": ___cxa_throw,
                "l": __embind_finalize_value_object,
                "t": __embind_register_bool,
                "s": __embind_register_emval,
                "n": __embind_register_enum,
                "m": __embind_register_enum_value,
                "j": __embind_register_float,
                "d": __embind_register_function,
                "b": __embind_register_integer,
                "a": __embind_register_memory_view,
                "k": __embind_register_std_string,
                "f": __embind_register_std_wstring,
                "g": __embind_register_value_object,
                "c": __embind_register_value_object_field,
                "u": __embind_register_void,
                "r": __emval_decref,
                "v": __emval_incref,
                "w": __emval_new_cstring,
                "y": __emval_new_object,
                "x": __emval_set_property,
                "h": __emval_take_value,
                "i": _abort,
                "q": _emscripten_resize_heap,
                "p": _setTempRet0
            };
            var asm = createWasm();
            var ___wasm_call_ctors = Module["___wasm_call_ctors"] = function () {
                return (___wasm_call_ctors = Module["___wasm_call_ctors"] = Module["asm"]["A"]).apply(null, arguments)
            };
            var _malloc = Module["_malloc"] = function () {
                return (_malloc = Module["_malloc"] = Module["asm"]["C"]).apply(null, arguments)
            };
            var _free = Module["_free"] = function () {
                return (_free = Module["_free"] = Module["asm"]["D"]).apply(null, arguments)
            };
            var ___getTypeName = Module["___getTypeName"] = function () {
                return (___getTypeName = Module["___getTypeName"] = Module["asm"]["E"]).apply(null, arguments)
            };
            var ___embind_register_native_and_builtin_types = Module["___embind_register_native_and_builtin_types"] = function () {
                return (___embind_register_native_and_builtin_types = Module["___embind_register_native_and_builtin_types"] = Module["asm"]["F"]).apply(null, arguments)
            };
            var dynCall_jiiii = Module["dynCall_jiiii"] = function () {
                return (dynCall_jiiii = Module["dynCall_jiiii"] = Module["asm"]["G"]).apply(null, arguments)
            };
            var calledRun;

            function ExitStatus(status) {
                this.name = "ExitStatus";
                this.message = "Program terminated with exit(" + status + ")";
                this.status = status
            }

            dependenciesFulfilled = function runCaller() {
                if (!calledRun) run();
                if (!calledRun) dependenciesFulfilled = runCaller
            };

            function run(args) {
                args = args || arguments_;
                if (runDependencies > 0) {
                    return
                }
                preRun();
                if (runDependencies > 0) {
                    return
                }

                function doRun() {
                    if (calledRun) return;
                    calledRun = true;
                    Module["calledRun"] = true;
                    if (ABORT) return;
                    initRuntime();
                    preMain();
                    readyPromiseResolve(Module);
                    if (Module["onRuntimeInitialized"]) Module["onRuntimeInitialized"]();
                    postRun()
                }

                if (Module["setStatus"]) {
                    Module["setStatus"]("Running...");
                    setTimeout(function () {
                        setTimeout(function () {
                            Module["setStatus"]("")
                        }, 1);
                        doRun()
                    }, 1)
                } else {
                    doRun()
                }
            }

            Module["run"] = run;
            if (Module["preInit"]) {
                if (typeof Module["preInit"] == "function") Module["preInit"] = [Module["preInit"]];
                while (Module["preInit"].length > 0) {
                    Module["preInit"].pop()()
                }
            }
            run();


            return wasm_webp.ready
        }
    );
})();

const wasmImageLoader = (function () {
    var _scriptDir = typeof document !== 'undefined' && document.currentScript ? document.currentScript.src : undefined;
    if (typeof __filename !== 'undefined') _scriptDir = _scriptDir || __filename;
    return (
        function (wasm_image_loader) {
            wasm_image_loader = wasm_image_loader || {};

            var Module = typeof wasm_image_loader !== "undefined" ? wasm_image_loader : {};
            var readyPromiseResolve, readyPromiseReject;
            Module["ready"] = new Promise(function (resolve, reject) {
                readyPromiseResolve = resolve;
                readyPromiseReject = reject
            });
            var moduleOverrides = {};
            var key;
            for (key in Module) {
                if (Module.hasOwnProperty(key)) {
                    moduleOverrides[key] = Module[key]
                }
            }
            var arguments_ = [];
            var thisProgram = "./this.program";
            var quit_ = function (status, toThrow) {
                throw toThrow
            };
            var ENVIRONMENT_IS_WEB = false;
            var ENVIRONMENT_IS_WORKER = false;
            var ENVIRONMENT_IS_NODE = false;
            var ENVIRONMENT_IS_SHELL = false;
            ENVIRONMENT_IS_WEB = typeof window === "object";
            ENVIRONMENT_IS_WORKER = typeof importScripts === "function";
            ENVIRONMENT_IS_NODE = typeof process === "object" && typeof process.versions === "object" && typeof process.versions.node === "string";
            ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;
            var scriptDirectory = "";

            function locateFile(path) {
                if (Module["locateFile"]) {
                    return Module["locateFile"](path, scriptDirectory)
                }
                return scriptDirectory + path
            }

            var read_, readAsync, readBinary, setWindowTitle;
            var nodeFS;
            var nodePath;
            if (ENVIRONMENT_IS_NODE) {
            } else if (ENVIRONMENT_IS_SHELL) {
            } else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
                if (ENVIRONMENT_IS_WORKER) {
                    scriptDirectory = self.location.href
                } else if (typeof document !== "undefined" && document.currentScript) {
                    scriptDirectory = document.currentScript.src
                }
                if (_scriptDir) {
                    scriptDirectory = _scriptDir
                }
                if (scriptDirectory.indexOf("blob:") !== 0) {
                    scriptDirectory = scriptDirectory.substr(0, scriptDirectory.lastIndexOf("/") + 1)
                } else {
                    scriptDirectory = ""
                }
                {
                    read_ = function (url) {
                        var xhr = new XMLHttpRequest;
                        xhr.open("GET", url, false);
                        xhr.send(null);
                        return xhr.responseText
                    };
                    if (ENVIRONMENT_IS_WORKER) {
                        readBinary = function (url) {
                            var xhr = new XMLHttpRequest;
                            xhr.open("GET", url, false);
                            xhr.responseType = "arraybuffer";
                            xhr.send(null);
                            return new Uint8Array(xhr.response)
                        }
                    }
                    readAsync = function (url, onload, onerror) {
                        var xhr = new XMLHttpRequest;
                        xhr.open("GET", url, true);
                        xhr.responseType = "arraybuffer";
                        xhr.onload = function () {
                            if (xhr.status == 200 || xhr.status == 0 && xhr.response) {
                                onload(xhr.response);
                                return
                            }
                            onerror()
                        };
                        xhr.onerror = onerror;
                        xhr.send(null)
                    }
                }
                setWindowTitle = function (title) {
                    document.title = title
                }
            } else {

            }
            var out = Module["print"] || console.log.bind(console);
            var err = Module["printErr"] || console.warn.bind(console);
            for (key in moduleOverrides) {
                if (moduleOverrides.hasOwnProperty(key)) {
                    Module[key] = moduleOverrides[key]
                }
            }
            moduleOverrides = null;
            if (Module["arguments"]) arguments_ = Module["arguments"];
            if (Module["thisProgram"]) thisProgram = Module["thisProgram"];
            if (Module["quit"]) quit_ = Module["quit"];
            var tempRet0 = 0;
            var setTempRet0 = function (value) {
                tempRet0 = value
            };
            var wasmBinary;
            if (Module["wasmBinary"]) wasmBinary = Module["wasmBinary"];
            var noExitRuntime = Module["noExitRuntime"] || true;
            if (typeof WebAssembly !== "object") {
                abort("no native wasm support detected")
            }
            var wasmMemory;
            var ABORT = false;
            var EXITSTATUS;

            function assert(condition, text) {
                if (!condition) {
                    abort("Assertion failed: " + text)
                }
            }

            var UTF8Decoder = typeof TextDecoder !== "undefined" ? new TextDecoder("utf8") : undefined;

            function UTF8ArrayToString(heap, idx, maxBytesToRead) {
                var endIdx = idx + maxBytesToRead;
                var endPtr = idx;
                while (heap[endPtr] && !(endPtr >= endIdx)) ++endPtr;
                if (endPtr - idx > 16 && heap.subarray && UTF8Decoder) {
                    return UTF8Decoder.decode(heap.subarray(idx, endPtr))
                } else {
                    var str = "";
                    while (idx < endPtr) {
                        var u0 = heap[idx++];
                        if (!(u0 & 128)) {
                            str += String.fromCharCode(u0);
                            continue
                        }
                        var u1 = heap[idx++] & 63;
                        if ((u0 & 224) == 192) {
                            str += String.fromCharCode((u0 & 31) << 6 | u1);
                            continue
                        }
                        var u2 = heap[idx++] & 63;
                        if ((u0 & 240) == 224) {
                            u0 = (u0 & 15) << 12 | u1 << 6 | u2
                        } else {
                            u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | heap[idx++] & 63
                        }
                        if (u0 < 65536) {
                            str += String.fromCharCode(u0)
                        } else {
                            var ch = u0 - 65536;
                            str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023)
                        }
                    }
                }
                return str
            }

            function UTF8ToString(ptr, maxBytesToRead) {
                return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : ""
            }

            function stringToUTF8Array(str, heap, outIdx, maxBytesToWrite) {
                if (!(maxBytesToWrite > 0)) return 0;
                var startIdx = outIdx;
                var endIdx = outIdx + maxBytesToWrite - 1;
                for (var i = 0; i < str.length; ++i) {
                    var u = str.charCodeAt(i);
                    if (u >= 55296 && u <= 57343) {
                        var u1 = str.charCodeAt(++i);
                        u = 65536 + ((u & 1023) << 10) | u1 & 1023
                    }
                    if (u <= 127) {
                        if (outIdx >= endIdx) break;
                        heap[outIdx++] = u
                    } else if (u <= 2047) {
                        if (outIdx + 1 >= endIdx) break;
                        heap[outIdx++] = 192 | u >> 6;
                        heap[outIdx++] = 128 | u & 63
                    } else if (u <= 65535) {
                        if (outIdx + 2 >= endIdx) break;
                        heap[outIdx++] = 224 | u >> 12;
                        heap[outIdx++] = 128 | u >> 6 & 63;
                        heap[outIdx++] = 128 | u & 63
                    } else {
                        if (outIdx + 3 >= endIdx) break;
                        heap[outIdx++] = 240 | u >> 18;
                        heap[outIdx++] = 128 | u >> 12 & 63;
                        heap[outIdx++] = 128 | u >> 6 & 63;
                        heap[outIdx++] = 128 | u & 63
                    }
                }
                heap[outIdx] = 0;
                return outIdx - startIdx
            }

            function stringToUTF8(str, outPtr, maxBytesToWrite) {
                return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite)
            }

            function lengthBytesUTF8(str) {
                var len = 0;
                for (var i = 0; i < str.length; ++i) {
                    var u = str.charCodeAt(i);
                    if (u >= 55296 && u <= 57343) u = 65536 + ((u & 1023) << 10) | str.charCodeAt(++i) & 1023;
                    if (u <= 127) ++len; else if (u <= 2047) len += 2; else if (u <= 65535) len += 3; else len += 4
                }
                return len
            }

            var UTF16Decoder = typeof TextDecoder !== "undefined" ? new TextDecoder("utf-16le") : undefined;

            function UTF16ToString(ptr, maxBytesToRead) {
                var endPtr = ptr;
                var idx = endPtr >> 1;
                var maxIdx = idx + maxBytesToRead / 2;
                while (!(idx >= maxIdx) && HEAPU16[idx]) ++idx;
                endPtr = idx << 1;
                if (endPtr - ptr > 32 && UTF16Decoder) {
                    return UTF16Decoder.decode(HEAPU8.subarray(ptr, endPtr))
                } else {
                    var str = "";
                    for (var i = 0; !(i >= maxBytesToRead / 2); ++i) {
                        var codeUnit = HEAP16[ptr + i * 2 >> 1];
                        if (codeUnit == 0) break;
                        str += String.fromCharCode(codeUnit)
                    }
                    return str
                }
            }

            function stringToUTF16(str, outPtr, maxBytesToWrite) {
                if (maxBytesToWrite === undefined) {
                    maxBytesToWrite = 2147483647
                }
                if (maxBytesToWrite < 2) return 0;
                maxBytesToWrite -= 2;
                var startPtr = outPtr;
                var numCharsToWrite = maxBytesToWrite < str.length * 2 ? maxBytesToWrite / 2 : str.length;
                for (var i = 0; i < numCharsToWrite; ++i) {
                    var codeUnit = str.charCodeAt(i);
                    HEAP16[outPtr >> 1] = codeUnit;
                    outPtr += 2
                }
                HEAP16[outPtr >> 1] = 0;
                return outPtr - startPtr
            }

            function lengthBytesUTF16(str) {
                return str.length * 2
            }

            function UTF32ToString(ptr, maxBytesToRead) {
                var i = 0;
                var str = "";
                while (!(i >= maxBytesToRead / 4)) {
                    var utf32 = HEAP32[ptr + i * 4 >> 2];
                    if (utf32 == 0) break;
                    ++i;
                    if (utf32 >= 65536) {
                        var ch = utf32 - 65536;
                        str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023)
                    } else {
                        str += String.fromCharCode(utf32)
                    }
                }
                return str
            }

            function stringToUTF32(str, outPtr, maxBytesToWrite) {
                if (maxBytesToWrite === undefined) {
                    maxBytesToWrite = 2147483647
                }
                if (maxBytesToWrite < 4) return 0;
                var startPtr = outPtr;
                var endPtr = startPtr + maxBytesToWrite - 4;
                for (var i = 0; i < str.length; ++i) {
                    var codeUnit = str.charCodeAt(i);
                    if (codeUnit >= 55296 && codeUnit <= 57343) {
                        var trailSurrogate = str.charCodeAt(++i);
                        codeUnit = 65536 + ((codeUnit & 1023) << 10) | trailSurrogate & 1023
                    }
                    HEAP32[outPtr >> 2] = codeUnit;
                    outPtr += 4;
                    if (outPtr + 4 > endPtr) break
                }
                HEAP32[outPtr >> 2] = 0;
                return outPtr - startPtr
            }

            function lengthBytesUTF32(str) {
                var len = 0;
                for (var i = 0; i < str.length; ++i) {
                    var codeUnit = str.charCodeAt(i);
                    if (codeUnit >= 55296 && codeUnit <= 57343) ++i;
                    len += 4
                }
                return len
            }

            function alignUp(x, multiple) {
                if (x % multiple > 0) {
                    x += multiple - x % multiple
                }
                return x
            }

            var buffer, HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;

            function updateGlobalBufferAndViews(buf) {
                buffer = buf;
                Module["HEAP8"] = HEAP8 = new Int8Array(buf);
                Module["HEAP16"] = HEAP16 = new Int16Array(buf);
                Module["HEAP32"] = HEAP32 = new Int32Array(buf);
                Module["HEAPU8"] = HEAPU8 = new Uint8Array(buf);
                Module["HEAPU16"] = HEAPU16 = new Uint16Array(buf);
                Module["HEAPU32"] = HEAPU32 = new Uint32Array(buf);
                Module["HEAPF32"] = HEAPF32 = new Float32Array(buf);
                Module["HEAPF64"] = HEAPF64 = new Float64Array(buf)
            }

            var INITIAL_MEMORY = Module["INITIAL_MEMORY"] || 16777216;
            var wasmTable;
            var __ATPRERUN__ = [];
            var __ATINIT__ = [];
            var __ATMAIN__ = [];
            var __ATPOSTRUN__ = [];
            var runtimeInitialized = false;
            var runtimeExited = false;

            function preRun() {
                if (Module["preRun"]) {
                    if (typeof Module["preRun"] == "function") Module["preRun"] = [Module["preRun"]];
                    while (Module["preRun"].length) {
                        addOnPreRun(Module["preRun"].shift())
                    }
                }
                callRuntimeCallbacks(__ATPRERUN__)
            }

            function initRuntime() {
                runtimeInitialized = true;
                callRuntimeCallbacks(__ATINIT__)
            }

            function preMain() {
                callRuntimeCallbacks(__ATMAIN__)
            }

            function exitRuntime() {
                runtimeExited = true
            }

            function postRun() {
                if (Module["postRun"]) {
                    if (typeof Module["postRun"] == "function") Module["postRun"] = [Module["postRun"]];
                    while (Module["postRun"].length) {
                        addOnPostRun(Module["postRun"].shift())
                    }
                }
                callRuntimeCallbacks(__ATPOSTRUN__)
            }

            function addOnPreRun(cb) {
                __ATPRERUN__.unshift(cb)
            }

            function addOnInit(cb) {
                __ATINIT__.unshift(cb)
            }

            function addOnPostRun(cb) {
                __ATPOSTRUN__.unshift(cb)
            }

            var runDependencies = 0;
            var runDependencyWatcher = null;
            var dependenciesFulfilled = null;

            function addRunDependency(id) {
                runDependencies++;
                if (Module["monitorRunDependencies"]) {
                    Module["monitorRunDependencies"](runDependencies)
                }
            }

            function removeRunDependency(id) {
                runDependencies--;
                if (Module["monitorRunDependencies"]) {
                    Module["monitorRunDependencies"](runDependencies)
                }
                if (runDependencies == 0) {
                    if (runDependencyWatcher !== null) {
                        clearInterval(runDependencyWatcher);
                        runDependencyWatcher = null
                    }
                    if (dependenciesFulfilled) {
                        var callback = dependenciesFulfilled;
                        dependenciesFulfilled = null;
                        callback()
                    }
                }
            }

            Module["preloadedImages"] = {};
            Module["preloadedAudios"] = {};

            function abort(what) {
                if (Module["onAbort"]) {
                    Module["onAbort"](what)
                }
                what += "";
                err(what);
                ABORT = true;
                EXITSTATUS = 1;
                what = "abort(" + what + "). Build with -s ASSERTIONS=1 for more info.";
                var e = new WebAssembly.RuntimeError(what);
                readyPromiseReject(e);
                throw e
            }

            function hasPrefix(str, prefix) {
                return String.prototype.startsWith ? str.startsWith(prefix) : str.indexOf(prefix) === 0
            }

            var dataURIPrefix = "data:application/octet-stream;base64,";

            function isDataURI(filename) {
                return hasPrefix(filename, dataURIPrefix)
            }

            var fileURIPrefix = "file://";

            function isFileURI(filename) {
                return hasPrefix(filename, fileURIPrefix)
            }

            var wasmBinaryFile = "wasm_image_loader.wasm";
            if (!isDataURI(wasmBinaryFile)) {
                wasmBinaryFile = locateFile(wasmBinaryFile)
            }

            function getBinary(file) {
                try {
                    if (file == wasmBinaryFile && wasmBinary) {
                        return new Uint8Array(wasmBinary)
                    }
                    if (readBinary) {
                        return readBinary(file)
                    } else {
                        throw"both async and sync fetching of the wasm failed"
                    }
                } catch (err) {
                    abort(err)
                }
            }

            function getBinaryPromise() {
                if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
                    if (typeof fetch === "function" && !isFileURI(wasmBinaryFile)) {
                        return fetch(wasmBinaryFile, {credentials: "same-origin"}).then(function (response) {
                            if (!response["ok"]) {
                                throw"failed to load wasm binary file at '" + wasmBinaryFile + "'"
                            }
                            return response["arrayBuffer"]()
                        }).catch(function () {
                            return getBinary(wasmBinaryFile)
                        })
                    } else {
                        if (readAsync) {
                            return new Promise(function (resolve, reject) {
                                readAsync(wasmBinaryFile, function (response) {
                                    resolve(new Uint8Array(response))
                                }, reject)
                            })
                        }
                    }
                }
                return Promise.resolve().then(function () {
                    return getBinary(wasmBinaryFile)
                })
            }

            function createWasm() {
                var info = {"a": asmLibraryArg};

                function receiveInstance(instance, module) {
                    var exports = instance.exports;
                    Module["asm"] = exports;
                    wasmMemory = Module["asm"]["x"];
                    updateGlobalBufferAndViews(wasmMemory.buffer);
                    wasmTable = Module["asm"]["B"];
                    addOnInit(Module["asm"]["y"]);
                    removeRunDependency("wasm-instantiate")
                }

                addRunDependency("wasm-instantiate");

                function receiveInstantiatedSource(output) {
                    receiveInstance(output["instance"])
                }

                function instantiateArrayBuffer(receiver) {
                    return getBinaryPromise().then(function (binary) {
                        var result = WebAssembly.instantiate(binary, info);
                        return result
                    }).then(receiver, function (reason) {
                        err("failed to asynchronously prepare wasm: " + reason);
                        abort(reason)
                    })
                }

                function instantiateAsync() {
                    if (!wasmBinary && typeof WebAssembly.instantiateStreaming === "function" && !isDataURI(wasmBinaryFile) && !isFileURI(wasmBinaryFile) && typeof fetch === "function") {
                        return fetch(wasmBinaryFile, {credentials: "same-origin"}).then(function (response) {
                            var result = WebAssembly.instantiateStreaming(response, info);
                            return result.then(receiveInstantiatedSource, function (reason) {
                                err("wasm streaming compile failed: " + reason);
                                err("falling back to ArrayBuffer instantiation");
                                return instantiateArrayBuffer(receiveInstantiatedSource)
                            })
                        })
                    } else {
                        return instantiateArrayBuffer(receiveInstantiatedSource)
                    }
                }

                if (Module["instantiateWasm"]) {
                    try {
                        var exports = Module["instantiateWasm"](info, receiveInstance);
                        return exports
                    } catch (e) {
                        err("Module.instantiateWasm callback failed with error: " + e);
                        return false
                    }
                }
                instantiateAsync().catch(readyPromiseReject);
                return {}
            }

            function callRuntimeCallbacks(callbacks) {
                while (callbacks.length > 0) {
                    var callback = callbacks.shift();
                    if (typeof callback == "function") {
                        callback(Module);
                        continue
                    }
                    var func = callback.func;
                    if (typeof func === "number") {
                        if (callback.arg === undefined) {
                            wasmTable.get(func)()
                        } else {
                            wasmTable.get(func)(callback.arg)
                        }
                    } else {
                        func(callback.arg === undefined ? null : callback.arg)
                    }
                }
            }

            var runtimeKeepaliveCounter = 0;

            function keepRuntimeAlive() {
                return noExitRuntime || runtimeKeepaliveCounter > 0
            }

            function ___assert_fail(condition, filename, line, func) {
                abort("Assertion failed: " + UTF8ToString(condition) + ", at: " + [filename ? UTF8ToString(filename) : "unknown filename", line, func ? UTF8ToString(func) : "unknown function"])
            }

            function getShiftFromSize(size) {
                switch (size) {
                    case 1:
                        return 0;
                    case 2:
                        return 1;
                    case 4:
                        return 2;
                    case 8:
                        return 3;
                    default:
                        throw new TypeError("Unknown type size: " + size)
                }
            }

            function embind_init_charCodes() {
                var codes = new Array(256);
                for (var i = 0; i < 256; ++i) {
                    codes[i] = String.fromCharCode(i)
                }
                embind_charCodes = codes
            }

            var embind_charCodes = undefined;

            function readLatin1String(ptr) {
                var ret = "";
                var c = ptr;
                while (HEAPU8[c]) {
                    ret += embind_charCodes[HEAPU8[c++]]
                }
                return ret
            }

            var awaitingDependencies = {};
            var registeredTypes = {};
            var typeDependencies = {};
            var char_0 = 48;
            var char_9 = 57;

            function makeLegalFunctionName(name) {
                if (undefined === name) {
                    return "_unknown"
                }
                name = name.replace(/[^a-zA-Z0-9_]/g, "$");
                var f = name.charCodeAt(0);
                if (f >= char_0 && f <= char_9) {
                    return "_" + name
                } else {
                    return name
                }
            }

            function createNamedFunction(name, body) {
                name = makeLegalFunctionName(name);
                return new Function("body", "return function " + name + "() {\n" + '    "use strict";' + "    return body.apply(this, arguments);\n" + "};\n")(body)
            }

            function extendError(baseErrorType, errorName) {
                var errorClass = createNamedFunction(errorName, function (message) {
                    this.name = errorName;
                    this.message = message;
                    var stack = new Error(message).stack;
                    if (stack !== undefined) {
                        this.stack = this.toString() + "\n" + stack.replace(/^Error(:[^\n]*)?\n/, "")
                    }
                });
                errorClass.prototype = Object.create(baseErrorType.prototype);
                errorClass.prototype.constructor = errorClass;
                errorClass.prototype.toString = function () {
                    if (this.message === undefined) {
                        return this.name
                    } else {
                        return this.name + ": " + this.message
                    }
                };
                return errorClass
            }

            var BindingError = undefined;

            function throwBindingError(message) {
                throw new BindingError(message)
            }

            var InternalError = undefined;

            function throwInternalError(message) {
                throw new InternalError(message)
            }

            function whenDependentTypesAreResolved(myTypes, dependentTypes, getTypeConverters) {
                myTypes.forEach(function (type) {
                    typeDependencies[type] = dependentTypes
                });

                function onComplete(typeConverters) {
                    var myTypeConverters = getTypeConverters(typeConverters);
                    if (myTypeConverters.length !== myTypes.length) {
                        throwInternalError("Mismatched type converter count")
                    }
                    for (var i = 0; i < myTypes.length; ++i) {
                        registerType(myTypes[i], myTypeConverters[i])
                    }
                }

                var typeConverters = new Array(dependentTypes.length);
                var unregisteredTypes = [];
                var registered = 0;
                dependentTypes.forEach(function (dt, i) {
                    if (registeredTypes.hasOwnProperty(dt)) {
                        typeConverters[i] = registeredTypes[dt]
                    } else {
                        unregisteredTypes.push(dt);
                        if (!awaitingDependencies.hasOwnProperty(dt)) {
                            awaitingDependencies[dt] = []
                        }
                        awaitingDependencies[dt].push(function () {
                            typeConverters[i] = registeredTypes[dt];
                            ++registered;
                            if (registered === unregisteredTypes.length) {
                                onComplete(typeConverters)
                            }
                        })
                    }
                });
                if (0 === unregisteredTypes.length) {
                    onComplete(typeConverters)
                }
            }

            function registerType(rawType, registeredInstance, options) {
                options = options || {};
                if (!("argPackAdvance" in registeredInstance)) {
                    throw new TypeError("registerType registeredInstance requires argPackAdvance")
                }
                var name = registeredInstance.name;
                if (!rawType) {
                    throwBindingError('type "' + name + '" must have a positive integer typeid pointer')
                }
                if (registeredTypes.hasOwnProperty(rawType)) {
                    if (options.ignoreDuplicateRegistrations) {
                        return
                    } else {
                        throwBindingError("Cannot register type '" + name + "' twice")
                    }
                }
                registeredTypes[rawType] = registeredInstance;
                delete typeDependencies[rawType];
                if (awaitingDependencies.hasOwnProperty(rawType)) {
                    var callbacks = awaitingDependencies[rawType];
                    delete awaitingDependencies[rawType];
                    callbacks.forEach(function (cb) {
                        cb()
                    })
                }
            }

            function __embind_register_bool(rawType, name, size, trueValue, falseValue) {
                var shift = getShiftFromSize(size);
                name = readLatin1String(name);
                registerType(rawType, {
                    name: name, "fromWireType": function (wt) {
                        return !!wt
                    }, "toWireType": function (destructors, o) {
                        return o ? trueValue : falseValue
                    }, "argPackAdvance": 8, "readValueFromPointer": function (pointer) {
                        var heap;
                        if (size === 1) {
                            heap = HEAP8
                        } else if (size === 2) {
                            heap = HEAP16
                        } else if (size === 4) {
                            heap = HEAP32
                        } else {
                            throw new TypeError("Unknown boolean type size: " + name)
                        }
                        return this["fromWireType"](heap[pointer >> shift])
                    }, destructorFunction: null
                })
            }

            var emval_free_list = [];
            var emval_handle_array = [{}, {value: undefined}, {value: null}, {value: true}, {value: false}];

            function __emval_decref(handle) {
                if (handle > 4 && 0 === --emval_handle_array[handle].refcount) {
                    emval_handle_array[handle] = undefined;
                    emval_free_list.push(handle)
                }
            }

            function count_emval_handles() {
                var count = 0;
                for (var i = 5; i < emval_handle_array.length; ++i) {
                    if (emval_handle_array[i] !== undefined) {
                        ++count
                    }
                }
                return count
            }

            function get_first_emval() {
                for (var i = 5; i < emval_handle_array.length; ++i) {
                    if (emval_handle_array[i] !== undefined) {
                        return emval_handle_array[i]
                    }
                }
                return null
            }

            function init_emval() {
                Module["count_emval_handles"] = count_emval_handles;
                Module["get_first_emval"] = get_first_emval
            }

            function __emval_register(value) {
                switch (value) {
                    case undefined: {
                        return 1
                    }
                    case null: {
                        return 2
                    }
                    case true: {
                        return 3
                    }
                    case false: {
                        return 4
                    }
                    default: {
                        var handle = emval_free_list.length ? emval_free_list.pop() : emval_handle_array.length;
                        emval_handle_array[handle] = {refcount: 1, value: value};
                        return handle
                    }
                }
            }

            function simpleReadValueFromPointer(pointer) {
                return this["fromWireType"](HEAPU32[pointer >> 2])
            }

            function __embind_register_emval(rawType, name) {
                name = readLatin1String(name);
                registerType(rawType, {
                    name: name, "fromWireType": function (handle) {
                        var rv = emval_handle_array[handle].value;
                        __emval_decref(handle);
                        return rv
                    }, "toWireType": function (destructors, value) {
                        return __emval_register(value)
                    }, "argPackAdvance": 8, "readValueFromPointer": simpleReadValueFromPointer, destructorFunction: null
                })
            }

            function ensureOverloadTable(proto, methodName, humanName) {
                if (undefined === proto[methodName].overloadTable) {
                    var prevFunc = proto[methodName];
                    proto[methodName] = function () {
                        if (!proto[methodName].overloadTable.hasOwnProperty(arguments.length)) {
                            throwBindingError("Function '" + humanName + "' called with an invalid number of arguments (" + arguments.length + ") - expects one of (" + proto[methodName].overloadTable + ")!")
                        }
                        return proto[methodName].overloadTable[arguments.length].apply(this, arguments)
                    };
                    proto[methodName].overloadTable = [];
                    proto[methodName].overloadTable[prevFunc.argCount] = prevFunc
                }
            }

            function exposePublicSymbol(name, value, numArguments) {
                if (Module.hasOwnProperty(name)) {
                    if (undefined === numArguments || undefined !== Module[name].overloadTable && undefined !== Module[name].overloadTable[numArguments]) {
                        throwBindingError("Cannot register public name '" + name + "' twice")
                    }
                    ensureOverloadTable(Module, name, name);
                    if (Module.hasOwnProperty(numArguments)) {
                        throwBindingError("Cannot register multiple overloads of a function with the same number of arguments (" + numArguments + ")!")
                    }
                    Module[name].overloadTable[numArguments] = value
                } else {
                    Module[name] = value;
                    if (undefined !== numArguments) {
                        Module[name].numArguments = numArguments
                    }
                }
            }

            function enumReadValueFromPointer(name, shift, signed) {
                switch (shift) {
                    case 0:
                        return function (pointer) {
                            var heap = signed ? HEAP8 : HEAPU8;
                            return this["fromWireType"](heap[pointer])
                        };
                    case 1:
                        return function (pointer) {
                            var heap = signed ? HEAP16 : HEAPU16;
                            return this["fromWireType"](heap[pointer >> 1])
                        };
                    case 2:
                        return function (pointer) {
                            var heap = signed ? HEAP32 : HEAPU32;
                            return this["fromWireType"](heap[pointer >> 2])
                        };
                    default:
                        throw new TypeError("Unknown integer type: " + name)
                }
            }

            function __embind_register_enum(rawType, name, size, isSigned) {
                var shift = getShiftFromSize(size);
                name = readLatin1String(name);

                function ctor() {
                }

                ctor.values = {};
                registerType(rawType, {
                    name: name,
                    constructor: ctor,
                    "fromWireType": function (c) {
                        return this.constructor.values[c]
                    },
                    "toWireType": function (destructors, c) {
                        return c.value
                    },
                    "argPackAdvance": 8,
                    "readValueFromPointer": enumReadValueFromPointer(name, shift, isSigned),
                    destructorFunction: null
                });
                exposePublicSymbol(name, ctor)
            }

            function getTypeName(type) {
                var ptr = ___getTypeName(type);
                var rv = readLatin1String(ptr);
                _free(ptr);
                return rv
            }

            function requireRegisteredType(rawType, humanName) {
                var impl = registeredTypes[rawType];
                if (undefined === impl) {
                    throwBindingError(humanName + " has unknown type " + getTypeName(rawType))
                }
                return impl
            }

            function __embind_register_enum_value(rawEnumType, name, enumValue) {
                var enumType = requireRegisteredType(rawEnumType, "enum");
                name = readLatin1String(name);
                var Enum = enumType.constructor;
                var Value = Object.create(enumType.constructor.prototype, {
                    value: {value: enumValue},
                    constructor: {
                        value: createNamedFunction(enumType.name + "_" + name, function () {
                        })
                    }
                });
                Enum.values[enumValue] = Value;
                Enum[name] = Value
            }

            function _embind_repr(v) {
                if (v === null) {
                    return "null"
                }
                var t = typeof v;
                if (t === "object" || t === "array" || t === "function") {
                    return v.toString()
                } else {
                    return "" + v
                }
            }

            function floatReadValueFromPointer(name, shift) {
                switch (shift) {
                    case 2:
                        return function (pointer) {
                            return this["fromWireType"](HEAPF32[pointer >> 2])
                        };
                    case 3:
                        return function (pointer) {
                            return this["fromWireType"](HEAPF64[pointer >> 3])
                        };
                    default:
                        throw new TypeError("Unknown float type: " + name)
                }
            }

            function __embind_register_float(rawType, name, size) {
                var shift = getShiftFromSize(size);
                name = readLatin1String(name);
                registerType(rawType, {
                    name: name,
                    "fromWireType": function (value) {
                        return value
                    },
                    "toWireType": function (destructors, value) {
                        if (typeof value !== "number" && typeof value !== "boolean") {
                            throw new TypeError('Cannot convert "' + _embind_repr(value) + '" to ' + this.name)
                        }
                        return value
                    },
                    "argPackAdvance": 8,
                    "readValueFromPointer": floatReadValueFromPointer(name, shift),
                    destructorFunction: null
                })
            }

            function new_(constructor, argumentList) {
                if (!(constructor instanceof Function)) {
                    throw new TypeError("new_ called with constructor type " + typeof constructor + " which is not a function")
                }
                var dummy = createNamedFunction(constructor.name || "unknownFunctionName", function () {
                });
                dummy.prototype = constructor.prototype;
                var obj = new dummy;
                var r = constructor.apply(obj, argumentList);
                return r instanceof Object ? r : obj
            }

            function runDestructors(destructors) {
                while (destructors.length) {
                    var ptr = destructors.pop();
                    var del = destructors.pop();
                    del(ptr)
                }
            }

            function craftInvokerFunction(humanName, argTypes, classType, cppInvokerFunc, cppTargetFunc) {
                var argCount = argTypes.length;
                if (argCount < 2) {
                    throwBindingError("argTypes array size mismatch! Must at least get return value and 'this' types!")
                }
                var isClassMethodFunc = argTypes[1] !== null && classType !== null;
                var needsDestructorStack = false;
                for (var i = 1; i < argTypes.length; ++i) {
                    if (argTypes[i] !== null && argTypes[i].destructorFunction === undefined) {
                        needsDestructorStack = true;
                        break
                    }
                }
                var returns = argTypes[0].name !== "void";
                var argsList = "";
                var argsListWired = "";
                for (var i = 0; i < argCount - 2; ++i) {
                    argsList += (i !== 0 ? ", " : "") + "arg" + i;
                    argsListWired += (i !== 0 ? ", " : "") + "arg" + i + "Wired"
                }
                var invokerFnBody = "return function " + makeLegalFunctionName(humanName) + "(" + argsList + ") {\n" + "if (arguments.length !== " + (argCount - 2) + ") {\n" + "throwBindingError('function " + humanName + " called with ' + arguments.length + ' arguments, expected " + (argCount - 2) + " args!');\n" + "}\n";
                if (needsDestructorStack) {
                    invokerFnBody += "var destructors = [];\n"
                }
                var dtorStack = needsDestructorStack ? "destructors" : "null";
                var args1 = ["throwBindingError", "invoker", "fn", "runDestructors", "retType", "classParam"];
                var args2 = [throwBindingError, cppInvokerFunc, cppTargetFunc, runDestructors, argTypes[0], argTypes[1]];
                if (isClassMethodFunc) {
                    invokerFnBody += "var thisWired = classParam.toWireType(" + dtorStack + ", this);\n"
                }
                for (var i = 0; i < argCount - 2; ++i) {
                    invokerFnBody += "var arg" + i + "Wired = argType" + i + ".toWireType(" + dtorStack + ", arg" + i + "); // " + argTypes[i + 2].name + "\n";
                    args1.push("argType" + i);
                    args2.push(argTypes[i + 2])
                }
                if (isClassMethodFunc) {
                    argsListWired = "thisWired" + (argsListWired.length > 0 ? ", " : "") + argsListWired
                }
                invokerFnBody += (returns ? "var rv = " : "") + "invoker(fn" + (argsListWired.length > 0 ? ", " : "") + argsListWired + ");\n";
                if (needsDestructorStack) {
                    invokerFnBody += "runDestructors(destructors);\n"
                } else {
                    for (var i = isClassMethodFunc ? 1 : 2; i < argTypes.length; ++i) {
                        var paramName = i === 1 ? "thisWired" : "arg" + (i - 2) + "Wired";
                        if (argTypes[i].destructorFunction !== null) {
                            invokerFnBody += paramName + "_dtor(" + paramName + "); // " + argTypes[i].name + "\n";
                            args1.push(paramName + "_dtor");
                            args2.push(argTypes[i].destructorFunction)
                        }
                    }
                }
                if (returns) {
                    invokerFnBody += "var ret = retType.fromWireType(rv);\n" + "return ret;\n"
                } else {
                }
                invokerFnBody += "}\n";
                args1.push(invokerFnBody);
                var invokerFunction = new_(Function, args1).apply(null, args2);
                return invokerFunction
            }

            function heap32VectorToArray(count, firstElement) {
                var array = [];
                for (var i = 0; i < count; i++) {
                    array.push(HEAP32[(firstElement >> 2) + i])
                }
                return array
            }

            function replacePublicSymbol(name, value, numArguments) {
                if (!Module.hasOwnProperty(name)) {
                    throwInternalError("Replacing nonexistant public symbol")
                }
                if (undefined !== Module[name].overloadTable && undefined !== numArguments) {
                    Module[name].overloadTable[numArguments] = value
                } else {
                    Module[name] = value;
                    Module[name].argCount = numArguments
                }
            }

            function dynCallLegacy(sig, ptr, args) {
                var f = Module["dynCall_" + sig];
                return args && args.length ? f.apply(null, [ptr].concat(args)) : f.call(null, ptr)
            }

            function dynCall(sig, ptr, args) {
                if (sig.indexOf("j") != -1) {
                    return dynCallLegacy(sig, ptr, args)
                }
                return wasmTable.get(ptr).apply(null, args)
            }

            function getDynCaller(sig, ptr) {
                var argCache = [];
                return function () {
                    argCache.length = arguments.length;
                    for (var i = 0; i < arguments.length; i++) {
                        argCache[i] = arguments[i]
                    }
                    return dynCall(sig, ptr, argCache)
                }
            }

            function embind__requireFunction(signature, rawFunction) {
                signature = readLatin1String(signature);

                function makeDynCaller() {
                    if (signature.indexOf("j") != -1) {
                        return getDynCaller(signature, rawFunction)
                    }
                    return wasmTable.get(rawFunction)
                }

                var fp = makeDynCaller();
                if (typeof fp !== "function") {
                    throwBindingError("unknown function pointer with signature " + signature + ": " + rawFunction)
                }
                return fp
            }

            var UnboundTypeError = undefined;

            function throwUnboundTypeError(message, types) {
                var unboundTypes = [];
                var seen = {};

                function visit(type) {
                    if (seen[type]) {
                        return
                    }
                    if (registeredTypes[type]) {
                        return
                    }
                    if (typeDependencies[type]) {
                        typeDependencies[type].forEach(visit);
                        return
                    }
                    unboundTypes.push(type);
                    seen[type] = true
                }

                types.forEach(visit);
                throw new UnboundTypeError(message + ": " + unboundTypes.map(getTypeName).join([", "]))
            }

            function __embind_register_function(name, argCount, rawArgTypesAddr, signature, rawInvoker, fn) {
                var argTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
                name = readLatin1String(name);
                rawInvoker = embind__requireFunction(signature, rawInvoker);
                exposePublicSymbol(name, function () {
                    throwUnboundTypeError("Cannot call " + name + " due to unbound types", argTypes)
                }, argCount - 1);
                whenDependentTypesAreResolved([], argTypes, function (argTypes) {
                    var invokerArgsArray = [argTypes[0], null].concat(argTypes.slice(1));
                    replacePublicSymbol(name, craftInvokerFunction(name, invokerArgsArray, null, rawInvoker, fn), argCount - 1);
                    return []
                })
            }

            function integerReadValueFromPointer(name, shift, signed) {
                switch (shift) {
                    case 0:
                        return signed ? function readS8FromPointer(pointer) {
                            return HEAP8[pointer]
                        } : function readU8FromPointer(pointer) {
                            return HEAPU8[pointer]
                        };
                    case 1:
                        return signed ? function readS16FromPointer(pointer) {
                            return HEAP16[pointer >> 1]
                        } : function readU16FromPointer(pointer) {
                            return HEAPU16[pointer >> 1]
                        };
                    case 2:
                        return signed ? function readS32FromPointer(pointer) {
                            return HEAP32[pointer >> 2]
                        } : function readU32FromPointer(pointer) {
                            return HEAPU32[pointer >> 2]
                        };
                    default:
                        throw new TypeError("Unknown integer type: " + name)
                }
            }

            function __embind_register_integer(primitiveType, name, size, minRange, maxRange) {
                name = readLatin1String(name);
                if (maxRange === -1) {
                    maxRange = 4294967295
                }
                var shift = getShiftFromSize(size);
                var fromWireType = function (value) {
                    return value
                };
                if (minRange === 0) {
                    var bitshift = 32 - 8 * size;
                    fromWireType = function (value) {
                        return value << bitshift >>> bitshift
                    }
                }
                var isUnsignedType = name.indexOf("unsigned") != -1;
                registerType(primitiveType, {
                    name: name,
                    "fromWireType": fromWireType,
                    "toWireType": function (destructors, value) {
                        if (typeof value !== "number" && typeof value !== "boolean") {
                            throw new TypeError('Cannot convert "' + _embind_repr(value) + '" to ' + this.name)
                        }
                        if (value < minRange || value > maxRange) {
                            throw new TypeError('Passing a number "' + _embind_repr(value) + '" from JS side to C/C++ side to an argument of type "' + name + '", which is outside the valid range [' + minRange + ", " + maxRange + "]!")
                        }
                        return isUnsignedType ? value >>> 0 : value | 0
                    },
                    "argPackAdvance": 8,
                    "readValueFromPointer": integerReadValueFromPointer(name, shift, minRange !== 0),
                    destructorFunction: null
                })
            }

            function __embind_register_memory_view(rawType, dataTypeIndex, name) {
                var typeMapping = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array];
                var TA = typeMapping[dataTypeIndex];

                function decodeMemoryView(handle) {
                    handle = handle >> 2;
                    var heap = HEAPU32;
                    var size = heap[handle];
                    var data = heap[handle + 1];
                    return new TA(buffer, data, size)
                }

                name = readLatin1String(name);
                registerType(rawType, {
                    name: name,
                    "fromWireType": decodeMemoryView,
                    "argPackAdvance": 8,
                    "readValueFromPointer": decodeMemoryView
                }, {ignoreDuplicateRegistrations: true})
            }

            function __embind_register_std_string(rawType, name) {
                name = readLatin1String(name);
                var stdStringIsUTF8 = name === "std::string";
                registerType(rawType, {
                    name: name,
                    "fromWireType": function (value) {
                        var length = HEAPU32[value >> 2];
                        var str;
                        if (stdStringIsUTF8) {
                            var decodeStartPtr = value + 4;
                            for (var i = 0; i <= length; ++i) {
                                var currentBytePtr = value + 4 + i;
                                if (i == length || HEAPU8[currentBytePtr] == 0) {
                                    var maxRead = currentBytePtr - decodeStartPtr;
                                    var stringSegment = UTF8ToString(decodeStartPtr, maxRead);
                                    if (str === undefined) {
                                        str = stringSegment
                                    } else {
                                        str += String.fromCharCode(0);
                                        str += stringSegment
                                    }
                                    decodeStartPtr = currentBytePtr + 1
                                }
                            }
                        } else {
                            var a = new Array(length);
                            for (var i = 0; i < length; ++i) {
                                a[i] = String.fromCharCode(HEAPU8[value + 4 + i])
                            }
                            str = a.join("")
                        }
                        _free(value);
                        return str
                    },
                    "toWireType": function (destructors, value) {
                        if (value instanceof ArrayBuffer) {
                            value = new Uint8Array(value)
                        }
                        var getLength;
                        var valueIsOfTypeString = typeof value === "string";
                        if (!(valueIsOfTypeString || value instanceof Uint8Array || value instanceof Uint8ClampedArray || value instanceof Int8Array)) {
                            throwBindingError("Cannot pass non-string to std::string")
                        }
                        if (stdStringIsUTF8 && valueIsOfTypeString) {
                            getLength = function () {
                                return lengthBytesUTF8(value)
                            }
                        } else {
                            getLength = function () {
                                return value.length
                            }
                        }
                        var length = getLength();
                        var ptr = _malloc(4 + length + 1);
                        HEAPU32[ptr >> 2] = length;
                        if (stdStringIsUTF8 && valueIsOfTypeString) {
                            stringToUTF8(value, ptr + 4, length + 1)
                        } else {
                            if (valueIsOfTypeString) {
                                for (var i = 0; i < length; ++i) {
                                    var charCode = value.charCodeAt(i);
                                    if (charCode > 255) {
                                        _free(ptr);
                                        throwBindingError("String has UTF-16 code units that do not fit in 8 bits")
                                    }
                                    HEAPU8[ptr + 4 + i] = charCode
                                }
                            } else {
                                for (var i = 0; i < length; ++i) {
                                    HEAPU8[ptr + 4 + i] = value[i]
                                }
                            }
                        }
                        if (destructors !== null) {
                            destructors.push(_free, ptr)
                        }
                        return ptr
                    },
                    "argPackAdvance": 8,
                    "readValueFromPointer": simpleReadValueFromPointer,
                    destructorFunction: function (ptr) {
                        _free(ptr)
                    }
                })
            }

            function __embind_register_std_wstring(rawType, charSize, name) {
                name = readLatin1String(name);
                var decodeString, encodeString, getHeap, lengthBytesUTF, shift;
                if (charSize === 2) {
                    decodeString = UTF16ToString;
                    encodeString = stringToUTF16;
                    lengthBytesUTF = lengthBytesUTF16;
                    getHeap = function () {
                        return HEAPU16
                    };
                    shift = 1
                } else if (charSize === 4) {
                    decodeString = UTF32ToString;
                    encodeString = stringToUTF32;
                    lengthBytesUTF = lengthBytesUTF32;
                    getHeap = function () {
                        return HEAPU32
                    };
                    shift = 2
                }
                registerType(rawType, {
                    name: name,
                    "fromWireType": function (value) {
                        var length = HEAPU32[value >> 2];
                        var HEAP = getHeap();
                        var str;
                        var decodeStartPtr = value + 4;
                        for (var i = 0; i <= length; ++i) {
                            var currentBytePtr = value + 4 + i * charSize;
                            if (i == length || HEAP[currentBytePtr >> shift] == 0) {
                                var maxReadBytes = currentBytePtr - decodeStartPtr;
                                var stringSegment = decodeString(decodeStartPtr, maxReadBytes);
                                if (str === undefined) {
                                    str = stringSegment
                                } else {
                                    str += String.fromCharCode(0);
                                    str += stringSegment
                                }
                                decodeStartPtr = currentBytePtr + charSize
                            }
                        }
                        _free(value);
                        return str
                    },
                    "toWireType": function (destructors, value) {
                        if (!(typeof value === "string")) {
                            throwBindingError("Cannot pass non-string to C++ string type " + name)
                        }
                        var length = lengthBytesUTF(value);
                        var ptr = _malloc(4 + length + charSize);
                        HEAPU32[ptr >> 2] = length >> shift;
                        encodeString(value, ptr + 4, length + charSize);
                        if (destructors !== null) {
                            destructors.push(_free, ptr)
                        }
                        return ptr
                    },
                    "argPackAdvance": 8,
                    "readValueFromPointer": simpleReadValueFromPointer,
                    destructorFunction: function (ptr) {
                        _free(ptr)
                    }
                })
            }

            function __embind_register_void(rawType, name) {
                name = readLatin1String(name);
                registerType(rawType, {
                    isVoid: true, name: name, "argPackAdvance": 0, "fromWireType": function () {
                        return undefined
                    }, "toWireType": function (destructors, o) {
                        return undefined
                    }
                })
            }

            function __emval_incref(handle) {
                if (handle > 4) {
                    emval_handle_array[handle].refcount += 1
                }
            }

            var emval_symbols = {};

            function getStringOrSymbol(address) {
                var symbol = emval_symbols[address];
                if (symbol === undefined) {
                    return readLatin1String(address)
                } else {
                    return symbol
                }
            }

            function __emval_new_cstring(v) {
                return __emval_register(getStringOrSymbol(v))
            }

            function __emval_new_object() {
                return __emval_register({})
            }

            function requireHandle(handle) {
                if (!handle) {
                    throwBindingError("Cannot use deleted val. handle = " + handle)
                }
                return emval_handle_array[handle].value
            }

            function __emval_set_property(handle, key, value) {
                handle = requireHandle(handle);
                key = requireHandle(key);
                value = requireHandle(value);
                handle[key] = value
            }

            function __emval_take_value(type, argv) {
                type = requireRegisteredType(type, "_emval_take_value");
                var v = type["readValueFromPointer"](argv);
                return __emval_register(v)
            }

            function _abort() {
                abort()
            }

            function emscripten_realloc_buffer(size) {
                try {
                    wasmMemory.grow(size - buffer.byteLength + 65535 >>> 16);
                    updateGlobalBufferAndViews(wasmMemory.buffer);
                    return 1
                } catch (e) {
                }
            }

            function _emscripten_resize_heap(requestedSize) {
                var oldSize = HEAPU8.length;
                requestedSize = requestedSize >>> 0;
                var maxHeapSize = 2147483648;
                if (requestedSize > maxHeapSize) {
                    return false
                }
                for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
                    var overGrownHeapSize = oldSize * (1 + .2 / cutDown);
                    overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);
                    var newSize = Math.min(maxHeapSize, alignUp(Math.max(requestedSize, overGrownHeapSize), 65536));
                    var replacement = emscripten_realloc_buffer(newSize);
                    if (replacement) {
                        return true
                    }
                }
                return false
            }

            function _exit(status) {
                exit(status)
            }

            var SYSCALLS = {
                mappings: {}, buffers: [null, [], []], printChar: function (stream, curr) {
                    var buffer = SYSCALLS.buffers[stream];
                    if (curr === 0 || curr === 10) {
                        (stream === 1 ? out : err)(UTF8ArrayToString(buffer, 0));
                        buffer.length = 0
                    } else {
                        buffer.push(curr)
                    }
                }, varargs: undefined, get: function () {
                    SYSCALLS.varargs += 4;
                    var ret = HEAP32[SYSCALLS.varargs - 4 >> 2];
                    return ret
                }, getStr: function (ptr) {
                    var ret = UTF8ToString(ptr);
                    return ret
                }, get64: function (low, high) {
                    return low
                }
            };

            function _fd_write(fd, iov, iovcnt, pnum) {
                var num = 0;
                for (var i = 0; i < iovcnt; i++) {
                    var ptr = HEAP32[iov + i * 8 >> 2];
                    var len = HEAP32[iov + (i * 8 + 4) >> 2];
                    for (var j = 0; j < len; j++) {
                        SYSCALLS.printChar(fd, HEAPU8[ptr + j])
                    }
                    num += len
                }
                HEAP32[pnum >> 2] = num;
                return 0
            }

            function _setTempRet0($i) {
                setTempRet0($i | 0)
            }

            embind_init_charCodes();
            BindingError = Module["BindingError"] = extendError(Error, "BindingError");
            InternalError = Module["InternalError"] = extendError(Error, "InternalError");
            init_emval();
            UnboundTypeError = Module["UnboundTypeError"] = extendError(Error, "UnboundTypeError");
            var asmLibraryArg = {
                "a": ___assert_fail,
                "u": __embind_register_bool,
                "t": __embind_register_emval,
                "n": __embind_register_enum,
                "m": __embind_register_enum_value,
                "i": __embind_register_float,
                "d": __embind_register_function,
                "c": __embind_register_integer,
                "b": __embind_register_memory_view,
                "j": __embind_register_std_string,
                "e": __embind_register_std_wstring,
                "v": __embind_register_void,
                "o": __emval_decref,
                "w": __emval_incref,
                "l": __emval_new_cstring,
                "q": __emval_new_object,
                "p": __emval_set_property,
                "g": __emval_take_value,
                "f": _abort,
                "s": _emscripten_resize_heap,
                "k": _exit,
                "h": _fd_write,
                "r": _setTempRet0
            };
            var asm = createWasm();
            var ___wasm_call_ctors = Module["___wasm_call_ctors"] = function () {
                return (___wasm_call_ctors = Module["___wasm_call_ctors"] = Module["asm"]["y"]).apply(null, arguments)
            };
            var _free = Module["_free"] = function () {
                return (_free = Module["_free"] = Module["asm"]["z"]).apply(null, arguments)
            };
            var _malloc = Module["_malloc"] = function () {
                return (_malloc = Module["_malloc"] = Module["asm"]["A"]).apply(null, arguments)
            };
            var ___getTypeName = Module["___getTypeName"] = function () {
                return (___getTypeName = Module["___getTypeName"] = Module["asm"]["C"]).apply(null, arguments)
            };
            var ___embind_register_native_and_builtin_types = Module["___embind_register_native_and_builtin_types"] = function () {
                return (___embind_register_native_and_builtin_types = Module["___embind_register_native_and_builtin_types"] = Module["asm"]["D"]).apply(null, arguments)
            };
            var dynCall_jiji = Module["dynCall_jiji"] = function () {
                return (dynCall_jiji = Module["dynCall_jiji"] = Module["asm"]["E"]).apply(null, arguments)
            };
            var calledRun;

            function ExitStatus(status) {
                this.name = "ExitStatus";
                this.message = "Program terminated with exit(" + status + ")";
                this.status = status
            }

            dependenciesFulfilled = function runCaller() {
                if (!calledRun) run();
                if (!calledRun) dependenciesFulfilled = runCaller
            };

            function run(args) {
                args = args || arguments_;
                if (runDependencies > 0) {
                    return
                }
                preRun();
                if (runDependencies > 0) {
                    return
                }

                function doRun() {
                    if (calledRun) return;
                    calledRun = true;
                    Module["calledRun"] = true;
                    if (ABORT) return;
                    initRuntime();
                    preMain();
                    readyPromiseResolve(Module);
                    if (Module["onRuntimeInitialized"]) Module["onRuntimeInitialized"]();
                    postRun()
                }

                if (Module["setStatus"]) {
                    Module["setStatus"]("Running...");
                    setTimeout(function () {
                        setTimeout(function () {
                            Module["setStatus"]("")
                        }, 1);
                        doRun()
                    }, 1)
                } else {
                    doRun()
                }
            }

            Module["run"] = run;

            function exit(status, implicit) {
                EXITSTATUS = status;
                if (implicit && keepRuntimeAlive() && status === 0) {
                    return
                }
                if (keepRuntimeAlive()) {
                } else {
                    exitRuntime();
                    if (Module["onExit"]) Module["onExit"](status);
                    ABORT = true
                }
                quit_(status, new ExitStatus(status))
            }

            if (Module["preInit"]) {
                if (typeof Module["preInit"] == "function") Module["preInit"] = [Module["preInit"]];
                while (Module["preInit"].length > 0) {
                    Module["preInit"].pop()()
                }
            }
            run();


            return wasm_image_loader.ready
        }
    );
})();


// 透明度问题
const IMG_CONVERT_OPTIONS = {
    quality: 75, // -q
    target_size: 0,
    target_PSNR: 0, // Peak Signal to Noise Ratio 信噪比
    method: 4,
    sns_strength: 50,
    filter_strength: 60,
    filter_sharpness: 0,
    filter_type: 1,
    partitions: 0,
    segments: 4,
    pass: 1,
    show_compressed: 0,
    preprocessing: 0,
    autofilter: 0,
    partition_limit: 0,
    alpha_compression: 1,
    alpha_filtering: 1,
    alpha_quality: 100,
    lossless: 0, // 无损
    exact: 0,
    image_hint: 0,
    emulate_jpeg_size: 0,
    thread_level: 0,
    low_memory: 0,
    near_lossless: 100,
    use_delta_palette: 0,
    use_sharp_yuv: 0
};

console.warn("【----------------】", self);

// jpeg or png 解码器
let imageLoaderModule = {
    decode: null,
    resize: null,
    free: null,
    dimensions: null
};
let imgCoder = {
    encode: null,
    decode: null,
    free: null,
    dimensions: null
};

let loaderInitState = INIT_STATE.WAIT;
let coderInitState = INIT_STATE.WAIT;

function notifyInitSuccessIfNeed() {
    console.log("### worker thread: ", loaderInitState, "  ", coderInitState);
    if(loaderInitState === INIT_STATE.OK && coderInitState === INIT_STATE.OK){
        postMessage({code: INIT_STATE.OK, message: "worker初始化完成", data: null});
    }
}
function notifyInitFail(){
    postMessage({code: INIT_STATE.FAIL, mesage: "worker 初始化失败"});
    autoClose();
}

function autoClose(){
    setTimeout(() => {
        postMessage({code: INIT_STATE.CLOSE, message: "自动关闭子线程"});
    }, 300);
}

// Initialize the WebAssembly Module
wasmImageLoader({
    onRuntimeInitialized() {
        console.log("###wasmImageLoader onRuntimeInitialized");
    }
}).then(resp => { // ImageLoaderModule
    console.log("###图片加载器初始化成功");
    // const { decode, dimensions, free, resize } = resp;
    imageLoaderModule = resp;
    loaderInitState = INIT_STATE.OK;
    notifyInitSuccessIfNeed();
}).catch(err => {
    console.error("###图片加载器初始化失败：", err);
    loaderInitState = INIT_STATE.FAIL;
    notifyInitFail();
});
wasmWebp({
    onRuntimeInitialized() {
        console.log("###wasmWebp onRuntimeInitialized");
    }
}).then(resp => {
    console.log("###图片解码器初始化成功");
    imgCoder = resp;
    coderInitState = INIT_STATE.OK;
    notifyInitSuccessIfNeed();
}).catch(err => {
    console.error("###图片解码器初始化失败：", err);
    coderInitState = INIT_STATE.FAIL;
    notifyInitFail();
});

onmessage = function (oEvent) {
    console.log("worker子线程: ", oEvent);
    if (loaderInitState === INIT_STATE.WAIT || coderInitState === INIT_STATE.WAIT) {
        // postMessage({code: SCHEDULE_STATE.FAIL, message: "初始化未完成"})
        return;
    } else if (loaderInitState === INIT_STATE.FAIL || coderInitState === INIT_STATE.FAIL) {
        // postMessage({code: SCHEDULE_STATE.FAIL, message: "初始化失败"})
        return;
    }

    if (oEvent.data.code === 1) {
        postMessage({code: INIT_STATE.OK, data: {code: SCHEDULE_STATE.READING}});
        const originalFile = oEvent.data.file;
        let fileReader = new FileReader(originalFile);
        fileReader.readAsArrayBuffer(originalFile);
        fileReader.onload = () => {
            console.log("#worker onload: ", fileReader.result);

            const fileArray = new Uint8Array(fileReader.result);
            postMessage({code: INIT_STATE.OK, data: {code: SCHEDULE_STATE.TRANSCODING}});
            // 3 if RGB, 4 if Alpha channel is present (e.g. PNG)
            const decodeBuffer = imageLoaderModule.decode(fileArray, fileArray.length, 4);
            console.log("decodeBuffer: ", decodeBuffer);
            const {channels, height, width} = imageLoaderModule.dimensions();
            console.log(`channels: ${channels}  width: ${width}  height: ${height}`);
            const encodedWebp = imgCoder.encode(decodeBuffer, width, height, channels, IMG_CONVERT_OPTIONS /*defaultOptions*/);
            console.log("encodedWebp: ", encodedWebp);

            const newBlob = new Blob([encodedWebp], {type: "image/webp"}); // BlobBuilder
            const newFile = new File([newBlob], "new.webp", {type: "image/webp"});

            // 释放资源
            imageLoaderModule.free();
            imgCoder.free();

            postMessage({code: INIT_STATE.OK, data: {code: SCHEDULE_STATE.DONE, webpFile: newFile}});
            autoClose();
        };
        fileReader.onerror = err => {
            console.error("onerror: ", err, " fileReader.error: ", fileReader.error.code, " msg: ", fileReader.error.message);
            postMessage({code: INIT_STATE.OK, data: {code: SCHEDULE_STATE.FAIL, webpFile: null, error: err}});
            autoClose();
        };
    } else if(oEvent.data.code === -1){
        // 停止线程
        autoClose();
    }
    // postMessage({status: Boolean(true), data: data});
};

onerror = function (err) {
    console.error("There is an error with your worker!", err);
    postMessage({code: -1, message: err.message});
};

// 部分浏览器不支持此特性
// onmessageerror = function () {
//   console.log("webWorker onmessageerror");
// }
