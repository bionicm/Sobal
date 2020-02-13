class DeviceParameterBean:
    __param_address = None
    __param_value = None

    @property
    def param_address(self):
        return self.__param_address

    @property
    def param_value(self):
        return self.__param_value

    @param_address.setter
    def param_address(self, param_address):
        self.__param_address = param_address
    
    @param_value.setter
    def param_value(self, param_value):
        self.__param_value = param_value