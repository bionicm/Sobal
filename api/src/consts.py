class _const:
    class ConstError(TypeError):
        # TODO:エラー処理
        pass

    def __setattr__(self, name, value):
        if name in self.__dict__:
            raise self.ConstError("")
        self.__dict__[name] = value

import sys
sys.modules[__name__] = _const()