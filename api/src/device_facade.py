from device_service import DeviceService
from converter_util import ConverterUtil
from application_exception import ApplicationException
from device_parameter_bean import DeviceParameterBean
from logger_util import LoggerUtil

class DeviceFacade:
    __device_service = DeviceService()
    __converter = ConverterUtil()

    async def get_devices(self, req):
        if req.method == 'get':
            filter_names = req.params.get_list('types')

            # validate inputs.
            if not filter_names:
                raise ApplicationException.create(0x0100, 'filter names are empty.')

            filtered_devices = await self.__device_service.get_devices(tuple(filter_names))
            devices_json = list(map(lambda device:
                {
                    'name': device.name,
                    'address': device.address,
                    'rssi': device.rssi,
                    'type': device.device_type
                },
                filtered_devices))
            return devices_json
        else:
            raise ApplicationException.create(0x0103, f'requested method failed because not allowed. request={req.method}')

    async def get_device_param(self, req, device_address, param_address):
        if req.method == 'get':
            write_uuid = req.headers.get('Write-Uuid')
            read_uuid = req.headers.get('Read-Uuid')

            # validate inputs.
            if not write_uuid:
                raise ApplicationException.create(0x0200, 'write-uuid is empty.')
            elif not read_uuid:
                raise ApplicationException.create(0x0200, 'read-uuid is empty.')
            elif not param_address:
                raise ApplicationException.create(0x0200, 'parameter address is empty.')
            elif not device_address:
                raise ApplicationException.create(0x0200, 'device address is empty.')

            # convert from int to bytes.
            parsed_param_address = self._parse_int(param_address)
            try:
                param_address_bytes = self.__converter.to_2bytes(parsed_param_address)
            except:
                raise ApplicationException.create(0x0200, f'convert from int to bytes failed. paramaddress={parsed_param_address}')

            # get bytearray.
            parameter_bytes = await self.__device_service.get_device_param(device_address, write_uuid, read_uuid, param_address_bytes)

            # convert from bytearray to uint16 and float.
            try:
                param_address = self.__converter.to_uint16(parameter_bytes[0:2])
                param_value = self.__converter.to_float(parameter_bytes[2:6])
            except:
                raise ApplicationException.create(0x0208, f'convert from read response data to uint16, float failed. paramaddress={parameter_bytes[0:2]} value={parameter_bytes[2:6]}')

            # convert from parameter address and value to json format.
            return {'paramaddress': format(param_address, '#06x'), 'value': param_value}
        else:
            raise ApplicationException.create(0x0203, f'requested method failed because not allowed. request={req.method}')

    async def get_device_status(self, req, device_address):
        if req.method == 'get':
            read_uuid = req.headers.get('Read-Uuid')

            # validate inputs.
            if not read_uuid:
                raise ApplicationException.create(0x0300, 'read-uuid is empty.')
            elif not device_address:
                raise ApplicationException.create(0x0300, 'device address is empty.')

            # get bytearray.
            LoggerUtil().info(f'read status. uuid={read_uuid}')
            status_value_bytes = await self.__device_service.get_device_status(device_address, read_uuid)

            # validate data size.
            if not status_value_bytes:
                raise ApplicationException.create(0x0309, 'read response data is empty.')
            elif len(status_value_bytes) != 4:
                raise ApplicationException.create(0x0309, f'size of read response data is invalid. data={status_value_bytes}')

            try:
                # convert from bytearray to float.
                status_value = self.__converter.to_float(status_value_bytes)
            except:
                raise ApplicationException.create(0x0308, f'convert from read response data to float failed. data={status_value_bytes}')

            # convert from status value to json format.
            return {'uuid': read_uuid, 'value': status_value}
        else:
            raise ApplicationException.create(0x0303, f'requested method failed because not allowed. request={req.method}')

    async def get_error_params(self, req, device_address):
        if req.method == 'get':
            write_uuid = req.headers.get('Write-Uuid')
            read_uuid = req.headers.get('Read-Uuid')

            # validate inputs.
            if not write_uuid:
                raise ApplicationException.create(0x0400, 'write-uuid is empty.')
            elif not read_uuid:
                raise ApplicationException.create(0x0400, 'read-uuid is empty.')
            elif not device_address:
                raise ApplicationException.create(0x0400, 'device address is empty.')

            # get bytearray.
            error_addresses_bytes = await self.__device_service.get_error_address(device_address, write_uuid, read_uuid)

            # convert from bytearray to array of uint16.
            error_addresses = []
            for error_address_bytes in error_addresses_bytes:
                try:
                    error_address = self.__converter.to_uint16(error_address_bytes[2:])
                    error_addresses.append(format(error_address, '#06x'))
                except:
                    raise ApplicationException.create(0x0408, f'convert from read response data to uint16 failed. data={error_address_bytes}')

            # convert from error addresses to json format.
            return {'addresses': error_addresses}
        else:
            raise ApplicationException.create(0x0403, f'requested method failed because not allowed. request={req.method}')

    async def device_mode(self, req, device_address):
        if req.method == 'get':
            read_uuid = req.headers.get('Read-Uuid')

            # validate inputs.
            if not read_uuid:
                raise ApplicationException.create(0x0500, 'read-uuid is empty.')
            elif not device_address:
                raise ApplicationException.create(0x0500, 'device address is empty.')

            # get bytearray.
            LoggerUtil().info(f'read mode. uuid={read_uuid}')
            mode_value_bytes = await self.__device_service.get_device_status(device_address, read_uuid)

            if not mode_value_bytes:
                raise ApplicationException.create(0x0509, 'read response data is empty.')
            elif len(mode_value_bytes) != 2:
                raise ApplicationException.create(0x0509, f'size of read response data is invalid. data={mode_value_bytes}')

            # convert from bytearray to uint16.
            try:
                mode_value = self.__converter.to_uint16(mode_value_bytes)
            except:
                raise ApplicationException.create(0x0508, f'convert from read response data to uint16 failed. data={mode_value_bytes}')

            # convert from mode value to json format.
            return {'uuid': read_uuid, 'value': format(mode_value, '#06x')}
        elif req.method == 'post':
            write_uuid = req.headers.get('Write-Uuid')

            try:
                # convert from json to uint16.
                mode_value_json = await req.media()
            except:
                raise ApplicationException.create(0x0500, 'get json data failed.')

            mode_value = mode_value_json.get('value')
            # validate inputs.
            if not write_uuid:
                raise ApplicationException.create(0x0500, 'write-uuid is empty.')
            elif not device_address:
                raise ApplicationException.create(0x0500, 'device address is empty.')
            elif not mode_value:
                raise ApplicationException.create(0x0500, 'mode value is empty.')

            # convert from to bytes.
            parsed_mode_value = self._parse_int(mode_value)
            try:
                mode_value_bytes = self.__converter.to_2bytes(parsed_mode_value)
            except:
                raise ApplicationException.create(0x0500, f'convert from int to bytes failed. value={parsed_mode_value}')

            # write mode value.
            await self.__device_service.update_device_status(device_address, write_uuid, mode_value_bytes)
        else:
            raise ApplicationException.create(0x0503, f'requested method failed because not allowed. request={req.method}')

    async def update_device_params(self, req, device_address):
        if req.method == 'post':
            write_uuid = req.headers.get('Write-Uuid')

            # validate inputs.
            if not write_uuid:
                raise ApplicationException.create(0x0600, 'write-uuid is empty.')
            elif not device_address:
                raise ApplicationException.create(0x0600, 'device address is empty.')

            try:
                parameters = await req.media()
            except:
                raise ApplicationException.create(0x0600, 'get json data failed.')

            # convert from parameters to array of DeviceParameterBean.
            device_parameter_beans = []
            for parameter in parameters:
                device_parameter_bean = DeviceParameterBean()
                device_parameter_bean.param_address = self._parse_int(parameter.get('paramaddress'))
                device_parameter_bean.param_value = self._parse_float(parameter.get('value'))
                device_parameter_beans.append(device_parameter_bean)

            # write parameter address and value.
            await self.__device_service.update_device_params(device_address, write_uuid, device_parameter_beans)
        else:
            raise ApplicationException.create(0x0603, f'requested method failed because not allowed. request={req.method}')

    def _parse_int(self, value):
        try:
            if value[:2] == '0x':
                parsed_value = int(value[2:], 16)
            else:
                parsed_value = int(value, 16)
            return parsed_value
        except:
            raise ApplicationException.create(0x000c, f'convert from value to int failed. value={value}')

    def _parse_float(self, value):
        try:
            return float(value)
        except:
            raise ApplicationException.create(0x000c, f'convert from value to float failed. value={value}')