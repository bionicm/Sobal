class DeviceBean:
    def __init__(self, name, address, rssi):
        self.__name = name
        self.__address = address
        self.__rssi = rssi

    @property
    def name(self):
        return self.__name

    @property
    def address(self):
        return self.__address

    @property
    def rssi(self):
        return self.__rssi

    @property
    def device_type(self):
        return self.__device_type

    @device_type.setter
    def device_type(self, device_type):
        self.__device_type = device_type