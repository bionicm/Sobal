import sys
sys.path.append('lib')
import asyncio
import traceback
from bleak import discover, BleakClient
from device_bean import DeviceBean

class BleContainer:
    __instance = None
    __clients = {}

    def __new__(cls):
        if cls.__instance is None:
            cls.__instance = super().__new__(cls)
        return cls.__instance

    async def _get_client(self, address):
        if address not in self.__clients:
            client = BleakClient(address, loop=None)
            await client.connect()
            self.__clients[address] = client

        if await self.__clients[address].is_connected():
            return self.__clients[address]
        else:
            self.__clients.pop(address)
            raise Exception

    @staticmethod
    async def get_devices(timeout=1.0) -> [DeviceBean]:
        devices = await discover(timeout)
        return list(map(lambda device: DeviceBean(device.name, device.address, device.rssi), devices))

    async def read(self, address, uuid):
        try:
            client = await self._get_client(address)
            return await client.read_gatt_char(uuid)
        except Exception as e:
            # TODO:エラー処理
            print(traceback.format_exc())
            pass

    async def write(self, address, uuid, binary):
        try:
            client = await self._get_client(address)
            await client.write_gatt_char(uuid, binary, True)
        except Exception as e:
            # TODO:エラー処理
            print(traceback.format_exc())
            pass