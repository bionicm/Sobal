import consts
from ble_container import BleContainer
from application_exception import ApplicationException
from converter_util import ConverterUtil
from logger_util import LoggerUtil

class DeviceService:
    __ble = BleContainer()
    __converter = ConverterUtil()
    consts.READ_ADDRESS = 0xF000
    consts.UPDATE_REQUEST_ADDRESS = 0xF001
    consts.UPDATE_REQUEST_VALUE = 0x01
    consts.ERROR_PARAMETER_ADDRESSES = [0xF010, 0xF011, 0xF012, 0xF013, 0xF014, 0xF015, 0xF016, 0xF017]
    consts.NO_ERROR = 0xFFFF

    async def get_devices(self, filter_names):
        LoggerUtil().info('get devices.')
        devices = await BleContainer.get_devices()
        filterd_devices = []
        for device in devices:
            for name in filter_names:
                if device.name.startswith(name):
                    device.device_type = name
                    filterd_devices.append(device)
                    break
        LoggerUtil().info(f'{len(filterd_devices)} devices found. filter={filter_names}')
        return filterd_devices

    async def get_device_param(self, address, write_uuid, read_uuid, param_address_bytes):
        read_address_bytes = self.__converter.to_2bytes(consts.READ_ADDRESS) + param_address_bytes
        try:
            LoggerUtil().info(f'write to get parameter. data={read_address_bytes}, uuid={write_uuid}')
            await self.__ble.write(address, write_uuid, read_address_bytes)
            LoggerUtil().info(f'write successful. data={read_address_bytes}, uuid={write_uuid}')
        except ApplicationException as app_exception:
            raise app_exception
        except:
            raise ApplicationException.create(0x0205, 'write failed.')

        try:
            LoggerUtil().info(f'read parameter. uuid={read_uuid}')
            parameter_bytes = await self.__ble.read(address, read_uuid)
            LoggerUtil().info(f'read successful. data={parameter_bytes}, uuid={read_uuid}')
        except ApplicationException as app_exception:
            raise app_exception
        except:
            raise ApplicationException.create(0x0206, 'read failed.')

        # validate data size.
        if not parameter_bytes:
            raise ApplicationException.create(0x0209, f'read response data is empty.')
        elif  len(parameter_bytes) != 6:
            raise ApplicationException.create(0x0209, f'size of read response data is invalid. data={parameter_bytes}')

        # compare address read to wrote addres.
        if parameter_bytes[0:2] == param_address_bytes:
            return parameter_bytes
        else:
            raise ApplicationException.create(0x020a, f'read address does not match. write-paramaddress={param_address_bytes} read-paramaddress={parameter_bytes[0:2]}')

    async def get_device_status(self, address, read_uuid):
        try:
            status_bytes = await self.__ble.read(address, read_uuid)
            LoggerUtil().info(f'read successful. data={status_bytes}, uuid={read_uuid}')
        except ApplicationException as app_exception:
            raise app_exception
        except:
            raise ApplicationException.create(0x0006, 'read failed.')
        return status_bytes

    async def get_error_address(self, address, write_uuid, read_uuid):
        error_addresses_bytes = []
        read_address = self.__converter.to_2bytes(consts.READ_ADDRESS)
        no_error = self.__converter.to_2bytes(consts.NO_ERROR)
        for error_param_address in consts.ERROR_PARAMETER_ADDRESSES:
            read_error_address = read_address + self.__converter.to_2bytes(error_param_address)

            try:
                LoggerUtil().info(f'write to get error address. data={read_error_address}, uuid={write_uuid}')
                await self.__ble.write(address, write_uuid, read_error_address)
                LoggerUtil().info(f'write successful. data={read_error_address}, uuid={write_uuid}')
            except ApplicationException as app_exception:
                raise app_exception
            except:
                raise ApplicationException.create(0x0405, 'write failed.')

            try:
                LoggerUtil().info(f'read error address. uuid={read_uuid}')
                error_address_bytes = await self.__ble.read(address, read_uuid)
                LoggerUtil().info(f'read successful. data={error_address_bytes}, uuid={read_uuid}')
            except ApplicationException as app_exception:
                raise app_exception
            except:
                raise ApplicationException.create(0x0406, 'read failed.')

            # validate data size.
            if not error_address_bytes:
                raise ApplicationException.create(0x0409, 'read response data is empty.')
            elif len(error_address_bytes) != 4:
                raise ApplicationException.create(0x0409, f'size of read response data is invalid. data={error_address_bytes}')
            elif error_address_bytes[2:] == no_error:
                return error_addresses_bytes
            else:
                error_addresses_bytes.append(error_address_bytes)

        return error_addresses_bytes

    async def update_device_status(self, address, write_uuid, data_bytes):
        try:
            LoggerUtil().info(f'write mode. data={data_bytes}, uuid={write_uuid}')
            await self.__ble.write(address, write_uuid, data_bytes)
            LoggerUtil().info(f'write successful. data={data_bytes}, uuid={write_uuid}')
        except ApplicationException as app_exception:
            raise app_exception
        except:
            raise ApplicationException.create(0x0505, 'write failed.')

    async def update_device_params(self, address, write_uuid, device_parameter_beans):
        # write parameters.
        for device_parameter_bean in device_parameter_beans:
            try:
                address_bytes = self.__converter.to_2bytes(device_parameter_bean.param_address)
                value_bytes = self.__converter.to_4bytes(device_parameter_bean.param_value)
            except:
                raise ApplicationException.create(0x0600, f'convert from int or float to bytes failed. paramaddress={device_parameter_bean.param_address} value={device_parameter_bean.param_value}')

            try:
                parameter_bytes = address_bytes + value_bytes
                LoggerUtil().info(f'write parameter. data={parameter_bytes}, uuid={write_uuid}')
                await self.__ble.write(address, write_uuid, parameter_bytes)
                LoggerUtil().info(f'write successful. data={parameter_bytes}, uuid={write_uuid}')
            except ApplicationException as app_exception:
                raise app_exception
            except:
                raise ApplicationException.create(0x0605, 'write failed.')

        # update request.
        try:
            update_request = self.__converter.to_2bytes(consts.UPDATE_REQUEST_ADDRESS) + self.__converter.to_bytes(consts.UPDATE_REQUEST_VALUE)
            LoggerUtil().info(f'update request. data={update_request}, uuid={write_uuid}')
            await self.__ble.write(address, write_uuid, update_request)
            LoggerUtil().info(f'update request successful. data={update_request}, uuid={write_uuid}')
        except ApplicationException as app_exception:
            raise app_exception
        except:
            raise ApplicationException.create(0x0607, 'update request failed.')