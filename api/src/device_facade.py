import consts
import traceback
from device_service import DeviceService
from converter_util import ConverterUtil
from application_exception import ApplicationExcepiton
from device_parameter_bean import DeviceParameterBean

class DeviceFacade:

    consts.READ_ADDRESS = 0xF000
    consts.UPDATE_REQUEST_ADDRESS = 0xF001
    consts.UPDATE_REQUEST_VALUE = 0x01

    async def get_devices(self, req):
        if req.method == 'get':
            filter_names = self._check_exist(req.params.get_list('types'))
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
            raise ApplicationExcepiton.create(0x0102)

    async def get_device_param(self, req, device_address, parameter_address):
        if req.method == 'get':
            try:
                # validate inputs.
                device_address = self._check_exist(device_address)
                param_address = self._parse_int(self._check_exist(parameter_address))
                write_uuid = self._check_exist(req.headers['Write-Uuid'])
                read_uuid = self._check_exist(req.headers['Read-Uuid'])

                # convert binary data.
                converter = ConverterUtil()
                binary_address = converter.to_2bytes(consts.READ_ADDRESS) + converter.to_2bytes(param_address)

                # get parameter.
                binary_parameter = await DeviceService().get_device_param(device_address, write_uuid, read_uuid, binary_address)
                
                # validate data size.
                if len(binary_parameter) != 6:
                    # TODO:エラー処理
                    raise Exception

                # convert from bytes to parameter.
                param_address = converter.to_uint16(binary_parameter[0:2])
                param_value = converter.to_float(binary_parameter[2:6])
                
                # convert from parameter to json format.
                return {'paramaddress': format(param_address, '#06x'), 'value': param_value}
            except Exception as e:
                # TODO:エラー処理
                print(traceback.format_exc())
                pass
        else:
            # TODO:エラー処理
            print(traceback.format_exc())
            pass

    async def get_device_status(self, req, device_address):
        if req.method == 'get':
            try:
                #validate inputs.
                device_address = self._check_exist(device_address)
                read_uuid = self._check_exist(req.headers['Read-Uuid'])

                # get status_value.
                binary_status_value = await DeviceService().get_device_status(device_address, read_uuid)

                # convert from bytes to status_value.
                status_value = ConverterUtil().to_float(binary_status_value)

                # convert from parameter to json format.
                return {'uuid': read_uuid, 'value': status_value}
            except Exception as e:
                # TODO:エラー処理
                print(traceback.format_exc())
                pass
        else:
            # TODO:エラー処理
            print(traceback.format_exc())
            pass

    async def update_device_params(self, req, device_address):
        if req.method == 'post':
            try:
                # validate inputs.
                device_address = self._check_exist(device_address)
                write_uuid = self._check_exist(req.headers['Write-Uuid'])

                # convert from parameters to array of DeviceParameterBean.
                parameters = await req.media()
                device_parameter_beans = []
                for parameter in parameters:
                    device_parameter_bean = DeviceParameterBean()
                    device_parameter_bean.param_address = self._parse_int(parameter['paramaddress'])
                    device_parameter_bean.param_value = self._parse_float(parameter['value'])
                    device_parameter_beans.append(device_parameter_bean)

                # write parameters.
                device_service = DeviceService()
                converter = ConverterUtil()
                for device_parameter_bean in device_parameter_beans:
                    binary_address = converter.to_2bytes(device_parameter_bean.param_address)
                    binary_value = converter.to_4bytes(device_parameter_bean.param_value)
                    binary_parameter = binary_address + binary_value
                    await device_service.update_device_value(device_address, write_uuid, binary_parameter)

                # update finish.
                update_request = converter.to_2bytes(consts.UPDATE_REQUEST_ADDRESS) + converter.to_bytes(consts.UPDATE_REQUEST_VALUE)
                await device_service.update_device_value(device_address, write_uuid, update_request)
            except Exception as e:
                # TODO:エラー処理
                print(traceback.format_exc())
                pass
        else:
            # TODO:エラー処理
            print(traceback.format_exc())
            pass

    async def device_mode(self, req, device_address):
        if req.method == 'get':
                # validate inputs.
                device_address = self._check_exist(device_address)
                read_uuid = self._check_exist(req.headers['Read-Uuid'])

                # get mode.
                binary_mode_value = await DeviceService().get_device_status(device_address, read_uuid)

                # convert from bytes to uint16.
                converter = ConverterUtil()
                mode_value = converter.to_uint16(binary_mode_value)

                # convert from mode_value to json format.
                return {'uuid': read_uuid, 'value': mode_value}
        elif req.method == 'post':
            try:
                # validate inputs.
                device_address = self._check_exist(device_address)
                write_uuid = self._check_exist(req.headers['Write-Uuid'])

                # convert from json to mode_value.
                converter = ConverterUtil()
                mode_value = await req.media()

                # convert from mode_value to bytes.
                binary_mode_value = converter.to_2bytes(self._parse_int(mode_value['value']))

                # write binary_mode_value.
                device_service = DeviceService()
                await device_service.update_device_value(device_address, write_uuid, binary_mode_value)
            except Exception as e:
                # TODO:エラー処理
                print(traceback.format_exc())
                pass
        else:
            # TODO:エラー処理
            print(traceback.format_exc())
            pass

    def _parse_int(self, value):
        try:
            if value[:2] == '0x':
                parsed_value = int(value[2:], 16)
            else:
                parsed_value = int(value, 16)
            return parsed_value
        except ApplicationExcepiton as app_exception:
            # TODO:エラー処理
            print(traceback.format_exc())

    def _parse_float(self, value):
        try:
            return float(value)
        except ApplicationExcepiton as app_exception:
            # TODO:エラー処理
            print(traceback.format_exc())

    def _check_exist(self, value):
        if value != '' and value is not None:
            return value
        else:
            # TODO:エラー処理
            print(traceback.format_exc())