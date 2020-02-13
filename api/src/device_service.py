import traceback
from ble_container import BleContainer
from application_exception import ApplicationExcepiton

class DeviceService:
    async def get_devices(self, filter_names):
        try:
            devices = await BleContainer.get_devices()
            filterd_devices = []
            for device in devices:
                for name in filter_names:
                    if device.name.startswith(name):
                        device.device_type = name
                        filterd_devices.append(device)
                        break
            return filterd_devices
        except ApplicationExcepiton as exeption:
            # TODO:エラー処理
            print(traceback.format_exc())

    async def get_device_param(self, address, write_uuid, read_uuid, binary):
        try:
            ble_container = BleContainer()
            await ble_container.write(address, write_uuid, binary)
            binary_parameter = await ble_container.read(address, read_uuid)

            if binary_parameter[0:2] == binary[2:4]:
                return binary_parameter
            else:
                # TODO:エラー処理
                print(traceback.format_exc())
                raise Exception

        except Exception as e:
            # TODO:エラー処理
            print(traceback.format_exc())
            pass

    async def get_device_status(self, address, read_uuid):
        try:
            return await BleContainer().read(address, read_uuid)
        except Exception as e:
            # TODO:エラー処理
            print(traceback.format_exc())
            pass

    async def update_device_params(self, address, write_uuid, binary_array):
        try:
            ble_container = BleContainer()
            for binary in binary_array:
                await ble_container.write(address, write_uuid, binary)
        except Exception as e:
            # TODO:エラー処理
            print(traceback.format_exc())
            pass

    async def update_device_value(self, address, write_uuid, binary):
        try:
            await BleContainer().write(address, write_uuid, binary)
        except Exception as e:
            # TODO:エラー処理
            print(traceback.format_exc())
            pass