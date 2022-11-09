// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('grpc');
var stt_pb = require('./stt_pb.js');

function serialize_SpeechToText_SpeechChunk(arg) {
  if (!(arg instanceof stt_pb.SpeechChunk)) {
    throw new Error('Expected argument of type SpeechToText.SpeechChunk');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_SpeechToText_SpeechChunk(buffer_arg) {
  return stt_pb.SpeechChunk.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_SpeechToText_TranscriptChunk(arg) {
  if (!(arg instanceof stt_pb.TranscriptChunk)) {
    throw new Error('Expected argument of type SpeechToText.TranscriptChunk');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_SpeechToText_TranscriptChunk(buffer_arg) {
  return stt_pb.TranscriptChunk.deserializeBinary(new Uint8Array(buffer_arg));
}


// The Listener service definition.
var ListenerService = exports.ListenerService = {
  doSpeechToText: {
    path: '/SpeechToText.Listener/DoSpeechToText',
    requestStream: true,
    responseStream: true,
    requestType: stt_pb.SpeechChunk,
    responseType: stt_pb.TranscriptChunk,
    requestSerialize: serialize_SpeechToText_SpeechChunk,
    requestDeserialize: deserialize_SpeechToText_SpeechChunk,
    responseSerialize: serialize_SpeechToText_TranscriptChunk,
    responseDeserialize: deserialize_SpeechToText_TranscriptChunk,
  },
};

exports.ListenerClient = grpc.makeGenericClientConstructor(ListenerService);
