import sys
import os.path
sys.path.append('lib')
import responder
from device_facade import DeviceFacade
from application_exception import ApplicationException
from converter_util import ConverterUtil
from logger_util import LoggerUtil

api = responder.API(cors=True, cors_params={
    'allow_origins': ['*'],
    'allow_methods': ['*'],
    'allow_headers': ['*']
})


@api.route('/v1/devices/list')
async def devices(req, resp):
    try:
        body = await DeviceFacade().get_devices(req)
        resp.media = body
        resp.status_code = 200
    except ApplicationException as app_exception:
        error_handler(resp, app_exception)
    except:
        app_exception = ApplicationException.create(0x01FF, 'cause unknown error.')
        error_handler(resp, app_exception)

@api.route('/v1/devices/{device_address}/params/{param_address}')
async def device_param(req, resp, device_address, param_address):
    try:
        body = await DeviceFacade().get_device_param(req, f'{device_address}', f'{param_address}')
        resp.media = body
        resp.status_code = 200
    except ApplicationException as app_exception:
        error_handler(resp, app_exception)
    except:
        app_exception = ApplicationException.create(0x02FF, 'cause unknown error.')
        error_handler(resp, app_exception)

@api.route('/v1/devices/{device_address}/statuses')
async def device_status(req, resp, device_address):
    try:
        body = await DeviceFacade().get_device_status(req, f'{device_address}')
        resp.media = body
        resp.status_code = 200
    except ApplicationException as app_exception:
        error_handler(resp, app_exception)
    except:
        app_exception = ApplicationException.create(0x03FF, 'cause unknown error.')
        error_handler(resp, app_exception)

@api.route('/v1/devices/{device_address}/errorparams')
async def error_params(req, resp, device_address):
    try:
        body = await DeviceFacade().get_error_params(req, f'{device_address}')
        resp.media = body
        resp.status_code = 200
    except ApplicationException as app_exception:
        error_handler(resp, app_exception)
    except:
        app_exception = ApplicationException.create(0x04FF, 'cause unknown error.')
        error_handler(resp, app_exception)

@api.route('/v1/devices/{device_address}/modes')
async def device_mode(req, resp, device_address):
    try:
        body = await DeviceFacade().device_mode(req, f'{device_address}')
        resp.media = body
        resp.status_code = 200
    except ApplicationException as app_exception:
        error_handler(resp, app_exception)
    except:
        app_exception = ApplicationException.create(0x05FF, 'cause unknown error.')
        error_handler(resp, app_exception)

@api.route('/v1/devices/{device_address}/params')
async def update_device_params(req, resp, device_address):
    try:
        await DeviceFacade().update_device_params(req, f'{device_address}')
        resp.status_code = 200
    except ApplicationException as app_exception:
        error_handler(resp, app_exception)
    except:
        app_exception = ApplicationException.create(0x06FF, 'cause unknown error.')
        error_handler(resp, app_exception)

def error_handler(resp, exception):
    resp.media = ConverterUtil().to_json(exception)
    resp.status_code = exception.http_status_code


if __name__ == "__main__":
    if os.path.isdir("log") == False:
        os.mkdir("log")
    LoggerUtil().set_log_config('logging.conf')
    api.run()