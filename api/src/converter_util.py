import sys
sys.path.append('lib')
import numpy as np

class ConverterUtil:
    __instance = None

    def __new__(cls):
        if cls.__instance is None:
            cls.__instance = super().__new__(cls)
        return cls.__instance

    def to_json(self, application_exception):
        return {'error_code': application_exception.error_code}

    def to_bytes(self, value):
        ndarray = np.array([value], dtype='>u1')
        return ndarray.tobytes()

    def to_2bytes(self, value):
        ndarray = np.array([value], dtype='>u2')
        return ndarray.tobytes()

    def to_4bytes(self, value):
        ndarray = np.array([value], dtype='>f4')
        return ndarray.tobytes()

    def to_uint16(self, two_bytes):
        value = np.frombuffer(two_bytes, dtype='>u2')[0]
        # numpy.uint16 => int
        return int(str(value))

    def to_float(self, four_bytes):
        value = np.frombuffer(four_bytes, dtype='>f4')[0]
        # numpy.float32 => float
        return float(str(value))
