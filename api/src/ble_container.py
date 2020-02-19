import sys
sys.path.append('lib')
import asyncio
from bleak import discover, BleakClient
from device_bean import DeviceBean
from application_exception import ApplicationExcepiton
from logger_util import LoggerUtil

class BleContainer:
    __instance = None
    __clients = {}

    def __new__(cls):
        if cls.__instance is None:
            cls.__instance = super().__new__(cls)
        return cls.__instance

    async def _get_client(self, address):
        try:
            if address not in self.__clients:
                client = BleakClient(address, loop=None)
                await client.connect()
                self.__clients[address] = client
        except:
            # address not found.
            raise ApplicationExcepiton.create(0x0004, 'get client failed.')

        if await self.__clients[address].is_connected():
            return self.__clients[address]
        else:
            self.__clients.pop(address)
            raise ApplicationExcepiton.create(0x0004, 'get client failed.')
    
    @staticmethod
    async def get_devices(timeout=1.0) -> [DeviceBean]:
        try:
            devices = await discover(timeout)
        except:
            raise ApplicationExcepiton.create(0x010B, 'get devices failed.')
        return list(map(lambda device: DeviceBean(device.name, device.address, device.rssi), devices))

    async def read(self, address, uuid):
        client = await self._get_client(address)
        return await client.read_gatt_char(uuid)

    async def write(self, address, uuid, binary):
        client = await self._get_client(address)
        await client.write_gatt_char(uuid, binary, True)