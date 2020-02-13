import json

class ApplicationExcepiton(Exception):

    @staticmethod
    def create(error_code):
        app_exception = ApplicationExcepiton()
        app_exception.set_error_code(error_code)
        return app_exception

    def set_error_code(self, error_code):
        self.error_code = error_code
        self._identify_status_code()

    def _identify_status_code(self):
        detail_code = self.error_code & 0x00FF
        if detail_code == 0x0000:
            # bad request
            self.http_status_code = 400
        elif detail_code == 0x0001:
            # not found
            self.http_status_code = 404
        elif detail_code == 0x0002:
            # method not allowed.
            self.http_status_code = 405
        elif detail_code == 0x0003:
            # request timeout
            self.http_status_code = 408
        else:
            # internal server error
            self.http_status_code = 500