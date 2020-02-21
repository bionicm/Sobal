class _const:
    class ConstError(TypeError):
        pass

    def __setattr__(self, name, value):
        if name in self.__dict__:
            raise self.ConstError(f"constant is already defined. name={name} value={value}")
        self.__dict__[name] = value

import sys
sys.modules[__name__] = _const()