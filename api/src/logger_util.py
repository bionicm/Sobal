import logging

class LoggerUtil:
    __instance = None
    logger = logging.getLogger('logger')

    def __new__(cls):
        if cls.__instance is None:
            cls.__instance = super().__new__(cls)
        return cls.__instance

    def set_log_config(self, setting_file):
        logging.config.fileConfig(setting_file, disable_existing_loggers=False)

    def debug(self, message):
        self.logger.debug(message)

    def info(self, message):
        self.logger.info(message)

    def warn(self, message):
        self.logger.warn(message)
    
    def error(self, message):
        self.logger.error(message)