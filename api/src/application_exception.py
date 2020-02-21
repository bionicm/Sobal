from logger_util import LoggerUtil

class ApplicationException(Exception):

    @staticmethod
    def create(error_code, message):
        app_exception = ApplicationException()
        app_exception._set_error_code(error_code, message)
        return app_exception

    def _set_error_code(self, error_code, message):
        self.error_code = format(error_code, '#06x')
        self._identify_status_code(error_code)
        LoggerUtil().error(f'({self.error_code}) {message}')

    def _identify_status_code(self, error_code):
        detail_code = error_code & 0x00FF
        if detail_code == 0x0000 or detail_code == 0x000c:
            # bad request.
            self.http_status_code = 400
        elif detail_code == 0x0001:
            # unauthorized.
            self.http_status_code = 401
        elif detail_code == 0x0008 or detail_code == 0x0009 or detail_code == 0x000a:
            # not found.
            self.http_status_code = 404
        elif detail_code == 0x0003:
            # method not allowed.
            self.http_status_code = 405
        elif detail_code == 0x0004:
            # gateway timeout.
            self.http_status_code = 504
        else:
            # internal server error.
            self.http_status_code = 500