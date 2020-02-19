from device_service import DeviceService
from converter_util import ConverterUtil
from application_exception import ApplicationExcepiton
from device_parameter_bean import DeviceParameterBean
from logger_util import LoggerUtil

class DeviceFacade:

    async def get_devices(self, req):
        if req.method == 'get':
            filter_names = req.params.get_list('types')

            # validate inputs.
            if not filter_names:
                raise ApplicationExcepiton.create(0x0100, 'filter names are empty.')

            filtered_devices = await DeviceService().get_devices(tuple(filter_names))
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
            raise ApplicationExcepiton.create(0x0103, f'requested method failed because not allowed. request={req.method}')

    async def get_device_param(self, req, device_address, param_address):
        if req.method == 'get':
            write_uuid = req.headers.get('Write-Uuid')
            read_uuid = req.headers.get('Read-Uuid')

            # validate inputs.
            if not write_uuid:
                raise ApplicationExcepiton.create(0x0200, 'write-uuid is empty.')
            elif not read_uuid:
                raise ApplicationExcepiton.create(0x0200, 'read-uuid is empty.')
            elif not param_address:
                raise ApplicationExcepiton.create(0x0200, 'parameter address is empty.')
            elif not device_address:
                raise ApplicationExcepiton.create(0x0200, 'device address is empty.')

            parsed_param_address = self._parse_int(param_address)

            # convert to binary data.
            converter = ConverterUtil()
            try:
                binary_param_address = converter.to_2bytes(parsed_param_address)
            except:
                raise ApplicationExcepiton.create(0x0200, f'convert from int to bytes failed. paramaddress={parsed_param_address}')

            # get binary_parameter.
            binary_parameter = await DeviceService().get_device_param(device_address, write_uuid, read_uuid, binary_param_address)

            # convert from bytes to parameter.
            try:
                param_address = converter.to_uint16(binary_parameter[0:2])
                param_value = converter.to_float(binary_parameter[2:6])
            except:
                raise ApplicationExcepiton.create(0x0208, f'convert from read response value to uint16, float failed. paramaddress={binary_parameter[0:2]} value={binary_parameter[2:6]}')

            # convert from parameter to json format.
            return {'paramaddress': format(param_address, '#06x'), 'value': param_value}
        else:
            raise ApplicationExcepiton.create(0x0203, f'requested method failed because not allowed. request={req.method}')

    async def get_device_status(self, req, device_address):
        if req.method == 'get':
            read_uuid = req.headers.get('Read-Uuid')

            #validate inputs.
            if not read_uuid:
                raise ApplicationExcepiton.create(0x0300, 'read-uuid is empty.')
            elif not device_address:
                raise ApplicationExcepiton.create(0x0300, 'device address is empty.')

            # get status_value.
            binary_status_value = await DeviceService().get_device_status(device_address, read_uuid)

            # validate data size.
            if not binary_status_value:
                raise ApplicationExcepiton.create(0x0309, 'read response value is empty.')
            elif len(binary_status_value) != 4:
                raise ApplicationExcepiton.create(0x0309, f'size of read response value is invalid. value={binary_status_value}')

            try:
                # convert from bytes to status_value.
                status_value = ConverterUtil().to_float(binary_status_value)
            except:
                raise ApplicationExcepiton.create(0x0308, f'convert from read response value to float failed. value={binary_status_value}')

            # convert from status_value to json format.
            return {'uuid': read_uuid, 'value': status_value}
        else:
            raise ApplicationExcepiton.create(0x0303, f'requested method failed because not allowed. request={req.method}')

    async def update_device_params(self, req, device_address):
        if req.method == 'post':
            write_uuid = req.headers.get('Write-Uuid')

            # validate inputs.
            if not write_uuid:
                raise ApplicationExcepiton.create(0x0600, 'write-uuid is empty.')
            elif not device_address:
                raise ApplicationExcepiton.create(0x0600, 'device address is empty.')

            try:
                parameters = await req.media()
            except:
                raise ApplicationExcepiton.create(0x0600, 'get json data failed.')

            # convert from parameters to array of DeviceParameterBean.
            device_parameter_beans = []
            for parameter in parameters:
                device_parameter_bean = DeviceParameterBean()
                device_parameter_bean.param_address = self._parse_int(parameter.get('paramaddress'))
                device_parameter_bean.param_value = self._parse_float(parameter.get('value'))
                device_parameter_beans.append(device_parameter_bean)

            await DeviceService().update_device_params(device_address, write_uuid, device_parameter_beans)
        else:
            raise ApplicationExcepiton.create(0x0603, f'requested method failed because not allowed. request={req.method}')

    async def device_mode(self, req, device_address):
        if req.method == 'get':
            read_uuid = req.headers.get('Read-Uuid')

            # validate inputs.
            if not read_uuid:
                raise ApplicationExcepiton.create(0x0500, 'read-uuid is empty.')
            elif not device_address:
                raise ApplicationExcepiton.create(0x0500, 'device address is empty.')

            # get mode.
            binary_mode_value = await DeviceService().get_device_status(device_address, read_uuid)

            if not binary_mode_value:
                raise ApplicationExcepiton.create(0x0509, 'read response value is empty.')
            elif len(binary_mode_value) != 2:
                raise ApplicationExcepiton.create(0x0509, f'size of read response value is invalid. value={binary_mode_value}')

            # convert from bytes to uint16.
            converter = ConverterUtil()
            try:
                mode_value = converter.to_uint16(binary_mode_value)
            except:
                raise ApplicationExcepiton.create(0x0508, f'convert from read response value to uint16 failed. value={binary_mode_value}')

            # convert from mode_value to json format.
            return {'uuid': read_uuid, 'value': format(mode_value, '#06x')}
        elif req.method == 'post':
            write_uuid = req.headers.get('Write-Uuid')

            try:
                # convert from json to mode_value.
                mode_value_json = await req.media()
            except:
                raise ApplicationExcepiton.create(0x0500, 'get json data failed.')

            mode_value = mode_value_json.get('value')

            # validate inputs.
            if not write_uuid:
                raise ApplicationExcepiton.create(0x0500, 'write-uuid is empty.')
            elif not device_address:
                raise ApplicationExcepiton.create(0x0500, 'device address is empty.')
            elif not mode_value:
                raise ApplicationExcepiton.create(0x0500, 'mode value is empty.')

            parsed_mode_value = self._parse_int(mode_value)

            # convert to binary data.
            try:
                binary_mode_value = ConverterUtil().to_2bytes(parsed_mode_value)
            except:
                raise ApplicationExcepiton.create(0x0500, f'convert from int to bytes failed. value={parsed_mode_value}')

            # write binary_mode_value.
            await DeviceService().update_device_status(device_address, write_uuid, binary_mode_value)
        else:
            raise ApplicationExcepiton.create(0x0503, f'requested method failed because not allowed. request={req.method}')

    async def get_error_params(self, req, device_address):
        if req.method == 'get':
            write_uuid = req.headers.get('Write-Uuid')
            read_uuid = req.headers.get('Read-Uuid')

            # validate inputs.
            if not write_uuid:
                raise ApplicationExcepiton.create(0x0400, 'write-uuid is empty.')
            elif not read_uuid:
                raise ApplicationExcepiton.create(0x0400, 'read-uuid is empty.')
            elif not device_address:
                raise ApplicationExcepiton.create(0x0400, 'device address is empty.')

            # get error addresses.
            error_addresses = await DeviceService().get_error_address(device_address, write_uuid, read_uuid)

            return {'addresses': error_addresses}
        else:
            raise ApplicationExcepiton.create(0x0403, f'requested method failed because not allowed. request={req.method}')

    def _parse_int(self, value):
        try:
            if value[:2] == '0x':
                parsed_value = int(value[2:], 16)
            else:
                parsed_value = int(value, 16)
            return parsed_value
        except:
            raise ApplicationExcepiton.create(0x000C, f'convert from value to int failed. value={value}')

    def _parse_float(self, value):
        try:
            return float(value)
        except:
            raise ApplicationExcepiton.create(0x000C, f'convert from value to float failed. value={value}')