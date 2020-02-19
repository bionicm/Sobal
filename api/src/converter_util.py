import json
from struct import *

class ConverterUtil:
    __instance = None

    def __new__(cls):
        if cls.__instance is None:
            cls.__instance = super().__new__(cls)
        return cls.__instance

    def to_json(self, application_exception):
        return {'error_code': application_exception.error_code}

    def to_bytes(self, value):
        return pack('>B', value)

    def to_2bytes(self, value):
        return pack('>H', value)

    def to_4bytes(self, value):
        return pack('>f', value)
        
    def to_uint16(self, two_bytes):
        return unpack('>H', two_bytes)[0]

    def to_float(self, four_bytes):
        return unpack('>f', four_bytes)[0]