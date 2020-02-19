import consts
from ble_container import BleContainer
from application_exception import ApplicationExcepiton
from converter_util import ConverterUtil
from logger_util import LoggerUtil

class DeviceService:

    consts.READ_ADDRESS = 0xF000
    consts.UPDATE_REQUEST_ADDRESS = 0xF001
    consts.UPDATE_REQUEST_VALUE = 0x01
    consts.ERROR_PARAMETER_ADDRESSES = [0xF010, 0xF011, 0xF012, 0xF013, 0xF014, 0xF015, 0xF016, 0xF017]
    consts.NO_ERROR = 0xFFFF

    async def get_devices(self, filter_names):
        devices = await BleContainer.get_devices()

        filterd_devices = []
        for device in devices:
            for name in filter_names:
                if device.name.startswith(name):
                    device.device_type = name
                    filterd_devices.append(device)
                    break
        return filterd_devices

    async def get_device_param(self, address, write_uuid, read_uuid, binary_param_address):
        ble_container = BleContainer()
        binary_read_address = ConverterUtil().to_2bytes(consts.READ_ADDRESS) + binary_param_address

        try:
            LoggerUtil().info(f'write. data={binary_read_address}, uuid={write_uuid}')
            await ble_container.write(address, write_uuid, binary_read_address)
            LoggerUtil().info(f'write successful. data={binary_read_address}, uuid={write_uuid}')
        except ApplicationExcepiton as app_exception:
            raise app_exception
        except:
            raise ApplicationExcepiton.create(0x0205, 'write failed.')

        try:
            LoggerUtil().info(f'read. uuid={read_uuid}')
            binary_parameter = await ble_container.read(address, read_uuid)
            LoggerUtil().info(f'read successful. data={binary_parameter}, uuid={read_uuid}')
        except ApplicationExcepiton as app_exception:
            raise app_exception
        except:
            raise ApplicationExcepiton.create(0x0206, 'read failed.')

        # validate data size.
        if not binary_parameter:
            raise ApplicationExcepiton.create(0x0209, f'read response value is empty.')
        elif  len(binary_parameter) != 6:
            raise ApplicationExcepiton.create(0x0209, f'size of read response value is invalid. data={binary_parameter}')

        # compare address read to wrote addres.
        if binary_parameter[0:2] == binary_param_address:
            return binary_parameter
        else:
            raise ApplicationExcepiton.create(0x020A, f'read address does not match. write-paramaddress={binary_param_address} read-paramaddress={binary_parameter[0:2]}')

    async def update_device_params(self, address, write_uuid, device_parameter_beans):
        ble_container = BleContainer()
        converter = ConverterUtil()

        # write parameters.
        for device_parameter_bean in device_parameter_beans:
            try:
                binary_address = converter.to_2bytes(device_parameter_bean.param_address)
                binary_value = converter.to_4bytes(device_parameter_bean.param_value)
            except:
                raise ApplicationExcepiton.create(0x060C, f'convert from int or float to bytes failed. paramaddress={device_parameter_bean.param_address} value={device_parameter_bean.param_value}')

            try:
                binary_parameter = binary_address + binary_value
                LoggerUtil().info(f'write. data={binary_parameter}, uuid={write_uuid}')
                await ble_container.write(address, write_uuid, binary_parameter)
                LoggerUtil().info(f'write successful. data={binary_parameter}, uuid={write_uuid}')
            except ApplicationExcepiton as app_exception:
                raise app_exception
            except:
                raise ApplicationExcepiton.create(0x0605, 'write failed.')

        update_request = converter.to_2bytes(consts.UPDATE_REQUEST_ADDRESS) + converter.to_bytes(consts.UPDATE_REQUEST_VALUE)

        try:
            # update request.
            LoggerUtil().info(f'update request. data={update_request}, uuid={write_uuid}')
            await ble_container.write(address, write_uuid, update_request)
            LoggerUtil().info(f'write successful. data={update_request}, uuid={write_uuid}')
        except ApplicationExcepiton as app_exception:
            raise app_exception
        except:
            raise ApplicationExcepiton.create(0x0607, 'update request failed.')

    async def get_device_status(self, address, read_uuid):
        try:
            LoggerUtil().info(f'read. uuid={read_uuid}')
            binary_status = await BleContainer().read(address, read_uuid)
            LoggerUtil().info(f'read successful. data={binary_status}, uuid={read_uuid}')
        except ApplicationExcepiton as app_exception:
            raise app_exception
        except:
            raise ApplicationExcepiton.create(0x0006, 'read failed.')
        return binary_status

    async def update_device_status(self, address, write_uuid, binary):
        try:
            LoggerUtil().info(f'write. data={binary}, uuid={write_uuid}')
            await BleContainer().write(address, write_uuid, binary)
            LoggerUtil().info(f'write successful. data={binary}, uuid={write_uuid}')
        except ApplicationExcepiton as app_exception:
            raise app_exception
        except:
            raise ApplicationExcepiton.create(0x0505, 'write failed.')

    async def get_error_address(self, address, write_uuid, read_uuid):
        ble_container = BleContainer()
        converter = ConverterUtil()
        error_addresses = []

        for error_param_address in consts.ERROR_PARAMETER_ADDRESSES:
            read_error_address = converter.to_2bytes(consts.READ_ADDRESS) + converter.to_2bytes(error_param_address)

            try:
                LoggerUtil().info(f'write. data={read_error_address}, uuid={write_uuid}')
                await ble_container.write(address, write_uuid, read_error_address)
                LoggerUtil().info(f'write successful. data={read_error_address}, uuid={write_uuid}')
            except ApplicationExcepiton as app_exception:
                raise app_exception
            except:
                raise ApplicationExcepiton.create(0x0405, 'write failed.')

            try:
                LoggerUtil().info(f'read. uuid={read_uuid}')
                binary_error_address = await ble_container.read(address, read_uuid)
                LoggerUtil().info(f'read successful. data={binary_error_address}, uuid={read_uuid}')
            except ApplicationExcepiton as app_exception:
                raise app_exception
            except:
                raise ApplicationExcepiton.create(0x0406, 'read failed.')

            # validate data size.
            if not binary_error_address:
                raise ApplicationExcepiton.create(0x0409, 'read response value is empty.')
            elif len(binary_error_address) != 2:
                raise ApplicationExcepiton.create(0x0409, f'size of read response value is invalid. data={binary_error_address}')
            else:
                try:
                    # convert to uint16 if correct data.
                    error_address = converter.to_uint16(binary_error_address)
                except:
                    raise ApplicationExcepiton.create(0x0408, f'convert from read response value to uint16 failed. paramaddress={binary_error_address}')

            if error_address == consts.NO_ERROR:
                # no error.
                break
            else:
                error_addresses.append(format(error_address, '#06x'))

        return error_addresses